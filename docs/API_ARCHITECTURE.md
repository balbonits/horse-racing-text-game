# API Architecture - V3 Web Version

Comprehensive API design for the web-based version using vanilla HTML/CSS/JS frontend with Node.js + MongoDB backend.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Pure Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with native driver
- **Communication**: RESTful API + WebSocket for real-time features
- **Authentication**: JWT tokens
- **No External Libraries**: Built-in browser APIs only

### Design Principles
1. **Pure Web Standards**: No frameworks, only native browser APIs
2. **RESTful Design**: Clear resource-based endpoints
3. **Stateless Backend**: JWT for authentication, no server sessions
4. **Real-time Updates**: WebSocket for live race events
5. **Mobile-First**: Responsive design with touch support

## 📡 API Endpoints

### Authentication & User Management

#### POST `/api/auth/register`
Create new user account.
```javascript
// Request
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword"
}

// Response
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "userId",
    "username": "player123",
    "email": "player@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user.
```javascript
// Request
{
  "username": "player123",
  "password": "securePassword"
}

// Response
{
  "success": true,
  "token": "jwt-token-here",
  "user": { /* user object */ }
}
```

#### GET `/api/auth/profile`
Get current user profile (requires JWT).
```javascript
// Headers: Authorization: Bearer <jwt-token>

// Response
{
  "user": {
    "id": "userId",
    "username": "player123", 
    "stats": {
      "totalCareers": 5,
      "totalWins": 12,
      "bestTime": "71.25",
      "favoriteTraining": "speed"
    },
    "achievements": [/* achievement objects */],
    "preferences": {
      "theme": "dark",
      "soundEnabled": true
    }
  }
}
```

### Character Management

#### POST `/api/characters`
Create new horse character.
```javascript
// Request
{
  "name": "Lightning Bolt",
  "appearance": {
    "color": "brown",
    "mane": "black",
    "accessories": ["ribbon"]
  },
  "startingBonuses": {
    "speedBonus": 5,
    "staminaBonus": 3,
    "powerBonus": 2
  }
}

// Response
{
  "success": true,
  "character": {
    "id": "characterId",
    "name": "Lightning Bolt",
    "stats": {
      "speed": 25,      // 20 base + 5 bonus
      "stamina": 23,    // 20 base + 3 bonus
      "power": 22       // 20 base + 2 bonus
    },
    "condition": {
      "energy": 100,
      "mood": "good",
      "health": 100
    },
    "career": {
      "turn": 1,
      "maxTurns": 12,
      "isActive": true
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET `/api/characters/:characterId`
Get character details.
```javascript
// Response
{
  "character": {
    "id": "characterId",
    "name": "Lightning Bolt",
    "stats": { /* current stats */ },
    "condition": { /* current condition */ },
    "career": {
      "turn": 5,
      "totalTraining": 8,
      "racesRun": 1,
      "racesWon": 1,
      "isActive": true
    },
    "progression": {
      "statHistory": [
        { "turn": 1, "stats": { "speed": 25, "stamina": 23, "power": 22 } },
        // ... historical data
      ],
      "trainingLog": [/* training history */],
      "raceHistory": [/* race results */]
    }
  }
}
```

#### GET `/api/characters`
List user's characters.
```javascript
// Query params: ?status=active&limit=10&offset=0

// Response
{
  "characters": [
    {
      "id": "char1",
      "name": "Lightning Bolt",
      "career": { "turn": 5, "isActive": true },
      "stats": { /* summary stats */ },
      "lastPlayed": "2024-01-01T12:00:00Z"
    }
    // ... more characters
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Training System

#### POST `/api/characters/:characterId/training`
Perform training action.
```javascript
// Request
{
  "trainingType": "speed",
  "options": {
    "intensity": "normal",  // light, normal, intense
    "focus": "technique"    // power, technique, endurance
  }
}

// Response
{
  "success": true,
  "result": {
    "trainingType": "speed",
    "energyChange": -15,
    "statGains": {
      "speed": 8,
      "stamina": 2  // secondary gain
    },
    "friendshipGain": 0,
    "messages": [
      "Great speed training session!",
      "Technique improved significantly!"
    ],
    "specialEvents": [
      {
        "type": "breakthrough",
        "message": "Discovered new running form!",
        "bonus": { "speed": 3 }
      }
    ]
  },
  "character": {
    "stats": { /* updated stats */ },
    "condition": { /* updated condition */ },
    "career": { "turn": 5, "totalTraining": 9 }
  }
}
```

#### GET `/api/characters/:characterId/training/options`
Get available training options with effectiveness.
```javascript
// Response
{
  "options": {
    "speed": {
      "available": true,
      "energyCost": 15,
      "effectiveness": 120,  // percentage
      "description": "Intense sprinting drills",
      "requirements": null
    },
    "stamina": {
      "available": true,
      "energyCost": 10,
      "effectiveness": 100,
      "description": "Endurance building",
      "requirements": null
    },
    "rest": {
      "available": true,
      "energyCost": -30,
      "effectiveness": 100,
      "description": "Recover energy and improve mood",
      "requirements": null
    },
    "social": {
      "available": false,
      "reason": "Low mood required",
      "requirements": { "mood": "bad" }
    }
  },
  "recommendations": [
    {
      "type": "rest",
      "priority": "high",
      "reason": "Energy below 30%"
    }
  ]
}
```

### Racing System

#### POST `/api/characters/:characterId/races`
Enter character in a race.
```javascript
// Request
{
  "raceType": "sprint",
  "trackCondition": "firm",
  "options": {
    "aiDifficulty": "normal",  // easy, normal, hard, expert
    "participantCount": 8
  }
}

// Response
{
  "success": true,
  "raceId": "raceId123",
  "message": "Entered in Sprint Race",
  "startTime": "2024-01-01T14:00:00Z",
  "participants": [
    {
      "position": 1,
      "name": "Lightning Bolt",
      "isPlayer": true,
      "stats": { /* race-time stats */ }
    }
    // ... other participants
  ]
}
```

#### GET `/api/races/:raceId`
Get race details and current status.
```javascript
// Response
{
  "race": {
    "id": "raceId123",
    "type": "sprint",
    "distance": 1200,
    "surface": "turf",
    "trackCondition": "firm",
    "status": "completed",  // preparing, running, completed
    "participants": [/* participant list */],
    "results": {
      "positions": [
        {
          "position": 1,
          "participant": {
            "name": "Lightning Bolt",
            "isPlayer": true
          },
          "performance": {
            "time": "71.85",
            "performance": 87.5,
            "splits": {
              "start": "0.00",
              "quarter": "18.20",
              "half": "36.40",
              "stretch": "54.60",
              "finish": "71.85"
            }
          }
        }
        // ... other results
      ],
      "commentary": [
        "And they're off!",
        "Lightning Bolt takes early lead!",
        "Coming down the stretch...",
        "Lightning Bolt wins by 2 lengths!"
      ]
    },
    "effects": {
      "experienceGained": 15,
      "moodChange": "great",
      "energyChange": 0,
      "friendshipChange": 5,
      "messages": ["Victory celebration!"]
    }
  }
}
```

#### GET `/api/races/schedule`
Get upcoming race schedule and opportunities.
```javascript
// Query: ?characterId=characterId

// Response
{
  "schedule": [
    {
      "turn": 4,
      "raceType": "sprint", 
      "name": "Debut Sprint",
      "description": "First race opportunity",
      "requirements": {
        "minTurn": 4,
        "maxTurn": 6
      },
      "rewards": {
        "experience": "10-20",
        "friendship": "3-8",
        "achievements": ["First Race"]
      }
    }
    // ... more scheduled races
  ],
  "available": [
    {
      "raceType": "exhibition",
      "name": "Practice Sprint",
      "requirements": { "minStats": { "speed": 30 } },
      "rewards": { "experience": "5-10" }
    }
  ]
}
```

### Real-time Race Events (WebSocket)

#### Connect to Race Stream
```javascript
// Client-side WebSocket connection
const ws = new WebSocket('ws://localhost:3000/api/races/:raceId/stream');

// Server events
{
  "type": "race_start",
  "data": {
    "raceId": "raceId123",
    "participants": [/* participants */]
  }
}

{
  "type": "race_progress", 
  "data": {
    "raceId": "raceId123",
    "progress": 25,  // percentage
    "positions": [
      { "name": "Lightning Bolt", "position": 1, "distance": 300 }
      // ... current standings
    ],
    "commentary": "Lightning Bolt maintains the lead!"
  }
}

{
  "type": "race_finish",
  "data": {
    "raceId": "raceId123",
    "results": {/* final results */},
    "effects": {/* character effects */}
  }
}
```

### Game State Management

#### GET `/api/characters/:characterId/status`
Get complete character status for UI updates.
```javascript
// Response
{
  "character": {/* full character object */},
  "gameState": "training",  // training, racing, career_complete
  "availableActions": [
    {
      "type": "training",
      "options": ["speed", "stamina", "power", "rest", "social"]
    },
    {
      "type": "race",
      "available": true,
      "nextScheduled": {
        "turn": 8,
        "raceType": "mile"
      }
    }
  ],
  "progression": {
    "turnsRemaining": 8,
    "nextMilestone": {
      "type": "race",
      "turn": 8,
      "name": "Classic Mile"
    }
  }
}
```

#### POST `/api/characters/:characterId/advance`
Advance to next turn.
```javascript
// Response
{
  "success": true,
  "newTurn": 6,
  "canContinue": true,
  "events": [
    {
      "type": "mood_change",
      "message": "Feeling great after yesterday's training!",
      "effects": { "mood": "great" }
    }
  ],
  "character": {/* updated character */}
}
```

### Save System & Career Management

#### POST `/api/characters/:characterId/save`
Save current game state.
```javascript
// Request
{
  "saveSlot": 1,  // 1-5 save slots per user
  "description": "Pre-race save - Turn 8"
}

// Response
{
  "success": true,
  "saveId": "saveId123",
  "timestamp": "2024-01-01T15:30:00Z"
}
```

#### GET `/api/saves`
List user's saved games.
```javascript
// Response
{
  "saves": [
    {
      "id": "saveId123",
      "slot": 1,
      "character": {
        "name": "Lightning Bolt",
        "turn": 8,
        "stats": {/* summary stats */}
      },
      "description": "Pre-race save - Turn 8",
      "timestamp": "2024-01-01T15:30:00Z"
    }
  ]
}
```

#### POST `/api/characters/:characterId/complete-career`
Complete current career and generate legacy bonuses.
```javascript
// Response
{
  "success": true,
  "careerSummary": {
    "characterName": "Lightning Bolt",
    "finalStats": {/* final stats */},
    "performance": {
      "racesWon": 2,
      "racesRun": 3,
      "winRate": 67,
      "totalTraining": 15
    },
    "achievements": [
      {
        "id": "first_win",
        "name": "First Victory",
        "description": "Won your first race",
        "unlockedAt": "2024-01-01T14:30:00Z"
      }
    ],
    "legacyBonuses": {
      "speedBonus": 8,
      "staminaBonus": 6,
      "powerBonus": 5,
      "energyBonus": 4
    }
  },
  "newCharacterOptions": {
    "availableBonuses": {/* legacy bonuses */},
    "unlockedFeatures": ["advanced_training", "special_races"]
  }
}
```

## 🔧 Frontend Implementation Guide

### Vanilla JS API Client
```javascript
// api.js - Pure vanilla JavaScript API client
class UmaMusumeAPI {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Authentication
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    
    this.token = data.token;
    localStorage.setItem('authToken', this.token);
    return data;
  }

  // Character management
  async createCharacter(characterData) {
    return this.request('/characters', {
      method: 'POST',
      body: characterData
    });
  }

  async getCharacter(characterId) {
    return this.request(`/characters/${characterId}`);
  }

  // Training
  async performTraining(characterId, trainingType, options = {}) {
    return this.request(`/characters/${characterId}/training`, {
      method: 'POST', 
      body: { trainingType, options }
    });
  }

  // Racing
  async enterRace(characterId, raceOptions) {
    return this.request(`/characters/${characterId}/races`, {
      method: 'POST',
      body: raceOptions
    });
  }

  // WebSocket connection for real-time race updates
  connectToRace(raceId) {
    const ws = new WebSocket(`ws://${location.host}/api/races/${raceId}/stream`);
    return ws;
  }
}

// Global API instance
const api = new UmaMusumeAPI();
```

### State Management (Vanilla JS)
```javascript
// state.js - Simple state management
class GameState {
  constructor() {
    this.state = {
      user: null,
      currentCharacter: null,
      gameState: 'menu',
      raceStream: null
    };
    this.listeners = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

const gameState = new GameState();
```

### Component System (Vanilla JS)
```javascript
// components.js - Simple component system
class Component {
  constructor(element) {
    this.element = element;
    this.eventListeners = [];
  }

  render(data) {
    // Override in subclasses
  }

  addEventListener(event, handler) {
    this.element.addEventListener(event, handler);
    this.eventListeners.push({ event, handler });
  }

  destroy() {
    this.eventListeners.forEach(({ event, handler }) => {
      this.element.removeEventListener(event, handler);
    });
  }
}

class CharacterStatsComponent extends Component {
  render(character) {
    const { stats, condition } = character;
    
    this.element.innerHTML = `
      <div class="character-stats">
        <h3>${character.name}</h3>
        <div class="stat-bars">
          <div class="stat">
            <label>Speed</label>
            <div class="progress-bar">
              <div class="progress" style="width: ${stats.speed}%"></div>
            </div>
            <span>${stats.speed}/100</span>
          </div>
          <div class="stat">
            <label>Stamina</label>
            <div class="progress-bar">
              <div class="progress" style="width: ${stats.stamina}%"></div>
            </div>
            <span>${stats.stamina}/100</span>
          </div>
          <div class="stat">
            <label>Power</label>
            <div class="progress-bar">
              <div class="progress" style="width: ${stats.power}%"></div>
            </div>
            <span>${stats.power}/100</span>
          </div>
          <div class="stat energy">
            <label>Energy</label>
            <div class="progress-bar">
              <div class="progress energy" style="width: ${condition.energy}%"></div>
            </div>
            <span>${condition.energy}/100</span>
          </div>
        </div>
        <div class="mood">Mood: <span class="${condition.mood}">${condition.mood}</span></div>
      </div>
    `;
  }
}
```

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens with reasonable expiration (24 hours)
- Refresh token rotation
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration for web clients

### Data Protection
- MongoDB connection security
- Environment variable configuration
- No sensitive data in client-side code
- Secure password hashing (bcrypt)
- API key protection for external services

### Performance & Scaling
- Database indexing for user queries
- Caching for frequently accessed data
- WebSocket connection limits
- Request size limits
- Pagination for large data sets

---

*This API architecture provides a solid foundation for the web-based version while maintaining compatibility with the core game mechanics developed in the terminal version.*