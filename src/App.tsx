
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
}

const shelterURL =
  'https://www.sanjoseca.gov/your-government/departments-offices/animal-care-services'

const pets: Pet[] = [
  {
    id: 'A1416116',
    name: 'Oreo',
    age: '2 years',
    ageMonths: 24,
    sex: 'Female (Spayed)',
    breed: 'Domestic Shorthair',
    color: 'Black / White',
    size: 'Medium',
    weight: '10 lbs',
    kennel: 'AI02',
    intake: '10/13/26',
    status: 'Available',
    species: 'Cats',
    image: '/images/oreo.jpg',
  },
  {
    id: 'A1412351',
    name: 'Whimze',
    age: '11 weeks',
    ageMonths: 2.5,
    sex: 'Female (Spayed)',
    breed: 'Domestic Shorthair',
    color: 'Tabby-Brown',
    size: 'Small',
    weight: '2 lbs',
    kennel: 'SD12',
    intake: '8/7/26',
    status: 'Available',
    species: 'Cats',
    image: '/images/whimze.jpg',
  },
  {
    id: 'A1412292',
    name: 'Lulu Lily',
    age: '4 months',
    ageMonths: 4,
    sex: 'Female (Spayed)',
    breed: 'Domestic Shorthair',
    color: 'Tabby-Brown',
    size: 'Small',
    weight: '5 lbs',
    kennel: 'AF03',
    intake: '8/6/26',
    status: 'Available',
    species: 'Cats',
    image: '/images/lulu-lily.jpg',
  },
  {
    id: 'A1407878',
    name: 'Nano',
    age: '6 months',
    ageMonths: 6,
    sex: 'Male (Neutered)',
    breed: 'Domestic Shorthair',
    color: 'Black',
    size: 'Small',
    weight: '6 lbs',
    kennel: 'KK01',
    intake: '5/23/26',
    status: 'Available',
    species: 'Cats',
    image: '/images/nano.jpg',
  },
  {
    id: 'A1415053',
    name: 'Tilly',
    age: '1 year, 1 month',
    ageMonths: 13,
    sex: 'Female (Spayed)',
    breed: 'Domestic Shorthair',
    color: 'Tabby-Brown',
    size: 'Medium',
    weight: '6 lbs',
    kennel: 'AI03',
    intake: '9/23/26',
    status: 'Available',
    species: 'Cats',
    image: '/images/tilly.jpg',
  },
  {
    id: 'A1413223',
    name: 'Nemo',
    age: '10 months',
    ageMonths: 10,
    sex: 'Male (Neutered)',
    breed: 'Domestic Shorthair',
    color: 'Gray',
    size: 'Medium',
    weight: '7 lbs',
    kennel: 'KM04',
    intake: '8/24/26',
    status: 'Available',
    species: 'Cats',
    image: '/images/nemo.jpg',
  },
]

const categories = [
  { name: 'Dogs', icon: '🐕' },
  { name: 'Cats', icon: '🐈' },
  { name: 'Small Animals', icon: '🐇' },
  { name: 'Birds', icon: '🐦' },
  { name: 'All Animals', icon: '🐾' },
]

function App() {
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
  const url =
    'https://geo.sanjoseca.gov/server/rest/services/DPW/DPW_AnimalCareServices/MapServer/1/query'

  const params = new URLSearchParams({
    where: "ANIMALSTATUS='Available'",
    outFields: 'ANIMALID,PETNAME,ANIMALTYPE,PHOTOLINK',
    returnGeometry: 'false',
    resultRecordCount: '3',
    f: 'json',
  })

  fetch(`${url}?${params}`)
    .then((response) => response.json())
    .then((data) => console.log('Shelter animals:', data.features))
    .catch((error) => console.error('Shelter API error:', error))
}, [])

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
      `${pet.name} ${pet.id} ${pet.breed} ${pet.kennel}`
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
      (age === 'Baby' && pet.ageMonths < 6) ||
      (age === 'Young' &&
        pet.ageMonths >= 6 &&
        pet.ageMonths < 24) ||
      (age === 'Adult' && pet.ageMonths >= 24)

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
          <a href="#animals">Adopt</a>
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
            <span className="eyebrow">SAN JOSÉ ANIMAL CARE</span>

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
                    category === item.name ? 'category active' : 'category'
                  }
                  onClick={() => selectCategory(item.name)}
                >
                  <span className="category-icon">{item.icon}</span>
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
              <p>Give a pet a second chance at a happy life.</p>
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
              <p>Provide a temporary home and save lives.</p>
              <a href={shelterURL} target="_blank" rel="noreferrer">
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
              <p>Make a difference in your community.</p>
              <a href={shelterURL} target="_blank" rel="noreferrer">
                Get Involved →
              </a>
            </div>
          </article>
        </section>

        <section className="featured" id="animals">
          <div className="section-heading">
            <div>
              <h2>Featured Animals</h2>
              <p>
                Explore our shelter listing snapshot and find a companion.
              </p>
            </div>
            <button className="text-button" onClick={clearFilters}>
              View All Animals →
            </button>
          </div>

          <div className="filter-bar">
            <label>
              Animal Type
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </label>

            <label>
              Age
              <select
                value={age}
                onChange={(event) => setAge(event.target.value)}
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
                onChange={(event) => setSize(event.target.value)}
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
                onChange={(event) => setSex(event.target.value)}
              >
                <option>All Sexes</option>
                <option>Female</option>
                <option>Male</option>
              </select>
            </label>

            <button className="clear-button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          <p className="results-count">
            {filteredPets.length} animals found
            {showFavorites ? ' · Favorites only' : ''}
          </p>

          <div className="pet-grid">
            {filteredPets.map((pet) => (
              <article className="pet-card" key={pet.id}>
                <div className="pet-image">
                  <img src={pet.image} alt={pet.name} />
                  <span className="status">Available*</span>

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
                    {favorites.includes(pet.id) ? '♥' : '♡'}
                  </button>
                </div>

                <div className="pet-information">
                  <h3>{pet.name}</h3>
                  <p className="pet-id">ID: {pet.id}</p>

                  <div className="pet-facts">
                    <p>♧ {pet.sex}</p>
                    <p>▣ {pet.age}</p>
                    <p>♧ {pet.breed}</p>
                    <p>◈ {pet.color}</p>
                    <p>♧ {pet.size} ({pet.weight})</p>
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
              <p>Try changing your filters or search.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}

          <p className="sample-note">
            *Historical shelter listing snapshot. Availability, ages,
            and kennel assignments may have changed. Confirm details
            with San José Animal Care & Services.
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
              The City of San José Animal Care & Services protects
              and enhances the quality of life for animals and
              people in our community through compassionate care,
              education, and sheltering services.
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

            <img
              src={selectedPet.image}
              alt={selectedPet.name}
            />

            <div className="modal-content">
              <h2>{selectedPet.name}</h2>
              <p className="pet-id">ID: {selectedPet.id}</p>

              <div className="modal-facts">
                <p><strong>Age:</strong> {selectedPet.age}</p>
                <p><strong>Sex:</strong> {selectedPet.sex}</p>
                <p><strong>Breed:</strong> {selectedPet.breed}</p>
                <p><strong>Color:</strong> {selectedPet.color}</p>
                <p><strong>Size:</strong> {selectedPet.size}</p>
                <p><strong>Weight:</strong> {selectedPet.weight}</p>
                <p><strong>Ken​​nel:</strong> {selectedPet.kennel}</p>
                <p><strong>Intake:</strong> {selectedPet.intake}</p>
                <p><strong>Snapshot status:</strong> {selectedPet.status}</p>
              </div>

              <p className="modal-note">
                Please verify this animal's current availability
                with the shelter before visiting.
              </p>

              <a
                className="pet-button"
                href={shelterURL}
                target="_blank"
                rel="noreferrer"
              >
                Contact the Shelter
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
