import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import MensajeEstado from '../components/MensajeEstado'

export default function MiPerfil() {
  const { sesion, perfil, recargarPerfil } = useAuth()
  const esEmpresa = perfil?.rol === 'empresa'

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [edad, setEdad] = useState('')
  const [colonia, setColonia] = useState('')
  const [experiencia, setExperiencia] = useState('')
  const [giro, setGiro] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    if (!perfil) return
    setNombre(perfil.nombre || '')
    setTelefono(perfil.telefono || '')
    setEdad(perfil.edad != null ? String(perfil.edad) : '')
    setColonia(perfil.colonia || '')
    setExperiencia(perfil.experiencia || '')
    setGiro(perfil.giro || '')
  }, [perfil])

  async function manejarGuardar(e) {
    e.preventDefault()
    setError('')
    setExito('')

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    let cambios = {
      nombre: nombre.trim(),
      telefono: telefono.trim() || null,
    }

    if (esEmpresa) {
      if (!giro.trim()) {
        setError('El giro de la empresa es obligatorio.')
        return
      }
      cambios = {
        ...cambios,
        giro: giro.trim(),
      }
    } else {
      const edadNumero = Number(edad)
      if (!Number.isInteger(edadNumero) || edadNumero < 18 || edadNumero > 120) {
        setError('Ingresa una edad válida (entre 18 y 120 años).')
        return
      }
      if (!colonia.trim()) {
        setError('La colonia es obligatoria.')
        return
      }
      cambios = {
        ...cambios,
        edad: edadNumero,
        colonia: colonia.trim(),
        experiencia: experiencia.trim() || null,
      }
    }

    setGuardando(true)
    const { error: errorUpdate } = await supabase
      .from('perfiles')
      .update(cambios)
      .eq('id', sesion.user.id)

    setGuardando(false)

    if (errorUpdate) {
      console.error('Error al actualizar perfil:', errorUpdate.message)
      setError('No pudimos guardar los cambios de tu perfil.')
      return
    }

    await recargarPerfil()
    setExito('¡Tus datos se actualizaron correctamente!')
  }

  return (
    <div className="contenedor contenedor-angosto">
      <div className="encabezado-pagina">
        <h1>Mi perfil</h1>
        <p className="subtitulo">
          {esEmpresa
            ? 'Actualiza la información pública de tu empresa.'
            : 'Mantén tus datos actualizados para tus postulaciones.'}
        </p>
        {!esEmpresa && (
          <EtiquetaEstatus
            estatus={perfil?.aprobado ? 'aprobado' : 'pendiente'}
          />
        )}
      </div>

      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{exito}</MensajeEstado>

      <form onSubmit={manejarGuardar} noValidate>
        <fieldset>
          <legend>Información de la cuenta</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="correo-solo-lectura">Correo electrónico</label>
              <input
                type="email"
                id="correo-solo-lectura"
                value={sesion?.user?.email || ''}
                disabled
              />
            </div>
            <div className="campo">
              <label htmlFor="perfil-nombre">
                {esEmpresa ? 'Nombre de la empresa *' : 'Nombre completo *'}
              </label>
              <input
                type="text"
                id="perfil-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="perfil-telefono">Teléfono</label>
              <input
                type="tel"
                id="perfil-telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {esEmpresa ? (
              <div className="campo">
                <label htmlFor="perfil-giro">Giro *</label>
                <input
                  type="text"
                  id="perfil-giro"
                  value={giro}
                  onChange={(e) => setGiro(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="campo">
                  <label htmlFor="perfil-edad">Edad *</label>
                  <input
                    type="number"
                    id="perfil-edad"
                    min="18"
                    max="120"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="perfil-colonia">Colonia *</label>
                  <input
                    type="text"
                    id="perfil-colonia"
                    value={colonia}
                    onChange={(e) => setColonia(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>

          {!esEmpresa && (
            <div className="campo seccion">
              <label htmlFor="perfil-experiencia">Experiencia laboral</label>
              <textarea
                id="perfil-experiencia"
                value={experiencia}
                onChange={(e) => setExperiencia(e.target.value)}
              />
            </div>
          )}
        </fieldset>

        <div className="acciones">
          <Boton variante="primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando cambios…' : 'Guardar cambios'}
          </Boton>
        </div>
      </form>
    </div>
  )
}
