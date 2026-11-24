import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Icon, Section, SectionHeading } from '../components/SiteLayout.jsx'
import { services, whatsappUrl } from '../data/powsi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getSupabaseClient } from '../lib/supabase.js'
import usePetProfiles from '../hooks/usePetProfiles.js'

const appointmentSteps = [
  'Seleccionar mascota',
  'Seleccionar servicio',
  'Elegir fecha',
  'Horario disponible',
  'Confirmar cita',
]
const availableTimes = ['09:00', '10:30', '12:00', '16:30']
const serviceNames = services.slice(0, 5).map((service) => service.title)

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function AppointmentSteps() {
  return (
    <aside className="card steps" aria-label="Pasos para agendar una cita">
      {appointmentSteps.map((step, index) => (
        <div className={`step${index < 4 ? ' on' : ''}`} key={step}>
          <b>{index + 1}</b>{step}
        </div>
      ))}
    </aside>
  )
}

export default function AppointmentPage() {
  const { user } = useAuth()
  const { pets, activeIndex, setActiveIndex, loading, error } = usePetProfiles()
  const requestedPet = new URLSearchParams(window.location.search).get('paciente') === 'nuevo'
  const requestedService = new URLSearchParams(window.location.search).get('servicio')
  const initialService = serviceNames.includes(requestedService) ? requestedService : serviceNames[0]
  const [selectedPet, setSelectedPet] = useState(requestedPet ? 'new' : String(activeIndex))
  const [newPetName, setNewPetName] = useState('')
  const [service, setService] = useState(initialService)
  const [date, setDate] = useState(() => localDateString())
  const [phone, setPhone] = useState('+591 71764894')
  const [notes, setNotes] = useState('')
  const [selectedTime, setSelectedTime] = useState('10:30')
  const [confirmation, setConfirmation] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [cacheWarning, setCacheWarning] = useState('')
  const newPetInputRef = useRef(null)
  const confirmationRef = useRef(null)
  const isNewPatient = selectedPet === 'new'

  useEffect(() => {
    if (loading) return
    if (pets.length === 0) {
      if (selectedPet !== 'new') setSelectedPet('new')
      return
    }
    if (selectedPet !== 'new' && !pets[Number(selectedPet)]) {
      setSelectedPet(String(activeIndex))
    }
  }, [activeIndex, loading, pets, selectedPet])

  useEffect(() => {
    if (isNewPatient) newPetInputRef.current?.focus()
  }, [isNewPatient])

  useEffect(() => {
    if (confirmation) confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [confirmation])

  const chosenPet = isNewPatient
    ? newPetName.trim() || 'Paciente nuevo'
    : pets[Number(selectedPet)]?.name || `Mascota ${Number(selectedPet) + 1}`

  const whatsappLink = useMemo(() => {
    const message = [
      'Hola POWSI, quiero confirmar una cita.',
      `Mascota: ${isNewPatient ? newPetName.trim() || 'Paciente nuevo' : chosenPet}`,
      `Servicio: ${service}`,
      `Fecha: ${date}`,
      `Hora: ${selectedTime}`,
      `Contacto: ${phone}`,
      ...(notes.trim() ? [`Notas: ${notes.trim()}`] : []),
    ].join('\n')
    return `${whatsappUrl}?text=${encodeURIComponent(message)}`
  }, [chosenPet, date, isNewPatient, newPetName, notes, phone, selectedTime, service])

  function handlePetChange(event) {
    const value = event.target.value
    setSelectedPet(value)
    if (value !== 'new') setActiveIndex(Number(value))
    setConfirmation(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setConfirmation(null)
    setSaveError('')
    setCacheWarning('')
    if (!user?.id) {
      setSaveError('No se encontró una sesión para guardar la cita.')
      return
    }
    if (loading) {
      setSaveError('Espera a que termine de cargar la lista de mascotas.')
      return
    }

    const selectedProfile = isNewPatient ? null : pets[Number(selectedPet)]
    if (!isNewPatient && !selectedProfile) {
      setSaveError('Selecciona una mascota válida antes de continuar.')
      return
    }
    const petName = isNewPatient ? newPetName.trim() : selectedProfile.name || chosenPet
    if (!petName) {
      setSaveError('Escribe el nombre de la mascota.')
      return
    }

    setSaving(true)
    try {
      const { data, error: insertError } = await getSupabaseClient()
        .from('appointment_requests')
        .insert({
          owner_id: user.id,
          pet_profile_id: selectedProfile?.id ?? null,
          pet_name: petName,
          service,
          appointment_date: date,
          appointment_time: selectedTime,
          contact_phone: phone.trim() || null,
          notes: notes.trim(),
        })
        .select('pet_name, service, appointment_date, appointment_time, notes')
        .single()
      if (insertError) throw insertError

      const appointment = {
        pet: data.pet_name,
        service: data.service,
        date: data.appointment_date,
        time: String(data.appointment_time).slice(0, 5),
        notes: data.notes,
      }
      setConfirmation(appointment)
      try {
        localStorage.setItem(`woofyNextAppointment:${user.id}`, JSON.stringify(appointment))
      } catch (cacheError) {
        setCacheWarning(`La cita quedó guardada en Supabase, pero no se pudo actualizar el recordatorio local: ${cacheError.message}`)
      }
    } catch (error) {
      setSaveError(`No se pudo guardar la cita en Supabase: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section id="agendar" className="cream page-main" decorationIndex={0}>
      <SectionHeading title="Agendar cita" />
      {loading && <p role="status">Cargando perfiles...</p>}
      {error && <p role="alert">{error}</p>}
      <div className="appt">
        <AppointmentSteps />
        <form className="card form" onSubmit={handleSubmit}>
          <div className="fg">
            <label>Nombre de la mascota
              <select value={selectedPet} onChange={handlePetChange} required>
                {pets.map((pet, index) => (
                  <option key={pet.id} value={index}>{pet.name || `Mascota ${index + 1}`}</option>
                ))}
                <option value="new">+ Agregar mascota</option>
              </select>
            </label>
            <label>Servicio
              <select value={service} onChange={(event) => { setService(event.target.value); setConfirmation(null) }}>
                {serviceNames.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label>Fecha
              <input type="date" min={localDateString()} value={date} onChange={(event) => { setDate(event.target.value); setConfirmation(null) }} required />
            </label>
            <label>Contacto
              <input type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setConfirmation(null) }} />
            </label>
          </div>
          {isNewPatient && (
            <label className="new-patient-field">Nombre de la mascota
              <input
                ref={newPetInputRef}
                type="text"
                maxLength="40"
                placeholder="Indique nombre de mascota"
                value={newPetName}
                onChange={(event) => { setNewPetName(event.target.value); setConfirmation(null) }}
                required
              />
            </label>
          )}
          {isNewPatient && <p className="form-helper"><Icon>pets</Icon>Si es paciente nuevo, escribe su nombre aquí.</p>}
          <label>Notas para el veterinario
            <textarea
              rows="3"
              maxLength="500"
              placeholder="Síntomas, alergias, medicamentos o cuidados especiales"
              value={notes}
              onChange={(event) => { setNotes(event.target.value); setConfirmation(null) }}
            />
          </label>
          <div className="times" role="group" aria-label="Horarios disponibles">
            {availableTimes.map((time) => (
              <button
                className={`time${selectedTime === time ? ' sel' : ''}`}
                type="button"
                key={time}
                aria-pressed={selectedTime === time}
                onClick={() => { setSelectedTime(time); setConfirmation(null) }}
              >
                {time}
              </button>
            ))}
          </div>
          <Button variant="primary" type="submit" disabled={saving || loading}>Confirmar cita</Button>
          {saveError && <p role="alert">{saveError}</p>}
          {cacheWarning && <p role="status">{cacheWarning}</p>}
          {confirmation && (
            <div className="done show" ref={confirmationRef} role="status" aria-live="polite">
              <h3>Solicitud guardada</h3>
              <p>La solicitud quedó guardada en Supabase. La clínica debe confirmar la disponibilidad.</p>
              <p><b>Mascota:</b> {confirmation.pet} - <b>Servicio:</b> {confirmation.service}</p>
              <p><b>Fecha:</b> {confirmation.date} - <b>Hora:</b> {confirmation.time}</p>
              {confirmation.notes && <p><b>Notas:</b> {confirmation.notes}</p>}
              <br />
              <Button href={whatsappLink} className="yellow" target="_blank" rel="noreferrer">Confirmar por WhatsApp</Button>
            </div>
          )}
        </form>
      </div>
    </Section>
  )
}