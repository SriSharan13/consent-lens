import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

        if (session?.user) {
            // Ensure profile exists
            await supabase.from('profiles').upsert({
                id: session.user.id,
                full_name: session.user.user_metadata.full_name,
                avatar_url: session.user.user_metadata.avatar_url,
                updated_at: new Date().toISOString(),
            })
        }
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
