import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'

export function formatarData(data: string | null | undefined): string {
  if (!data) return '—'
  try {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: pt })
  } catch {
    return data
  }
}

export function formatarDataHora(data: string | null | undefined): string {
  if (!data) return '—'
  try {
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: pt })
  } catch {
    return data
  }
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—'
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(valor)
}

export function formatarDuracao(minutos: number | null | undefined): string {
  if (!minutos) return '—'
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  if (horas === 0) return `${mins}min`
  if (mins === 0) return `${horas}h`
  return `${horas}h ${mins}min`
}

export function gerarTokenSeguro(bytes: number = 18): string {
  const array = new Uint8Array(bytes)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function validarFicheiro3D(nome: string): boolean {
  const extensoes = ['.stl', '.glb', '.gltf']
  return extensoes.some((ext) => nome.toLowerCase().endsWith(ext))
}

export function validarImagem(nome: string): boolean {
  const extensoes = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  return extensoes.some((ext) => nome.toLowerCase().endsWith(ext))
}

export const TAMANHO_MAX_FICHEIRO = 50 * 1024 * 1024 // 50MB
export const TAMANHO_MAX_IMAGEM = 10 * 1024 * 1024 // 10MB
