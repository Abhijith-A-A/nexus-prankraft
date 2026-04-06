import { motion } from 'framer-motion';

export default function FooterSection() {
  return (
    <footer className="relative py-16 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product */}
          <div>
            <p className="text-[10px] text-white/25 tracking-[3px] uppercase mb-4">Product</p>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'].map((link) => (
                <li key={link}>
                  <button
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                    onClick={() => window.scrollTo({ top: Math.random() * 3000, behavior: 'smooth' })}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] text-white/25 tracking-[3px] uppercase mb-4">Company</p>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Press', 'Partners'].map((link) => (
                <li key={link}>
                  <button
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                    onClick={() => window.scrollTo({ top: Math.random() * 3000, behavior: 'smooth' })}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-[10px] text-white/25 tracking-[3px] uppercase mb-4">Resources</p>
            <ul className="space-y-2">
              {['Documentation', 'API Reference', 'Community', 'Status', 'Security'].map((link) => (
                <li key={link}>
                  <button
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                    onClick={() => window.scrollTo({ top: Math.random() * 3000, behavior: 'smooth' })}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] text-white/25 tracking-[3px] uppercase mb-4">Legal</p>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'DPA'].map((link) => (
                <li key={link}>
                  <button
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                    onClick={() => window.scrollTo({ top: Math.random() * 3000, behavior: 'smooth' })}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
          <p className="text-white/15 text-xs">
            © 2024 NEXUS™. All rights reserved. No rights were actually reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            {['𝕏', 'in', 'gh', 'yt'].map((icon) => (
              <button
                key={icon}
                className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-white/20 hover:text-white/50 hover:border-white/15 transition-all text-xs"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
