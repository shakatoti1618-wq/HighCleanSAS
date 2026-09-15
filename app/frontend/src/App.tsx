import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import Admin from './pages/Admin.tsx'
import Contacto from './pages/Contacto.tsx'
import Galeria from './pages/Galeria.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Nosotros from './pages/Nosotros.tsx'
import Servicios from './pages/Servicios.tsx'

const Resenas = lazy(() => import('./pages/Resenas.tsx'))

function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route
          path="resenas"
          element={
            <Suspense fallback={null}>
              <Resenas />
            </Suspense>
          }
        />
        <Route path="contacto" element={<Contacto />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>{(user) => <Admin user={user} />}</ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App