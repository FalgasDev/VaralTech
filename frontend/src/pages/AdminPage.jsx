import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Package, Shield, ShieldOff, Trash2, Plus, Edit2, X,
  TrendingUp, UserCheck, ShoppingBag, LayoutDashboard, LogOut,
  AlertCircle, ChevronRight, Search
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'products', label: 'Produtos', icon: Package },
]

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [productModal, setProductModal] = useState(null) // null | 'add' | product obj
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user?.is_admin) { navigate('/'); return }
    loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, u, p] = await Promise.all([api.adminStats(), api.adminUsers(), api.adminProducts()])
      setStats(s); setUsers(u); setProducts(p)
    } catch { navigate('/') }
    finally { setLoading(false) }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleMakeAdmin = async (id) => {
    try {
      await api.makeAdmin(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: true } : u))
      showToast('Admin concedido com sucesso!')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleRemoveAdmin = async (id) => {
    try {
      await api.removeAdmin(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: false } : u))
      showToast('Admin removido.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return
    try {
      await api.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      showToast('Usuário removido.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Desativar este produto?')) return
    try {
      await api.deleteProduct(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: false } : p))
      showToast('Produto desativado.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ width: 40, height: 40, border: '4px solid var(--blue-light)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--navy)', color: '#fff',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50
      }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18
            }}>V</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
              Varal<span style={{ color: '#6b96f5' }}>Tech</span>
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 46 }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                border: 'none', background: tab === id ? 'rgba(78,115,223,0.25)' : 'transparent',
                color: tab === id ? '#fff' : 'rgba(255,255,255,0.55)',
                fontWeight: tab === id ? 600 : 400, fontSize: 14,
                cursor: 'pointer', transition: 'var(--transition)', marginBottom: 4,
                textAlign: 'left'
              }}
            >
              <Icon size={18} />
              {label}
              {tab === id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '12px 16px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Administrador</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.55)', fontSize: 14, cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, padding: '40px 40px 40px' }}>
        {/* Overview tab */}
        {tab === 'overview' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--navy)', marginBottom: 8 }}>
              Visão Geral
            </h1>
            <p style={{ color: 'var(--gray-400)', marginBottom: 36 }}>Bem-vindo ao painel de administração, {user?.name?.split(' ')[0]}.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
              {[
                { label: 'Usuários', value: stats?.total_users, icon: Users, color: '#4e73df', bg: '#e8edfc' },
                { label: 'Administradores', value: stats?.total_admins, icon: UserCheck, color: '#22c55e', bg: '#dcfce7' },
                { label: 'Produtos Ativos', value: stats?.total_products, icon: ShoppingBag, color: '#f59e0b', bg: '#fef3c7' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} style={{
                  background: '#fff', borderRadius: 'var(--radius-lg)',
                  padding: '24px', border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', alignItems: 'center', gap: 20
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={24} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 4 }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--navy)' }}>{value ?? '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { label: 'Gerenciar Usuários', desc: 'Conceder ou remover permissões de admin', tab: 'users', icon: Users },
                { label: 'Gerenciar Produtos', desc: 'Adicionar, editar ou desativar produtos', tab: 'products', icon: Package },
              ].map(({ label, desc, tab: t, icon: Icon }) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '20px 24px', borderRadius: 'var(--radius-lg)',
                  background: '#fff', border: '1.5px solid var(--gray-200)',
                  cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color="var(--blue)" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--navy)', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{desc}</p>
                  </div>
                  <ChevronRight size={18} color="var(--gray-400)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--navy)', marginBottom: 4 }}>Usuários</h1>
                <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>{users.length} usuários cadastrados</p>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: 24 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text" placeholder="Buscar usuários..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-200)', background: '#fff', fontSize: 14, outline: 'none' }}
              />
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                    {['ID', 'Nome', 'Email', 'Função', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-400)', fontWeight: 500 }}>#{u.id}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0
                          }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-600)' }}>{u.email}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: u.is_admin ? 'var(--blue-light)' : 'var(--gray-100)',
                          color: u.is_admin ? 'var(--blue)' : 'var(--gray-400)'
                        }}>
                          {u.is_admin ? '⚡ Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {u.is_admin ? (
                            <ActionBtn icon={<ShieldOff size={14} />} label="Remover Admin" onClick={() => handleRemoveAdmin(u.id)} color="var(--orange)" />
                          ) : (
                            <ActionBtn icon={<Shield size={14} />} label="Tornar Admin" onClick={() => handleMakeAdmin(u.id)} color="var(--blue)" />
                          )}
                          {u.id !== user.id && (
                            <ActionBtn icon={<Trash2 size={14} />} label="Remover" onClick={() => handleDeleteUser(u.id)} color="var(--red)" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--navy)', marginBottom: 4 }}>Produtos</h1>
                <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>{products.length} produtos cadastrados</p>
              </div>
              <button
                onClick={() => setProductModal('add')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 'var(--radius)',
                  background: 'var(--blue)', color: '#fff', border: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                <Plus size={18} /> Novo Produto
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {products.map(p => (
                <div key={p.id} style={{
                  background: '#fff', borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--gray-200)', overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: p.active ? 1 : 0.5
                }}>
                  <div style={{ position: 'relative', height: 160 }}>
                    <img src={p.image_url || 'https://via.placeholder.com/400'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {!p.active && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>INATIVO</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--navy)', marginBottom: 4 }}>{p.name}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--blue)', marginBottom: 12 }}>{fmt(p.price)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Estoque: {p.stock}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setProductModal(p)} style={{ ...iconBtn, color: 'var(--blue)', borderColor: 'var(--blue-light)', background: 'var(--blue-light)' }}>
                          <Edit2 size={14} />
                        </button>
                        {p.active && (
                          <button onClick={() => handleDeleteProduct(p.id)} style={{ ...iconBtn, color: 'var(--red)', borderColor: 'rgba(231,76,60,0.2)', background: 'rgba(231,76,60,0.06)' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product modal */}
      {productModal && (
        <ProductModal
          product={productModal === 'add' ? null : productModal}
          onClose={() => setProductModal(null)}
          onSaved={loadAll}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', borderRadius: 'var(--radius)',
          background: toast.type === 'error' ? 'var(--red)' : 'var(--navy)',
          color: '#fff', boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease', fontSize: 14, fontWeight: 500
        }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : null}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon, label, onClick, color }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 'var(--radius-sm)',
      border: `1px solid ${color}22`, background: `${color}10`,
      color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
      transition: 'var(--transition)'
    }}>
      {icon} {label}
    </button>
  )
}

const iconBtn = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'var(--transition)'
}

function ProductModal({ product, onClose, onSaved, showToast }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    image_url: product?.image_url || '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isEdit) {
        await api.updateProduct(product.id, { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) })
        showToast('Produto atualizado!')
      } else {
        await api.createProduct({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) })
        showToast('Produto criado!')
      }
      onSaved(); onClose()
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const fields = [
    { label: 'Nome', key: 'name', type: 'text', placeholder: 'Nome do produto' },
    { label: 'Preço (R$)', key: 'price', type: 'number', placeholder: '0.00' },
    { label: 'Categoria', key: 'category', type: 'text', placeholder: 'ex: Varais, Smart, Kits' },
    { label: 'Estoque', key: 'stock', type: 'number', placeholder: '0' },
    { label: 'URL da Imagem', key: 'image_url', type: 'url', placeholder: 'https://...' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', animation: 'fadeUp 0.3s ease', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid var(--gray-200)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--navy)' }}>
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--gray-200)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-400)' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-200)', fontSize: 14, outline: 'none', color: 'var(--navy)', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Descrição</label>
            <textarea
              placeholder="Descrição detalhada do produto..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-200)', fontSize: 14, outline: 'none', color: 'var(--navy)', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <button onClick={handleSave} disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
            color: '#fff', border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {loading
              ? <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              : isEdit ? 'Salvar Alterações' : 'Criar Produto'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
