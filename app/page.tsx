'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestPage() {
  const [testResult, setTestResult] = useState('')

  const testConnection = async () => {
    try {
      setTestResult('Testing connection...')
      
      // Test 1: Basic connection
      const { data, error } = await supabase.from('game_sessions').select('*').limit(1)
      
      if (error) {
        setTestResult(`Connection FAILED: ${error.message}`)
        return
      }
      
      setTestResult(`Connection SUCCESS. Found ${data.length} records.`)
      
      // Test 2: Try to insert
      const testCode = `TEST${Date.now()}`
      const { error: insertError } = await supabase
        .from('game_sessions')
        .insert({ 
          game_code: testCode, 
          game_state: { test: true } 
        })
      
      if (insertError) {
        setTestResult(prev => prev + `\nInsert FAILED: ${insertError.message}`)
      } else {
        setTestResult(prev => prev + '\nInsert SUCCESS')
        
        // Clean up
        await supabase.from('game_sessions').delete().eq('game_code', testCode)
      }
      
    } catch (err) {
      setTestResult(`Exception: ${err}`)
    }
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Database Connection
      </button>
      
      <div className="bg-white p-4 border rounded">
        <pre>{testResult}</pre>
      </div>
      
      <div className="mt-4 text-sm">
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
      </div>
    </div>
  )
}
