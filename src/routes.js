const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

export function appPath(path = '/') {
  if (!path.startsWith('/')) return path
  if (path === '/') return `${basePath}/`
  return `${basePath}${path}`
}

export function currentAppPath() {
  const pathname = window.location.pathname
  const normalized = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname

  return normalized.replace(/\/+$/, '') || '/'
}
