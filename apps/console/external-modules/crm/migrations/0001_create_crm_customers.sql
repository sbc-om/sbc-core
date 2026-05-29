-- CRM: Customers table
CREATE TABLE IF NOT EXISTS crm_customers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL,
  name         TEXT        NOT NULL,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  job_title    TEXT,
  status       TEXT        NOT NULL DEFAULT 'active',
  pipeline_id  UUID,
  owner_id     UUID,
  notes        TEXT,
  is_deleted   BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID,
  updated_by   UUID,
  deleted_at   TIMESTAMPTZ,
  deleted_by   UUID
);

CREATE INDEX IF NOT EXISTS crm_customers_tenant_idx ON crm_customers (tenant_id);
CREATE INDEX IF NOT EXISTS crm_customers_status_idx ON crm_customers (status);
CREATE INDEX IF NOT EXISTS crm_customers_owner_idx  ON crm_customers (owner_id)
