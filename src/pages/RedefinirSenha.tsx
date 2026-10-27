import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Lock, Printer } from 'lucide-react'

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (novaSenha.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError('As palavras-passe não coincidem.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha,
      })

      if (updateError) throw updateError

      setSucesso(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir a palavra-passe.')
    } finally {
      setLoading(false)
    }
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
          {sucesso ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Palavra-passe alterada!</h2>
              <p className="text-gray-600 text-sm">
                A sua palavra-passe foi atualizada com sucesso. A redirecionar para o login...
              </p>
              <Link to="/login" className="btn-primary inline-flex">
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Redefinir palavra-passe</h2>
              <p className="text-gray-500 text-sm mb-6">
                Escolha uma nova palavra-passe segura para a sua conta.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="novaSenha" className="label">
                    Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <input
                      id="novaSenha"
                      type="password"
                      required
                      minLength={6}
                      className="input pl-10"
                      placeholder="••••••••"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="label">
                    Confirmar Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirmarSenha"
                      type="password"
                      required
                      minLength={6}
                      className="input pl-10"
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'A guardar...' : 'Atualizar palavra-passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
