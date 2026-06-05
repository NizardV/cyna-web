/**
 * @file App.jsx
 * @description Routeur principal de l'application Cyna.
 */

import { OrderHistory } from "./pages/account/order-history"
import { Profile } from "./pages/account/profile"
import { LoginPage } from "./pages/login-page"
import { RegisterPage } from "./pages/register-page"
import { Cart } from "./pages/cart"
import { Checkout } from "./pages/checkout"
import { OrderConfirmation } from "./pages/order-confirmation"
import { Catalog } from "./pages/catalog"
import { Product } from "./pages/product"
import { Contact } from "./pages/contact"
import { CGU } from "./pages/cgu"
import { MentionsLegales } from "./pages/mentions-legales"
import { Privacy } from "./pages/privacy"

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/mock-demo" element={<MockDemo />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/account/profile" element={<Profile />} />
          <Route path="/account/orders" element={<OrderHistory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/products/:id" element={<Product />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App