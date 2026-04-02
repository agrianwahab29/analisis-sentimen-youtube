# Decisions — topup-transaction-bugfix

## 2026-04-02

- Fix RPC: CREATE new `add_credits_to_user` function in DB (not modify code)
- New function: NO auth.uid() check, NO transaction record creation, SECURITY DEFINER only
- WhatsApp number: From user input form
- Admin auth: Cookie-based client for auth, service role for DB ops
- Testing: Setup Vitest + write tests for all bug fixes
- Do NOT delete existing `admin_add_credits` function
