import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Boton from '../components/Boton'
import MensajeEstado from '../components/MensajeEstado'
import { CATEGORIAS, HORARIOS } from '../lib/constantes'

function PublicarVacante() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  const { sesion, perfil } = useAuth()

  const [titulo, setTitulo] = useState('')
  const [sueldo, setSueldo] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [horario, setHorario] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [requisitos, setRequisitos] = useState('')
  const [prestaciones, setPrestaciones] = useState('')
  const [aceptaTelefono, setAceptaTelefono] = useState(false)
  const [telefonoContacto, setTelefonoContacto] = useState('')

  const [cargando, setCargando] = useState(esEdicion)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!esEdicion || !sesion?.user?.id) return

    let activo = true
    async function cargarVacante() {
      setCargando(true)
      const { data, error: errorCarga } = await supabase
        .from('vacantes')
        .select('*')
        .eq('id', id)
        .eq('empresa_id', sesion.user.id)
        .single()

      if (!activo) return

      if (errorCarga || !data) {
        setError('No encontramos la vacante o no tienes permiso para editarla.')
      } else {
        setTitulo(data.titulo || '')
        setSueldo(String(data.sueldo ?? ''))
        setUbicacion(data.ubicacion || '')
        setHorario(data.horario || '')
        setCategoria(data.categoria || '')
        setDescripcion(data.descripcion || '')
        setRequisitos(data.requisitos || '')
        setPrestaciones(data.prestaciones || '')
        setAceptaTelefono(Boolean(data.telefono_contacto))
        setTelefonoContacto(data.telefono_contacto || '')
      }
      setCargando(false)
    }

    cargarVacante()
    return () => {
      activo = false
    }
  }, [esEdicion, id, sesion?.user?.id])

  function manejarToggleTelefono(marcado) {
    setAceptaTelefono(marcado)
    if (marcado && !telefonoContacto && perfil?.telefono) {
      setTelefonoContacto(perfil.telefono)
    }
    if (!marcado) {
      setTelefonoContacto('')
    }
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    const sueldoNumero = Number(sueldo)
    if (
      !titulo.trim() ||
      !ubicacion.trim() ||
      !horario ||
      !categoria ||
      !descripcion.trim() ||
      !requisitos.trim() ||
      !prestaciones.trim()
    ) {
      setError('Por favor completa todos los campos obligatorios marcados con *.')
      return
    }

    if (Number.isNaN(sueldoNumero) || sueldoNumero <= 0) {
      setError('El sueldo mensual debe ser un número mayor a 0.')
      return
    }

    // RF-019: el teléfono solo se pide y guarda si la empresa elige postulaciones por teléfono
    if (aceptaTelefono && !telefonoContacto.trim()) {
      setError(
        'Ingresa el teléfono de contacto o desmarca la opción de postulaciones por teléfono.'
      )
      return
    }

    const datosVacante = {
      titulo: titulo.trim(),
      sueldo: sueldoNumero,
      ubicacion: ubicacion.trim(),
      horario,
      categoria,
      descripcion: descripcion.trim(),
      requisitos: requisitos.trim(),
      prestaciones: prestaciones.trim(),
      telefono_contacto: aceptaTelefono ? telefonoContacto.trim() : null,
    }

    setEnviando(true)
    let errorGuardado = null

    if (esEdicion) {
      const res = await supabase
        .from('vacantes')
        .update(datosVacante)
        .eq('id', id)
        .eq('empresa_id', sesion.user.id)
      errorGuardado = res.error
    } else {
      const res = await supabase.from('vacantes').insert({
        ...datosVacante,
        empresa_id: sesion.user.id,
      })
      errorGuardado = res.error
    }

    setEnviando(false)

    if (errorGuardado) {
      console.error('Error al guardar vacante:', errorGuardado.message)
      setError('No se pudo guardar la vacante. Revisa los datos e intenta de nuevo.')
      return
    }

    navigate('/empresa/vacantes', {
      replace: true,
      state: {
        mensaje: esEdicion
          ? 'La vacante fue actualizada correctamente.'
          : '¡Vacante publicada correctamente! Ya aparece en el listado público.',
      },
    })
  }

  if (cargando) {
    return (
      <div className="contenedor contenedor-angosto">
        <p role="status">Cargando vacante…</p>
      </div>
    )
  }

  return (
    <div className="contenedor contenedor-angosto">
      <Link className="enlace-volver" to="/empresa/vacantes">
        &larr; Volver a mis vacantes
      </Link>

      <div className="encabezado-pagina">
        <h1>{esEdicion ? 'Editar vacante' : 'Publicar vacante'}</h1>
        <p className="subtitulo">
          {perfil?.nombre} · Los campos con * son obligatorios.
        </p>
      </div>

      <MensajeEstado tipo="error">{error}</MensajeEstado>

      <form onSubmit={manejarEnvio} noValidate>
        <fieldset>
          <legend>1. Información general</legend>
          <div className="rejilla-campos">
            <div className="campo">
              <label htmlFor="titulo">Nombre del puesto *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                placeholder="Ejemplo: Cajero, Recepcionista"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="sueldo">Sueldo mensual (MXN) *</label>
              <input
                type="number"
                id="sueldo"
                name="sueldo"
                placeholder="Ejemplo: 8500"
                min="1"
                step="0.01"
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="ubicacion">Ubicación *</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                placeholder="Ejemplo: Av. Constitución 100, Monterrey"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="horario">Horario *</label>
              <select
                id="horario"
                name="horario"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              >
                <option value="">Selecciona un horario</option>
                {HORARIOS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Detalles del puesto</legend>
          <div className="campo">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              placeholder="Describe las actividades principales del puesto en lenguaje claro y sencillo."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>

          <div className="campo seccion">
            <label htmlFor="requisitos">Requisitos *</label>
            <textarea
              id="requisitos"
              name="requisitos"
              placeholder={'Saber leer y hacer cuentas sencillas\nTrato amable con las personas'}
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
              required
            />
            <p className="campo-ayuda">
              Escribe un requisito por línea para mostrarlos como lista.
            </p>
          </div>

          <div className="campo seccion">
            <label htmlFor="prestaciones">Prestaciones *</label>
            <textarea
              id="prestaciones"
              name="prestaciones"
              placeholder={'Prestaciones de ley\nVales de despensa\nCapacitación pagada'}
              value={prestaciones}
              onChange={(e) => setPrestaciones(e.target.value)}
              required
            />
            <p className="campo-ayuda">
              Escribe una prestación por línea para mostrarlas como lista.
            </p>
          </div>
        </fieldset>

        <fieldset>
          <legend>3. Postulaciones por teléfono (opcional)</legend>
          <label className="opcion">
            <input
              type="checkbox"
              name="acepta-telefono"
              checked={aceptaTelefono}
              onChange={(e) => manejarToggleTelefono(e.target.checked)}
            />
            También recibir postulaciones por llamada telefónica
          </label>

          {aceptaTelefono && (
            <div className="campo">
              <label htmlFor="telefono-contacto">Teléfono para postulaciones *</label>
              <input
                type="tel"
                id="telefono-contacto"
                name="telefono_contacto"
                placeholder="Ejemplo: 81 1234 5678"
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                required
              />
              <p className="campo-ayuda">
                Se mostrará un botón &quot;Llamar&quot; en el detalle de la vacante.
              </p>
            </div>
          )}
        </fieldset>

        <div className="acciones">
          <Boton variante="primario" type="submit" disabled={enviando}>
            {enviando
              ? 'Guardando…'
              : esEdicion
              ? 'Guardar cambios'
              : 'Publicar vacante'}
          </Boton>
          <Boton variante="secundario" to="/empresa/vacantes">
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  )
}

export default PublicarVacante
