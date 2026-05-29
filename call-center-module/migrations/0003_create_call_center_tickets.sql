-- Call Center: tickets
CREATE TABLE IF NOT EXISTS call_center_tickets (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID        NOT NULL,
  queue_id              UUID        REFERENCES call_center_queues (id) ON DELETE SET NULL,
  assigned_agent_id     UUID        REFERENCES call_center_agents (id) ON DELETE SET NULL,
  customer_id           UUID,
  subject               TEXT        NOT NULL,
  description           TEXT,
  status                TEXT        NOT NULL DEFAULT 'open',
  priority              TEXT        NOT NULL DEFAULT 'medium',
  source                TEXT        NOT NULL DEFAULT 'call',
  sla_due_at            TIMESTAMPTZ,
  first_response_at     TIMESTAMPTZ,
  resolved_at           TIMESTAMPTZ,
  closed_at             TIMESTAMPTZ,
  is_deleted            BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by            UUID,
  updated_by            UUID,
  deleted_at            TIMESTAMPTZ,
  deleted_by            UUID
);

CREATE INDEX IF NOT EXISTS call_center_tickets_tenant_idx ON call_center_tickets (tenant_id);
CREATE INDEX IF NOT EXISTS call_center_tickets_status_idx ON call_center_tickets (tenant_id, status);
CREATE INDEX IF NOT EXISTS call_center_tickets_queue_idx ON call_center_tickets (queue_id);
CREATE INDEX IF NOT EXISTS call_center_tickets_agent_idx ON call_center_tickets (assigned_agent_id);
