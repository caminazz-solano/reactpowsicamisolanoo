import { Icon, Section, SectionHeading } from '../components/SiteLayout.jsx'
import { aboutImages } from '../data/powsi.js'

function IdentityCard({ className, icon, label, title, children }) {
  return (
    <article className={`identity-card ${className}`}>
      {icon && <Icon className="identity-icon">{icon}</Icon>}
      <p className="identity-label">{label}</p>
      <h3>{title}</h3>
      {children}
    </article>
  )
}

export default function AboutPage() {
  return (
    <Section id="nosotros" className="mintbg page-main" decorationIndex={0}>
      <SectionHeading
        title="Nosotros"
        description="Un equipo cercano, espacios calidos y seguimiento ordenado para que la experiencia no se sienta como hospital."
      />
      <div className="grid about">
        {aboutImages.map((image) => (
          <div className="card aphoto" key={image.alt}>
            <img src={image.src} alt={image.alt} loading="lazy" />
          </div>
        ))}
      </div>
      <div className="identity-grid">
        <IdentityCard className="mission-card" icon="favorite" label="Nuestra mision" title="Cuidar con calidez y criterio">
          <p>Acompañamos a cada mascota con atencion veterinaria cercana, clara y responsable, para que su familia se sienta segura en cada decision.</p>
        </IdentityCard>
        <IdentityCard className="vision-card" icon="visibility" label="Nuestra vision" title="Una vida mas sana para ellos">
          <p>Queremos ser la veterinaria de confianza en Cochabamba, uniendo cuidado preventivo, tecnologia y un trato que se recuerde.</p>
        </IdentityCard>
        <IdentityCard className="values-card" label="Nuestros valores" title="Lo que nos mueve">
          <ul className="values-list">
            <li><Icon>volunteer_activism</Icon><span><b>Empatia</b><small>Escuchamos a cada familia.</small></span></li>
            <li><Icon>verified</Icon><span><b>Responsabilidad</b><small>Cuidamos cada detalle.</small></span></li>
            <li><Icon>record_voice_over</Icon><span><b>Claridad</b><small>Explicamos sin complicar.</small></span></li>
          </ul>
        </IdentityCard>
      </div>
    </Section>
  )
}