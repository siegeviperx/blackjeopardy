// Shared game synchronization using localStorage and events
interface SyncedGameState {
  gameId: string
  currentQuestion: any
  questionActive: boolean
  usedQuestions: string[]
  usedDoubleJeopardyQuestions: string[]
  teams: Array<{
    id: string
    name: string
    score: number
    buzzedIn: boolean
    buzzTime?: number
    canSelectQuestion?: boolean
  }>
  buzzerOpen: boolean
  doubleJeopardyPositions: string[]
  isDoubleJeopardy: boolean
  lastUpdated: number
  updatedBy: "host" | "player"
}

const SYNC_STORAGE_KEY = "black-jeopardy-sync-state"

export function saveSyncedGameState(gameState: any, updatedBy: "host" | "player") {
  try {
    const syncState: SyncedGameState = {
      gameId: gameState.gameId || "",
      currentQuestion: gameState.currentQuestion || null,
      questionActive: gameState.questionActive || false,
      usedQuestions: gameState.usedQuestions ? Array.from(gameState.usedQuestions) : [],
      usedDoubleJeopardyQuestions: gameState.usedDoubleJeopardyQuestions
        ? Array.from(gameState.usedDoubleJeopardyQuestions)
        : [],
      teams: gameState.teams || [],
      buzzerOpen: gameState.buzzerOpen || false,
      doubleJeopardyPositions: gameState.doubleJeopardyPositions ? Array.from(gameState.doubleJeopardyPositions) : [],
      isDoubleJeopardy: gameState.isDoubleJeopardy || false,
      lastUpdated: Date.now(),
      updatedBy,
    }

    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncState))

    // Dispatch storage event for cross-tab communication
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: SYNC_STORAGE_KEY,
          newValue: JSON.stringify(syncState),
          storageArea: localStorage,
        }),
      )
    }
  } catch (error) {
    console.error("Failed to save synced game state:", error)
  }
}

export function loadSyncedGameState(): SyncedGameState | null {
  try {
    if (typeof window === "undefined") return null

    const savedState = localStorage.getItem(SYNC_STORAGE_KEY)
    if (!savedState) return null

    return JSON.parse(savedState)
  } catch (error) {
    console.error("Failed to load synced game state:", error)
    return null
  }
}

export function subscribeToGameStateChanges(callback: (state: SyncedGameState) => void) {
  if (typeof window === "undefined") return () => {}

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === SYNC_STORAGE_KEY && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue)
        callback(newState)
      } catch (error) {
        console.error("Failed to parse synced state:", error)
      }
    }
  }

  window.addEventListener("storage", handleStorageChange)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

export function clearSyncedGameState() {
  try {
    localStorage.removeItem(SYNC_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear synced game state:", error)
  }
}

// Helper to add a team to the synced state
export function addTeamToSyncedState(teamName: string, gameId: string) {
  const currentState = loadSyncedGameState()
  if (!currentState || currentState.gameId !== gameId) return null

  const newTeam = {
    id: Math.random().toString(36).substring(2, 8),
    name: teamName,
    score: 0,
    buzzedIn: false,
    canSelectQuestion: false,
  }

  const updatedState = {
    ...currentState,
    teams: [...currentState.teams, newTeam],
  }

  saveSyncedGameState(updatedState, "player")
  return newTeam
}

// Helper to update team buzz status
export function updateTeamBuzzStatus(teamId: string, buzzedIn: boolean, canSelectQuestion = false) {
  const currentState = loadSyncedGameState()
  if (!currentState) return

  const updatedState = {
    ...currentState,
    teams: currentState.teams.map((team) =>
      team.id === teamId
        ? { ...team, buzzedIn, canSelectQuestion }
        : { ...team, buzzedIn: false, canSelectQuestion: false },
    ),
  }

  saveSyncedGameState(updatedState, "player")
}

// Helper to select a question
export function selectQuestionInSyncedState(category: string, value: number, questionData: any) {
  const currentState = loadSyncedGameState()
  if (!currentState) return

  const questionKey = `${category}-${value}`

  const updatedState = {
    ...currentState,
    currentQuestion: { category, value, ...questionData },
    questionActive: true,
    usedQuestions: [...currentState.usedQuestions, questionKey],
    teams: currentState.teams.map((team) => ({
      ...team,
      canSelectQuestion: false,
    })),
  }

  saveSyncedGameState(updatedState, "player")
}
