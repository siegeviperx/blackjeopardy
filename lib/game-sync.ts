import { supabase } from "./supabase/client"

export interface GameState {
  gameCode: string
  currentView: "home" | "host" | "join" | "admin" | "game"
  gameBoard: Record<string, { question: string; answer: string; used: boolean; isDoubleJeopardy?: boolean }>
  currentQuestion: {
    question: string
    answer: string
    category: string
    value: number
    isDoubleJeopardy?: boolean
  } | null
  teams: string[]
  scores: Record<string, number>
  buzzerQueue: string[]
  gameActive: boolean
  selectedTeam: string
  currentAnsweringTeam: string | null
  buzzerEnabled: boolean
  questionPhase: "waiting" | "answering" | "complete" | "reading"
  buzzedTeam: string | null
  availableTeams: string[]
}

export async function saveGameState(gameCode: string, gameState: GameState) {
  console.log("Saving game state for:", gameCode, "Teams:", gameState.teams.length)
  
  try {
    const { error } = await supabase
      .from("game_sessions")
      .upsert({
        game_code: gameCode,
        game_state: gameState,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error("Supabase save error:", error)
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
    } else {
      console.log("Successfully saved to Supabase")
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
    }
  } catch (error) {
    console.error("Save exception:", error)
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
  }
}

export async function loadGameState(gameCode: string): Promise<GameState | null> {
  console.log("Loading game state for:", gameCode)
  
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("game_state")
      .eq("game_code", gameCode)
      .single()

    if (error || !data) {
      console.log("No Supabase data, checking localStorage")
      const stored = localStorage.getItem(`game_${gameCode}`)
      return stored ? JSON.parse(stored) : null
    }

    console.log("Loaded from Supabase:", data.game_state.teams?.length || 0, "teams")
    return data.game_state as GameState
  } catch (error) {
    console.error("Load error:", error)
    const stored = localStorage.getItem(`game_${gameCode}`)
    return stored ? JSON.parse(stored) : null
  }
}

export function subscribeToGameUpdates(gameCode: string, callback: (gameState: GameState) => void) {
  console.log("Setting up subscription for:", gameCode)
  
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
        console.log("Real-time update received")
        if (payload.new && "game_state" in payload.new) {
          callback(payload.new.game_state as GameState)
        }
      },
    )
    .subscribe()

  return () => {
    console.log("Cleaning up subscription")
    supabase.removeChannel(channel)
  }
}
