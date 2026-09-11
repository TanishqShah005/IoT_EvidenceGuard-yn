import { notFound } from 'next/navigation'
import ForensicsPage, { pageData } from '@/components/forensics-page'

export function generateStaticParams() {
  return Object.keys(pageData).map((section) => ({ section }))
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!pageData[section]) notFound()
  return <ForensicsPage slug={section} />
}
