import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { supabase } from '../../lib/supabaseClient'

export default function Layout() {
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('logo_url, favicon_url')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
      .then(({ data }) => {
        if (data?.favicon_url) {
          let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = data.favicon_url
        }
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white text-bilcor-charcoal" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
