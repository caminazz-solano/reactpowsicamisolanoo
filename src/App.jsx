import { useEffect } from 'react'
import SiteLayout from './components/SiteLayout.jsx'
import AboutPage from './pages/AboutPage.jsx'
import AppointmentPage from './pages/AppointmentPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
import PetDashboardPage from './pages/PetDashboardPage.jsx'

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
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const Page = pages[path] ?? HomePage

  useEffect(() => {
    document.title = pageTitles[path] ?? pageTitles['/']
  }, [path])

  return (
    <SiteLayout>
      <Page />
    </SiteLayout>
  )
}

export default App