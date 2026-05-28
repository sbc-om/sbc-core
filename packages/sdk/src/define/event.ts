import type { ZodType } from "zod";
import type { TypedEventDefinition } from "../types/events";

export function defineEvent<TSchema extends ZodType>(
  definition: TypedEventDefinition<TSchema>
): TypedEventDefinition<TSchema> {
  return definition;
}
