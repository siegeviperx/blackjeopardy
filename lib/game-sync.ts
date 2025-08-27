import { supabase } from "./supabase/client"

// Test connection on load
console.log("[DEBUG] Testing Supabase connection...")
supabase.from('game_sessions').select('count').limit(1).then(({ data, error }) => {
  console.log("[DEBUG] Supabase connection test:", error ? `❌ ${error.message}` : "✅ Connected")
  if (error) console.error("[DEBUG] Connection error details:", error)
})

// Test connection
supabase.from('game_sessions').select('count').limit(1).then(({ data, error }) => {
  console.log("[DEBUG] Supabase connection test:", error ? `❌ ${error.message}` : "✅ Connected")
})

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
  console.log("[DEBUG] Attempting to save game state for:", gameCode)
  console.log("[DEBUG] Teams in state:", gameState.teams)
  console.log("[DEBUG] Current question:", gameState.currentQuestion ? "Present" : "None")
  
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .upsert({
        game_code: gameCode,
        game_state: gameState,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("[DEBUG] Supabase save error:", error)
      console.log("[DEBUG] Falling back to localStorage")
      // Use consistent key format
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
      return false
    } else {
      console.log("[DEBUG] Successfully saved to Supabase:", data)
      // Also save to localStorage as backup with consistent key
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
      return true
    }
  } catch (error) {
    console.error("[DEBUG] Exception during save:", error)
    console.log("[DEBUG] Falling back to localStorage")
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(gameState))
    return false
  }
}

export async function loadGameState(gameCode: string): Promise<GameState | null> {
  console.log("[DEBUG] Loading game state for:", gameCode)
  
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("game_state")
      .eq("game_code", gameCode)
      .single()

    if (error || !data) {
      console.log("[DEBUG] No data in Supabase, checking localStorage")
      // Use consistent key format
      const stored = localStorage.getItem(`game_${gameCode}`)
      const result = stored ? JSON.parse(stored) : null
      console.log("[DEBUG] localStorage result:", result ? "Found" : "Not found")
      return result
    }

    console.log("[DEBUG] Loaded from Supabase:", data.game_state.teams?.length || 0, "teams")
    return data.game_state as GameState
  } catch (error) {
    console.error("[DEBUG] Load error:", error)
    const stored = localStorage.getItem(`game_${gameCode}`)
    const result = stored ? JSON.parse(stored) : null
    console.log("[DEBUG] localStorage fallback:", result ? "Found" : "Not found")
    return result
  }
}

export function subscribeToGameUpdates(gameCode: string, callback: (gameState: GameState) => void) {
  console.log("[DEBUG] Setting up real-time subscription for:", gameCode)
  
  let lastUpdateTime = 0
  
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
        console.log("[DEBUG] Real-time update received:", payload.eventType)
        console.log("[DEBUG] New state teams:", payload.new?.game_state?.teams || "No teams")
        
        if (payload.new && "game_state" in payload.new) {
          const newState = payload.new.game_state as GameState
          const updateTime = Date.now()
          
          // Prevent duplicate callbacks within 500ms
          if (updateTime - lastUpdateTime > 500) {
            console.log("[DEBUG] Calling callback with new state")
            lastUpdateTime = updateTime
            callback(newState)
          } else {
            console.log("[DEBUG] Skipping duplicate update")
          }
        } else {
          console.log("[DEBUG] Payload missing game_state")
        }
      },
    )
    .subscribe((status) => {
      console.log("[DEBUG] Subscription status:", status)
      if (status === 'SUBSCRIBED') {
        console.log("[DEBUG] Successfully subscribed to real-time updates")
      } else if (status === 'CHANNEL_ERROR') {
        console.log("[DEBUG] Real-time subscription failed - will rely on localStorage")
      }
    })

  return () => {
    console.log("[DEBUG] Cleaning up subscription")
    supabase.removeChannel(channel)
  }
}
