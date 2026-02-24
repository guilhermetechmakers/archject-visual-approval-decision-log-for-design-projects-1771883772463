import { useState } from 'react'
import { UserPlus, Users, Mail, Shield, Activity, FolderKanban, Settings2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeams, useActivity, useSSOConfig, useInvite, useRemoveUser, useCreateRole, useUpdateRole } from '@/hooks/use-team'
import { toast } from 'sonner'
import {
  UserRowCard,
  InviteModal,
  RoleTemplateEditor,
  ActivitySummaryCard,
  SSOLockupPanel,
  PermissionsTable,
  BrandingPreviewCard,
  NotificationBanner,
  DataExportRow,
} from './index'

export function TeamDashboardPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(undefined)
  const [exportStatus, setExportStatus] = useState<'idle' | 'pending' | 'processing' | 'ready' | 'error'>('idle')
  const [exportProgress, setExportProgress] = useState(0)

  const { data, isLoading } = useTeams()
  const inviteMutation = useInvite()
  const removeUserMutation = useRemoveUser()
  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()

  const users = data?.users ?? []
  const invites = data?.invites ?? []
  const roles = data?.roles ?? []
  const projects = data?.projects ?? []
  const { data: activityData } = useActivity()
  const { data: ssoData } = useSSOConfig()
  const activity = activityData ?? []

  const handleInvite = async (values: { email: string; roleId: string; projectsScoped: string[]; message?: string; expiresAt?: string }) => {
    try {
      await inviteMutation.mutateAsync({
        email: values.email,
        roleId: values.roleId,
        projectsScoped: values.projectsScoped,
        message: values.message,
        expiresAt: values.expiresAt || undefined,
      })
      setNotification('Invite sent')
      toast.success('Invite sent successfully')
    } catch {
      toast.error('Failed to send invite')
    }
  }

  const handleRemoveUser = async (user: { id: string }) => {
    try {
      await removeUserMutation.mutateAsync(user.id)
      setNotification('Member removed')
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const handleEditRoles = (_user: { id: string }) => {
    toast.info('Edit roles — open role assignment modal in full implementation')
  }

  const handleSaveRole = async (roleId: string, permissions: Record<string, boolean>, name?: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        roleId,
        input: { permissions, ...(name && { name }) },
      })
      setNotification('Role updated globally')
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleCreateCustomRole = async (name: string, permissions: Record<string, boolean>) => {
    try {
      await createRoleMutation.mutateAsync({
        name,
        permissions,
        isCustom: true,
      })
      setNotification('Custom role created')
      toast.success('Custom role created')
      setSelectedRoleId(undefined)
    } catch {
      toast.error('Failed to create role')
    }
  }

  const handleConfigureSSO = () => {
    toast.info('SSO configuration — redirect to Enterprise Settings in full implementation')
  }

  const handleStartExport = () => {
    setExportStatus('pending')
    setExportProgress(0)
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 90) {
          clearInterval(interval)
          setExportStatus('ready')
          return 100
        }
        return p + 10
      })
    }, 300)
  }

  if (isLoading) {
    return <TeamDashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Team & users</h1>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </div>

      {notification && (
        <NotificationBanner
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="inline-flex h-11 w-full flex-wrap items-center justify-start gap-1 rounded-xl bg-secondary p-1 sm:w-auto">
          <TabsTrigger value="members" className="rounded-lg px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="invites" className="rounded-lg px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Mail className="mr-2 h-4 w-4" />
            Invites
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings2 className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="rounded-lg px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Enterprise
          </TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Workspace members
              </CardTitle>
              <CardDescription>
                Manage who has access to your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <UserRowCard
                    key={user.id}
                    user={user}
                    roles={roles}
                    projects={projects}
                    onEditRoles={handleEditRoles}
                    onRemove={handleRemoveUser}
                  />
                ))}
                {users.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="font-medium">No team members yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Invite your first team member to get started
                    </p>
                    <Button className="mt-4" onClick={() => setInviteOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite member
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending invites</CardTitle>
              <CardDescription>
                Invites awaiting response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invites.filter((i) => i.status === 'pending').map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">{inv.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-md bg-warning/30 px-2.5 py-1 text-sm font-medium">
                      Pending
                    </span>
                  </div>
                ))}
                {invites.filter((i) => i.status === 'pending').length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No pending invites
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RoleTemplateEditor
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelectRole={setSelectedRoleId}
            onSave={handleSaveRole}
            onCreateCustom={handleCreateCustomRole}
          />
          <PermissionsTable roles={roles} className="mt-8" />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivitySummaryCard
            invites={invites}
            activity={activity.length > 0 ? activity : invites.map((i) => ({
              id: i.id,
              userId: i.invitedBy,
              action: 'invite_sent',
              targetId: i.id,
              timestamp: i.sentAt,
              details: { email: i.email },
            }))}
            invitesSent={invites.length}
            pendingInvites={invites.filter((i) => i.status === 'pending').length}
            recentlyAdded={0}
          />
        </TabsContent>

        <TabsContent value="enterprise" className="mt-6 space-y-6">
          <SSOLockupPanel
            config={ssoData ?? { id: 'sso1', enabled: false }}
            onConfigure={handleConfigureSSO}
          />
          <DataExportRow
            status={exportStatus}
            progress={exportProgress}
            onStartExport={handleStartExport}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <BrandingPreviewCard
                key={project.id}
                project={project}
                branding={project.branding}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={roles}
        projects={projects}
        onSubmit={handleInvite}
        isSubmitting={inviteMutation.isPending}
      />
    </div>
  )
}

function TeamDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
