import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import MensajeEstado from '../components/MensajeEstado'
import { formatearFecha, limpiarTelefono } from '../lib/constantes'

function PanelAdmin() {
  const [candidatos, setCandidatos] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)

  async function cargarCandidatos() {
    setCargando(true)
    setError('')

    const { data, error: errorCarga } = await supabase
      .from('perfiles')
      .select('id, nombre, telefono, edad, colonia, experiencia, aprobado, creado_en')
      .eq('rol', 'candidato')
      .order('aprobado', { ascending: true })
      .order('creado_en', { ascending: false })

    if (errorCarga) {
      setError('No pudimos cargar la lista de candidatos.')
    } else {
      setCandidatos(data)
    }

    setCargando(false)
  }

  useEffect(() => {
    cargarCandidatos()
  }, [])

  async function cambiarAprobacion(candidato, nuevoEstado) {
    if (!nuevoEstado) {
      const confirmado = window.confirm(
        `¿Seguro que quieres revocar la aprobación de ${candidato.nombre}? Ya no podrá enviar nuevas postulaciones.`
      )
      if (!confirmado) return
    }

    setProcesandoId(candidato.id)
    setError('')
    setMensaje('')

    const { error: errorRpc } = await supabase.rpc('aprobar_candidato', {
      cid: candidato.id,
      nuevo_estado: nuevoEstado,
    })

    setProcesandoId(null)

    if (errorRpc) {
      setError('No se pudo actualizar el estado del candidato.')
      return
    }

    setMensaje(
      nuevoEstado
        ? `${candidato.nombre} fue aprobado y ya puede postularse a vacantes.`
        : `Se revocó la aprobación de ${candidato.nombre}.`
    )
    await cargarCandidatos()
  }

  const pendientes = candidatos.filter((c) => !c.aprobado).length
  const aprobados = candidatos.filter((c) => c.aprobado).length

  const listaFiltrada = candidatos.filter((c) => {
    if (filtro === 'pendientes') return !c.aprobado
    if (filtro === 'aprobados') return c.aprobado
    return true
  })

  return (
    <div className="contenedor contenedor-angosto">
      <div className="encabezado-pagina">
        <h1>Panel de administración AMAC</h1>
        <p className="subtitulo">
          Revisa los registros de candidatos y aprueba sus cuentas para que puedan
          postularse (RF-054).
        </p>
      </div>

      <div className="acciones-fila">
        <Boton
          variante={filtro === 'todos' ? 'primario' : 'secundario'}
          chico
          onClick={() => setFiltro('todos')}
        >
          Todos ({candidatos.length})
        </Boton>
        <Boton
          variante={filtro === 'pendientes' ? 'primario' : 'secundario'}
          chico
          onClick={() => setFiltro('pendientes')}
        >
          Pendientes ({pendientes})
        </Boton>
        <Boton
          variante={filtro === 'aprobados' ? 'primario' : 'secundario'}
          chico
          onClick={() => setFiltro('aprobados')}
        >
          Aprobados ({aprobados})
        </Boton>
      </div>

      <div className="seccion">
        <MensajeEstado tipo="error">{error}</MensajeEstado>
        <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
      </div>

      {cargando && <p>Cargando candidatos…</p>}

      {!cargando && listaFiltrada.length === 0 && (
        <div className="estado-vacio seccion">
          <p>No hay candidatos en esta categoría.</p>
        </div>
      )}

      {!cargando && listaFiltrada.length > 0 && (
        <div className="lista-tarjetas seccion">
          {listaFiltrada.map((candidato) => {
            const ocupado = procesandoId === candidato.id

            return (
              <article className="tarjeta" key={candidato.id}>
                <div className="encabezado-empresa">
                  <h2>{candidato.nombre}</h2>
                  <EtiquetaEstatus
                    estatus={candidato.aprobado ? 'aprobado' : 'pendiente'}
                  />
                </div>

                <p>
                  <strong>Edad:</strong> {candidato.edad ? `${candidato.edad} años` : 'No registrada'} · <strong>Colonia:</strong> {candidato.colonia || 'No registrada'}
                </p>

                {candidato.telefono && (
                  <p>
                    <strong>Teléfono:</strong> <a href={`tel:${limpiarTelefono(candidato.telefono)}`}>
                      {candidato.telefono}
                    </a>
                  </p>
                )}

                <p>
                  <strong>Experiencia:</strong> {candidato.experiencia || 'Sin descripción'}
                </p>

                <p className="tarjeta-meta">
                  Registrado el {formatearFecha(candidato.creado_en)}
                </p>

                <div className="acciones-fila">
                  {!candidato.aprobado ? (
                    <Boton
                      variante="primario"
                      disabled={ocupado}
                      onClick={() => cambiarAprobacion(candidato, true)}
                    >
                      {ocupado ? 'Aprobando…' : 'Aprobar candidato'}
                    </Boton>
                  ) : (
                    <Boton
                      variante="secundario"
                      disabled={ocupado}
                      onClick={() => cambiarAprobacion(candidato, false)}
                    >
                      {ocupado ? 'Actualizando…' : 'Revocar aprobación'}
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

export default PanelAdmin
