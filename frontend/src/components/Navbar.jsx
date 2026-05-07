import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Shield, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--gray-200)',
        boxShadow: '0 2px 12px rgba(78,115,223,0.06)'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src='https://i.imgur.com/xf5BfaE.png' style={{width: 150}} />
          </Link>

          {/* Desktop actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user?.is_admin && (
              <Link to="/admin" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--blue-light)', color: 'var(--blue)',
                fontWeight: 600, fontSize: 14, transition: 'var(--transition)'
              }}>
                <Shield size={16} />
                Admin
              </Link>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gray-100)',
                  fontSize: 14, fontWeight: 500, color: 'var(--navy)'
                }}>
                  <User size={16} color="var(--blue)" />
                  {user.name?.split(' ')[0]}
                </div>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--gray-200)', background: 'transparent',
                  color: 'var(--gray-600)', fontSize: 14, transition: 'var(--transition)'
                }}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login" style={{
                padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                background: 'var(--blue)', color: '#fff',
                fontWeight: 600, fontSize: 14, transition: 'var(--transition)'
              }}>
                Entrar
              </Link>
            )}

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44,
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--gray-200)',
                background: '#fff',
                color: 'var(--navy)',
                transition: 'var(--transition)'
              }}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20,
                  background: 'var(--blue)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff'
                }}>{count > 9 ? '9+' : count}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
