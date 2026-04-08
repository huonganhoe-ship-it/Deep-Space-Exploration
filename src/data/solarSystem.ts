export interface MissionLog {
  timestamp: string;
  source: 'LCC' | 'MCC' | 'HISTORICAL' | 'ORION' | 'BOOSTER' | 'EECOM' | 'GNC' | 'RANGE';
  message: string;
}

export interface CelestialObject {
  id: string;
  name: string;
  type: 'planet' | 'satellite' | 'star';
  isArtificial?: boolean;
  distanceFromEarth: string; // in km
  temperature: number; // in Celsius
  naturalOrbit?: string; // what it orbits
  artificialOrbit?: string; // artificial satellites orbiting it
  description: string;
  color: string;
  size: number; // relative size for visualization
  orbitRadius: number; // relative orbit radius
  orbitalPeriod?: number; // in Earth days
  timeType?: string; // e.g. "Sol Day", "Solar", "Rapid"
  hideOrbit?: boolean;
  satellites?: CelestialObject[];
  missionLogs?: MissionLog[];
  achievements?: string[];
  speed?: number; // in km/h
  isPlanned?: boolean;
  imageUrl?: string;
}

export const SOLAR_SYSTEM_DATA: CelestialObject[] = [
  {
    id: 'sun',
    name: 'Sun',
    type: 'star',
    distanceFromEarth: '149.6 million',
    temperature: 5500,
    description: 'The star at the center of the Solar System.',
    color: '#FDB813',
    size: 40,
    orbitRadius: 0,
    timeType: 'Solar',
    speed: 720000, // around galactic center
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    distanceFromEarth: '77 million',
    temperature: 167,
    naturalOrbit: 'Sun',
    description: 'The smallest and innermost planet in the Solar System.',
    color: '#A5A5A5',
    size: 8,
    orbitRadius: 60,
    orbitalPeriod: 88,
    timeType: 'Rapid',
    speed: 170500,
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    distanceFromEarth: '41 million',
    temperature: 464,
    naturalOrbit: 'Sun',
    description: 'Often called Earth\'s sister planet due to their similar size.',
    color: '#E3BB76',
    size: 12,
    orbitRadius: 90,
    orbitalPeriod: 224.7,
    timeType: 'Retrograde',
    speed: 126070,
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    distanceFromEarth: '0',
    temperature: 15,
    naturalOrbit: 'Sun',
    artificialOrbit: 'ISS, Hubble, Starlink',
    description: 'Our home planet, the only known place to support life.',
    color: '#2271B3',
    size: 13,
    orbitRadius: 130,
    orbitalPeriod: 365.25,
    timeType: 'Earth Standard',
    speed: 107200,
    satellites: [
      {
        id: 'moon',
        name: 'Moon',
        type: 'satellite',
        distanceFromEarth: '384,400',
        temperature: -20,
        naturalOrbit: 'Earth',
        description: 'Earth\'s only natural satellite.',
        color: '#D3D3D3',
        size: 4,
        orbitRadius: 20,
        orbitalPeriod: 27.3,
        speed: 3683,
        satellites: [
          {
            id: 'apollo11',
            name: 'Apollo 11',
            type: 'satellite',
            isArtificial: true,
            distanceFromEarth: '384,400',
            temperature: 100,
            naturalOrbit: 'Moon',
            description: 'The first crewed mission to land on the Moon. Currently resting on the lunar surface.',
            color: '#E5E4E2',
            size: 3,
            orbitRadius: 2, // On the surface (Moon size 4 * 0.04 = 0.16, orbitDist = 2 * 0.08 = 0.16)
            orbitalPeriod: 27.3, // Matches Moon
            speed: 3683, // On the surface
            missionLogs: [
              { timestamp: 'July 16, 1969, 13:00 UTC', source: 'MCC', message: 'Flight Director: All of Apollo 11\'s flight controller, listen up. Give me a go / no go for launch.' },
              { timestamp: 'July 16, 1969, 13:01 UTC', source: 'MCC', message: 'FLIGHT: Booster? BOOSTER: Go. RETRO: Go. FIDO: We go Flight. GUIDO: Guidance go.' },
              { timestamp: 'July 16, 1969, 13:02 UTC', source: 'MCC', message: 'FLIGHT: Surgeon? SURGEON: Go Flight. EECOM: We go flight. GNC: We\'re go. TELMU: Go.' },
              { timestamp: 'July 16, 1969, 13:03 UTC', source: 'MCC', message: 'FLIGHT: Control? Control: Go flight. PROCEDURE: Go! INCO: Go! FAO: We are go.' },
              { timestamp: 'July 16, 1969, 13:04 UTC', source: 'MCC', message: 'FLIGHT: Network? Network: Go! Recovery: Go! CAPCOM: We go flight!' },
              { timestamp: 'July 16, 1969, 13:05 UTC', source: 'MCC', message: 'FLIGHT: Launch Control, this is Houston we are go for launch.' },
              { timestamp: 'July 16, 1969, 13:06 UTC', source: 'LCC', message: 'Launch Director: Roger that Houston. Pad Leader, what\'s your status?' },
              { timestamp: 'July 16, 1969, 13:07 UTC', source: 'LCC', message: 'Pad Leader: We are go for launch! T minus 60 seconds and counting!' },
              { timestamp: 'July 16, 1969, 13:08 UTC', source: 'HISTORICAL', message: 'Commander Armstrong: Fuel pumps. This is it! These pumps are hauling the mail.' },
              { timestamp: 'July 16, 1969, 13:09 UTC', source: 'LCC', message: 'LD: We are go for launch. T minus 15... 10, 9, 8, 7, 6, ignition sequence start, 3, 2, 1, ignition!' },
              { timestamp: 'July 16, 1969, 13:10 UTC', source: 'HISTORICAL', message: 'Armstrong: The clock is running! LD: We have lift off!' },
              { timestamp: 'July 16, 1969, 13:11 UTC', source: 'HISTORICAL', message: 'Collins: Altitude on the line, velocity right on. Armstrong: Roll complete we\'re pitching!' },
              { timestamp: 'July 16, 1969, 13:12 UTC', source: 'MCC', message: 'MCC: Apollo 11, standby for mode one! FLIGHT: Bravo, how we lookin? Bravo: Looks good flight.' },
              { timestamp: 'July 16, 1969, 13:13 UTC', source: 'MCC', message: 'MCC: We need your BPC is clear. Armstrong: Roger, EDS to manual in board.' },
              { timestamp: 'July 16, 1969, 13:14 UTC', source: 'HISTORICAL', message: 'Armstrong: Get ready for a little choke lads. Collins: That was some little choke.' },
              { timestamp: 'July 16, 1969, 13:15 UTC', source: 'HISTORICAL', message: 'Armstrong: Tower jetted! Our gimbal is good... our trim are good.' }
            ],
            achievements: [
              'First crewed mission to land on the Moon',
              'Successfully returned lunar samples to Earth',
              'Proved human capability for deep space travel'
            ]
          }
        ]
      },
      {
        id: 'artemis2',
        name: 'Artemis II',
        type: 'satellite',
        isArtificial: true,
        isPlanned: false,
        distanceFromEarth: '312,400',
        temperature: -20,
        naturalOrbit: 'Trans-Earth Trajectory',
        description: 'NASA\'s Artemis II Orion spacecraft has successfully completed its lunar mission and is now on a Trans-Earth trajectory, returning the crew safely to Earth.',
        color: '#FF7F50',
        size: 2.5,
        orbitRadius: 2,
        hideOrbit: true,
        orbitalPeriod: 27.3,
        speed: 3683,
        imageUrl: 'https://www.aljazeera.com/wp-content/uploads/2026/04/AP26093499359031-1775242604.jpg?resize=770%2C513&quality=80',
        missionLogs: [
          { timestamp: 'April 1, 2026, 14:00 UTC', source: 'MCC', message: 'Flight Director: All of Artemis II\'s flight controller, listen up. Give me a go / no go for launch.' },
          { timestamp: 'April 1, 2026, 14:01 UTC', source: 'MCC', message: 'FLIGHT: Booster? BOOSTER: Go. RETRO: Go. FIDO: We go Flight. GUIDO: Guidance go.' },
          { timestamp: 'April 1, 2026, 14:02 UTC', source: 'MCC', message: 'FLIGHT: Surgeon? SURGEON: Go Flight. EECOM: We go flight. GNC: We\'re go. TELMU: Go.' },
          { timestamp: 'April 1, 2026, 14:03 UTC', source: 'MCC', message: 'FLIGHT: Control? Control: Go flight. PROCEDURE: Go! INCO: Go! FAO: We are go.' },
          { timestamp: 'April 1, 2026, 14:04 UTC', source: 'MCC', message: 'FLIGHT: Network? Network: Go! Recovery: Go! CAPCOM: We go flight!' },
          { timestamp: 'April 1, 2026, 14:05 UTC', source: 'MCC', message: 'FLIGHT: Launch Control, this is Houston we are go for launch.' },
          { timestamp: 'April 1, 2026, 14:06 UTC', source: 'LCC', message: 'Launch Director: Roger that Houston. Pad Leader, what\'s your status?' },
          { timestamp: 'April 1, 2026, 14:07 UTC', source: 'LCC', message: 'Pad Leader: We are go for launch! T minus 60 seconds and counting!' },
          { timestamp: 'April 1, 2026, 14:08 UTC', source: 'ORION', message: 'Commander Wiseman: Fuel pumps. This is it! These pumps are hauling the mail.' },
          { timestamp: 'April 1, 2026, 14:09 UTC', source: 'LCC', message: 'LD: We are go for launch. T minus 15... 10, 9, 8, 7, 6, ignition sequence start, 3, 2, 1, ignition!' },
          { timestamp: 'April 1, 2026, 14:10 UTC', source: 'ORION', message: 'Wiseman: The clock is running! LD: We have lift off!' },
          { timestamp: 'April 1, 2026, 14:11 UTC', source: 'ORION', message: 'Glover: Altitude on the line, velocity right on. Wiseman: Roll complete we\'re pitching!' },
          { timestamp: 'April 1, 2026, 14:12 UTC', source: 'MCC', message: 'MCC: Artemis II, standby for mode one! FLIGHT: Bravo, how we lookin? Bravo: Looks good flight.' },
          { timestamp: 'April 1, 2026, 14:13 UTC', source: 'MCC', message: 'MCC: We need your BPC is clear. Wiseman: Roger, EDS to manual in board.' },
          { timestamp: 'April 1, 2026, 14:14 UTC', source: 'ORION', message: 'Wiseman: Get ready for a little choke lads. Glover: That was some little choke.' },
          { timestamp: 'April 1, 2026, 14:15 UTC', source: 'ORION', message: 'Wiseman: Tower jetted! Our gimbal is good... our trim are good.' }
        ],
        achievements: [
          'First crewed flight of the Space Launch System (SLS)',
          'First crewed spacecraft to leave low Earth orbit since 1972',
          'Testing the Orion spacecraft life support systems with humans',
          'Successful crewed landing on the lunar surface'
        ]
      },
      {
        id: 'sputnik1',
        name: 'Sputnik 1',
        type: 'satellite',
        isArtificial: true,
        distanceFromEarth: '577',
        temperature: 0,
        naturalOrbit: 'Earth',
        description: 'The first artificial Earth satellite.',
        color: '#BCC6CC',
        size: 2,
        orbitRadius: 15,
        orbitalPeriod: 0.06, // 96 minutes
        speed: 29000,
        missionLogs: [
          { timestamp: 'Oct 4, 1957', source: 'LCC', message: 'The first artificial Earth satellite has been launched successfully.' },
          { timestamp: 'Oct 4, 1957', source: 'HISTORICAL', message: 'Beep... beep... beep... Signal received globally.' }
        ],
        achievements: [
          'First artificial satellite in Earth orbit',
          'Triggered the Space Race',
          'Provided data on ionosphere density'
        ]
      },
      {
        id: 'iss',
        name: 'ISS',
        type: 'satellite',
        isArtificial: true,
        distanceFromEarth: '408',
        temperature: -157,
        naturalOrbit: 'Earth',
        description: 'The International Space Station, a modular space station in low Earth orbit.',
        color: '#FFFFFF',
        size: 2.5,
        orbitRadius: 18,
        orbitalPeriod: 0.063, // ~91 minutes
        speed: 27600,
        missionLogs: [
          { timestamp: 'Nov 20, 1998', source: 'LCC', message: 'Lift off of the Zarya module, the first piece of the International Space Station!' },
          { timestamp: 'Dec 4, 1998', source: 'MCC', message: 'Endeavour has captured Zarya. The assembly has begun.' },
          { timestamp: 'Nov 2, 2000', source: 'MCC', message: 'Expedition 1 has arrived. Continuous human presence starts now.' },
          { timestamp: 'Current', source: 'MCC', message: 'All systems nominal. Maintaining 28,000 km/h orbital velocity.' }
        ],
        achievements: [
          'Continuous human presence for 20+ years',
          'Largest artificial body in orbit',
          'Conducted thousands of microgravity experiments'
        ]
      },
      {
        id: 'hubble',
        name: 'Hubble Space Telescope',
        type: 'satellite',
        isArtificial: true,
        distanceFromEarth: '547',
        temperature: -150,
        naturalOrbit: 'Earth',
        description: 'A space telescope that was launched into low Earth orbit in 1990 and remains in operation.',
        color: '#C0C0C0',
        size: 2.2,
        orbitRadius: 22,
        orbitalPeriod: 0.066, // ~95 minutes
        speed: 27300,
        missionLogs: [
          { timestamp: 'Apr 24, 1990', source: 'LCC', message: 'Liftoff of the Space Shuttle Discovery with the Hubble Space Telescope!' },
          { timestamp: 'May 20, 1990', source: 'MCC', message: 'First Light image received. Although blurry, it proves the system works.' },
          { timestamp: 'Dec 2, 1993', source: 'MCC', message: 'STS-61 Servicing Mission 1 launched to fix the spherical aberration.' },
          { timestamp: 'Jan 13, 1994', source: 'MCC', message: 'Corrective optics installed. Hubble\'s vision is now crystal clear.' }
        ],
        achievements: [
          'Determined the age of the universe (13.8 billion years)',
          'Discovered that the expansion of the universe is accelerating',
          'Captured the iconic "Pillars of Creation" image'
        ]
      },
      {
        id: 'jwst',
        name: 'James Webb Space Telescope',
        type: 'satellite',
        isArtificial: true,
        distanceFromEarth: '1.5 million',
        temperature: -233,
        naturalOrbit: 'Sun (L2 Point)',
        description: 'The premier space observatory, designed to solve mysteries in our solar system and beyond.',
        color: '#E5C100',
        size: 3,
        orbitRadius: 45,
        orbitalPeriod: 365.25,
        timeType: 'Deep Space',
        speed: 1000, // orbits L2
        missionLogs: [
          { timestamp: 'Dec 25, 2021', source: 'LCC', message: 'Lift off! From a tropical rain forest to the edge of time itself, James Webb begins a voyage back to the birth of the universe.' },
          { timestamp: 'Jan 8, 2022', source: 'MCC', message: 'Primary mirror deployment complete. Webb is fully unfolded.' },
          { timestamp: 'July 12, 2022', source: 'MCC', message: 'First full-color images released. A new era of astronomy begins.' }
        ],
        achievements: [
          'Largest optical telescope in space',
          'Captured the deepest infrared image of the universe',
          'Observing the first galaxies formed after the Big Bang'
        ]
      },
      {
        id: 'eht',
        name: 'Event Horizon Telescope',
        type: 'satellite',
        isArtificial: true,
        distanceFromEarth: '0',
        temperature: 10,
        naturalOrbit: 'Earth (Ground-based Array)',
        description: 'A global network of radio telescopes working together to capture images of black holes.',
        color: '#FF4500',
        size: 2,
        orbitRadius: 5,
        orbitalPeriod: 1,
        timeType: 'Earth Standard',
        speed: 1670, // Earth rotation speed
      }
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    distanceFromEarth: '225 million',
    temperature: -65,
    naturalOrbit: 'Sun',
    artificialOrbit: 'Mars Reconnaissance Orbiter',
    description: 'The Red Planet, home to Olympus Mons.',
    color: '#E27B58',
    size: 10,
    orbitRadius: 170,
    orbitalPeriod: 687,
    timeType: 'Sol Day',
    speed: 86670,
    satellites: [
      {
        id: 'phobos',
        name: 'Phobos',
        type: 'satellite',
        distanceFromEarth: '225 million',
        temperature: -40,
        naturalOrbit: 'Mars',
        description: 'The larger of the two Martian moons.',
        color: '#8E7E72',
        size: 2,
        orbitRadius: 12,
        orbitalPeriod: 0.3,
        speed: 7696,
      }
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    distanceFromEarth: '628 million',
    temperature: -110,
    naturalOrbit: 'Sun',
    artificialOrbit: 'Juno',
    description: 'The largest planet in our Solar System.',
    color: '#D39C7E',
    size: 25,
    orbitRadius: 230,
    orbitalPeriod: 4333,
    timeType: 'Gas Giant Rapid',
    speed: 47000,
    satellites: [
      {
        id: 'europa',
        name: 'Europa',
        type: 'satellite',
        distanceFromEarth: '628 million',
        temperature: -160,
        naturalOrbit: 'Jupiter',
        description: 'An icy moon with a potential subsurface ocean.',
        color: '#C7B4A1',
        size: 4,
        orbitRadius: 15,
        orbitalPeriod: 3.5,
        speed: 49476,
      }
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    distanceFromEarth: '1.2 billion',
    temperature: -140,
    naturalOrbit: 'Sun',
    artificialOrbit: 'Cassini (formerly)',
    description: 'Famous for its prominent ring system.',
    color: '#C5AB6E',
    size: 22,
    orbitRadius: 290,
    orbitalPeriod: 10759,
    timeType: 'Ring Cycle',
    speed: 34880,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    distanceFromEarth: '2.6 billion',
    temperature: -195,
    naturalOrbit: 'Sun',
    description: 'An ice giant with a unique sideways tilt.',
    color: '#B5E3E3',
    size: 16,
    orbitRadius: 340,
    orbitalPeriod: 30687,
    timeType: 'Sideways Solar',
    speed: 24500,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    distanceFromEarth: '4.3 billion',
    temperature: -201,
    naturalOrbit: 'Sun',
    description: 'The most distant major planet from the Sun.',
    color: '#4B70DD',
    size: 15,
    orbitRadius: 380,
    orbitalPeriod: 60190,
    timeType: 'Deep Solar',
    speed: 19500,
  },
  {
    id: 'voyager1',
    name: 'Voyager 1',
    type: 'satellite',
    isArtificial: true,
    distanceFromEarth: '24 billion',
    temperature: -253,
    naturalOrbit: 'Interstellar Space',
    description: 'The farthest human-made object from Earth.',
    color: '#C0C0C0',
    size: 5,
    orbitRadius: 450,
    orbitalPeriod: 999999, // Extremely slow, effectively stationary
    timeType: 'Interstellar',
    hideOrbit: true,
    speed: 61200,
    missionLogs: [
      { timestamp: 'Sept 5, 1977', source: 'LCC', message: 'We have a lift-off. Lift-off of Voyager 1.' },
      { timestamp: 'Aug 25, 2012', source: 'MCC', message: 'Voyager 1 has crossed the heliopause. It is now in interstellar space.' },
      { timestamp: 'Current', source: 'MCC', message: 'Signal received. Data transmission continues at 160 bits per second.' }
    ],
    achievements: [
      'First spacecraft to enter interstellar space',
      'Captured the "Pale Blue Dot" image',
      'Discovered active volcanoes on Jupiter\'s moon Io'
    ]
  }
];
