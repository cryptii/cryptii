
/* globals self, caches, fetch, CRYPTII_VERSION */

const version = CRYPTII_VERSION
const cachePrefix = 'cryptii'
const appCacheName = `${cachePrefix}-dist-${version}`
const fontCacheName = `${cachePrefix}-fonts`
const expectedCacheNames = [appCacheName, fontCacheName]

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(appCacheName)
    await cache.addAll([
      '/',
      `./cryptii.js?v=${version}`,
      `../style/cryptii.css?v=${version}`
    ])

    // Immediately replace the currently active service worker
    self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Remove caches beginning with a prefix that are no longer in use
    for (const cacheName of await caches.keys()) {
      if (cacheName.startsWith(cachePrefix) &&
          !expectedCacheNames.includes(cacheName)) {
        await caches.delete(cacheName)
      }
    }
  })())
})

self.addEventListener('fetch', async event => {
  // Handle font requests separately
  if (event.request.url.match(/\.woff2?$/) !== null) {
    event.respondWith(handleFontRequest(event.request))
    return
  }

  // Respond from cache or fetch via network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request)))
})

async function handleFontRequest (request) {
  const match = await caches.match(request)
  if (match) {
    return match
  }

  const [response, fontCache] = await Promise.all([
    fetch(request),
    caches.open(fontCacheName)
  ])

  // Cache font assets
  fontCache.put(request, response.clone())
  return response
}
