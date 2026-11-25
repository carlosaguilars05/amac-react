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
  return `$${Number(sueldo).toLocaleString('es-MX')} al mes`
}

export function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-MX')
}

export function limpiarTelefono(telefono) {
  if (!telefono) return ''
  return telefono.replaceAll(' ', '')
}
