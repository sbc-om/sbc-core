import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowLeft, HiMiniEnvelope, HiMiniMapPin, HiMiniPhone } from "react-icons/hi2";
import { getContactById } from "@sbc/module-contacts/services";
import { updateContactAction } from "@sbc/module-contacts/actions";
import { DeleteContactButton } from "../_components/delete-contact-button";

const SYSTEM_TENANT = "00000000-0000-0000-0000-000000000001";

interface Props { params: Promise<{ id: string }> }

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const contact = await getContactById(id, SYSTEM_TENANT);
  if (!contact) notFound();

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");

  async function updateWithId(formData: FormData) {
    "use server";
    await updateContactAction(id, formData);
  }

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground";
  const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/contacts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <HiArrowLeft className="h-3.5 w-3.5" />
            Contacts
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-sm font-semibold text-foreground">{fullName}</h1>
        </div>
        <div className="w-full sm:w-auto">
          <DeleteContactButton id={contact.id} name={fullName} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — profile card */}
        <div className="rounded-lg border border-border bg-background p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted text-xl font-semibold text-muted-foreground">
              {contact.firstName.charAt(0)}{contact.lastName?.charAt(0) ?? ""}
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">{fullName}</p>
              {contact.jobTitle && <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>}
              {contact.company && <p className="text-xs text-muted-foreground">{contact.company}</p>}
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-border pt-4">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground">
                <HiMiniEnvelope className="h-4 w-4 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground">
                <HiMiniPhone className="h-4 w-4 shrink-0" />
                {contact.phone}
              </a>
            )}
            {(contact.city || contact.country) && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <HiMiniMapPin className="h-4 w-4 shrink-0" />
                {[contact.city, contact.country].filter(Boolean).join(", ")}
              </div>
            )}
          </div>

          {contact.notes && (
            <div className="mt-4 rounded-md border border-border bg-muted/20 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{contact.notes}</p>
            </div>
          )}

          <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{contact.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span>{contact.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right — edit form */}
        <div className="rounded-lg border border-border bg-background p-6 lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold text-foreground">Edit Contact</h2>
          <form action={updateWithId} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>First Name <span className="text-rose-500">*</span></label>
                <input name="firstName" defaultValue={contact.firstName} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input name="lastName" defaultValue={contact.lastName ?? ""} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" defaultValue={contact.email ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" type="tel" defaultValue={contact.phone ?? ""} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Company</label>
                <input name="company" defaultValue={contact.company ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Job Title</label>
                <input name="jobTitle" defaultValue={contact.jobTitle ?? ""} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>City</label>
                <input name="city" defaultValue={contact.city ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input name="country" defaultValue={contact.country ?? ""} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Address</label>
              <input name="address" defaultValue={contact.address ?? ""} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea name="notes" rows={4} defaultValue={contact.notes ?? ""} className={`${inputCls} resize-none`} />
            </div>

            <div className="flex pt-2 sm:justify-end">
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
