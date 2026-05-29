export interface Agent {
  id: string;
  tenantId: string;
  queueId?: string;
  userId?: string;
  displayName: string;
  extension?: string;
  skillLevel: "junior" | "standard" | "senior";
  availabilityStatus: "offline" | "available" | "busy" | "break";
  maxConcurrent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentInput {
  queueId?: string;
  userId?: string;
  displayName: string;
  extension?: string;
  skillLevel?: Agent["skillLevel"];
  availabilityStatus?: Agent["availabilityStatus"];
  maxConcurrent?: number;
}

export async function listAgents(tenantId: string, queueId?: string): Promise<Agent[]> {
  void tenantId; void queueId;
  return [];
}

export async function createAgent(input: CreateAgentInput, tenantId: string, createdBy: string): Promise<Agent> {
  void input; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the Call Center module.");
}

export async function updateAgent(id: string, input: Partial<CreateAgentInput>, tenantId: string, updatedBy: string): Promise<Agent | null> {
  void id; void input; void tenantId; void updatedBy;
  return null;
}
