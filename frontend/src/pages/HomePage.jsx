import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Star, ShoppingCart, ArrowRight, Zap } from 'lucide-react'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'

const CATEGORIES = ['Todos', 'Varais', 'Smart', 'Acessórios', 'Kits']

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [addedId, setAddedId] = useState(null)
  const navigate = useNavigate()
  const { addItem } = useCart()

  useEffect(() => {
    api.products()
      .then(data => { setProducts(data); setFiltered(data) })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = products
    if (category !== 'Todos') result = result.filter(p => p.category === category)
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [search, category, products])

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    addItem(product, 1)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 50%, #1e3a7a 100%)',
        padding: '80px 24px 100px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,115,223,0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: '20%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,115,223,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: 'rgba(78,115,223,0.2)', border: '1px solid rgba(78,115,223,0.4)',
            color: '#a5b8f8', fontSize: 13, fontWeight: 500, marginBottom: 24
          }}>
            <Zap size={14} />
            Tecnologia que transforma sua rotina
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(36px, 6vw, 64px)',
            color: '#fff', lineHeight: 1.1, marginBottom: 20
          }}>
            Varais inteligentes<br />
            <span style={{ color: '#6b96f5' }}>para o seu lar</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Descubra a linha completa de varais e acessórios VaralTech. Qualidade, praticidade e design.
          </p>
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap'
          }}>
            <a href="#products" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 'var(--radius)',
              background: 'var(--blue)', color: '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
              transition: 'var(--transition)'
            }}>
              Ver Produtos <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Products section */}
      <section id="products" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px 12px 42px',
                borderRadius: 'var(--radius)', border: '1.5px solid var(--gray-200)',
                background: '#fff', fontSize: 15, outline: 'none',
                transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '10px 18px', borderRadius: 999,
                  border: '1.5px solid',
                  borderColor: category === cat ? 'var(--blue)' : 'var(--gray-200)',
                  background: category === cat ? 'var(--blue)' : '#fff',
                  color: category === cat ? '#fff' : 'var(--gray-600)',
                  fontWeight: 500, fontSize: 14, transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', border: '1px solid var(--gray-200)'
              }}>
                <div style={{ height: 220, background: 'var(--gray-100)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ height: 20, background: 'var(--gray-100)', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ height: 14, background: 'var(--gray-100)', borderRadius: 6, width: '60%', animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <Filter size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 18, fontWeight: 500 }}>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                delay={i * 60}
                onView={() => navigate(`/product/${product.id}`)}
                onAdd={(e) => handleAddToCart(e, product)}
                added={addedId === product.id}
                fmt={fmt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProductCard({ product, delay, onView, onAdd, added, fmt }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid',
        borderColor: hovered ? 'var(--blue)' : 'var(--gray-200)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        animation: `fadeUp 0.5s ease ${delay}ms both`
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
        <img
          src={product.image_url || 'https://via.placeholder.com/400x220'}
          alt={product.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)'
          }}
        />
        {product.category && (
          <span style={{
            position: 'absolute', top: 14, left: 14,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            fontWeight: 600, fontSize: 12, color: 'var(--blue)',
            backdropFilter: 'blur(4px)'
          }}>
            {product.category}
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span style={{
            position: 'absolute', top: 14, right: 14,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(245,158,11,0.9)',
            fontWeight: 600, fontSize: 11, color: '#fff'
          }}>
            Últimas unidades
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 20px 16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          color: 'var(--navy)', marginBottom: 8, lineHeight: 1.3
        }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} fill={i < 4 ? 'var(--orange)' : 'none'} color={i < 4 ? 'var(--orange)' : 'var(--gray-300)'} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 4 }}>(128)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
              color: 'var(--navy)'
            }}>
              {fmt(product.price)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              ou 12x sem juros
            </p>
          </div>
          <button
            onClick={onAdd}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, borderRadius: 'var(--radius)',
              background: added ? 'var(--green)' : 'var(--blue)',
              color: '#fff', border: 'none',
              transition: 'all 0.2s ease',
              transform: added ? 'scale(0.95)' : 'scale(1)'
            }}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
