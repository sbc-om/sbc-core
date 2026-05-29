interface DocumentUrlContext {
  tenantId?: string;
  resourceModule?: string;
  resourceType?: string;
  resourceId?: string;
  fieldName?: string;
}

export function buildDocumentUrl(documentId: string, context?: DocumentUrlContext): string {
  const params = new URLSearchParams();

  if (context?.tenantId) params.set("tenantId", context.tenantId);
  if (context?.resourceModule) params.set("resourceModule", context.resourceModule);
  if (context?.resourceType) params.set("resourceType", context.resourceType);
  if (context?.resourceId) params.set("resourceId", context.resourceId);
  if (context?.fieldName) params.set("fieldName", context.fieldName);

  const query = params.toString();
  return query ? `/api/files/${documentId}?${query}` : `/api/files/${documentId}`;
}

export function extractDocumentId(input: string | null | undefined): string | null {
  if (!input) return null;

  const match = input.match(/\/api\/files\/([^/?#]+)/);
  return match?.[1] ?? null;
}