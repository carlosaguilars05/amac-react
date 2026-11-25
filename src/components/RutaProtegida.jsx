import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RutaProtegida({ rol, children }) {
  const { perfil, cargando } = useAuth()

  if (cargando) return <p>Cargando...</p>
  if (!perfil) return <Navigate to="/login" replace />

  const tieneRol = perfil.rol === rol || (Array.isArray(rol) && rol.includes(perfil.rol))
  if (!tieneRol) return <Navigate to="/" replace />

  return children
}

export default RutaProtegida
