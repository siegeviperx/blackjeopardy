import { doubleJeopardyQuestions } from "./questions"

// Generate random Double Jeopardy positions (3-5 tiles per game)
export function generateDoubleJeopardyPositions(): Set<string> {
  const categories = ["history", "trivia", "sports", "film", "music"]
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
export function getRandomDoubleJeopardyQuestion(usedQuestionIds: Set<string>) {
  const availableQuestions = doubleJeopardyQuestions.filter((q) => !usedQuestionIds.has(q.id))

  if (availableQuestions.length === 0) {
    // Fallback to any question if all are used
    return doubleJeopardyQuestions[Math.floor(Math.random() * doubleJeopardyQuestions.length)]
  }

  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
}
