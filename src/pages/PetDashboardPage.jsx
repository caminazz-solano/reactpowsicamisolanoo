import { useEffect, useRef, useState } from 'react'
import { Button, Icon, Section, SectionHeading } from '../components/SiteLayout.jsx'
import { defaultPetImage } from '../data/powsi.js'
import usePetProfiles, { defaultPet } from '../hooks/usePetProfiles.js'

function readNextAppointment() {
  try {
    return JSON.parse(localStorage.getItem('woofyNextAppointment'))
  } catch {
    return null
  }
}

function RecordCard({ title, alert = false, children, className = '' }) {
  return <article className={`card dcard${alert ? ' alert' : ''} ${className}`.trim()}>
    <h3>{title}</h3>
    {children}
  </article>
}

function Record({ icon, title, description, status, hot = false }) {
  return (
    <div className="rec">
      <Icon>{icon}</Icon>
      <div><b>{title}</b><small>{description}</small></div>
      {status && <span className={`status${hot ? ' hot' : ''}`}>{status}</span>}
    </div>
  )
}

function PetProfileCard({ pets, activeIndex, currentPet, setActiveIndex, onAdd, onRemove, onEdit }) {
  return (
    <article className="card pet">
      <div className="petpic">
        <div className="pinterest-image">
          <img src={currentPet.image || defaultPetImage} alt={`Foto de ${currentPet.name || 'mascota'}`} />
        </div>
      </div>
      <div className="pet-switcher">
        <div>
          <span className="eyebrow">Mis mascotas</span>
          <div className="pet-list" aria-label="Seleccionar mascota">
            {pets.map((pet, index) => (
              <button
                className={`pet-tab${index === activeIndex ? ' active' : ''}`}
                type="button"
                key={pet.id}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >
                {pet.name || `Mascota ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
        <div className="pet-actions">
          <Button className="yellow add-pet" onClick={onAdd}><Icon>add</Icon>Añadir</Button>
          <Button className="remove-pet" onClick={onRemove}><Icon>delete</Icon>Eliminar</Button>
        </div>
      </div>
      <Button href="/agendar?paciente=nuevo" className="new-patient-link">
        <Icon>event</Icon>Soy paciente nuevo
      </Button>
      <h3>{currentPet.name || 'Indique nombre de mascota'}</h3>
      <div className="chips">
        <span className="tag">{currentPet.age ? `${currentPet.age} ${Number(currentPet.age) === 1 ? 'año' : 'años'}` : 'Edad no indicada'}</span>
        <span className="tag">{currentPet.weight ? `${currentPet.weight} kg` : 'Peso no indicado'}</span>
        <span className="tag">{currentPet.type || 'Tipo no indicado'}</span>
        <span className="tag">{currentPet.breed || 'Raza no indicada'}</span>
      </div>
      <Button className="yellow edit-pet" onClick={onEdit}><Icon>edit</Icon>Editar datos</Button>
    </article>
  )
}

function PetNotesForm({ pet, onSave, formRef, nameInputRef }) {
  const [draft, setDraft] = useState(pet)
  const [photoFile, setPhotoFile] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    setDraft(pet)
    setPhotoFile(null)
  }, [pet])

  function updateField(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    let image = draft.image || ''
    if (photoFile) {
      image = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result))
        reader.addEventListener('error', reject)
        reader.readAsDataURL(photoFile)
      })
    }
    onSave({
      name: draft.name.trim(),
      age: draft.age.trim(),
      weight: draft.weight.trim(),
      type: draft.type.trim(),
      breed: draft.breed.trim(),
      notes: draft.notes.trim(),
      image,
    })
    setPhotoFile(null)
    setSaveMessage('✓ Información guardada')
    window.setTimeout(() => setSaveMessage(''), 2500)
  }

  return (
    <RecordCard title="Datos y notas" className="pet-notes">
      <p className="note-intro">Personaliza la información de tu mascota y guarda notas sobre síntomas o cuidados.</p>
      <form ref={formRef} className="pet-profile-form" onSubmit={handleSubmit}>
        <div className="pet-fields">
          <label>Nombre de mascota<input ref={nameInputRef} name="name" type="text" maxLength="40" placeholder="Indique nombre de mascota" value={draft.name} onChange={updateField} /></label>
          <label>Edad<input name="age" type="number" min="0" max="40" placeholder="Ej. 3" value={draft.age} onChange={updateField} /></label>
          <label>Peso (kg)<input name="weight" type="number" min="0" max="200" step="0.1" placeholder="Ej. 12.5" value={draft.weight} onChange={updateField} /></label>
          <label>Tipo<input name="type" type="text" maxLength="30" placeholder="Ej. Perro" value={draft.type} onChange={updateField} /></label>
          <label>Raza<input name="breed" type="text" maxLength="50" placeholder="Ej. Golden Retriever" value={draft.breed} onChange={updateField} /></label>
        </div>
        <label className="photo-upload">Foto de tu mascota
          <input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} />
          <span className="upload-hint"><Icon>upload</Icon>{photoFile?.name || 'Elegir una imagen'}</span>
        </label>
        <label>Notas, síntomas o cuidados
          <textarea name="notes" rows="4" maxLength="500" placeholder="Ej. Tiene picazón por las noches y necesita su medicamento después de cenar." value={draft.notes} onChange={updateField} />
        </label>
        <Button variant="primary" type="submit">Guardar información</Button>
        <span className="save-msg" role="status">{saveMessage}</span>
      </form>
    </RecordCard>
  )
}

export default function PetDashboardPage() {
  const { pets, setPets, activeIndex, setActiveIndex, currentPet, updatePet } = usePetProfiles()
  const profileFormRef = useRef(null)
  const profileNameRef = useRef(null)
  const nextAppointment = readNextAppointment()

  function addPet() {
    const newPet = { ...defaultPet, name: '', age: '', type: '', breed: '', id: `pet-${Date.now()}` }
    setPets((current) => [...current, newPet])
    setActiveIndex(pets.length)
  }

  function removePet() {
    if (pets.length === 1) {
      window.alert('Debes conservar al menos una mascota.')
      return
    }
    const name = currentPet.name || `Mascota ${activeIndex + 1}`
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    setPets((current) => current.filter((_, index) => index !== activeIndex))
    setActiveIndex(Math.min(activeIndex, pets.length - 2))
  }

  function focusProfileForm() {
    profileFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => profileNameRef.current?.focus(), 400)
  }

  return (
    <Section id="mi-mascota" className="wine page-main" decorationIndex={0}>
      <SectionHeading
        title="Mi mascota"
        description="Un dashboard calido para que el dueno vea historial, vacunas, tratamientos y proximas acciones sin perderse."
        sticker="Historial vivo"
        icon="medical_information"
      />
      <div className="dash">
        <PetProfileCard
          pets={pets}
          activeIndex={activeIndex}
          currentPet={currentPet}
          setActiveIndex={setActiveIndex}
          onAdd={addPet}
          onRemove={removePet}
          onEdit={focusProfileForm}
        />
        <div className="dgrid">
          <RecordCard title="Proximamente" alert>
            <Record icon="vaccines" title="Proxima vacuna" description="Rabia - 18 Sep 2026" status="En 9 dias" hot />
            <Record
              icon="event_available"
              title="Proxima cita"
              description={nextAppointment?.pet === (currentPet.name || `Mascota ${activeIndex + 1}`)
                ? `${nextAppointment.service} - ${nextAppointment.date} a las ${nextAppointment.time}`
                : 'Control dental - 25 Sep 2026'}
              status="Confirmada"
            />
            <Record icon="medication" title="Tratamiento pendiente" description="Antialergico nocturno" status="Hoy" hot />
          </RecordCard>
          <RecordCard title="Historial medico">
            <Record icon="stethoscope" title="Consulta general" description="Peso estable, piel en observacion" />
            <Record icon="healing" title="Tratamiento" description="Dermatitis leve, control en 15 dias" />
            <Record icon="description" title="Nota vet" description="Subir foto si aparece irritacion" />
          </RecordCard>
          <RecordCard title="Vacunas aplicadas">
            <Record icon="verified" title="Multiple canina" description="Aplicada 12 Mar 2026" />
            <Record icon="verified" title="Desparasitacion" description="Aplicada 04 Jul 2026" />
          </RecordCard>
          <PetNotesForm
            key={currentPet.id}
            pet={currentPet}
            onSave={(changes) => updatePet(activeIndex, changes)}
            formRef={profileFormRef}
            nameInputRef={profileNameRef}
          />
        </div>
      </div>
    </Section>
  )
}