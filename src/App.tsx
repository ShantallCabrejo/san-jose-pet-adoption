
import { useEffect, useState } from 'react'
import './App.css'

type Pet = {
  id: string
  name: string
  age: string
  ageMonths: number
  sex: string
  breed: string
  color: string
  size: string
  weight: string
  kennel: string
  intake: string
  status: string
  species: string
  image: string
  profileUrl: string
  rescueStatus: string
  fosterStatus: string
}

type ShelterAnimal = {
  ANIMALID: string | null
  PETNAME: string | null
  ANIMALTYPE: string | null
  ANIMALSUBTYPE: string | null
  SEX: string | null
  PETAGE: string | null
  PETAGEYEARS: number | null
  PETSIZE: string | null
  PETWEIGHT: number | string | null
  COLOR: string | null
  BREED: string | null
  KENNELNAME: string | null
  INDATE: number | null
  ANIMALSTATUS: string | null
  RESCUESTATUS: string | null
  FOSTERSTATUS: string | null
  PHOTOLINK: string | null
  WEBLINK: string | null
}

type ShelterResponse = {
  features?: { attributes: ShelterAnimal }[]
  exceededTransferLimit?: boolean
  error?: { message?: string }
}

const shelterURL =
  'https://www.sanjoseca.gov/your-government/departments-offices/animal-care-services'

const API_URL =
  'https://geo.sanjoseca.gov/server/rest/services/DPW/DPW_AnimalCareServices/MapServer/1/query'

const categories = [
  { name: 'Dogs', icon: '🐕' },
  { name: 'Cats', icon: '🐈' },
  { name: 'Small Animals', icon: '🐇' },
  { name: 'Birds', icon: '🐦' },
  { name: 'All Animals', icon: '🐾' },
]

function getSpecies(typeValue: string | null) {
  const type = (typeValue || '').toLowerCase()

  if (type.includes('dog')) return 'Dogs'
  if (type.includes('cat')) return 'Cats'
  if (type.includes('bird')) return 'Birds'
  return 'Small Animals'
}

function getAgeMonths(
  ageText: string | null,
  ageYears: number | null
) {
  const age = ageText || ''

  const years = age.match(/(\d+)\s*years?/i)
  const months = age.match(/(\d+)\s*months?/i)
  const weeks = age.match(/(\d+)\s*weeks?/i)

  if (years || months || weeks) {
    return (
      (years ? Number(years[1]) * 12 : 0) +
      (months ? Number(months[1]) : 0) +
      (weeks ? Number(weeks[1]) / 4.345 : 0)
    )
  }

  if (typeof ageYears === 'number' && ageYears >= 0) {
    return ageYears * 12
  }

  return -1
}

function convertAnimal(animal: ShelterAnimal): Pet {
  const sizeValue = (animal.PETSIZE || '').toLowerCase()

  const size =
    sizeValue.includes('small') ? 'Small' :
    sizeValue.includes('medium') ? 'Medium' :
    sizeValue.includes('large') ? 'Large' :
    animal.PETSIZE || 'Unknown'

  const sexValue = animal.SEX || 'Unknown'
  const sexLower = sexValue.toLowerCase()

  const sex =
    sexLower.startsWith('f') ? `Female${sexValue.length > 1 ? ` (${sexValue})` : ''}` :
    sexLower.startsWith('m') ? `Male${sexValue.length > 1 ? ` (${sexValue})` : ''}` :
    sexValue

  const weight =
    animal.PETWEIGHT === null ||
    animal.PETWEIGHT === ''
      ? 'Unknown'
      : `${animal.PETWEIGHT} lbs`

  return {
    id: animal.ANIMALID || '',
    name: animal.PETNAME || 'Unnamed Animal',
    age: animal.PETAGE || 'Age unknown',
    ageMonths: getAgeMonths(animal.PETAGE, animal.PETAGEYEARS),
    sex,
    breed: animal.BREED || 'Unknown',
    color: animal.COLOR || 'Unknown',
    size,
    weight,
    kennel: animal.KENNELNAME || 'Not listed',
    intake: animal.INDATE
      ? new Date(animal.INDATE).toLocaleDateString()
      : 'Unknown',
    status: animal.ANIMALSTATUS || 'Status unknown',
    species: getSpecies(animal.ANIMALTYPE),
    image: animal.PHOTOLINK || '',
    profileUrl: animal.WEBLINK || '',
    rescueStatus: animal.RESCUESTATUS || '',
    fosterStatus: animal.FOSTERSTATUS || '',
  }
}

function PetPhoto({
  image,
  name,
}: {
  image: string
  name: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [image])

  if (!image || failed) {
    return (
      <div className="photo-placeholder">
        🐾
        <p>No photo available</p>
      </div>
    )
  }

  return (
    <img
      src={image}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function App() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Animals')
  const [size, setSize] = useState('All Sizes')
  const [sex, setSex] = useState('All Sexes')
  const [age, setAge] = useState('All Ages')
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pet-favorites')
      const parsed: unknown = saved ? JSON.parse(saved) : []

      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('pet-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    const controller = new AbortController()

    async function loadAnimals() {
      setLoading(true)
      setError('')

      try {
        const allAnimals: Pet[] = []
        const pageSize = 1000
        let offset = 0

        while (true) {
          const params = new URLSearchParams({
            where: '1=1',
            outFields:
              'ANIMALID,PETNAME,ANIMALTYPE,ANIMALSUBTYPE,SEX,PETAGE,PETAGEYEARS,PETSIZE,PETWEIGHT,COLOR,BREED,KENNELNAME,INDATE,ANIMALSTATUS,RESCUESTATUS,FOSTERSTATUS,PHOTOLINK,WEBLINK',
            returnGeometry: 'false',
            resultOffset: String(offset),
            resultRecordCount: String(pageSize),
            orderByFields: 'OBJECTID ASC',
            f: 'json',
          })

          const response = await fetch(
            `${API_URL}?${params}`,
            { signal: controller.signal }
          )

          if (!response.ok) {
            throw new Error('The shelter server did not respond.')
          }

          const data: ShelterResponse = await response.json()

          if (data.error || !Array.isArray(data.features)) {
            throw new Error(
              data.error?.message || 'Invalid shelter data.'
            )
          }

          const page = data.features

          allAnimals.push(
            ...page
              .map((item) => convertAnimal(item.attributes))
              .filter((pet) => pet.id !== '')
          )

          if (
            page.length === 0 ||
            (!data.exceededTransferLimit && page.length < pageSize)
          ) {
            break
          }

          offset += page.length
        }

        const uniquePets = Array.from(
          new Map(allAnimals.map((pet) => [pet.id, pet])).values()
        )

        if (!controller.signal.aborted) {
          setPets(uniquePets)
          setLastUpdated(new Date().toLocaleString())
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Shelter API error:', err)
          setError(
            'Unable to load shelter animals. Please try again.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadAnimals()

    return () => controller.abort()
  }, [refreshCount])

  function toggleFavorite(id: string) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  function goToAnimals() {
    document.getElementById('animals')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  function selectCategory(name: string) {
    setCategory(name)
    setShowFavorites(false)
    goToAnimals()
  }

  function clearFilters() {
    setSearch('')
    setCategory('All Animals')
    setSize('All Sizes')
    setSex('All Sexes')
    setAge('All Ages')
    setShowFavorites(false)
  }

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      `${pet.name} ${pet.id} ${pet.breed} ${pet.kennel} ${pet.status}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())

    const matchesCategory =
      category === 'All Animals' || pet.species === category

    const matchesSize =
      size === 'All Sizes' || pet.size === size

    const matchesSex =
      sex === 'All Sexes' || pet.sex.startsWith(sex)

    const matchesAge =
      age === 'All Ages' ||
      (pet.ageMonths >= 0 &&
        ((age === 'Baby' && pet.ageMonths < 6) ||
          (age === 'Young' &&
            pet.ageMonths >= 6 &&
            pet.ageMonths < 24) ||
          (age === 'Adult' && pet.ageMonths >= 24)))

    const matchesFavorite =
      !showFavorites || favorites.includes(pet.id)

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSize &&
      matchesSex &&
      matchesAge &&
      matchesFavorite
    )
  })

  return (
    <div className="site">
      <header className="navbar" id="home">
        <a className="brand" href="#home">
          <img
            src="/images/san-jose-logo.png"
            alt="City of San José"
            className="city-logo"
          />
          <div className="brand-text">
            <strong>Animal Care & Services</strong>
            <small>People · Pets · Community</small>
          </div>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#animals">Animals</a>
          <a href={shelterURL} target="_blank" rel="noreferrer">
            Lost & Found
          </a>
          <a href="#mission">Services</a>
          <a href="#help">Get Involved</a>
          <a href="#mission">About</a>
        </nav>

        <div className="nav-actions">
          <button
            className="favorites-link"
            aria-label="Show favorite animals"
            aria-pressed={showFavorites}
            onClick={() => {
              setShowFavorites(!showFavorites)
              goToAnimals()
            }}
          >
            {showFavorites ? '♥' : '♡'}
            <span>{favorites.length}</span>
          </button>

          <a
            className="donate-button"
            href={shelterURL}
            target="_blank"
            rel="noreferrer"
          >
            Donate
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              SAN JOSÉ ANIMAL CARE
            </span>

            <h1>
              Find Your
              <br />
              New Best Friend
            </h1>

            <p>Adopt · Foster · Volunteer · Support</p>

            <form
              className="hero-search"
              onSubmit={(event) => {
                event.preventDefault()
                goToAnimals()
              }}
            >
              <span aria-hidden="true">⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or animal ID..."
                aria-label="Search by name or animal ID"
              />

              <button type="submit">Search</button>
            </form>

            <div className="animal-categories">
              {categories.map((item) => (
                <button
                  key={item.name}
                  className={
                    category === item.name
                      ? 'category active'
                      : 'category'
                  }
                  onClick={() => selectCategory(item.name)}
                >
                  <span className="category-icon">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="action-grid" id="help">
          <article className="action-card">
            <img
              src="/images/adopt.jpg"
              alt="Dog waiting for adoption"
            />
            <div>
              <h3>Adopt</h3>
              <p>
                Give a pet a second chance at a happy life.
              </p>
              <a href="#animals">View Animals →</a>
            </div>
          </article>

          <article className="action-card">
            <img
              src="/images/foster.jpg"
              alt="Cat in a foster home"
            />
            <div>
              <h3>Foster</h3>
              <p>
                Provide a temporary home and save lives.
              </p>
              <a
                href={shelterURL}
                target="_blank"
                rel="noreferrer"
              >
                Learn More →
              </a>
            </div>
          </article>

          <article className="action-card">
            <img
              src="/images/volunteer.jpg"
              alt="Dog looking at camera"
            />
            <div>
              <h3>Volunteer</h3>
              <p>
                Make a difference in your community.
              </p>
              <a
                href={shelterURL}
                target="_blank"
                rel="noreferrer"
              >
                Get Involved →
              </a>
            </div>
          </article>
        </section>

        <section className="featured" id="animals">
          <div className="section-heading">
            <div>
              <h2>Animals at the Shelter</h2>
              <p>
                Explore current animal listings from San José
                Animal Care & Services.
              </p>
            </div>

            <button
              className="text-button"
              onClick={clearFilters}
            >
              View All Animals →
            </button>
          </div>

          <div className="filter-bar">
            <label>
              Animal Type
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                {categories.map((item) => (
                  <option key={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Age
              <select
                value={age}
                onChange={(event) =>
                  setAge(event.target.value)
                }
              >
                <option>All Ages</option>
                <option>Baby</option>
                <option>Young</option>
                <option>Adult</option>
              </select>
            </label>

            <label>
              Size
              <select
                value={size}
                onChange={(event) =>
                  setSize(event.target.value)
                }
              >
                <option>All Sizes</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </label>

            <label>
              Sex
              <select
                value={sex}
                onChange={(event) =>
                  setSex(event.target.value)
                }
              >
                <option>All Sexes</option>
                <option>Female</option>
                <option>Male</option>
              </select>
            </label>

            <button
              className="clear-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          {loading && (
            <p role="status">
              Loading live shelter animals...
            </p>
          )}

          {error && (
            <div className="empty-results" role="alert">
              <p>{error}</p>
              <button
                onClick={() =>
                  setRefreshCount((count) => count + 1)
                }
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="results-count">
                {filteredPets.length} animals found
                {showFavorites ? ' · Favorites only' : ''}
              </p>

              {lastUpdated && (
                <p className="sample-note">
                  Data retrieved: {lastUpdated}
                  {' · '}
                  <button
                    className="text-button"
                    onClick={() =>
                      setRefreshCount((count) => count + 1)
                    }
                  >
                    Refresh Animals
                  </button>
                </p>
              )}

              <div className="pet-grid">
                {filteredPets.map((pet) => (
                  <article className="pet-card" key={pet.id}>
                    <div className="pet-image">
                      <PetPhoto
                        image={pet.image}
                        name={pet.name}
                      />

                      <span className="status">
                        {pet.status}
                      </span>

                      <button
                        className="heart"
                        aria-label={
                          favorites.includes(pet.id)
                            ? `Remove ${pet.name} from favorites`
                            : `Add ${pet.name} to favorites`
                        }
                        aria-pressed={favorites.includes(pet.id)}
                        onClick={() => toggleFavorite(pet.id)}
                      >
                        {favorites.includes(pet.id)
                          ? '♥'
                          : '♡'}
                      </button>
                    </div>

                    <div className="pet-information">
                      <h3>{pet.name}</h3>
                      <p className="pet-id">
                        ID: {pet.id}
                      </p>

                      <div className="pet-facts">
                        <p>♧ {pet.sex}</p>
                        <p>▣ {pet.age}</p>
                        <p>♧ {pet.breed}</p>
                        <p>◈ {pet.color}</p>
                        <p>
                          ♧ {pet.size} ({pet.weight})
                        </p>
                      </div>

                      <button
                        className="pet-button"
                        onClick={() => setSelectedPet(pet)}
                      >
                        Meet {pet.name}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredPets.length === 0 && (
                <div className="empty-results">
                  <h3>No animals found</h3>
                  <p>
                    Try changing your filters or search.
                  </p>
                  <button onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}

          <p className="sample-note">
            Animal information comes from San José Animal
            Care & Services. Shelter statuses and listings
            may change. An animal listed as available is not
            necessarily eligible for immediate adoption.
            Always confirm details with the official shelter.
          </p>
        </section>

        <section className="mission" id="mission">
          <img
            src="/images/mission.jpg"
            alt="Animal care volunteer holding a cat"
          />

          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              The City of San José Animal Care & Services
              protects and enhances the quality of life for
              animals and people in our community through
              compassionate care, education, and sheltering
              services.
            </p>

            <a
              className="donate-button"
              href={shelterURL}
              target="_blank"
              rel="noreferrer"
            >
              Learn About Us
            </a>
          </div>
        </section>
      </main>

      <footer>
        <strong>San José Animal Care & Services</strong>
        <p>
          Independent website redesign concept.
          Not an official City of San José website.
        </p>
      </footer>

      {selectedPet && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPet(null)}
        >
          <section
            className="pet-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPet.name} animal details`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close details"
              onClick={() => setSelectedPet(null)}
            >
              ×
            </button>

            <PetPhoto
              image={selectedPet.image}
              name={selectedPet.name}
            />

            <div className="modal-content">
              <h2>{selectedPet.name}</h2>
              <p className="pet-id">
                ID: {selectedPet.id}
              </p>

              <div className="modal-facts">
                <p>
                  <strong>Age:</strong> {selectedPet.age}
                </p>
                <p>
                  <strong>Sex:</strong> {selectedPet.sex}
                </p>
                <p>
                  <strong>Breed:</strong> {selectedPet.breed}
                </p>
                <p>
                  <strong>Color:</strong> {selectedPet.color}
                </p>
                <p>
                  <strong>Size:</strong> {selectedPet.size}
                </p>
                <p>
                  <strong>Weight:</strong> {selectedPet.weight}
                </p>
                <p>
                  <strong>Kennel:</strong> {selectedPet.kennel}
                </p>
                <p>
                  <strong>Intake:</strong> {selectedPet.intake}
                </p>
                <p>
                  <strong>Shelter status:</strong>{' '}
                  {selectedPet.status}
                </p>

                {selectedPet.rescueStatus && (
                  <p>
                    <strong>Rescue:</strong>{' '}
                    {selectedPet.rescueStatus}
                  </p>
                )}

                {selectedPet.fosterStatus && (
                  <p>
                    <strong>Foster:</strong>{' '}
                    {selectedPet.fosterStatus}
                  </p>
                )}
              </div>

              <p className="modal-note">
                Please verify this animal's current status
                and adoption or rescue eligibility with
                the shelter before visiting.
              </p>

              <a
                className="pet-button"
                href={selectedPet.profileUrl || shelterURL}
                target="_blank"
                rel="noreferrer"
              >
                View Official Animal Profile
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
