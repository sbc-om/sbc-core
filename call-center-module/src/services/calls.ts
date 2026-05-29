export interface CallLog {
  id: string;
  tenantId: string;
  queueId?: string;
  agentId?: string;
  ticketId?: string;
  customerId?: string;
  direction: "inbound" | "outbound";
  externalNumber?: string;
  internalExtension?: string;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  outcome: "connected" | "missed" | "voicemail" | "abandoned";
  recordingUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCallLogInput {
  queueId?: string;
  agentId?: string;
  ticketId?: string;
  customerId?: string;
  direction?: CallLog["direction"];
  externalNumber?: string;
  internalExtension?: string;
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  outcome?: CallLog["outcome"];
  recordingUrl?: string;
  notes?: string;
}

export async function listCalls(
  tenantId: string,
  options?: { queueId?: string; agentId?: string; ticketId?: string; limit?: number; offset?: number },
): Promise<CallLog[]> {
  void tenantId; void options;
  return [];
}

export async function createCallLog(input: CreateCallLogInput, tenantId: string, createdBy: string): Promise<CallLog> {
  void input; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the Call Center module.");
}
