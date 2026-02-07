import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { parseRdapResponse, type RdapLookupState } from '@/lib/rdap'
import { getCachedResult, setCachedResult } from '@/lib/rdap-cache'

const DEBOUNCE_MS = 500
const TIMEOUT_MS = 10000

export function useRdapLookup(networkAddress: string | null, rfcType: string | null): RdapLookupState {
  const [fetchResult, setFetchResult] = useState<{ address: string; state: RdapLookupState } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute synchronous states without triggering effects
  const syncState = useMemo((): RdapLookupState | null => {
    if (rfcType !== null) return { status: 'private' }
    if (!networkAddress) return { status: 'idle' }
    const cached = getCachedResult(networkAddress)
    if (cached) return { status: 'success', data: cached }
    return null // needs async fetch
  }, [networkAddress, rfcType])

  const needsFetch = syncState === null && networkAddress !== null

  const cleanup = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  useEffect(() => {
    cleanup()

    if (!needsFetch) return

    const address = networkAddress!

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController()
      abortRef.current = controller

      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
      const queryUrl = `https://rdap.org/ip/${address}`

      fetch(queryUrl, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404) throw new Error('No RDAP record found for this address')
            if (res.status === 429) throw new Error('Rate limited — please try again shortly')
            throw new Error(`RDAP lookup failed (HTTP ${res.status})`)
          }
          return res.json()
        })
        .then((json) => {
          clearTimeout(timeoutId)
          if (controller.signal.aborted) return
          const result = parseRdapResponse(json as Record<string, unknown>, queryUrl)
          setCachedResult(address, result)
          setFetchResult({ address, state: { status: 'success', data: result } })
        })
        .catch((err: Error) => {
          clearTimeout(timeoutId)
          if (controller.signal.aborted && err.name === 'AbortError') return
          let message: string
          if (err.name === 'AbortError') {
            message = 'Request timed out — try again'
          } else if (err.message.startsWith('No RDAP') || err.message.startsWith('Rate limited') || err.message.startsWith('RDAP lookup')) {
            message = err.message
          } else {
            message = 'Network error — check your connection'
          }
          setFetchResult({ address, state: { status: 'error', message } })
        })
    }, DEBOUNCE_MS)

    return cleanup
  }, [networkAddress, needsFetch, cleanup])

  // Return sync state if available, otherwise check if fetch result matches current address
  if (syncState !== null) return syncState
  if (fetchResult && fetchResult.address === networkAddress) return fetchResult.state
  return { status: 'loading' }
}
