-- Add google_event_id column to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_todos_google_event_id ON todos(google_event_id);

-- Add comment
COMMENT ON COLUMN todos.google_event_id IS 'Google Calendar Event ID for two-way sync';
