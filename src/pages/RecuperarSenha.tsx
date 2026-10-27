import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Printer, ArrowLeft } from 'lucide-react'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      setError(error)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4">
            <Printer className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OrbitTrack</h1>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email enviado!</h2>
              <p className="text-gray-500 mb-6">
                Se existir uma conta com o email <strong>{email}</strong>, receberá instruções
                para redefinir a palavra-passe.
              </p>
              <Link to="/login" className="btn-primary">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Recuperar palavra-passe</h2>
              <p className="text-gray-500 text-sm mb-6">
                Introduza o seu email e enviaremos um link para redefinir a palavra-passe.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendedor@exemplo.pt"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'A enviar...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
