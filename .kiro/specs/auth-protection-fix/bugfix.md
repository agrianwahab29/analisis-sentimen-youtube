# Bugfix Requirements Document

## Introduction

Aplikasi VidSense AI memiliki dua bug keamanan dan fungsionalitas terkait autentikasi:

1. Rute dashboard (`/dashboard/*`) dapat diakses tanpa login karena middleware hanya memeriksa keberadaan cookie auth tanpa memvalidasi sesi secara server-side melalui Supabase.
2. Tombol logout ("Keluar") di navigasi pengguna dan sidebar tidak berfungsi karena tidak terhubung ke fungsi `signOut()`.

Kedua bug ini berdampak pada keamanan aplikasi (akses tanpa otorisasi) dan pengalaman pengguna (tidak bisa keluar dari akun).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user navigates to `/dashboard/main` or any `/dashboard/*` route without a valid Supabase session but with a stale or forged `auth-token` cookie present THEN the system allows access to the protected dashboard page instead of redirecting to `/auth/login`

1.2 WHEN a user clicks the "Keluar" (logout) button in the `UserNav` dropdown component THEN the system does nothing because the button has no `onClick` handler connected to `signOut()`

1.3 WHEN a user clicks the user section button at the bottom of the `Sidebar` component THEN the system does nothing because the button has no `onClick` handler connected to `signOut()`

1.4 WHEN the `signOut()` function in the `useAuth` hook completes successfully THEN the system does not redirect the user to `/auth/login`, leaving them on the current page with a stale UI

### Expected Behavior (Correct)

2.1 WHEN a user navigates to `/dashboard/main` or any `/dashboard/*` route without a valid Supabase session THEN the system SHALL validate the session server-side and redirect the user to `/auth/login?redirect={originalPath}`

2.2 WHEN a user clicks the "Keluar" (logout) button in the `UserNav` dropdown component THEN the system SHALL call `signOut()` from the `useAuth` hook to terminate the session

2.3 WHEN a user clicks the user section button at the bottom of the `Sidebar` component THEN the system SHALL call `signOut()` from the `useAuth` hook to terminate the session

2.4 WHEN the `signOut()` function in the `useAuth` hook completes successfully THEN the system SHALL redirect the user to `/auth/login`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to `/dashboard/*` routes with a valid authenticated Supabase session THEN the system SHALL CONTINUE TO allow access to the dashboard pages without redirection

3.2 WHEN a user navigates to non-protected routes (e.g., `/`, `/auth/login`, `/auth/register`) THEN the system SHALL CONTINUE TO allow access regardless of authentication status

3.3 WHEN a user signs in via email/password or Google OAuth THEN the system SHALL CONTINUE TO redirect to the dashboard after successful authentication

3.4 WHEN a user is on the login page and is already authenticated THEN the system SHALL CONTINUE TO redirect to the dashboard automatically
