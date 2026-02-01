'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { FaTiktok } from "react-icons/fa";
import { FaXTwitter, FaInstagram } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer id="footer" className="w-full bg-card border-t border-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold font-display text-accent mb-4">WalkEnd</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Join our thriving running community. Experience the passion, energy, and camaraderie of running together.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <FaTiktok size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <FaXTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-accent transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/event-calendar" className="text-gray-400 hover:text-accent transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="/gallery" className="text-gray-400 hover:text-accent transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="/merchandise" className="text-gray-400 hover:text-accent transition-colors">
                  Merchandise
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/training-tips" className="text-gray-400 hover:text-accent transition-colors">
                  Training Tips
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-accent transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-semibold text-sm uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail size={16} className="text-accent shrink-0" />
                <a href="mailto:walkendweekend@gmail.com" className="hover:text-accent transition-colors">
                  walkendweekend@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone size={16} className="text-accent shrink-0" />
                <a href="tel:+233501234567" className="hover:text-accent transition-colors">
                  +233501234567
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                <span>To The Road<br />And Beyond</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; 2026 WalkEnd WeekEnd. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="/legal/terms" className="hover:text-accent transition-colors">
              Terms of Service
            </a>
            <a href="/legal/cookies" className="hover:text-accent transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <div className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">Powered by WalkEnd</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs uppercase tracking-widest text-accent hover:text-accent/80 transition-colors font-semibold"
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
