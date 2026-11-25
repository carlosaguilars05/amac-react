import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Encabezado() {
  const { perfil, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()

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
            <NavLink to="/" end>Vacantes</NavLink>

            {!cargando && !perfil && (
              <>
                <NavLink to="/registro">Crear cuenta</NavLink>
                <NavLink to="/registro-empresa">Para empresas</NavLink>
                <NavLink to="/login">Iniciar sesión</NavLink>
              </>
            )}

            {!cargando && perfil?.rol === 'candidato' && (
              <>
                <NavLink to="/mis-solicitudes">Mis solicitudes</NavLink>
                <NavLink to="/favoritos">Favoritos</NavLink>
                <NavLink to="/perfil">Mi perfil</NavLink>
                <button type="button" className="menu-boton" onClick={manejarCerrarSesion}>
                  Cerrar sesión
                </button>
              </>
            )}

            {!cargando && perfil?.rol === 'empresa' && (
              <>
                <NavLink to="/empresa/vacantes">Mis vacantes</NavLink>
                <NavLink to="/empresa/publicar">Publicar vacante</NavLink>
                <NavLink to="/perfil">Mi perfil</NavLink>
                <button type="button" className="menu-boton" onClick={manejarCerrarSesion}>
                  Cerrar sesión
                </button>
              </>
            )}

            {!cargando && perfil?.rol === 'admin' && (
              <>
                <NavLink to="/admin">Panel AMAC</NavLink>
                <button type="button" className="menu-boton" onClick={manejarCerrarSesion}>
                  Cerrar sesión
                </button>
              </>
            )}
          </nav>

          <a className="boton boton--oscuro boton--chico boton-ayuda" href="tel:8100000000">
            Ayuda<span className="ayuda-numero">: 81 0000 0000</span>
          </a>
        </div>
      </header>
    </>
  )
}

export default Encabezado
