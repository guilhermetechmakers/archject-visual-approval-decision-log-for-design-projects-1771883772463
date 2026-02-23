import { Users, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const mockTeam = [
  { id: '1', name: 'Jane Smith', email: 'jane@studio.com', role: 'Admin' },
  { id: '2', name: 'John Doe', email: 'john@studio.com', role: 'Project Lead' },
  { id: '3', name: 'Alice Brown', email: 'alice@studio.com', role: 'Coordinator' },
]

export function TeamPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Team & users</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workspace members
          </CardTitle>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Manage who has access to your workspace
          </CardContent>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeam.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <span className="rounded-md bg-secondary px-2.5 py-1 text-sm font-medium">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
