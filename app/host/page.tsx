"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import questions from "@/lib/questions"
import { saveToStorage, loadFromStorage } from "@/lib/storage"

interface Team {
  id: string
  name: string
  score: number
  buzzedIn: boolean
}

export default function HostPage() {
  const [gameId] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase())
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [teams, setTeams] = useState<Team[]>([
    { id: "1", name: "Team Alpha", score: 0, buzzedIn: false },
    { id: "2", name: "Team Beta", score: 0, buzzedIn: false },
  ])
  const [buzzerOpen, setBuzzerOpen] = useState(false)

  // Load saved state
  useEffect(() => {
    const savedState = loadFromStorage("game-state")
    if (savedState) {
      setCurrentQuestion(savedState.currentQuestion)
      setUsedQuestions(new Set(savedState.usedQuestions || []))
      setTeams(savedState.teams || teams)
      setBuzzerOpen(savedState.buzzerOpen || false)
    }
  }, [])

  // Save state whenever it changes
  useEffect(() => {
    const gameState = {
      gameId,
      currentQuestion,
      usedQuestions: Array.from(usedQuestions),
      teams,
      buzzerOpen,
    }
    saveToStorage("game-state", gameState)
  }, [gameId, currentQuestion, usedQuestions, teams, buzzerOpen])

  const categories = Object.keys(questions)
  const values = [200, 400, 600, 800, 1000]

  const selectQuestion = (category: string, value: number) => {
    const questionKey = `${category}-${value}`
    if (usedQuestions.has(questionKey)) return

    const questionData = questions[category as keyof typeof questions][value as keyof any]
    setCurrentQuestion({ category, value, ...questionData })
    setBuzzerOpen(true)
    setTeams((prev) => prev.map((team) => ({ ...team, buzzedIn: false })))
  }

  const closeQuestion = (correct: boolean, teamId?: string) => {
    if (currentQuestion) {
      const questionKey = `${currentQuestion.category}-${currentQuestion.value}`
      setUsedQuestions((prev) => new Set([...prev, questionKey]))

      if (teamId) {
        setTeams((prev) =>
          prev.map((team) => {
            if (team.id === teamId) {
              return {
                ...team,
                score: correct ? team.score + currentQuestion.value : team.score - currentQuestion.value,
                buzzedIn: false,
              }
            }
            return { ...team, buzzedIn: false }
          }),
        )
      }
    }

    setCurrentQuestion(null)
    setBuzzerOpen(false)
  }

  const toggleBuzzer = () => {
    setBuzzerOpen(!buzzerOpen)
    setTeams((prev) => prev.map((team) => ({ ...team, buzzedIn: false })))
  }

  const simulateBuzz = (teamId: string) => {
    if (!buzzerOpen) return
    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        buzzedIn: team.id === teamId,
      })),
    )
  }

  const resetGame = () => {
    if (confirm("Reset the entire game? This will clear all progress.")) {
      setCurrentQuestion(null)
      setUsedQuestions(new Set())
      setTeams([
        { id: "1", name: "Team Alpha", score: 0, buzzedIn: false },
        { id: "2", name: "Team Beta", score: 0, buzzedIn: false },
      ])
      setBuzzerOpen(false)
    }
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)",
        color: "#fef3c7",
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: "#fffbeb" }}>
              HOST DASHBOARD
            </h1>
            <p className="text-sm" style={{ color: "#fde68a" }}>
              Black Jeopardy Game Control
            </p>
            <Link href="/">
              <button
                className="mt-2 px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: "rgba(254, 243, 199, 0.2)",
                  color: "#fde68a",
                  border: "1px solid #fde68a",
                }}
              >
                ← Back to Home
              </button>
            </Link>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: "#fde68a" }}>
              Game Code
            </p>
            <p className="text-2xl font-bold" style={{ color: "#fffbeb" }}>
              {gameId}
            </p>
            <button
              onClick={resetGame}
              className="mt-2 px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
              }}
            >
              🔄 Reset Game
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div
              className="rounded-lg p-6 mb-6 shadow-lg"
              style={{
                backgroundColor: "rgba(254, 243, 199, 0.95)",
                border: "2px solid #fde68a",
              }}
            >
              <h2 className="text-center text-2xl font-bold mb-4" style={{ color: "#92400e" }}>
                BLACK JEOPARDY!
              </h2>

              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Category Headers */}
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="p-3 text-center font-bold uppercase text-sm shadow-md rounded"
                        style={{ backgroundColor: "#92400e", color: "#fffbeb" }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>

                  {/* Question Grid */}
                  {values.map((value) => (
                    <div key={value} className="grid grid-cols-5 gap-2 mb-2">
                      {categories.map((category) => {
                        const questionKey = `${category}-${value}`
                        const isUsed = usedQuestions.has(questionKey)

                        return (
                          <button
                            key={`${category}-${value}`}
                            onClick={() => selectQuestion(category, value)}
                            disabled={isUsed}
                            className="p-4 text-xl font-bold border-2 transition-all shadow-md rounded"
                            style={{
                              backgroundColor: isUsed ? "#fde68a" : "#fffbeb",
                              color: isUsed ? "#a16207" : "#92400e",
                              borderColor: "#fde68a",
                              opacity: isUsed ? 0.5 : 1,
                              cursor: isUsed ? "not-allowed" : "pointer",
                            }}
                            onMouseOver={(e) => {
                              if (!isUsed) {
                                e.currentTarget.style.backgroundColor = "#fef3c7"
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isUsed) {
                                e.currentTarget.style.backgroundColor = "#fffbeb"
                              }
                            }}
                          >
                            ${value}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div
                className="rounded-lg p-6 shadow-lg"
                style={{
                  backgroundColor: "rgba(254, 243, 199, 0.95)",
                  border: "2px solid #fde68a",
                }}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: "#92400e" }}>
                  {currentQuestion.category.toUpperCase()} - ${currentQuestion.value}
                </h3>

                <p className="text-lg mb-4" style={{ color: "#92400e" }}>
                  {currentQuestion.question}
                </p>
                <p className="font-bold mb-4" style={{ color: "#a16207" }}>
                  Answer: {currentQuestion.answer}
                </p>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={toggleBuzzer}
                    className="px-4 py-2 rounded font-bold"
                    style={{
                      backgroundColor: buzzerOpen ? "#dc2626" : "#16a34a",
                      color: "#fff",
                    }}
                  >
                    🔔 {buzzerOpen ? "Close Buzzer" : "Open Buzzer"}
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {teams
                    .filter((team) => team.buzzedIn)
                    .map((team) => (
                      <div key={team.id} className="flex gap-2 items-center">
                        <span className="font-medium" style={{ color: "#92400e" }}>
                          {team.name}:
                        </span>
                        <button
                          onClick={() => closeQuestion(true, team.id)}
                          className="font-bold px-3 py-1 rounded"
                          style={{ backgroundColor: "#16a34a", color: "#fff" }}
                        >
                          ✓ Correct (+${currentQuestion.value})
                        </button>
                        <button
                          onClick={() => closeQuestion(false, team.id)}
                          className="font-bold px-3 py-1 rounded"
                          style={{ backgroundColor: "#dc2626", color: "#fff" }}
                        >
                          ✗ Incorrect (-${currentQuestion.value})
                        </button>
                      </div>
                    ))}

                  {teams.filter((team) => team.buzzedIn).length === 0 && (
                    <p className="italic" style={{ color: "#a16207" }}>
                      No teams have buzzed in yet...
                    </p>
                  )}

                  <button
                    onClick={() => closeQuestion(false)}
                    className="ml-4 px-3 py-1 rounded font-bold"
                    style={{
                      border: "2px solid #fbbf24",
                      color: "#a16207",
                      backgroundColor: "transparent",
                    }}
                  >
                    Skip Question
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <div
              className="rounded-lg p-4 shadow-lg"
              style={{
                backgroundColor: "rgba(254, 243, 199, 0.95)",
                border: "2px solid #fde68a",
              }}
            >
              <h3 className="text-center font-bold mb-4" style={{ color: "#92400e" }}>
                Join Game
              </h3>
              <div className="p-4 rounded-lg mb-4 text-center shadow-md" style={{ backgroundColor: "#fffbeb" }}>
                <div
                  className="w-32 h-32 mx-auto flex items-center justify-center font-bold text-sm rounded"
                  style={{
                    backgroundColor: "#fde68a",
                    color: "#a16207",
                  }}
                >
                  QR CODE
                  <br />
                  {gameId}
                </div>
              </div>
              <p className="text-sm text-center break-all" style={{ color: "#a16207" }}>
                Game Code: {gameId}
              </p>
            </div>

            {/* Teams & Scores */}
            <div
              className="rounded-lg p-4 shadow-lg"
              style={{
                backgroundColor: "rgba(254, 243, 199, 0.95)",
                border: "2px solid #fde68a",
              }}
            >
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#92400e" }}>
                👥 Teams ({teams.length})
              </h3>

              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex justify-between items-center p-3 rounded-lg shadow-sm"
                    style={{
                      backgroundColor: "#fffbeb",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: "#92400e" }}>
                        {team.name}
                      </span>
                      {team.buzzedIn && (
                        <span
                          className="px-2 py-1 rounded text-xs animate-pulse"
                          style={{
                            backgroundColor: "#dc2626",
                            color: "#fff",
                          }}
                        >
                          BUZZED!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏆</span>
                      <span className="font-bold" style={{ color: "#92400e" }}>
                        ${team.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulate Buzz Buttons */}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-center" style={{ color: "#a16207" }}>
                  Simulate Buzz (for testing)
                </p>
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => simulateBuzz(team.id)}
                    disabled={!buzzerOpen}
                    className="w-full px-3 py-2 rounded text-sm font-medium"
                    style={{
                      backgroundColor: buzzerOpen ? "#eab308" : "#9ca3af",
                      color: buzzerOpen ? "#fff" : "#6b7280",
                      cursor: buzzerOpen ? "pointer" : "not-allowed",
                    }}
                  >
                    Buzz for {team.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
