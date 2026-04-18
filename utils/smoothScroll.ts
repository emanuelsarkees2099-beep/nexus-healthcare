export function smoothScrollTo(el: HTMLElement | null, offset = 80) {
  if (!el) return
  const start = window.scrollY
  const target = el.getBoundingClientRect().top + window.scrollY - offset
  const distance = target - start
  if (Math.abs(distance) < 5) return
  const duration = 900
  let startTime: number | null = null
  function ease(t: number) { return t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2 }
  function step(ts: number) {
    if (!startTime) startTime = ts
    const p = Math.min((ts - startTime) / duration, 1)
    window.scrollTo(0, start + distance * ease(p))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}