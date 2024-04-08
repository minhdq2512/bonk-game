
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://qeigxqeyenjccewexmde.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaWd4cWV5ZW5qY2Nld2V4bWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyMDM2MjksImV4cCI6MjAyNzc3OTYyOX0.V6QbFW04hxsVLVATFVyRZpS68JQhb9nqoC1ZkW4s-14')

