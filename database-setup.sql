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
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
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

-- Create usage_limits table to track user limits
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes_count INTEGER DEFAULT 0,
  folders_count INTEGER DEFAULT 0,
  labels_count INTEGER DEFAULT 0,
  ai_enhancements_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
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

-- Usage limits indexes
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_updated_at ON usage_limits(updated_at DESC);

-- =====================================================
-- CREATE UNIQUE CONSTRAINTS
-- =====================================================

-- Ensure labels are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_labels_user_name ON labels(user_id, name);

-- =====================================================
-- CREATE HELPER FUNCTIONS (BEFORE RLS POLICIES)
-- =====================================================

-- Function to check if user can create a note (max 1000)
CREATE OR REPLACE FUNCTION can_create_note(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current notes count
  SELECT COUNT(*) INTO current_count
  FROM notes
  WHERE user_id = user_uuid;
  
  -- Check if under limit (1000)
  RETURN current_count < 1000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create a folder (max 50)
CREATE OR REPLACE FUNCTION can_create_folder(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current folders count
  SELECT COUNT(*) INTO current_count
  FROM folders
  WHERE user_id = user_uuid;
  
  -- Check if under limit (50)
  RETURN current_count < 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create a label (max 100)
CREATE OR REPLACE FUNCTION can_create_label(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current labels count
  SELECT COUNT(*) INTO current_count
  FROM labels
  WHERE user_id = user_uuid;
  
  -- Check if under limit (100)
  RETURN current_count < 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES FOR NOTES
-- =====================================================

-- Users can view their own notes OR any published notes
CREATE POLICY "Users can view their own notes or published notes" ON notes
  FOR SELECT USING (
    auth.uid() = user_id OR published = true
  );

-- Users can insert their own notes (with usage limit check)
CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    can_create_note(auth.uid())
  );

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

-- Users can insert their own folders (with usage limit check)
CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    can_create_folder(auth.uid())
  );

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

-- Users can insert their own labels (with usage limit check)
CREATE POLICY "Users can insert their own labels" ON labels
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    can_create_label(auth.uid())
  );

-- Users can update their own labels
CREATE POLICY "Users can update their own labels" ON labels
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own labels
CREATE POLICY "Users can delete their own labels" ON labels
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES FOR USAGE_LIMITS
-- =====================================================

-- Users can view their own usage limits
CREATE POLICY "Users can view their own usage limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage limits
CREATE POLICY "Users can insert their own usage limits" ON usage_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage limits
CREATE POLICY "Users can update their own usage limits" ON usage_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own usage limits
CREATE POLICY "Users can delete their own usage limits" ON usage_limits
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

-- Trigger to automatically update updated_at on usage_limits table
CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CREATE USAGE COUNT UPDATE FUNCTIONS
-- =====================================================

-- Function to update usage counts when notes are created/deleted
CREATE OR REPLACE FUNCTION update_notes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment notes count
    INSERT INTO usage_limits (user_id, notes_count, folders_count, labels_count, ai_enhancements_used)
    VALUES (NEW.user_id, 1, 0, 0, 0)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      notes_count = usage_limits.notes_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement notes count
    UPDATE usage_limits 
    SET notes_count = GREATEST(notes_count - 1, 0),
        updated_at = NOW()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update usage counts when folders are created/deleted
CREATE OR REPLACE FUNCTION update_folders_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment folders count
    INSERT INTO usage_limits (user_id, notes_count, folders_count, labels_count, ai_enhancements_used)
    VALUES (NEW.user_id, 0, 1, 0, 0)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      folders_count = usage_limits.folders_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement folders count
    UPDATE usage_limits 
    SET folders_count = GREATEST(folders_count - 1, 0),
        updated_at = NOW()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update usage counts when labels are created/deleted
CREATE OR REPLACE FUNCTION update_labels_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment labels count
    INSERT INTO usage_limits (user_id, notes_count, folders_count, labels_count, ai_enhancements_used)
    VALUES (NEW.user_id, 0, 0, 1, 0)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      labels_count = usage_limits.labels_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement labels count
    UPDATE usage_limits 
    SET labels_count = GREATEST(labels_count - 1, 0),
        updated_at = NOW()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC COUNT UPDATES
-- =====================================================

-- Triggers for notes table
CREATE TRIGGER trigger_update_notes_count_insert
  AFTER INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_count();

CREATE TRIGGER trigger_update_notes_count_delete
  AFTER DELETE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_count();

-- Triggers for folders table
CREATE TRIGGER trigger_update_folders_count_insert
  AFTER INSERT ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_folders_count();

CREATE TRIGGER trigger_update_folders_count_delete
  AFTER DELETE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_folders_count();

-- Triggers for labels table
CREATE TRIGGER trigger_update_labels_count_insert
  AFTER INSERT ON labels
  FOR EACH ROW
  EXECUTE FUNCTION update_labels_count();

CREATE TRIGGER trigger_update_labels_count_delete
  AFTER DELETE ON labels
  FOR EACH ROW
  EXECUTE FUNCTION update_labels_count();

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get or create usage limits for a user
CREATE OR REPLACE FUNCTION get_or_create_usage_limits(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  notes_count INTEGER,
  folders_count INTEGER,
  labels_count INTEGER,
  ai_enhancements_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Try to get existing usage limits
  RETURN QUERY
  SELECT 
    ul.id,
    ul.user_id,
    ul.notes_count,
    ul.folders_count,
    ul.labels_count,
    ul.ai_enhancements_used,
    ul.created_at,
    ul.updated_at
  FROM usage_limits ul
  WHERE ul.user_id = user_uuid;
  
  -- If no usage limits exist, create them
  IF NOT FOUND THEN
    INSERT INTO usage_limits (user_id, notes_count, folders_count, labels_count, ai_enhancements_used)
    VALUES (user_uuid, 0, 0, 0, 0);
    
    -- Return the newly created usage limits
    RETURN QUERY
    SELECT 
      ul.id,
      ul.user_id,
      ul.notes_count,
      ul.folders_count,
      ul.labels_count,
      ul.ai_enhancements_used,
      ul.created_at,
      ul.updated_at
    FROM usage_limits ul
    WHERE ul.user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI enhancement usage
CREATE OR REPLACE FUNCTION increment_ai_enhancement_usage(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Get or create usage limits
  PERFORM get_or_create_usage_limits(user_uuid);
  
  -- Increment AI enhancement usage
  UPDATE usage_limits
  SET ai_enhancements_used = ai_enhancements_used + 1
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize usage counts for existing users
CREATE OR REPLACE FUNCTION initialize_existing_users_usage_counts()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  notes_count INTEGER;
  folders_count INTEGER;
  labels_count INTEGER;
  updated_users INTEGER := 0;
BEGIN
  -- Loop through all users who have notes, folders, or labels but no usage_limits record
  FOR user_record IN 
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM notes
      UNION
      SELECT user_id FROM folders
      UNION
      SELECT user_id FROM labels
    ) all_users
    WHERE user_id NOT IN (SELECT user_id FROM usage_limits)
  LOOP
    -- Count existing items for this user
    SELECT COUNT(*) INTO notes_count FROM notes WHERE user_id = user_record.user_id;
    SELECT COUNT(*) INTO folders_count FROM folders WHERE user_id = user_record.user_id;
    SELECT COUNT(*) INTO labels_count FROM labels WHERE user_id = user_record.user_id;
    
    -- Insert usage limits record with current counts
    INSERT INTO usage_limits (user_id, notes_count, folders_count, labels_count, ai_enhancements_used)
    VALUES (user_record.user_id, notes_count, folders_count, labels_count, 0);
    
    updated_users := updated_users + 1;
  END LOOP;
  
  RETURN updated_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- PUBLIC ACCESS FUNCTIONALITY FOR PUBLISHED NOTES
-- =====================================================

-- Function to get published note by ID
CREATE OR REPLACE FUNCTION get_public_note(note_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    folder_id UUID,
    labels TEXT[],
    published BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
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
        n.labels,
        n.published,
        n.published_at,
        n.created_at,
        n.updated_at,
        n.user_id
    FROM notes n
    WHERE n.id = note_uuid AND n.published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION get_public_note(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_note(UUID) TO authenticated;

-- Create index for better performance on published notes
CREATE INDEX IF NOT EXISTS idx_notes_published ON notes(published) WHERE published = true;

-- =====================================================
-- INITIALIZE EXISTING USERS
-- =====================================================

-- Initialize usage counts for existing users
SELECT initialize_existing_users_usage_counts() as users_initialized;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('notes', 'folders', 'labels', 'usage_limits')
ORDER BY table_name;

-- Check if indexes were created
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('notes', 'folders', 'labels', 'usage_limits')
ORDER BY tablename, indexname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('notes', 'folders', 'labels', 'usage_limits')
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
  AND tablename IN ('notes', 'folders', 'labels', 'usage_limits')
ORDER BY tablename, policyname;

-- Check if public access function was created
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'get_public_note';

-- Check if published notes index was created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'notes' 
  AND indexname = 'idx_notes_published';

-- Check if usage limit functions were created
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN (
  'get_or_create_usage_limits',
  'can_create_note',
  'can_create_folder', 
  'can_create_label',
  'increment_ai_enhancement_usage',
  'initialize_existing_users_usage_counts',
  'update_notes_count',
  'update_folders_count',
  'update_labels_count'
)
ORDER BY routine_name;

-- Check if triggers were created
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE '%update_%count%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- The database is now ready for the Notiva application!
-- Features included:
-- 1. Basic note-taking functionality with folders and labels
-- 2. Public access to published notes (publish feature)
-- 3. Row Level Security (RLS) for data protection
-- 4. Performance indexes for optimal query speed
-- 5. Helper functions for common operations
-- 6. Usage limits enforcement (1000 notes, 50 folders, 100 labels per user)
-- 7. AI enhancement usage tracking
--
-- Make sure to:
-- 1. Configure your environment variables
-- 2. Set up email templates in Supabase Auth
-- 3. Test the API endpoints
-- 4. Update your middleware to allow public access to /published/* routes
