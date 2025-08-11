// Simple localStorage utilities
export function saveToStorage(key: string, data: any) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error("Failed to save to storage:", error)
  }
}

export function loadFromStorage(key: string) {
  try {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    }
  } catch (error) {
    console.error("Failed to load from storage:", error)
  }
  return null
}

export function clearStorage(key: string) {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error("Failed to clear storage:", error)
  }
}
