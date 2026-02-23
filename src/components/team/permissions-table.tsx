import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/team'
import { PERMISSION_DOMAINS } from '@/types/team'

export interface PermissionsTableProps {
  roles: Role[]
  className?: string
}

export function PermissionsTable({ roles, className }: PermissionsTableProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'permissions'>('name')

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    const countA = Object.values(a.permissions).filter(Boolean).length
    const countB = Object.values(b.permissions).filter(Boolean).length
    return countB - countA
  })

  const allPermissions = PERMISSION_DOMAINS.flatMap((d) => d.permissions)

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Permission scopes</CardTitle>
            <p className="text-sm text-muted-foreground">
              View permissions per role
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[600px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-4 text-left text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => setSortBy('name')}
                      className={cn(
                        'hover:text-primary',
                        sortBy === 'name' && 'text-primary'
                      )}
                    >
                      Role
                    </button>
                  </th>
                  {allPermissions.slice(0, 8).map((perm) => (
                    <th
                      key={perm}
                      className="pb-3 px-2 text-center text-xs font-medium text-muted-foreground"
                    >
                      {perm.replace(/_/g, ' ').slice(0, 12)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRoles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </td>
                    {allPermissions.slice(0, 8).map((perm) => (
                      <td key={perm} className="px-2 py-3 text-center">
                        {role.permissions[perm] ? (
                          <span className="text-success">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {sortedRoles.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No roles match your search
          </p>
        )}
      </CardContent>
    </Card>
  )
}
