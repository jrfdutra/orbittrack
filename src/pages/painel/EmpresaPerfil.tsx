import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Empresa } from '@/lib/types'
import { Building2, Save, Upload, Loader2, CheckCircle2 } from 'lucide-react'

export default function EmpresaPerfil() {
  const { empresa, refreshEmpresa } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Empresa>>({
    nome: '',
    descricao: '',
    email: '',
    telefone: '',
    website: '',
    instagram: '',
    morada: '',
    nif: '',
    texto_rodape: '',
    cor_primaria: '#2563eb',
    cor_secundaria: '#1e40af',
    logotipo_url: '',
    foto_capa_url: '',
  })

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome || '',
        descricao: empresa.descricao || '',
        email: empresa.email || '',
        telefone: empresa.telefone || '',
        website: empresa.website || '',
        instagram: empresa.instagram || '',
        morada: empresa.morada || '',
        nif: empresa.nif || '',
        texto_rodape: empresa.texto_rodape || '',
        cor_primaria: empresa.cor_primaria || '#2563eb',
        cor_secundaria: empresa.cor_secundaria || '#1e40af',
        logotipo_url: empresa.logotipo_url || '',
        foto_capa_url: empresa.foto_capa_url || '',
      })
    }
  }, [empresa])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'logo' | 'capa') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (tipo === 'logo') setUploadingLogo(true)
    else setUploadingCapa(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${empresa?.id}/${tipo}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('empresas')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('empresas')
        .getPublicUrl(fileName)

      if (tipo === 'logo') {
        setFormData((prev) => ({ ...prev, logotipo_url: publicUrl }))
      } else {
        setFormData((prev) => ({ ...prev, foto_capa_url: publicUrl }))
      }
    } catch (err: any) {
      setErro('Erro ao carregar ficheiro: ' + err.message)
    } finally {
      if (tipo === 'logo') setUploadingLogo(false)
      else setUploadingCapa(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return

    setLoading(true)
    setErro(null)
    setSucesso(false)

    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: formData.nome,
          descricao: formData.descricao,
          email: formData.email,
          telefone: formData.telefone,
          website: formData.website,
          instagram: formData.instagram,
          morada: formData.morada,
          nif: formData.nif,
          texto_rodape: formData.texto_rodape,
          cor_primaria: formData.cor_primaria,
          cor_secundaria: formData.cor_secundaria,
          logotipo_url: formData.logotipo_url,
          foto_capa_url: formData.foto_capa_url,
        })
        .eq('id', empresa.id)

      if (error) throw error

      await refreshEmpresa()
      setSucesso(true)
      setTimeout(() => setSucesso(false), 4000)
    } catch (err: any) {
      setErro('Erro ao guardar alterações: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
          <p className="text-gray-500 text-sm">
            Personalize a marca da sua empresa que aparecerá nos portais dos seus compradores.
          </p>
        </div>
      </div>

      {sucesso && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Alterações guardadas com sucesso!</span>
        </div>
      )}

      {erro && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome da Empresa</label>
                <input
                  type="text"
                  name="nome"
                  className="input"
                  value={formData.nome || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label">NIF</label>
                <input
                  type="text"
                  name="nif"
                  className="input"
                  value={formData.nif || ''}
                  onChange={handleChange}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div>
              <label className="label">Descrição / Slogan</label>
              <textarea
                name="descricao"
                className="input"
                rows={3}
                value={formData.descricao || ''}
                onChange={handleChange}
                placeholder="Especialistas em impressão 3D de alta precisão..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="cor_primaria"
                    value={formData.cor_primaria || '#2563eb'}
                    onChange={handleChange}
                    className="w-12 h-10 rounded-xl border border-gray-300 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    name="cor_primaria"
                    value={formData.cor_primaria || '#2563eb'}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="cor_secundaria"
                    value={formData.cor_secundaria || '#1e40af'}
                    onChange={handleChange}
                    className="w-12 h-10 rounded-xl border border-gray-300 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    name="cor_secundaria"
                    value={formData.cor_secundaria || '#1e40af'}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Contactos e Morada</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email de Contacto</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="geral@suaempresa.pt"
                />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input
                  type="text"
                  name="telefone"
                  className="input"
                  value={formData.telefone || ''}
                  onChange={handleChange}
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Website</label>
                <input
                  type="text"
                  name="website"
                  className="input"
                  value={formData.website || ''}
                  onChange={handleChange}
                  placeholder="https://suaempresa.pt"
                />
              </div>
              <div>
                <label className="label">Instagram</label>
                <input
                  type="text"
                  name="instagram"
                  className="input"
                  value={formData.instagram || ''}
                  onChange={handleChange}
                  placeholder="@suaempresa"
                />
              </div>
            </div>

            <div>
              <label className="label">Morada</label>
              <input
                type="text"
                name="morada"
                className="input"
                value={formData.morada || ''}
                onChange={handleChange}
                placeholder="Rua da Impressão 3D, 123, Lisboa"
              />
            </div>

            <div>
              <label className="label">Texto de Rodapé (Faturas / Recibos / Portais)</label>
              <input
                type="text"
                name="texto_rodape"
                className="input"
                value={formData.texto_rodape || ''}
                onChange={handleChange}
                placeholder="Obrigado pela preferência!"
              />
            </div>
          </div>
        </div>

        {/* Imagens e Pré-visualização */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Logótipo e Capa</h2>

            <div>
              <label className="label">Logótipo</label>
              <div className="flex items-center gap-4">
                {formData.logotipo_url ? (
                  <img
                    src={formData.logotipo_url}
                    alt="Logótipo"
                    className="w-16 h-16 rounded-xl object-contain border border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer flex-1">
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Alterar</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="label">Foto de Capa</label>
              <div className="space-y-2">
                {formData.foto_capa_url && (
                  <img
                    src={formData.foto_capa_url}
                    alt="Capa"
                    className="w-full h-32 rounded-xl object-cover border border-gray-200"
                  />
                )}
                <label className="btn-secondary w-full cursor-pointer">
                  {uploadingCapa ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Carregar Capa</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'capa')}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Pré-visualização da Marca
            </h3>
            <div className="p-4 rounded-xl bg-white text-gray-900 space-y-3">
              <div className="flex items-center gap-3">
                {formData.logotipo_url ? (
                  <img src={formData.logotipo_url} className="w-10 h-10 rounded-lg object-contain" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: formData.cor_primaria || '#2563eb' }}
                  >
                    {formData.nome?.[0] || 'O'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm">{formData.nome || 'Nome da Empresa'}</h4>
                  <p className="text-xs text-gray-500">{formData.email || 'email@exemplo.pt'}</p>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                style={{ backgroundColor: formData.cor_primaria || '#2563eb' }}
              >
                Estado da Encomenda
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Alterações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
