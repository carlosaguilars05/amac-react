import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import MensajeEstado from '../components/MensajeEstado'
import { formatearFecha, limpiarTelefono } from '../lib/constantes'

function SolicitudesRecibidas() {
  const { id } = useParams()
  const { sesion } = useAuth()

  const [vacante, setVacante] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [actualizandoId, setActualizandoId] = useState(null)

  async function cargarDatos() {
    setCargando(true)
    setError('')

    const { data: datosVacante, error: errorVacante } = await supabase
      .from('vacantes')
      .select('id, titulo, estado')
      .eq('id', id)
      .eq('empresa_id', sesion.user.id)
      .single()

    if (errorVacante) {
      setError('No encontramos esta vacante o no tienes permiso para ver sus solicitudes.')
      setCargando(false)
      return
    }
    setVacante(datosVacante)

    const { data, error: errorSolicitudes } = await supabase
      .from('solicitudes')
      .select(
        'id, estatus, creada_en, actualizado_en, candidato:perfiles(nombre, edad, colonia, experiencia, telefono)'
      )
      .eq('vacante_id', id)
      .neq('estatus', 'Cancelada')
      .order('creada_en', { ascending: false })

    if (errorSolicitudes) {
      setError('No pudimos cargar las solicitudes recibidas.')
    } else {
      setSolicitudes(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [id, sesion])

  async function cambiarEstatus(solicitud, nuevoEstatus) {
    setActualizandoId(solicitud.id)
    setError('')
    setMensaje('')

    const { data, error: errorUpdate } = await supabase
      .from('solicitudes')
      .update({ estatus: nuevoEstatus })
      .eq('id', solicitud.id)
      .select()

    setActualizandoId(null)

    if (errorUpdate || data.length === 0) {
      setError('No se pudo actualizar el estatus. Es posible que el candidato haya cancelado la solicitud.')
    } else {
      setMensaje(`La solicitud de ${solicitud.candidato.nombre} cambió a ${nuevoEstatus}.`)
    }
    cargarDatos()
  }

  return (
    <div className="contenedor contenedor-angosto">
      <Link className="enlace-volver" to="/empresa/vacantes">
        ← Volver a mis vacantes
      </Link>

      <div className="encabezado-pagina">
        <h1>Solicitudes recibidas</h1>
        {vacante && (
          <p className="subtitulo">
            Vacante: <strong>{vacante.titulo}</strong> <EtiquetaEstatus estatus={vacante.estado} />
          </p>
        )}
      </div>

      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>

      {cargando && <p>Cargando solicitudes…</p>}

      {!cargando && vacante && solicitudes.length === 0 && (
        <div className="estado-vacio">
          <p>Aún no has recibido postulaciones para esta vacante.</p>
        </div>
      )}

      {!cargando && solicitudes.length > 0 && (
        <div className="lista-tarjetas">
          {solicitudes.map((solicitud) => {
            const candidato = solicitud.candidato
            const ocupada = actualizandoId === solicitud.id

            return (
              <article className="tarjeta" key={solicitud.id}>
                <div className="encabezado-empresa">
                  <h2>{candidato.nombre}</h2>
                  <EtiquetaEstatus estatus={solicitud.estatus} />
                </div>

                <p>
                  <strong>Edad:</strong> {candidato.edad} años · <strong>Colonia:</strong> {candidato.colonia}
                </p>

                {candidato.telefono && (
                  <p>
                    <strong>Teléfono:</strong> <a href={`tel:${limpiarTelefono(candidato.telefono)}`}>{candidato.telefono}</a>
                  </p>
                )}

                <p>
                  <strong>Experiencia:</strong> {candidato.experiencia}
                </p>

                <p className="tarjeta-meta">Postulación: {formatearFecha(solicitud.creada_en)}</p>
                {solicitud.estatus !== 'Enviada' && (
                  <p className="tarjeta-meta">Último cambio: {formatearFecha(solicitud.actualizado_en)}</p>
                )}

                <div className="acciones-fila">
                  <Boton
                    variante="secundario"
                    disabled={ocupada || solicitud.estatus === 'En revisión'}
                    onClick={() => cambiarEstatus(solicitud, 'En revisión')}
                  >
                    En revisión
                  </Boton>
                  <Boton
                    variante="primario"
                    disabled={ocupada || solicitud.estatus === 'Aceptada'}
                    onClick={() => cambiarEstatus(solicitud, 'Aceptada')}
                  >
                    Aceptar
                  </Boton>
                  <Boton
                    variante="peligro"
                    disabled={ocupada || solicitud.estatus === 'Rechazada'}
                    onClick={() => cambiarEstatus(solicitud, 'Rechazada')}
                  >
                    Rechazar
                  </Boton>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SolicitudesRecibidas
