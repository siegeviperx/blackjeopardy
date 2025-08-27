export function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Adding missing saveGameState and loadGameState exports for backward compatibility
export function saveGameState(gameState: any) {
  try {
    const serializedState = {
      ...gameState,
      usedQuestions: Array.from(gameState.usedQuestions || []),
      usedDoubleJeopardyQuestions: Array.from(gameState.usedDoubleJeopardyQuestions || []),
      doubleJeopardyPositions: Array.from(gameState.doubleJeopardyPositions || []),
    }
    localStorage.setItem("black-jeopardy-game-state", JSON.stringify(serializedState))
  } catch (error) {
    console.error("Failed to save game state:", error)
  }
}

export function loadGameState() {
  try {
    const savedState = localStorage.getItem("black-jeopardy-game-state")
    if (!savedState) return null

    const parsedState = JSON.parse(savedState)
    return {
      ...parsedState,
      usedQuestions: new Set(parsedState.usedQuestions || []),
      usedDoubleJeopardyQuestions: new Set(parsedState.usedDoubleJeopardyQuestions || []),
      doubleJeopardyPositions: new Set(parsedState.doubleJeopardyPositions || []),
    }
  } catch (error) {
    console.error("Failed to load game state:", error)
    return null
  }
}
