"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Zap } from "lucide-react"
import { type questions, getRandomQuestion } from "@/lib/questions"
import { saveGameState, loadGameState, subscribeToGameUpdates } from "@/lib/game-sync"

type GameState = {
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

const initialGameState: GameState = {
  gameCode: "",
  currentView: "home",
  gameBoard: {},
  currentQuestion: null,
  teams: [],
  scores: {},
  buzzerQueue: [],
  gameActive: false,
  selectedTeam: "",
  currentAnsweringTeam: null,
  buzzerEnabled: false,
  questionPhase: "waiting",
  buzzedTeam: null,
  availableTeams: [],
}

export default function BlackJeopardyApp() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [joinCode, setJoinCode] = useState("")
  const [teamName, setTeamName] = useState("")
  const [adminPin, setAdminPin] = useState("")
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showPinPrompt, setShowPinPrompt] = useState(false)

  const generateSimpleGameCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const initializeGameBoard = () => {
  const board: Record<string, { question: string; answer: string; used: boolean; isDoubleJeopardy?: boolean }> = {}
  const categories = ["history", "trivia", "sports", "film", "music"]
  const values = [200, 400, 600, 800, 1000]

  categories.forEach((category) => {
    values.forEach((value) => {
      const questionData = getRandomQuestion(category as keyof typeof questions, value)
      if (questionData) {
        const key = `${category}-${value}`
        board[key] = {
          question: questionData.question,
          answer: questionData.answer,
          used: false,
        }
      } else {
        console.warn(`No question found for ${category}-${value}`)
        const key = `${category}-${value}`
        board[key] = {
          question: `Sample question for ${category} ${value}`,
          answer: `Sample answer for ${category} ${value}`,
          used: false,
        }
      }
    })
  })

  // Only add Double Jeopardy on client-side to avoid hydration mismatch
  if (typeof window !== 'undefined') {
    const boardKeys = Object.keys(board)
    const numDoubleJeopardy = Math.floor(Math.random() * 2) + 2
    const selectedKeys = []

    for (let i = 0; i < numDoubleJeopardy && i < boardKeys.length; i++) {
      let randomKey
      do {
        randomKey = boardKeys[Math.floor(Math.random() * boardKeys.length)]
      } while (selectedKeys.includes(randomKey))

      selectedKeys.push(randomKey)
      board[randomKey].isDoubleJeopardy = true
    }

    console.log(`Initialized game board with ${numDoubleJeopardy} Double Jeopardy questions`)
  }

  return board
}}
      })
    })

    // Add 2-3 Double Jeopardy questions randomly
    const boardKeys = Object.keys(board)
    const numDoubleJeopardy = Math.floor(Math.random() * 2) + 2 // 2-3 questions
    const selectedKeys = []

    for (let i = 0; i < numDoubleJeopardy && i < boardKeys.length; i++) {
      let randomKey
      do {
        randomKey = boardKeys[Math.floor(Math.random() * boardKeys.length)]
      } while (selectedKeys.includes(randomKey))

      selectedKeys.push(randomKey)
      board[randomKey].isDoubleJeopardy = true
    }

    console.log(`Initialized game board with ${numDoubleJeopardy} Double Jeopardy questions`)
    return board
  }

  const startHostGame = async () => {
    try {
      console.log("Starting host game...")
      const code = generateSimpleGameCode()
      const board = initializeGameBoard()

      const newGameState: GameState = {
        ...initialGameState,
        gameCode: code,
        currentView: "host",
        gameBoard: board,
        gameActive: true,
        availableTeams: [],
      }

      setGameState(newGameState)
      await saveGameState(code, newGameState)

      console.log("Host game started with code:", code)
    } catch (error) {
      console.error("Error starting host game:", error)
    }
  }

const joinGame = async () => {
  if (!joinCode.trim()) {
    alert("Please enter a game code")
    return
  }

  try {
    console.log("Attempting to join game with code:", joinCode)
    const savedState = await loadGameState(joinCode)
    
    // Add this debug line
    console.log("LoadGameState result:", savedState)

    if (savedState) {
      setGameState({
        ...savedState,
        currentView: "join",
      })
      console.log("Successfully joined game:", joinCode)
    } else {
      alert("Game not found! Please check the code and try again.")
      return
    }
  } catch (error) {
    console.error("Error joining game:", error)
    alert("Failed to join game. Please check the code and try again.")
  }
}
  const addTeam = async () => {
    if (!teamName.trim() || gameState.teams.includes(teamName)) return

    try {
      console.log("Adding team:", teamName, "to game:", gameState.gameCode)
      const updatedState = {
        ...gameState,
        teams: [...gameState.teams, teamName],
        scores: { ...gameState.scores, [teamName]: 0 },
        selectedTeam: teamName,
        currentView: "game" as const, // Immediately switch player to game view
      }

      console.log("Updated state with new team:", updatedState.teams)
      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
      console.log("Team saved to database")

      setTeamName("")
    } catch (error) {
      console.error("Error adding team:", error)
    }
  }

  const selectQuestion = async (category: string, value: number) => {
    const key = `${category}-${value}`
    const questionData = gameState.gameBoard[key]

    if (!questionData || questionData.used) return

    try {
      console.log("Selecting question:", key, "for game:", gameState.gameCode)
      const updatedState = {
        ...gameState,
        currentQuestion: {
          question: questionData.question,
          answer: questionData.answer,
          category: category,
          value: value,
          isDoubleJeopardy: questionData.isDoubleJeopardy
        },
        gameBoard: {
          ...gameState.gameBoard,
          [key]: { ...questionData, used: true },
        },
        questionPhase: "reading" as const,
        buzzedTeam: null,
        availableTeams: [...gameState.teams],
        buzzerEnabled: true,
      }

      console.log("Question selected, updating all devices")
      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
      console.log("Question state saved to database")
    } catch (error) {
      console.error("Error selecting question:", error)
    }
  }

  const buzzIn = async (teamName: string) => {
    if (!gameState.buzzerEnabled || gameState.buzzerQueue.includes(teamName) || gameState.currentAnsweringTeam) return

    try {
      const updatedState = {
        ...gameState,
        buzzerQueue: [...gameState.buzzerQueue, teamName],
        currentAnsweringTeam: gameState.buzzerQueue.length === 0 ? teamName : gameState.currentAnsweringTeam,
        questionPhase: gameState.buzzerQueue.length === 0 ? ("answering" as const) : gameState.questionPhase,
        buzzerEnabled: gameState.buzzerQueue.length === 0 ? false : gameState.buzzerEnabled,
      }

      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
    } catch (error) {
      console.error("Error buzzing in:", error)
    }
  }

  const markAnswerCorrect = async (teamName: string) => {
    if (!gameState.currentQuestion) return

    try {
      const updatedState = {
        ...gameState,
        scores: {
          ...gameState.scores,
          [teamName]: (gameState.scores[teamName] || 0) + gameState.currentQuestion.value,
        },
        currentQuestion: null,
        buzzerQueue: [],
        currentAnsweringTeam: null,
        buzzerEnabled: false,
        questionPhase: "complete" as const,
      }

      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
    } catch (error) {
      console.error("Error marking answer correct:", error)
    }
  }

  const markAnswerWrong = async (teamName: string) => {
    if (!gameState.currentQuestion) return

    try {
      const updatedState = {
        ...gameState,
        scores: {
          ...gameState.scores,
          [teamName]: (gameState.scores[teamName] || 0) - gameState.currentQuestion.value,
        },
        currentAnsweringTeam: null,
        buzzerEnabled: gameState.teams.length > gameState.buzzerQueue.length,
        questionPhase:
          gameState.teams.length > gameState.buzzerQueue.length ? ("waiting" as const) : ("complete" as const),
        currentQuestion: gameState.teams.length > gameState.buzzerQueue.length ? gameState.currentQuestion : null,
        buzzerQueue: gameState.teams.length > gameState.buzzerQueue.length ? gameState.buzzerQueue : [],
      }

      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
    } catch (error) {
      console.error("Error marking answer wrong:", error)
    }
  }

  const awardPoints = async (teamName: string, points: number) => {
    try {
      const updatedState = {
        ...gameState,
        scores: {
          ...gameState.scores,
          [teamName]: (gameState.scores[teamName] || 0) + points,
        },
        currentQuestion: null,
        buzzerQueue: [],
        currentAnsweringTeam: null,
        buzzerEnabled: false,
        questionPhase: "complete" as const,
      }

      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
    } catch (error) {
      console.error("Error awarding points:", error)
    }
  }

  // Fixed useEffect for real-time synchronization
  useEffect(() => {
    if (!gameState.gameCode) {
      console.log("No game code, skipping subscription setup")
      return
    }

    console.log("Setting up real-time subscription for game:", gameState.gameCode)

    const handleGameUpdate = (updatedState: GameState) => {
      console.log("Received real-time game update")
      
      setGameState((prevState) => {
        let newView = prevState.currentView
        
        // If player joined a game and their team is now in the teams list, switch to game view
        if (prevState.currentView === "join" && prevState.selectedTeam && 
            updatedState.teams.includes(prevState.selectedTeam)) {
          newView = "game"
          console.log("Player's team found in game, switching to game view")
        }
        
        // If host view, ensure it stays on host view
        if (prevState.currentView === "host") {
          newView = "host"
        }
        
        return {
          ...updatedState,
          currentView: newView,
          selectedTeam: prevState.selectedTeam, // Preserve selected team
        }
      })
    }

    const unsubscribe = subscribeToGameUpdates(gameState.gameCode, handleGameUpdate)

    return () => {
      console.log("Cleaning up subscription")
      unsubscribe()
    }
  }, [gameState.gameCode]) // Only depend on gameCode

  const handleAdminAccess = () => {
    if (adminPin === "2424") {
      setIsAdminAuthenticated(true)
      setShowPinPrompt(false)
      setGameState((prev) => ({ ...prev, currentView: "admin" }))
      setAdminPin("")
    } else {
      alert("Incorrect PIN")
      setAdminPin("")
    }
  }

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img src="/melanated-wellness-logo.png" alt="Melanated Wellness" className="mx-auto mb-6 h-24 w-auto" />
          <h1 className="text-3xl md:text-6xl font-bold text-amber-100 mb-4 font-serif">Black Jeopardy</h1>
          <p className="text-lg md:text-xl text-amber-200 mb-8">
            Test your knowledge of Black history, culture, and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-amber-100 border-amber-300 hover:bg-amber-50 transition-colors">
            <CardHeader className="text-center">
              <Users className="mx-auto h-12 w-12 text-amber-800 mb-2" />
              <CardTitle className="text-amber-900">Host Game</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-amber-700 mb-4">Start a new game session and manage questions</p>
              <Button
                onClick={startHostGame}
                className="w-full bg-white text-amber-800 hover:bg-amber-50 border border-amber-300"
              >
                Start Hosting
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-100 border-amber-300 hover:bg-amber-50 transition-colors">
            <CardHeader className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-amber-800 mb-2" />
              <CardTitle className="text-amber-900">Join Game</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-amber-700 mb-4">Enter a game code to join an existing session</p>
              <Button
                onClick={() => setGameState((prev) => ({ ...prev, currentView: "join" }))}
                className="w-full bg-white text-amber-800 hover:bg-amber-50 border border-amber-300"
              >
                Join Game
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-100 border-amber-300 hover:bg-amber-50 transition-colors">
            <CardHeader className="text-center">
              <Zap className="mx-auto h-12 w-12 text-amber-800 mb-2" />
              <CardTitle className="text-amber-900">Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-amber-700 mb-4">Manage questions and game settings</p>
              <Button
                onClick={() => setShowPinPrompt(true)}
                className="w-full bg-white text-amber-800 hover:bg-amber-50 border border-amber-300"
              >
                Manage Questions
              </Button>
            </CardContent>
          </Card>
        </div>

        {showPinPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-amber-100">
              <CardHeader>
                <CardTitle className="text-amber-900">Admin Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="bg-white border-amber-300"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAdminAccess} className="flex-1 bg-amber-800 text-white hover:bg-amber-700">
                    Access
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPinPrompt(false)
                      setAdminPin("")
                    }}
                    variant="outline"
                    className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )

  const HostView = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src="/melanated-wellness-logo.png" alt="Melanated Wellness" className="h-12 w-auto" />
            <h1 className="text-2xl md:text-4xl font-bold text-amber-100">Host Dashboard</h1>
          </div>
          <Button onClick={() => setGameState(initialGameState)} className="bg-amber-600 text-white hover:bg-amber-700">
            End Game
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-amber-100 border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900">Game Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-800 mb-2">{gameState.gameCode}</div>
                <div className="bg-white p-4 rounded border-2 border-amber-300">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "?join=" + gameState.gameCode)}`}
                    alt="QR Code"
                    className="mx-auto"
                  />
                  <p className="text-sm text-amber-700 mt-2">Scan to join game</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-100 border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900">Teams ({gameState.teams.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {gameState.teams.length === 0 ? (
                  <p className="text-amber-600 text-center">No teams joined yet</p>
                ) : (
                  gameState.teams.map((team) => (
                    <div
                      key={team}
                      className="flex justify-between items-center bg-white p-2 rounded border border-amber-200"
                    >
                      <span className="text-amber-800 font-medium">{team}</span>
                      <Badge variant="secondary" className="bg-amber-600 text-white">
                        {gameState.scores[team] || 0} pts
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-100 border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900">Buzzer Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameState.buzzerQueue.length === 0 ? (
                  <p className="text-amber-600 text-center">No buzzers pressed</p>
                ) : (
                  gameState.buzzerQueue.map((team, index) => (
                    <div key={team} className="flex items-center gap-2">
                      <Badge className="bg-amber-600 text-white">{index + 1}</Badge>
                      <span className="text-amber-800">{team}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {gameState.currentQuestion && (
          <Card className="mb-6 bg-white border-2 border-amber-400">
            <CardHeader className="bg-amber-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                Current Question
                {gameState.currentQuestion.isDoubleJeopardy && (
                  <Badge className="bg-red-600 text-white">⚡ DOUBLE JEOPARDY!</Badge>
                )}
                <Badge
                  className={`${
                    gameState.questionPhase === "waiting"
                      ? "bg-blue-600"
                      : gameState.questionPhase === "answering"
                        ? "bg-orange-600"
                        : gameState.questionPhase === "complete"
                          ? "bg-green-600"
                          : "bg-gray-600"
                  } text-white`}
                >
                  {gameState.questionPhase === "waiting"
                    ? "Waiting for Buzzers"
                    : gameState.questionPhase === "answering"
                      ? "Team Answering"
                      : gameState.questionPhase === "complete"
                        ? "Complete"
                        : "Reading"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white p-4 rounded border border-amber-200 mb-4">
                <p className="text-lg text-amber-900 font-medium">{gameState.currentQuestion.question}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded border border-amber-200 mb-4">
                <p className="text-amber-800">
                  <strong>Answer:</strong> {gameState.currentQuestion.answer}
                </p>
                <p className="text-amber-700">
                  <strong>Value:</strong> {gameState.currentQuestion.value} points
                </p>
              </div>

              {gameState.buzzerQueue.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-amber-900 mb-2">Buzzer Queue:</h4>
                  <div className="flex flex-wrap gap-2">
                    {gameState.buzzerQueue.map((team, index) => (
                      <Badge
                        key={team}
                        className={`${
                          team === gameState.currentAnsweringTeam ? "bg-orange-600" : "bg-amber-600"
                        } text-white`}
                      >
                        {index + 1}. {team} {team === gameState.currentAnsweringTeam ? "(Answering)" : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {gameState.currentAnsweringTeam && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-amber-900">{gameState.currentAnsweringTeam} is answering:</h4>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => markAnswerCorrect(gameState.currentAnsweringTeam!)}
                      className="bg-green-600 text-white hover:bg-green-700 text-lg px-8 py-3"
                    >
                      ✓ CORRECT (+{gameState.currentQuestion.value})
                    </Button>
                    <Button
                      onClick={() => markAnswerWrong(gameState.currentAnsweringTeam!)}
                      className="bg-red-600 text-white hover:bg-red-700 text-lg px-8 py-3"
                    >
                      ✗ WRONG (-{gameState.currentQuestion.value})
                    </Button>
                  </div>
                </div>
              )}

              {gameState.buzzerEnabled && !gameState.currentAnsweringTeam && (
                <div className="mb-4">
                  <p className="text-amber-700">
                    <strong>Waiting for teams to buzz in...</strong>
                  </p>
                </div>
              )}

              <Button
                onClick={async () => {
                  const updatedState = {
                    ...gameState,
                    currentQuestion: null,
                    buzzerQueue: [],
                    currentAnsweringTeam: null,
                    buzzerEnabled: false,
                    questionPhase: "waiting" as const,
                  }
                  setGameState(updatedState)
                  await saveGameState(gameState.gameCode, updatedState)
                }}
                className="mt-4 bg-amber-600 text-white hover:bg-amber-700"
              >
                Close Question
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-amber-100 border-amber-300">
          <CardHeader>
            <CardTitle className="text-amber-900">Game Board</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {["History", "Trivia", "Sports", "Film", "Music"].map((category) => (
                    <div key={category} className="bg-amber-600 text-white p-2 text-center font-bold text-sm rounded">
                      {category}
                    </div>
                  ))}
                </div>

                {[200, 400, 600, 800, 1000].map((value) => (
                  <div key={value} className="grid grid-cols-5 gap-1 mb-1">
                    {["history", "trivia", "sports", "film", "music"].map((category) => {
                      const key = `${category}-${value}`
                      const question = gameState.gameBoard[key]
                      const isUsed = question?.used || false

                      return (
                        <Button
                          key={key}
                          onClick={() => selectQuestion(category, value)}
                          disabled={isUsed}
                          className={`h-12 text-sm font-bold ${
                            isUsed
                              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                              : "bg-amber-600 text-white hover:bg-amber-700"
                          }`}
                        >
                          ${value}
                        </Button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const JoinView = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-amber-100 border-amber-300">
          <CardHeader className="text-center">
            <img src="/melanated-wellness-logo.png" alt="Melanated Wellness" className="mx-auto mb-4 h-16 w-auto" />
            <CardTitle className="text-amber-900">Join Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!gameState.gameCode ? (
              <>
                <Input
                  placeholder="Enter game code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-white border-amber-300 text-center text-lg font-bold"
                  maxLength={6}
                />
                <Button
                  onClick={joinGame}
                  className="w-full bg-amber-600 text-white hover:bg-amber-700"
                  disabled={!joinCode.trim()}
                >
                  Join Game
                </Button>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-amber-800">
                    Game Code: <strong>{gameState.gameCode}</strong>
                  </p>
                </div>

                {!gameState.teams.includes(teamName) && (
                  <>
                    <Input
                      placeholder="Enter your team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-white border-amber-300"
                    />
                    <Button
                      onClick={() => addTeam()}
                      className="w-full bg-amber-600 text-white hover:bg-amber-700"
                      disabled={!teamName.trim()}
                    >
                      Join as {teamName || "Team"}
                    </Button>
                  </>
                )}

                {gameState.teams.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-amber-900 mb-2">Teams in game:</h4>
                    <div className="space-y-1">
                      {gameState.teams.map((team) => (
                        <div
                          key={team}
                          className="flex justify-between items-center bg-white p-2 rounded border border-amber-200"
                        >
                          <span className="text-amber-800">{team}</span>
                          <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                            {gameState.scores[team] || 0} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              onClick={() => setGameState(initialGameState)}
              variant="outline"
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const PlayerGameView = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src="/melanated-wellness-logo.png" alt="Melanated Wellness" className="h-10 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold text-amber-100">Team: {gameState.selectedTeam}</h1>
          </div>
          <div className="text-amber-100 font-bold">Score: {gameState.scores[gameState.selectedTeam] || 0}</div>
        </div>

        {gameState.currentQuestion && (
          <Card className="mb-6 bg-white border-2 border-amber-400">
            <CardHeader className="bg-amber-100">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                Current Question
                {gameState.currentQuestion.isDoubleJeopardy && (
                  <Badge className="bg-red-600 text-white">⚡ DOUBLE JEOPARDY!</Badge>
                )}
                <Badge
                  className={`${
                    gameState.questionPhase === "waiting"
                      ? "bg-blue-600"
                      : gameState.questionPhase === "answering"
                        ? "bg-orange-600"
                        : gameState.questionPhase === "complete"
                          ? "bg-green-600"
                          : "bg-gray-600"
                  } text-white`}
                >
                  {gameState.questionPhase === "waiting"
                    ? "Waiting for Buzzers"
                    : gameState.questionPhase === "answering"
                      ? "Team Answering"
                      : gameState.questionPhase === "complete"
                        ? "Complete"
                        : "Reading"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white p-4 rounded border border-amber-200 mb-6">
                <p className="text-lg text-amber-900 font-medium text-center">{gameState.currentQuestion.question}</p>
                <p className="text-center text-amber-700 mt-2">
                  <strong>Value:</strong> {gameState.currentQuestion.value} points
                </p>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => buzzIn(gameState.selectedTeam)}
                  disabled={
                    !gameState.buzzerEnabled ||
                    gameState.buzzerQueue.includes(gameState.selectedTeam) ||
                    gameState.currentAnsweringTeam === gameState.selectedTeam
                  }
                  className={`text-xl py-6 px-12 rounded-full font-bold ${
                    gameState.currentAnsweringTeam === gameState.selectedTeam
                      ? "bg-orange-600 text-white"
                      : gameState.buzzerQueue.includes(gameState.selectedTeam)
                        ? "bg-gray-600 text-white cursor-not-allowed"
                        : !gameState.buzzerEnabled
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {gameState.currentAnsweringTeam === gameState.selectedTeam
                    ? "YOU'RE ANSWERING!"
                    : gameState.buzzerQueue.includes(gameState.selectedTeam)
                      ? "BUZZED IN!"
                      : !gameState.buzzerEnabled
                        ? "BUZZER DISABLED"
                        : "BUZZ IN!"}
                </Button>

                {gameState.buzzerQueue.length > 0 && (
                  <div className="mt-4">
                    <p className="text-amber-100 mb-2">Buzzer Order:</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {gameState.buzzerQueue.map((team, index) => (
                        <Badge
                          key={team}
                          className={`${
                            team === gameState.currentAnsweringTeam
                              ? "bg-orange-600"
                              : team === gameState.selectedTeam
                                ? "bg-red-600"
                                : "bg-amber-600"
                          } text-white`}
                        >
                          {index + 1}. {team}
                          {team === gameState.currentAnsweringTeam ? " (Answering)" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {gameState.questionPhase === "waiting" && !gameState.buzzerEnabled && (
                  <p className="text-amber-200 mt-4">Waiting for next question...</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-amber-100 border-amber-300">
          <CardHeader>
            <CardTitle className="text-amber-900">Scoreboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gameState.teams.map((team) => (
                <div
                  key={team}
                  className={`flex justify-between items-center p-3 rounded border-2 ${
                    team === gameState.selectedTeam ? "bg-amber-200 border-amber-400" : "bg-white border-amber-200"
                  }`}
                >
                  <span className="text-amber-800 font-medium">{team}</span>
                  <Badge variant="secondary" className="bg-amber-600 text-white">
                    {gameState.scores[team] || 0} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-100 border-amber-300">
          <CardHeader>
            <CardTitle className="text-amber-900">Game Board</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {["History", "Trivia", "Sports", "Film", "Music"].map((category) => (
                    <div key={category} className="bg-amber-600 text-white p-2 text-center font-bold text-xs rounded">
                      {category}
                    </div>
                  ))}
                </div>

                {[200, 400, 600, 800, 1000].map((value) => (
                  <div key={value} className="grid grid-cols-5 gap-1 mb-1">
                    {["history", "trivia", "sports", "film", "music"].map((category) => {
                      const key = `${category}-${value}`
                      const question = gameState.gameBoard[key]
                      const isUsed = question?.used || false

                      return (
                        <div
                          key={key}
                          className={`h-10 flex items-center justify-center text-xs font-bold rounded ${
                            isUsed ? "bg-gray-400 text-gray-600" : "bg-blue-600 text-white"
                          }`}
                        >
                          ${value}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={() => setGameState(initialGameState)}
            variant="outline"
            className="border-amber-300 text-amber-100 hover:bg-amber-800"
          >
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  )

  const AdminView = () => {
    const [newQuestion, setNewQuestion] = useState("")
    const [newAnswer, setNewAnswer] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("history")
    const [selectedPoints, setSelectedPoints] = useState(200)
    const [activeTab, setActiveTab] = useState("regular")

    const addQuestion = async () => {
      if (newQuestion.trim() && newAnswer.trim()) {
        const updatedBoard = {
          ...gameState.gameBoard,
          [`new-${selectedCategory}-${selectedPoints}`]: {
            question: newQuestion,
            answer: newAnswer,
            used: false,
            isDoubleJeopardy: activeTab === "double",
          },
        }

        const updatedState = {
          ...gameState,
          gameBoard: updatedBoard,
        }

        setGameState(updatedState)
        await saveGameState(gameState.gameCode, updatedState)

        alert(
          `${activeTab === "regular" ? "Regular" : "Double Jeopardy"} question added:\n\nCategory: ${selectedCategory}\nPoints: ${selectedPoints}\nQuestion: ${newQuestion}\nAnswer: ${newAnswer}`,
        )
        setNewQuestion("")
        setNewAnswer("")
      } else {
        alert("Please fill in both question and answer")
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <img src="/melanated-wellness-logo.png" alt="Melanated Wellness" className="h-12 w-auto" />
              <h1 className="text-2xl md:text-4xl font-bold text-amber-100">Admin Panel</h1>
            </div>
            <Button
              onClick={() => {
                setIsAdminAuthenticated(false)
                setGameState((prev) => ({ ...prev, currentView: "home" }))
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Logout
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setActiveTab("regular")}
                className={`${activeTab === "regular" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}
              >
                Regular Questions
              </Button>
              <Button
                onClick={() => setActiveTab("double")}
                className={`${activeTab === "double" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}
              >
                Double Jeopardy
              </Button>
            </div>

            <Card className="bg-amber-100 border-amber-300">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  {activeTab === "regular" ? "Add Regular Question" : "Add Double Jeopardy Question"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-800 font-medium mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-amber-300 rounded bg-white text-amber-800"
                    >
                      <option value="history">History</option>
                      <option value="trivia">Trivia</option>
                      <option value="sports">Sports</option>
                      <option value="film">Film</option>
                      <option value="music">Music</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-amber-800 font-medium mb-2">Points</label>
                    <select
                      value={selectedPoints}
                      onChange={(e) => setSelectedPoints(Number(e.target.value))}
                      className="w-full p-2 border border-amber-300 rounded bg-white text-amber-800"
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
                  <label className="block text-amber-800 font-medium mb-2">Question</label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter the question..."
                    className="w-full p-3 border border-amber-300 rounded bg-white text-amber-800 h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-amber-800 font-medium mb-2">Answer</label>
                  <Input
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="What is...? or Who is...?"
                    className="bg-white border-amber-300 text-amber-800"
                  />
                </div>

                <Button
                  onClick={addQuestion}
                  className="w-full bg-amber-600 text-white hover:bg-amber-700"
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                >
                  Add {activeTab === "regular" ? "Regular" : "Double Jeopardy"} Question
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              onClick={() => setGameState((prev) => ({ ...prev, currentView: "home" }))}
              variant="outline"
              className="border-amber-300 text-amber-100 hover:bg-amber-800"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState.currentView === "host") return <HostView />
  if (gameState.currentView === "join") return <JoinView />
  if (gameState.currentView === "game") return <PlayerGameView />
  if (gameState.currentView === "admin") return <AdminView />

  return <HomePage />
}
