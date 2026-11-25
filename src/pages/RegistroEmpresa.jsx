import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Boton from '../components/Boton'
import MensajeEstado from '../components/MensajeEstado'

function RegistroEmpresa() {
  const [nombre, setNombre] = useState('')
  const [giro, setGiro] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [contrasenaRepetir, setContrasenaRepetir] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const navigate = useNavigate()

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    if (!nombre.trim() || !giro.trim() || !telefono.trim() || !correo.trim()) {
      setError('Por favor completa todos los campos obligatorios marcados con *.')
      return
    }
    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (contrasena !== contrasenaRepetir) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones para registrar tu empresa.')
      return
    }

    setEnviando(true)
    const { error: errorRegistro } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: {
        data: {
          rol: 'empresa',
          nombre: nombre.trim(),
          giro: giro.trim(),
          telefono: telefono.trim(),
        },
      },
    })

    setEnviando(false)

    if (errorRegistro) {
      setError('No se pudo registrar la empresa. Revisa tus datos o intenta con otro correo.')
      return
    }

    navigate('/empresa/vacantes')
  }

  return (
    <div className="contenedor contenedor-angosto">
      <h1>Registrar mi empresa</h1>
      <p className="subtitulo">
        Publica vacantes y recibe postulaciones de personas adultas mayores. Los
        campos con * son obligatorios.
      </p>

      <MensajeEstado tipo="error">{error}</MensajeEstado>

      <form onSubmit={manejarEnvio}>
        <fieldset>
          <legend>1. Datos de la empresa</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="nombre-empresa">Nombre de la empresa *</label>
              <input
                type="text"
                id="nombre-empresa"
                name="nombre"
                placeholder="Ejemplo: OXXO o Clínica San José"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="giro">Giro *</label>
              <input
                type="text"
                id="giro"
                name="giro"
                placeholder="Ejemplo: Comercio, Salud, Servicios"
                value={giro}
                onChange={(e) => setGiro(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="telefono-empresa">Teléfono de contacto *</label>
              <input
                type="tel"
                id="telefono-empresa"
                name="telefono"
                placeholder="10 dígitos (ej. 81 1234 5678)"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="correo-empresa">Correo electrónico *</label>
              <input
                type="email"
                id="correo-empresa"
                name="correo"
                placeholder="rh@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Contraseña de acceso</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="contrasena-empresa">Contraseña *</label>
              <input
                type="password"
                id="contrasena-empresa"
                name="contrasena"
                placeholder="Mínimo 8 caracteres"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="contrasena-empresa-repetir">
                Repite la contraseña *
              </label>
              <input
                type="password"
                id="contrasena-empresa-repetir"
                name="contrasena-repetir"
                placeholder="Escríbela otra vez"
                value={contrasenaRepetir}
                onChange={(e) => setContrasenaRepetir(e.target.value)}
                required
              />
            </div>
          </div>

          <label className="opcion">
            <input
              type="checkbox"
              name="terminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              required
            />
            Acepto los términos y condiciones de AMAC *
          </label>
        </fieldset>

        <div className="acciones">
          <Boton variante="primario" type="submit" disabled={enviando}>
            {enviando ? 'Registrando empresa…' : 'Registrar empresa'}
          </Boton>
        </div>

        <Link className="enlace-volver" to="/login">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </form>
    </div>
  )
}

export default RegistroEmpresa
