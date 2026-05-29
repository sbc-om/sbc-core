"use server";

import { revalidatePath } from "next/cache";
import { createContact, updateContact, deleteContact } from "../services/contacts";

const SYSTEM_TENANT = "00000000-0000-0000-0000-000000000001";
const SYSTEM_USER   = "00000000-0000-0000-0000-000000000001";

function str(v: unknown): string { return typeof v === "string" ? v.trim() : ""; }

export async function createContactAction(formData: FormData): Promise<{ error?: string }> {
  const firstName = str(formData.get("firstName"));
  if (!firstName) return { error: "First name is required." };

  try {
    await createContact(
      {
        firstName,
        lastName: str(formData.get("lastName"))  || undefined,
        email:    str(formData.get("email"))      || undefined,
        phone:    str(formData.get("phone"))      || undefined,
        company:  str(formData.get("company"))    || undefined,
        jobTitle: str(formData.get("jobTitle"))   || undefined,
        city:     str(formData.get("city"))       || undefined,
        country:  str(formData.get("country"))    || undefined,
        notes:    str(formData.get("notes"))      || undefined,
      },
      SYSTEM_TENANT,
      SYSTEM_USER,
    );
    revalidatePath("/contacts");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create contact." };
  }
}

export async function updateContactAction(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const updated = await updateContact(
      id,
      {
        firstName: str(formData.get("firstName")) || undefined,
        lastName:  str(formData.get("lastName"))  || undefined,
        email:     str(formData.get("email"))     || undefined,
        phone:     str(formData.get("phone"))     || undefined,
        company:   str(formData.get("company"))   || undefined,
        jobTitle:  str(formData.get("jobTitle"))  || undefined,
        city:      str(formData.get("city"))      || undefined,
        country:   str(formData.get("country"))   || undefined,
        notes:     str(formData.get("notes"))     || undefined,
      },
      SYSTEM_TENANT,
      SYSTEM_USER,
    );
    if (!updated) return { error: "Contact not found." };
    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update contact." };
  }
}

export async function deleteContactAction(id: string): Promise<{ error?: string }> {
  try {
    await deleteContact(id, SYSTEM_TENANT, SYSTEM_USER);
    revalidatePath("/contacts");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete contact." };
  }
}
