export interface Queue {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  channel: "voice" | "chat" | "omnichannel";
  strategy: "round_robin" | "least_busy" | "priority";
  defaultPriority: "low" | "medium" | "high" | "urgent";
  slaFirstResponseMin: number;
  slaResolutionMin: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQueueInput {
  name: string;
  code: string;
  channel?: Queue["channel"];
  strategy?: Queue["strategy"];
  defaultPriority?: Queue["defaultPriority"];
  slaFirstResponseMin?: number;
  slaResolutionMin?: number;
  description?: string;
}

export async function listQueues(tenantId: string): Promise<Queue[]> {
  void tenantId;
  return [];
}

export async function createQueue(input: CreateQueueInput, tenantId: string, createdBy: string): Promise<Queue> {
  void input; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the Call Center module.");
}

export async function updateQueue(id: string, input: Partial<CreateQueueInput>, tenantId: string, updatedBy: string): Promise<Queue | null> {
  void id; void input; void tenantId; void updatedBy;
  return null;
}
