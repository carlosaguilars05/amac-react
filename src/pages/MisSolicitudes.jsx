import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import MensajeEstado from '../components/MensajeEstado'
import { formatearFecha } from '../lib/constantes'

function MisSolicitudes() {
  const { sesion } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cancelandoId, setCancelandoId] = useState(null)

  const cargarSolicitudes = useCallback(async () => {
    if (!sesion?.user?.id) return

    setCargando(true)
    setErrorCarga('')

    const { data, error } = await supabase
      .from('solicitudes')
      .select(
        'id, estatus, creada_en, actualizado_en, vacante:vacantes(id, titulo, estado, empresa:perfiles(nombre))'
      )
      .eq('candidato_id', sesion.user.id)
      .order('creada_en', { ascending: false })

    if (error) {
      console.error('Error al cargar solicitudes:', error.message)
      setErrorCarga('No pudimos cargar tus solicitudes. Intenta de nuevo.')
    } else {
      setSolicitudes(data || [])
    }
    setCargando(false)
  }, [sesion?.user?.id])

  useEffect(() => {
    cargarSolicitudes()
  }, [cargarSolicitudes])

  async function manejarCancelar(solicitud) {
    // RF-006: pedir confirmación antes de cancelar
    const confirmado = window.confirm(
      `¿Seguro que quieres cancelar tu solicitud para "${solicitud.vacante?.titulo || 'esta vacante'}"?`
    )
    if (!confirmado) return

    setCancelandoId(solicitud.id)
    setErrorCarga('')
    setMensaje('')

    const { data, error } = await supabase
      .from('solicitudes')
      .update({ estatus: 'Cancelada' })
      .eq('id', solicitud.id)
      .select('id, estatus, actualizado_en')

    setCancelandoId(null)

    if (error || !data || data.length === 0) {
      setErrorCarga(
        'No se puede cancelar esta solicitud porque ya fue aceptada o rechazada por la empresa.'
      )
      await cargarSolicitudes()
      return
    }

    setMensaje('Tu solicitud fue cancelada.')
    await cargarSolicitudes()
  }

  return (
    <div className="contenedor contenedor-angosto">
      <div className="encabezado-pagina">
        <h1>Mis solicitudes</h1>
        <p className="subtitulo">
          Aquí ves cómo va cada empleo al que te postulaste.
        </p>
      </div>

      <MensajeEstado tipo="error">{errorCarga}</MensajeEstado>
      <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>

      {cargando && <p role="status">Cargando tus solicitudes…</p>}

      {!cargando && solicitudes.length === 0 && (
        <div className="estado-vacio">
          <p>Todavía no te has postulado a ninguna vacante.</p>
          <Boton variante="primario" to="/">
            Explorar vacantes
          </Boton>
        </div>
      )}

      {!cargando && solicitudes.length > 0 && (
        <div className="lista-tarjetas">
          {solicitudes.map((solicitud) => {
            const puedeCancelar =
              solicitud.estatus === 'Enviada' ||
              solicitud.estatus === 'En revisión'
            const tituloVacante = solicitud.vacante?.titulo || 'Vacante'

            return (
              <article className="tarjeta tarjeta-fila" key={solicitud.id}>
                <div>
                  <h2>
                    {solicitud.vacante?.id ? (
                      <Link to={`/vacantes/${solicitud.vacante.id}`}>
                        {tituloVacante}
                      </Link>
                    ) : (
                      tituloVacante
                    )}
                  </h2>
                  <p>
                    Empresa: {solicitud.vacante?.empresa?.nombre || 'Empresa registrada'}
                  </p>
                  <p>Fecha de postulación: {formatearFecha(solicitud.creada_en)}</p>
                  {solicitud.actualizado_en &&
                    solicitud.estatus !== 'Enviada' && (
                      <p className="tarjeta-meta">
                        Último cambio de estatus:{' '}
                        {formatearFecha(solicitud.actualizado_en)}
                      </p>
                    )}
                  {solicitud.vacante?.estado &&
                    solicitud.vacante.estado !== 'activa' && (
                      <p className="tarjeta-meta">
                        Estado de la vacante: {solicitud.vacante.estado}
                      </p>
                    )}
                  <EtiquetaEstatus estatus={solicitud.estatus} />
                </div>

                {puedeCancelar && (
                  <div className="acciones">
                    <Boton
                      variante="secundario"
                      disabled={cancelandoId === solicitud.id}
                      onClick={() => manejarCancelar(solicitud)}
                    >
                      {cancelandoId === solicitud.id ? 'Cancelando…' : 'Cancelar'}
                    </Boton>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MisSolicitudes
