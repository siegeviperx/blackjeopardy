import { supabase } from "./supabase/client"

export async function saveGameState(gameCode: string, gameState: any) {
  try {
    // Save to Supabase database for cross-device sync
    const { error } = await supabase.from("game_sessions").upsert({
      game_code: gameCode,
      game_state: gameState,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Supabase save error:", error)
      // Fallback to localStorage
      localStorage.setItem(`game-${gameCode}`, JSON.stringify(gameState))
    } else {
      console.log("Game state saved to Supabase for code:", gameCode)
      // Also save to localStorage as backup
      localStorage.setItem(`game-${gameCode}`, JSON.stringify(gameState))
    }
  } catch (error) {
    console.error("Error saving game state:", error)
    // Fallback to localStorage
    localStorage.setItem(`game-${gameCode}`, JSON.stringify(gameState))
  }
}

export async function loadGameState(gameCode: string) {
  try {
    // Try to load from Supabase first
    const { data, error } = await supabase.from("game_sessions").select("game_state").eq("game_code", gameCode).single()

    if (error || !data) {
      console.log("No Supabase data found, checking localStorage")
      // Fallback to localStorage
      const storedState = localStorage.getItem(`game-${gameCode}`)
      return storedState ? JSON.parse(storedState) : null
    }

    console.log("Game state loaded from Supabase for code:", gameCode)
    return data.game_state
  } catch (error) {
    console.error("Error loading game state:", error)
    // Fallback to localStorage
    const storedState = localStorage.getItem(`game-${gameCode}`)
    return storedState ? JSON.parse(storedState) : null
  }
}

export function subscribeToGameUpdates(gameCode: string, callback: (gameState: any) => void) {
  console.log("Setting up real-time subscription for game:", gameCode)

  const channel = supabase
    .channel(`game-${gameCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_sessions",
        filter: `game_code=eq.${gameCode}`,
      },
      (payload) => {
        console.log("Real-time update received:", payload)
        if (payload.new && payload.new.game_state) {
          callback(payload.new.game_state)
        }
      },
    )
    .subscribe()

  // Fallback polling for localStorage updates (same-device tabs)
  const interval = setInterval(async () => {
    try {
      const currentState = await loadGameState(gameCode)
      if (currentState) {
        callback(currentState)
      }
    } catch (error) {
      console.error("Error in polling update:", error)
    }
  }, 3000) // Poll every 3 seconds as fallback

  // Return cleanup function
  return () => {
    console.log("Cleaning up subscriptions for game:", gameCode)
    supabase.removeChannel(channel)
    clearInterval(interval)
  }
}
