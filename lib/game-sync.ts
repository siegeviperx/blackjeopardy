import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface GameState {
  gameCode: string
  currentView: string
  gameBoard: Record<string, any>
  teams: string[]
  scores: Record<string, number>
  currentQuestion: any
  usedQuestions: Set<string>
}

export async function saveGameState(gameCode: string, gameState: GameState) {
  try {
    const { error } = await supabase.from("game_sessions").upsert({
      game_code: gameCode,
      game_state: gameState,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving game state:", error)
      // Fallback to localStorage
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
    }
  } catch (error) {
    console.error("Error saving to Supabase:", error)
    // Fallback to localStorage
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
  }
}

export async function loadGameState(gameCode: string): Promise<GameState | null> {
  try {
    const { data, error } = await supabase.from("game_sessions").select("game_state").eq("game_code", gameCode).single()

    if (error || !data) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`game_${gameCode}`)
      return stored ? JSON.parse(stored) : null
    }

    return data.game_state as GameState
  } catch (error) {
    console.error("Error loading from Supabase:", error)
    // Fallback to localStorage
    const stored = localStorage.getItem(`game_${gameCode}`)
    return stored ? JSON.parse(stored) : null
  }
}

export function subscribeToGameUpdates(gameCode: string, callback: (gameState: GameState) => void) {
  const channel = supabase
    .channel(`game_${gameCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_sessions",
        filter: `game_code=eq.${gameCode}`,
      },
      (payload) => {
        if (payload.new && "game_state" in payload.new) {
          callback(payload.new.game_state as GameState)
        }
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
