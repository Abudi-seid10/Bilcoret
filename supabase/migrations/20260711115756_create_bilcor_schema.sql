/*
# Bilcor Platform — Initial Schema

## Summary
Creates four core tables for the Bilcor knowledge-sharing platform:
seminars, podcasts, trainings, and registrations. Includes seed data
for development and Row Level Security policies allowing public read
access to content tables and open registration inserts.

## New Tables

### seminars
- id (uuid, PK)
- title (text, not null)
- description (text)
- speaker (text)
- date (timestamptz)
- location (text)
- registration_link (text)
- created_at (timestamptz)

### podcasts
- id (uuid, PK)
- title (text, not null)
- episode_number (integer)
- guest (text)
- description (text)
- audio_url (text)
- duration (integer, seconds)
- publish_date (timestamptz)

### trainings
- id (uuid, PK)
- title (text, not null)
- description (text)
- instructor (text)
- duration (text)
- price (numeric)
- status (text, enum: upcoming|ongoing|self-paced)
- image_url (text)
- created_at (timestamptz)

### registrations
- id (uuid, PK)
- user_email (text, not null)
- type (text, enum: seminar|training)
- item_id (uuid)
- status (text, default 'pending')
- created_at (timestamptz)

## Security
- RLS enabled on all four tables.
- seminars, podcasts, trainings: public SELECT via anon + authenticated.
- registrations: open INSERT via anon + authenticated.
*/

CREATE TABLE IF NOT EXISTS seminars (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  speaker text,
  date timestamptz,
  location text,
  registration_link text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS podcasts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  episode_number integer,
  guest text,
  description text,
  audio_url text,
  duration integer,
  publish_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trainings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  instructor text,
  duration text,
  price numeric,
  status text CHECK (status IN ('upcoming','ongoing','self-paced')),
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  type text CHECK (type IN ('seminar','training')),
  item_id uuid NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Seed data
INSERT INTO seminars (title, description, speaker, date, location)
SELECT 'Unlocking Leadership Potential', 'An interactive seminar on leading with vision and purpose in a fast-changing world.', 'Dr. Amina Kebede', '2026-08-15 09:00:00+00', 'Addis Ababa & Online'
WHERE NOT EXISTS (SELECT 1 FROM seminars WHERE title = 'Unlocking Leadership Potential');

INSERT INTO seminars (title, description, speaker, date, location)
SELECT 'Value Creation in the Digital Age', 'How to innovate and deliver real, lasting value in digital economies.', 'Samuel T.', '2026-09-01 14:00:00+00', 'Virtual (Zoom)'
WHERE NOT EXISTS (SELECT 1 FROM seminars WHERE title = 'Value Creation in the Digital Age');

INSERT INTO seminars (title, description, speaker, date, location)
SELECT 'Emotional Intelligence in Leadership', 'Mastering self-awareness and empathy as core leadership tools.', 'Dr. Ruth Haile', '2025-11-20 10:00:00+00', 'Addis Ababa'
WHERE NOT EXISTS (SELECT 1 FROM seminars WHERE title = 'Emotional Intelligence in Leadership');

INSERT INTO podcasts (title, episode_number, guest, description, audio_url, duration)
SELECT 'The Power of Knowledge Sharing', 1, 'Dr. Amina Kebede', 'Exploring how knowledge creates value and transforms organizations.', 'https://example.com/audio/ep1.mp3', 1840
WHERE NOT EXISTS (SELECT 1 FROM podcasts WHERE episode_number = 1);

INSERT INTO podcasts (title, episode_number, guest, description, audio_url, duration)
SELECT 'Building Resilient Teams', 2, 'Samuel T.', 'Strategies for cultivating resilience and high performance.', 'https://example.com/audio/ep2.mp3', 2120
WHERE NOT EXISTS (SELECT 1 FROM podcasts WHERE episode_number = 2);

INSERT INTO podcasts (title, episode_number, guest, description, audio_url, duration)
SELECT 'The Future of Learning', 3, 'Helen M.', 'How self-directed learning is reshaping careers and organizations.', 'https://example.com/audio/ep3.mp3', 1760
WHERE NOT EXISTS (SELECT 1 FROM podcasts WHERE episode_number = 3);

INSERT INTO trainings (title, description, instructor, duration, price, status)
SELECT 'Professional Communication Mastery', 'Enhance your public speaking, writing, and interpersonal communication skills.', 'Helen M.', '6 weeks', 99.99, 'ongoing'
WHERE NOT EXISTS (SELECT 1 FROM trainings WHERE title = 'Professional Communication Mastery');

INSERT INTO trainings (title, description, instructor, duration, price, status)
SELECT 'Project Management Fundamentals', 'Learn to deliver projects on time and within budget using proven frameworks.', 'Solomon A.', 'self-paced', 49.99, 'self-paced'
WHERE NOT EXISTS (SELECT 1 FROM trainings WHERE title = 'Project Management Fundamentals');

INSERT INTO trainings (title, description, instructor, duration, price, status)
SELECT 'Strategic Thinking & Decision Making', 'Develop structured frameworks for complex business decisions.', 'Dr. Amina Kebede', '4 weeks', 79.99, 'upcoming'
WHERE NOT EXISTS (SELECT 1 FROM trainings WHERE title = 'Strategic Thinking & Decision Making');

-- RLS
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_seminars" ON seminars;
CREATE POLICY "public_select_seminars" ON seminars FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_podcasts" ON podcasts;
CREATE POLICY "public_select_podcasts" ON podcasts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_trainings" ON trainings;
CREATE POLICY "public_select_trainings" ON trainings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_registrations" ON registrations;
CREATE POLICY "public_insert_registrations" ON registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
