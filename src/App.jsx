import { Component, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import SiteLayout, { Button } from './components/SiteLayout.jsx'
import AboutPage from './pages/AboutPage.jsx'
import AppointmentPage from './pages/AppointmentPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PetDashboardPage from './pages/PetDashboardPage.jsx'
import { useAuth } from './context/AuthContext.jsx'
import {
  consumePendingScroll,
  currentAppPath,
  getLocationSnapshot,
  scrollToHash,
  subscribeToLocation,
} from './routes.js'

const pages = {
  '/': HomePage,
  '/mi-mascota': PetDashboardPage,
  '/agendar': AppointmentPage,
  '/nosotros': AboutPage,
  '/contacto': ContactPage,
}

const pageTitles = {
  '/': 'POWSI | Veterinaria retro',
  '/cuenta': 'POWSI | Mi mascota',
  '/mi-mascota': 'POWSI | Mi mascota',
  '/agendar': 'POWSI | Agendar cita',
  '/nosotros': 'POWSI | Nosotros',
  '/contacto': 'POWSI | Contacto',
}

function AccessStatusPage({ title, message, error, loading = false }) {
  return (
    <section className="section cream page-main">
      <h1>{title}</h1>
      <p role={loading ? 'status' : undefined}>{message}</p>
      {error && <p role="alert">{error}</p>}
      {!loading && <Button href="/" variant="primary">Volver al inicio</Button>}
    </section>
  )
}

function App() {
  const location = useSyncExternalStore(subscribeToLocation, getLocationSnapshot, getLocationSnapshot)
  const path = currentAppPath()
  const auth = useAuth()
  const Page = path === '/cuenta'
    ? PetDashboardPage
    : pages[path] ?? NotFoundPage
  let pageStatus = null

  if (path === '/mi-mascota' || path === '/cuenta' || path === '/agendar') {
    if (!auth.configured) {
      pageStatus = {
        title: 'Tu espacio POWSI',
        message: 'No se pudo conectar con el servicio de perfiles.',
      }
    } else if (auth.loading || (auth.user && !auth.account && !auth.error)) {
      pageStatus = {
        title: 'Tu espacio POWSI',
        message: 'Preparando tu espacio...',
        loading: true,
      }
    } else if (!auth.user || auth.error) {
      pageStatus = {
        title: 'Tu espacio POWSI',
        message: 'No se pudo preparar tu espacio. Intenta recargar la página.',
        error: auth.error,
      }
    } else if (path === '/agendar' && !auth.account?.ownerAccount) {
      pageStatus = {
        title: 'Agendar cita',
        message: 'Esta sección está disponible para propietarios.',
      }
    } else if (!auth.account?.ownerAccount && !auth.account?.veterinarianAccount) {
      pageStatus = {
        title: 'Tu espacio POWSI',
        message: 'No se pudo preparar el perfil de este espacio.',
      }
    }
  }
  const mainRef = useRef(null)
  const previousPathRef = useRef(path)
  const [routeAnnouncement, setRouteAnnouncement] = useState('')
  const pageTitle = pageTitles[path] ?? 'POWSI | Página no encontrada'

  useEffect(() => {
    document.title = pageTitle
  }, [path])

  useLayoutEffect(() => {
    const pathChanged = previousPathRef.current !== path
    previousPathRef.current = path
    const pendingScroll = consumePendingScroll()

    if (pendingScroll?.hash) {
      scrollToHash(pendingScroll.hash)
    } else if (pendingScroll && Number.isFinite(pendingScroll.restoreY)) {
      window.scrollTo(0, pendingScroll.restoreY)
    } else if (pendingScroll) {
      window.scrollTo(0, 0)
    } else if (window.location.hash) {
      scrollToHash(window.location.hash)
    }

    if (pathChanged) {
      setRouteAnnouncement(pageTitle)
      if (!window.location.hash) {
        const heading = mainRef.current?.querySelector('h1, h2.title')
        if (heading) {
          heading.setAttribute('tabindex', '-1')
          heading.focus({ preventScroll: Boolean(pendingScroll && Number.isFinite(pendingScroll.restoreY)) })
        }
      }
    }
  }, [location])

  return (
    <SiteLayout mainRef={mainRef} routeAnnouncement={routeAnnouncement}>
      <RouteErrorBoundary key={`${path}${window.location.search}`}>
        {pageStatus
          ? <AccessStatusPage {...pageStatus} />
          : <Page key={`${path}${window.location.search}`} />}
      </RouteErrorBoundary>
    </SiteLayout>
  )
}

class RouteErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section cream page-main" role="alert">
          <h1>No pudimos cargar esta página</h1>
          <p>Intenta volver al inicio o recargar la aplicación.</p>
          <Button href="/" variant="primary">Volver al inicio</Button>
        </section>
      )
    }

    return this.props.children
  }
}

export default App
