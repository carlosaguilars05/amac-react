import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import MensajeEstado from '../components/MensajeEstado'
import { formatearFecha } from '../lib/constantes'

function EmpresaVacantes() {
  const { sesion, perfil } = useAuth()
  const location = useLocation()

  const [vacantes, setVacantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '')
  const [actualizandoId, setActualizandoId] = useState(null)

  const cargarVacantes = useCallback(async () => {
    if (!sesion?.user?.id) return

    setCargando(true)
    setError('')

    const { data, error: errorCarga } = await supabase
      .from('vacantes')
      .select('id, titulo, estado, creada_en, solicitudes(id, estatus)')
      .eq('empresa_id', sesion.user.id)
      .order('creada_en', { ascending: false })

    if (errorCarga) {
      console.error('Error al cargar vacantes de empresa:', errorCarga.message)
      setError('No pudimos cargar tus vacantes. Intenta de nuevo.')
    } else {
      setVacantes(data || [])
    }
    setCargando(false)
  }, [sesion?.user?.id])

  useEffect(() => {
    cargarVacantes()
  }, [cargarVacantes])

  async function cambiarEstado(vacante, nuevoEstado) {
    if (nuevoEstado === 'cerrada') {
      const confirmado = window.confirm(
        `¿Seguro que quieres cerrar la vacante "${vacante.titulo}"? Ya no aparecerá en el listado público.`
      )
      if (!confirmado) return
    }

    setActualizandoId(vacante.id)
    setError('')
    setMensaje('')

    const { error: errorUpdate } = await supabase
      .from('vacantes')
      .update({ estado: nuevoEstado })
      .eq('id', vacante.id)
      .eq('empresa_id', sesion.user.id)

    setActualizandoId(null)

    if (errorUpdate) {
      setError('No se pudo actualizar el estado de la vacante.')
      return
    }

    const etiquetas = {
      activa: 'reactivada y visible en el listado público',
      pausada: 'pausada y oculta del listado público',
      cerrada: 'cerrada',
    }
    setMensaje(`La vacante "${vacante.titulo}" fue ${etiquetas[nuevoEstado]}.`)
    await cargarVacantes()
  }

  return (
    <div className="contenedor contenedor-angosto">
      <div className="encabezado-pagina encabezado-empresa">
        <div>
          <h1>Mis vacantes</h1>
          <p className="subtitulo">{perfil?.nombre}</p>
        </div>
        <div className="acciones">
          <Boton variante="primario" to="/empresa/publicar">
            + Publicar vacante
          </Boton>
        </div>
      </div>

      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>

      {cargando && <p role="status">Cargando tus vacantes…</p>}

      {!cargando && vacantes.length === 0 && (
        <div className="estado-vacio">
          <p>Todavía no has publicado ninguna vacante.</p>
          <Boton variante="primario" to="/empresa/publicar">
            Publicar mi primera vacante
          </Boton>
        </div>
      )}

      {!cargando && vacantes.length > 0 && (
        <div className="lista-tarjetas">
          {vacantes.map((vacante) => {
            const totalSolicitudes = (vacante.solicitudes || []).filter(
              (s) => s.estatus !== 'Cancelada'
            ).length
            const ocupada = actualizandoId === vacante.id

            return (
              <article className="tarjeta tarjeta-fila" key={vacante.id}>
                <div>
                  <h2>
                    <Link to={`/vacantes/${vacante.id}`}>{vacante.titulo}</Link>
                  </h2>
                  <p>Publicada el {formatearFecha(vacante.creada_en)}</p>
                  <p>
                    {totalSolicitudes}{' '}
                    {totalSolicitudes === 1 ? 'solicitud' : 'solicitudes'}
                  </p>
                  <EtiquetaEstatus estatus={vacante.estado} />
                </div>

                <div className="acciones-fila">
                  <Boton
                    variante="primario"
                    to={`/empresa/vacantes/${vacante.id}/solicitudes`}
                  >
                    Ver solicitudes
                  </Boton>

                  {vacante.estado !== 'cerrada' && (
                    <Boton
                      variante="secundario"
                      to={`/empresa/vacantes/${vacante.id}/editar`}
                    >
                      Editar
                    </Boton>
                  )}

                  {vacante.estado === 'activa' && (
                    <Boton
                      variante="secundario"
                      disabled={ocupada}
                      onClick={() => cambiarEstado(vacante, 'pausada')}
                    >
                      Pausar
                    </Boton>
                  )}

                  {vacante.estado === 'pausada' && (
                    <Boton
                      variante="secundario"
                      disabled={ocupada}
                      onClick={() => cambiarEstado(vacante, 'activa')}
                    >
                      Reactivar
                    </Boton>
                  )}

                  {vacante.estado !== 'cerrada' && (
                    <Boton
                      variante="secundario"
                      disabled={ocupada}
                      onClick={() => cambiarEstado(vacante, 'cerrada')}
                    >
                      Cerrar
                    </Boton>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EmpresaVacantes
