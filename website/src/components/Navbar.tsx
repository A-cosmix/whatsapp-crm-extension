import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'AI', href: '#ai' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L8 4L12 12H4Z" stroke="url(#logo-g)" strokeWidth="1.5" fill="none" />
              <circle cx="8" cy="10" r="1" fill="url(#logo-g)" />
              <defs>
                <linearGradient id="logo-g" x1="4" y1="4" x2="12" y2="12">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#C084FC" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight">
            Momentum<span className="text-electric-bright">X</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-frost/50 hover:text-white transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="#pricing" className="text-sm text-frost/60 hover:text-white transition-colors px-4 py-2">
            Sign in
          </a>
          <a href="#cta" className="btn-primary text-xs px-5 py-2.5">
            Install Free
          </a>
        </div>

        <button
          className="md:hidden p-2 text-frost/60 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/5 mt-3"
          >
            <div className="px-5 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-frost/70 hover:text-white py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a href="#cta" className="btn-primary text-center mt-2" onClick={() => setMobileOpen(false)}>
                Install Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
