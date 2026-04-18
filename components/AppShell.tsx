'use client'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'

const BackgroundCanvas = dynamic(() => import('@/components/BackgroundCanvas'), { ssr: false })
const Cursor          = dynamic(() => import('@/components/Cursor'),          { ssr: false })
const ScrollProgress  = dynamic(() => import('@/components/ScrollProgress'),  { ssr: false })
const Nav             = dynamic(() => import('@/components/Nav'),             { ssr: false })

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundCanvas />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <main style={{ paddingTop: '62px', minHeight: '100dvh' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
