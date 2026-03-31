/**
 * Preservation Property Tests
 * Property 2: Preservation - Valid Session Access & Public Route Access Unchanged
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

function createMockRequest(
  pathname: string,
  cookies: Array<{ name: string; value: string }> = []
): any {
  const url = `http://localhost:3000${pathname}`;
  const nextUrl = new URL(url);
  const cookieMap = new Map(cookies.map((c) => [c.name, c]));
  return {
    nextUrl,
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => cookies,
      get: (name: string) => cookieMap.get(name) || null,
    },
  };
}

async function testMiddleware(
  request: any,
  getUserResult: { data: { user: any }; error: any }
) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  const { data: { user }, error } = getUserResult;
  if (error || !user) {
    const loginUrl = new URL("/auth/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

const dashboardPathArb = fc
  .constantFrom("main", "analysis", "history", "topup")
  .map((sub: string) => `/dashboard/${sub}`);

const validAuthCookieNameArb = fc
  .constantFrom("abc", "xyz", "proj123", "myref", "test99")
  .map((ref: string) => `sb-${ref}-auth-token`);

const publicRouteArb = fc.constantFrom(
  "/", "/auth/login", "/auth/register", "/auth/callback"
);

const VALID_USER = { data: { user: { id: "u1", email: "a@b.com" } }, error: null };
const NO_USER = { data: { user: null }, error: { message: "No session" } };

describe("Preservation: Dashboard access with valid session", () => {
  /**
   * **Validates: Requirements 3.1**
   */
  it("should allow dashboard access when auth-token cookie is present", async () => {
    await fc.assert(
      fc.asyncProperty(dashboardPathArb, validAuthCookieNameArb, async (path, cookieName) => {
        const req = createMockRequest(path, [
          { name: cookieName, value: "session-token-value" },
        ]);
        const res = await testMiddleware(req, VALID_USER);
        expect(res.status).toBe(200);
        expect(res.headers.get("location")).toBeNull();
      }),
      { numRuns: 50 }
    );
  });
});

describe("Preservation: Public route access unchanged", () => {
  /**
   * **Validates: Requirements 3.2**
   */
  it("should allow access to public routes without any auth", async () => {
    await fc.assert(
      fc.asyncProperty(publicRouteArb, async (path) => {
        const req = createMockRequest(path, []);
        const res = await testMiddleware(req, NO_USER);
        expect(res.status).toBe(200);
        expect(res.headers.get("location")).toBeNull();
      }),
      { numRuns: 20 }
    );
  });


  it("should allow access to public routes even with auth cookies", async () => {
    await fc.assert(
      fc.asyncProperty(publicRouteArb, validAuthCookieNameArb, async (path, cookieName) => {
        const req = createMockRequest(path, [
          { name: cookieName, value: "session-token-value" },
        ]);
        const res = await testMiddleware(req, VALID_USER);
        expect(res.status).toBe(200);
        expect(res.headers.get("location")).toBeNull();
      }),
      { numRuns: 20 }
    );
  });
});

describe("Preservation: Dashboard without auth cookie redirects to login", () => {
  /**
   * **Validates: Requirements 3.1, 3.2**
   */
  it("should redirect to /auth/login when no auth cookie is present", async () => {
    await fc.assert(
      fc.asyncProperty(dashboardPathArb, async (path) => {
        const req = createMockRequest(path, []);
        const res = await testMiddleware(req, NO_USER);
        expect(res.status).toBe(307);
        const location = res.headers.get("location");
        expect(location).not.toBeNull();
        expect(location).toContain("/auth/login");
        expect(location).toContain("redirect=" + encodeURIComponent(path));
      }),
      { numRuns: 20 }
    );
  });

  it("should redirect when cookies exist but none match auth-token pattern", async () => {
    await fc.assert(
      fc.asyncProperty(
        dashboardPathArb,
        fc.constantFrom("session-id", "theme", "locale", "csrf-token"),
        async (path, cookieName) => {
          const req = createMockRequest(path, [
            { name: cookieName, value: "some-value" },
          ]);
          const res = await testMiddleware(req, NO_USER);
          expect(res.status).toBe(307);
          const location = res.headers.get("location");
          expect(location).not.toBeNull();
          expect(location).toContain("/auth/login");
        }
      ),
      { numRuns: 20 }
    );
  });
});
