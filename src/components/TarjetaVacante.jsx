import Boton from './Boton'
import { formatearSueldo } from '../lib/constantes'

export default function TarjetaVacante({ vacante }) {
  return (
    <article className="tarjeta">
      <h3>{vacante.titulo}</h3>
      <p className="tarjeta-empresa">{vacante.empresa?.nombre || 'Empresa registrada'}</p>
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
        <Boton variante="secundario" to={`/vacantes/${vacante.id}`}>
          Ver más
        </Boton>
        <Boton variante="primario" to={`/vacantes/${vacante.id}`}>
          Postularme
        </Boton>
      </div>
    </article>
  )
}
