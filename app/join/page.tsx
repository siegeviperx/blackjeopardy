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
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setIsClient(true)
  }, [])

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
          const key = `${category}-${value}`
          board[key] = {
            question: `Sample question for ${category} ${value}`,
            answer: `Sample answer for ${category} ${value}`,
            used: false,
          }
        }
      })
    })

    return board
  }

  const addDoubleJeopardyQuestions = (board: any) => {
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
      console.log(`Added ${numDoubleJeopardy} Double Jeopardy questions`)
    }
    return board
  }

  const startHostGame = async () => {
    try {
      console.log("Starting host game...")
      const code = generateSimpleGameCode()
      let board = initializeGameBoard()
      
      // Add Double Jeopardy questions only on client side
      board = addDoubleJeopardyQuestions(board)

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
        currentView: "game" as const,
      }

      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
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
        buzzerEnabled: true,
      }

      setGameState(updatedState)
      await saveGameState(gameState.gameCode, updatedState)
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

  useEffect(() => {
    if (!gameState.gameCode) return

    const handleGameUpdate = (updatedState: GameState) => {
      setGameState((prevState) => {
        let newView = prevState.currentView
        
        if (prevState.currentView === "join" && prevState.selectedTeam && 
            updatedState.teams.includes(prevState.selectedTeam)) {
          newView = "game"
        }
        
        if (prevState.currentView === "host") {
          newView = "host"
        }
        
        return {
          ...updatedState,
          currentView: newView,
          selectedTeam: prevState.selectedTeam,
        }
      })
    }

    const unsubscribe = subscribeToGameUpdates(gameState.gameCode, handleGameUpdate)
    return unsubscribe
  }, [gameState.gameCode])

  // Show loading until client renders to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 flex items-center justify-center">
        <div className="text-amber-100 text-xl">Loading...</div>
      </div>
    )
  }

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

  // Simplified views - you can expand these as needed
  const HostView = () => <div>Host View - Implement your host interface here</div>
  const JoinView = () => <div>Join View - Implement your join interface here</div>  
  const PlayerGameView = () => <div>Player View - Implement your player interface here</div>
  const AdminView = () => <div>Admin View - Implement your admin interface here</div>

  if (gameState.currentView === "host") return <HostView />
  if (gameState.currentView === "join") return <JoinView />
  if (gameState.currentView === "game") return <PlayerGameView />
  if (gameState.currentView === "admin") return <AdminView />

  return <HomePage />
}
