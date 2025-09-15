import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://xnxvcofyvhifecmxeruk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueHZjb2Z5dmhpZmVjbXhlcnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MDA2ODQsImV4cCI6MjA3MjI3NjY4NH0.GSwPnbroXL1Z1fSCh-ObDl5CZZe4ZIp9eOXPA_svL5Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
