import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js'

const AuthContext = createContext(null)
let anonymousSignInPromise

function getOrCreateAnonymousSession(client) {
  if (!anonymousSignInPromise) {
    anonymousSignInPromise = client.auth.signInAnonymously({
      options: { data: { account_type: 'owner', name: '' } },
    }).finally(() => {
      anonymousSignInPromise = undefined
    })
  }
  return anonymousSignInPromise
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [account, setAccount] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [accountLoading, setAccountLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true
    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        setAuthError('')
      }
    })

    client.auth.getSession()
      .then(async ({ data, error }) => {
        if (error) throw error
        if (data.session) {
          if (active) setSession(data.session)
          return
        }

        const { data: anonymousData, error: anonymousError } = await getOrCreateAnonymousSession(client)
        if (anonymousError) throw anonymousError
        if (active) setSession(anonymousData.session)
      })
      .catch((error) => {
        if (active) setAuthError(error.message)
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setAccount(null)
      setAccountLoading(false)
      return undefined
    }

    let active = true
    const client = getSupabaseClient()
    setAccountLoading(true)
    setAuthError('')

    Promise.all([
      client.from('owner_accounts').select('id, name').eq('id', session.user.id).maybeSingle(),
      client.from('veterinarian_accounts').select('id, name').eq('id', session.user.id).maybeSingle(),
    ])
      .then(([ownerResult, veterinarianResult]) => {
        if (ownerResult.error) throw ownerResult.error
        if (veterinarianResult.error) throw veterinarianResult.error
        if (active) {
          setAccount({
            ownerAccount: ownerResult.data,
            veterinarianAccount: veterinarianResult.data,
          })
        }
      })
      .catch((error) => {
        if (active) {
          setAccount(null)
          setAuthError(error.message)
        }
      })
      .finally(() => {
        if (active) setAccountLoading(false)
      })

    return () => {
      active = false
    }
  }, [session])

  const value = useMemo(() => ({
    configured: isSupabaseConfigured,
    user: session?.user ?? null,
    account,
    loading: authLoading || accountLoading,
    error: authError,
  }), [session, account, authLoading, accountLoading, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
