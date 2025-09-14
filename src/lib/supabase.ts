import { createClient } from '@supabase/supabase-js'

// Read and sanitize env values
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

function isValidHttpUrl(value?: string | null): boolean {
	if (!value) return false
	try {
		const u = new URL(value)
		return u.protocol === 'http:' || u.protocol === 'https:'
	} catch {
		return false
	}
}

// Build a lightweight mock client so the app can still render without crashing
function createMockClient() {
	return {
		auth: {
			getSession: () => Promise.resolve({ data: { session: null }, error: null }),
			onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
			signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } as any }),
			signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } as any }),
			signOut: () => Promise.resolve({ error: null })
		},
		from: () => ({
			select: () => ({
				eq: () => Promise.resolve({ data: [], error: null }),
				order: () => Promise.resolve({ data: [], error: null }),
				single: () => Promise.resolve({ data: null, error: null })
			}),
			insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } as any }),
			update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } as any }),
			delete: () => Promise.resolve({ error: { message: 'Supabase not configured' } as any })
		}),
		channel: () => ({
			on: () => ({
				subscribe: () => ({ data: { subscription: { unsubscribe: () => {} } } })
			})
		})
	} as any
}

let supabase: any

if (!isValidHttpUrl(rawSupabaseUrl) || !rawSupabaseAnonKey) {
	console.warn('[Supabase] Invalid or missing env configuration. Using mock client.\n' +
		"- Ensure NEXT_PUBLIC_SUPABASE_URL looks like 'https://xxxx.supabase.co'\n" +
		'- Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set (JWT-like, starts with eyJ...)')
	supabase = createMockClient()
} else {
	// Safe to create real client
	supabase = createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true
		},
		realtime: {
			params: {
				eventsPerSecond: 10
			}
		}
	})
}

export { supabase }
export type SupabaseClient = typeof supabase
