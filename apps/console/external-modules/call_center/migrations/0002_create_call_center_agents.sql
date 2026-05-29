-- Call Center: agents
CREATE TABLE IF NOT EXISTS call_center_agents (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL,
  queue_id            UUID        REFERENCES call_center_queues (id) ON DELETE SET NULL,
  user_id             UUID,
  display_name        TEXT        NOT NULL,
  extension           TEXT,
  skill_level         TEXT        NOT NULL DEFAULT 'standard',
  availability_status TEXT        NOT NULL DEFAULT 'offline',
  max_concurrent      INTEGER     NOT NULL DEFAULT 1,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  is_deleted          BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID,
  updated_by          UUID,
  deleted_at          TIMESTAMPTZ,
  deleted_by          UUID
);

CREATE INDEX IF NOT EXISTS call_center_agents_tenant_idx ON call_center_agents (tenant_id);
CREATE INDEX IF NOT EXISTS call_center_agents_queue_idx ON call_center_agents (queue_id);
CREATE INDEX IF NOT EXISTS call_center_agents_status_idx ON call_center_agents (tenant_id, availability_status);
