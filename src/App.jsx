import { Routes, Route, useLocation } from 'react-router-dom'
import Encabezado from './components/Encabezado'
import Pie from './components/Pie'
import RutaProtegida from './components/RutaProtegida'
import ListadoVacantes from './pages/ListadoVacantes'
import DetalleVacante from './pages/DetalleVacante'
import Login from './pages/Login'
import RegistroCandidato from './pages/RegistroCandidato'
import RegistroEmpresa from './pages/RegistroEmpresa'
import Confirmacion from './pages/Confirmacion'
import MisSolicitudes from './pages/MisSolicitudes'
import EmpresaVacantes from './pages/EmpresaVacantes'
import PublicarVacante from './pages/PublicarVacante'
import SolicitudesRecibidas from './pages/SolicitudesRecibidas'
import VacantesFavoritas from './pages/VacantesFavoritas'
import MiPerfil from './pages/MiPerfil'
import PanelAdmin from './pages/PanelAdmin'
import Boton from './components/Boton'

function PaginaNoEncontrada() {
  return (
    <div className="contenedor contenedor-chico confirmacion">
      <h1>Página no encontrada</h1>
      <p className="subtitulo">
        La dirección que buscaste no existe en la bolsa de trabajo AMAC.
      </p>
      <div className="acciones">
        <Boton variante="primario" to="/">
          Volver a vacantes
        </Boton>
      </div>
    </div>
  )
}

function App() {
  const { pathname } = useLocation()
  const usaFondoAzul = pathname === '/login'

  return (
    <>
      <Encabezado />
      <main
        id="principal"
        className={usaFondoAzul ? 'principal-azul' : 'principal'}
      >
        <Routes>
          <Route path="/" element={<ListadoVacantes />} />
          <Route path="/vacantes/:id" element={<DetalleVacante />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroCandidato />} />
          <Route path="/registro-empresa" element={<RegistroEmpresa />} />

          {/* Rutas protegidas de candidato */}
          <Route
            path="/confirmacion"
            element={
              <RutaProtegida rol="candidato">
                <Confirmacion />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-solicitudes"
            element={
              <RutaProtegida rol="candidato">
                <MisSolicitudes />
              </RutaProtegida>
            }
          />
          <Route
            path="/favoritos"
            element={
              <RutaProtegida rol="candidato">
                <VacantesFavoritas />
              </RutaProtegida>
            }
          />

          {/* Rutas protegidas de empresa */}
          <Route
            path="/empresa/vacantes"
            element={
              <RutaProtegida rol="empresa">
                <EmpresaVacantes />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/publicar"
            element={
              <RutaProtegida rol="empresa">
                <PublicarVacante />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/vacantes/:id/editar"
            element={
              <RutaProtegida rol="empresa">
                <PublicarVacante />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/vacantes/:id/solicitudes"
            element={
              <RutaProtegida rol="empresa">
                <SolicitudesRecibidas />
              </RutaProtegida>
            }
          />

          {/* Rutas protegidas extra */}
          <Route
            path="/perfil"
            element={
              <RutaProtegida rol={['candidato', 'empresa']}>
                <MiPerfil />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin"
            element={
              <RutaProtegida rol="admin">
                <PanelAdmin />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </main>
      <Pie />
    </>
  )
}

export default App
