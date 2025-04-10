'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  BellRing, 
  Lock, 
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { toast } = useToast()
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promotions, setPromotions] = useState(false)
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Privacy settings
  const [savePaymentInfo, setSavePaymentInfo] = useState(true)
  const [saveOrderHistory, setSaveOrderHistory] = useState(true)
  const [allowTracking, setAllowTracking] = useState(false)
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Your new password and confirmation password must match.',
      })
      return
    }
    
    setChangingPassword(true)
    try {
      // API endpoint to change password will be implemented later
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: 'There was an error changing your password. Please try again.',
      })
    } finally {
      setChangingPassword(false)
    }
  }
  
  const handleNotificationSave = async () => {
    try {
      // API endpoint to save notification settings will be implemented later
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: 'Settings Updated',
        description: 'Your notification settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating your settings. Please try again.',
      })
    }
  }
  
  const handlePrivacySave = async () => {
    try {
      // API endpoint to save privacy settings will be implemented later
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: 'Privacy Settings Updated',
        description: 'Your privacy settings have been updated successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating your privacy settings. Please try again.',
      })
    }
  }
  
  const handleDeleteAccount = async () => {
    try {
      // API endpoint to delete account will be implemented later
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully.',
      })
      
      // Redirect to home page will be implemented later
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'There was an error deleting your account. Please try again.',
      })
    }
  }
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences and security settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock size={16} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about account activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-updates">Order Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your order status
                  </p>
                </div>
                <Switch
                  id="order-updates"
                  checked={orderUpdates}
                  onCheckedChange={setOrderUpdates}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions">Promotions and Offers</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about promotions, discounts and special offers
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={promotions}
                  onCheckedChange={setPromotions}
                />
              </div>
            </div>
            
            <Button onClick={handleNotificationSave}>
              Save Notification Settings
            </Button>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
              
              <div className="pt-6 border-t mt-6">
                <h3 className="text-lg font-medium mb-4">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all of your data. This action cannot be undone.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 size={16} />
                      <span>Delete Account</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all of your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-payment">Save Payment Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Save your payment information for future purchases
                  </p>
                </div>
                <Switch
                  id="save-payment"
                  checked={savePaymentInfo}
                  onCheckedChange={setSavePaymentInfo}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-order-history">Save Order History</Label>
                  <p className="text-sm text-muted-foreground">
                    Save your order history for future reference
                  </p>
                </div>
                <Switch
                  id="save-order-history"
                  checked={saveOrderHistory}
                  onCheckedChange={setSaveOrderHistory}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-tracking">Allow Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to track your activity to improve your shopping experience
                  </p>
                </div>
                <Switch
                  id="allow-tracking"
                  checked={allowTracking}
                  onCheckedChange={setAllowTracking}
                />
              </div>
            </div>
            
            <Button onClick={handlePrivacySave}>
              Save Privacy Settings
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 