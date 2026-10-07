import { Component, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import SiteLayout, { Button } from './components/SiteLayout.jsx'
import AboutPage from './pages/AboutPage.jsx'
import AppointmentPage from './pages/AppointmentPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PetDashboardPage from './pages/PetDashboardPage.jsx'
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
  '/mi-mascota': 'POWSI | Mi mascota',
  '/agendar': 'POWSI | Agendar cita',
  '/nosotros': 'POWSI | Nosotros',
  '/contacto': 'POWSI | Contacto',
}

function App() {
  const location = useSyncExternalStore(subscribeToLocation, getLocationSnapshot, getLocationSnapshot)
  const path = currentAppPath()
  const Page = pages[path] ?? NotFoundPage
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
        <Page key={`${path}${window.location.search}`} />
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
