-- CRM: Leads table
CREATE TABLE IF NOT EXISTS crm_leads (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID        NOT NULL,
  title          TEXT        NOT NULL,
  value          NUMERIC(15, 2),
  currency       TEXT        NOT NULL DEFAULT 'USD',
  stage          TEXT        NOT NULL DEFAULT 'new',
  priority       TEXT        NOT NULL DEFAULT 'medium',
  customer_id    UUID,
  pipeline_id    UUID,
  assigned_to    UUID,
  expected_close DATE,
  converted_at   TIMESTAMPTZ,
  notes          TEXT,
  is_deleted     BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     UUID,
  updated_by     UUID,
  deleted_at     TIMESTAMPTZ,
  deleted_by     UUID
);

CREATE INDEX IF NOT EXISTS crm_leads_tenant_idx   ON crm_leads (tenant_id);
CREATE INDEX IF NOT EXISTS crm_leads_stage_idx    ON crm_leads (stage);
CREATE INDEX IF NOT EXISTS crm_leads_pipeline_idx ON crm_leads (pipeline_id);
CREATE INDEX IF NOT EXISTS crm_leads_assigned_idx ON crm_leads (assigned_to)
