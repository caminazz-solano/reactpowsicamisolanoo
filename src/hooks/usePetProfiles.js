import { useEffect, useState } from 'react'

const defaultPet = {
  name: '',
  age: '3',
  weight: '',
  type: 'Perro',
  breed: 'Golden Retriever',
  notes: '',
  image: '',
}

function readPets() {
  try {
    const savedPets = JSON.parse(localStorage.getItem('woofyPets'))
    if (Array.isArray(savedPets) && savedPets.length) {
      return savedPets.map((pet, index) => ({ ...defaultPet, ...pet, id: pet.id ?? `pet-${index + 1}` }))
    }

    const oldProfile = JSON.parse(localStorage.getItem('woofyPetProfile'))
    return [{ ...defaultPet, ...(oldProfile ?? {}), id: 'pet-1' }]
  } catch {
    return [{ ...defaultPet, id: 'pet-1' }]
  }
}

function readActiveIndex() {
  try {
    const index = Number(localStorage.getItem('woofyActivePet'))
    return Number.isInteger(index) && index >= 0 ? index : 0
  } catch {
    return 0
  }
}

export default function usePetProfiles() {
  const [pets, setPets] = useState(readPets)
  const [activeIndex, setActiveIndex] = useState(readActiveIndex)
  const selectedIndex = Math.min(activeIndex, pets.length - 1)

  useEffect(() => {
    try {
      localStorage.setItem('woofyPets', JSON.stringify(pets))
      localStorage.setItem('woofyPetProfile', JSON.stringify(pets[selectedIndex]))
      localStorage.setItem('woofyActivePet', String(selectedIndex))
    } catch {
      // El perfil sigue disponible durante la sesión si el almacenamiento está lleno o bloqueado.
    }
  }, [pets, selectedIndex])

  function updatePet(index, changes) {
    setPets((currentPets) => currentPets.map((pet, petIndex) => (
      petIndex === index ? { ...pet, ...changes } : pet
    )))
  }

  return {
    pets,
    setPets,
    activeIndex: selectedIndex,
    setActiveIndex,
    currentPet: pets[selectedIndex],
    updatePet,
  }
}

export { defaultPet }