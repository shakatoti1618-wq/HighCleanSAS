import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import AdminLayout from './components/AdminLayout.tsx'
import Contacto from './pages/Contacto.tsx'
import Galeria from './pages/Galeria.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Nosotros from './pages/Nosotros.tsx'
import PoliticaDeDatos from './pages/PoliticaDeDatos.tsx'
import Servicios from './pages/Servicios.tsx'
import TrabajaConNosotros from './pages/TrabajaConNosotros.tsx'
import Empresa from './pages/admin/Empresa.tsx'
import GaleriaAdmin from './pages/admin/Galeria.tsx'
import Mensajes from './pages/admin/Mensajes.tsx'
import Postulaciones from './pages/admin/Postulaciones.tsx'
import Resenas from './pages/admin/Resenas.tsx'
import Resumen from './pages/admin/Resumen.tsx'
import ServiciosAdmin from './pages/admin/Servicios.tsx'
import Cuenta from './pages/admin/Cuenta.tsx'

const ResenasPublic = lazy(() => import('./pages/Resenas.tsx'))

function App() {
  return (
    <>
      <ScrollToTop />
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
              <ResenasPublic />
            </Suspense>
          }
        />
        <Route path="contacto" element={<Contacto />} />
        <Route path="trabaja-con-nosotros" element={<TrabajaConNosotros />} />
        <Route path="politica-de-datos" element={<PoliticaDeDatos />} />
      </Route>
      <Route
        path="admin"
        element={
          <ProtectedRoute>{(user) => <AdminLayout user={user} />}</ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/resumen" replace />} />
        <Route path="resumen" element={<Resumen />} />
        <Route path="empresa" element={<Empresa />} />
        <Route path="servicios" element={<ServiciosAdmin />} />
        <Route path="resenas" element={<Resenas />} />
        <Route path="mensajes" element={<Mensajes />} />
        <Route path="galeria" element={<GaleriaAdmin />} />
        <Route path="postulaciones" element={<Postulaciones />} />
        <Route path="cuenta" element={<Cuenta />} />
      </Route>
    </Routes>
    </>
  )
}

export default App