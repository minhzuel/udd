import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  price: number
  beforeDiscount?: number | null
  thumbnail?: string | null
  productImage?: Array<{ url: string }> | null
  slug?: string
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  beforeDiscount, 
  thumbnail, 
  productImage,
  slug 
}: ProductCardProps) {
  const imageUrl = thumbnail || 
                  (productImage && productImage.length > 0 ? productImage[0].url : '/images/placeholder.png')
  
  const discount = beforeDiscount ? Math.round(((beforeDiscount - price) / beforeDiscount) * 100) : 0

  return (
    <Link href={`/product/${id}`} className="group">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">{name}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{formatPrice(price)}</p>
          {beforeDiscount && beforeDiscount > price && (
            <>
              <p className="text-xs text-gray-500 line-through">{formatPrice(beforeDiscount)}</p>
              <p className="text-xs font-semibold text-red-600">-{discount}%</p>
            </>
          )}
        </div>
      </div>
    </Link>
  )
} 