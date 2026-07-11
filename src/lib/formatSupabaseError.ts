const invalidApiKeyPattern = /invalid api key|apikey|api key/i

export function formatSupabaseErrorMessage(message?: string | null) {
  if (!message) {
    return 'Could not load data. Please try again later.'
  }

  if (invalidApiKeyPattern.test(message)) {
    return 'Configuration error: Supabase credentials are invalid. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your project values.'
  }

  return message
}
