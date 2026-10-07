import { Button, Section, SectionHeading } from '../components/SiteLayout.jsx'

export default function NotFoundPage() {
  return (
    <Section className="cream page-main">
      <SectionHeading
        title="404 · No encontramos esta página"
        description="El enlace puede estar escrito incorrectamente o la página ya no existe."
      />
      <Button href="/" variant="primary">Volver al inicio</Button>
    </Section>
  )
}