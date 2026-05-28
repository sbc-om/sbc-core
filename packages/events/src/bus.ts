import type { ZodType } from "zod";
import type { TypedEventDefinition } from "@sbc/sdk";
import { db, events } from "@sbc/database";
import { eq, and } from "drizzle-orm";

type Handler<T> = (payload: T, meta: EventMeta) => Promise<void>;

export interface EventMeta {
  eventId:    string;
  tenantId:   string | null;
  sourceMod:  string;
  emittedAt:  Date;
}

interface Subscription {
  eventName: string;
  handler:   Handler<unknown>;
  module:    string;
}

class EventBus {
  private subscriptions: Subscription[] = [];

  subscribe<TSchema extends ZodType>(
    definition: TypedEventDefinition<TSchema>,
    handler: Handler<import("zod").infer<TSchema>>,
    fromModule: string
  ): () => void {
    const sub: Subscription = {
      eventName: definition.name,
      handler:   handler as Handler<unknown>,
      module:    fromModule,
    };
    this.subscriptions.push(sub);

    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== sub);
    };
  }

  subscribeByName(
    eventName: string,
    handler: Handler<unknown>,
    fromModule: string
  ): () => void {
    const sub: Subscription = { eventName, handler, module: fromModule };
    this.subscriptions.push(sub);
    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== sub);
    };
  }

  async publish<TSchema extends ZodType>(
    definition: TypedEventDefinition<TSchema>,
    payload: import("zod").infer<TSchema>,
    meta: { tenantId: string | null; sourceModule: string }
  ): Promise<void> {
    const validated = definition.schema.parse(payload);

    const [record] = await db
      .insert(events)
      .values({
        name:         definition.name,
        payload:      validated as Record<string, unknown>,
        sourceModule: meta.sourceModule,
        tenantId:     meta.tenantId ?? undefined,
        status:       "pending",
      })
      .returning();

    if (!record) return;

    const eventMeta: EventMeta = {
      eventId:   record.id,
      tenantId:  meta.tenantId,
      sourceMod: meta.sourceModule,
      emittedAt: record.createdAt,
    };

    const handlers = this.subscriptions.filter(
      (s) => s.eventName === definition.name
    );

    const errors: unknown[] = [];

    for (const sub of handlers) {
      try {
        await sub.handler(validated, eventMeta);
      } catch (err) {
        errors.push(err);
        console.error(`[events] Handler error in ${sub.module} for ${definition.name}:`, err);
      }
    }

    await db
      .update(events)
      .set({
        status:      errors.length > 0 ? "failed" : "processed",
        processedAt: new Date(),
        error:       errors.length > 0 ? String(errors[0]) : null,
      })
      .where(eq(events.id, record.id));
  }

  unsubscribeModule(moduleName: string): void {
    this.subscriptions = this.subscriptions.filter((s) => s.module !== moduleName);
  }
}

export const eventBus = new EventBus();
