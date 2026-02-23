import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const demoRequestSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
})

type DemoRequestForm = z.infer<typeof demoRequestSchema>

export interface DemoRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoRequestModal({ open, onOpenChange }: DemoRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DemoRequestForm>({
    resolver: zodResolver(demoRequestSchema),
  })

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      toast.success('Demo request received! We\'ll be in touch soon.')
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle>Request a demo</DialogTitle>
          <DialogDescription>
            Schedule a personalized walkthrough of Archject. We&apos;ll reach out
            within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-name">Name</Label>
            <Input
              id="demo-name"
              placeholder="Jane Smith"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="jane@studio.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-company">Company (optional)</Label>
            <Input
              id="demo-company"
              placeholder="Studio Name"
              {...register('company')}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Request demo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
