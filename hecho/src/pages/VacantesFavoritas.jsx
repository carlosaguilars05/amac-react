import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import MensajeEstado from '../components/MensajeEstado'
import { formatearSueldo } from '../lib/constantes'

export default function VacantesFavoritas() {
  const { sesion } = useAuth()
  const [favoritos, setFavoritos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [quitandoId, setQuitandoId] = useState(null)

  const cargarFavoritos = useCallback(async () => {
    if (!sesion?.user?.id) return

    setCargando(true)
    setError('')

    const { data, error: errorCarga } = await supabase
      .from('favoritos')
      .select(
        'id, vacante_id, creado_en, vacante:vacantes(id, titulo, sueldo, ubicacion, horario, categoria, descripcion, estado, empresa:perfiles(nombre))'
      )
      .eq('candidato_id', sesion.user.id)
      .order('creado_en', { ascending: false })

    if (errorCarga) {
      console.error('Error al cargar favoritos:', errorCarga.message)
      setError('No pudimos cargar tus vacantes guardadas.')
    } else {
      setFavoritos(data || [])
    }

    setCargando(false)
  }, [sesion?.user?.id])

  useEffect(() => {
    cargarFavoritos()
  }, [cargarFavoritos])

  async function quitarFavorito(favoritoId) {
    setQuitandoId(favoritoId)
    setError('')
    setMensaje('')

    const { error: errorEliminar } = await supabase
      .from('favoritos')
      .delete()
      .eq('id', favoritoId)
      .eq('candidato_id', sesion.user.id)

    setQuitandoId(null)

    if (errorEliminar) {
      setError('No se pudo quitar la vacante de favoritos.')
      return
    }

    setMensaje('Quitaste la vacante de tus favoritos.')
    await cargarFavoritos()
  }

  return (
    <div className="contenedor contenedor-angosto">
      <div className="encabezado-pagina">
        <h1>Vacantes guardadas</h1>
        <p className="subtitulo">
          Aquí encuentras los empleos que guardaste para revisar después.
        </p>
      </div>

      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>

      {cargando && <p role="status">Cargando tus favoritos…</p>}

      {!cargando && favoritos.length === 0 && (
        <div className="estado-vacio">
          <p>Todavía no has guardado ninguna vacante en favoritos.</p>
          <Boton variante="primario" to="/">
            Explorar vacantes
          </Boton>
        </div>
      )}

      {!cargando && favoritos.length > 0 && (
        <div className="lista-tarjetas">
          {favoritos.map((item) => {
            const vacante = item.vacante

            if (!vacante) {
              return (
                <article className="tarjeta tarjeta-fila" key={item.id}>
                  <div>
                    <h2>Vacante no disponible</h2>
                    <p className="tarjeta-meta">
                      Esta vacante fue pausada o cerrada por la empresa.
                    </p>
                  </div>
                  <div className="acciones">
                    <Boton
                      variante="secundario"
                      disabled={quitandoId === item.id}
                      onClick={() => quitarFavorito(item.id)}
                    >
                      Quitar
                    </Boton>
                  </div>
                </article>
              )
            }

            return (
              <article className="tarjeta" key={item.id}>
                <h2>{vacante.titulo}</h2>
                <p className="tarjeta-empresa">
                  {vacante.empresa?.nombre || 'Empresa registrada'}
                </p>
                <p>
                  <strong>Sueldo: {formatearSueldo(vacante.sueldo)}</strong>
                </p>
                <p>
                  Ubicación: {vacante.ubicacion}
                  <br />
                  Horario: {vacante.horario} · Categoría: {vacante.categoria}
                </p>
                <p>{vacante.descripcion}</p>
                <div className="acciones-fila">
                  <Boton variante="primario" to={`/vacantes/${vacante.id}`}>
                    Ver vacante
                  </Boton>
                  <Boton
                    variante="secundario"
                    disabled={quitandoId === item.id}
                    onClick={() => quitarFavorito(item.id)}
                  >
                    {quitandoId === item.id ? 'Quitando…' : 'Quitar de favoritos'}
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
