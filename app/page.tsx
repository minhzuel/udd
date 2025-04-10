import { Suspense } from 'react'
import { CategorySliderSection } from '@/components/home/CategorySliderSection'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
// All sections below use the same ProductCard component from @/components/product/ProductCard
// ensuring consistent product styling across the home page
import { OfferSection } from '@/components/home/OfferSection'
import { NewCollection } from '@/components/home/NewCollection'
import CollectedSection from '@/components/home/CollectedSection'
import { MobileSliders } from '@/components/home/MobileSliders'

// Loading component for sections
const SectionLoading = () => (
  <div className="py-12">
    <div className="container mx-auto px-4">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Mobile Sliders - shown only on mobile */}
      <div className="md:hidden">
        <Suspense fallback={<SectionLoading />}>
          <MobileSliders />
        </Suspense>
      </div>
      
      {/* CategorySliderSection - hidden on mobile */}
      <div className="hidden md:block">
        <Suspense fallback={<SectionLoading />}>
          <CategorySliderSection />
        </Suspense>
      </div>
      
      <Suspense fallback={<SectionLoading />}>
        <FeaturedCategories />
      </Suspense>
      <Suspense fallback={<SectionLoading />}>
        <OfferSection />
      </Suspense>
      <Suspense fallback={<SectionLoading />}>
        <NewCollection />
      </Suspense>
      <Suspense fallback={<SectionLoading />}>
        <CollectedSection />
      </Suspense>
    </main>
  )
}
