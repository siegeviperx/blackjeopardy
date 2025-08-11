"use client"

import type React from "react"
import { useState } from "react"

const ADMIN_PIN = "1234" // Declare ADMIN_PIN variable

const Page = () => {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      // Add browser check before accessing localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("adminAuthenticated", "true")
      }
      onAuthenticate()
      setError("")
    } else {
      setError("Invalid PIN. Please try again.")
      setPin("")
    }
  }

  const onAuthenticate = () => {
    // Handle authentication logic here
    console.log("Admin authenticated")
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" />
        <button type="submit">Submit</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  )
}

export default Page // Add default export
