import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
    })

    return () => subscription.unsubscribe()
  }, [])

  const sesionLista = sesion !== undefined
  const usuarioId = sesion?.user.id

  async function cargarPerfil() {
    setCargando(true)
    const { data } = await supabase.from('perfiles').select('*').eq('id', usuarioId).single()
    setPerfil(data)
    setCargando(false)
  }

  useEffect(() => {
    if (!sesionLista) return
    if (!usuarioId) {
      setPerfil(null)
      setCargando(false)
      return
    }
    cargarPerfil()
  }, [sesionLista, usuarioId])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    setPerfil(null)
  }

  return (
    <AuthContext.Provider
      value={{ sesion, perfil, cargando, recargarPerfil: cargarPerfil, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
