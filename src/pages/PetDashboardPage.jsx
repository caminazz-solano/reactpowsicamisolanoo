import { useEffect, useRef, useState } from 'react'
import { Button, Icon, Section, SectionHeading } from '../components/SiteLayout.jsx'
import { defaultPetImage } from '../data/powsi.js'
import { useAuth } from '../context/AuthContext.jsx'
import usePetProfiles from '../hooks/usePetProfiles.js'

function readNextAppointment(userId) {
  try {
    return JSON.parse(localStorage.getItem(`woofyNextAppointment:${userId}`))
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

function PetProfileCard({ pets, activeIndex, currentPet, setActiveIndex, onAdd, onRemove, onEdit, canManageProfiles }) {
  return (
    <article className="card pet">
      <div className="petpic">
        <div className="pinterest-image">
          <img src={currentPet.image || defaultPetImage} alt={`Foto de ${currentPet.name || 'mascota'}`} />
        </div>
      </div>
      <div className="pet-switcher">
        <div>
          <span className="eyebrow">{canManageProfiles ? 'Mis mascotas' : 'Pacientes asignados'}</span>
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
        {canManageProfiles && (
          <div className="pet-actions">
            <Button className="yellow add-pet" onClick={onAdd}><Icon>add</Icon>Añadir</Button>
            <Button className="remove-pet" onClick={onRemove}><Icon>delete</Icon>Eliminar</Button>
          </div>
        )}
      </div>
      {canManageProfiles && <Button href="/agendar?paciente=nuevo" className="new-patient-link"><Icon>event</Icon>Soy paciente nuevo</Button>}
      <h3>{currentPet.name || 'Indique nombre de mascota'}</h3>
      <div className="chips">
        <span className="tag">{currentPet.age ? `${currentPet.age} ${Number(currentPet.age) === 1 ? 'año' : 'años'}` : 'Edad no indicada'}</span>
        <span className="tag">{currentPet.weight ? `${currentPet.weight} kg` : 'Peso no indicado'}</span>
        <span className="tag">{currentPet.type || 'Tipo no indicado'}</span>
        <span className="tag">{currentPet.breed || 'Raza no indicada'}</span>
      </div>
      {canManageProfiles && <Button className="yellow edit-pet" onClick={onEdit}><Icon>edit</Icon>Editar datos</Button>}
    </article>
  )
}

function PetNotesForm({ pet, onSave, formRef, nameInputRef, children }) {
  const [draft, setDraft] = useState(pet)
  const [photoFile, setPhotoFile] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')

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
    setError('')
    setSaveMessage('')
    try {
      let image = draft.image || ''
      if (photoFile) {
        image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.addEventListener('load', () => resolve(reader.result))
          reader.addEventListener('error', reject)
          reader.readAsDataURL(photoFile)
        })
      }
      await onSave({
        name: draft.name.trim(),
        age: draft.age.trim(),
        weight: draft.weight.trim(),
        type: draft.type.trim(),
        breed: draft.breed.trim(),
        image,
      })
      setPhotoFile(null)
      setSaveMessage('✓ Información guardada')
      window.setTimeout(() => setSaveMessage(''), 2500)
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  return (
    <RecordCard title="Datos y notas" className="pet-notes">
      <p className="note-intro">Personaliza la información del perfil de tu mascota.</p>
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
        <Button variant="primary" type="submit">Guardar información</Button>
        {error && <span className="save-msg" role="alert">{error}</span>}
        <span className="save-msg" role="status">{saveMessage}</span>
      </form>
      {children}
    </RecordCard>
  )
}

function PetNotesCard({ pet, onCreate, onUpdate, onRemove, canEdit, canDelete }) {
  const [noteDraft, setNoteDraft] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  function startEditing(note) {
    setEditingNoteId(note.id)
    setNoteDraft(note.text)
    setError('')
    setStatus('')
  }

  function cancelEditing() {
    setEditingNoteId(null)
    setNoteDraft('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      if (editingNoteId) {
        await onUpdate(editingNoteId, pet.id, noteDraft)
        setStatus('Nota actualizada.')
      } else {
        await onCreate(pet.id, noteDraft)
        setStatus('Nota creada.')
      }
      cancelEditing()
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  async function handleDelete(note) {
    if (!window.confirm('¿Eliminar esta nota? Esta acción no se puede deshacer.')) return
    setError('')
    setStatus('')
    try {
      await onRemove(note.id, pet.id)
      if (editingNoteId === note.id) cancelEditing()
      setStatus('Nota eliminada.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const content = (
    <>
      {canEdit && (
        <form className="pet-profile-form" onSubmit={handleSubmit}>
          <label>{editingNoteId ? 'Editar nota' : 'Notas, síntomas o cuidados'}
            <textarea rows="3" maxLength="500" minLength="1" required value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} />
          </label>
          <Button variant="primary" type="submit">{editingNoteId ? 'Guardar cambios' : 'Agregar nota'}</Button>
          {editingNoteId && <Button className="remove-pet" onClick={cancelEditing}>Cancelar edición</Button>}
        </form>
      )}
      {pet.notes.length === 0 && <p>Aún no hay notas para esta mascota.</p>}
      {pet.notes.map((note) => (
        <div className="rec" key={note.id}>
          <Icon>description</Icon>
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <b>Nota</b>
            <small>{note.text}</small>
          </div>
          {(canEdit || canDelete) && (
            <div className="pet-actions">
              {canEdit && <Button onClick={() => startEditing(note)}>Editar</Button>}
              {canDelete && <Button className="remove-pet" onClick={() => handleDelete(note)}>Eliminar</Button>}
            </div>
          )}
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
    </>
  )

  return content
}

export default function PetDashboardPage() {
  const { account, user } = useAuth()
  const {
    pets, activeIndex, setActiveIndex, currentPet, loading, error,
    addPet, updatePet, removePet, createNote, updateNote, removeNote,
  } = usePetProfiles()
  const canManageProfiles = Boolean(account?.ownerAccount)
  const canEditNotes = canManageProfiles || Boolean(account?.veterinarianAccount)
  const profileFormRef = useRef(null)
  const profileNameRef = useRef(null)
  const nextAppointment = readNextAppointment(user.id)

  async function handleAddPet() {
    try {
      await addPet()
    } catch {
      // The hook exposes the database error in the page alert.
    }
  }

  async function handleRemovePet() {
    const name = currentPet.name || `Mascota ${activeIndex + 1}`
    if (currentPet.notes.length) {
      window.alert('Elimina primero las notas asociadas para poder borrar este perfil.')
      return
    }
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    try {
      await removePet(currentPet.id)
    } catch {
      // The hook exposes the database error in the page alert.
    }
  }

  async function handleProfileSave(changes) {
    await updatePet(currentPet.id, changes)
  }

  function focusProfileForm() {
    profileFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => profileNameRef.current?.focus(), 400)
  }

  return (
    <Section id="mi-mascota" className="wine page-main" decorationIndex={0}>
      <SectionHeading
        title="Mi mascota"
        description={canManageProfiles
          ? 'Administra perfiles y notas de tus mascotas.'
          : 'Consulta los perfiles y notas de pacientes asignados a tu cuenta.'}
        sticker="Historial vivo"
        icon="medical_information"
      />
      {loading && <p role="status">Cargando perfiles...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && pets.length === 0 && (
        <RecordCard title="Aún no hay perfiles">
          <p>{canManageProfiles ? 'Crea el primer perfil para comenzar.' : 'No tienes pacientes asignados.'}</p>
          {canManageProfiles && <Button variant="primary" onClick={handleAddPet}>Crear perfil</Button>}
        </RecordCard>
      )}
      {currentPet && (
        <div className="dash">
          <PetProfileCard
            pets={pets}
            activeIndex={activeIndex}
            currentPet={currentPet}
            setActiveIndex={setActiveIndex}
            onAdd={handleAddPet}
            onRemove={handleRemovePet}
            onEdit={focusProfileForm}
            canManageProfiles={canManageProfiles}
          />
          <div className="dgrid">
            <RecordCard title="Próximamente — contenido de ejemplo" alert>
              <Record icon="vaccines" title="Próxima vacuna" description="Dato ilustrativo, no guardado" status="Ejemplo" hot />
              <Record icon="event_available" title="Próxima cita" description={nextAppointment ? `${nextAppointment.service} - ${nextAppointment.date} a las ${nextAppointment.time}` : 'Dato ilustrativo, no guardado'} status={nextAppointment ? 'Local' : 'Ejemplo'} />
              <Record icon="medication" title="Tratamiento pendiente" description="Dato ilustrativo, no guardado" status="Ejemplo" hot />
            </RecordCard>
            <RecordCard title="Historial médico — ejemplo estático">
              <Record icon="stethoscope" title="Consulta general" description="Dato ilustrativo, no guardado" />
              <Record icon="healing" title="Tratamiento" description="Dato ilustrativo, no guardado" />
              {!canManageProfiles && (
                <PetNotesCard
                  key={`notes-${currentPet.id}`}
                  pet={currentPet}
                  onCreate={createNote}
                  onUpdate={updateNote}
                  onRemove={removeNote}
                  canEdit={canEditNotes}
                  canDelete={canManageProfiles}
                />
              )}
            </RecordCard>
            <RecordCard title="Vacunas — ejemplo estático">
              <Record icon="verified" title="Vacuna" description="Dato ilustrativo, no guardado" />
            </RecordCard>
            {canManageProfiles && (
              <PetNotesForm
                key={currentPet.id}
                pet={currentPet}
                onSave={handleProfileSave}
                formRef={profileFormRef}
                nameInputRef={profileNameRef}
              >
                <PetNotesCard
                  pet={currentPet}
                  onCreate={createNote}
                  onUpdate={updateNote}
                  onRemove={removeNote}
                  canEdit={canEditNotes}
                  canDelete={canManageProfiles}
                />
              </PetNotesForm>
            )}
          </div>
        </div>
      )}
    </Section>
  )
}