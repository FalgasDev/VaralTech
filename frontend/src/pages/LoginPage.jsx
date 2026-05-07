import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import emailjs from '@emailjs/browser'

// ── EmailJS config ────────────────────────────────────────────────────────────
// Crie uma conta em https://www.emailjs.com e preencha abaixo:
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID   // ex: 'service_xxxxxx'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID  // ex: 'template_xxxxxx'
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY   // ex: 'xxxxxxxxxxxxxxxx'
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState('login') // 'login' | 'otp'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    setLoading(true); setError('')
    try {
      const res = await api.login({ email, password })
      // res contém: { otp_code, email, name }

      // Enviar o código OTP por email via EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: res.email,
          to_name: res.name,
          otp_code: res.otp_code,
        },
        EMAILJS_PUBLIC_KEY
      )

      setStep('otp')
    } catch (e) {
      if (e?.status !== undefined) {
        // Erro do EmailJS (retorna objeto com .status)
        setError('Não foi possível enviar o email de verificação. Tente novamente.')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) { setError('Digite o código OTP.'); return }
    setLoading(true); setError('')
    try {
      const res = await api.verifyOtp({ email, code: otp })
      login(res.token, { name: res.name, email, is_admin: res.is_admin })
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a7a 100%)',
      padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      {/* BG decoration */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(78,115,223,0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(78,115,223,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        animation: 'fadeUp 0.5s ease',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src='https://i.imgur.com/xf5BfaE.png' style={{width: 250}} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--navy)', marginBottom: 6 }}>
            {step === 'login' ? 'Bem-vindo de volta' : 'Verificação OTP'}
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>
            {step === 'login'
              ? 'Entre para continuar na VaralTech'
              : `Código enviado para ${email}`}
          </p>
        </div>

        {step === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField
              icon={<Mail size={17} color="var(--gray-400)" />}
              type="email" placeholder="E-mail"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <InputField
              icon={<Lock size={17} color="var(--gray-400)" />}
              type={showPass ? 'text' : 'password'}
              placeholder="Senha"
              value={password} onChange={e => setPassword(e.target.value)}
              suffix={
                <button onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />
            {error && <ErrorMsg msg={error} />}
            <Link to="#" style={{ fontSize: 13, color: 'var(--blue)', alignSelf: 'flex-end', marginTop: -4 }}>
              Esqueceu a senha?
            </Link>
            <PrimaryBtn onClick={handleLogin} loading={loading}>
              Entrar
            </PrimaryBtn>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
              Não tem conta?{' '}
              <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>Cadastre-se</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              fontSize: 14, color: 'var(--gray-600)',
              background: 'var(--blue-light)', padding: '12px 14px',
              borderRadius: 'var(--radius-sm)', lineHeight: 1.5
            }}>
              📧 Um código de 6 dígitos foi enviado para <strong>{email}</strong>. Verifique sua caixa de entrada (e o spam).
            </div>
            <OtpInput value={otp} onChange={setOtp} />
            {error && <ErrorMsg msg={error} />}
            <PrimaryBtn onClick={handleVerifyOtp} loading={loading}>
              Verificar Código
            </PrimaryBtn>
            <button
              onClick={() => { setStep('login'); setOtp(''); setError('') }}
              style={{
                background: 'none', border: 'none', color: 'var(--gray-400)',
                fontSize: 13, cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              Voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InputField({ icon, suffix, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 14px', borderRadius: 'var(--radius)',
      border: '1.5px solid', borderColor: focused ? 'var(--blue)' : 'var(--gray-200)',
      background: focused ? '#fff' : 'var(--gray-50)',
      boxShadow: focused ? '0 0 0 3px rgba(78,115,223,0.12)' : 'none',
      transition: 'var(--transition)'
    }}>
      {icon}
      <input {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontSize: 15, color: 'var(--navy)'
      }} />
      {suffix}
    </div>
  )
}

function OtpInput({ value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>
        Código de verificação (6 dígitos)
      </label>
      <input
        type="text" maxLength={6} value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '16px', textAlign: 'center',
          letterSpacing: '0.5em', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700,
          border: '1.5px solid var(--blue)', borderRadius: 'var(--radius)',
          outline: 'none', color: 'var(--navy)',
          boxShadow: '0 0 0 3px rgba(78,115,223,0.12)',
          boxSizing: 'border-box'
        }}
        placeholder="000000"
      />
    </div>
  )
}

function ErrorMsg({ msg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
      color: 'var(--red)', fontSize: 13, fontWeight: 500
    }}>
      <AlertCircle size={15} /> {msg}
    </div>
  )
}

function PrimaryBtn({ children, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: '100%', padding: '14px',
      background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
      color: '#fff', border: 'none', borderRadius: 'var(--radius)',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1, transition: 'var(--transition)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
    }}>
      {loading ? <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : children}
    </button>
  )
}
