import type { ZodType, infer as ZodInfer } from "zod";

export interface TypedEventDefinition<TSchema extends ZodType> {
  name:   string;
  schema: TSchema;
}

export type TypedEventPayload<TDef extends TypedEventDefinition<ZodType>> =
  ZodInfer<TDef["schema"]>;
