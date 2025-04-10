import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  RiWhatsappLine, 
  RiMessengerLine, 
  RiMailLine, 
  RiMessage2Line,
  RiSendPlaneLine,
  RiCloseLine,
  RiArrowLeftLine
} from '@remixicon/react'
import { toast } from 'sonner'

interface ShareProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    price: number
    image: string
    url: string
  }
}

type ShareMethod = 'whatsapp' | 'messenger' | 'sms' | 'imo' | 'email' | null

export function ShareProductModal({ isOpen, onClose, product }: ShareProductModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<ShareMethod>(null)
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    message: `Hi, I would like to request this product: ${product.name}`
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleShare = () => {
    const { recipientName, recipientPhone, recipientEmail, message } = formData
    let shareUrl = ''

    switch (selectedMethod) {
      case 'whatsapp':
        if (!recipientPhone) {
          toast.error('Please enter recipient phone number')
          return
        }
        shareUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(message)}`
        break
      case 'messenger':
        shareUrl = `https://www.facebook.com/messages/compose?link=${encodeURIComponent(product.url)}&app_id=YOUR_FB_APP_ID`
        break
      case 'sms':
        if (!recipientPhone) {
          toast.error('Please enter recipient phone number')
          return
        }
        shareUrl = `sms:${recipientPhone}&body=${encodeURIComponent(message)}`
        break
      case 'email':
        if (!recipientEmail) {
          toast.error('Please enter recipient email')
          return
        }
        shareUrl = `mailto:${recipientEmail}?subject=Product Request: ${product.name}&body=${encodeURIComponent(message)}`
        break
      case 'imo':
        if (!recipientPhone) {
          toast.error('Please enter recipient phone number')
          return
        }
        shareUrl = `imo://share?text=${encodeURIComponent(message)}&phone=${recipientPhone}`
        break
    }

    window.open(shareUrl, '_blank')
  }

  const renderMethodFields = () => {
    switch (selectedMethod) {
      case 'whatsapp':
      case 'sms':
      case 'imo':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                placeholder="Enter recipient name"
                value={formData.recipientName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientPhone">Phone Number</Label>
              <Input
                id="recipientPhone"
                name="recipientPhone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.recipientPhone}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        )
      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                placeholder="Enter recipient name"
                value={formData.recipientName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Email Address</Label>
              <Input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                placeholder="Enter email address"
                value={formData.recipientEmail}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        )
      case 'messenger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedMethod && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMethod(null)}
                className="h-8 w-8"
              >
                <RiArrowLeftLine className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {selectedMethod ? `Share via ${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}` : 'Share Product'}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedMethod ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('whatsapp')}
              >
                <RiWhatsappLine className="h-5 w-5 text-green-500" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('messenger')}
              >
                <RiMessengerLine className="h-5 w-5 text-blue-500" />
                Messenger
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('sms')}
              >
                <RiMessage2Line className="h-5 w-5 text-blue-600" />
                SMS
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('imo')}
              >
                <RiSendPlaneLine className="h-5 w-5 text-purple-500" />
                IMO
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSelectedMethod('email')}
              >
                <RiMailLine className="h-5 w-5 text-red-500" />
                Email
              </Button>
            </div>
          ) : (
            <>
              {renderMethodFields()}
              <Button onClick={handleShare} className="w-full">
                Share
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 