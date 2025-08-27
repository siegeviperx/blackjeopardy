-- Create game_sessions table for cross-device synchronization
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code TEXT UNIQUE NOT NULL,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on game_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_code ON game_sessions(game_code);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive if needed)
CREATE POLICY IF NOT EXISTS "Allow all operations on game_sessions" ON game_sessions
  FOR ALL USING (true);
