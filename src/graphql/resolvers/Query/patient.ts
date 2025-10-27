// ============================================================================
// 👥 PATIENT QUERIES V3 - VERITAS ENHANCED
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const patientQueries = {
  // Patients - Standard Query (mapped to V3 implementation)
  patients: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 PATIENTS query called with limit: ${limit}, offset: ${offset}`,
      );

      // Query real PostgreSQL database - same as V3 but simpler response
      const query = `
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          CONCAT(first_name, ' ', last_name) as name,
          email,
          phone_primary as phone,
          date_of_birth as "dateOfBirth",
          gender,
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM patients 
        WHERE is_active = true AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await _context.database.executeQuery(query, [
        limit,
        offset,
      ]);
      console.log(`🔍 PATIENTS found ${result.rows.length} patients`);

      return result.rows;
    } catch (error) {
      console.error("Patients query error:", error as Error);
      return [];
    }
  },

  // Patients V3 - Veritas Enhanced
  patientsV3: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 PATIENTS V3 query called with limit: ${limit}, offset: ${offset}`,
      );
      console.log(`🔍 Context veritas available: ${!!context.veritas}`);

      // Query real PostgreSQL database
      const query = `
        SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName", 
          CONCAT(first_name, ' ', last_name) as name,
          email,
          phone_primary as phone,
          date_of_birth as "dateOfBirth",
          gender,
          address_street as "addressStreet",
          address_city as "addressCity",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM patients 
        WHERE is_active = true AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await context.database.executeQuery(query, [
        limit,
        offset,
      ]);
      console.log(`🔍 PATIENTS V3 found ${result.rows.length} patients`);

      return result.rows;
    } catch (error) {
      console.error("PatientsV3 query error:", error as Error);
      return [];
    }
  },

  patientV3: async (
    _: any,
    { id }: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    try {
      console.log(`🔍 PATIENT V3 query called with id: ${id}`);
      console.log(`🔍 Context veritas available: ${!!_context.veritas}`);

      // Mock data for testing - can be enhanced with real database integration later
      const mockPatients = [
        {
          id: "patient-001",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@email.com",
          phone: "+1-555-0123",
          dateOfBirth: "1985-03-15",
          gender: "MALE",
          address: {
            street: "123 Main St",
            city: "Springfield",
            state: "IL",
            zipCode: "62701",
            country: "USA",
          },
          emergencyContact: {
            name: "Jane Doe",
            relationship: "Spouse",
            phone: "+1-555-0124",
          },
          insurance: {
            provider: "Blue Cross Blue Shield",
            policyNumber: "BCBS123456789",
            groupNumber: "GRP001",
          },
          medicalHistory:
            "No significant medical history. Regular dental checkups.",
          allergies: ["Penicillin"],
          medications: ["Multivitamin daily"],
          preferredLanguage: "English",
          isActive: true,
          lastVisit: "2024-01-15T10:00:00Z",
          nextAppointment: "2024-02-15T14:00:00Z",
          createdAt: "2023-01-15T09:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z",
        },
        {
          id: "patient-002",
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@email.com",
          phone: "+1-555-0567",
          dateOfBirth: "1992-07-22",
          gender: "FEMALE",
          address: {
            street: "456 Oak Ave",
            city: "Springfield",
            state: "IL",
            zipCode: "62702",
            country: "USA",
          },
          emergencyContact: {
            name: "Mike Johnson",
            relationship: "Husband",
            phone: "+1-555-0568",
          },
          insurance: {
            provider: "Aetna",
            policyNumber: "AET987654321",
            groupNumber: "GRP002",
          },
          medicalHistory: "Hypertension, controlled with medication.",
          allergies: ["Sulfa drugs"],
          medications: ["Lisinopril 10mg daily", "Calcium supplement"],
          preferredLanguage: "English",
          isActive: true,
          lastVisit: "2024-01-10T09:30:00Z",
          nextAppointment: "2024-02-10T10:00:00Z",
          createdAt: "2023-03-20T14:00:00Z",
          updatedAt: "2024-01-10T10:30:00Z",
        },
        {
          id: "patient-003",
          firstName: "Carlos",
          lastName: "Rodriguez",
          email: "carlos.rodriguez@email.com",
          phone: "+1-555-0890",
          dateOfBirth: "1978-11-08",
          gender: "MALE",
          address: {
            street: "789 Pine St",
            city: "Springfield",
            state: "IL",
            zipCode: "62703",
            country: "USA",
          },
          emergencyContact: {
            name: "Maria Rodriguez",
            relationship: "Wife",
            phone: "+1-555-0891",
          },
          insurance: {
            provider: "United Healthcare",
            policyNumber: "UHC456789123",
            groupNumber: "GRP003",
          },
          medicalHistory: "Type 2 Diabetes, well controlled.",
          allergies: ["Codeine"],
          medications: ["Metformin 500mg twice daily", "Vitamin D"],
          preferredLanguage: "Spanish",
          isActive: true,
          lastVisit: "2024-01-05T15:00:00Z",
          nextAppointment: "2024-02-05T16:00:00Z",
          createdAt: "2022-11-08T10:00:00Z",
          updatedAt: "2024-01-05T16:00:00Z",
        },
      ];

      const patient = mockPatients.find((_p: any) => _p.id === id) || null;
      console.log(`🔍 PatientV3 found: ${!!patient}`);

      if (patient) {
        console.log(`🔍 PatientV3 data:`, patient);
        // Return patient data - field resolvers will handle @veritas verification
        return patient;
      }

      return null;
    } catch (error) {
      console.error("PatientV3 query error:", error as Error);
      return null;
    }
  },
};


