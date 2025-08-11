// Simple interfaces to avoid import issues
interface SimpleTeam {
  id: string
  name: string
  score: number
  buzzedIn: boolean
  buzzTime?: number
}

interface SimpleGameState {
  gameId: string
  currentQuestion: any
  questionActive: boolean
  usedQuestions: string[]
  usedDoubleJeopardyQuestions: string[]
  teams: SimpleTeam[]
  buzzerOpen: boolean
  doubleJeopardyPositions: string[]
  isDoubleJeopardy: boolean
}

interface Team {
  id: string
  name: string
  score: number
  buzzedIn: boolean
  buzzTime?: number
}

interface GameState {
  gameId: string
  currentQuestion: any
  questionActive: boolean
  usedQuestions: string[]
  usedDoubleJeopardyQuestions: string[]
  teams: Team[]
  buzzerOpen: boolean
  doubleJeopardyPositions: string[]
  isDoubleJeopardy: boolean
}

interface GameSession {
  id: string
  name: string
  createdAt: string
  lastModified: string
  gameState: GameState
  isActive: boolean
}

const GAME_SESSIONS_KEY = "black-jeopardy-game-sessions"
const ACTIVE_SESSION_KEY = "black-jeopardy-active-session"

export function saveGameSession(sessionId: string, sessionName: string, gameState: any) {
  try {
    const sessions = loadAllGameSessions()
    const serializedState = {
      ...gameState,
      usedQuestions: Array.from(gameState.usedQuestions),
      usedDoubleJeopardyQuestions: Array.from(gameState.usedDoubleJeopardyQuestions),
      doubleJeopardyPositions: Array.from(gameState.doubleJeopardyPositions),
    }

    const session: GameSession = {
      id: sessionId,
      name: sessionName,
      createdAt: sessions.find((s) => s.id === sessionId)?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      gameState: serializedState,
      isActive: true,
    }

    // Update or add session
    const existingIndex = sessions.findIndex((s) => s.id === sessionId)
    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }

    // Mark all other sessions as inactive
    sessions.forEach((s) => {
      if (s.id !== sessionId) {
        s.isActive = false
      }
    })

    localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(sessions))
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
  } catch (error) {
    console.error("Failed to save game session:", error)
  }
}

export function loadGameSession(sessionId: string): GameState | null {
  try {
    const sessions = loadAllGameSessions()
    const session = sessions.find((s) => s.id === sessionId)

    if (!session) return null

    return {
      ...session.gameState,
      usedQuestions: new Set(session.gameState.usedQuestions || []),
      usedDoubleJeopardyQuestions: new Set(session.gameState.usedDoubleJeopardyQuestions || []),
      doubleJeopardyPositions: new Set(session.gameState.doubleJeopardyPositions || []),
    }
  } catch (error) {
    console.error("Failed to load game session:", error)
    return null
  }
}

export function loadActiveGameSession(): GameState | null {
  try {
    const activeSessionId = localStorage.getItem(ACTIVE_SESSION_KEY)
    if (!activeSessionId) return null

    return loadGameSession(activeSessionId)
  } catch (error) {
    console.error("Failed to load active game session:", error)
    return null
  }
}

export function loadAllGameSessions(): GameSession[] {
  try {
    const sessionsData = localStorage.getItem(GAME_SESSIONS_KEY)
    return sessionsData ? JSON.parse(sessionsData) : []
  } catch (error) {
    console.error("Failed to load game sessions:", error)
    return []
  }
}

export function deleteGameSession(sessionId: string) {
  try {
    const sessions = loadAllGameSessions()
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)
    localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(filteredSessions))

    // If we deleted the active session, clear the active session
    const activeSessionId = localStorage.getItem(ACTIVE_SESSION_KEY)
    if (activeSessionId === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY)
    }
  } catch (error) {
    console.error("Failed to delete game session:", error)
  }
}

export function setActiveSession(sessionId: string) {
  try {
    const sessions = loadAllGameSessions()
    sessions.forEach((s) => {
      s.isActive = s.id === sessionId
    })
    localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(sessions))
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
  } catch (error) {
    console.error("Failed to set active session:", error)
  }
}

export function createNewGameSession(sessionName: string): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  return sessionId
}

// Legacy support - remove old single game storage
export function migrateOldGameState() {
  try {
    const oldGameState = localStorage.getItem("black-jeopardy-game-state")
    if (oldGameState) {
      const parsedState = JSON.parse(oldGameState)
      const sessionId = createNewGameSession("Migrated Game")
      saveGameSession(sessionId, "Migrated Game", {
        ...parsedState,
        usedQuestions: new Set(parsedState.usedQuestions || []),
        usedDoubleJeopardyQuestions: new Set(parsedState.usedDoubleJeopardyQuestions || []),
        doubleJeopardyPositions: new Set(parsedState.doubleJeopardyPositions || []),
      })
      localStorage.removeItem("black-jeopardy-game-state")
      return sessionId
    }
  } catch (error) {
    console.error("Failed to migrate old game state:", error)
  }
  return null
}

// Session Export/Import functionality
export function exportGameSession(sessionId: string): string | null {
  try {
    const sessions = loadAllGameSessions()
    const session = sessions.find((s) => s.id === sessionId)

    if (!session) {
      throw new Error("Session not found")
    }

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      session: {
        ...session,
        // Convert Sets to Arrays for JSON serialization
        gameState: {
          ...session.gameState,
          usedQuestions: Array.from(session.gameState.usedQuestions || []),
          usedDoubleJeopardyQuestions: Array.from(session.gameState.usedDoubleJeopardyQuestions || []),
          doubleJeopardyPositions: Array.from(session.gameState.usedDoubleJeopardyPositions || []),
        },
      },
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error("Failed to export game session:", error)
    return null
  }
}

export function exportAllGameSessions(): string | null {
  try {
    const sessions = loadAllGameSessions()

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      sessions: sessions.map((session) => ({
        ...session,
        gameState: {
          ...session.gameState,
          usedQuestions: Array.from(session.gameState.usedQuestions || []),
          usedDoubleJeopardyQuestions: Array.from(session.gameState.usedDoubleJeopardyQuestions || []),
          doubleJeopardyPositions: Array.from(session.gameState.usedDoubleJeopardyPositions || []),
        },
      })),
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error("Failed to export all game sessions:", error)
    return null
  }
}

export function importGameSession(
  importData: string,
  overwriteExisting = false,
): { success: boolean; message: string; importedCount?: number } {
  try {
    const data = JSON.parse(importData)

    // Validate import data structure
    if (!data.version || !data.exportedAt) {
      return { success: false, message: "Invalid import file format" }
    }

    const existingSessions = loadAllGameSessions()
    let importedCount = 0
    let skippedCount = 0

    // Handle single session import
    if (data.session) {
      const session = data.session
      const existingSession = existingSessions.find((s) => s.id === session.id)

      if (existingSession && !overwriteExisting) {
        return { success: false, message: `Session "${session.name}" already exists. Choose to overwrite or rename.` }
      }

      // Convert Arrays back to Sets
      const processedSession = {
        ...session,
        gameState: {
          ...session.gameState,
          usedQuestions: session.gameState.usedQuestions || [],
          usedDoubleJeopardyQuestions: session.gameState.usedDoubleJeopardyQuestions || [],
          doubleJeopardyPositions: session.gameState.doubleJeopardyPositions || [],
        },
      }

      // Add or update session
      if (existingSession) {
        const sessionIndex = existingSessions.findIndex((s) => s.id === session.id)
        existingSessions[sessionIndex] = processedSession
      } else {
        existingSessions.push(processedSession)
      }

      importedCount = 1
    }

    // Handle multiple sessions import
    if (data.sessions && Array.isArray(data.sessions)) {
      for (const session of data.sessions) {
        const existingSession = existingSessions.find((s) => s.id === session.id)

        if (existingSession && !overwriteExisting) {
          skippedCount++
          continue
        }

        // Convert Arrays back to Sets
        const processedSession = {
          ...session,
          gameState: {
            ...session.gameState,
            usedQuestions: session.gameState.usedQuestions || [],
            usedDoubleJeopardyQuestions: session.gameState.usedDoubleJeopardyQuestions || [],
            doubleJeopardyPositions: session.gameState.doubleJeopardyPositions || [],
          },
        }

        // Add or update session
        if (existingSession) {
          const sessionIndex = existingSessions.findIndex((s) => s.id === session.id)
          existingSessions[sessionIndex] = processedSession
        } else {
          existingSessions.push(processedSession)
        }

        importedCount++
      }
    }

    // Save updated sessions
    localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(existingSessions))

    let message = `Successfully imported ${importedCount} session(s)`
    if (skippedCount > 0) {
      message += `. Skipped ${skippedCount} existing session(s).`
    }

    return { success: true, message, importedCount }
  } catch (error) {
    console.error("Failed to import game session:", error)
    return { success: false, message: "Failed to parse import file. Please check the file format." }
  }
}

export function generateSessionFileName(sessionName: string, isMultiple = false): string {
  const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const sanitizedName = sessionName.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")

  if (isMultiple) {
    return `black_jeopardy_sessions_${timestamp}.json`
  }

  return `black_jeopardy_${sanitizedName}_${timestamp}.json`
}

export function downloadFile(content: string, filename: string) {
  try {
    const blob = new Blob([content], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Failed to download file:", error)
  }
}

// Player game info storage (unchanged)
const PLAYER_STORAGE_KEY = "black-jeopardy-player-info"

export function savePlayerInfo(playerInfo: any) {
  try {
    const serializedInfo = {
      ...playerInfo,
      usedQuestions: Array.from(playerInfo.usedQuestions || []),
    }
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(serializedInfo))
  } catch (error) {
    console.error("Failed to save player info:", error)
  }
}

export function loadPlayerInfo() {
  try {
    const savedInfo = localStorage.getItem(PLAYER_STORAGE_KEY)
    if (!savedInfo) return null

    const parsedInfo = JSON.parse(savedInfo)
    return {
      ...parsedInfo,
      usedQuestions: new Set(parsedInfo.usedQuestions || []),
    }
  } catch (error) {
    console.error("Failed to load player info:", error)
    return null
  }
}

export function clearPlayerInfo() {
  try {
    localStorage.removeItem(PLAYER_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear player info:", error)
  }
}
