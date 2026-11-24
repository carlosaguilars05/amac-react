const MAPA_ESTATUS = {
  Enviada: { clase: 'etiqueta--enviada', texto: 'Enviada' },
  'En revisión': { clase: 'etiqueta--revision', texto: 'En revisión' },
  Aceptada: { clase: 'etiqueta--aceptada', texto: 'Aceptada' },
  Rechazada: { clase: 'etiqueta--rechazada', texto: 'Rechazada' },
  Cancelada: { clase: 'etiqueta--cancelada', texto: 'Cancelada' },
  activa: { clase: 'etiqueta--activa', texto: 'Activa' },
  pausada: { clase: 'etiqueta--pausada', texto: 'Pausada' },
  cerrada: { clase: 'etiqueta--cerrada', texto: 'Cerrada' },
  aprobado: { clase: 'etiqueta--aprobado', texto: 'Aprobado' },
  pendiente: { clase: 'etiqueta--pendiente', texto: 'Pendiente de aprobación' },
}

function EtiquetaEstatus({ estatus }) {
  const config = MAPA_ESTATUS[estatus] || {
    clase: 'etiqueta--cerrada',
    texto: estatus || 'Sin estatus',
  }

  return <span className={`etiqueta ${config.clase}`}>{config.texto}</span>
}

export default EtiquetaEstatus
