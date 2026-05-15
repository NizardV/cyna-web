import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NotFound from './pages/specials/not-found';
import { Home } from './pages/home';
import { Unauthorized } from './pages/specials/unauthorized';
import Loading from './pages/specials/loading';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
