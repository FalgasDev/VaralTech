import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, RefreshCw, Plus, Minus, Check } from 'lucide-react'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    api.product(id)
      .then(setProduct)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, border: '4px solid var(--blue-light)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (!product) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Back */}
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--gray-200)', background: '#fff',
          color: 'var(--gray-600)', fontWeight: 500, fontSize: 14,
          marginBottom: 36, transition: 'var(--transition)'
        }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          animation: 'fadeUp 0.5s ease'
        }}
          className="product-grid"
        >
          {/* Left - Image */}
          <div>
            <div style={{
              background: '#fff', borderRadius: 'var(--radius-xl)',
              overflow: 'hidden', border: '1.5px solid var(--gray-200)',
              boxShadow: 'var(--shadow)'
            }}>
              <img
                src={product.image_url || 'https://via.placeholder.com/600'}
                alt={product.name}
                style={{ width: '100%', height: 420, objectFit: 'cover' }}
              />
            </div>
            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[
                { icon: Shield, label: 'Garantia 1 ano' },
                { icon: Truck, label: 'Frete grátis' },
                { icon: RefreshCw, label: 'Troca fácil' }
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 8px', borderRadius: 'var(--radius)',
                  background: '#fff', border: '1px solid var(--gray-200)',
                  fontSize: 12, fontWeight: 500, color: 'var(--gray-600)'
                }}>
                  <Icon size={18} color="var(--blue)" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {product.category && (
              <span style={{
                display: 'inline-flex', alignSelf: 'flex-start',
                padding: '4px 14px', borderRadius: 999,
                background: 'var(--blue-light)', color: 'var(--blue)',
                fontWeight: 600, fontSize: 13
              }}>
                {product.category}
              </span>
            )}

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 32, color: 'var(--navy)', lineHeight: 1.2
            }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < 4 ? 'var(--orange)' : 'none'} color={i < 4 ? 'var(--orange)' : 'var(--gray-300)'} />
              ))}
              <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>4.0 (128 avaliações)</span>
            </div>

            {/* Price */}
            <div style={{
              padding: '20px', borderRadius: 'var(--radius)',
              background: 'var(--gray-50)', border: '1px solid var(--gray-200)'
            }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 40, color: 'var(--navy)', marginBottom: 4
              }}>
                {fmt(product.price)}
              </p>
              <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
                ou <strong>12x de {fmt(product.price / 12)}</strong> sem juros no cartão
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', marginBottom: 8 }}>
                  Descrição
                </h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, fontSize: 15 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: product.stock > 0 ? 'var(--green-light)' : 'rgba(231,76,60,0.08)',
              border: `1px solid ${product.stock > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(231,76,60,0.2)'}`
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: product.stock > 0 ? 'var(--green)' : 'var(--red)'
              }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: product.stock > 0 ? '#16a34a' : 'var(--red)' }}>
                {product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Produto esgotado'}
              </span>
            </div>

            {/* Qty + Add */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)',
                  overflow: 'hidden', background: '#fff'
                }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{
                      width: 44, height: 54, border: 'none', background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--navy)', cursor: 'pointer', transition: 'var(--transition)'
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{
                    width: 48, textAlign: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                    borderLeft: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)',
                    lineHeight: '54px'
                  }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    style={{
                      width: 44, height: 54, border: 'none', background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--navy)', cursor: 'pointer', transition: 'var(--transition)'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1, height: 54,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    background: added
                      ? 'var(--green)'
                      : 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                    transition: 'all 0.25s ease', cursor: 'pointer'
                  }}
                >
                  {added ? <><Check size={20} /> Adicionado!</> : <><ShoppingCart size={20} /> Adicionar ao Carrinho</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
