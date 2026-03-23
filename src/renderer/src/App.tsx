import { useState } from 'react'
import axios from 'axios'

/* Search Bar Component */
function SearchBar({ city, setCity, onSearch }: any) {
  return (
    <>
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{
          padding: '12px',
          fontSize: '20px',
          width: '250px',
          borderRadius: '8px'
        }}
      />

      <br /><br />

      <button
        onClick={onSearch}
        style={{
          padding: '12px 24px',
          fontSize: '20px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Get Weather
      </button>
    </>
  )
}

/* Error Message Component */
function ErrorMessage({ message }: any) {
  return (
    <p style={{ color: 'red', fontSize: '22px' }}>
      {message}
    </p>
  )
}

/* Weather Display Component */
function WeatherDisplay({ weather }: any) {
  return (
    <div style={{ marginTop: '30px' }}>
      <h2 style={{ fontSize: '36px' }}>{weather.name}</h2>
      <p style={{ fontSize: '28px' }}>
        🌡️ Temp: {weather.main.temp} °C
      </p>
      <p style={{ fontSize: '28px' }}>
        ☁️ Condition: {weather.weather[0].main}
      </p>
    </div>
  )
}

/* Main App Component */
function App(): React.JSX.Element {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<any>(null)
  const [error, setError] = useState('')

  const API_KEY = '6590d269f289da55c023d4af598cfffd'

  const getWeather = async () => {
    try {
      setError('')
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      )
      setWeather(res.data)
    } catch (err) {
      setError('City not found')
      setWeather(null)
    }
  }

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '80px',
        fontSize: '20px',
        fontFamily: 'Arial'
      }}
    >
      <h1 style={{ fontSize: '48px' }}>🌦️ Weather App</h1>

      <SearchBar city={city} setCity={setCity} onSearch={getWeather} />

      {error && <ErrorMessage message={error} />}

      {weather && <WeatherDisplay weather={weather} />}
    </div>
  )
}

export default App