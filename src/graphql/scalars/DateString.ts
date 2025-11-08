import { GraphQLScalarType, Kind } from "graphql";

/**
 * 📅 DateString Scalar - YYYY-MM-DD format
 * 
 * Prevents Apollo Server from auto-converting date strings to Date objects.
 * Always serializes as plain string in YYYY-MM-DD format.
 */
export const DateString = new GraphQLScalarType({
  name: "DateString",
  description: "Date in YYYY-MM-DD format (e.g., '1990-01-01')",
  
  // Serialize: Database → GraphQL response
  serialize(value: any): string | null {
    if (!value) return null;
    
    // If it's a Date object, convert to YYYY-MM-DD
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // If it's an ISO string, extract YYYY-MM-DD
    const str = String(value);
    if (str.includes('T')) {
      return str.split('T')[0];
    }
    
    // Return as-is (already YYYY-MM-DD)
    return str;
  },
  
  // Parse: GraphQL input → Resolver
  parseValue(value: any): string {
    return String(value);
  },
  
  // Parse: GraphQL literal → Resolver
  parseLiteral(ast): string | null {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});
