import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

// Simple GraphQL schema for proof of concept
const typeDefs = `
  type Patient {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String
    phone: String
    phoneSecondary: String
    dateOfBirth: String
    age: Int
    gender: String
    addressStreet: String
    addressCity: String
    addressState: String
    addressPostalCode: String
    addressCountry: String
    fullAddress: String
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    medicalConditions: String
    medicationsCurrent: String
    allergies: String
    anxietyLevel: String
    specialNeeds: String
    insuranceProvider: String
    insurancePolicyNumber: String
    insuranceGroupNumber: String
    consentToTreatment: Boolean!
    consentToContact: Boolean!
    preferredContactMethod: String
    notes: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PatientConnection {
    edges: [PatientEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PatientEdge {
    node: Patient!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  input PatientSearchFilters {
    search: String
    isActive: Boolean
    gender: String
    city: String
    state: String
  }

  input CreatePatientInput {
    firstName: String!
    lastName: String!
    email: String
    phone: String
    phoneSecondary: String
    dateOfBirth: String
    gender: String
    addressStreet: String
    addressCity: String
    addressState: String
    addressPostalCode: String
    addressCountry: String
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    medicalConditions: String
    medicationsCurrent: String
    allergies: String
    anxietyLevel: String
    specialNeeds: String
    insuranceProvider: String
    insurancePolicyNumber: String
    insuranceGroupNumber: String
    consentToTreatment: Boolean!
    consentToContact: Boolean!
    preferredContactMethod: String
    notes: String
  }

  input UpdatePatientInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    phoneSecondary: String
    dateOfBirth: String
    gender: String
    addressStreet: String
    addressCity: String
    addressState: String
    addressPostalCode: String
    addressCountry: String
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    medicalConditions: String
    medicationsCurrent: String
    allergies: String
    anxietyLevel: String
    specialNeeds: String
    insuranceProvider: String
    insurancePolicyNumber: String
    insuranceGroupNumber: String
    consentToTreatment: Boolean
    consentToContact: Boolean
    preferredContactMethod: String
    notes: String
  }

  type Query {
    patients(
      first: Int
      after: String
      filters: PatientSearchFilters
    ): PatientConnection!
    patient(id: ID!): Patient
  }

  type Mutation {
    createPatient(input: CreatePatientInput!): Patient!
    updatePatient(id: ID!, input: UpdatePatientInput!): Patient!
    deletePatient(id: ID!): Boolean!
    activatePatient(id: ID!): Patient!
    deactivatePatient(id: ID!): Patient!
  }
`;

// Mock data for proof of concept
let patients = [
  {
    id: "1",
    firstName: "Juan",
    lastName: "Pérez",
    fullName: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+54 261 123-4567",
    phoneSecondary: null,
    dateOfBirth: "1985-03-15",
    age: 39,
    gender: "male",
    addressStreet: "San Martín 1234",
    addressCity: "Mendoza",
    addressState: "Mendoza",
    addressPostalCode: "5500",
    addressCountry: "Argentina",
    fullAddress: "San Martín 1234, Mendoza, Mendoza 5500, Argentina",
    emergencyContactName: "María Pérez",
    emergencyContactPhone: "+54 261 987-6543",
    emergencyContactRelationship: "wife",
    medicalConditions: "Hipertensión",
    medicationsCurrent: "Enalapril 10mg",
    allergies: "Penicilina",
    anxietyLevel: "low",
    specialNeeds: null,
    insuranceProvider: "OSDE",
    insurancePolicyNumber: "123456789",
    insuranceGroupNumber: "GROUP001",
    consentToTreatment: true,
    consentToContact: true,
    preferredContactMethod: "phone",
    notes: "Paciente regular, buen cumplimiento del tratamiento",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-06T12:00:00Z"
  },
  {
    id: "2",
    firstName: "Ana",
    lastName: "García",
    fullName: "Ana García",
    email: "ana.garcia@email.com",
    phone: "+54 261 234-5678",
    phoneSecondary: "+54 261 345-6789",
    dateOfBirth: "1990-07-22",
    age: 34,
    gender: "female",
    addressStreet: "Belgrano 567",
    addressCity: "Mendoza",
    addressState: "Mendoza",
    addressPostalCode: "5500",
    addressCountry: "Argentina",
    fullAddress: "Belgrano 567, Mendoza, Mendoza 5500, Argentina",
    emergencyContactName: "Carlos García",
    emergencyContactPhone: "+54 261 456-7890",
    emergencyContactRelationship: "husband",
    medicalConditions: null,
    medicationsCurrent: null,
    allergies: null,
    anxietyLevel: "medium",
    specialNeeds: null,
    insuranceProvider: "Swiss Medical",
    insurancePolicyNumber: "987654321",
    insuranceGroupNumber: "GROUP002",
    consentToTreatment: true,
    consentToContact: true,
    preferredContactMethod: "email",
    notes: "Primera visita, paciente ansiosa",
    isActive: true,
    createdAt: "2024-02-20T14:30:00Z",
    updatedAt: "2024-11-06T12:00:00Z"
  }
];

let nextId = 3;

// Resolvers
const resolvers = {
  Query: {
    patients: (_, { first = 10, after, filters = {} }) => {
      let filteredPatients = [...patients];

      // Apply filters
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredPatients = filteredPatients.filter(patient =>
          patient.firstName.toLowerCase().includes(search) ||
          patient.lastName.toLowerCase().includes(search) ||
          patient.email?.toLowerCase().includes(search) ||
          patient.phone?.includes(search)
        );
      }

      if (filters.isActive !== undefined) {
        filteredPatients = filteredPatients.filter(patient => patient.isActive === filters.isActive);
      }

      if (filters.gender) {
        filteredPatients = filteredPatients.filter(patient => patient.gender === filters.gender);
      }

      if (filters.city) {
        filteredPatients = filteredPatients.filter(patient => patient.addressCity === filters.city);
      }

      // Pagination
      const startIndex = after ? parseInt(after) : 0;
      const endIndex = startIndex + (first || 10);
      const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

      const edges = paginatedPatients.map((patient, index) => ({
        node: patient,
        cursor: (startIndex + index).toString()
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: endIndex < filteredPatients.length,
          hasPreviousPage: startIndex > 0,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        },
        totalCount: filteredPatients.length
      };
    },

    patient: (_, { id }) => {
      return patients.find(p => p.id === id) || null;
    }
  },

  Mutation: {
    createPatient: (_, { input }) => {
      const newPatient = {
        id: nextId.toString(),
        ...input,
        fullName: `${input.firstName} ${input.lastName}`,
        fullAddress: input.addressStreet && input.addressCity
          ? `${input.addressStreet}, ${input.addressCity}, ${input.addressState || ''} ${input.addressPostalCode || ''}, ${input.addressCountry || 'Argentina'}`
          : null,
        age: input.dateOfBirth
          ? new Date().getFullYear() - new Date(input.dateOfBirth).getFullYear()
          : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      patients.push(newPatient);
      nextId++;

      return newPatient;
    },

    updatePatient: (_, { id, input }) => {
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Patient not found');

      const updatedPatient = {
        ...patients[index],
        ...input,
        fullName: input.firstName && input.lastName
          ? `${input.firstName} ${input.lastName}`
          : patients[index].fullName,
        fullAddress: (input.addressStreet || patients[index].addressStreet) && (input.addressCity || patients[index].addressCity)
          ? `${input.addressStreet || patients[index].addressStreet}, ${input.addressCity || patients[index].addressCity}, ${input.addressState || patients[index].addressState || ''} ${input.addressPostalCode || patients[index].addressPostalCode || ''}, ${input.addressCountry || patients[index].addressCountry || 'Argentina'}`
          : patients[index].fullAddress,
        age: input.dateOfBirth
          ? new Date().getFullYear() - new Date(input.dateOfBirth).getFullYear()
          : patients[index].age,
        updatedAt: new Date().toISOString()
      };

      patients[index] = updatedPatient;
      return updatedPatient;
    },

    deletePatient: (_, { id }) => {
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) return false;

      patients.splice(index, 1);
      return true;
    },

    activatePatient: (_, { id }) => {
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Patient not found');

      patients[index].isActive = true;
      patients[index].updatedAt = new Date().toISOString();
      return patients[index];
    },

    deactivatePatient: (_, { id }) => {
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Patient not found');

      patients[index].isActive = false;
      patients[index].updatedAt = new Date().toISOString();
      return patients[index];
    }
  }
};

// Create Express app
const app = express();
const httpServer = http.createServer(app);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start server
async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
      }),
    }),
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await new Promise((resolve) => {
    httpServer.listen({ port: 8005 }, () => {
      console.log('🚀 GraphQL Proof of Concept Server ready at http://localhost:8005/graphql');
      console.log('📊 Health check at http://localhost:8005/health');
      console.log('📋 Available at: http://localhost:8005/graphql');
      resolve(void 0);
    });
  });
}

startServer().catch(console.error);