"use server";

import { db } from "@sbc/database";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const TENANT = "00000000-0000-0000-0000-000000000001";
const USER   = "00000000-0000-0000-0000-000000000001";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CrmCustomer {
  id:        string;
  name:      string;
  email:     string | null;
  phone:     string | null;
  company:   string | null;
  job_title: string | null;
  status:    string;
}

export interface CrmLead {
  id:          string;
  title:       string;
  value:       string | null;
  currency:    string;
  stage:       string;
  priority:    string;
  customer_id: string | null;
  assigned_to: string | null;
  notes:       string | null;
  created_at:  string;
}

export interface CrmPipeline {
  id:         string;
  name:       string;
  is_default: boolean;
  stages:     CrmPipelineStage[];
}

export interface CrmPipelineStage {
  id:          string;
  name:        string;
  order_index: number;
  color:       string | null;
  probability: string | null;
  is_won:      boolean;
  is_lost:     boolean;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : null;
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function listCustomers(): Promise<CrmCustomer[]> {
  const rows = await db.execute(sql`
    SELECT id, name, email, phone, company, job_title, status
    FROM crm_customers
    WHERE tenant_id = ${TENANT} AND is_deleted = false
    ORDER BY created_at DESC
  `);
  return rows as unknown as CrmCustomer[];
}

export async function createCustomerAction(formData: FormData): Promise<{ error?: string }> {
  const name = str(formData.get("name"));
  if (!name) return { error: "Name is required." };
  try {
    await db.execute(sql`
      INSERT INTO crm_customers
        (tenant_id, name, email, phone, company, job_title, notes, created_by, updated_by)
      VALUES
        (${TENANT}, ${name}, ${str(formData.get("email"))}, ${str(formData.get("phone"))},
         ${str(formData.get("company"))}, ${str(formData.get("jobTitle"))},
         ${str(formData.get("notes"))}, ${USER}, ${USER})
    `);
    revalidatePath("/crm/customers");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create customer." };
  }
}

export async function deleteCustomerAction(id: string): Promise<{ error?: string }> {
  try {
    await db.execute(sql`
      UPDATE crm_customers
      SET is_deleted = true, deleted_at = NOW(), deleted_by = ${USER}, updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${TENANT}
    `);
    revalidatePath("/crm/customers");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete customer." };
  }
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function listLeads(stage?: string): Promise<CrmLead[]> {
  const rows = await db.execute(sql`
    SELECT id, title, value::text, currency, stage, priority,
           customer_id, assigned_to, notes,
           created_at::text
    FROM crm_leads
    WHERE tenant_id = ${TENANT}
      AND is_deleted = false
      ${stage ? sql`AND stage = ${stage}` : sql``}
    ORDER BY created_at DESC
  `);
  return rows as unknown as CrmLead[];
}

export async function createLeadAction(formData: FormData): Promise<{ error?: string }> {
  const title = str(formData.get("title"));
  if (!title) return { error: "Title is required." };
  const stage    = str(formData.get("stage"))    ?? "new";
  const priority = str(formData.get("priority")) ?? "medium";
  const currency = str(formData.get("currency")) ?? "USD";
  const valueRaw = str(formData.get("value"));
  const value    = valueRaw ? parseFloat(valueRaw) : null;

  try {
    await db.execute(sql`
      INSERT INTO crm_leads
        (tenant_id, title, value, currency, stage, priority, notes, created_by, updated_by)
      VALUES
        (${TENANT}, ${title}, ${value}, ${currency}, ${stage}, ${priority},
         ${str(formData.get("notes"))}, ${USER}, ${USER})
    `);
    revalidatePath("/crm/leads");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create lead." };
  }
}

export async function updateLeadStageAction(id: string, stage: string): Promise<{ error?: string }> {
  try {
    await db.execute(sql`
      UPDATE crm_leads
      SET stage = ${stage}, updated_at = NOW(), updated_by = ${USER}
      WHERE id = ${id} AND tenant_id = ${TENANT}
    `);
    revalidatePath("/crm/leads");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update stage." };
  }
}

export async function deleteLeadAction(id: string): Promise<{ error?: string }> {
  try {
    await db.execute(sql`
      UPDATE crm_leads
      SET is_deleted = true, deleted_at = NOW(), deleted_by = ${USER}, updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${TENANT}
    `);
    revalidatePath("/crm/leads");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete lead." };
  }
}

// ── Pipelines ─────────────────────────────────────────────────────────────────

export async function listPipelines(): Promise<CrmPipeline[]> {
  const pipelines = await db.execute(sql`
    SELECT id, name, is_default
    FROM crm_pipelines
    WHERE tenant_id = ${TENANT} AND is_deleted = false
    ORDER BY is_default DESC, created_at ASC
  `) as unknown as Array<{ id: string; name: string; is_default: boolean }>;

  if (pipelines.length === 0) return [];

  // Use a JOIN to avoid passing a JS array as a PostgreSQL array literal
  const stages = await db.execute(sql`
    SELECT s.id, s.pipeline_id, s.name, s.order_index, s.color,
           s.probability::text, s.is_won, s.is_lost
    FROM crm_pipeline_stages s
    JOIN crm_pipelines p ON s.pipeline_id = p.id
    WHERE p.tenant_id = ${TENANT}
      AND p.is_deleted = false
      AND s.is_deleted = false
    ORDER BY s.pipeline_id, s.order_index ASC
  `) as unknown as Array<CrmPipelineStage & { pipeline_id: string }>;

  return pipelines.map((p) => ({
    ...p,
    stages: stages.filter((s) => s.pipeline_id === p.id),
  }));
}

export async function createPipelineAction(formData: FormData): Promise<{ error?: string }> {
  const name = str(formData.get("name"));
  if (!name) return { error: "Pipeline name is required." };

  const stagesRaw = str(formData.get("stages")) ?? "";
  const stageNames = stagesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (stageNames.length === 0) return { error: "At least one stage is required." };

  try {
    const rows = await db.execute(sql`
      INSERT INTO crm_pipelines (tenant_id, name, created_by, updated_by)
      VALUES (${TENANT}, ${name}, ${USER}, ${USER})
      RETURNING id
    `) as unknown as Array<{ id: string }>;

    const pipelineId = rows[0]?.id;
    if (!pipelineId) throw new Error("Pipeline insert did not return an id.");

    for (let i = 0; i < stageNames.length; i++) {
      await db.execute(sql`
        INSERT INTO crm_pipeline_stages
          (tenant_id, pipeline_id, name, order_index, created_by, updated_by)
        VALUES
          (${TENANT}, ${pipelineId}, ${stageNames[i]}, ${i}, ${USER}, ${USER})
      `);
    }

    revalidatePath("/crm/pipelines");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create pipeline." };
  }
}

export async function deletePipelineAction(id: string): Promise<{ error?: string }> {
  try {
    await db.execute(sql`
      UPDATE crm_pipelines
      SET is_deleted = true, deleted_at = NOW(), deleted_by = ${USER}, updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${TENANT}
    `);
    revalidatePath("/crm/pipelines");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete pipeline." };
  }
}
