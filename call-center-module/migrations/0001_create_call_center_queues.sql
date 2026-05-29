-- Call Center: queues
CREATE TABLE IF NOT EXISTS call_center_queues (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID        NOT NULL,
  name                     TEXT        NOT NULL,
  code                     TEXT        NOT NULL,
  channel                  TEXT        NOT NULL DEFAULT 'voice',
  description              TEXT,
  strategy                 TEXT        NOT NULL DEFAULT 'round_robin',
  default_priority         TEXT        NOT NULL DEFAULT 'medium',
  sla_first_response_min   INTEGER     NOT NULL DEFAULT 15,
  sla_resolution_min       INTEGER     NOT NULL DEFAULT 60,
  is_active                BOOLEAN     NOT NULL DEFAULT true,
  is_deleted               BOOLEAN     NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by               UUID,
  updated_by               UUID,
  deleted_at               TIMESTAMPTZ,
  deleted_by               UUID,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS call_center_queues_tenant_idx ON call_center_queues (tenant_id);
CREATE INDEX IF NOT EXISTS call_center_queues_active_idx ON call_center_queues (tenant_id, is_active);
