const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
const listeners = new Set()
let pendingScroll = null

export function appPath(path = '/') {
  if (!path.startsWith('/')) return path
  if (path === '/') return `${basePath}/`
  return `${basePath}${path}`
}

function isWithinApp(pathname) {
  return !basePath || pathname === basePath || pathname.startsWith(`${basePath}/`)
}

export function currentAppPath() {
  const pathname = window.location.pathname
  const normalized = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname

  return normalized.replace(/\/+$/, '') || '/'
}

export function getLocationSnapshot() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeToLocation(listener) {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hashchange', notify)
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', notify)
    }
  }
}

function handlePopState() {
  pendingScroll = {
    hash: window.location.hash,
    restoreY: window.history.state?.scrollY,
  }
  notify()
}

export function navigate(to, { replace = false } = {}) {
  const nextUrl = new URL(to, window.location.href)
  if (nextUrl.origin !== window.location.origin || !isWithinApp(nextUrl.pathname)) {
    window.location.assign(nextUrl.href)
    return
  }

  const nextAddress = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  const currentAddress = getLocationSnapshot()
  if (nextAddress === currentAddress) {
    scrollToHash(nextUrl.hash)
    return
  }

  const currentState = window.history.state ?? {}
  window.history.replaceState({ ...currentState, scrollY: window.scrollY }, '')
  window.history[replace ? 'replaceState' : 'pushState'](
    { key: `${Date.now()}-${Math.random()}`, scrollY: 0 },
    '',
    nextAddress,
  )
  pendingScroll = { hash: nextUrl.hash }
  notify()
}

export function consumePendingScroll() {
  const scroll = pendingScroll
  pendingScroll = null
  return scroll
}

export function scrollToHash(hash) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  let id = hash.slice(1)
  try {
    id = decodeURIComponent(id)
  } catch {
    // Use the original fragment when it contains malformed percent-encoding.
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function shouldHandleAppLink(event, anchor) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
    || (anchor.target && anchor.target !== '_self')
    || anchor.hasAttribute('download')
  ) {
    return false
  }

  const destination = new URL(anchor.href, window.location.href)
  return destination.origin === window.location.origin && isWithinApp(destination.pathname)
}