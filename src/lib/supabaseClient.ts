import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

function isValidUrl(urlStr?: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false
  const trimmed = urlStr.trim()
  if (!trimmed || trimmed.includes('your-') || trimmed.includes('placeholder')) return false
  try {
    const parsed = new URL(trimmed)
    return (parsed.protocol === 'http:' || parsed.protocol === 'header:' || parsed.protocol === 'https:') && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

// Seed data for mock client
const mockSeminars = [
  {
    id: 's-1',
    title: 'Unlocking Leadership Potential',
    description: 'An interactive seminar on leading with vision and purpose in a fast-changing world.',
    speaker: 'Dr. Amina Kebede',
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    location: 'Addis Ababa & Online',
    registration_link: null,
    max_registrations: 25,
    created_at: new Date().toISOString()
  },
  {
    id: 's-2',
    title: 'Value Creation in the Digital Age',
    description: 'How to innovate and deliver real, lasting value in digital economies.',
    speaker: 'Samuel T.',
    date: new Date(Date.now() + 14 * 86400000).toISOString(),
    location: 'Virtual (Zoom)',
    registration_link: 'https://zoom.us',
    max_registrations: 50,
    created_at: new Date().toISOString()
  },
  {
    id: 's-3',
    title: 'Emotional Intelligence in Leadership',
    description: 'Mastering self-awareness and empathy as core leadership tools.',
    speaker: 'Dr. Ruth Haile',
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    location: 'Addis Ababa',
    registration_link: null,
    max_registrations: 15,
    created_at: new Date().toISOString()
  }
]

const mockPodcasts = [
  {
    id: 'p-1',
    title: 'The Power of Knowledge Sharing',
    episode_number: 1,
    guest: 'Dr. Amina Kebede',
    description: 'Exploring how knowledge creates value and transforms organizations.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    youtube_url: null,
    duration: 1840,
    publish_date: new Date().toISOString()
  },
  {
    id: 'p-2',
    title: 'Building Resilient Teams',
    episode_number: 2,
    guest: 'Samuel T.',
    description: 'Strategies for cultivating resilience and high performance.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    youtube_url: null,
    duration: 2120,
    publish_date: new Date().toISOString()
  },
  {
    id: 'p-3',
    title: 'The Future of Learning',
    episode_number: 3,
    guest: 'Helen M.',
    description: 'How self-directed learning is reshaping careers and organizations.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    youtube_url: null,
    duration: 1760,
    publish_date: new Date().toISOString()
  }
]

const mockTrainings = [
  {
    id: 't-1',
    title: 'Professional Communication Mastery',
    description: 'Enhance your public speaking, writing, and interpersonal communication skills.',
    instructor: 'Helen M.',
    duration: '6 weeks',
    price: 4500,
    status: 'ongoing',
    image_url: null,
    max_registrations: 20,
    created_at: new Date().toISOString()
  },
  {
    id: 't-2',
    title: 'Project Management Fundamentals',
    description: 'Learn to deliver projects on time and within budget using proven frameworks.',
    instructor: 'Solomon A.',
    duration: 'self-paced',
    price: 2500,
    status: 'self-paced',
    image_url: null,
    max_registrations: 100,
    created_at: new Date().toISOString()
  },
  {
    id: 't-3',
    title: 'Strategic Thinking & Decision Making',
    description: 'Develop structured frameworks for complex business decisions.',
    instructor: 'Dr. Amina Kebede',
    duration: '4 weeks',
    price: 3500,
    status: 'upcoming',
    image_url: null,
    max_registrations: 15,
    created_at: new Date().toISOString()
  }
]

const mockBlogPosts = [
  {
    id: 'b-1',
    title: '5 Habits of Exceptional Leaders',
    slug: '5-habits-of-exceptional-leaders',
    content: `# 5 Habits of Exceptional Leaders\n\nLeadership is not about titles; it's about impact, influence, and inspiration.\n\n1. Active Listening\n2. Empowering Others\n3. Continuous Learning\n4. Clarity of Purpose\n5. Empathy`,
    excerpt: 'Discover the core daily habits that separate effective managers from truly inspirational leaders.',
    seo_title: '5 Habits of Exceptional Leaders | Bilcor',
    seo_description: 'Discover the core daily habits that separate effective managers from inspirational leaders.',
    author: 'Dr. Amina Kebede',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b-2',
    title: 'Creating Value Through Organizational Learning',
    slug: 'creating-value-through-organizational-learning',
    content: `# Creating Value Through Organizational Learning\n\nIn a rapidly changing world, organizational learning is the ultimate advantage.`,
    excerpt: 'How fostering a culture of continuous learning drives sustainable growth and competitive advantage.',
    seo_title: 'Creating Value Through Organizational Learning | Bilcor',
    seo_description: 'How fostering a culture of continuous learning drives sustainable growth.',
    author: 'Samuel T.',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockRegistrations: any[] = []
const mockEmailCampaigns: any[] = []
const mockSiteSettings = [
  { id: '00000000-0000-0000-0000-000000000001', logo_url: null, favicon_url: null, updated_at: new Date().toISOString() }
]
const mockAdmins = [
  { id: 'admin-1', email: 'admin@bilcoret.com' }
]

const mockDataStore: Record<string, any[]> = {
  seminars: mockSeminars,
  podcasts: mockPodcasts,
  trainings: mockTrainings,
  blog_posts: mockBlogPosts,
  registrations: mockRegistrations,
  site_settings: mockSiteSettings,
  email_campaigns: mockEmailCampaigns,
  admins: mockAdmins,
}

class MockQueryBuilder {
  private tableName: string
  private filters: Array<(item: any) => boolean> = []
  private orderCol: string | null = null
  private orderAsc: boolean = true
  private limitCount: number | null = null
  private isSingle = false
  private isMaybeSingle = false

  constructor(tableName: string) {
    this.tableName = tableName
    if (!mockDataStore[tableName]) {
      mockDataStore[tableName] = []
    }
  }

  select(_cols?: string, _options?: { count?: string; head?: boolean }) {
    return this
  }

  eq(column: string, value: any) {
    this.filters.push(item => item[column] === value)
    return this
  }

  in(column: string, values: any[]) {
    this.filters.push(item => Array.isArray(values) && values.includes(item[column]))
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column
    this.orderAsc = options?.ascending ?? true
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this.execute()
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this.execute()
  }

  async execute() {
    let list = [...(mockDataStore[this.tableName] || [])]
    for (const filter of this.filters) {
      list = list.filter(filter)
    }
    if (this.orderCol) {
      const col = this.orderCol
      list.sort((a, b) => {
        if (a[col] < b[col]) return this.orderAsc ? -1 : 1
        if (a[col] > b[col]) return this.orderAsc ? 1 : -1
        return 0
      })
    }
    if (this.limitCount !== null) {
      list = list.slice(0, this.limitCount)
    }

    if (this.isSingle) {
      if (list.length === 0) return { data: null, count: 0, error: { message: 'Row not found' } }
      return { data: list[0], count: 1, error: null }
    }
    if (this.isMaybeSingle) {
      return { data: list[0] ?? null, count: list.length > 0 ? 1 : 0, error: null }
    }
    return { data: list, count: list.length, error: null }
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject)
  }

  async insert(rows: any | any[]) {
    const items = Array.isArray(rows) ? rows : [rows]
    const inserted = items.map(item => ({
      id: item.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: item.created_at || new Date().toISOString(),
      ...item
    }))
    mockDataStore[this.tableName].push(...inserted)
    return { data: Array.isArray(rows) ? inserted : inserted[0], error: null }
  }

  async update(updateData: any) {
    let list = mockDataStore[this.tableName] || []
    for (const filter of this.filters) {
      list = list.filter(filter)
    }
    list.forEach(item => Object.assign(item, updateData, { updated_at: new Date().toISOString() }))
    return { data: list, error: null }
  }

  async delete() {
    let itemsToDelete = mockDataStore[this.tableName] || []
    for (const filter of this.filters) {
      itemsToDelete = itemsToDelete.filter(filter)
    }
    mockDataStore[this.tableName] = mockDataStore[this.tableName].filter(
      item => !itemsToDelete.includes(item)
    )
    return { data: itemsToDelete, error: null }
  }
}

let currentMockUser: any = null
const authListeners = new Set<Function>()

const mockAuth = {
  async getSession() {
    return {
      data: {
        session: currentMockUser ? { user: currentMockUser } : null
      },
      error: null
    }
  },
  onAuthStateChange(callback: Function) {
    authListeners.add(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback)
        }
      }
    }
  },
  async signInWithPassword({ email }: { email: string }) {
    currentMockUser = { id: 'admin-1', email }
    authListeners.forEach(fn => fn('SIGNED_IN', { user: currentMockUser }))
    return { data: { user: currentMockUser }, error: null }
  },
  async signUp({ email }: { email: string }) {
    currentMockUser = { id: `user-${Date.now()}`, email }
    authListeners.forEach(fn => fn('SIGNED_IN', { user: currentMockUser }))
    return { data: { user: currentMockUser }, error: null }
  },
  async signOut() {
    currentMockUser = null
    authListeners.forEach(fn => fn('SIGNED_OUT', null))
    return { error: null }
  }
}

const mockStorage = {
  from(_bucket: string) {
    return {
      async upload(_path: string, _file: any) {
        return { data: { path: _path }, error: null }
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: `https://placeholder.co/upload/${path}` } }
      }
    }
  }
}

const mockSupabaseClient: any = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName)
  },
  auth: mockAuth,
  storage: mockStorage
}

let clientInstance: any = null

if (isValidUrl(rawUrl) && rawKey && typeof rawKey === 'string' && rawKey.trim().length > 0) {
  try {
    clientInstance = createClient(rawUrl!.trim(), rawKey.trim())
  } catch (err) {
    console.warn('Invalid Supabase configuration or URL, falling back to mock client:', err)
  }
}

export const supabase = clientInstance || mockSupabaseClient

export interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  created_at?: string
}

export interface HighlightItem {
  id: string
  category: string
  title: string
  subtitle: string
  description: string
  image: string
  badge: string
  stats: { label: string; value: string }[]
  features: string[]
  ctaText: string
  ctaLink: string
  created_at?: string
}

