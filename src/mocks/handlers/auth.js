/**
 * @file handlers/auth.js
 * @description Mock handlers for authentication routes.
 */

import { makeAuthResponse, makeUser } from "../factories/factories.js";

// Simulate a registered user store
const _users = [
  makeUser({ email: "user@cyna.com", role: "user" }),
  makeUser({ email: "admin@cyna.com", role: "admin", is2faEnabled: true }),
];

/** @type {import("../registry.js").MockHandler[]} */
export const authHandlers = [
  // -------------------------------------------------------------------------
  // POST /auth/register
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/register",
    resolver: ({ body }) => {
      const existing = _users.find((u) => u.email === body.email);
      if (existing) throw new Error("Email already in use");

      const user = makeUser({ email: body.email, name: body.name, isConfirmed: false });
      _users.push(user);

      return { message: "Registration successful. Please confirm your email." };
    },
    status: 201,
  },

  // -------------------------------------------------------------------------
  // POST /auth/login
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/login",
    resolver: ({ body }) => {
      const user = _users.find((u) => u.email === body.email);

      // Accept any password in mock mode
      if (!user) throw new Error("Invalid credentials");
      if (!user.isConfirmed) throw new Error("Please confirm your email first");

      return makeAuthResponse({ ...user });
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/confirm
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/confirm",
    resolver: () => ({ message: "Email confirmed successfully" }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/forgot-password
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/forgot-password",
    resolver: () => ({ message: "Reset link sent if email exists" }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/reset-password
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/reset-password",
    resolver: () => ({ message: "Password reset successfully" }),
  },

  // -------------------------------------------------------------------------
  // GET /auth/me
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/auth/me",
    resolver: () => makeUser({ email: "user@cyna.com" }),
  },
];