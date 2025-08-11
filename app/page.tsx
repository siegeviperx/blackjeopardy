"use client"

import { useState } from "react"

// Simple questions data
const questions = {
  history: {
    200: {
      question: "This activist refused to give up her bus seat in Montgomery, Alabama in 1955.",
      answer: "Who is Rosa Parks?",
    },
    400: {
      question: "This Harlem neighborhood became the center of African American culture during the 1920s renaissance.",
      answer: "What is Harlem?",
    },
    600: {
      question: "This president issued the Emancipation Proclamation in 1863.",
      answer: "Who is Abraham Lincoln?",
    },
    800: {
      question: "This organization was founded by W.E.B. Du Bois and others in 1909 to advance civil rights.",
      answer: "What is the NAACP?",
    },
    1000: {
      question: "This Supreme Court case in 1954 declared school segregation unconstitutional.",
      answer: "What is Brown v. Board of Education?",
    },
  },
  trivia: {
    200: {
      question: "This HBCU is known as 'The Mecca' and is located in Washington, D.C.",
      answer: "What is Howard University?",
    },
    400: {
      question: "This month celebrates Black History in the United States.",
      answer: "What is February?",
    },
    600: {
      question: "This traditionally Black Greek letter organization was the first to be founded, established in 1906.",
      answer: "What is Alpha Phi Alpha?",
    },
    800: {
      question:
        "This cooking method involves slowly cooking meat at low temperatures, often associated with Southern cuisine.",
      answer: "What is barbecue (or BBQ)?",
    },
    1000: {
      question:
        "This Tuskegee Institute founder emphasized vocational training and was known for the Atlanta Compromise speech.",
      answer: "Who is Booker T. Washington?",
    },
  },
  sports: {
    200: {
      question: "This basketball legend wore #23 for the Chicago Bulls and won 6 NBA championships.",
      answer: "Who is Michael Jordan?",
    },
    400: {
      question: "This tennis champion has won 23 Grand Slam singles titles, the most in the Open Era.",
      answer: "Who is Serena Williams?",
    },
    600: {
      question: "This boxer was known as 'The Greatest' and 'The Louisville Lip.'",
      answer: "Who is Muhammad Ali?",
    },
    800: {
      question: "This track and field athlete won four gold medals at the 1936 Berlin Olympics.",
      answer: "Who is Jesse Owens?",
    },
    1000: {
      question: "This baseball player broke the color barrier in Major League Baseball in 1947.",
      answer: "Who is Jackie Robinson?",
    },
  },
  film: {
    200: {
      question: "This 2018 Marvel superhero film was set in the fictional nation of Wakanda.",
      answer: "What is Black Panther?",
    },
    400: {
      question: "This comedian starred in 'Coming to America' and voices Donkey in the Shrek movies.",
      answer: "Who is Eddie Murphy?",
    },
    600: {
      question: "This Oprah Winfrey-produced film won the Academy Award for Best Picture in 2014.",
      answer: "What is 12 Years a Slave?",
    },
    800: {
      question: "This director created the films 'Do the Right Thing,' 'Malcolm X,' and 'BlacKkKlansman.'",
      answer: "Who is Spike Lee?",
    },
    1000: {
      question: "This 1991 film starring Angela Bassett tells the story of Tina Turner's life.",
      answer: "What is What's Love Got to Do with It?",
    },
  },
  music: {
    200: {
      question: "This 'Queen of Soul' was known for hits like 'Respect' and 'Natural Woman.'",
      answer: "Who is Aretha Franklin?",
    },
    400: {
      question: "This music genre originated in New Orleans and features improvisation and syncopated rhythms.",
      answer: "What is jazz?",
    },
    600: {
      question: "This record label founded by Berry Gordy Jr. was known as 'Hitsville U.S.A.'",
      answer: "What is Motown?",
    },
    800: {
      question: "This rapper's album 'The Miseducation of Lauryn Hill' won 5 Grammy Awards in 1999.",
      answer: "Who is Lauryn Hill?",
    },
    1000: {
      question: "This musician is known as the 'Godfather of Soul' and had hits like 'I Got You (I Feel Good).'",
      answer: "Who is James Brown?",
    },
  },
}

// Add this after the regular questions object
const doubleJeopardyQuestions = [
  {
    id: "dj1",
    category: "History",
    value: 400,
    question: "This civil rights leader advocated for nonviolent resistance and led the Montgomery Bus Boycott.",
    answer: "Who is Martin Luther King Jr.?",
  },
  {
    id: "dj2",
    category: "Music",
    value: 800,
    question: "This singer, songwriter, and pianist is known for hits like 'Superstition' and 'Isn't She Lovely'.",
    answer: "Who is Stevie Wonder?",
  },
  {
    id: "dj3",
    category: "Film",
    value: 600,
    question: "This actor won an Academy Award for his portrayal of Ray Charles in the film 'Ray'.",
    answer: "Who is Jamie Foxx?",
  },
  {
    id: "dj4",
    category: "Sports",
    value: 1000,
    question:
      "This tennis player is considered one of the greatest of all time and has won multiple Grand Slam titles.",
    answer: "Who is Arthur Ashe?",
  },
  {
    id: "dj5",
    category: "Trivia",
    value: 200,
    question: "This African American inventor is best known for his numerous improvements to the light bulb.",
    answer: "Who is Lewis Latimer?",
  },
  {
    id: "dj6",
    category: "History",
    value: 600,
    question: "She was a leader in the Civil Rights Movement, known for saying 'I question America'.",
    answer: "Who is Fannie Lou Hamer?",
  },
  {
    id: "dj7",
    category: "Music",
    value: 400,
    question: "This singer is known as the 'High Priestess of Soul'.",
    answer: "Who is Nina Simone?",
  },
  {
    id: "dj8",
    category: "Film",
    value: 1000,
    question: "This director is known for films like 'Boyz n the Hood' and 'Poetic Justice'.",
    answer: "Who is John Singleton?",
  },
  {
    id: "dj9",
    category: "Sports",
    value: 800,
    question:
      "This gymnast is the most decorated American gymnast and is known for her incredible skills and achievements.",
    answer: "Who is Simone Biles?",
  },
  {
    id: "dj10",
    category: "Trivia",
    value: 600,
    question: "This holiday celebrates the end of slavery in the United States.",
    answer: "What is Juneteenth?",
  },
]

// Generate random Double Jeopardy positions (3-5 tiles per game)
function generateDoubleJeopardyPositions(): Set<string> {
  const categories = Object.keys(questions)
  const values = [200, 400, 600, 800, 1000]
  const allPositions = categories.flatMap((cat) => values.map((val) => `${cat}-${val}`))

  // Randomly select 3-5 positions for Double Jeopardy
  const numDoubleJeopardy = Math.floor(Math.random() * 3) + 3 // 3-5 tiles
  const doubleJeopardyPositions = new Set<string>()

  while (doubleJeopardyPositions.size < numDoubleJeopardy) {
    const randomIndex = Math.floor(Math.random() * allPositions.length)
    doubleJeopardyPositions.add(allPositions[randomIndex])
  }

  return doubleJeopardyPositions
}

// Get a random unused Double Jeopardy question
function getRandomDoubleJeopardyQuestion(usedQuestionIds: Set<string>) {
  const availableQuestions = doubleJeopardyQuestions.filter((q) => !usedQuestionIds.has(q.id))

  if (availableQuestions.length === 0) {
    // Fallback to any question if all are used
    return doubleJeopardyQuestions[Math.floor(Math.random() * doubleJeopardyQuestions.length)]
  }

  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
}

// Simple QR Code generator function
function generateQRCode(text: string, size = 128) {
  // Create a simple QR code using a free API service
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
  return qrUrl
}

interface Team {
  id: string
  name: string
  score: number
  buzzedIn: boolean
}

interface GameState {
  currentView: "home" | "host" | "join" | "admin"
  gameId: string
  currentQuestion: any
  usedQuestions: Set<string>
  teams: Team[]
  buzzerOpen: boolean
  doubleJeopardyPositions: Set<string>
  usedDoubleJeopardyQuestions: Set<string>
  playerInfo: {
    gameId: string
    teamName: string
    score: number
    buzzedIn: boolean
  } | null
}

// Home Page Component
function HomePage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)",
        color: "#fef3c7",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="/melanated-wellness-logo-horizontal.jpg"
              alt="Melanated Wellness LLC"
              className="h-12 sm:h-16 md:h-20 object-contain"
              style={{ filter: "brightness(1.2)" }}
            />
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4"
            style={{ color: "#fffbeb", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            BLACK JEOPARDY!
          </h1>
          <p className="text-lg sm:text-xl" style={{ color: "#fde68a" }}>
            An interactive trivia experience
          </p>
          <p className="text-xs sm:text-sm mt-2" style={{ color: "#fed7aa" }}>
            Hosted by Melanated Wellness
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          <div
            className="rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all cursor-pointer"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.9)",
              border: "2px solid #fde68a",
            }}
            onClick={() => onNavigate("host")}
          >
            <div className="mb-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "rgba(146, 64, 14, 0.2)",
                }}
              >
                <span className="text-2xl">👥</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#92400e" }}>
                Host Game
              </h2>
              <p style={{ color: "#a16207" }}>Control the game, manage teams, and track scores</p>
            </div>
            <button
              className="w-full font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg shadow-md transition-colors"
              style={{
                backgroundColor: "#92400e",
                color: "#fffbeb",
              }}
            >
              Start as Host
            </button>
          </div>

          <div
            className="rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all cursor-pointer"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.9)",
              border: "2px solid #fde68a",
            }}
            onClick={() => onNavigate("join")}
          >
            <div className="mb-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "rgba(146, 64, 14, 0.2)",
                }}
              >
                <span className="text-2xl">🎮</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#92400e" }}>
                Join Game
              </h2>
              <p style={{ color: "#a16207" }}>Enter game code to play</p>
            </div>
            <button
              className="w-full font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg shadow-md transition-colors"
              style={{
                backgroundColor: "#a16207",
                color: "#fffbeb",
              }}
            >
              Join as Player
            </button>
          </div>

          <div
            className="rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all cursor-pointer"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.9)",
              border: "2px solid #fde68a",
            }}
            onClick={() => onNavigate("admin")}
          >
            <div className="mb-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "rgba(146, 64, 14, 0.2)",
                }}
              >
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#92400e" }}>
                Admin Panel
              </h2>
              <p style={{ color: "#a16207" }}>Edit and manage game questions</p>
            </div>
            <button
              className="w-full font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg shadow-md transition-colors"
              style={{
                backgroundColor: "#b45309",
                color: "#fffbeb",
              }}
            >
              Manage Questions
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div
            className="inline-flex items-center gap-2 text-lg px-6 py-3 rounded-full shadow-md"
            style={{
              backgroundColor: "rgba(146, 64, 14, 0.6)",
              color: "#fef3c7",
            }}
          >
            <span className="text-xl">📱</span>
            <span>Enter game code to join instantly!</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Host Page Component
function HostPage({
  gameState,
  updateGameState,
  onNavigate,
}: {
  gameState: GameState
  updateGameState: (updates: Partial<GameState>) => void
  onNavigate: (view: string) => void
}) {
  const categories = Object.keys(questions)
  const values = [200, 400, 600, 800, 1000]

  const selectQuestion = (category: string, value: number) => {
    const questionKey = `${category}-${value}`
    if (gameState.usedQuestions.has(questionKey)) return

    // Check if this is a Double Jeopardy position
    const isDoubleJeopardy = gameState.doubleJeopardyPositions.has(questionKey)

    let questionData
    if (isDoubleJeopardy) {
      // Get a random Double Jeopardy question
      const djQuestion = getRandomDoubleJeopardyQuestion(gameState.usedDoubleJeopardyQuestions)
      questionData = {
        ...djQuestion,
        isDoubleJeopardy: true,
        originalValue: value,
        value: value * 2, // Double the points!
      }
      // Mark this DJ question as used
      updateGameState({
        usedDoubleJeopardyQuestions: new Set([...gameState.usedDoubleJeopardyQuestions, djQuestion.id]),
      })
    } else {
      // Regular question
      questionData = questions[category as keyof typeof questions][value as keyof any]
    }

    updateGameState({
      currentQuestion: { category, value, ...questionData },
      buzzerOpen: true,
      teams: gameState.teams.map((team) => ({ ...team, buzzedIn: false })),
    })
  }

  const closeQuestion = (correct: boolean, teamId?: string) => {
    if (gameState.currentQuestion) {
      const questionKey = `${gameState.currentQuestion.category}-${gameState.currentQuestion.originalValue || gameState.currentQuestion.value}`
      const newUsedQuestions = new Set([...gameState.usedQuestions, questionKey])

      let updatedTeams = gameState.teams
      if (teamId) {
        updatedTeams = gameState.teams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              score: correct
                ? team.score + gameState.currentQuestion.value
                : team.score - gameState.currentQuestion.value,
              buzzedIn: false,
            }
          }
          return { ...team, buzzedIn: false }
        })
      }

      updateGameState({
        currentQuestion: null,
        buzzerOpen: false,
        usedQuestions: newUsedQuestions,
        teams: updatedTeams,
      })
    }
  }

  const simulateBuzz = (teamId: string) => {
    if (!gameState.buzzerOpen) return
    updateGameState({
      teams: gameState.teams.map((team) => ({
        ...team,
        buzzedIn: team.id === teamId,
      })),
    })
  }

  const resetGame = () => {
    if (confirm("Reset the entire game? This will clear all progress.")) {
      updateGameState({
        currentQuestion: null,
        usedQuestions: new Set(),
        teams: [
          { id: "1", name: "Team Alpha", score: 0, buzzedIn: false },
          { id: "2", name: "Team Beta", score: 0, buzzedIn: false },
        ],
        buzzerOpen: false,
        doubleJeopardyPositions: generateDoubleJeopardyPositions(), // Regenerate positions
        usedDoubleJeopardyQuestions: new Set(), // Reset used DJ questions
      })
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
            <div className="flex items-center gap-4 mb-2">
              <img
                src="/melanated-wellness-logo-vertical.png"
                alt="Melanated Wellness LLC"
                className="h-12 object-contain"
                style={{ filter: "brightness(1.2)" }}
              />
              <div>
                <h1 className="text-4xl font-bold" style={{ color: "#fffbeb" }}>
                  HOST DASHBOARD
                </h1>
                <p className="text-sm" style={{ color: "#fde68a" }}>
                  Black Jeopardy Game Control
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("home")}
              className="mt-2 px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: "rgba(254, 243, 199, 0.2)",
                color: "#fde68a",
                border: "1px solid #fde68a",
              }}
            >
              ← Back to Home
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: "#fde68a" }}>
              Game Code
            </p>
            <p className="text-2xl font-bold" style={{ color: "#fffbeb" }}>
              {gameState.gameId}
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
              <h2 className="text-center text-xl sm:text-2xl font-bold mb-4" style={{ color: "#92400e" }}>
                BLACK JEOPARDY!
              </h2>

              <div className="overflow-x-auto">
                <div className="w-full">
                  {/* Category Headers */}
                  <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-2">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="p-1 sm:p-2 md:p-3 text-center font-bold uppercase text-xs sm:text-sm shadow-md rounded"
                        style={{ backgroundColor: "#92400e", color: "#fffbeb" }}
                      >
                        <span className="block sm:hidden">{category.slice(0, 4)}</span>
                        <span className="hidden sm:block">{category}</span>
                      </div>
                    ))}
                  </div>

                  {/* Question Grid - NO VISUAL INDICATORS FOR DOUBLE JEOPARDY */}
                  {values.map((value) => (
                    <div key={value} className="grid grid-cols-5 gap-1 sm:gap-2 mb-1 sm:mb-2">
                      {categories.map((category) => {
                        const questionKey = `${category}-${value}`
                        const isUsed = gameState.usedQuestions.has(questionKey)

                        return (
                          <button
                            key={`${category}-${value}`}
                            onClick={() => selectQuestion(category, value)}
                            disabled={isUsed}
                            className="p-1 sm:p-2 md:p-4 text-xs sm:text-sm md:text-xl font-bold border-2 transition-all shadow-md rounded min-h-[40px] sm:min-h-[50px] md:min-h-[60px]"
                            style={{
                              backgroundColor: isUsed ? "#fde68a" : "#fffbeb",
                              color: isUsed ? "#a16207" : "#92400e",
                              borderColor: "#fde68a",
                              opacity: isUsed ? 0.5 : 1,
                              cursor: isUsed ? "not-allowed" : "pointer",
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
            {gameState.currentQuestion && (
              <div
                className="rounded-lg p-6 shadow-lg"
                style={{
                  backgroundColor: "rgba(254, 243, 199, 0.95)",
                  border: "2px solid #fde68a",
                }}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#92400e" }}>
                  {gameState.currentQuestion.isDoubleJeopardy && (
                    <span
                      className="px-2 py-1 rounded text-sm"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#fff",
                      }}
                    >
                      ⚡ DOUBLE JEOPARDY!
                    </span>
                  )}
                  {gameState.currentQuestion.category.toUpperCase()} - ${gameState.currentQuestion.value}
                  {gameState.currentQuestion.isDoubleJeopardy && (
                    <span className="text-sm" style={{ color: "#dc2626" }}>
                      (Double Points!)
                    </span>
                  )}
                </h3>

                <p className="text-lg mb-4" style={{ color: "#92400e" }}>
                  {gameState.currentQuestion.question}
                </p>
                <p className="font-bold mb-4" style={{ color: "#a16207" }}>
                  Answer: {gameState.currentQuestion.answer}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {gameState.teams
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
                          ✓ Correct (+${gameState.currentQuestion.value})
                        </button>
                        <button
                          onClick={() => closeQuestion(false, team.id)}
                          className="font-bold px-3 py-1 rounded"
                          style={{ backgroundColor: "#dc2626", color: "#fff" }}
                        >
                          ✗ Incorrect (-${gameState.currentQuestion.value})
                        </button>
                      </div>
                    ))}

                  {gameState.teams.filter((team) => team.buzzedIn).length === 0 && (
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
              <div className="flex items-center justify-center gap-2 mb-4">
                <img
                  src="/melanated-wellness-logo-vertical.png"
                  alt="Melanated Wellness LLC"
                  className="h-8 object-contain"
                />
                <h3 className="font-bold" style={{ color: "#92400e" }}>
                  Join Game
                </h3>
              </div>
              <div className="p-4 rounded-lg mb-4 text-center shadow-md" style={{ backgroundColor: "#fffbeb" }}>
                <img
                  src={generateQRCode(`${window.location.origin || "/placeholder.svg"}?game=${gameState.gameId}`)}
                  alt={`QR Code for game ${gameState.gameId}`}
                  className="w-32 h-32 mx-auto rounded"
                  style={{
                    border: "2px solid #fde68a",
                  }}
                  onError={(e) => {
                    // Fallback if QR code fails to load
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling.style.display = "block"
                  }}
                />
                <div
                  className="w-32 h-32 mx-auto flex items-center justify-center font-bold text-sm rounded hidden"
                  style={{
                    backgroundColor: "#fde68a",
                    color: "#a16207",
                  }}
                >
                  QR CODE
                  <br />
                  {gameState.gameId}
                </div>
              </div>
              <p className="text-sm text-center break-all" style={{ color: "#a16207" }}>
                Game Code: {gameState.gameId}
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
                👥 Teams ({gameState.teams.length})
              </h3>

              <div className="space-y-3">
                {gameState.teams.map((team) => (
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
                {gameState.teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => simulateBuzz(team.id)}
                    disabled={!gameState.buzzerOpen}
                    className="w-full px-3 py-2 rounded text-sm font-medium"
                    style={{
                      backgroundColor: gameState.buzzerOpen ? "#eab308" : "#9ca3af",
                      color: gameState.buzzerOpen ? "#fff" : "#6b7280",
                      cursor: gameState.buzzerOpen ? "pointer" : "not-allowed",
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

// Join Page Component
function JoinPage({
  gameState,
  updateGameState,
  onNavigate,
}: {
  gameState: GameState
  updateGameState: (updates: Partial<GameState>) => void
  onNavigate: (view: string) => void
}) {
  const [gameId, setGameId] = useState("")
  const [teamName, setTeamName] = useState("")
  const [joined, setJoined] = useState(!!gameState.playerInfo)

  const joinGame = () => {
    if (!gameId || !teamName) return

    const newPlayerInfo = {
      gameId,
      teamName,
      score: 0,
      buzzedIn: false,
    }

    updateGameState({ playerInfo: newPlayerInfo })
    setJoined(true)
  }

  const leaveGame = () => {
    if (confirm("Are you sure you want to leave the game?")) {
      updateGameState({ playerInfo: null })
      setJoined(false)
      setGameId("")
      setTeamName("")
    }
  }

  const buzzIn = () => {
    if (!gameState.playerInfo) return

    // Add haptic feedback for mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100)
    }

    updateGameState({
      playerInfo: { ...gameState.playerInfo, buzzedIn: true },
    })
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
            <div className="flex justify-center mb-4">
              <img
                src="/melanated-wellness-logo-vertical.png"
                alt="Melanated Wellness LLC"
                className="h-12 object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#92400e" }}>
              Join Black Jeopardy!
            </h1>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#a16207" }}>
              Hosted by Melanated Wellness
            </p>
            <button
              onClick={() => onNavigate("home")}
              className="mt-2 px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: "rgba(146, 64, 14, 0.2)",
                color: "#a16207",
                border: "1px solid #a16207",
              }}
            >
              ← Back to Home
            </button>
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
            <button
              onClick={() => onNavigate("home")}
              className="px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: "rgba(254, 243, 199, 0.2)",
                color: "#fde68a",
                border: "1px solid #fde68a",
              }}
            >
              ← Home
            </button>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <img
                  src="/melanated-wellness-logo-vertical.png"
                  alt="Melanated Wellness LLC"
                  className="h-10 object-contain"
                  style={{ filter: "brightness(1.2)" }}
                />
              </div>
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
              Game: {gameState.playerInfo?.gameId}
            </span>
            <span
              className="px-3 py-1 rounded"
              style={{
                border: "1px solid #eab308",
                backgroundColor: "rgba(161, 98, 7, 0.5)",
              }}
            >
              Team: {gameState.playerInfo?.teamName}
            </span>
            <span
              className="px-3 py-1 rounded"
              style={{
                border: "1px solid #16a34a",
                backgroundColor: "rgba(22, 163, 74, 0.5)",
              }}
            >
              Score: ${gameState.playerInfo?.score || 0}
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
          <h2 className="text-center text-lg sm:text-xl font-bold mb-4" style={{ color: "#92400e" }}>
            GAME BOARD
          </h2>

          <div className="overflow-x-auto">
            <div className="w-full">
              {/* Category Headers */}
              <div className="grid grid-cols-5 gap-1 mb-2">
                {Object.keys(questions).map((category) => (
                  <div
                    key={category}
                    className="p-1 sm:p-2 text-center font-bold uppercase text-xs"
                    style={{ backgroundColor: "#92400e", color: "#fffbeb" }}
                  >
                    <span className="block sm:hidden">{category.slice(0, 4)}</span>
                    <span className="hidden sm:block">{category}</span>
                  </div>
                ))}
              </div>

              {/* Question Grid */}
              {[200, 400, 600, 800, 1000].map((value) => (
                <div key={value} className="grid grid-cols-5 gap-1 mb-1">
                  {Object.keys(questions).map((category) => (
                    <div
                      key={`${category}-${value}`}
                      className="p-1 sm:p-2 md:p-3 text-xs sm:text-sm md:text-lg font-bold text-center border min-h-[35px] sm:min-h-[45px]"
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
              backgroundColor: gameState.playerInfo?.buzzedIn ? "#9ca3af" : "#eab308",
              color: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">🔔</span>
              <span>BUZZ</span>
            </div>
          </button>

          <p className="mt-4" style={{ color: "#a16207" }}>
            {gameState.playerInfo?.buzzedIn
              ? "You buzzed in! Wait for host."
              : "Tap the buzzer when you know the answer!"}
          </p>

          {gameState.playerInfo?.buzzedIn && (
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
        </div>
      </div>
    </div>
  )
}

// Admin Page Component
function AdminPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [editingQuestion, setEditingQuestion] = useState<{
    category: string
    value: number
    question: string
    answer: string
    type: "regular" | "doubleJeopardy"
    id?: string
  } | null>(null)

  const [addingQuestion, setAddingQuestion] = useState<{
    type: "regular" | "doubleJeopardy"
    category: string
    value: number
    question: string
    answer: string
  } | null>(null)

  const [activeTab, setActiveTab] = useState<"regular" | "doubleJeopardy">("regular")

  const categories = Object.keys(questions)
  const values = [200, 400, 600, 800, 1000]

  const startEditing = (
    category: string,
    value: number,
    type: "regular" | "doubleJeopardy" = "regular",
    id?: string,
  ) => {
    if (type === "regular") {
      const questionData = questions[category as keyof typeof questions][value as keyof any]
      setEditingQuestion({
        category,
        value,
        question: questionData.question,
        answer: questionData.answer,
        type: "regular",
      })
    } else {
      const questionData = doubleJeopardyQuestions.find((q) => q.id === id)
      if (questionData) {
        setEditingQuestion({
          category: questionData.category,
          value: questionData.value,
          question: questionData.question,
          answer: questionData.answer,
          type: "doubleJeopardy",
          id: questionData.id,
        })
      }
    }
  }

  const startAdding = (type: "regular" | "doubleJeopardy") => {
    setAddingQuestion({
      type,
      category: categories[0],
      value: 200,
      question: "",
      answer: "",
    })
  }

  const saveQuestion = () => {
    if (!editingQuestion) return

    alert(`Question saved! In a real app, this would update the database.
    
Type: ${editingQuestion.type === "regular" ? "Regular" : "Double Jeopardy"}
Category: ${editingQuestion.category}
Value: $${editingQuestion.value}
Question: ${editingQuestion.question}
Answer: ${editingQuestion.answer}`)

    setEditingQuestion(null)
  }

  const saveNewQuestion = () => {
    if (!addingQuestion) return

    alert(`New question added! In a real app, this would be saved to the database.
    
Type: ${addingQuestion.type === "regular" ? "Regular" : "Double Jeopardy"}
Category: ${addingQuestion.category}
Value: $${addingQuestion.value}
Question: ${addingQuestion.question}
Answer: ${addingQuestion.answer}`)

    setAddingQuestion(null)
  }

  const deleteDoubleJeopardyQuestion = (id: string) => {
    if (confirm("Are you sure you want to delete this Double Jeopardy question?")) {
      alert(`Question deleted! In a real app, this would remove question ${id} from the database.`)
    }
  }

  return (
    <div
      className="p-4 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)",
        color: "#fef3c7",
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/melanated-wellness-logo-horizontal.jpg"
              alt="Melanated Wellness LLC"
              className="h-12 md:h-16 object-contain"
              style={{ filter: "brightness(1.2)" }}
            />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#fffbeb" }}>
            QUESTION ADMIN
          </h1>
          <p style={{ color: "#fde68a" }}>Manage Black Jeopardy Questions</p>
          <button
            onClick={() => onNavigate("home")}
            className="mt-4 px-4 py-2 rounded"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.2)",
              color: "#fde68a",
              border: "1px solid #fde68a",
            }}
          >
            ← Back to Home
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div
            className="flex rounded-lg overflow-hidden shadow-lg"
            style={{ backgroundColor: "rgba(254, 243, 199, 0.95)" }}
          >
            <button
              onClick={() => setActiveTab("regular")}
              className="px-6 py-3 font-bold transition-colors"
              style={{
                backgroundColor: activeTab === "regular" ? "#92400e" : "transparent",
                color: activeTab === "regular" ? "#fffbeb" : "#92400e",
              }}
            >
              Regular Questions
            </button>
            <button
              onClick={() => setActiveTab("doubleJeopardy")}
              className="px-6 py-3 font-bold transition-colors"
              style={{
                backgroundColor: activeTab === "doubleJeopardy" ? "#92400e" : "transparent",
                color: activeTab === "doubleJeopardy" ? "#fffbeb" : "#92400e",
              }}
            >
              Double Jeopardy Questions
            </button>
          </div>
        </div>

        {editingQuestion ? (
          // Edit Question Form
          <div
            className="rounded-lg p-6 mb-6 shadow-lg"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.95)",
              border: "2px solid #fde68a",
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "#92400e" }}>
              Editing {editingQuestion.type === "regular" ? "Regular" : "Double Jeopardy"} Question:{" "}
              {editingQuestion.category.toUpperCase()} - ${editingQuestion.value}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                  Question
                </label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-3 rounded-lg min-h-[100px]"
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "2px solid #fde68a",
                    color: "#92400e",
                  }}
                  placeholder="Enter the question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                  Answer
                </label>
                <input
                  type="text"
                  value={editingQuestion.answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                  className="w-full p-3 rounded-lg"
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "2px solid #fde68a",
                    color: "#92400e",
                  }}
                  placeholder="Enter the answer..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveQuestion}
                  className="px-4 py-2 rounded-lg font-bold"
                  style={{ backgroundColor: "#16a34a", color: "#fff" }}
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-lg font-bold"
                  style={{
                    border: "2px solid #fbbf24",
                    color: "#a16207",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : addingQuestion ? (
          // Add New Question Form
          <div
            className="rounded-lg p-6 mb-6 shadow-lg"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.95)",
              border: "2px solid #fde68a",
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "#92400e" }}>
              Adding New {addingQuestion.type === "regular" ? "Regular" : "Double Jeopardy"} Question
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                    Category
                  </label>
                  <select
                    value={addingQuestion.category}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, category: e.target.value })}
                    className="w-full p-3 rounded-lg"
                    style={{
                      backgroundColor: "#fffbeb",
                      border: "2px solid #fde68a",
                      color: "#92400e",
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                    Value
                  </label>
                  <select
                    value={addingQuestion.value}
                    onChange={(e) => setAddingQuestion({ ...addingQuestion, value: Number.parseInt(e.target.value) })}
                    className="w-full p-3 rounded-lg"
                    style={{
                      backgroundColor: "#fffbeb",
                      border: "2px solid #fde68a",
                      color: "#92400e",
                    }}
                  >
                    {values.map((val) => (
                      <option key={val} value={val}>
                        ${val}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                  Question
                </label>
                <textarea
                  value={addingQuestion.question}
                  onChange={(e) => setAddingQuestion({ ...addingQuestion, question: e.target.value })}
                  className="w-full p-3 rounded-lg min-h-[100px]"
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "2px solid #fde68a",
                    color: "#92400e",
                  }}
                  placeholder="Enter the question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#92400e" }}>
                  Answer
                </label>
                <input
                  type="text"
                  value={addingQuestion.answer}
                  onChange={(e) => setAddingQuestion({ ...addingQuestion, answer: e.target.value })}
                  className="w-full p-3 rounded-lg"
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "2px solid #fde68a",
                    color: "#92400e",
                  }}
                  placeholder="Enter the answer..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveNewQuestion}
                  disabled={!addingQuestion.question || !addingQuestion.answer}
                  className="px-4 py-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: !addingQuestion.question || !addingQuestion.answer ? "#9ca3af" : "#16a34a",
                    color: "#fff",
                    cursor: !addingQuestion.question || !addingQuestion.answer ? "not-allowed" : "pointer",
                  }}
                >
                  ➕ Add Question
                </button>
                <button
                  onClick={() => setAddingQuestion(null)}
                  className="px-4 py-2 rounded-lg font-bold"
                  style={{
                    border: "2px solid #fbbf24",
                    color: "#a16207",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Questions Display
          <div>
            {/* Add New Question Button */}
            <div className="text-center mb-6">
              <button
                onClick={() => startAdding(activeTab)}
                className="px-6 py-3 rounded-lg font-bold shadow-lg"
                style={{ backgroundColor: "#16a34a", color: "#fff" }}
              >
                ➕ Add New {activeTab === "regular" ? "Regular" : "Double Jeopardy"} Question
              </button>
            </div>

            {activeTab === "regular" ? (
              // Regular Questions Grid
              <div className="space-y-6">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="rounded-lg p-6 shadow-lg"
                    style={{
                      backgroundColor: "rgba(254, 243, 199, 0.95)",
                      border: "2px solid #fde68a",
                    }}
                  >
                    <h2 className="uppercase font-bold text-xl mb-4" style={{ color: "#92400e" }}>
                      {category}
                    </h2>

                    <div className="grid gap-4">
                      {values.map((value) => {
                        const questionData = questions[category as keyof typeof questions][value as keyof any]
                        return (
                          <div
                            key={value}
                            className="rounded-lg p-4"
                            style={{
                              border: "2px solid #fde68a",
                              backgroundColor: "#fffbeb",
                            }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span
                                className="font-bold px-3 py-1 rounded"
                                style={{
                                  backgroundColor: "#92400e",
                                  color: "#fffbeb",
                                }}
                              >
                                ${value}
                              </span>
                              <button
                                onClick={() => startEditing(category, value, "regular")}
                                className="px-3 py-1 rounded font-bold"
                                style={{ backgroundColor: "#a16207", color: "#fffbeb" }}
                              >
                                ✏️ Edit
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium" style={{ color: "#a16207" }}>
                                  Question:
                                </p>
                                <p style={{ color: "#92400e" }}>{questionData.question}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: "#a16207" }}>
                                  Answer:
                                </p>
                                <p className="font-medium" style={{ color: "#a16207" }}>
                                  {questionData.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Double Jeopardy Questions Grid
              <div className="space-y-6">
                <div
                  className="rounded-lg p-6 shadow-lg"
                  style={{
                    backgroundColor: "rgba(254, 243, 199, 0.95)",
                    border: "2px solid #fde68a",
                  }}
                >
                  <h2 className="uppercase font-bold text-xl mb-4 flex items-center gap-2" style={{ color: "#92400e" }}>
                    <span className="text-2xl">⚡</span>
                    Double Jeopardy Questions
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "#a16207" }}>
                    These special questions can appear randomly during gameplay for double points!
                  </p>

                  <div className="grid gap-4">
                    {doubleJeopardyQuestions.map((questionData) => (
                      <div
                        key={questionData.id}
                        className="rounded-lg p-4"
                        style={{
                          border: "2px solid #fde68a",
                          backgroundColor: "#fffbeb",
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2">
                            <span
                              className="font-bold px-3 py-1 rounded"
                              style={{
                                backgroundColor: "#dc2626",
                                color: "#fffbeb",
                              }}
                            >
                              ⚡ ${questionData.value}
                            </span>
                            <span
                              className="font-medium px-3 py-1 rounded"
                              style={{
                                backgroundColor: "#92400e",
                                color: "#fffbeb",
                              }}
                            >
                              {questionData.category}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                startEditing(
                                  questionData.category,
                                  questionData.value,
                                  "doubleJeopardy",
                                  questionData.id,
                                )
                              }
                              className="px-3 py-1 rounded font-bold"
                              style={{ backgroundColor: "#a16207", color: "#fffbeb" }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteDoubleJeopardyQuestion(questionData.id)}
                              className="px-3 py-1 rounded font-bold"
                              style={{ backgroundColor: "#dc2626", color: "#fffbeb" }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#a16207" }}>
                              Question:
                            </p>
                            <p style={{ color: "#92400e" }}>{questionData.question}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#a16207" }}>
                              Answer:
                            </p>
                            <p className="font-medium" style={{ color: "#a16207" }}>
                              {questionData.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Main App Component
export default function BlackJeopardyApp() {
  const [gameState, setGameState] = useState<GameState>({
    currentView: "home",
    gameId: Math.random().toString(36).substring(2, 8).toUpperCase(),
    currentQuestion: null,
    usedQuestions: new Set(),
    teams: [
      { id: "1", name: "Team Alpha", score: 0, buzzedIn: false },
      { id: "2", name: "Team Beta", score: 0, buzzedIn: false },
    ],
    buzzerOpen: false,
    doubleJeopardyPositions: generateDoubleJeopardyPositions(),
    usedDoubleJeopardyQuestions: new Set(),
    playerInfo: null,
  })

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }))
  }

  const navigateTo = (view: string) => {
    setGameState((prev) => ({ ...prev, currentView: view as any }))
  }

  // Render current view
  switch (gameState.currentView) {
    case "host":
      return <HostPage gameState={gameState} updateGameState={updateGameState} onNavigate={navigateTo} />
    case "join":
      return <JoinPage gameState={gameState} updateGameState={updateGameState} onNavigate={navigateTo} />
    case "admin":
      return <AdminPage onNavigate={navigateTo} />
    default:
      return <HomePage onNavigate={navigateTo} />
  }
}
