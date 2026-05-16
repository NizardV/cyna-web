/**
 * @file registry.js
 * @description Singleton registry that stores all mock route handlers.
 *
 * Handlers are registered by each domain mock file (products, auth, orders…).
 * The API client queries this registry on every request when mock mode is on.
 *
 * Usage:
 *   import { mockRegistry } from "./registry";
 *
 *   mockRegistry.register({
 *     method: "GET",
 *     path: "/products",
 *     resolver: () => [{ id: "1", name: "Cyna EDR" }],
 *   });
 */

// ---------------------------------------------------------------------------
// Types (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} MockHandler
 * @property {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} method  - HTTP method
 * @property {string}   path      - Route pattern, supports :param segments
 * @property {Function|unknown} resolver
 *   - If function: called with ({ params, body }) → returns mock data
 *   - If value: returned directly
 * @property {number}  [status]   - HTTP status code (default 200)
 */

// ---------------------------------------------------------------------------
// MockRegistry
// ---------------------------------------------------------------------------

class MockRegistry {
  constructor() {
    /** @type {MockHandler[]} */
    this._handlers = [];
  }

  /**
   * Register a single mock handler.
   *
   * @param {MockHandler} handler
   * @returns {this} Chainable
   *
   * @example
   * mockRegistry.register({
   *   method: "GET",
   *   path: "/products/:id",
   *   resolver: ({ params }) => generateProduct({ id: params.id }),
   * });
   */
  register(handler) {
    this._handlers.push(handler);
    return this;
  }

  /**
   * Register multiple mock handlers at once.
   *
   * @param {MockHandler[]} handlers
   * @returns {this} Chainable
   *
   * @example
   * mockRegistry.registerMany(productHandlers);
   */
  registerMany(handlers) {
    handlers.forEach((h) => this.register(h));
    return this;
  }

  /**
   * Return all registered handlers.
   * @returns {MockHandler[]}
   */
  getHandlers() {
    return this._handlers;
  }

  /**
   * Clear all registered handlers (useful in tests).
   * @returns {this}
   */
  clear() {
    this._handlers = [];
    return this;
  }

  /**
   * List all registered routes (useful for debugging).
   * @returns {string[]}
   */
  listRoutes() {
    return this._handlers.map((h) => `${h.method.padEnd(7)} ${h.path}`);
  }
}

// Export singleton
export const mockRegistry = new MockRegistry();