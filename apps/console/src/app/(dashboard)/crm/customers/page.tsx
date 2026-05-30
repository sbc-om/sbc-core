import {
  HiMiniEnvelope,
  HiMiniPhone,
  HiMiniUserGroup,
} from "react-icons/hi2";
import { listCustomers } from "@/actions/crm";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { CreateCustomerDialog } from "./_components/create-customer-dialog";
import { DeleteCustomerButton } from "./_components/delete-customer-button";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  inactive: "bg-muted text-muted-foreground ring-border",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export default async function CrmCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Customers" actions={<CreateCustomerDialog />} />

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <HiMiniUserGroup className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">No customers yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first customer to get started.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Company</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Email</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                          {initials(c.name)}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          {c.job_title && <p className="text-xs text-muted-foreground">{c.job_title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {c.company ?? <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                          <HiMiniEnvelope className="h-3.5 w-3.5 shrink-0" />
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                          <HiMiniPhone className="h-3.5 w-3.5 shrink-0" />
                          {c.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${STATUS_STYLES[c.status] ?? STATUS_STYLES.inactive}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <DeleteCustomerButton id={c.id} name={c.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
