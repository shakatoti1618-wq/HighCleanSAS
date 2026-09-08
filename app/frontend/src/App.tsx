import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Contacto from './pages/Contacto.tsx'
import Home from './pages/Home.tsx'
import Nosotros from './pages/Nosotros.tsx'
import Servicios from './pages/Servicios.tsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="contacto" element={<Contacto />} />
      </Route>
    </Routes>
  )
}

export default App