import { defineNuxtPlugin, useRuntimeConfig, useCookie } from '#imports'
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig().public.supabase
    const { url, key, cookieName, cookieOptions, clientOptions } = config

    const supabaseClient = createClient(url, key, clientOptions)

    // Handle auth event client side
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        useCookie(`${cookieName}-access-token`, cookieOptions).value = session?.access_token
        useCookie(`${cookieName}-refresh-token`, cookieOptions).value = session?.refresh_token
      }
      if (event === 'SIGNED_OUT') {
        useCookie(`${cookieName}-access-token`, cookieOptions).value = null
        useCookie(`${cookieName}-refresh-token`, cookieOptions).value = null
      }
    })

    supabaseClient.auth.getSession()

    return {
      provide: {
        supabase: {
          client: supabaseClient,
        },
      },
    }
  },
})
