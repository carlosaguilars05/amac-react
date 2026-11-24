import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Pie() {
  const { perfil } = useAuth()

  return (
    <footer className="pie">
      <div className="contenedor">
        <p className="pie-marca">AMAC</p>
        <p>asociAMayores A.C. · Bolsa de trabajo para personas adultas mayores.</p>
        <p>
          ¿Necesitas ayuda? Llámanos al <a href="tel:8100000000">81 0000 0000</a>.
        </p>
        <div className="pie-enlaces">
          <Link to="/">Vacantes</Link>
          {!perfil && (
            <>
              <Link to="/registro">Crear cuenta</Link>
              <Link to="/registro-empresa">Para empresas</Link>
              <Link to="/login">Iniciar sesión</Link>
            </>
          )}
          {perfil?.rol === 'candidato' && (
            <>
              <Link to="/mis-solicitudes">Mis solicitudes</Link>
              <Link to="/favoritos">Favoritos</Link>
              <Link to="/perfil">Mi perfil</Link>
            </>
          )}
          {perfil?.rol === 'empresa' && (
            <>
              <Link to="/empresa/vacantes">Mis vacantes</Link>
              <Link to="/empresa/publicar">Publicar vacante</Link>
              <Link to="/perfil">Mi perfil</Link>
            </>
          )}
          {perfil?.rol === 'admin' && <Link to="/admin">Panel AMAC</Link>}
        </div>
        <p>&copy; 2026 AMAC</p>
      </div>
    </footer>
  )
}

export default Pie
