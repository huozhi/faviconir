import Faviconir from '@/components/faviconir'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faviconir - Generate Custom Favicons',
  description: 'Create unique favicons with customizable shapes, colors, and backgrounds.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Faviconir />
    </main>
  )
}

