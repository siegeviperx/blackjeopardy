"use client"

import { useState } from "react"
import Link from "next/link"
import questions from "@/lib/questions"

export default function AdminPage() {
  const [editingQuestion, setEditingQuestion] = useState<{
    category: string
    value: number
    question: string
    answer: string
  } | null>(null)

  const categories = Object.keys(questions)
  const values = [200, 400, 600, 800, 1000]

  const startEditing = (category: string, value: number) => {
    const questionData = questions[category as keyof typeof questions][value as keyof any]
    setEditingQuestion({
      category,
      value,
      question: questionData.question,
      answer: questionData.answer,
    })
  }

  const saveQuestion = () => {
    if (!editingQuestion) return

    alert(`Question saved! In a real app, this would update the database.
    
Category: ${editingQuestion.category}
Value: $${editingQuestion.value}
Question: ${editingQuestion.question}
Answer: ${editingQuestion.answer}`)

    setEditingQuestion(null)
  }

  const cancelEditing = () => {
    setEditingQuestion(null)
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#fffbeb" }}>
            QUESTION ADMIN
          </h1>
          <p style={{ color: "#fde68a" }}>Manage Black Jeopardy Questions</p>
          <Link href="/">
            <button
              className="mt-4 px-4 py-2 rounded"
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
              Editing: {editingQuestion.category.toUpperCase()} - ${editingQuestion.value}
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
                  onClick={cancelEditing}
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
          // Questions Grid
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
                            onClick={() => startEditing(category, value)}
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
        )}
      </div>
    </div>
  )
}
