import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined) // undefined = todavía no sabemos
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  // 1) Escuchar la sesión: al abrir la página, al iniciar y al cerrar sesión
  useEffect(() => {
    if (!supabase) {
      setSesion(null)
      setCargando(false)
      return
    }

    let activo = true

    supabase.auth.getSession().then(({ data }) => {
      if (activo) setSesion(data.session ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      if (activo) setSesion(nuevaSesion ?? null)
    })

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [])

  const usuarioId = sesion?.user?.id ?? null
  const sesionLista = sesion !== undefined

  // Función reutilizable para consultar o recargar el perfil desde PostgreSQL
  const cargarPerfil = useCallback(async (id) => {
    if (!supabase || !id) {
      setPerfil(null)
      setCargando(false)
      return null
    }

    setCargando(true)
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error al cargar el perfil:', error.message)
      setPerfil(null)
    } else {
      setPerfil(data)
    }
    setCargando(false)
    return data ?? null
  }, [])

  // 2) Cada vez que cambia la sesión, cargar el perfil (rol, nombre, aprobado...)
  useEffect(() => {
    if (!sesionLista) return
    if (!usuarioId) {
      setPerfil(null)
      setCargando(false)
      return
    }
    cargarPerfil(usuarioId)
  }, [sesionLista, usuarioId, cargarPerfil])

  const recargarPerfil = useCallback(async () => {
    if (!usuarioId) return null
    return cargarPerfil(usuarioId)
  }, [usuarioId, cargarPerfil])

  const cerrarSesion = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setPerfil(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        sesion,
        perfil,
        cargando,
        recargarPerfil,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
