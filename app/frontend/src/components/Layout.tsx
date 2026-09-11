import { Outlet } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import Background from './Background.tsx'
import Footer from './Footer.tsx'
import Navbar from './Navbar.tsx'

function Layout() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-brand-turq focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Background />
        <Navbar />
        <main id="main" className="relative z-10 flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}

export default Layout