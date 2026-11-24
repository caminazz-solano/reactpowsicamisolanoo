import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getSupabaseClient } from '../lib/supabase.js'

const defaultPet = {
  name: '',
  age: '',
  weight: '',
  type: '',
  breed: '',
  image: '',
}

function mapProfile(profile, notesByProfile) {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age == null ? '' : String(profile.age),
    weight: profile.weight == null ? '' : String(profile.weight),
    type: profile.species,
    breed: profile.breed ?? '',
    image: profile.image ?? '',
    notes: notesByProfile.get(profile.id) ?? [],
  }
}

function getProfilePayload(changes) {
  return {
    name: changes.name.trim(),
    age: changes.age === '' ? null : Number(changes.age),
    weight: changes.weight === '' ? null : Number(changes.weight),
    species: changes.type.trim(),
    breed: changes.breed.trim() || null,
    image: changes.image || null,
  }
}

export default function usePetProfiles() {
  const { user, configured } = useAuth()
  const [pets, setPets] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestId = useRef(0)

  const loadPets = useCallback(async () => {
    const request = ++requestId.current
    if (!configured || !user) {
      setPets([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const client = getSupabaseClient()
      const { data: profiles, error: profilesError } = await client
        .from('pet_profiles')
        .select('id, name, species, age, weight, breed, image')
        .order('name')
      if (profilesError) throw profilesError
      if (request !== requestId.current) return

      const profileIds = profiles.map((profile) => profile.id)
      let notesByProfile = new Map()
      if (profileIds.length) {
        const { data: notes, error: notesError } = await client
          .from('pet_notes')
          .select('id, profile_id, text')
          .in('profile_id', profileIds)
        if (notesError) throw notesError
        if (request !== requestId.current) return
        notesByProfile = notes.reduce((grouped, note) => {
          const current = grouped.get(note.profile_id) ?? []
          current.push(note)
          grouped.set(note.profile_id, current)
          return grouped
        }, new Map())
      }

      setPets(profiles.map((profile) => mapProfile(profile, notesByProfile)))
      setActiveIndex((current) => Math.min(current, Math.max(profiles.length - 1, 0)))
    } catch (loadError) {
      if (request === requestId.current) setError(loadError.message)
    } finally {
      if (request === requestId.current) setLoading(false)
    }
  }, [configured, user])

  useEffect(() => {
    loadPets()
  }, [loadPets])

  async function addPet() {
    const client = getSupabaseClient()
    const { data, error: insertError } = await client
      .from('pet_profiles')
      .insert({ owner_id: user.id, ...getProfilePayload(defaultPet) })
      .select('id, name, species, age, weight, breed, image')
      .single()
    if (insertError) {
      setError(insertError.message)
      throw insertError
    }
    const pet = mapProfile(data, new Map())
    setPets((current) => [...current, pet])
    setActiveIndex(pets.length)
    setError('')
    return pet
  }

  async function updatePet(id, changes) {
    const { data, error: updateError } = await getSupabaseClient()
      .from('pet_profiles')
      .update(getProfilePayload(changes))
      .eq('id', id)
      .select('id, name, species, age, weight, breed, image')
      .maybeSingle()
    if (updateError) {
      setError(updateError.message)
      throw updateError
    }
    if (!data) {
      const missingProfileError = new Error('El perfil no existe o no tienes permiso para modificarlo.')
      setError(missingProfileError.message)
      throw missingProfileError
    }
    setPets((current) => current.map((pet) => (
      pet.id === id ? mapProfile(data, new Map([[id, pet.notes]])) : pet
    )))
    setError('')
    return data
  }

  async function removePet(id) {
    const { data, error: deleteError } = await getSupabaseClient()
      .from('pet_profiles')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }
    if (!data) {
      const missingProfileError = new Error('El perfil no existe o no tienes permiso para eliminarlo.')
      setError(missingProfileError.message)
      throw missingProfileError
    }
    setPets((current) => current.filter((pet) => pet.id !== id))
    setActiveIndex((current) => Math.min(current, Math.max(pets.length - 2, 0)))
    setError('')
  }

  async function createNote(profileId, text) {
    const { data, error: insertError } = await getSupabaseClient()
      .from('pet_notes')
      .insert({ profile_id: profileId, text: text.trim() })
      .select('id, profile_id, text')
      .single()
    if (insertError) {
      setError(insertError.message)
      throw insertError
    }
    setPets((current) => current.map((pet) => (
      pet.id === profileId ? { ...pet, notes: [...pet.notes, data] } : pet
    )))
    setError('')
    return data
  }

  async function updateNote(noteId, profileId, text) {
    const { data, error: updateError } = await getSupabaseClient()
      .from('pet_notes')
      .update({ text: text.trim() })
      .eq('id', noteId)
      .select('id, profile_id, text')
      .maybeSingle()
    if (updateError) {
      setError(updateError.message)
      throw updateError
    }
    if (!data) {
      const missingNoteError = new Error('La nota no existe o ya no tienes permiso para modificarla.')
      setError(missingNoteError.message)
      throw missingNoteError
    }
    setPets((current) => current.map((pet) => (
      pet.id === profileId
        ? { ...pet, notes: pet.notes.map((note) => note.id === noteId ? data : note) }
        : pet
    )))
    setError('')
  }

  async function removeNote(noteId, profileId) {
    const { data, error: deleteError } = await getSupabaseClient()
      .from('pet_notes')
      .delete()
      .eq('id', noteId)
      .select('id')
      .maybeSingle()
    if (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }
    if (!data) {
      const missingNoteError = new Error('La nota no existe o no tienes permiso para eliminarla.')
      setError(missingNoteError.message)
      throw missingNoteError
    }
    setPets((current) => current.map((pet) => (
      pet.id === profileId
        ? { ...pet, notes: pet.notes.filter((note) => note.id !== noteId) }
        : pet
    )))
    setError('')
  }

  const selectedIndex = Math.min(activeIndex, Math.max(pets.length - 1, 0))
  return {
    pets,
    activeIndex: selectedIndex,
    setActiveIndex,
    currentPet: pets[selectedIndex],
    loading,
    error,
    addPet,
    updatePet,
    removePet,
    createNote,
    updateNote,
    removeNote,
    reload: loadPets,
  }
}

export { defaultPet }
