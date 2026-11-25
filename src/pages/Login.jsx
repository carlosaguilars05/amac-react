import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Boton from '../components/Boton'
import MensajeEstado from '../components/MensajeEstado'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  const navigate = useNavigate()

  async function manejarEnvio(e) {
    e.preventDefault()
    setMensaje('')

    if (!correo.trim() || !contrasena) {
      setMensaje('Por favor ingresa tu correo y tu contraseña.')
      return
    }

    setEnviando(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    })

    if (error) {
      setMensaje('Correo o contraseña incorrectos.')
      setEnviando(false)
      return
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    setEnviando(false)

    const volverA = localStorage.getItem('volverA')
    localStorage.removeItem('volverA')

    if (volverA) {
      navigate(volverA)
    } else if (perfil?.rol === 'empresa') {
      navigate('/empresa/vacantes')
    } else if (perfil?.rol === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="principal-azul">
      <div className="contenedor contenedor-chico">
        <div className="panel">
          <h1>Iniciar sesión</h1>
          <p className="subtitulo">Escribe tu correo y tu contraseña.</p>

          <MensajeEstado tipo="error">{mensaje}</MensajeEstado>

          <form onSubmit={manejarEnvio}>
            <div className="rejilla-campos">
              <div className="campo">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  placeholder="Escribe tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="acciones">
              <Boton variante="primario" type="submit" disabled={enviando}>
                {enviando ? 'Entrando…' : 'Entrar'}
              </Boton>
            </div>
          </form>

          <h2 className="seccion">¿No tienes cuenta?</h2>
          <div className="acciones">
            <Boton variante="secundario" to="/registro">
              Crear cuenta de candidato
            </Boton>
            <Boton variante="secundario" to="/registro-empresa">
              Registrar mi empresa
            </Boton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
