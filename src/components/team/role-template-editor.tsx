import { useState } from 'react'
import { Save, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { PERMISSION_DOMAINS } from '@/types/team'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/team'

export const NEW_ROLE_ID = '__new__'

export interface RoleTemplateEditorProps {
  roles: Role[]
  selectedRoleId?: string
  onSelectRole: (roleId: string) => void
  onSave: (roleId: string, permissions: Record<string, boolean>, name?: string) => Promise<void>
  onCreateCustom: (name: string, permissions: Record<string, boolean>) => Promise<void>
  className?: string
}

export function RoleTemplateEditor({
  roles,
  selectedRoleId,
  onSelectRole,
  onSave,
  onCreateCustom,
  className,
}: RoleTemplateEditorProps) {
  const [editingPermissions, setEditingPermissions] = useState<Record<string, boolean>>({})
  const [newRoleName, setNewRoleName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showNewRole, setShowNewRole] = useState(false)

  const selectedRole = selectedRoleId && selectedRoleId !== NEW_ROLE_ID
    ? roles.find((r) => r.id === selectedRoleId)
    : undefined
  const permissions = selectedRole
    ? { ...selectedRole.permissions, ...editingPermissions }
    : editingPermissions

  const handleSelectRole = (id: string) => {
    const r = roles.find((x) => x.id === id)
    if (r) {
      const perms: Record<string, boolean> = {}
      for (const [k, v] of Object.entries(r.permissions)) {
        if (v !== undefined) perms[k] = !!v
      }
      setEditingPermissions(perms)
      onSelectRole(id)
      setShowNewRole(false)
    }
  }

  const togglePermission = (key: string) => {
    setEditingPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    if (!selectedRoleId) return
    setIsSaving(true)
    try {
      const merged: Record<string, boolean> = {}
      for (const [k, v] of Object.entries({ ...(selectedRole?.permissions ?? {}), ...editingPermissions })) {
        if (v !== undefined) merged[k] = !!v
      }
      await onSave(selectedRoleId, merged)
      setEditingPermissions({})
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCustom = async () => {
    if (!newRoleName.trim()) return
    setIsSaving(true)
    try {
      const perms: Record<string, boolean> = {}
      for (const [k, v] of Object.entries(editingPermissions)) {
        perms[k] = !!v
      }
      await onCreateCustom(newRoleName.trim(), perms)
      setNewRoleName('')
      setShowNewRole(false)
      setEditingPermissions({})
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[280px_1fr]', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Role templates</CardTitle>
          <CardDescription>Select a role to edit permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRole(r.id)}
              className={cn(
                'w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-all',
                selectedRoleId === r.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-secondary/50'
              )}
            >
              {r.name}
              {r.isCustom && (
                <span className="ml-2 text-xs text-muted-foreground">(custom)</span>
              )}
            </button>
          ))}
          {showNewRole ? (
            <div className="space-y-2 pt-2">
              <Input
                placeholder="Custom role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCustom} disabled={isSaving || !newRoleName.trim()}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewRole(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowNewRole(true)
                setEditingPermissions({})
                onSelectRole(NEW_ROLE_ID)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New custom role
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{selectedRole?.name ?? 'New custom role'}</CardTitle>
            <CardDescription>
              Toggle permissions by domain. Changes apply to all users with this role.
            </CardDescription>
          </div>
          {(selectedRoleId === NEW_ROLE_ID || (selectedRoleId && selectedRoleId !== NEW_ROLE_ID)) && (
            <Button
              onClick={showNewRole || selectedRoleId === NEW_ROLE_ID ? handleCreateCustom : handleSave}
              disabled={isSaving || (selectedRoleId === NEW_ROLE_ID && !newRoleName.trim())}
            >
              <Save className="mr-2 h-4 w-4" />
              {showNewRole ? 'Create role' : 'Save changes'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {PERMISSION_DOMAINS.map((domain) => (
              <div key={domain.key}>
                <h4 className="mb-3 text-sm font-semibold">{domain.label}</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {domain.permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-secondary/50"
                    >
                      <Checkbox
                        checked={permissions[perm] ?? false}
                        onCheckedChange={() => togglePermission(perm)}
                      />
                      <span className="text-sm capitalize">
                        {perm.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
