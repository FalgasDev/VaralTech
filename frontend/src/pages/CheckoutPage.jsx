import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import { CreditCard, Lock, CheckCircle, ChevronRight, Barcode, QrCode, ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react'

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'pix',    label: 'PIX',               icon: QrCode },
  { id: 'boleto', label: 'Boleto',             icon: Barcode },
]

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [method, setMethod] = useState('credit')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  // Credit card fields
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState({})

  // PIX key (just visual)
  const pixKey = 'varaltech@pix.com.br'

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  const validate = () => {
    if (method !== 'credit') return true
    const e = {}
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Número inválido'
    if (!card.name.trim()) e.name = 'Nome obrigatório'
    if (card.expiry.length < 5) e.expiry = 'Data inválida'
    if (card.cvv.length < 3) e.cvv = 'CVV inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async () => {
    if (items.length === 0) return
    if (!validate()) return
    setLoading(true)
    setCheckoutError('')
    try {
      // Decrement stock on the backend
      await api.checkout(items.map(i => ({ id: i.id, qty: i.qty })))
      setTimeout(() => {
        setDone(true)
        clearCart()
        setLoading(false)
      }, 2200)
    } catch (e) {
      setCheckoutError(e.message || 'Erro ao processar o pedido. Tente novamente.')
      setLoading(false)
    }
  }

  if (done) return <SuccessScreen navigate={navigate} />

  const shipping = total > 300 ? 0 : 19.90
  const finalTotal = total + shipping

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingTop: 80 }}>
      {/* Header strip */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a7a 100%)',
        padding: '28px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-sm)', color: '#fff', padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1 }}>
              Finalizar Pedido
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>
              Ambiente seguro <Lock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

        {/* LEFT — Payment form */}
        <div>
          {/* Method selector */}
          <Card>
            <SectionTitle>Forma de Pagamento</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: '14px 10px', borderRadius: 'var(--radius)',
                    border: `2px solid ${method === m.id ? 'var(--blue)' : 'var(--gray-200)'}`,
                    background: method === m.id ? 'var(--blue-light)' : '#fff',
                    cursor: 'pointer', transition: 'var(--transition)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                  }}
                >
                  <m.icon size={22} color={method === m.id ? 'var(--blue)' : 'var(--gray-400)'} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: method === m.id ? 'var(--blue)' : 'var(--gray-600)' }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Credit card form */}
          {method === 'credit' && (
            <Card style={{ marginTop: 16 }}>
              <SectionTitle>Dados do Cartão</SectionTitle>
              {/* Card preview */}
              <div style={{
                margin: '20px 0',
                background: 'linear-gradient(135deg, var(--navy) 0%, #2d2d6e 100%)',
                borderRadius: 16, padding: '24px 28px', color: '#fff',
                boxShadow: '0 12px 40px rgba(30,30,80,0.25)',
                position: 'relative', overflow: 'hidden', minHeight: 160
              }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(78,115,223,0.2)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(78,115,223,0.12)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>VaralTech</span>
                  <CreditCard size={28} color="rgba(255,255,255,0.5)" />
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.18em', marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>
                  {card.number || '•••• •••• •••• ••••'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Titular</div>
                    <div style={{ fontWeight: 600 }}>{card.name || 'SEU NOME'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Validade</div>
                    <div style={{ fontWeight: 600 }}>{card.expiry || 'MM/AA'}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field
                  label="Número do Cartão"
                  placeholder="0000 0000 0000 0000"
                  value={card.number}
                  onChange={e => setCard(c => ({ ...c, number: fmtCard(e.target.value) }))}
                  error={errors.number}
                />
                <Field
                  label="Nome do Titular"
                  placeholder="Como está no cartão"
                  value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                  error={errors.name}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field
                    label="Validade"
                    placeholder="MM/AA"
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: fmtExpiry(e.target.value) }))}
                    error={errors.expiry}
                  />
                  <Field
                    label="CVV"
                    placeholder="•••"
                    value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    error={errors.cvv}
                  />
                </div>

                <div style={{ marginTop: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>
                    Parcelas
                  </label>
                  <select style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, color: 'var(--navy)', background: 'var(--gray-50)',
                    outline: 'none', cursor: 'pointer'
                  }}>
                    <option>1x de {fmt(finalTotal)} sem juros</option>
                    <option>2x de {fmt(finalTotal / 2)} sem juros</option>
                    <option>3x de {fmt(finalTotal / 3)} sem juros</option>
                    <option>6x de {fmt(finalTotal / 6)} sem juros</option>
                    <option>12x de {fmt(finalTotal / 12)} com juros</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* PIX */}
          {method === 'pix' && (
            <Card style={{ marginTop: 16 }}>
              <SectionTitle>Pagamento via PIX</SectionTitle>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                {/* Fake QR Code */}
                <div style={{
                  width: 180, height: 180, margin: '0 auto 20px',
                  background: '#fff', border: '2px solid var(--gray-200)',
                  borderRadius: 12, display: 'grid',
                  gridTemplateColumns: 'repeat(9,1fr)', gap: 2, padding: 12
                }}>
                  {Array.from({ length: 81 }).map((_, i) => (
                    <div key={i} style={{
                      background: Math.random() > 0.5 ? 'var(--navy)' : 'transparent',
                      borderRadius: 1
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>
                  Chave PIX:
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', background: 'var(--gray-100)',
                  borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, color: 'var(--navy)'
                }}>
                  {pixKey}
                  <button
                    onClick={() => navigator.clipboard.writeText(pixKey)}
                    style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Copiar
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 16 }}>
                  O QR Code expira em <strong>30 minutos</strong>. Após o pagamento, a confirmação é imediata.
                </p>
              </div>
            </Card>
          )}

          {/* Boleto */}
          {method === 'boleto' && (
            <Card style={{ marginTop: 16 }}>
              <SectionTitle>Boleto Bancário</SectionTitle>
              <div style={{ padding: '20px 0' }}>
                <div style={{
                  background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)',
                  padding: '16px', marginBottom: 16, fontFamily: 'monospace',
                  fontSize: 13, color: 'var(--gray-600)', letterSpacing: '0.05em', wordBreak: 'break-all'
                }}>
                  34191.75124 50514.260185 61514.980000 4 10010000029900
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                  ⚠️ O boleto vence em <strong>3 dias úteis</strong>. A confirmação pode levar até <strong>2 dias úteis</strong> após o pagamento.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — Order summary */}
        <div style={{ position: 'sticky', top: 100 }}>
          <Card>
            <SectionTitle>Resumo do Pedido</SectionTitle>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)' }}>
                  <ShoppingBag size={32} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 14 }}>Carrinho vazio</p>
                </div>
              ) : items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={item.image_url} alt={item.name}
                    style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--gray-200)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Qtd: {item.qty}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', flexShrink: 0 }}>
                    {fmt(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: 20, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="Subtotal" value={fmt(total)} />
              <Row
                label="Frete"
                value={shipping === 0 ? 'Grátis 🎉' : fmt(shipping)}
                valueColor={shipping === 0 ? 'var(--green)' : undefined}
              />
              {total < 300 && (
                <p style={{ fontSize: 12, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  Frete grátis para compras acima de R$ 300,00
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--gray-200)', marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--blue)' }}>{fmt(finalTotal)}</span>
              </div>
            </div>

            {checkoutError && (
              <div style={{
                marginTop: 16,
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)',
                color: 'var(--red)', fontSize: 13, fontWeight: 500, lineHeight: 1.5
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {checkoutError}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading || items.length === 0}
              style={{
                marginTop: 20, width: '100%', padding: '16px',
                background: loading ? 'var(--gray-200)' : 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                color: loading ? 'var(--gray-400)' : '#fff',
                border: 'none', borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
            >
              {loading ? (
                <>
                  <Spinner /> Processando...
                </>
              ) : (
                <>
                  <Lock size={16} /> Confirmar Pagamento <ChevronRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              <Lock size={12} color="var(--gray-400)" />
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Pagamento 100% seguro e criptografado</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ navigate }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a7a 100%)',
      padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl)',
        padding: '56px 48px', maxWidth: 460, width: '100%',
        textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
        animation: 'fadeUp 0.5s ease'
      }}>
        {/* Checkmark circle */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'var(--green-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 0 0 12px rgba(34,197,94,0.08)'
        }}>
          <CheckCircle size={44} color="var(--green)" strokeWidth={2} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--navy)', marginBottom: 12
        }}>
          Pagamento Confirmado!
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
          Seu pedido foi recebido com sucesso. 🎉
        </p>
        <p style={{ color: 'var(--gray-400)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
          Em breve você receberá um email de confirmação com os detalhes do seu pedido e o código de rastreamento.
        </p>

        <div style={{
          background: 'var(--gray-50)', borderRadius: 'var(--radius)',
          padding: '16px', marginBottom: 28
        }}>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Número do pedido</p>
          <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: 'var(--navy)', letterSpacing: '0.1em' }}>
            #VT-{Math.floor(Math.random() * 90000 + 10000)}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
            color: '#fff', border: 'none', borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          Continuar comprando <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      padding: '24px', boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)', ...style
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--navy)' }}>
      {children}
    </h2>
  )
}

function Field({ label, error, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '12px 14px',
          border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--blue)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius-sm)', fontSize: 15, color: 'var(--navy)',
          background: focused ? '#fff' : 'var(--gray-50)',
          outline: 'none', transition: 'var(--transition)',
          boxShadow: focused ? '0 0 0 3px rgba(78,115,223,0.12)' : 'none',
          boxSizing: 'border-box'
        }}
      />
      {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: valueColor || 'var(--navy)' }}>{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: '2.5px solid rgba(0,0,0,0.15)',
      borderTopColor: 'var(--blue)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )
}
