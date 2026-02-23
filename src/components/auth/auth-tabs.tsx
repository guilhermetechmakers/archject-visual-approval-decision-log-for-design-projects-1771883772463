import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type AuthTabValue = 'login' | 'signup'

export interface AuthTabsProps {
  value: AuthTabValue
  onValueChange: (value: AuthTabValue) => void
  loginContent: React.ReactNode
  signupContent: React.ReactNode
  className?: string
}

export function AuthTabs({
  value,
  onValueChange,
  loginContent,
  signupContent,
  className,
}: AuthTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as AuthTabValue)}
      className={cn('w-full', className)}
    >
      <TabsList className="grid w-full grid-cols-2 rounded-pill bg-secondary p-1 h-11">
        <TabsTrigger
          value="login"
          className="rounded-pill data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
        >
          Log in
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          className="rounded-pill data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
        >
          Sign up
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="mt-6 animate-fade-in">
        {loginContent}
      </TabsContent>
      <TabsContent value="signup" className="mt-6 animate-fade-in">
        {signupContent}
      </TabsContent>
    </Tabs>
  )
}
