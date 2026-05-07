import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos.'); return }
    setLoading(true); setError('')
    try {
      await api.register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a7a 100%)',
      padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,115,223,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420, background: '#fff',
        borderRadius: 'var(--radius-xl)', padding: '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'fadeUp 0.5s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src='https://i.imgur.com/xf5BfaE.png' style={{width: 250}} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--navy)', marginBottom: 6 }}>
            Criar Conta
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Junte-se à revolução VaralTech</p>
        </div>

        {success ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            padding: '24px', textAlign: 'center'
          }}>
            <CheckCircle size={56} color="var(--green)" strokeWidth={1.5} />
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
              Conta criada com sucesso!
            </p>
            <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Redirecionando para o login...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: <User size={17} color="var(--gray-400)" />, type: 'text', placeholder: 'Nome completo', key: 'name' },
              { icon: <Mail size={17} color="var(--gray-400)" />, type: 'email', placeholder: 'E-mail', key: 'email' },
            ].map(({ icon, type, placeholder, key }) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 14px', borderRadius: 'var(--radius)',
                border: '1.5px solid var(--gray-200)', background: 'var(--gray-50)'
              }}>
                {icon}
                <input
                  type={type} placeholder={placeholder} value={form[key]}
                  onChange={set(key)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--navy)' }}
                />
              </div>
            ))}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '13px 14px', borderRadius: 'var(--radius)',
              border: '1.5px solid var(--gray-200)', background: 'var(--gray-50)'
            }}>
              <Lock size={17} color="var(--gray-400)" />
              <input
                type={showPass ? 'text' : 'password'} placeholder="Senha" value={form.password}
                onChange={set('password')}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--navy)' }}
              />
              <button onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
                color: 'var(--red)', fontSize: 13
              }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button onClick={handleRegister} disabled={loading} style={{
              width: '100%', padding: '14px', marginTop: 4,
              background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
              color: '#fff', border: 'none', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              transition: 'var(--transition)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {loading
                ? <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                : 'Criar Conta'
              }
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
              Já tem conta?{' '}
              <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Entrar</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
