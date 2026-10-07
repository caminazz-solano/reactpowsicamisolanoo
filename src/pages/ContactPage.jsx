import { Button, Icon, Section } from '../components/SiteLayout.jsx'
import { whatsappUrl } from '../data/powsi.js'

const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Plaza+14+de+Septiembre+Cochabamba+Bolivia'

const contactDetails = [
  {
    icon: 'calendar_month',
    title: 'Dias de atencion',
    description: 'Lunes a sabado. Domingos con guardia por WhatsApp.',
  },
  {
    icon: 'schedule',
    title: 'Horarios',
    description: 'Lun a Vie 9:00 - 19:00 / Sab 9:00 - 14:00.',
  },
  {
    icon: 'location_on',
    title: 'Direccion',
    description: 'Esquina Este de la Plaza 14 de Septiembre, Cochabamba.',
  },
]

function ContactInfo() {
  return (
    <div className="card panel">
      <h2 className="title">Encuentranos</h2>
      <p className="lead">Horarios, direccion y acciones visibles para organizar tu visita.</p>
      <div className="list">
        {contactDetails.map((detail) => (
          <div className="info" key={detail.title}>
            <Icon className="ico">{detail.icon}</Icon>
            <div><h3>{detail.title}</h3><p>{detail.description}</p></div>
          </div>
        ))}
      </div>
      <div className="row">
        <Button href={mapUrl} className="yellow" target="_blank" rel="noreferrer">Como llegar</Button>
        <Button href="/agendar" variant="primary">Agendar mi visita</Button>
      </div>
    </div>
  )
}

function MapCard() {
  return (
    <div className="card mapcard">
      <div className="map">
        <iframe
          title="Mapa de POWSI cerca de la Plaza 14 de Septiembre"
          src="https://www.google.com/maps?q=Plaza+14+de+Septiembre+Cochabamba+Bolivia&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="maptxt">POWSI esta en la esquina este de la Plaza 14 de Septiembre, Cochabamba.</div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <>
      <Section id="ubicacion" className="mintbg" decorationIndex={0}>
        <div className="split">
          <ContactInfo />
          <MapCard />
        </div>
      </Section>
      <Section id="contacto" className="wine" decorationIndex={1}>
        <div className="contact">
          <div>
            <span className="sticker"><Icon>forum</Icon>Contacto rapido</span>
            <h2>Tienes una duda?</h2>
            <p>Escribenos y te ayudamos a encontrar la mejor opcion para tu mascota antes de asistir.</p>
          </div>
          <Button href={whatsappUrl} variant="primary">Escribir por WhatsApp</Button>
        </div>
      </Section>
    </>
  )
}