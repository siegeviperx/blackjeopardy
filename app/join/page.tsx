"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import questions from "@/lib/questions"
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/storage"

interface GameInfo {
  gameId: string
  teamName: string
  score: number
  buzzedIn: boolean
}

export default function JoinPage() {
  const searchParams = useSearchParams()
  const gameIdFromUrl = searchParams.get("game")

  const [gameId, setGameId] = useState(gameIdFromUrl || "")
  const [teamName, setTeamName] = useState("")
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [joined, setJoined] = useState(false)

  // Load saved player info
  useEffect(() => {
    const savedInfo = loadFromStorage("player-info")
    if (savedInfo) {
      setGameInfo(savedInfo)
      setJoined(true)
    }
  }, [])

  // Save player info whenever it changes
  useEffect(() => {
    if (gameInfo) {
      saveToStorage("player-info", gameInfo)
    }
  }, [gameInfo])

  const joinGame = () => {
    if (!gameId || !teamName) return

    const newGameInfo: GameInfo = {
      gameId,
      teamName,
      score: 0,
      buzzedIn: false,
    }

    setGameInfo(newGameInfo)
    setJoined(true)
  }

  const leaveGame = () => {
    if (confirm("Are you sure you want to leave the game?")) {
      clearStorage("player-info")
      setGameInfo(null)
      setJoined(false)
      setGameId("")
      setTeamName("")
    }
  }

  const buzzIn = () => {
    if (!gameInfo) return

    // Add haptic feedback for mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100)
    }

    setGameInfo((prev) => (prev ? { ...prev, buzzedIn: true } : null))
  }

  if (!joined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)",
          color: "#fef3c7",
        }}
      >
        <div
          className="w-full max-w-md rounded-lg p-6 shadow-lg"
          style={{
            backgroundColor: "rgba(254, 243, 199, 0.95)",
            border: "2px solid #fde68a",
          }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#92400e" }}>
              Join Black Jeopardy!
            </h1>
            <p className="text-sm mt-2" style={{ color: "#a16207" }}>
              Hosted by Melanated Wellness
            </p>
            <Link href="/">
              <button
                className="mt-2 px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: "rgba(146, 64, 14, 0.2)",
                  color: "#a16207",
                  border: "1px solid #a16207",
                }}
              >
                ← Back to Home
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                Game Code
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="Enter game code"
                className="w-full text-lg p-4 rounded-lg"
                style={{
                  backgroundColor: "#fffbeb",
                  border: "2px solid #fde68a",
                  color: "#92400e",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name"
                className="w-full text-lg p-4 rounded-lg"
                style={{
                  backgroundColor: "#fffbeb",
                  border: "2px solid #fde68a",
                  color: "#92400e",
                }}
              />
            </div>

            <button
              onClick={joinGame}
              disabled={!gameId || !teamName}
              className="w-full font-bold py-4 text-lg rounded-lg transition-colors"
              style={{
                backgroundColor: !gameId || !teamName ? "#9ca3af" : "#92400e",
                color: "#fffbeb",
                cursor: !gameId || !teamName ? "not-allowed" : "pointer",
              }}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)",
        color: "#fef3c7",
      }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <Link href="/">
              <button
                className="px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: "rgba(254, 243, 199, 0.2)",
                  color: "#fde68a",
                  border: "1px solid #fde68a",
                }}
              >
                ← Home
              </button>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-1" style={{ color: "#fffbeb" }}>
                BLACK JEOPARDY!
              </h1>
              <p className="text-sm" style={{ color: "#fde68a" }}>
                Hosted by Melanated Wellness
              </p>
            </div>
            <button
              onClick={leaveGame}
              className="px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
              }}
            >
              ✕ Leave
            </button>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <span
              className="px-3 py-1 rounded"
              style={{
                border: "1px solid #fde68a",
                backgroundColor: "rgba(146, 64, 14, 0.5)",
              }}
            >
              Game: {gameInfo?.gameId}
            </span>
            <span
              className="px-3 py-1 rounded"
              style={{
                border: "1px solid #eab308",
                backgroundColor: "rgba(161, 98, 7, 0.5)",
              }}
            >
              Team: {gameInfo?.teamName}
            </span>
            <span
              className="px-3 py-1 rounded"
              style={{
                border: "1px solid #16a34a",
                backgroundColor: "rgba(22, 163, 74, 0.5)",
              }}
            >
              Score: ${gameInfo?.score || 0}
            </span>
          </div>
        </div>

        {/* Game Board Preview */}
        <div
          className="rounded-lg p-4 mb-6 shadow-lg"
          style={{
            backgroundColor: "rgba(254, 243, 199, 0.95)",
            border: "2px solid #fde68a",
          }}
        >
          <h2 className="text-center text-xl font-bold mb-4" style={{ color: "#92400e" }}>
            GAME BOARD
          </h2>

          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              {/* Category Headers */}
              <div className="grid grid-cols-5 gap-1 mb-2">
                {Object.keys(questions).map((category) => (
                  <div
                    key={category}
                    className="p-2 text-center font-bold uppercase text-xs"
                    style={{ backgroundColor: "#92400e", color: "#fffbeb" }}
                  >
                    {category}
                  </div>
                ))}
              </div>

              {/* Question Grid */}
              {[200, 400, 600, 800, 1000].map((value) => (
                <div key={value} className="grid grid-cols-5 gap-1 mb-1">
                  {Object.keys(questions).map((category) => (
                    <div
                      key={`${category}-${value}`}
                      className="p-3 text-lg font-bold text-center border"
                      style={{
                        backgroundColor: "#fffbeb",
                        color: "#92400e",
                        borderColor: "#fde68a",
                      }}
                    >
                      ${value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buzzer */}
        <div
          className="text-center rounded-lg p-6 shadow-lg"
          style={{
            backgroundColor: "rgba(254, 243, 199, 0.95)",
            border: "2px solid #fde68a",
          }}
        >
          <button
            onClick={buzzIn}
            className="w-32 h-32 rounded-full text-xl font-bold transition-all duration-200"
            style={{
              backgroundColor: gameInfo?.buzzedIn ? "#9ca3af" : "#eab308",
              color: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              animation: gameInfo?.buzzedIn ? "none" : "pulse 2s infinite",
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">🔔</span>
              <span>BUZZ</span>
            </div>
          </button>

          <p className="mt-4" style={{ color: "#a16207" }}>
            {gameInfo?.buzzedIn ? "You buzzed in! Wait for host." : "Tap the buzzer when you know the answer!"}
          </p>

          {gameInfo?.buzzedIn && (
            <div
              className="mt-2 px-4 py-2 rounded animate-pulse"
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
              }}
            >
              YOU BUZZED IN!
            </div>
          )}

          <div className="mt-4 text-xs" style={{ color: "#a16207" }}>
            Game progress is automatically saved
          </div>
        </div>
      </div>
    </div>
  )
}
