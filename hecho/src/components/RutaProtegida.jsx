import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ rol, children }) {
  const { perfil, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="contenedor">
        <p role="status">Cargando…</p>
      </div>
    )
  }

  if (!perfil) {
    return <Navigate to="/login" state={{ desde: location.pathname }} replace />
  }

  if (rol) {
    const rolesPermitidos = Array.isArray(rol) ? rol : [rol]
    if (!rolesPermitidos.includes(perfil.rol)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
