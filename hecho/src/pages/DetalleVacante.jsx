import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import MensajeEstado from '../components/MensajeEstado'
import { formatearSueldo, limpiarTelefono } from '../lib/constantes'

export default function DetalleVacante() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sesion, perfil } = useAuth()

  const [vacante, setVacante] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [enviando, setEnviando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  const [mensajeInfo, setMensajeInfo] = useState('')

  const [solicitudExistente, setSolicitudExistente] = useState(null)
  const [esFavorito, setEsFavorito] = useState(false)
  const [guardandoFavorito, setGuardandoFavorito] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargarDetalle() {
      setCargando(true)
      setErrorCarga('')

      const { data, error } = await supabase
        .from('vacantes')
        .select('*, empresa:perfiles(nombre, giro)')
        .eq('id', id)
        .single()

      if (!activo) return

      if (error || !data) {
        setErrorCarga('No encontramos la vacante solicitada o ya no está disponible.')
        setVacante(null)
      } else {
        setVacante(data)
      }
      setCargando(false)
    }

    cargarDetalle()
    return () => {
      activo = false
    }
  }, [id])

  // Consultar si el candidato ya aplicó o guardó esta vacante como favorita
  useEffect(() => {
    if (!sesion?.user?.id || perfil?.rol !== 'candidato' || !vacante?.id) {
      setSolicitudExistente(null)
      setEsFavorito(false)
      return
    }

    let activo = true

    async function cargarEstadoCandidato() {
      const [resSolicitud, resFavorito] = await Promise.all([
        supabase
          .from('solicitudes')
          .select('id, estatus')
          .eq('vacante_id', vacante.id)
          .eq('candidato_id', sesion.user.id)
          .maybeSingle(),
        supabase
          .from('favoritos')
          .select('id')
          .eq('vacante_id', vacante.id)
          .eq('candidato_id', sesion.user.id)
          .maybeSingle(),
      ])

      if (!activo) return
      setSolicitudExistente(resSolicitud.data ?? null)
      setEsFavorito(Boolean(resFavorito.data))
    }

    cargarEstadoCandidato()
    return () => {
      activo = false
    }
  }, [sesion?.user?.id, perfil?.rol, vacante?.id])

  async function manejarPostulacion(e) {
    e.preventDefault()
    if (!sesion?.user?.id || !vacante) return

    setEnviando(true)
    setMensajeError('')
    setMensajeInfo('')

    // RF-004 y RF-054: PostgreSQL valida RLS (candidato aprobado) y UNIQUE(vacante_id, candidato_id)
    const { error } = await supabase.from('solicitudes').insert({
      vacante_id: vacante.id,
      candidato_id: sesion.user.id,
    })

    setEnviando(false)

    if (error?.code === '23505') {
      setMensajeError('Ya te postulaste a esta vacante.')
      return
    }

    if (error) {
      setMensajeError(
        'Tu registro aún no ha sido aprobado por AMAC. Por favor espera.'
      )
      return
    }

    navigate('/confirmacion', {
      state: {
        titulo: vacante.titulo,
        empresa: vacante.empresa?.nombre || 'la empresa',
      },
    })
  }

  async function alternarFavorito() {
    if (!sesion?.user?.id || !vacante) return
    setGuardandoFavorito(true)
    setMensajeError('')
    setMensajeInfo('')

    if (esFavorito) {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('vacante_id', vacante.id)
        .eq('candidato_id', sesion.user.id)

      if (!error) {
        setEsFavorito(false)
        setMensajeInfo('Quitaste esta vacante de tus favoritos.')
      }
    } else {
      const { error } = await supabase.from('favoritos').insert({
        vacante_id: vacante.id,
        candidato_id: sesion.user.id,
      })

      if (!error) {
        setEsFavorito(true)
        setMensajeInfo('¡Vacante guardada en tus favoritos!')
      }
    }

    setGuardandoFavorito(false)
  }

  if (cargando) {
    return (
      <div className="contenedor contenedor-angosto">
        <p role="status">Cargando detalle de la vacante…</p>
      </div>
    )
  }

  if (errorCarga || !vacante) {
    return (
      <div className="contenedor contenedor-angosto">
        <Link className="enlace-volver" to="/">
          &larr; Volver a vacantes
        </Link>
        <MensajeEstado tipo="error">{errorCarga}</MensajeEstado>
      </div>
    )
  }

  const listaRequisitos = (vacante.requisitos || '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)

  const listaPrestaciones = (vacante.prestaciones || '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)

  return (
    <div className="contenedor contenedor-angosto">
      <Link className="enlace-volver" to="/">
        &larr; Volver a vacantes
      </Link>

      <div className="encabezado-pagina">
        <h1>{vacante.titulo}</h1>
        <p className="subtitulo">
          {vacante.empresa?.nombre}
          {vacante.empresa?.giro ? ` · ${vacante.empresa.giro}` : ''}
        </p>
        {vacante.estado !== 'activa' && (
          <EtiquetaEstatus estatus={vacante.estado} />
        )}
      </div>

      <div className="info-vacante">
        <div>
          <p className="dato">Sueldo</p>
          <p>{formatearSueldo(vacante.sueldo)}</p>
        </div>
        <div>
          <p className="dato">Horario</p>
          <p>{vacante.horario}</p>
        </div>
        <div>
          <p className="dato">Ubicación</p>
          <p>{vacante.ubicacion}</p>
        </div>
        <div>
          <p className="dato">Categoría</p>
          <p>{vacante.categoria}</p>
        </div>
      </div>

      <section className="seccion">
        <h2>Descripción</h2>
        <p>{vacante.descripcion}</p>
      </section>

      <section className="seccion">
        <h2>Requisitos</h2>
        <ul>
          {listaRequisitos.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="seccion">
        <h2>Prestaciones</h2>
        <ul>
          {listaPrestaciones.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>

      {/* RF-051: Botón Llamar SOLO si la vacante tiene teléfono de contacto */}
      {vacante.telefono_contacto && (
        <div className="aviso">
          <p>
            Esta empresa también recibe postulaciones por teléfono:{' '}
            <strong>{vacante.telefono_contacto}</strong>
          </p>
          <div className="acciones">
            <Boton
              variante="secundario"
              href={`tel:${limpiarTelefono(vacante.telefono_contacto)}`}
            >
              Llamar
            </Boton>
          </div>
        </div>
      )}

      <section className="seccion">
        <MensajeEstado tipo="error">{mensajeError}</MensajeEstado>
        <MensajeEstado tipo="exito">{mensajeInfo}</MensajeEstado>

        {vacante.estado !== 'activa' ? (
          <MensajeEstado tipo="info">
            Esta vacante se encuentra {vacante.estado} y ya no recibe nuevas
            postulaciones.
          </MensajeEstado>
        ) : !perfil ? (
          <div className="aviso">
            <p>Inicia sesión con tu cuenta de candidato para postularte a este empleo.</p>
            <div className="acciones">
              <Boton
                variante="primario"
                to="/login"
                state={{ desde: `/vacantes/${vacante.id}` }}
              >
                Iniciar sesión
              </Boton>
              <Boton variante="secundario" to="/registro">
                Crear cuenta
              </Boton>
            </div>
          </div>
        ) : perfil.rol !== 'candidato' ? (
          <MensajeEstado tipo="info">
            Iniciaste sesión como {perfil.rol}. Solo las cuentas de candidato pueden
            postularse a vacantes.
          </MensajeEstado>
        ) : (
          <form onSubmit={manejarPostulacion}>
            {!perfil.aprobado && (
              <MensajeEstado tipo="aviso">
                Tu registro aún está pendiente de aprobación por AMAC. Hasta que sea
                aprobado no podrás enviar postulaciones.
              </MensajeEstado>
            )}

            {solicitudExistente && (
              <MensajeEstado tipo="info">
                Ya enviaste una solicitud a esta vacante (estatus actual:{' '}
                <strong>{solicitudExistente.estatus}</strong>).{' '}
                <Link to="/mis-solicitudes">Ver en Mis solicitudes</Link>.
              </MensajeEstado>
            )}

            <div className="acciones">
              <Boton variante="primario" type="submit" disabled={enviando}>
                {enviando ? 'Enviando solicitud…' : 'Postularme'}
              </Boton>

              <Boton
                variante="secundario"
                type="button"
                disabled={guardandoFavorito}
                onClick={alternarFavorito}
              >
                {esFavorito ? '★ Guardada en favoritos' : 'Guardar vacante'}
              </Boton>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
