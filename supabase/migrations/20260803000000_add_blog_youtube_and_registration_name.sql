/*
# Add blog posts, YouTube URL for podcasts, and user_name for registrations

## Changes

### blog_posts (new table)
- id (uuid, PK)
- title (text, not null)
- slug (text, not null, unique) — URL-friendly identifier
- content (text) — main body (Markdown)
- excerpt (text) — short summary for listings
- seo_title (text) — overrides title in <title> tag
- seo_description (text) — meta description
- author (text)
- published (boolean, default false)
- created_at (timestamptz)
- updated_at (timestamptz)

### podcasts
- youtube_url (text) — YouTube video URL; when set, thumbnail is shown and link redirects to YouTube

### registrations
- user_name (text) — registrant's full name (captured in RegistrationModal)
*/

-- blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL,
  content text,
  excerpt text,
  seo_title text,
  seo_description text,
  author text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);

ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS youtube_url text;

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS user_name text;

-- RLS for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_blog_posts" ON blog_posts;
CREATE POLICY "public_select_blog_posts" ON blog_posts
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "admin_all_blog_posts" ON blog_posts;
CREATE POLICY "admin_all_blog_posts" ON blog_posts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- updated_at trigger for blog_posts
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
