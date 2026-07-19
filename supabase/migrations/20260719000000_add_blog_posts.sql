/*
# Blog Posts

## Summary
Adds a blog_posts table to support a public-facing blog with customisable
slugs, rich text content, and SEO metadata. Includes an admin write policy
and a public read policy for published posts.

## New Table

### blog_posts
- id (uuid, PK)
- title (text, not null)
- slug (text, unique, not null) — URL-friendly identifier
- content (text) — full post body (HTML or Markdown)
- excerpt (text) — short summary shown on listing pages
- seo_title (text) — override for <title> tag
- seo_description (text) — meta description
- author (text)
- cover_image_url (text)
- published (boolean, default false)
- published_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)

## Security
- RLS enabled.
- Public SELECT for published posts only.
- Authenticated users (admins) can INSERT, UPDATE, DELETE.
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  seo_title text,
  seo_description text,
  author text,
  cover_image_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_published_posts" ON blog_posts;
CREATE POLICY "public_select_published_posts" ON blog_posts
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "admin_all_posts" ON blog_posts;
CREATE POLICY "admin_all_posts" ON blog_posts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();
