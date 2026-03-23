import Link from 'next/link';
import { Sparkles, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, ChevronRight, Phone } from 'lucide-react';

const GOLD = '#b8976a';

export default function Footer() {
  return (
    <footer style={{ background: '#040404', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>

      {/* Subtle top glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD}88, transparent)` }} />

      <div style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand - Span 4 */}
          <div className="lg:col-span-4">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <Sparkles style={{ width: '22px', height: '22px', color: GOLD }} />
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.8rem',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.04em'
              }}>
                Aspar
              </span>
            </Link>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.75rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '2rem',
              maxWidth: '320px'
            }}>
              Your premier destination for luxury electronics and state-of-the-art home appliances. Engineered for excellence, curated for you.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="group"
                  style={{
                    width: '38px', height: '38px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)', transition: 'color 0.3s' }} className="group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop - Span 2 */}
          <div className="lg:col-span-2">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'white', letterSpacing: '0.02em', marginBottom: '1.5rem' }}>Boutique</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Smartphones', href: '/category/smartphones' },
                { label: 'Laptops', href: '/category/laptops' },
                { label: 'Headphones', href: '/category/headphones' },
                { label: 'Smart TVs', href: '/category/smart-tvs' },
                { label: 'Cameras', href: '/category/cameras' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronRight style={{ width: '12px', height: '12px', color: GOLD, opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.3s' }} className="group-hover:opacity-100 group-hover:translate-x-0" />
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }} className="group-hover:text-white">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account - Span 2 */}
          <div className="lg:col-span-2">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'white', letterSpacing: '0.02em', marginBottom: '1.5rem' }}>Concierge</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'My Account', href: '/profile' },
                { label: 'Order History', href: '/orders' },
                { label: 'Wishlist', href: '/wishlist' },
                { label: 'Client Support', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronRight style={{ width: '12px', height: '12px', color: GOLD, opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.3s' }} className="group-hover:opacity-100 group-hover:translate-x-0" />
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }} className="group-hover:text-white">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Span 4 */}
          <div className="lg:col-span-4">
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'white', letterSpacing: '0.02em', marginBottom: '1.5rem' }}>Headquarters</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin style={{ width: '14px', height: '14px', color: GOLD }} />
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>
                  123 High-Tech Avenue<br />Silicon Valley, CA 94025
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone style={{ width: '14px', height: '14px', color: GOLD }} />
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                  +1 (800) 555-NEST
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail style={{ width: '14px', height: '14px', color: GOLD }} />
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                  concierge@Aspar.com
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '1.5rem clamp(1.5rem, 4vw, 4rem)', background: '#020202' }}>
        <div style={{ display: 'flex', flexDirection: 'column', sm: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }} className="sm:flex-row">
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} Aspar. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((text) => (
              <a key={text} href="#" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.3s' }} className="hover:text-white">
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
