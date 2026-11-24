import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Boton from '../components/Boton'
import MensajeEstado from '../components/MensajeEstado'

export default function RegistroCandidato() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [edad, setEdad] = useState('')
  const [colonia, setColonia] = useState('')
  const [experiencia, setExperiencia] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [contrasenaRepetir, setContrasenaRepetir] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)

  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  const navigate = useNavigate()

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setExito('')

    const edadNumero = Number(edad)
    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !colonia.trim() || !experiencia.trim()) {
      setError('Por favor completa todos los campos obligatorios marcados con *.')
      return
    }
    if (!Number.isInteger(edadNumero) || edadNumero < 18 || edadNumero > 120) {
      setError('Ingresa una edad válida (entre 18 y 120 años).')
      return
    }
    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (contrasena !== contrasenaRepetir) {
      setError('Las contraseñas no coinciden. Revísalas e intenta de nuevo.')
      return
    }
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setError('Debes aceptar los términos y condiciones y el aviso de privacidad.')
      return
    }

    setEnviando(true)
    const { error: errorRegistro } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: {
        data: {
          rol: 'candidato',
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          edad: String(edadNumero),
          colonia: colonia.trim(),
          experiencia: experiencia.trim(),
        },
      },
    })

    setEnviando(false)

    if (errorRegistro) {
      if (errorRegistro.message.toLowerCase().includes('already registered')) {
        setError('Ya existe una cuenta registrada con ese correo electrónico.')
      } else {
        setError('No se pudo crear tu cuenta. Revisa tus datos e intenta de nuevo.')
      }
      return
    }

    setExito(
      '¡Tu cuenta fue creada! AMAC revisará y aprobará tu registro. Mientras tanto ya puedes explorar las vacantes.'
    )
    setTimeout(() => {
      navigate('/', { replace: true })
    }, 1800)
  }

  return (
    <div className="contenedor contenedor-angosto">
      <h1>Crear cuenta de candidato</h1>
      <p className="subtitulo">
        Llena tus datos. Los campos con * son obligatorios.
      </p>

      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{exito}</MensajeEstado>

      <form onSubmit={manejarEnvio} noValidate>
        <fieldset>
          <legend>1. ¿Cómo te contactamos?</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="correo">Correo electrónico *</label>
              <input
                type="email"
                id="correo"
                name="correo"
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="telefono">Teléfono celular *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="10 dígitos (ej. 81 1234 5678)"
                autoComplete="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Tus datos personales</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ejemplo: María López Hernández"
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="edad">Edad *</label>
              <input
                type="number"
                id="edad"
                name="edad"
                placeholder="Ejemplo: 65"
                min="18"
                max="120"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="colonia">Colonia *</label>
              <input
                type="text"
                id="colonia"
                name="colonia"
                placeholder="Ejemplo: Centro, Monterrey"
                value={colonia}
                onChange={(e) => setColonia(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>3. Experiencia laboral</legend>
          <div className="campo">
            <label htmlFor="experiencia">Cuéntanos tu experiencia *</label>
            <textarea
              id="experiencia"
              name="experiencia"
              placeholder="Ejemplo: 15 años como cajera y atención a clientes en tienda de abarrotes."
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
              required
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>4. Contraseña y términos</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="contrasena">Contraseña *</label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="contrasena-repetir">Repite tu contraseña *</label>
              <input
                type="password"
                id="contrasena-repetir"
                name="contrasena-repetir"
                placeholder="Escríbela otra vez"
                autoComplete="new-password"
                minLength={8}
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
            Acepto términos y condiciones *
          </label>
          <label className="opcion">
            <input
              type="checkbox"
              name="privacidad"
              checked={aceptaPrivacidad}
              onChange={(e) => setAceptaPrivacidad(e.target.checked)}
              required
            />
            Acepto el aviso de privacidad *
          </label>
        </fieldset>

        <div className="acciones">
          <Boton variante="primario" type="submit" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear mi cuenta'}
          </Boton>
        </div>

        <p className="seccion">
          AMAC revisará tu registro. Mientras tanto puedes ver vacantes, pero
          todavía no postularte hasta ser aprobado.
        </p>
        <Link className="enlace-volver" to="/login">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </form>
    </div>
  )
}
