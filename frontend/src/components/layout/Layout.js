import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import TrendingBanner from '../ui/TrendingBanner'
import SearchModal from '../ui/SearchModal'
import AuthModal from '../auth/AuthModal'
import WhatsAppButton from '../ui/WhatsAppButton'

import ScrollToTop from '../ui/ScrollToTop'
import { useSelector } from 'react-redux'

const Layout = () => {
  const { cartOpen, searchOpen, authModalOpen } = useSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-transparent text-gray-800">
      <TrendingBanner />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {cartOpen && <CartDrawer />}
      {searchOpen && <SearchModal />}
      {authModalOpen && <AuthModal />}
      <WhatsAppButton />

      <ScrollToTop />
    </div>
  )
}

export default Layout
