export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
        <p className="text-muted-foreground">Install, upgrade, and manage platform modules.</p>
      </div>

      <div className="rounded-lg border border-border">
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            No modules installed yet. Register modules via the kernel API.
          </p>
        </div>
      </div>
    </div>
  );
}
