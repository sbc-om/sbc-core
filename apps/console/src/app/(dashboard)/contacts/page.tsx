import Link from "next/link";
import {
  HiMiniArrowRight,
  HiMiniEnvelope,
  HiMiniIdentification,
  HiMiniPhone,
} from "react-icons/hi2";
import { listContacts } from "@sbc/module-contacts/services";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { CreateContactDialog } from "./_components/create-contact-dialog";
import { DeleteContactButton } from "./_components/delete-contact-button";

const SYSTEM_TENANT = "00000000-0000-0000-0000-000000000001";

function initials(firstName: string, lastName?: string | null) {
  return `${firstName.charAt(0)}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

export default async function ContactsPage() {
  const contacts = await listContacts(SYSTEM_TENANT);

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Contacts" actions={<CreateContactDialog />} />

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <HiMiniIdentification className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">No contacts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first contact to get started.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Company</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Email</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">Phone</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Location</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((contact) => {
                  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
                  return (
                    <tr key={contact.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                            {initials(contact.firstName, contact.lastName)}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{fullName}</p>
                            {contact.jobTitle && (
                              <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {contact.company ?? <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <HiMiniEnvelope className="h-3.5 w-3.5 shrink-0" />
                            {contact.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <HiMiniPhone className="h-3.5 w-3.5 shrink-0" />
                            {contact.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground xl:table-cell">
                        {[contact.city, contact.country].filter(Boolean).join(", ") || <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <DeleteContactButton id={contact.id} name={fullName} />
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-slate-300 hover:text-foreground"
                            title="View contact"
                          >
                            <HiMiniArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
