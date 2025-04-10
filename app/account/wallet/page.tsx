'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface WalletTransaction {
  id: number
  date: string
  amount: number
  type: 'CREDIT' | 'DEBIT'
  description: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
}

export default function WalletPage() {
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true)
        // API endpoint to fetch wallet data will be implemented later
        // For now, just simulate loading
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const handleAddMoney = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
      })
      return
    }

    setSubmitting(true)
    try {
      // API endpoint to add money will be implemented later
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsAddMoneyOpen(false)
      setAmount('')
      
      toast({
        title: 'Money Added',
        description: `$${parseFloat(amount).toFixed(2)} has been added to your wallet.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction Failed',
        description: 'There was an error adding money to your wallet. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-36" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wallet</CardTitle>
        <CardDescription>Manage your wallet balance and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 border rounded-lg bg-primary/5">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <h3 className="text-3xl font-bold">
                {balance !== null ? formatAmount(balance) : '$0.00'}
              </h3>
            </div>
            <Button onClick={() => setIsAddMoneyOpen(true)} className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Money</span>
            </Button>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Recent Transactions</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-6 border rounded-lg">
                <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No transactions found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'CREDIT' ? 
                          <ArrowDownLeft className="h-4 w-4 text-green-600" /> : 
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </span>
                      <Badge 
                        variant={
                          transaction.status === 'COMPLETED' ? 'default' : 
                          transaction.status === 'PENDING' ? 'outline' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMoneyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMoney} disabled={submitting}>
              {submitting ? 'Processing...' : 'Add Money'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 