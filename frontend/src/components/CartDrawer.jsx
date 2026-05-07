import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total, clearCart } = useCart()
  const navigate = useNavigate()

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, zIndex: 201,
        width: 420, maxWidth: '100vw', height: '100vh',
        background: '#fff',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 24px 20px',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={22} color="var(--blue)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
              Meu Carrinho
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--gray-200)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gray-600)', transition: 'var(--transition)'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 16, color: 'var(--gray-400)'
            }}>
              <ShoppingBag size={56} strokeWidth={1} />
              <p style={{ fontSize: 16, fontWeight: 500 }}>Seu carrinho está vazio</p>
              <p style={{ fontSize: 14, textAlign: 'center' }}>Adicione produtos para continuar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  padding: 14, borderRadius: 'var(--radius)',
                  border: '1px solid var(--gray-200)',
                  background: 'var(--gray-50)',
                  transition: 'var(--transition)'
                }}>
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue)' }}>
                      {fmt(item.price * item.qty)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={qtyBtn}>
                        <Minus size={12} />
                      </button>
                      <span style={{ width: 24, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                        {item.qty}
                      </span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={qtyBtn}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{
                      ...qtyBtn, color: 'var(--red)', borderColor: 'rgba(231,76,60,0.2)', background: 'rgba(231,76,60,0.05)'
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 500, color: 'var(--gray-600)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--navy)' }}>
                {fmt(total)}
              </span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/checkout') }}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                transition: 'var(--transition)', marginBottom: 10, cursor: 'pointer'
              }}>
              Finalizar Pedido
            </button>
            <button onClick={clearCart} style={{
              width: '100%', padding: '10px',
              background: 'transparent', color: 'var(--gray-400)',
              border: 'none', fontSize: 13, transition: 'var(--transition)'
            }}>
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </>
  )
}

const qtyBtn = {
  width: 28, height: 28, borderRadius: 8,
  border: '1px solid var(--gray-200)', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--navy)', transition: 'var(--transition)', cursor: 'pointer'
}
