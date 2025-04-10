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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Separator } from '@/components/ui/separator'
import { Facebook, Mail } from 'lucide-react'
import Image from 'next/image'

const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  rememberMe: z.boolean().default(false),
})

const mobileLoginSchema = z.object({
  mobile: z.string().min(10, {
    message: 'Please enter a valid mobile number.',
  }),
  otp: z.string().length(6, {
    message: 'OTP must be 6 digits.',
  }),
})

const usernameLoginSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  rememberMe: z.boolean().default(false),
})

type LoginValues = z.infer<typeof loginSchema>
type MobileLoginValues = z.infer<typeof mobileLoginSchema>
type UsernameLoginValues = z.infer<typeof usernameLoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const mobileForm = useForm<MobileLoginValues>({
    resolver: zodResolver(mobileLoginSchema),
    defaultValues: {
      mobile: '',
      otp: '',
    },
  })

  const usernameForm = useForm<UsernameLoginValues>({
    resolver: zodResolver(usernameLoginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginValues) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to login')
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully.',
      })

      router.push('/account')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onMobileSubmit(data: MobileLoginValues) {
    setIsLoading(true)
    try {
      if (!showOTP) {
        // Send OTP
        // For now, we'll just show the OTP input
        setShowOTP(true)
        toast({
          title: 'OTP Sent',
          description: 'Please enter the OTP sent to your mobile number.',
        })
      } else {
        // Call the login API with mobile and OTP
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to login')
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully.',
        })

        router.push('/account')
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onUsernameSubmit(data: UsernameLoginValues) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to login')
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully.',
      })

      router.push('/account')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Implement social login logic here
    toast({
      title: 'Coming Soon',
      description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be available soon.`,
    })
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Choose your preferred login method
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="username">Username</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="mobile">
            <Form {...mobileForm}>
              <form onSubmit={mobileForm.handleSubmit(onMobileSubmit)} className="space-y-4">
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : showOTP ? 'Verify OTP' : 'Send OTP'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="username">
            <Form {...usernameForm}>
              <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={usernameForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={usernameForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
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
            onClick={() => handleSocialLogin('google')}
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
            onClick={() => handleSocialLogin('facebook')}
            className="w-full"
          >
            <Facebook className="mr-2 h-5 w-5" />
            Facebook
          </Button>
        </div>

        <div className="flex flex-col space-y-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Forgot your password?
          </Link>
          <span>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="hover:text-primary">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
} 