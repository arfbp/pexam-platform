
-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.exam_results CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.exam_categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create exam categories table
CREATE TABLE public.exam_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create exam results table
CREATE TABLE public.exam_results (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  answers_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default users with simple base64 encoded passwords
INSERT INTO public.users (username, password_hash, is_admin) VALUES
('arif', encode(digest('admin123', 'sha256'), 'base64'), true),
('user', encode(digest('user123', 'sha256'), 'base64'), false);

-- Insert sample categories
INSERT INTO public.exam_categories (name, description) VALUES
('Mathematics', 'Mathematical concepts and problem solving'),
('Physics', 'Physical sciences and natural phenomena'),
('English', 'Language arts and literature'),
('Computer Science', 'Programming and computer concepts');

-- Insert sample questions
INSERT INTO public.questions (category_id, question_text, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation) VALUES
(1, 'What is 2 + 2?', '3', '4', '5', '6', 'B', 'Basic addition: 2 + 2 = 4'),
(1, 'What is the square root of 16?', '2', '3', '4', '5', 'C', 'Square root of 16 is 4 because 4 × 4 = 16'),
(2, 'What is the speed of light?', '300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s', 'A', 'The speed of light in vacuum is approximately 300,000 km/s'),
(3, 'Who wrote Romeo and Juliet?', 'Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain', 'B', 'Romeo and Juliet was written by William Shakespeare'),
(4, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 'A', 'HTML stands for Hyper Text Markup Language');

-- Enable Row Level Security (RLS) - but make it simple and non-recursive
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies that allow all operations for now (no recursion issues)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations on categories" ON public.exam_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on questions" ON public.questions FOR ALL USING (true);
CREATE POLICY "Allow all operations on exam_results" ON public.exam_results FOR ALL USING (true);
