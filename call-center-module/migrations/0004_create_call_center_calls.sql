-- Call Center: calls
CREATE TABLE IF NOT EXISTS call_center_calls (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID        NOT NULL,
  queue_id             UUID        REFERENCES call_center_queues (id) ON DELETE SET NULL,
  agent_id             UUID        REFERENCES call_center_agents (id) ON DELETE SET NULL,
  ticket_id            UUID        REFERENCES call_center_tickets (id) ON DELETE SET NULL,
  customer_id          UUID,
  direction            TEXT        NOT NULL DEFAULT 'inbound',
  external_number      TEXT,
  internal_extension   TEXT,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at             TIMESTAMPTZ,
  duration_seconds     INTEGER     NOT NULL DEFAULT 0,
  outcome              TEXT        NOT NULL DEFAULT 'connected',
  recording_url        TEXT,
  notes                TEXT,
  is_deleted           BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by           UUID,
  updated_by           UUID,
  deleted_at           TIMESTAMPTZ,
  deleted_by           UUID
);

CREATE INDEX IF NOT EXISTS call_center_calls_tenant_idx ON call_center_calls (tenant_id);
CREATE INDEX IF NOT EXISTS call_center_calls_queue_idx ON call_center_calls (queue_id);
CREATE INDEX IF NOT EXISTS call_center_calls_agent_idx ON call_center_calls (agent_id);
CREATE INDEX IF NOT EXISTS call_center_calls_ticket_idx ON call_center_calls (ticket_id);
CREATE INDEX IF NOT EXISTS call_center_calls_started_idx ON call_center_calls (tenant_id, started_at DESC);
