/**
 * CRM Customer service — reference implementation.
 * In production, compile this via `pnpm build` and wire up API routes.
 */

export interface Customer {
  id:         string;
  tenantId:   string;
  name:       string;
  email?:     string;
  phone?:     string;
  company?:   string;
  jobTitle?:  string;
  status:     "active" | "inactive";
  pipelineId?: string;
  ownerId?:   string;
  notes?:     string;
  createdAt:  Date;
  updatedAt:  Date;
}

export interface CreateCustomerInput {
  name:        string;
  email?:      string;
  phone?:      string;
  company?:    string;
  jobTitle?:   string;
  pipelineId?: string;
  ownerId?:    string;
  notes?:      string;
}

// These functions would use Drizzle ORM in the full implementation.
// They are stubs here to show the expected service shape.

export async function listCustomers(
  tenantId: string,
  options?: { status?: "active" | "inactive"; limit?: number; offset?: number },
): Promise<Customer[]> {
  // Implementation: db.select().from(crmCustomers).where(eq(crmCustomers.tenantId, tenantId))
  void tenantId; void options;
  return [];
}

export async function getCustomer(id: string, tenantId: string): Promise<Customer | null> {
  void id; void tenantId;
  return null;
}

export async function createCustomer(
  input: CreateCustomerInput,
  tenantId: string,
  createdBy: string,
): Promise<Customer> {
  void input; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the CRM module.");
}

export async function updateCustomer(
  id: string,
  input: Partial<CreateCustomerInput>,
  tenantId: string,
  updatedBy: string,
): Promise<Customer | null> {
  void id; void input; void tenantId; void updatedBy;
  return null;
}

export async function deleteCustomer(
  id: string,
  tenantId: string,
  deletedBy: string,
): Promise<boolean> {
  void id; void tenantId; void deletedBy;
  return false;
}
