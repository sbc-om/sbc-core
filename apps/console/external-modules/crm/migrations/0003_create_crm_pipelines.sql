-- CRM: Pipelines and stages
CREATE TABLE IF NOT EXISTS crm_pipelines (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL,
  name        TEXT        NOT NULL,
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  is_deleted  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID,
  updated_by  UUID,
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID
);

CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL,
  pipeline_id  UUID        NOT NULL REFERENCES crm_pipelines (id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  order_index  INTEGER     NOT NULL DEFAULT 0,
  color        TEXT,
  probability  NUMERIC(5, 2),
  is_won       BOOLEAN     NOT NULL DEFAULT false,
  is_lost      BOOLEAN     NOT NULL DEFAULT false,
  is_deleted   BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID,
  updated_by   UUID
);

CREATE INDEX IF NOT EXISTS crm_pipelines_tenant_idx       ON crm_pipelines (tenant_id);
CREATE INDEX IF NOT EXISTS crm_pipeline_stages_pipe_idx   ON crm_pipeline_stages (pipeline_id)
