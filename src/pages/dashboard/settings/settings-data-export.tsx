import { DataExportCard } from '@/components/settings'

export function SettingsDataExport() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data export</h1>
        <p className="mt-1 text-muted-foreground">
          Export requests and retention policies
        </p>
      </div>
      <DataExportCard />
    </div>
  )
}
