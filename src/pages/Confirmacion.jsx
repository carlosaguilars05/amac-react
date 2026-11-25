import Boton from '../components/Boton'

function Confirmacion() {
  return (
    <div className="contenedor contenedor-chico confirmacion">
      <div className="icono-check">✓</div>
      <h1>¡Tu postulación fue enviada!</h1>
      <p>Le avisamos a la empresa. Puedes ver cómo va tu solicitud en Mis solicitudes.</p>
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

export default Confirmacion
