import { useLocation } from 'react-router-dom'
import Boton from '../components/Boton'

export default function Confirmacion() {
  const { state } = useLocation()
  const titulo = state?.titulo
  const empresa = state?.empresa || 'la empresa'

  return (
    <div className="contenedor contenedor-chico confirmacion">
      <div className="icono-check" aria-hidden="true">
        &#10003;
      </div>
      <h1>¡Tu postulación fue enviada!</h1>
      <p>
        {titulo
          ? `Le avisamos a ${empresa} que te postulaste para ${titulo}. `
          : `Le avisamos a ${empresa}. `}
        Puedes ver cómo va tu solicitud en &quot;Mis solicitudes&quot;.
      </p>
      <div className="acciones">
        <Boton variante="primario" to="/mis-solicitudes">
          Ver mis solicitudes
        </Boton>
        <Boton variante="secundario" to="/">
          Seguir buscando empleo
        </Boton>
      </div>
    </div>
  )
}
