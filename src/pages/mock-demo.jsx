import { useEffect, useState } from "react"
import { getProducts } from "../api/products.js"
import { apiClient } from "../api/client.js"

function StatusBadge({ status }) {
  const colors = {
    idle: { bg: "#F1EFE8", text: "#5F5E5A", label: "idle" },
    loading: { bg: "#E6F1FB", text: "#185FA5", label: "loading…" },
    success: { bg: "#EAF3DE", text: "#3B6D11", label: "success" },
    error: { bg: "#FCEBEB", text: "#A32D2D", label: "error" },
  }
  const c = colors[status] ?? colors.idle
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: 4, letterSpacing: "0.03em",
      textTransform: "uppercase",
    }}>
      {c.label}
    </span>
  )
}

function Section({ title, endpoint, method, status, children }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12,
      padding: "1rem 1.25rem",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <code style={{
          fontSize: 11, background: "var(--color-background-secondary)",
          padding: "2px 7px", borderRadius: 4,
          color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)",
        }}>
          {method}
        </code>
        <code style={{
          fontSize: 12, color: "var(--color-text-primary)",
          fontFamily: "var(--font-mono)", flex: 1,
        }}>
          {endpoint}
        </code>
        <StatusBadge status={status} />
      </div>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px", fontWeight: 500 }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <div style={{
      background: "var(--color-background-secondary)",
      borderRadius: 8, padding: "10px 12px",
      border: "0.5px solid var(--color-border-tertiary)",
    }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
        {product.name}
      </p>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--color-text-secondary)" }}>
        {product.technicalSpecs?.platforms?.join(", ")}
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
          €{product.priceMonthly?.toFixed(2)}/mo
        </span>
        <span style={{
          fontSize: 11, background: product.isAvailable ? "#EAF3DE" : "#FCEBEB",
          color: product.isAvailable ? "#3B6D11" : "#A32D2D",
          padding: "1px 6px", borderRadius: 4,
        }}>
          {product.isAvailable ? "available" : "unavailable"}
        </span>
      </div>
    </div>
  )
}

export function MockDemo() {
  const [products, setProducts] = useState([])
  const [productsStatus, setProductsStatus] = useState("idle")

  const [loginStatus, setLoginStatus] = useState("idle")
  const [loginResult, setLoginResult] = useState(null)

  const [cartStatus, setCartStatus] = useState("idle")
  const [cartItems, setCartItems] = useState([])

  const [categories, setCategories] = useState([])
  const [catStatus, setCatStatus] = useState("idle")

  const fetchProducts = async () => {
    setProductsStatus("loading")
    setProducts([])
    try {
      const data = await getProducts()
      setProducts(data)
      setProductsStatus("success")
    } catch {
      setProductsStatus("error")
    }
  }

  const doLogin = async () => {
    setLoginStatus("loading")
    setLoginResult(null)
    try {
      const data = await apiClient.post("/auth/login", {
        email: "user@cyna.com",
        password: "any-password",
      })
      setLoginResult(data)
      setLoginStatus("success")
    } catch (e) {
      setLoginResult({ error: e.message })
      setLoginStatus("error")
    }
  }

  const addToCart = async () => {
    setCartStatus("loading")
    try {
      const prods = await getProducts()
      const first = prods[0]
      const item = await apiClient.post("/cart", {
        productId: first.id,
        unitPrice: first.priceMonthly,
        duration: "monthly",
        quantity: 1,
      })
      setCartItems((c) => [...c, item])
      setCartStatus("success")
    } catch {
      setCartStatus("error")
    }
  }

  const fetchCategories = async () => {
    setCatStatus("loading")
    try {
      const data = await apiClient.get("/categories")
      setCategories(data)
      setCatStatus("success")
    } catch {
      setCatStatus("error")
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "var(--font-sans, system-ui)" }}>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#E6F1FB", color: "#185FA5",
          fontSize: 11, fontWeight: 500, padding: "3px 10px",
          borderRadius: 4, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          mock mode active
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)" }}>
          API mock demo
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
          All calls are intercepted by the mock registry — no backend needed.
          Set <code style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>VITE_MOCK_API=true</code> in <code style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>.env.local</code>.
        </p>
      </div>

      <Section title="Fetch all products" endpoint="/products" method="GET" status={productsStatus}>
        <button onClick={fetchProducts} style={{ marginBottom: 12, cursor: "pointer" }}>
          ↺ Refetch
        </button>
        {productsStatus === "loading" && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Fetching…</p>
        )}
        {productsStatus === "success" && (
          <>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
              {products.length} products returned
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {products.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </Section>

      <Section title="Login (user@cyna.com)" endpoint="/auth/login" method="POST" status={loginStatus}>
        <button onClick={doLogin} style={{ cursor: "pointer" }}>
          {loginStatus === "loading" ? "Logging in…" : "POST login →"}
        </button>
        {loginResult && (
          <pre style={{
            marginTop: 12, fontSize: 11, background: "var(--color-background-secondary)",
            borderRadius: 6, padding: "10px 12px", overflow: "auto",
            color: "var(--color-text-primary)", fontFamily: "var(--font-mono)",
            maxHeight: 160, border: "0.5px solid var(--color-border-tertiary)",
          }}>
            {JSON.stringify({
              token: loginResult.token?.slice(0, 32) + "…",
              user: { email: loginResult.user?.email, role: loginResult.user?.role },
            }, null, 2)}
          </pre>
        )}
      </Section>

      <Section title="Add first product to cart" endpoint="/cart" method="POST" status={cartStatus}>
        <button onClick={addToCart} style={{ cursor: "pointer" }}>
          + Add to cart
        </button>
        {cartItems.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
              {cartItems.length} item(s) in cart this session
            </p>
            {cartItems.map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 13, padding: "6px 0",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}>
                <span style={{ color: "var(--color-text-primary)" }}>{item.productName}</span>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {item.duration} · €{item.unitPrice?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Fetch categories" endpoint="/categories" method="GET" status={catStatus}>
        <button onClick={fetchCategories} style={{ cursor: "pointer" }}>
          ↺ Refetch
        </button>
        {catStatus === "success" && categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {categories.map((c) => (
              <span key={c.id} style={{
                fontSize: 12, background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 6, padding: "4px 10px",
                color: "var(--color-text-primary)",
              }}>
                {c.name}
              </span>
            ))}
          </div>
        )}
      </Section>

    </div>
  )
}