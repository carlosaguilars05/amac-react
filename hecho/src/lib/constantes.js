export const HORARIOS = [
  'Tiempo completo',
  'Matutino',
  'Vespertino',
  'Medio tiempo',
  'Fines de semana',
]

export const CATEGORIAS = [
  'Ventas',
  'Administración',
  'Almacén',
  'Atención al cliente',
  'Limpieza',
  'Otro',
]

export function formatearSueldo(sueldo) {
  const numero = Number(sueldo)
  if (Number.isNaN(numero)) return '$0 al mes'
  return `$${numero.toLocaleString('es-MX')} al mes`
}

export function formatearFecha(fechaIso) {
  if (!fechaIso) return ''
  return new Date(fechaIso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function limpiarTelefono(telefono) {
  if (!telefono) return ''
  return String(telefono).replace(/\D/g, '')
}
