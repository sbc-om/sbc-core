export interface Ticket {
  id: string;
  tenantId: string;
  queueId?: string;
  assignedAgentId?: string;
  customerId?: string;
  subject: string;
  description?: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  source: "call" | "email" | "chat" | "manual";
  slaDueAt?: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketInput {
  queueId?: string;
  assignedAgentId?: string;
  customerId?: string;
  subject: string;
  description?: string;
  status?: Ticket["status"];
  priority?: Ticket["priority"];
  source?: Ticket["source"];
  slaDueAt?: Date;
}

export async function listTickets(
  tenantId: string,
  options?: { queueId?: string; assignedAgentId?: string; status?: Ticket["status"]; limit?: number; offset?: number },
): Promise<Ticket[]> {
  void tenantId; void options;
  return [];
}

export async function createTicket(input: CreateTicketInput, tenantId: string, createdBy: string): Promise<Ticket> {
  void input; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the Call Center module.");
}

export async function updateTicket(id: string, input: Partial<CreateTicketInput>, tenantId: string, updatedBy: string): Promise<Ticket | null> {
  void id; void input; void tenantId; void updatedBy;
  return null;
}

export async function closeTicket(id: string, tenantId: string, closedBy: string): Promise<Ticket | null> {
  void id; void tenantId; void closedBy;
  return null;
}
