import type { RdapResult } from './rdap'

const STORAGE_KEY = 'subnet-fit-rdap-cache'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_ENTRIES = 100

interface CacheEntry {
  data: RdapResult
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry>()

function loadFromStorage(): Map<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>
    return new Map(Object.entries(parsed))
  } catch {
    return new Map()
  }
}

function saveToStorage(cache: Map<string, CacheEntry>): void {
  try {
    const obj = Object.fromEntries(cache)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch {
    // localStorage unavailable (private browsing) — silently ignore
  }
}

function evictOldest(cache: Map<string, CacheEntry>): void {
  if (cache.size <= MAX_ENTRIES) return

  const entries = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
  const toRemove = entries.slice(0, cache.size - MAX_ENTRIES)
  for (const [key] of toRemove) {
    cache.delete(key)
  }
}

function initMemoryCache(): void {
  if (memoryCache.size > 0) return
  const stored = loadFromStorage()
  const now = Date.now()
  for (const [key, entry] of stored) {
    if (now - entry.timestamp < TTL_MS) {
      memoryCache.set(key, entry)
    }
  }
}

export function getCachedResult(networkAddress: string): RdapResult | null {
  initMemoryCache()
  const entry = memoryCache.get(networkAddress)
  if (!entry) return null

  if (Date.now() - entry.timestamp >= TTL_MS) {
    memoryCache.delete(networkAddress)
    return null
  }

  return entry.data
}

export function setCachedResult(networkAddress: string, data: RdapResult): void {
  initMemoryCache()
  const entry: CacheEntry = { data, timestamp: Date.now() }
  memoryCache.set(networkAddress, entry)
  evictOldest(memoryCache)
  saveToStorage(memoryCache)
}

export function clearCacheEntry(networkAddress: string): void {
  initMemoryCache()
  memoryCache.delete(networkAddress)
  saveToStorage(memoryCache)
}
