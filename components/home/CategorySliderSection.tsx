import { CategoriesServer } from './CategoriesServer'
import { SliderClient } from './SliderClient'

export function CategorySliderSection() {
  return (
    <section className="pt-6 pb-3">
      <div className="container mx-auto px-4">
        <div className="flex gap-4">
          {/* Categories Menu - 18% width */}
          <div className="w-[18%] shrink-0">
            <CategoriesServer />
          </div>

          {/* Slider - 82% width */}
          <div className="w-[82%] shrink-0">
            <SliderClient />
          </div>
        </div>
      </div>
    </section>
  )
} 