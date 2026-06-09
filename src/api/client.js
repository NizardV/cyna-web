/**
 * @file client.js
 * @description API client singleton with built-in mock interception layer.
 *
 * Usage:
 *   import { apiClient } from "./client";
 *
 *   // Utilise la valeur de VITE_MOCK_API
 *   const products = await apiClient.get("/products");
 *
 *   // Force le mock activé pour cet appel uniquement
 *   const products = await apiClient.get("/products", { mock: true });
 *
 *   // Force le mock désactivé pour cet appel uniquement (surcharge le .env)
 *   const products = await apiClient.get("/products", { mock: false });
 */

import { mockRegistry } from "../mocks/registry.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const MOCK_ENABLED = import.meta.env.VITE_MOCK_API === "true";
const MOCK_DELAY_MS = Number(import.meta.env.VITE_MOCK_DELAY ?? 400);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Simulate network latency for mock responses.
 * @param {number} ms
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Résout si le mock doit être utilisé pour cet appel.
 * - Si `mock` est un boolean → surcharge le .env
 * - Si `mock` est undefined → utilise VITE_MOCK_API
 *
 * @param {boolean | undefined} override
 * @returns {boolean}
 */
function resolveMock(override) {
  return override !== undefined ? override : MOCK_ENABLED;
}

/**
 * Build a full URL from a path, injecting path params.
 * e.g. buildUrl("/products/:id", { id: "abc" }) → "/products/abc"
 *
 * @param {string} path
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
function buildUrl(path, params = {}) {
  let resolved = path;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
  }
  return resolved;
}

/**
 * Match a concrete URL against a pattern that may contain :param segments.
 * Returns the extracted params or null if no match.
 *
 * @param {string} pattern  e.g. "/products/:id"
 * @param {string} url      e.g. "/products/abc-123"
 * @returns {Record<string, string> | null}
 */
function matchPattern(pattern, url) {
  const patternParts = pattern.split("/");
  const urlParts = url.split("/");

  if (patternParts.length !== urlParts.length) return null;

  const extracted = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      extracted[patternParts[i].slice(1)] = decodeURIComponent(urlParts[i]);
    } else if (patternParts[i] !== urlParts[i]) {
      return null;
    }
  }

  return extracted;
}

// ---------------------------------------------------------------------------
// Mock interceptor
// ---------------------------------------------------------------------------

/**
 * Try to find a registered mock handler for a given method + path.
 * Supports exact matches and :param patterns.
 *
 * @param {string} method   "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
 * @param {string} path     Resolved path e.g. "/products/abc-123"
 * @param {unknown} body    Request body (for POST/PUT)
 * @returns {Promise<{ data: unknown; status: number }> | null}
 */
async function interceptMock(method, path, body, queryParams = {}) {
  const handlers = mockRegistry.getHandlers()

  for (const handler of handlers) {
    if (handler.method.toUpperCase() !== method.toUpperCase()) continue

    const pathParams = matchPattern(handler.path, path)
    if (pathParams === null) continue

    await delay(MOCK_DELAY_MS)

    const result =
      typeof handler.resolver === "function"
        ? await handler.resolver({ params: { ...pathParams, ...queryParams }, body })
        : handler.resolver

    return { data: result, status: handler.status ?? 200 }
  }

  return null
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Internal fetch with auth header injection and error normalisation.
 *
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<unknown>}
 */
async function coreFetch(path, options = {}) {
  const token = localStorage.getItem("cyna_token");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new ApiError(error.message ?? "Request failed", response.status);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// Ajoutez cette fonction helper dans client.js
/**
 * Build query string from params object
 * @param {Record<string, string>} params
 * @returns {string}
 */
function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// ApiClient singleton
// ---------------------------------------------------------------------------

class ApiClient {
  /**
   * GET request.
   *
   * @param {string} path
   * @param {{ params?: Record<string, string>; mock?: boolean }} [options]
   * @returns {Promise<unknown>}
   */
    async get(path, { params, mock } = {}) {
      const resolved = buildUrl(path, params)
      const queryString = buildQueryString(params)

      if (resolveMock(mock)) {
        const intercepted = await interceptMock("GET", resolved, null, params ?? {})
        if (intercepted) return intercepted.data
      }

      return coreFetch(`${resolved}${queryString}`, { method: "GET" })
    }

  /**
   * POST request.
   *
   * @param {string} path
   * @param {unknown} body
   * @param {{ params?: Record<string, string>; mock?: boolean }} [options]
   * @returns {Promise<unknown>}
   */
  async post(path, body, { params, mock } = {}) {
    const resolved = buildUrl(path, params);

    if (resolveMock(mock)) {
      const intercepted = await interceptMock("POST", resolved, body);
      if (intercepted) return intercepted.data;
    }

    return coreFetch(resolved, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request.
   *
   * @param {string} path
   * @param {unknown} body
   * @param {{ params?: Record<string, string>; mock?: boolean }} [options]
   * @returns {Promise<unknown>}
   */
  async put(path, body, { params, mock } = {}) {
    const resolved = buildUrl(path, params);

    if (resolveMock(mock)) {
      const intercepted = await interceptMock("PUT", resolved, body);
      if (intercepted) return intercepted.data;
    }

    return coreFetch(resolved, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request.
   *
   * @param {string} path
   * @param {{ params?: Record<string, string>; mock?: boolean }} [options]
   * @returns {Promise<unknown>}
   */
  async delete(path, { params, mock } = {}) {
    const resolved = buildUrl(path, params);

    if (resolveMock(mock)) {
      const intercepted = await interceptMock("DELETE", resolved, null);
      if (intercepted) return intercepted.data;
    }

    return coreFetch(resolved, { method: "DELETE" });
  }

  /**
   * PATCH request.
   *
   * @param {string} path
   * @param {unknown} body
   * @param {{ params?: Record<string, string>; mock?: boolean }} [options]
   * @returns {Promise<unknown>}
   */
  async patch(path, body, { params, mock } = {}) {
    const resolved = buildUrl(path, params);

    if (resolveMock(mock)) {
      const intercepted = await interceptMock("PATCH", resolved, body);
      if (intercepted) return intercepted.data;
    }

    return coreFetch(resolved, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
}

// Export singleton
export const apiClient = new ApiClient();