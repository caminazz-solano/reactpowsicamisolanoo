import { Button, Icon, Section, SectionHeading } from '../components/SiteLayout.jsx'
import { promotions, services, whatsappUrl } from '../data/powsi.js'

function Hero() {
  return (
    <Section id="inicio" className="hero" decorationIndex={0}>
      <div>
        <span className="sticker">
          <Icon>pets</Icon>Veterinaria con corazon retro
        </span>
        <h1>Cuando ellos estan bien, <span className="hi">todo esta bien.</span></h1>
        <p>
          Cuidamos de tu mejor amigo con atencion, carino y seguimiento
          profesional: servicios claros, vacunas visibles, historial medico y
          agenda en un solo lugar.
        </p>
        <div className="row">
          <Button href="/agendar" variant="primary">Agendar cita</Button>
          <Button href="/#servicios">Ver servicios</Button>
        </div>
      </div>
      <div className="collage">
        <Icon className="paw">pets</Icon>
        <div className="photo">
          <img
            alt="Perro feliz corriendo"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdzRkr6fgSC7xvf16jCU1Ucf8s7XffMTWy9TVA2lvKVq8vWYtxnGVoOWQkk4yIWyN6EaQMwL2xtluSswBdnFg1rIqsdS3PI0XIgtKYcv3NKNRKw0knrc23JFw6Qo8kRCEolKy972haEBdfD9mp4AFU8sgCeBtTpGurs7agXEz5Ncz7_pjGkc6s_gobO4ONvssM6StifmdcNDHHMIyBqo7zEsOI7xOLdmSoKUVX9ZzP10vYhHwRU9vv_Q"
          />
        </div>
        <div className="note n1"><strong>Lun-Sab</strong>9:00 a 19:00<br />Visitas y controles</div>
        <div className="note n2"><strong>Vacunas</strong>Recordatorios antes de cada refuerzo</div>
        <a className="note n3" href={whatsappUrl}><strong>WhatsApp</strong>Dudas rapidas antes de salir de casa</a>
      </div>
    </Section>
  )
}

function ServiceCard({ service }) {
  return (
    <article className="card svc">
      <span className="tag">{service.category}</span>
      <div className="svcimg"><img src={service.image} alt={service.title} loading="lazy" /></div>
      <div className="body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </div>
    </article>
  )
}

function PromotionCard({ promotion }) {
  const service = promotion.service ?? promotion.title
  return (
    <article className="card promo">
      <span className="badge">{promotion.badge}</span>
      <div className="pimg"><img src={promotion.image} alt={promotion.title} loading="lazy" /></div>
      <div className="body">
        <h3>{promotion.title}</h3>
        <p>{promotion.description}</p>
        <br />
        <Button href={`/agendar?servicio=${encodeURIComponent(service)}`} variant={promotion.variant}>
          {promotion.button}
        </Button>
      </div>
    </article>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Section id="servicios" className="cream" decorationIndex={1}>
        <SectionHeading
          title="Servicios"
          description="Atencion completa para que cada dueno sepa que pedir y cada paciente tenga seguimiento real."
          sticker="Todo en POWSI"
          icon="stethoscope"
        />
        <div className="grid services">
          {services.map((service) => <ServiceCard key={service.title} service={service} />)}
        </div>
      </Section>
      <Section id="promociones" className="paper" decorationIndex={2}>
        <SectionHeading
          title="Lo que hay en POWSI"
          description="Promociones y campanas listas para que la veterinaria las actualice y los clientes las encuentren al instante."
          sticker="Temporada"
          icon="local_offer"
        />
        <div className="grid promos">
          {promotions.map((promotion) => <PromotionCard key={promotion.title} promotion={promotion} />)}
        </div>
      </Section>
    </>
  )
}