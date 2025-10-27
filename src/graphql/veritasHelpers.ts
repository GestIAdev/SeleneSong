import { GraphQLContext } from "./types.js";


// Extract Veritas level from GraphQL field
export function getVeritasLevel(info: any, _fieldName: string): string {
  try {
    const fieldDef = info.schema.getType(info.parentType)?.getFields()?.[
      _fieldName
    ];
    if (!fieldDef) return "NONE";

    const veritasDirective = (fieldDef as any).astNode?.directives?.find(
      (_d: any) => _d.name.value === "veritas",
    );

    if (veritasDirective) {
      const levelArg = veritasDirective.arguments?.find(
        (_arg: any) => _arg.name.value === "level",
      );
      return levelArg?.value?.value || "NONE";
    }
    return "NONE";
  } catch (error) {
    console.error("Error extracting Veritas level:", error as Error);
    return "NONE";
  }
}

// Apply Veritas verification to a value and attach metadata
export async function applyVeritasVerification(
  data: any,
  _entity: string,
  _dataId: string,
  veritasLevel: string,
  context: GraphQLContext,
): Promise<any> {
  if (veritasLevel === "NONE" || !context.veritas) {
    return data;
  }
  try {
    const verification = await context.veritas.verifyDataIntegrity(
      data,
      _entity,
      _dataId,
    );
    return {
      ...data,
      _veritas: {
        verified: verification.verified,
        confidence: verification.confidence,
        level: veritasLevel,
        certificate: verification.certificate?.dataHash,
      },
    };
  } catch (error) {
    console.error("Veritas verification failed:", error as Error);
    return {
      ...data,
      _veritas: {
        verified: false,
        confidence: 0,
        level: veritasLevel,
        error: "Verification failed",
      },
    };
  }
}

// Apply @veritas to all annotated fields of an object
export async function applyVeritasToObject(
  obj: any,
  info: any,
  _context: GraphQLContext,
): Promise<any> {
  if (!obj || typeof obj !== "object") return obj;
  const result = { ...obj };
  const typeName = info.parentType?.name?.toLowerCase?.() || "unknown";
  const fields = info.schema.getType(info.parentType)?.getFields?.();
  if (!fields) return result;

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    const veritasDirective = (fieldDef as any).astNode?.directives?.find(
      (_d: any) => _d.name.value === "veritas",
    );
    if (veritasDirective) {
      const levelArg = veritasDirective.arguments?.find(
        (_arg: any) => _arg.name.value === "level",
      );
      const level = levelArg?.value?.value || "NONE";
      if (result[fieldName] !== undefined && result[fieldName] !== null) {
        result[fieldName] = await applyVeritasVerification(
          result[fieldName],
          typeName,
          obj.id || "unknown",
          level,
          _context,
        );
      }
    }
  }
  return result;
}


