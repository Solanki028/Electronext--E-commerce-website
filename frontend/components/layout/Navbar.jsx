'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, Settings, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { selectCurrentUser, selectIsAuthenticated, selectIsAdmin } from '@/store/slices/authSlice';
import { selectCartItemCount } from '@/store/slices/cartSlice';
import { selectWishlist } from '@/store/slices/wishlistSlice';
import useAuth from '@/hooks/useAuth';
import useCart from '@/hooks/useCart';
import useDebounce from '@/hooks/useDebounce';

const GOLD = '#b8976a';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const itemCount = useSelector(selectCartItemCount);
  const wishlist = useSelector(selectWishlist);
  const { logout } = useAuth();
  const { openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  }, [debouncedSearch, router]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Hide navbar in admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          background: scrolled ? 'rgba(8, 8, 8, 0.95)' : 'rgba(8, 8, 8, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div style={{ padding: '0 clamp(1.5rem, 4vw, 4rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', gap: '1rem' }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Sparkles style={{ width: '22px', height: '22px', color: GOLD }} />
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.65rem',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.04em'
              }}>
                Aspar
              </span>
            </Link>

            {/* Search bar - desktop */}
            <div style={{ flex: 1, maxWidth: '500px', display: 'none' }} className="md:block">
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                <input
                  type="search"
                  placeholder="Search premium electronics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '30px',
                    padding: '10px 40px 10px 20px',
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.75rem',
                    letterSpacing: '0.04em',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = GOLD;
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.04)';
                  }}
                />
                <button type="submit" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Search style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = GOLD} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'} />
                </button>
              </form>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              {/* Wishlist */}
              <button
                className="hidden sm:flex items-center justify-center relative group"
                style={{ width: '40px', height: '40px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <Link href="/wishlist">
                  <Heart style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.75)', transition: 'color 0.3s' }} className="group-hover:!text-white" />
                  {wishlist.length > 0 && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', sans-serif", fontSize: '0.5rem', fontWeight: 700, color: 'black' }}>
                      {wishlist.length}
                    </div>
                  )}
                </Link>
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="flex items-center justify-center relative group"
                style={{ width: '40px', height: '40px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <ShoppingCart style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.75)', transition: 'color 0.3s' }} className="group-hover:!text-white" />
                {itemCount > 0 && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', sans-serif", fontSize: '0.45rem', fontWeight: 700, color: 'black' }}>
                    {itemCount > 99 ? '99' : itemCount}
                  </div>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 8px' }}>
                      <Avatar className="h-8 w-8" style={{ border: `1px solid ${GOLD}44` }}>
                        <AvatarImage src={user?.avatar?.url} alt={user?.name} />
                        <AvatarFallback style={{ background: '#1a1a1a', color: GOLD, fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 600 }}>
                          {user?.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block truncate" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em', maxWidth: '100px' }}>
                        {user?.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="px-3 py-3">
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>{user?.name}</p>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }} className="truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-[#1a1a1a] focus:text-white cursor-pointer py-2.5 gap-3" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
                      <User className="w-4 h-4" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/orders')} className="focus:bg-[#1a1a1a] focus:text-white cursor-pointer py-2.5 gap-3" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
                      <Package className="w-4 h-4" /> My Orders
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.1)' }} />
                        <DropdownMenuItem onClick={() => router.push('/admin')} className="focus:bg-[#1a1a1a] cursor-pointer py-2.5 gap-3" style={{ color: GOLD, fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
                          <Settings className="w-4 h-4" /> Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <DropdownMenuItem onClick={logout} className="focus:bg-[#1a1a1a] cursor-pointer py-2.5 gap-3" style={{ color: '#ff4c4c', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
                      <LogOut className="w-4 h-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-4 ml-2">
                  <Link href="/login" className="hover:text-white transition-colors duration-300" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                    Log In
                  </Link>
                  <Link href="/register" className="hover:scale-105 transition-transform duration-300" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', color: 'black', background: GOLD, padding: '8px 18px', borderRadius: '30px', textTransform: 'uppercase' }}>
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden flex items-center justify-center space-x-2"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? <X style={{ color: 'white' }} className="w-5 h-5" /> : <Menu style={{ color: 'white' }} className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 animate-fade-in">
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '20px' }}>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px 40px 12px 16px',
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none' }}>
                  <Search style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.4)' }} />
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Heart className="w-4 h-4" style={{ color: GOLD }} />
                  Wishlist ({wishlist.length})
                </Link>

                {!isAuthenticated && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, textAlign: 'center', border: `1px solid ${GOLD}`, color: GOLD, padding: '10px 0', borderRadius: '4px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Log In
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, textAlign: 'center', background: GOLD, color: 'black', padding: '10px 0', borderRadius: '4px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
