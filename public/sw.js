/* =========================================================
   NEXUS Service Worker — offline-first for spotty connectivity
   Version: v2
   ========================================================= */

const CACHE_NAME = 'nexus-v3'

/* Pages to precache on install — these work fully offline */
const PRECACHE_URLS = [
  '/',
  '/search',
  '/programs',
  '/rights',
  '/chw',
  '/crisis',
  '/triage',
  '/gps',
  '/passport',
  '/community',
  '/equity',
  '/editorial',
  '/open',
  '/manifest.json',
  '/offline',
]

/* ── Install: precache shell ──────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        /* If any precache URL fails (e.g. /offline not built yet), skip silently */
      })
    })
  )
  self.skipWaiting()
})

/* ── Activate: purge old caches ──────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

/* ── Fetch: stale-while-revalidate for pages, skip API ── */
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  /* Skip: non-GET, cross-origin, Supabase API, route handlers */
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/')) {
    /* Cache Next.js static chunks but don't block on them */
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        return cached || networkFetch
      })
    )
    return
  }

  /* For navigation requests: network-first, fall back to cache, then offline page */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(request).then(cached => {
            if (cached) return cached
            /* Last resort: return cached home page */
            return caches.match('/').then(home => home || new Response(
              `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NEXUS — Offline</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;background:#020409;color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px}
    h1{font-size:clamp(28px,5vw,42px);font-weight:800;margin-bottom:12px;letter-spacing:-0.03em}
    p{font-size:15px;color:rgba(255,255,255,0.5);max-width:360px;line-height:1.7;margin-bottom:28px}
    a{display:inline-block;background:#6EE7B7;color:#020409;padding:13px 28px;border-radius:100px;font-weight:700;font-size:14px;text-decoration:none}
    .dot{width:10px;height:10px;border-radius:50%;background:#F87171;display:inline-block;margin-right:6px;animation:blink 1.2s ease-in-out infinite}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  </style>
</head>
<body>
  <span style="font-size:13px;letter-spacing:0.45em;color:rgba(255,255,255,0.4);margin-bottom:48px">NEXUS</span>
  <h1>You're offline</h1>
  <p>Check your internet connection. Emergency numbers below work even without NEXUS.</p>
  <a href="tel:911">Call 911</a>
  <p style="margin-top:16px;font-size:12px">Crisis line: <a href="tel:988" style="background:none;color:#6EE7B7;padding:0;font-size:12px">988</a> · Poison Control: <a href="tel:18002221222" style="background:none;color:#6EE7B7;padding:0;font-size:12px">1-800-222-1222</a></p>
</body>
</html>`,
              { headers: { 'Content-Type': 'text/html' } }
            ))
          })
        )
    )
    return
  }

  /* Default: cache-first for static assets */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
    })
  )
})

/* ── Push notifications ──────────────────────────── */
self.addEventListener('push', event => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'NEXUS', body: event.data.text() } }

  const title   = data.title || 'NEXUS'
  const options = {
    body:    data.body    || 'You have a new notification.',
    icon:    data.icon    || '/icons/icon-192.png',
    badge:   '/icons/icon-192.png',
    tag:     data.tag     || 'nexus-notification',
    data:    { url: data.url || '/' },
    vibrate: [200, 100, 200],
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      /* If NEXUS is already open, focus that tab */
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url })
          return client.focus()
        }
      }
      /* Otherwise open a new tab */
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

/* ── Background sync: retry failed form submissions ─ */
self.addEventListener('sync', event => {
  if (event.tag === 'nexus-retry-submit') {
    event.waitUntil(
      caches.open('nexus-pending-forms').then(async cache => {
        const keys = await cache.keys()
        return Promise.all(keys.map(async req => {
          try {
            const res = await fetch(req)
            if (res.ok) await cache.delete(req)
          } catch { /* will retry on next sync */ }
        }))
      })
    )
  }
})
