import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Updated to match the exact GameState interface from page.tsx
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
  try {
    console.log("[v0] Saving game state for code:", gameCode, "with teams:", gameState.teams)
    
    const { error } = await supabase.from("game_sessions").upsert({
      game_code: gameCode,
      game_state: gameState,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error saving game state to Supabase:", error)
      // Fallback to localStorage
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
      console.log("[v0] Saved to localStorage as fallback")
    } else {
      console.log("[v0] Game state saved successfully to Supabase")
    }
  } catch (error) {
    console.error("[v0] Error saving to Supabase:", error)
    // Fallback to localStorage
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
    console.log("[v0] Saved to localStorage due to exception")
  }
}

export async function loadGameState(gameCode: string): Promise<GameState | null> {
  try {
    console.log("[v0] Loading game state for code:", gameCode)
    
    const { data, error } = await supabase
      .from("game_sessions")
      .select("game_state")
      .eq("game_code", gameCode)
      .single()

    if (error || !data) {
      console.log("[v0] No data found in Supabase, checking localStorage")
      // Fallback to localStorage
      const stored = localStorage.getItem(`game_${gameCode}`)
      const result = stored ? JSON.parse(stored) : null
      console.log("[v0] localStorage result:", result)
      return result
    }

    console.log("[v0] Loaded game state from Supabase:", data.game_state)
    return data.game_state as GameState
  } catch (error) {
    console.error("[v0] Error loading from Supabase:", error)
    // Fallback to localStorage
    const stored = localStorage.getItem(`game_${gameCode}`)
    const result = stored ? JSON.parse(stored) : null
    console.log("[v0] localStorage fallback result:", result)
    return result
  }
}

export function subscribeToGameUpdates(gameCode: string, callback: (gameState: GameState) => void) {
  console.log("[v0] Setting up subscription for game:", gameCode)
  
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
        console.log("[v0] Received real-time update:", payload)
        if (payload.new && "game_state" in payload.new) {
          const newState = payload.new.game_state as GameState
          console.log("[v0] Calling callback with new state, teams:", newState.teams)
          callback(newState)
        }
      },
    )
    .subscribe((status) => {
      console.log("[v0] Subscription status:", status)
    })

  return () => {
    console.log("[v0] Cleaning up subscription")
    supabase.removeChannel(channel)
  }
}