// Simulate the Double Jeopardy selection logic from the game
function simulateGameSession() {
  const categories = ["history", "trivia", "sports", "film", "music"]
  const values = [200, 400, 600, 800, 1000]

  // Simulate selecting 2-3 Double Jeopardy questions per game (same as actual game logic)
  const djCount = Math.floor(Math.random() * 2) + 2 // 2 or 3 questions
  const djPositions = new Set()

  // Place Double Jeopardy questions randomly on the board
  for (let i = 0; i < djCount; i++) {
    let position
    do {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      const randomValue = values[Math.floor(Math.random() * values.length)]
      position = `${randomCategory}-${randomValue}`
    } while (djPositions.has(position))

    djPositions.add(position)
  }

  return {
    totalQuestions: 25, // 5 categories × 5 values
    doubleJeopardyCount: djPositions.size,
    doubleJeopardyPositions: Array.from(djPositions),
    percentage: (djPositions.size / 25) * 100,
  }
}

// Run 20 game sessions and collect statistics
function runFrequencyTest() {
  console.log("🎮 Testing Double Jeopardy frequency over 20 game sessions...\n")

  const results = []
  let totalDJQuestions = 0

  for (let session = 1; session <= 20; session++) {
    const result = simulateGameSession()
    results.push(result)
    totalDJQuestions += result.doubleJeopardyCount

    console.log(
      `Session ${session.toString().padStart(2)}: ${result.doubleJeopardyCount} DJ questions (${result.percentage.toFixed(1)}%) - Positions: ${result.doubleJeopardyPositions.join(", ")}`,
    )
  }

  // Calculate statistics
  const averageDJPerGame = totalDJQuestions / 20
  const averagePercentage = (totalDJQuestions / (20 * 25)) * 100
  const djCounts = results.map((r) => r.doubleJeopardyCount)
  const minDJ = Math.min(...djCounts)
  const maxDJ = Math.max(...djCounts)

  // Count frequency of each DJ count
  const frequency = {}
  djCounts.forEach((count) => {
    frequency[count] = (frequency[count] || 0) + 1
  })

  console.log("\n📊 STATISTICS:")
  console.log("=" * 50)
  console.log(`Total Double Jeopardy questions across 20 sessions: ${totalDJQuestions}`)
  console.log(`Average DJ questions per game: ${averageDJPerGame.toFixed(2)}`)
  console.log(`Average percentage per game: ${averagePercentage.toFixed(1)}%`)
  console.log(`Range: ${minDJ} - ${maxDJ} DJ questions per game`)
  console.log("\nFrequency distribution:")
  Object.keys(frequency)
    .sort()
    .forEach((count) => {
      const sessions = frequency[count]
      const percent = (sessions / 20) * 100
      console.log(`  ${count} DJ questions: ${sessions} sessions (${percent}%)`)
    })

  console.log("\n🎯 CONCLUSION:")
  console.log(`In a typical game, players can expect ${Math.round(averageDJPerGame)} Double Jeopardy questions`)
  console.log(`That's approximately ${averagePercentage.toFixed(1)}% of all questions in each game`)

  return {
    totalSessions: 20,
    totalDJQuestions,
    averageDJPerGame,
    averagePercentage,
    frequency,
    results,
  }
}

// Run the test
const testResults = runFrequencyTest()
