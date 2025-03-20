import { useState, useEffect } from 'react'
import './App.css'
import goldenCookieSvg from './assets/golden-cookie.svg'
import chocolateCookieSvg from './assets/chocolate-cookie.svg'

function App() {
  const [cookies, setCookies] = useState(0)
  const [cookiesPerClick, setCookiesPerClick] = useState(1)
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0)
  const [buildings, setBuildings] = useState([
    { id: 1, name: 'Cursor', owned: 0, baseCost: 15, baseCps: 0.1, description: 'Autoclicks once every 10 seconds.' },
    { id: 2, name: 'Grandma', owned: 0, baseCost: 100, baseCps: 1, description: 'A nice grandma to bake more cookies.' },
    { id: 3, name: 'Farm', owned: 0, baseCost: 1100, baseCps: 8, description: 'Grows cookie plants from cookie seeds.' },
    { id: 4, name: 'Mine', owned: 0, baseCost: 12000, baseCps: 47, description: 'Mines out cookie dough and chocolate chips.' },
    { id: 5, name: 'Factory', owned: 0, baseCost: 130000, baseCps: 260, description: 'Produces large quantities of cookies.' },
  ])
  const [showGoldenCookie, setShowGoldenCookie] = useState(false)
  const [goldenCookiePosition, setGoldenCookiePosition] = useState({ top: 0, left: 0 })
  const [activeBonuses, setActiveBonuses] = useState([])

  // Click the cookie
  const handleCookieClick = () => {
    setCookies(cookies + cookiesPerClick * getClickMultiplier())
  }

  // Get multiplier for clicking (based on active bonuses)
  const getClickMultiplier = () => {
    // Check for Click Frenzy bonus
    const clickFrenzy = activeBonuses.find(bonus => bonus.type === 'clickFrenzy')
    if (clickFrenzy) return 777
    
    // Check for regular Frenzy bonus
    const frenzy = activeBonuses.find(bonus => bonus.type === 'frenzy')
    if (frenzy) return 7
    
    return 1
  }

  // Get multiplier for CPS (based on active bonuses)
  const getCpsMultiplier = () => {
    const frenzy = activeBonuses.find(bonus => bonus.type === 'frenzy')
    return frenzy ? 7 : 1
  }

  // Calculate building cost (increases with each purchase)
  const getBuildingCost = (building) => {
    return Math.ceil(building.baseCost * Math.pow(1.15, building.owned))
  }

  // Purchase a building
  const purchaseBuilding = (buildingId) => {
    const updatedBuildings = buildings.map(building => {
      if (building.id === buildingId) {
        const cost = getBuildingCost(building)
        if (cookies >= cost) {
          setCookies(cookies - cost)
          return { ...building, owned: building.owned + 1 }
        }
      }
      return building
    })
    setBuildings(updatedBuildings)
  }

  // Calculate total CPS from all buildings
  const calculateTotalCps = () => {
    return buildings.reduce((total, building) => {
      return total + (building.owned * building.baseCps)
    }, 0) * getCpsMultiplier()
  }

  // Spawn Golden Cookie randomly
  const spawnGoldenCookie = () => {
    const maxHeight = window.innerHeight - 100
    const maxWidth = window.innerWidth - 100
    
    setGoldenCookiePosition({
      top: Math.floor(Math.random() * maxHeight),
      left: Math.floor(Math.random() * maxWidth)
    })
    
    setShowGoldenCookie(true)
    
    // Golden cookie disappears after 13 seconds
    setTimeout(() => {
      setShowGoldenCookie(false)
    }, 13000)
  }

  // Click Golden Cookie
  const handleGoldenCookieClick = () => {
    setShowGoldenCookie(false)
    
    // Randomly choose an effect
    const random = Math.random()
    
    if (random < 0.5) {
      // Lucky! (gain cookies)
      const reward = Math.min(0.15 * cookies, cookiesPerSecond * 900)
      setCookies(cookies + reward)
      alert(`Lucky! You got ${Math.round(reward)} cookies!`)
    } else if (random < 0.9) {
      // Frenzy (7x production for 77 seconds)
      setActiveBonuses([...activeBonuses, { 
        type: 'frenzy', 
        duration: 77,
        startTime: Date.now() 
      }])
      alert('Frenzy! 7x cookie production for 77 seconds!')
    } else {
      // Click Frenzy (777x cookies per click for 13 seconds)
      setActiveBonuses([...activeBonuses, { 
        type: 'clickFrenzy', 
        duration: 13,
        startTime: Date.now() 
      }])
      alert('Click Frenzy! 777x cookies per click for 13 seconds!')
    }
  }

  // Update cookies based on CPS
  useEffect(() => {
    const cps = calculateTotalCps()
    setCookiesPerSecond(cps)
    
    const timer = setInterval(() => {
      setCookies(cookies => cookies + cps / 10)
    }, 100)
    
    return () => clearInterval(timer)
  }, [buildings, activeBonuses])

  // Check and update active bonuses
  useEffect(() => {
    const bonusTimer = setInterval(() => {
      const now = Date.now()
      const updatedBonuses = activeBonuses.filter(bonus => {
        return (now - bonus.startTime) / 1000 < bonus.duration
      })
      
      if (updatedBonuses.length !== activeBonuses.length) {
        setActiveBonuses(updatedBonuses)
      }
    }, 1000)
    
    return () => clearInterval(bonusTimer)
  }, [activeBonuses])

  // Randomly spawn golden cookies
  useEffect(() => {
    const minTime = 300 * 1000  // 5 minutes in ms
    const maxTime = 900 * 1000  // 15 minutes in ms
    
    const spawnTime = Math.random() * (maxTime - minTime) + minTime
    
    // For demo purposes, make golden cookies spawn much more frequently
    const demoSpawnTime = spawnTime / 30
    
    const goldenCookieTimer = setTimeout(() => {
      spawnGoldenCookie()
    }, demoSpawnTime)
    
    return () => clearTimeout(goldenCookieTimer)
  }, [showGoldenCookie])

  // Format numbers with commas and abbreviations
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return Math.floor(num).toLocaleString()
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Cookie Clicker</h1>
        <div className="stats">
          <p>Cookies: {formatNumber(cookies)}</p>
          <p>Per second: {cookiesPerSecond}</p>
          <p>Per click: {formatNumber(cookiesPerClick * getClickMultiplier())}</p>
        </div>
      </header>
      
      <main>
        <div className="cookie-container">
          <img src={chocolateCookieSvg} className="cookie" onClick={handleCookieClick} alt="Cookie" />
        </div>
        
        <div className="buildings">
          <h2>Buildings</h2>
          <ul>
            {buildings.map(building => (
              <li key={building.id} className={cookies >= getBuildingCost(building) ? 'available' : 'unavailable'}>
                <div className="building-info">
                  <h3>{building.name} ({building.owned})</h3>
                  <p>{building.description}</p>
                  <p>Produces {building.baseCps} cookies per second</p>
                </div>
                <button 
                  onClick={() => purchaseBuilding(building.id)}
                  disabled={cookies < getBuildingCost(building)}
                >
                  Buy: {formatNumber(getBuildingCost(building))}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
      
      {showGoldenCookie && (
        <img 
          src={goldenCookieSvg} 
          className="golden-cookie" 
          style={{ top: goldenCookiePosition.top + 'px', left: goldenCookiePosition.left + 'px' }}
          onClick={handleGoldenCookieClick}
          alt="Golden Cookie"
        />
      )}
      
      {activeBonuses.length > 0 && (
        <div className="active-bonuses">
          <h3>Active Bonuses:</h3>
          <ul>
            {activeBonuses.map((bonus, index) => {
              const timeLeft = Math.ceil(bonus.duration - (Date.now() - bonus.startTime) / 1000)
              return (
                <li key={index}>
                  {bonus.type === 'frenzy' ? 'Frenzy: 7x production' : 'Click Frenzy: 777x per click'} 
                  ({timeLeft}s)
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App
