export interface Lead {
  id:            string;
  tenantId:      string;
  title:         string;
  value?:        number;
  currency:      string;
  stage:         string;
  priority:      "low" | "medium" | "high";
  customerId?:   string;
  pipelineId?:   string;
  assignedTo?:   string;
  expectedClose?: Date;
  convertedAt?:  Date;
  notes?:        string;
  createdAt:     Date;
  updatedAt:     Date;
}

export interface CreateLeadInput {
  title:         string;
  value?:        number;
  currency?:     string;
  stage?:        string;
  priority?:     "low" | "medium" | "high";
  customerId?:   string;
  pipelineId?:   string;
  assignedTo?:   string;
  expectedClose?: Date;
  notes?:        string;
}

export async function listLeads(
  tenantId: string,
  options?: { stage?: string; pipelineId?: string; assignedTo?: string; limit?: number; offset?: number },
): Promise<Lead[]> {
  void tenantId; void options;
  return [];
}

export async function getLead(id: string, tenantId: string): Promise<Lead | null> {
  void id; void tenantId;
  return null;
}

export async function createLead(
  input: CreateLeadInput,
  tenantId: string,
  createdBy: string,
): Promise<Lead> {
  void input; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the CRM module.");
}

export async function updateLead(
  id: string,
  input: Partial<CreateLeadInput>,
  tenantId: string,
  updatedBy: string,
): Promise<Lead | null> {
  void id; void input; void tenantId; void updatedBy;
  return null;
}

export async function convertLead(
  id: string,
  tenantId: string,
  convertedBy: string,
): Promise<{ lead: Lead; customerId: string }> {
  void id; void tenantId; void convertedBy;
  throw new Error("Not implemented — compile and deploy the CRM module.");
}

export async function deleteLead(
  id: string,
  tenantId: string,
  deletedBy: string,
): Promise<boolean> {
  void id; void tenantId; void deletedBy;
  return false;
}
