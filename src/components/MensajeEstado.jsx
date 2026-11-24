function MensajeEstado({ tipo = 'info', children }) {
  if (!children) return null
  const rol = tipo === 'error' ? 'alert' : 'status'

  return (
    <div className={`alerta alerta--${tipo}`} role={rol}>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  )
}

export default MensajeEstado
