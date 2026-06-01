/**
 * @file App.jsx
 * @description Routeur principal de l'application Cyna.
 */

import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NotFound from "./pages/specials/not-found"
import { Home } from "./pages/home"
import { Unauthorized } from "./pages/specials/unauthorized"
import Loading from "./pages/specials/loading"
import { MockDemo } from "./pages/mock-demo"
import { OrderHistory } from "./pages/account/order-history"
import { Profile } from "./pages/account/profile"
import { Catalog } from "./pages/catalog"

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/mock-demo" element={<MockDemo />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/account/profile" element={<Profile />} />
          <Route path="/account/orders" element={<OrderHistory />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App