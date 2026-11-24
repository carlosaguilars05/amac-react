import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TarjetaVacante from '../components/TarjetaVacante'
import Boton from '../components/Boton'
import MensajeEstado from '../components/MensajeEstado'
import { CATEGORIAS, HORARIOS } from '../lib/constantes'

export default function ListadoVacantes() {
  const [vacantes, setVacantes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [horariosSeleccionados, setHorariosSeleccionados] = useState([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      if (!supabase) {
        setErrorCarga('Falta configurar la conexión con Supabase.')
        setCargando(false)
        return
      }

      setCargando(true)
      setErrorCarga('')

      let consulta = supabase
        .from('vacantes')
        .select('*, empresa:perfiles(nombre)')
        .eq('estado', 'activa')
        .order('creada_en', { ascending: false })

      const terminoLimpio = busqueda.replace(/[,()%]/g, ' ').trim()
      if (terminoLimpio) {
        consulta = consulta.or(
          `titulo.ilike.%${terminoLimpio}%,ubicacion.ilike.%${terminoLimpio}%`
        )
      }

      if (horariosSeleccionados.length > 0) {
        consulta = consulta.in('horario', horariosSeleccionados)
      }

      if (categoriasSeleccionadas.length > 0) {
        consulta = consulta.in('categoria', categoriasSeleccionadas)
      }

      const { data, error } = await consulta
      if (!activo) return

      if (error) {
        console.error('Error al cargar vacantes:', error.message)
        setErrorCarga('No pudimos cargar las vacantes. Intenta de nuevo en un momento.')
        setVacantes([])
      } else {
        setVacantes(data || [])
      }
      setCargando(false)
    }

    cargar()
    return () => {
      activo = false
    }
  }, [busqueda, horariosSeleccionados, categoriasSeleccionadas])

  function alternarElemento(lista, setter, valor) {
    if (lista.includes(valor)) {
      setter(lista.filter((item) => item !== valor))
    } else {
      setter([...lista, valor])
    }
  }

  function limpiarFiltros() {
    setBusqueda('')
    setHorariosSeleccionados([])
    setCategoriasSeleccionadas([])
  }

  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    horariosSeleccionados.length > 0 ||
    categoriasSeleccionadas.length > 0

  return (
    <div className="contenedor">
      <div className="encabezado-pagina">
        <h1>Encuentra tu próximo empleo</h1>
        <p className="subtitulo">
          Si necesitas ayuda, llama al 81 0000 0000 y te atendemos.
        </p>
      </div>

      <form
        className="buscador campo"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <label htmlFor="buscar">Buscar empleo</label>
        <input
          type="text"
          id="buscar"
          name="buscar"
          placeholder="Puesto o ubicación (ej. Cajero, Monterrey)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Boton variante="primario" type="submit">
          Buscar
        </Boton>
      </form>

      <div className="listado">
        <aside className="filtros" aria-label="Filtros de búsqueda">
          <h2>Filtros</h2>

          <fieldset className="grupo">
            <legend>Horario</legend>
            {HORARIOS.map((horario) => (
              <label className="opcion" key={horario}>
                <input
                  type="checkbox"
                  name="horario"
                  value={horario}
                  checked={horariosSeleccionados.includes(horario)}
                  onChange={() =>
                    alternarElemento(
                      horariosSeleccionados,
                      setHorariosSeleccionados,
                      horario
                    )
                  }
                />
                {horario}
              </label>
            ))}
          </fieldset>

          <fieldset className="grupo">
            <legend>Categoría</legend>
            {CATEGORIAS.map((categoria) => (
              <label className="opcion" key={categoria}>
                <input
                  type="checkbox"
                  name="categoria"
                  value={categoria}
                  checked={categoriasSeleccionadas.includes(categoria)}
                  onChange={() =>
                    alternarElemento(
                      categoriasSeleccionadas,
                      setCategoriasSeleccionadas,
                      categoria
                    )
                  }
                />
                {categoria}
              </label>
            ))}
          </fieldset>

          {hayFiltrosActivos && (
            <div className="acciones">
              <Boton variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            </div>
          )}
        </aside>

        <section className="lista-tarjetas" aria-live="polite">
          <h2>
            {cargando
              ? 'Vacantes disponibles'
              : `${vacantes.length} ${
                  vacantes.length === 1
                    ? 'vacante disponible'
                    : 'vacantes disponibles'
                }`}
          </h2>

          <MensajeEstado tipo="error">{errorCarga}</MensajeEstado>

          {cargando && <p role="status">Cargando vacantes…</p>}

          {!cargando && !errorCarga && vacantes.length === 0 && (
            <div className="estado-vacio">
              <p>No hay vacantes para mostrar.</p>
              {hayFiltrosActivos && (
                <Boton variante="secundario" onClick={limpiarFiltros}>
                  Ver todas las vacantes
                </Boton>
              )}
            </div>
          )}

          {!cargando &&
            vacantes.map((vacante) => (
              <TarjetaVacante key={vacante.id} vacante={vacante} />
            ))}
        </section>
      </div>
    </div>
  )
}
