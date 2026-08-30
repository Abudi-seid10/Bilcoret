import { supabase } from './supabaseClient'
import type { FAQItem, HighlightItem } from './supabaseClient'
import { defaultFAQs, defaultHighlights } from '../data/defaultContent'

const FAQS_STORAGE_KEY = 'bilcor_faqs_data'
const HIGHLIGHTS_STORAGE_KEY = 'bilcor_highlights_data'

// Helper to get FAQs
export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const { data, error } = await supabase.from('faqs').select('*').order('id', { ascending: true })
    if (!error && data && data.length > 0) {
      localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(data))
      return data
    }
  } catch (err) {
    console.warn('Supabase faqs fetch error, falling back to local storage', err)
  }

  // Fallback to local storage or defaults
  const saved = localStorage.getItem(FAQS_STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
      // ignore
    }
  }

  // Initialize local storage with default
  localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(defaultFAQs))
  return defaultFAQs
}

// Helper to save/add/update FAQ
export async function saveFAQ(faq: FAQItem): Promise<FAQItem[]> {
  const current = await getFAQs()
  const existsIndex = current.findIndex(f => f.id === faq.id)
  let updated: FAQItem[] = []

  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = faq
  } else {
    updated = [faq, ...current]
  }

  localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(updated))

  try {
    await supabase.from('faqs').upsert([faq])
  } catch (err) {
    console.warn('Supabase faqs upsert failed', err)
  }

  return updated
}

// Helper to delete FAQ
export async function deleteFAQ(id: string): Promise<FAQItem[]> {
  const current = await getFAQs()
  const updated = current.filter(f => f.id !== id)
  localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(updated))

  try {
    await supabase.from('faqs').delete().eq('id', id)
  } catch (err) {
    console.warn('Supabase faqs delete failed', err)
  }

  return updated
}

// Helper to get Highlights
export async function getHighlights(): Promise<HighlightItem[]> {
  try {
    const { data, error } = await supabase.from('highlights').select('*').order('id', { ascending: true })
    if (!error && data && data.length > 0) {
      localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(data))
      return data
    }
  } catch (err) {
    console.warn('Supabase highlights fetch error, falling back to local storage', err)
  }

  // Fallback to local storage or defaults
  const saved = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
      // ignore
    }
  }

  // Initialize local storage with default
  localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(defaultHighlights))
  return defaultHighlights
}

// Helper to save/add/update Highlight
export async function saveHighlight(item: HighlightItem): Promise<HighlightItem[]> {
  const current = await getHighlights()
  const existsIndex = current.findIndex(h => h.id === item.id)
  let updated: HighlightItem[] = []

  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = item
  } else {
    updated = [item, ...current]
  }

  localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(updated))

  try {
    await supabase.from('highlights').upsert([item])
  } catch (err) {
    console.warn('Supabase highlights upsert failed', err)
  }

  return updated
}

// Helper to delete Highlight
export async function deleteHighlight(id: string): Promise<HighlightItem[]> {
  const current = await getHighlights()
  const updated = current.filter(h => h.id !== id)
  localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(updated))

  try {
    await supabase.from('highlights').delete().eq('id', id)
  } catch (err) {
    console.warn('Supabase highlights delete failed', err)
  }

  return updated
}
