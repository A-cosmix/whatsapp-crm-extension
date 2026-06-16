import { Github, Twitter } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Documentation', 'API', 'Community', 'Support'],
  Legal: ['Privacy', 'Terms', 'Security'],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg gradient-border flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L8 4L12 12H4Z" stroke="url(#footer-g)" strokeWidth="1.5" fill="none" />
                  <defs>
                    <linearGradient id="footer-g" x1="4" y1="4" x2="12" y2="12">
                      <stop stopColor="#60A5FA" />
                      <stop offset="1" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">
                Momentum<span className="text-electric-bright">X</span>
              </span>
            </a>
            <p className="text-xs text-frost/30 leading-relaxed mb-4">
              The world&apos;s smartest productivity extension. Reimagine your browser.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-frost/40 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-frost/40 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={14} />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-frost/50 uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-frost/30 hover:text-frost/60 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-frost/20">
            &copy; {new Date().getFullYear()} Momentum X Inc. All rights reserved.
          </p>
          <p className="text-[10px] text-frost/20">
            Made with precision in San Francisco
          </p>
        </div>
      </div>
    </footer>
  );
}
