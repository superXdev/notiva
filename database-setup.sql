-- =====================================================
-- NOTIVA DATABASE SETUP SCRIPT
-- =====================================================
-- This script creates all necessary tables, indexes, and security policies
-- for the Notiva note-taking application using Supabase.

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Create folders table first (referenced by notes)
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Folders indexes
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC);

-- Labels indexes
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id);
CREATE INDEX IF NOT EXISTS idx_labels_created_at ON labels(created_at DESC);

-- =====================================================
-- CREATE UNIQUE CONSTRAINTS
-- =====================================================

-- Ensure labels are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_labels_user_name ON labels(user_id, name);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES FOR NOTES
-- =====================================================

-- Users can view their own notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES FOR FOLDERS
-- =====================================================

-- Users can view their own folders
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own folders
CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own folders
CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own folders
CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES FOR LABELS
-- =====================================================

-- Users can view their own labels
CREATE POLICY "Users can view their own labels" ON labels
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own labels
CREATE POLICY "Users can insert their own labels" ON labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own labels
CREATE POLICY "Users can update their own labels" ON labels
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own labels
CREATE POLICY "Users can delete their own labels" ON labels
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE AUTOMATIC TIMESTAMP UPDATE FUNCTION
-- =====================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger to automatically update updated_at on notes table
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get notes with folder information
CREATE OR REPLACE FUNCTION get_notes_with_folders(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  folder_id UUID,
  folder_name TEXT,
  labels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    n.folder_id,
    f.name as folder_name,
    n.labels,
    n.created_at,
    n.updated_at,
    n.user_id
  FROM notes n
  LEFT JOIN folders f ON n.folder_id = f.id
  WHERE n.user_id = user_uuid
  ORDER BY n.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get folder hierarchy
CREATE OR REPLACE FUNCTION get_folder_hierarchy(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  parent_id UUID,
  parent_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE folder_tree AS (
    -- Base case: root folders (no parent)
    SELECT 
      f.id,
      f.name,
      f.parent_id,
      NULL::TEXT as parent_name,
      f.created_at,
      f.user_id,
      0 as level
    FROM folders f
    WHERE f.user_id = user_uuid AND f.parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child folders
    SELECT 
      f.id,
      f.name,
      f.parent_id,
      ft.name as parent_name,
      f.created_at,
      f.user_id,
      ft.level + 1
    FROM folders f
    INNER JOIN folder_tree ft ON f.parent_id = ft.id
    WHERE f.user_id = user_uuid
  )
  SELECT * FROM folder_tree
  ORDER BY level, name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for notes with folder information
CREATE OR REPLACE VIEW notes_with_folders AS
SELECT 
  n.id,
  n.title,
  n.content,
  n.folder_id,
  f.name as folder_name,
  n.labels,
  n.created_at,
  n.updated_at,
  n.user_id
FROM notes n
LEFT JOIN folders f ON n.folder_id = f.id;

-- View for folder statistics
CREATE OR REPLACE VIEW folder_stats AS
SELECT 
  f.id,
  f.name,
  f.parent_id,
  f.created_at,
  f.user_id,
  COUNT(n.id) as note_count
FROM folders f
LEFT JOIN notes n ON f.id = n.folder_id
GROUP BY f.id, f.name, f.parent_id, f.created_at, f.user_id;

-- =====================================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Uncomment the following section if you want to insert sample data
-- Note: This requires a valid user_id from your auth.users table

/*
-- Sample folders (replace 'your-user-id' with actual user ID)
INSERT INTO folders (name, user_id) VALUES 
  ('Personal', 'your-user-id'),
  ('Work', 'your-user-id'),
  ('Ideas', 'your-user-id');

-- Sample labels (replace 'your-user-id' with actual user ID)
INSERT INTO labels (name, color, user_id) VALUES 
  ('Important', '#ef4444', 'your-user-id'),
  ('Todo', '#3b82f6', 'your-user-id'),
  ('Ideas', '#10b981', 'your-user-id'),
  ('Reference', '#f59e0b', 'your-user-id');

-- Sample notes (replace 'your-user-id' with actual user ID)
INSERT INTO notes (title, content, folder_id, labels, user_id) VALUES 
  ('Welcome to Notiva', '# Welcome to Notiva!\n\nThis is your first note. Start writing and organizing your thoughts.', 
   (SELECT id FROM folders WHERE name = 'Personal' AND user_id = 'your-user-id' LIMIT 1),
   ARRAY['Important'], 'your-user-id'),
  
  ('Getting Started', '## Getting Started\n\n1. Create your first note\n2. Organize with folders\n3. Add labels for better organization\n4. Export to PDF when needed', 
   (SELECT id FROM folders WHERE name = 'Work' AND user_id = 'your-user-id' LIMIT 1),
   ARRAY['Todo', 'Reference'], 'your-user-id');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('notes', 'folders', 'labels')
ORDER BY table_name;

-- Check if indexes were created
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('notes', 'folders', 'labels')
ORDER BY tablename, indexname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('notes', 'folders', 'labels')
ORDER BY tablename;

-- Check if policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('notes', 'folders', 'labels')
ORDER BY tablename, policyname;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- The database is now ready for the Notiva application!
-- Make sure to:
-- 1. Configure your environment variables
-- 2. Set up email templates in Supabase Auth
-- 3. Test the API endpoints
