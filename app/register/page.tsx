'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Separator } from '@/components/ui/separator'
import { Facebook } from 'lucide-react'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)

  const emailRegisterSchema = z
    .object({
      name: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters.' })
        .max(50, { message: 'Name must not exceed 50 characters.' }),
      email: z.string().email({
        message: 'Please enter a valid email address.',
      }),
      mobile: z.string().min(10, {
        message: 'Please enter a valid mobile number.',
      }),
      otp: z.string().optional(),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    })
    .refine((data) => {
      if (showOTP) {
        return data.otp?.length === 6
      }
      return true
    }, {
      message: 'OTP must be 6 digits.',
      path: ['otp'],
    })

  const mobileRegisterSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(50, { message: 'Name must not exceed 50 characters.' }),
    mobile: z.string().min(10, {
      message: 'Please enter a valid mobile number.',
    }),
    otp: z.string().optional(),
  }).refine((data) => {
    if (showOTP) {
      return data.otp?.length === 6
    }
    return true
  }, {
    message: 'OTP must be 6 digits.',
    path: ['otp'],
  })

  type EmailRegisterValues = z.infer<typeof emailRegisterSchema>
  type MobileRegisterValues = z.infer<typeof mobileRegisterSchema>

  const emailForm = useForm<EmailRegisterValues>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  })

  const mobileForm = useForm<MobileRegisterValues>({
    resolver: zodResolver(mobileRegisterSchema),
    defaultValues: {
      name: '',
      mobile: '',
      otp: '',
    },
  })

  const handleSendOTP = async (mobile: string) => {
    setIsLoading(true)
    try {
      // Here you would typically make an API call to send OTP
      setShowOTP(true)
      toast({
        title: 'OTP Sent',
        description: 'Please enter the OTP sent to your mobile number.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send OTP',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    if (otp === '123456') {
      return true
    }
    throw new Error('Invalid OTP')
  }

  async function onEmailSubmit(data: EmailRegisterValues) {
    setIsLoading(true)
    try {
      if (!showOTP) {
        // First validate email and password
        if (!data.email || !data.password || !data.confirmPassword) {
          throw new Error('Please fill in all required fields')
        }
        // Send OTP and show OTP field immediately
        setShowOTP(true)
        toast({
          title: 'OTP Sent',
          description: 'Please enter the OTP sent to your mobile number.',
        })
      } else {
        if (!data.otp) {
          throw new Error('Please enter the OTP')
        }
        const isValidOTP = await handleVerifyOTP(data.otp)
        if (isValidOTP) {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              email: data.email,
              mobile: data.mobile,
              password: data.password,
              registrationType: 'email',
              otp: data.otp,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            if (result.errors) {
              // Handle validation errors
              const errorMessages = result.errors.map((err: any) => err.message).join(', ')
              throw new Error(errorMessages)
            }
            throw new Error(result.message || 'Failed to register')
          }

          toast({
            title: 'Success',
            description: 'Registration successful. Please check your email to verify your account.',
          })

          router.push('/login')
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onMobileSubmit(data: MobileRegisterValues) {
    setIsLoading(true)
    try {
      if (!showOTP) {
        // Send OTP and show OTP field immediately
        setShowOTP(true)
        toast({
          title: 'OTP Sent',
          description: 'Please enter the OTP sent to your mobile number.',
        })
      } else {
        if (!data.otp) {
          throw new Error('Please enter the OTP')
        }
        const isValidOTP = await handleVerifyOTP(data.otp)
        if (isValidOTP) {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              mobile: data.mobile,
              registrationType: 'mobile',
              otp: data.otp,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            if (result.errors) {
              // Handle validation errors
              const errorMessages = result.errors.map((err: any) => err.message).join(', ')
              throw new Error(errorMessages)
            }
            throw new Error(result.message || 'Failed to register')
          }

          toast({
            title: 'Success',
            description: 'Registration successful. You can now login with your mobile number.',
          })

          router.push('/login')
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialRegister = (provider: 'google' | 'facebook') => {
    // Implement social registration logic here
    toast({
      title: 'Coming Soon',
      description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} registration will be available soon.`,
    })
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Choose your preferred registration method
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                          disabled={showOTP}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={showOTP} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={showOTP} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your mobile number"
                          {...field}
                          disabled={showOTP}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showOTP && (
                  <FormField
                    control={emailForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            {...field}
                            maxLength={6}
                            pattern="[0-9]*"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : showOTP ? 'Register Now' : 'Send OTP'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="mobile">
            <Form {...mobileForm}>
              <form onSubmit={mobileForm.handleSubmit(onMobileSubmit)} className="space-y-4">
                <FormField
                  control={mobileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={mobileForm.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your mobile number"
                          {...field}
                          disabled={showOTP}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showOTP && (
                  <FormField
                    control={mobileForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            {...field}
                            maxLength={6}
                            pattern="[0-9]*"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : showOTP ? 'Register Now' : 'Send OTP'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleSocialRegister('google')}
            className="w-full"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialRegister('facebook')}
            className="w-full"
          >
            <Facebook className="mr-2 h-5 w-5" />
            Facebook
          </Button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 