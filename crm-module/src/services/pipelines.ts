export interface Pipeline {
  id:        string;
  tenantId:  string;
  name:      string;
  isDefault: boolean;
  stages:    PipelineStage[];
  createdAt: Date;
}

export interface PipelineStage {
  id:          string;
  pipelineId:  string;
  name:        string;
  orderIndex:  number;
  color?:      string;
  probability?: number;
  isWon:       boolean;
  isLost:      boolean;
}

export async function listPipelines(tenantId: string): Promise<Pipeline[]> {
  void tenantId;
  return [];
}

export async function createPipeline(
  name: string,
  stages: Omit<PipelineStage, "id" | "pipelineId">[],
  tenantId: string,
  createdBy: string,
): Promise<Pipeline> {
  void name; void stages; void tenantId; void createdBy;
  throw new Error("Not implemented — compile and deploy the CRM module.");
}

export async function seedDefaultPipeline(tenantId: string, createdBy: string): Promise<void> {
  await createPipeline(
    "Sales",
    [
      { name: "New",        orderIndex: 0, probability: 10,  isWon: false, isLost: false },
      { name: "Qualified",  orderIndex: 1, probability: 30,  isWon: false, isLost: false },
      { name: "Proposal",   orderIndex: 2, probability: 60,  isWon: false, isLost: false },
      { name: "Negotiation",orderIndex: 3, probability: 80,  isWon: false, isLost: false },
      { name: "Won",        orderIndex: 4, probability: 100, isWon: true,  isLost: false },
      { name: "Lost",       orderIndex: 5, probability: 0,   isWon: false, isLost: true  },
    ],
    tenantId,
    createdBy,
  );
}
