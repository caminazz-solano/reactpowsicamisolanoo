import { loadEnv } from 'vite'

const env = loadEnv('production', process.cwd(), '')
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? env.VITE_SUPABASE_PUBLISHABLE_KEY
const normalizedKey = publishableKey?.trim()

if (normalizedKey && !normalizedKey.startsWith('sb_publishable_')) {
  console.error(
    'Invalid VITE_SUPABASE_PUBLISHABLE_KEY: expected a key starting with "sb_publishable_".',
  )
  process.exitCode = 1
} else if (normalizedKey) {
  console.log('Supabase key format check passed.')
}
