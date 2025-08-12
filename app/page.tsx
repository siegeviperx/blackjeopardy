"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type questions, doubleJeopardyQuestions, getRandomQuestion } from "@/lib/questions"
import Image from "next/image"

const ADMIN_PIN = "2424"

interface GameState {
  gameCode: string
  currentView: "home" | "host" | "join" | "game" | "admin" | "adminAuth"
  gameBoard: { [key: string]: { question: string; answer: string; used: boolean; isDoubleJeopardy?: boolean } }
  scores: { [team: string]: number }
  teams: string[]
  currentQuestion: {
    category: string
    value: number
    question: string
    answer: string
    isDoubleJeopardy?: boolean
  } | null
  buzzedTeam: string | null
  usedQuestions: Set<string>
  doubleJeopardyUsed: string[]
}

export default function Page() {
  const [gameState, setGameState] = useState<GameState>({
    gameCode: "",
    currentView: "home",
    gameBoard: {},
    scores: {},
    teams: [],
    currentQuestion: null,
    buzzedTeam: null,
    usedQuestions: new Set(),
    doubleJeopardyUsed: [],
  })

  const [adminPin, setAdminPin] = useState("")
  const [pinError, setPinError] = useState("")

  const [teamName, setTeamName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [newQuestion, setNewQuestion] = useState({ category: "", value: 200, question: "", answer: "" })
  const [newDoubleJeopardyQuestion, setNewDoubleJeopardyQuestion] = useState({
    category: "",
    value: 400,
    question: "",
    answer: "",
  })

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPin === ADMIN_PIN) {
      setGameState((prev) => ({ ...prev, currentView: "admin" }))
      setAdminPin("")
      setPinError("")
    } else {
      setPinError("Invalid PIN. Please try again.")
      setAdminPin("")
    }
  }

  const initializeGameBoard = () => {
    const board: { [key: string]: { question: string; answer: string; used: boolean; isDoubleJeopardy?: boolean } } = {}
    const categories = ["history", "trivia", "sports", "film", "music"]
    const values = [200, 400, 600, 800, 1000]

    // Add some random Double Jeopardy questions (2-3 per game)
    const djQuestions = [...doubleJeopardyQuestions].sort(() => Math.random() - 0.5).slice(0, 3)
    const djPositions = new Set<string>()

    djQuestions.forEach((djQ) => {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      const randomValue = values[Math.floor(Math.random() * values.length)]
      const key = `${randomCategory}-${randomValue}`
      djPositions.add(key)
    })

    categories.forEach((category) => {
      values.forEach((value) => {
        const key = `${category}-${value}`
        if (djPositions.has(key)) {
          const djQuestion = djQuestions[Array.from(djPositions).indexOf(key)]
          board[key] = {
            question: djQuestion.question,
            answer: djQuestion.answer,
            used: false,
            isDoubleJeopardy: true,
          }
        } else {
          const randomQ = getRandomQuestion(category as keyof typeof questions, value)
          if (randomQ) {
            board[key] = {
              question: randomQ.question,
              answer: randomQ.answer,
              used: false,
            }
          } else {
            // Fallback question if getRandomQuestion fails
            board[key] = {
              question: `Sample question for ${category} - ${value}`,
              answer: `Sample answer for ${category} - ${value}`,
              used: false,
            }
            console.warn(`Failed to load question for ${category}-${value}, using fallback`)
          }
        }
      })
    })

    return board
  }

  const startHostGame = () => {
    try {
      const code = Math.random().toString(36).substr(2, 6).toUpperCase()
      const board = initializeGameBoard()
      const newGameState = {
        ...gameState,
        gameCode: code,
        currentView: "host" as const,
        gameBoard: board,
        scores: {},
        teams: [],
        usedQuestions: new Set<string>(),
        doubleJeopardyUsed: [],
      }
      setGameState(newGameState)

      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem(`game_${code}`, JSON.stringify(newGameState))
        } catch (error) {
          console.warn("Failed to save game state:", error)
        }
      }
    } catch (error) {
      console.error("Failed to start host game:", error)
      const fallbackCode = "GAME" + Math.floor(Math.random() * 1000)
      setGameState((prev) => ({
        ...prev,
        gameCode: fallbackCode,
        currentView: "host",
        gameBoard: initializeGameBoard(),
        scores: {},
        teams: [],
        usedQuestions: new Set<string>(),
        doubleJeopardyUsed: [],
      }))
    }
  }

  const joinGame = () => {
    if (!joinCode.trim()) {
      alert("Please enter a game code")
      return
    }

    try {
      let savedState = null
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const saved = localStorage.getItem(`game_${joinCode}`)
          if (saved) {
            savedState = JSON.parse(saved)
          }
        } catch (error) {
          console.warn("Failed to load game state:", error)
        }
      }

      if (savedState) {
        setGameState({
          ...savedState,
          currentView: "join",
        })
      } else {
        setGameState((prev) => ({
          ...prev,
          gameCode: joinCode,
          currentView: "join",
          teams: [],
          scores: {},
        }))
      }
    } catch (error) {
      console.error("Failed to join game:", error)
      alert("Failed to join game. Please try again.")
    }
  }

  const addTeam = () => {
    console.log("addTeam called with teamName:", teamName)
    console.log("Current teams:", gameState.teams)

    if (!teamName.trim()) {
      console.log("Team name is empty")
      return
    }

    if (gameState.teams.includes(teamName)) {
      console.log("Team name already exists")
      alert("Team name already exists. Please choose a different name.")
      return
    }

    const updatedState = {
      ...gameState,
      teams: [...gameState.teams, teamName],
      scores: { ...gameState.scores, [teamName]: 0 },
      currentView: gameState.currentView === "join" ? ("game" as const) : gameState.currentView,
    }

    console.log("Updated state:", updatedState)
    setGameState(updatedState)
    setTeamName("")

    // Save to localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`game_${gameState.gameCode}`, JSON.stringify(updatedState))
        console.log("Saved to localStorage successfully")

        window.dispatchEvent(
          new StorageEvent("storage", {
            key: `game_${gameState.gameCode}`,
            newValue: JSON.stringify(updatedState),
            storageArea: localStorage,
          }),
        )
      } catch (error) {
        console.warn("Failed to save game state:", error)
      }
    }
  }

  const selectQuestion = (category: string, value: number) => {
    console.log("selectQuestion called:", category, value) // Added debugging
    const key = `${category}-${value}`
    const questionData = gameState.gameBoard[key]

    console.log("questionData:", questionData) // Added debugging

    if (!questionData || questionData.used) {
      console.log("Question not found or already used") // Added debugging
      return
    }

    const updatedBoard = {
      ...gameState.gameBoard,
      [key]: { ...questionData, used: true },
    }

    const updatedState = {
      ...gameState,
      gameBoard: updatedBoard,
      currentQuestion: {
        category,
        value: questionData.isDoubleJeopardy ? value * 2 : value,
        question: questionData.question,
        answer: questionData.answer,
        isDoubleJeopardy: questionData.isDoubleJeopardy,
      },
      buzzedTeam: null,
      usedQuestions: new Set([...gameState.usedQuestions, key]),
    }

    if (questionData.isDoubleJeopardy) {
      updatedState.doubleJeopardyUsed = [...gameState.doubleJeopardyUsed, key]
    }

    console.log("Setting updated state:", updatedState.currentQuestion) // Added debugging
    setGameState(updatedState)

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`game_${gameState.gameCode}`, JSON.stringify(updatedState))
      } catch (error) {
        console.warn("Failed to save game state:", error)
      }
    }
  }

  const buzz = (team: string) => {
    const updatedState = {
      ...gameState,
      buzzedTeam: team,
    }
    setGameState(updatedState)

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`game_${gameState.gameCode}`, JSON.stringify(updatedState))
      } catch (error) {
        console.warn("Failed to save game state:", error)
      }
    }
  }

  const awardPoints = (team: string, correct: boolean) => {
    if (!gameState.currentQuestion) return

    const points = correct ? gameState.currentQuestion.value : -gameState.currentQuestion.value
    const updatedState = {
      ...gameState,
      scores: {
        ...gameState.scores,
        [team]: (gameState.scores[team] || 0) + points,
      },
      currentQuestion: null,
      buzzedTeam: null,
    }
    setGameState(updatedState)

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`game_${gameState.gameCode}`, JSON.stringify(updatedState))
      } catch (error) {
        console.warn("Failed to save game state:", error)
      }
    }
  }

  const addCustomQuestion = () => {
    if (!newQuestion.category || !newQuestion.question || !newQuestion.answer) return

    // This would typically update the questions database
    console.log("Adding custom question:", newQuestion)
    setNewQuestion({ category: "", value: 200, question: "", answer: "" })
  }

  const addCustomDoubleJeopardyQuestion = () => {
    if (!newDoubleJeopardyQuestion.category || !newDoubleJeopardyQuestion.question || !newDoubleJeopardyQuestion.answer)
      return

    console.log("Adding custom Double Jeopardy question:", newDoubleJeopardyQuestion)
    setNewDoubleJeopardyQuestion({ category: "", value: 400, question: "", answer: "" })
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `game_${gameState.gameCode}` && e.newValue) {
        try {
          const updatedState = JSON.parse(e.newValue)
          console.log("Storage change detected, updating state:", updatedState)
          setGameState((prev) => ({
            ...updatedState,
            currentView: prev.currentView,
          }))
        } catch (error) {
          console.warn("Failed to parse storage update:", error)
        }
      }
    }

    const pollForUpdates = () => {
      if (typeof window !== "undefined" && window.localStorage && gameState.gameCode) {
        try {
          const stored = localStorage.getItem(`game_${gameState.gameCode}`)
          if (stored) {
            const storedState = JSON.parse(stored)
            // Only update if there are actual changes (like new teams)
            if (storedState.teams.length !== gameState.teams.length) {
              console.log("Polling detected team changes, updating state")
              setGameState((prev) => ({
                ...storedState,
                currentView: prev.currentView,
              }))
            }
          }
        } catch (error) {
          console.warn("Failed to poll for updates:", error)
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      const pollInterval = setInterval(pollForUpdates, 2000)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
        clearInterval(pollInterval)
      }
    }
  }, [gameState.gameCode, gameState.teams.length])

  if (gameState.currentView === "adminAuth") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-amber-100 text-amber-900">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/melanated-wellness-logo.png"
                alt="Melanated Wellness"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>Enter PIN to access admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                />
              </div>
              {pinError && <p className="text-red-500 text-sm">{pinError}</p>}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-white text-amber-800 hover:bg-gray-50">
                  Access Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white text-amber-800 border-amber-300 hover:bg-gray-50"
                  onClick={() => setGameState((prev) => ({ ...prev, currentView: "home" }))}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Home Page
  if (gameState.currentView === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="/melanated-wellness-logo.png"
                alt="Melanated Wellness"
                width={120}
                height={120}
                className="rounded-lg shadow-lg"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent">
              BLACK JEOPARDY
            </h1>
            <p className="text-lg sm:text-xl text-amber-100 max-w-2xl mx-auto">
              Test your knowledge of Black history, culture, and achievements in this interactive trivia game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200 hover:bg-amber-100 transition-all duration-300 text-amber-900">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-amber-900">Host Game</CardTitle>
                <CardDescription className="text-amber-700">
                  Start a new game session and manage questions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={startHostGame}
                  className="w-full bg-white text-amber-800 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Start Hosting
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200 hover:bg-amber-100 transition-all duration-300 text-amber-900">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-amber-900">Join Game</CardTitle>
                <CardDescription className="text-amber-700">
                  Enter a game code to join an existing session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter game code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-white/80 border-amber-300 text-amber-900 placeholder-amber-600"
                />
                <Button
                  onClick={joinGame}
                  className="w-full bg-white text-amber-800 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Join Game
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200 hover:bg-amber-100 transition-all duration-300 text-amber-900">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-amber-900">Admin Panel</CardTitle>
                <CardDescription className="text-amber-700">Manage questions and game settings</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={() => setGameState((prev) => ({ ...prev, currentView: "adminAuth" }))}
                  className="w-full bg-white text-amber-800 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Manage Questions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Host View
  if (gameState.currentView === "host") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/melanated-wellness-logo.png"
                alt="Melanated Wellness"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">BLACK JEOPARDY</h1>
                <p className="text-sm text-amber-100">
                  Game Code: <span className="font-mono text-yellow-300 text-lg">{gameState.gameCode}</span>
                </p>
                <div className="mt-2">
                  <div className="bg-white p-2 rounded-lg inline-block">
                    <div className="w-24 h-24 bg-white flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(`${window.location.origin}/?join=${gameState.gameCode}`)}`}
                        alt={`QR Code for game ${gameState.gameCode}`}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-amber-200 mt-1">Scan to join game</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setGameState((prev) => ({ ...prev, currentView: "home" }))}
              variant="outline"
              className="border-amber-200 text-amber-900 bg-amber-100 hover:bg-amber-200 font-semibold"
            >
              End Game
            </Button>
          </div>

          {/* Teams and Scores */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Teams & Scores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
              {gameState.teams.map((team) => (
                <Card key={team} className="bg-amber-100/90 backdrop-blur-sm border-amber-200">
                  <CardContent className="p-3 text-center">
                    <p className="font-semibold text-sm truncate">{team}</p>
                    <p className="text-lg font-bold text-yellow-300">${gameState.scores[team] || 0}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Game Board */}
          <div className="w-full overflow-x-auto">
            <div className="w-full grid grid-cols-5 gap-2 text-center">
              {["History", "Trivia", "Sports", "Film", "Music"].map((category) => (
                <div key={category} className="bg-teal-800 p-2 sm:p-4 rounded font-bold text-sm sm:text-base">
                  {category}
                </div>
              ))}

              {[200, 400, 600, 800, 1000].map((value) =>
                ["history", "trivia", "sports", "film", "music"].map((category) => {
                  const key = `${category}-${value}`
                  const questionData = gameState.gameBoard[key]
                  const isUsed = questionData?.used

                  return (
                    <Button
                      key={key}
                      onClick={() => selectQuestion(category, value)}
                      disabled={isUsed}
                      className={`h-12 sm:h-16 text-lg sm:text-xl font-bold ${
                        isUsed
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-amber-800 hover:bg-amber-700 text-yellow-200"
                      }`}
                    >
                      {isUsed ? "✓" : `$${value}`}
                    </Button>
                  )
                }),
              )}
            </div>
          </div>

          {/* Current Question */}
          {gameState.currentQuestion && (
            <Card className="mt-6 bg-amber-100/95 backdrop-blur-sm border-2 border-amber-300 text-amber-900 shadow-lg">
              <CardHeader className="bg-amber-200/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">
                    {gameState.currentQuestion.category.toUpperCase()} - ${gameState.currentQuestion.value}
                  </CardTitle>
                  {gameState.currentQuestion.isDoubleJeopardy && (
                    <Badge className="bg-red-600 text-white font-bold px-3 py-1">⚡ DOUBLE JEOPARDY!</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white/80 p-4 rounded-lg mb-4 border border-amber-300">
                  <p className="text-lg font-medium text-amber-900">{gameState.currentQuestion.question}</p>
                </div>
                <details className="mb-4">
                  <summary className="cursor-pointer text-amber-700 hover:text-amber-600 font-semibold">
                    Show Answer
                  </summary>
                  <div className="mt-2 bg-green-100 p-3 rounded-lg border border-green-300">
                    <p className="text-green-800 font-semibold">{gameState.currentQuestion.answer}</p>
                  </div>
                </details>

                {gameState.buzzedTeam ? (
                  <div className="space-y-2">
                    <p className="font-bold">Team "{gameState.buzzedTeam}" buzzed in!</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => awardPoints(gameState.buzzedTeam!, true)}
                        className="bg-white text-green-700 hover:bg-gray-50 border border-green-300"
                      >
                        Correct (+${gameState.currentQuestion.value})
                      </Button>
                      <Button
                        onClick={() => awardPoints(gameState.buzzedTeam!, false)}
                        className="bg-white text-red-700 hover:bg-gray-50 border border-red-300"
                      >
                        Incorrect (-${gameState.currentQuestion.value})
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-amber-700">Waiting for teams to buzz in...</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Player Game View
  if (gameState.currentView === "game") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-800 text-white p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6">
            <Image
              src="/melanated-wellness-logo.png"
              alt="Melanated Wellness"
              width={80}
              height={80}
              className="rounded-lg mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold">BLACK JEOPARDY</h1>
            <p className="text-amber-100">
              Game: {gameState.gameCode} | Team: {teamName}
            </p>
          </div>

          {/* Current Question for Players */}
          {gameState.currentQuestion && (
            <Card className="mb-6 bg-amber-100/90 backdrop-blur-sm border-amber-200 text-amber-900">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {gameState.currentQuestion.category.toUpperCase()} - ${gameState.currentQuestion.value}
                  </CardTitle>
                  {gameState.currentQuestion.isDoubleJeopardy && (
                    <Badge className="bg-red-600 text-white font-bold">⚡ DOUBLE JEOPARDY!</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base mb-4 bg-white p-3 rounded">{gameState.currentQuestion.question}</p>
                {gameState.buzzedTeam === teamName ? (
                  <p className="text-green-600 font-bold bg-white p-2 rounded">
                    You buzzed in! Give your answer to the host.
                  </p>
                ) : gameState.buzzedTeam ? (
                  <p className="text-amber-700 bg-white p-2 rounded">Team "{gameState.buzzedTeam}" buzzed in first.</p>
                ) : (
                  <Button
                    onClick={() => buzz(teamName)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-xl"
                  >
                    🔔 BUZZ IN!
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Game Board for Players */}
          <Card className="mb-6 bg-amber-100/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle>Game Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm">
                {/* Category Headers */}
                {Object.keys(gameState.gameBoard).map((category) => (
                  <div key={category} className="bg-blue-600 text-white p-2 text-center font-bold rounded">
                    {category.toUpperCase()}
                  </div>
                ))}

                {/* Question Values */}
                {[200, 400, 600, 800, 1000].map((value) =>
                  Object.keys(gameState.gameBoard).map((category) => {
                    const key = `${category}-${value}`
                    const isUsed = gameState.usedQuestions.includes(key)
                    return (
                      <div
                        key={key}
                        className={`p-2 text-center font-bold rounded ${
                          isUsed ? "bg-gray-400 text-gray-600" : "bg-blue-500 text-white"
                        }`}
                      >
                        ${value}
                      </div>
                    )
                  }),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scoreboard */}
          <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle>Scoreboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(gameState.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([team, score]) => (
                    <div
                      key={team}
                      className={`flex justify-between items-center p-3 rounded ${
                        team === teamName ? "bg-yellow-200 font-bold" : "bg-white/20"
                      }`}
                    >
                      <span>{team}</span>
                      <span className="font-bold">${score}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => setGameState((prev) => ({ ...prev, currentView: "home" }))}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
            >
              Leave Game
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Join/Player View
  if (gameState.currentView === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-800 text-white p-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-6">
            <Image
              src="/melanated-wellness-logo.png"
              alt="Melanated Wellness"
              width={80}
              height={80}
              className="rounded-lg mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold">BLACK JEOPARDY</h1>
            <p className="text-amber-100">Game: {gameState.gameCode}</p>
          </div>

          {!gameState.teams.includes(teamName) && (
            <Card className="mb-6 bg-amber-100/90 backdrop-blur-sm border-amber-200">
              <CardHeader>
                <CardTitle>Join Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-white/80 border-amber-300 text-amber-900 placeholder-amber-600"
                />
                <Button
                  onClick={addTeam}
                  className="w-full bg-white text-amber-800 hover:bg-gray-50 font-semibold py-3"
                >
                  Join Game
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Question for Players */}
          {gameState.currentQuestion && gameState.teams.includes(teamName) && (
            <Card className="mb-6 bg-amber-100/90 backdrop-blur-sm border-amber-200 text-amber-900">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {gameState.currentQuestion.category.toUpperCase()} - ${gameState.currentQuestion.value}
                  </CardTitle>
                  {gameState.currentQuestion.isDoubleJeopardy && (
                    <Badge className="bg-red-600 text-white font-bold">⚡ DOUBLE JEOPARDY!</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base mb-4">{gameState.currentQuestion.question}</p>
                {gameState.buzzedTeam === teamName ? (
                  <p className="text-yellow-300 font-bold">You buzzed in! Give your answer to the host.</p>
                ) : gameState.buzzedTeam ? (
                  <p className="text-amber-200">Team "{gameState.buzzedTeam}" buzzed in first.</p>
                ) : (
                  <Button
                    onClick={() => buzz(teamName)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    🔔 BUZZ IN!
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scoreboard */}
          <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle>Scoreboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(gameState.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([team, score]) => (
                    <div
                      key={team}
                      className={`flex justify-between items-center p-3 rounded ${
                        team === teamName ? "bg-yellow-200 font-bold" : "bg-white/20"
                      }`}
                    >
                      <span>{team}</span>
                      <span className="font-bold">${score}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Panel
  if (gameState.currentView === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-800 text-white p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Image
                src="/melanated-wellness-logo.png"
                alt="Melanated Wellness"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <Button
              onClick={() => setGameState((prev) => ({ ...prev, currentView: "home" }))}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20"
            >
              Back to Home
            </Button>
          </div>

          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-amber-100/90">
              <TabsTrigger value="regular" className="data-[state=active]:bg-amber-200 text-amber-900">
                Regular Questions
              </TabsTrigger>
              <TabsTrigger value="double" className="data-[state=active]:bg-amber-200 text-amber-900">
                Double Jeopardy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="space-y-6">
              <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200 text-amber-900">
                <CardHeader>
                  <CardTitle>Add Regular Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={newQuestion.category}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 rounded bg-amber-50 border border-amber-300 text-amber-900"
                      >
                        <option value="">Select Category</option>
                        <option value="history">History</option>
                        <option value="trivia">Trivia</option>
                        <option value="sports">Sports</option>
                        <option value="film">Film</option>
                        <option value="music">Music</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="value">Point Value</Label>
                      <select
                        id="value"
                        value={newQuestion.value}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, value: Number(e.target.value) }))}
                        className="w-full p-2 rounded bg-amber-50 border border-amber-300 text-amber-900"
                      >
                        <option value={200}>200</option>
                        <option value={400}>400</option>
                        <option value={600}>600</option>
                        <option value={800}>800</option>
                        <option value={1000}>1000</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                      className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600"
                      placeholder="Enter the question..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer">Answer</Label>
                    <Input
                      id="answer"
                      value={newQuestion.answer}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, answer: e.target.value }))}
                      className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600"
                      placeholder="What is...? or Who is...?"
                    />
                  </div>
                  <Button onClick={addCustomQuestion} className="w-full bg-white text-amber-800 hover:bg-gray-50">
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="double" className="space-y-6">
              <Card className="bg-amber-100/90 backdrop-blur-sm border-amber-200 text-amber-900">
                <CardHeader>
                  <CardTitle>Add Double Jeopardy Question</CardTitle>
                  <CardDescription className="text-gray-300">
                    These questions are worth double points and appear randomly during games
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dj-category">Category</Label>
                      <Input
                        id="dj-category"
                        value={newDoubleJeopardyQuestion.category}
                        onChange={(e) =>
                          setNewDoubleJeopardyQuestion((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600"
                        placeholder="Enter category..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="dj-value">Base Point Value</Label>
                      <select
                        id="dj-value"
                        value={newDoubleJeopardyQuestion.value}
                        onChange={(e) =>
                          setNewDoubleJeopardyQuestion((prev) => ({ ...prev, value: Number(e.target.value) }))
                        }
                        className="w-full p-2 rounded bg-amber-50 border border-amber-300 text-amber-900"
                      >
                        <option value={200}>200 (becomes 400)</option>
                        <option value={400}>400 (becomes 800)</option>
                        <option value={600}>600 (becomes 1200)</option>
                        <option value={800}>800 (becomes 1600)</option>
                        <option value={1000}>1000 (becomes 2000)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dj-question">Question</Label>
                    <Textarea
                      id="dj-question"
                      value={newDoubleJeopardyQuestion.question}
                      onChange={(e) => setNewDoubleJeopardyQuestion((prev) => ({ ...prev, question: e.target.value }))}
                      className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600"
                      placeholder="Enter the Double Jeopardy question..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="dj-answer">Answer</Label>
                    <Input
                      id="dj-answer"
                      value={newDoubleJeopardyQuestion.answer}
                      onChange={(e) => setNewDoubleJeopardyQuestion((prev) => ({ ...prev, answer: e.target.value }))}
                      className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600"
                      placeholder="What is...? or Who is...?"
                    />
                  </div>
                  <Button
                    onClick={addCustomDoubleJeopardyQuestion}
                    className="w-full bg-white text-amber-800 hover:bg-gray-50"
                  >
                    Add Double Jeopardy Question
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return null
}
