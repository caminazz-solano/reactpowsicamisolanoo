import { useState } from 'react'
import logo from '../assets/powsi.png'
import footerLogo from '../assets/powsii.png'
import { whatsappUrl } from '../data/powsi.js'

const pawPositions = [
  [8, 16],
  [78, 12],
  [30, 38],
  [91, 48],
  [12, 72],
  [63, 82],
]

export function Icon({ children, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  )
}

export function Button({ href, variant = '', className = '', children, ...props }) {
  const classes = ['btn', variant, className].filter(Boolean).join(' ')
  if (href) return <a className={classes} href={href} {...props}>{children}</a>
  return <button className={classes} type="button" {...props}>{children}</button>
}

export function Section({ id, className = '', decorationIndex = 0, children }) {
  return (
    <section id={id} className={`section ${className}`.trim()}>
      {pawPositions.map(([left, top], index) => (
        <span
          key={`${decorationIndex}-${index}`}
          className="floating-paw"
          aria-hidden="true"
          style={{
            left: `${(left + decorationIndex * 7 + index * 3) % 94}%`,
            top: `${(top + decorationIndex * 11) % 88}%`,
            animationDelay: `${-((decorationIndex + index) % 6)}s`,
          }}
        >
          pets
        </span>
      ))}
      {children}
    </section>
  )
}

export function SectionHeading({ title, description, sticker, icon }) {
  return (
    <div className="head">
      <div>
        <h2 className="title">{title}</h2>
        {description && <p className="lead">{description}</p>}
      </div>
      {sticker && <span className="sticker"><Icon>{icon}</Icon>{sticker}</span>}
    </div>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    ['Inicio', '/'],
    ['Servicios', '/#servicios'],
    ['Mi mascota', '/mi-mascota'],
    ['Promociones', '/#promociones'],
    ['Nosotros', '/nosotros'],
    ['Contacto', '/contacto'],
  ]

  return (
    <header className="top">
      <nav className="nav" aria-label="Navegación principal">
        <a className="logo" href="/" aria-label="POWSI, inicio">
          <img src={logo} alt="POWSI" />
        </a>
        <div className={`links${menuOpen ? ' open' : ''}`} id="site-navigation">
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </div>
        <div className="actions">
          <Button href={whatsappUrl} className="icon" aria-label="WhatsApp">
            <Icon>forum</Icon>
          </Button>
          <Button href="/agendar" variant="primary">Agendar cita</Button>
          <Button
            className="icon menu"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon>{menuOpen ? 'close' : 'menu'}</Icon>
          </Button>
        </div>
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer>
      <div className="foot">
        <div>
          <div className="logo"><img src={footerLogo} alt="POWSI" /></div>
          <p>Veterinaria editorial, calida y muy facil de contactar.</p>
          <div className="social">
            <a href="https://www.instagram.com/_nazzaret.solano?stkn=YXFwOTVma2JsbnV3&utm_source=qr" aria-label="Instagram">
              <Icon>photo_camera</Icon>
            </a>
            <a href="#" aria-label="Facebook"><Icon>thumb_up</Icon></a>
            <a href={whatsappUrl} aria-label="WhatsApp"><Icon>forum</Icon></a>
          </div>
        </div>
        <div>
          <h4>Contacto</h4>
          <p>WhatsApp: +591 71764894</p>
          <p>Av. de las Patitas 123</p>
        </div>
        <div>
          <h4>Horarios</h4>
          <p>Lun-Vie 9:00 - 19:00</p>
          <p>Sab 9:00 - 14:00</p>
        </div>
        <div>
          <h4>Enlaces</h4>
          <a href="/#servicios">Servicios</a>
          <a href="/mi-mascota">Mi mascota</a>
          <a href="/#promociones">Promociones</a>
          <a href="/agendar">Agendar cita</a>
        </div>
      </div>
    </footer>
  )
}

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <Button href={whatsappUrl} className="float" aria-label="WhatsApp flotante">
        <Icon>forum</Icon>
      </Button>
    </>
  )
}
