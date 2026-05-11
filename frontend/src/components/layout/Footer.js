import React from 'react'
import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h3 className="font-display text-3xl font-bold text-gradient-gold mb-2">Stay in Style</h3>
          <p className="text-gray-500 mb-6">Subscribe for exclusive offers, new arrivals & festival collections</p>
          <div className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="input-luxury flex-1"
            />
            <button className="btn-primary whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">KE</span>
              </div>
              <span className="font-display text-xl font-bold text-gradient-gold">Kurti Elegance</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Premium kurtis crafted with love — Anarkali, Printed, Embroidered & more. Celebrating the beauty of Indian fashion with a modern touch.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-600 hover:border-yellow-300 transition-all shadow-sm"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'All Products', to: '/products' },
                { label: 'New Arrivals', to: '/products?isNewArrival=true' },
                { label: 'Trending', to: '/products?isTrending=true' },
                { label: 'Sale', to: '/products?sort=discount' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-500 hover:text-yellow-600 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Kurti Collections</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Anarkali Kurtis', to: '/category/anarkali-kurtis' },
                { label: 'Printed Kurtis', to: '/category/printed-kurtis' },
                { label: 'Embroidered Kurtis', to: '/category/embroidered-kurtis' },
                { label: 'Party Wear Kurtis', to: '/category/party-wear-kurtis' },
                { label: "Girls' Kurtis", to: '/category/girls-kurtis' },
                { label: 'Festival Kurtis', to: '/category/festival-kurtis' },
              ].map((cat) => (
                <li key={cat.label}>
                  <Link to={cat.to} className="text-gray-500 hover:text-yellow-600 text-sm transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <FiMapPin className="mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>123 Fashion Street, Chennai, Tamil Nadu 600001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <FiPhone className="text-yellow-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-yellow-600 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <FiMail className="text-yellow-500 flex-shrink-0" />
                <a href="mailto:hello@ethnicelegance.com" className="hover:text-yellow-600 transition-colors">hello@ethnicelegance.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-2">We Accept</p>
              <div className="flex gap-2">
                {['UPI', 'Visa', 'MC', 'RuPay'].map((method) => (
                  <span key={method} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 font-medium shadow-sm">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">© 2026 Ethnic Elegance. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
