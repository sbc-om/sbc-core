import crypto from "node:crypto";
import { and, asc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@sbc/database";
import { contacts, type Contact } from "../schema";

export interface ContactsWidgetData {
  total:     number;
  withEmail: number;
  withPhone: number;
  latest:    { name: string; company: string | null }[];
}

export interface CreateContactInput {
  firstName: string;
  lastName?:  string;
  email?:     string;
  phone?:     string;
  company?:   string;
  jobTitle?:  string;
  address?:   string;
  city?:      string;
  country?:   string;
  notes?:     string;
  tags?:      string[];
}

export type UpdateContactInput = Partial<CreateContactInput>;

export interface ContactFilters {
  query?:  string;
  limit?:  number;
}

// Ensures the contacts table exists without requiring a migration runner.
export async function ensureContactsInfrastructure(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id   uuid NOT NULL,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now(),
      created_by  uuid,
      updated_by  uuid,
      is_deleted  boolean NOT NULL DEFAULT false,
      deleted_at  timestamptz,
      deleted_by  uuid,
      first_name  text NOT NULL,
      last_name   text,
      email       text,
      phone       text,
      company     text,
      job_title   text,
      address     text,
      city        text,
      country     text,
      notes       text,
      tags        text[] NOT NULL DEFAULT ARRAY[]::text[]
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS contacts_tenant_created_idx
    ON contacts (tenant_id, created_at DESC)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS contacts_tenant_email_idx
    ON contacts (tenant_id, email)
  `);
}

export async function listContacts(
  tenantId: string,
  filters: ContactFilters = {},
): Promise<Contact[]> {
  await ensureContactsInfrastructure();

  const clauses = [
    eq(contacts.tenantId, tenantId),
    eq(contacts.isDeleted, false),
  ];

  if (filters.query?.trim()) {
    const q = `%${filters.query.trim()}%`;
    clauses.push(
      or(
        ilike(contacts.firstName, q),
        ilike(contacts.lastName,  q),
        ilike(contacts.email,     q),
        ilike(contacts.phone,     q),
        ilike(contacts.company,   q),
      )!
    );
  }

  return db
    .select()
    .from(contacts)
    .where(and(...clauses))
    .orderBy(asc(contacts.firstName), asc(contacts.lastName))
    .limit(filters.limit ?? 500);
}

export async function getContactById(
  id: string,
  tenantId: string,
): Promise<Contact | null> {
  await ensureContactsInfrastructure();
  const [row] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId), eq(contacts.isDeleted, false)))
    .limit(1);
  return row ?? null;
}

export async function createContact(
  input: CreateContactInput,
  tenantId: string,
  userId: string,
): Promise<Contact> {
  await ensureContactsInfrastructure();
  const now = new Date();
  const [created] = await db
    .insert(contacts)
    .values({
      id:        crypto.randomUUID(),
      tenantId,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      isDeleted: false,
      firstName: input.firstName.trim(),
      lastName:  input.lastName?.trim()  || null,
      email:     input.email?.trim()     || null,
      phone:     input.phone?.trim()     || null,
      company:   input.company?.trim()   || null,
      jobTitle:  input.jobTitle?.trim()  || null,
      address:   input.address?.trim()   || null,
      city:      input.city?.trim()      || null,
      country:   input.country?.trim()   || null,
      notes:     input.notes?.trim()     || null,
      tags:      input.tags ?? [],
    })
    .returning();
  if (!created) throw new Error("Contact was not created");
  return created;
}

export async function updateContact(
  id: string,
  input: UpdateContactInput,
  tenantId: string,
  userId: string,
): Promise<Contact | null> {
  await ensureContactsInfrastructure();
  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
    updatedBy: userId,
  };
  if (input.firstName !== undefined) updates.firstName = input.firstName.trim();
  if (input.lastName  !== undefined) updates.lastName  = input.lastName?.trim()  || null;
  if (input.email     !== undefined) updates.email     = input.email?.trim()     || null;
  if (input.phone     !== undefined) updates.phone     = input.phone?.trim()     || null;
  if (input.company   !== undefined) updates.company   = input.company?.trim()   || null;
  if (input.jobTitle  !== undefined) updates.jobTitle  = input.jobTitle?.trim()  || null;
  if (input.address   !== undefined) updates.address   = input.address?.trim()   || null;
  if (input.city      !== undefined) updates.city      = input.city?.trim()      || null;
  if (input.country   !== undefined) updates.country   = input.country?.trim()   || null;
  if (input.notes     !== undefined) updates.notes     = input.notes?.trim()     || null;
  if (input.tags      !== undefined) updates.tags      = input.tags;

  const [updated] = await db
    .update(contacts)
    .set(updates)
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId), eq(contacts.isDeleted, false)))
    .returning();
  return updated ?? null;
}

export async function getContactsWidgetData(tenantId: string): Promise<ContactsWidgetData> {
  await ensureContactsInfrastructure();
  const base = and(eq(contacts.tenantId, tenantId), eq(contacts.isDeleted, false));

  const [totalRow, emailRow, phoneRow, latestRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(contacts).where(base),
    db.select({ count: sql<number>`count(*)::int` }).from(contacts).where(and(base, isNotNull(contacts.email))),
    db.select({ count: sql<number>`count(*)::int` }).from(contacts).where(and(base, isNotNull(contacts.phone))),
    db.select({ firstName: contacts.firstName, lastName: contacts.lastName, company: contacts.company })
      .from(contacts).where(base).orderBy(asc(contacts.createdAt)).limit(5),
  ]);

  return {
    total:     totalRow[0]?.count ?? 0,
    withEmail: emailRow[0]?.count ?? 0,
    withPhone: phoneRow[0]?.count ?? 0,
    latest:    latestRows.map((r) => ({
      name:    [r.firstName, r.lastName].filter(Boolean).join(" "),
      company: r.company,
    })),
  };
}

export async function deleteContact(
  id: string,
  tenantId: string,
  userId: string,
): Promise<boolean> {
  await ensureContactsInfrastructure();
  const [deleted] = await db
    .update(contacts)
    .set({ isDeleted: true, deletedAt: new Date(), deletedBy: userId, updatedAt: new Date(), updatedBy: userId })
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId), eq(contacts.isDeleted, false)))
    .returning({ id: contacts.id });
  return !!deleted;
}
