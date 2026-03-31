# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Dashboard Access Without Valid Session & Logout Not Functional
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Scope the property to concrete failing cases:
    - Bug 1: Request to `/dashboard/main` with a stale/forged `auth-token` cookie but no valid Supabase session — middleware allows access instead of redirecting
    - Bug 2: Render `UserNav` and `Sidebar`, click "Keluar" / user section button — `signOut()` is never called
    - Bug 2b: Call `signOut()` directly — no redirect to `/auth/login` occurs
  - Test that middleware rejects requests with invalid sessions by asserting redirect to `/auth/login?redirect={path}` (from Bug Condition in design: `isBugCondition(input)` where `input.type == "navigation" AND NOT input.hasValidSession AND cookieExists("auth-token")`)
  - Test that logout buttons call `signOut()` and that `signOut()` redirects to `/auth/login` (from Bug Condition: `input.type == "logout" AND input.component IN ["UserNav", "Sidebar"]`)
  - Run test on UNFIXED code - expect FAILURE (this confirms the bug exists)
  - Document counterexamples found:
    - "Request to `/dashboard/main` with forged cookie returns 200 instead of 307 redirect"
    - "Click on 'Keluar' button does not trigger signOut()"
    - "signOut() completes but window.location remains unchanged"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Valid Session Access & Public Route Access Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (cases where `isBugCondition` returns false):
    - Observe: Request to `/dashboard/main` with valid Supabase session → allowed (200/next)
    - Observe: Request to `/` without any auth → allowed (200/next)
    - Observe: Request to `/auth/login` without any auth → allowed (200/next)
    - Observe: Request to `/auth/register` without any auth → allowed (200/next)
    - Observe: Request to `/dashboard/main` without any cookie → redirect to `/auth/login`
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all requests to `/dashboard/*` with a valid Supabase session, middleware returns `NextResponse.next()` (no redirect)
    - For all requests to non-protected routes (`/`, `/auth/*`), middleware returns `NextResponse.next()` regardless of auth state
    - For all requests to `/dashboard/*` with no auth cookie at all, middleware redirects to `/auth/login` (this already works correctly)
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for auth protection and logout functionality

  - [x] 3.1 Install `@supabase/ssr` package
    - Run `npm install @supabase/ssr`
    - Verify package is added to `package.json` dependencies
    - _Requirements: 2.1_

  - [x] 3.2 Create `lib/supabase/server.ts` - server-side Supabase client
    - Create new file `lib/supabase/server.ts`
    - Use `createServerClient` from `@supabase/ssr` to create a Supabase client that reads/writes cookies from `NextRequest`/`NextResponse`
    - Export a function that accepts `NextRequest` and `NextResponse` and returns a configured Supabase client with cookie handling via `cookies.getAll()` and `cookies.set()`
    - _Bug_Condition: isBugCondition(input) where input.type == "navigation" AND NOT input.hasValidSession_
    - _Expected_Behavior: Server-side client enables `supabase.auth.getUser()` validation in middleware_
    - _Requirements: 2.1_

  - [x] 3.3 Update `middleware.ts` - replace cookie check with server-side session validation
    - Remove the cookie-only check logic (`allCookies.some(cookie => cookie.name.includes("auth-token"))`)
    - Create `NextResponse.next()` with forwarded request headers
    - Create server-side Supabase client using function from `lib/supabase/server.ts`
    - Call `supabase.auth.getUser()` to validate session server-side
    - If `error` or no `user`, redirect to `/auth/login?redirect={pathname}`
    - If valid, return the response (with updated cookies from Supabase client)
    - _Bug_Condition: isBugCondition(input) where input.type == "navigation" AND NOT input.hasValidSession AND cookieExists("auth-token")_
    - _Expected_Behavior: middleware validates session via getUser() and redirects invalid sessions_
    - _Preservation: Valid sessions continue to access dashboard; public routes unaffected_
    - _Requirements: 1.1, 2.1, 3.1, 3.2_

  - [x] 3.4 Update `hooks/use-auth.tsx` - add redirect after signOut
    - In the `signOut` function, after `await supabase.auth.signOut()`, add `window.location.href = "/auth/login"` for full page reload
    - Use `window.location.href` instead of `router.push` so middleware re-evaluates auth state
    - _Bug_Condition: isBugCondition(input) where input.type == "logout" AND signOut completes_
    - _Expected_Behavior: signOut() clears session AND redirects to /auth/login_
    - _Preservation: signIn and signUp flows remain unchanged_
    - _Requirements: 1.4, 2.4_

  - [x] 3.5 Update `components/layout/user-nav.tsx` - connect "Keluar" button to signOut
    - Import `useAuth` hook from `@/hooks/use-auth`
    - Destructure `signOut` from `useAuth()`
    - Add `onClick={() => signOut()}` to the "Keluar" button
    - _Bug_Condition: isBugCondition(input) where input.component == "UserNav" AND userClicksLogoutButton()_
    - _Expected_Behavior: Click "Keluar" → signOut() called → session cleared → redirect to /auth/login_
    - _Requirements: 1.2, 2.2_

  - [x] 3.6 Update `components/layout/sidebar.tsx` - connect user section button to signOut
    - Import `useAuth` hook from `@/hooks/use-auth`
    - Destructure `signOut` from `useAuth()`
    - Add `onClick={() => signOut()}` to the button in the user section at the bottom of the sidebar
    - _Bug_Condition: isBugCondition(input) where input.component == "Sidebar" AND userClicksLogoutButton()_
    - _Expected_Behavior: Click user section → signOut() called → session cleared → redirect to /auth/login_
    - _Requirements: 1.3, 2.3_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Dashboard Access Without Valid Session & Logout Not Functional
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - Middleware redirects requests with invalid/forged sessions
      - Logout buttons trigger `signOut()`
      - `signOut()` redirects to `/auth/login`
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Valid Session Access & Public Route Access Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
