import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Encabezado() {
  const { perfil, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const claseEnlace = ({ isActive }) => (isActive ? 'activo' : undefined)

  async function manejarCerrarSesion() {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <>
      <a className="saltar-contenido" href="#principal">
        Saltar al contenido
      </a>

      <header className="encabezado">
        <div className="contenedor">
          <Link className="logo" to="/">
            AMAC <span className="logo-sub">Bolsa de trabajo</span>
          </Link>

          <nav className="menu" aria-label="Navegación principal">
            <NavLink className={claseEnlace} to="/" end>
              Vacantes
            </NavLink>

            {!cargando && !perfil && (
              <>
                <NavLink className={claseEnlace} to="/registro">
                  Crear cuenta
                </NavLink>
                <NavLink className={claseEnlace} to="/registro-empresa">
                  Para empresas
                </NavLink>
                <NavLink className={claseEnlace} to="/login">
                  Iniciar sesión
                </NavLink>
              </>
            )}

            {!cargando && perfil?.rol === 'candidato' && (
              <>
                <NavLink className={claseEnlace} to="/mis-solicitudes">
                  Mis solicitudes
                </NavLink>
                <NavLink className={claseEnlace} to="/favoritos">
                  Favoritos
                </NavLink>
                <NavLink className={claseEnlace} to="/perfil">
                  Mi perfil
                </NavLink>
                <button
                  type="button"
                  className="menu-boton"
                  onClick={manejarCerrarSesion}
                >
                  Cerrar sesión
                </button>
              </>
            )}

            {!cargando && perfil?.rol === 'empresa' && (
              <>
                <NavLink className={claseEnlace} to="/empresa/vacantes">
                  Mis vacantes
                </NavLink>
                <NavLink className={claseEnlace} to="/empresa/publicar">
                  Publicar vacante
                </NavLink>
                <NavLink className={claseEnlace} to="/perfil">
                  Mi perfil
                </NavLink>
                <button
                  type="button"
                  className="menu-boton"
                  onClick={manejarCerrarSesion}
                >
                  Cerrar sesión
                </button>
              </>
            )}

            {!cargando && perfil?.rol === 'admin' && (
              <>
                <NavLink className={claseEnlace} to="/admin">
                  Panel AMAC
                </NavLink>
                <button
                  type="button"
                  className="menu-boton"
                  onClick={manejarCerrarSesion}
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </nav>

          <a
            className="boton boton--oscuro boton--chico boton-ayuda"
            href="tel:8100000000"
          >
            Ayuda<span className="ayuda-numero">: 81 0000 0000</span>
          </a>
        </div>
      </header>
    </>
  )
}

export default Encabezado
