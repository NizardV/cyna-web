/**
 * @file App.jsx
 * @description Routeur principal de l'application Cyna.
 */

import { Home } from "./pages/home"
import { AdminProducts } from "./pages/admin/product/products.jsx"
import { AdminProductForm } from "./pages/admin/product/product-form.jsx"
import { OrderHistory } from "./pages/account/order-history"
import { Profile } from "./pages/account/profile"
import { Login } from "./pages/login"
import { Register } from "./pages/register"
import { Cart } from "./pages/cart"
import { Checkout } from "./pages/checkout"
import { OrderConfirmation } from "./pages/order-confirmation"
import { Search } from "./pages/search"
import { Catalog } from "./pages/catalog"
import { Product } from "./pages/product"
import { Contact } from "./pages/contact"
import { CGU } from "./pages/cgu"
import { MentionsLegales } from "./pages/mentions-legales"
import { Privacy } from "./pages/privacy"
import { AdminCategories } from "./pages/admin/categories"
import { Unauthorized } from "./pages/specials/unauthorized"
import NotFound from "./pages/specials/not-found"
import Loading from "./pages/specials/loading"
import { ForgotPassword } from "@/pages/auth/forgot-password"
import { ResetPassword }  from "@/pages/auth/reset-password"
import { ConfirmEmail }   from "@/pages/auth/confirm-email"
import { AdminLogin }     from "@/pages/auth/admin-login"
import { Security2FA }    from "@/pages/account/security-2fa"
import { AdminUsers }     from "@/pages/admin/users"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Suspense } from "react"
import { Downloads } from "./pages/downloads"
import { UserRoute, AdminRoute, AuthRoute, UserAuthRoute } from "./wrapper"
import AdminDashboard from "./pages/admin/dashboard.jsx"

/**
 * Composant racine du routeur.
 * Définit l'arbre de routes de l'application, protégées par `UserRoute` et `AdminRoute`.
 * Les routes sont enveloppées dans `Suspense` pour afficher une page de chargement
 * pendant le chargement paresseux des modules.
 */
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/unauthorized"      element={<Unauthorized />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/cgu"               element={<CGU />} />
          <Route path="/mentions-legales"  element={<MentionsLegales />} />
          <Route path="/privacy"           element={<Privacy />} />
          <Route path="/downloads"         element={<Downloads />} />
          <Route path="/loading"           element={<Loading />} />
          <Route path="/contact"           element={<Contact />} />

          {/* ── Routes utilisateur (non-admin) ── */}
          <Route element={<UserRoute />}>
            {/* ── Routes publiques ── */}
            <Route path="/"                  element={<Home />} />
            <Route path="/search"            element={<Search />} />
            <Route path="/catalog/category/:slug" element={<Catalog />} />
            <Route path="/products/:id"      element={<Product />} />
            <Route path="/cart"            element={<Cart />} />
            <Route path="/checkout"        element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
          </Route>

          {/* ── Backoffice admin ── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"         element={<AdminDashboard />} />
            <Route path="/admin/categories"        element={<AdminCategories />} />
            <Route path="/admin/products"          element={<AdminProducts />} />
            <Route path="/admin/products/new"      element={<AdminProductForm />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* ── Routes protégées par authentification ── */}
          <Route element={<AuthRoute />}>
            <Route path="/account/profile" element={<Profile />} />
            <Route path="/account/security/2fa" element={<Security2FA />} />
          </Route>

          {/* ── Routes protégées par authentification utilisateur ── */}
          <Route element={<UserAuthRoute />}>
            <Route path="/account/orders" element={<OrderHistory />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App