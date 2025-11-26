/**
 * 🔥 SELENE SONG CORE GRAPHQL SCHEMA
 * By PunkClaude & RaulVisionario - September 23, 2025
 *
 * MISSION: GraphQL Schema for Selene Song Core 3.0
 * TARGET: Complete GraphQL integration with Nuclear modules
 */

export const typeDefs = `#graphql
  # 📅 CUSTOM SCALARS
  scalar DateString  # YYYY-MM-DD format (e.g., "1990-01-01")
  scalar JSON  # Generic JSON type for complex objects
  
  # 🎯 PATIENTS - V169 Schema Bridge Compatible
  type Patient {
    id: ID!
    # V169 Bridge: name combina firstName + lastName desde apollo_patients view
    name: String!
    firstName: String
    lastName: String
    email: String
    # V169 Bridge: phone desde phone_primary en apollo_patients view
    phone: String
    dateOfBirth: DateString
    address: String
    # 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
    emergencyContact: String  # DEPRECATED: Para compatibilidad, devuelve JSON {name, phone}
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    insuranceProvider: String
    policyNumber: String
    medicalHistory: String
    billingStatus: String
    # 🔗 BLOCKCHAIN - Wallet address for DENTIA rewards
    walletAddress: String
    createdAt: String!
    updatedAt: String!
  }

  # 🩹 KAMIKAZE PATCH: PatientV3 SINCRONIZACIÓN TOTAL con FieldResolvers
  # Generado por Operación Directiva Final - 21 campos exactos de patient.ts
  # TODO DEUDA TÉCNICA: Eliminar cuando se limpien exports incorrectos de resolvers
  type PatientV3 {
    id: ID!
    firstName: String
    lastName: String
    email: String
    phone: String
    dateOfBirth: DateString
    gender: String
    address: String
    # 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
    emergencyContact: String  # DEPRECATED: Para compatibilidad, devuelve JSON {name, phone}
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    insurance: String  # JSON string - resolver devuelve parent.insurance
    allergies: [String]  # Array - resolver devuelve parent.allergies || []
    medications: [String]  # Array - resolver devuelve parent.medications || []
    preferredLanguage: String
    isActive: Boolean
    lastVisit: DateString
    nextAppointment: DateString
    policyNumber: String  # Extrae parent.insurance?.policyNumber
    medicalHistory: String
    # 🔗 BLOCKCHAIN - Wallet address for DENTIA rewards
    walletAddress: String
    createdAt: String!
    updatedAt: String!
  }

  input PatientInput {
    firstName: String!
    lastName: String!
    email: String
    phone: String
    dateOfBirth: DateString
    address: String
    # 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
    emergencyContact: String  # DEPRECATED: Para compatibilidad
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    insuranceProvider: String
    policyNumber: String
  }

  input UpdatePatientInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    dateOfBirth: DateString
    address: String
    # 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
    emergencyContact: String  # DEPRECATED: Para compatibilidad
    emergencyContactName: String
    emergencyContactPhone: String
    emergencyContactRelationship: String
    insuranceProvider: String
    policyNumber: String
    # 🔗 BLOCKCHAIN - Wallet address for DENTIA rewards
    walletAddress: String
  }

  # 📅 APPOINTMENTS - V169 Schema Bridge Compatible
  type Appointment {
    id: ID!
    patientId: ID!
    patient: Patient
    practitionerId: ID
    practitioner: User
    # V169 Bridge: date desde scheduled_date en apollo_appointments view
    date: String!
    # V169 Bridge: time desde scheduled_date en apollo_appointments view  
    time: String!
    # Campos originales mantenidos para compatibilidad
    appointmentDate: String
    appointmentTime: String
    duration: Int!
    type: String!
    status: String!
    notes: String
    treatmentDetails: String
    createdAt: String!
    updatedAt: String!
  }

  # 📅 APPOINTMENTSV3 - VERITAS ENHANCED (Nueva Era)
  type AppointmentV3 {
    id: ID!
    patientId: ID!
    patient: Patient
    practitionerId: ID
    practitioner: User
    appointmentDate: String!
    appointmentTime: String!
    scheduled_date: String
    duration: Int!
    type: String!
    status: String!
    notes: String
    treatmentDetails: String
    createdAt: String!
    updatedAt: String!
  }

  input AppointmentInput {
    patientId: ID!
    practitionerId: ID
    appointmentDate: String!
    appointmentTime: String!
    duration: Int!
    type: String!
    status: String
    notes: String
  }

  input UpdateAppointmentInput {
    patientId: ID
    practitionerId: ID
    appointmentDate: String
    appointmentTime: String
    duration: Int
    type: String
    status: String
    notes: String
  }

  # 👥 USERS
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String! # Computed: firstName + lastName
    role: String!
    isActive: Boolean!
    lastLoginAt: String
    createdAt: String!
    patientId: ID # 🏥 VITALPASS: Clinical patient ID (null for non-PATIENT roles)
  }

  # 🔐 AUTHENTICATION TYPES (V3 - VERITAS)
  type AuthResponse {
    accessToken: String!
    refreshToken: String!
    expiresIn: Int!
    user: User!
  }

  # 🏛️ EMPIRE ARCHITECTURE V2 - CLINIC SWITCHING
  type ClinicSwitchResponse {
    accessToken: String!
    expiresIn: Int!
    user: User!
    selectedClinic: Clinic
  }

  # 🏛️ EMPIRE ARCHITECTURE V2 - CLINIC TYPE
  type Clinic {
    id: ID!
    name: String!
    cifNif: String
    address: String
    city: String
    country: String
    defaultCurrency: String
    phone: String
    email: String
    logoUrl: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # 🗑️ DELETE RESULT TYPE (V3 - CONSISTENT RESPONSE)
  type DeleteResult {
    success: Boolean!
    message: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RefreshTokenInput {
    refreshToken: String!
  }

  # 🔐 PATIENT REGISTRATION (GDPR Article 9 Compliant)
  input RegisterPatientInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
    dateOfBirth: DateString
    address: String
    termsAccepted: Boolean! # GDPR consent - MUST be true
  }

  type RegisterPatientResponse {
    success: Boolean!
    message: String!
    accessToken: String!
    refreshToken: String!
    user: RegisteredUser!
    patient: RegisteredPatient!
  }

  type RegisteredUser {
    id: ID!
    email: String!
    role: String!
  }

  type RegisteredPatient {
    id: ID!
    firstName: String!
    lastName: String!
  }

  # 🏥 MEDICAL RECORDS
  # 🏥 MEDICAL RECORDS - V169 Schema Bridge Compatible  
  type MedicalRecord {
    id: ID!
    patientId: ID!
    patient: Patient
    practitionerId: ID!
    practitioner: User
    # V169 Bridge: date desde visit_date en apollo_medical_records view
    date: String!
    recordType: String!
    title: String!
    content: String!
    diagnosis: String
    treatment: String
    medications: [String!]
    attachments: [String!]
    createdAt: String!
    updatedAt: String!
  }

  input MedicalRecordInput {
    patientId: ID!
    practitionerId: ID!
    recordType: String!
    title: String!
    content: String!
    diagnosis: String
    treatment: String
    medications: [String!]
    attachments: [String!]
  }

  # 🏥 MEDICAL RECORDS V3 - VERITAS CRITICAL PROTECTION (Santuario Interior)
  type MedicalRecordV3 {
    id: ID!
    patientId: ID!
    patient: Patient
    practitionerId: ID!
    practitioner: User
    recordType: String!
    title: String!
    content: String!
    diagnosis: String
    treatmentPlan: String
    allergies: [String!]
    medications: [String!]
    vitalSigns: VitalSigns
    attachments: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type VitalSigns {
    bloodPressure: String!
    heartRate: Int!
    temperature: Float!
    oxygenSaturation: Int!
    weight: Float
    height: Float
    bmi: Float
  }

  input MedicalRecordV3Input {
    patientId: ID!
    practitionerId: ID!
    recordType: String!
    title: String!
    content: String!
    diagnosis: String
    treatmentPlan: String
    allergies: [String!]
    medications: [String!]
    vitalSigns: VitalSignsInput
    attachments: [String!]
  }

  input VitalSignsInput {
    bloodPressure: String!
    heartRate: Int!
    temperature: Float!
    oxygenSaturation: Int!
    weight: Float
    height: Float
    bmi: Float
  }

  input UpdateMedicalRecordV3Input {
    patientId: ID
    practitionerId: ID
    recordType: String
    title: String
    content: String
    diagnosis: String
    treatmentPlan: String
    allergies: [String!]
    medications: [String!]
    vitalSigns: VitalSignsInput
    attachments: [String!]
  }

  # 📄 DOCUMENTS V3 - VERITAS CRITICAL PROTECTION (Biblioteca Prohibida)
  type DocumentV3 {
    id: ID!
    
    # 🏥 MEDICAL DOMAIN - Patient-centric relationships
    patientId: ID!
    appointmentId: ID
    medicalRecordId: ID
    
    # 💰 ADMINISTRATIVE DOMAIN - Clinic operations
    treatmentId: ID
    purchaseOrderId: ID
    subscriptionId: ID
    
    # Core document fields
    uploaderId: ID!
    fileName: String!
    filePath: String!
    fileHash: String!
    fileSize: Int!
    mimeType: String!
    documentType: DocumentType!
    category: String
    tags: [String!]
    description: String
    isEncrypted: Boolean!
    encryptionKey: String
    accessLevel: AccessLevel!
    expiresAt: String
    downloadCount: Int!
    lastAccessedAt: String
    createdAt: String!
    updatedAt: String!
  }

  # 📄 UNIFIED DOCUMENTS V3 - FULL SCHEMA with AI & Medical Fields
  type UnifiedDocumentV3 {
    id: ID!
    
    # 🏥 MEDICAL DOMAIN - Patient-centric relationships
    patient_id: ID
    medical_record_id: ID
    appointment_id: ID
    
    # 💰 ADMINISTRATIVE DOMAIN - Clinic operations
    treatment_id: ID
    purchase_order_id: ID
    subscription_id: ID
    
    # Core document fields
    document_type: String
    title: String!
    description: String
    file_name: String!
    file_path: String!
    file_size: Int
    file_size_mb: Float
    mime_type: String
    file_extension: String
    is_image: Boolean
    is_xray: Boolean
    image_width: Int
    image_height: Int
    image_quality: Float
    tooth_numbers: [Int!]
    anatomical_region: String
    clinical_notes: String
    document_date: String
    expiry_date: String
    access_level: String
    is_confidential: Boolean
    password_protected: Boolean
    ai_analyzed: Boolean
    ai_analysis_results: JSON
    ai_confidence_scores: JSON
    ocr_extracted_text: String
    ai_tags: [String!]
    smart_tags: [String!]
    ai_anomalies_detected: Boolean
    created_at: String
    updated_at: String
    created_by: ID
    updated_by: ID
    unified_type: String
    legal_category: String
    download_url: String
    thumbnail_url: String
    compliance_status: String
    patient: PatientReference
  }

  type PatientReference {
    id: ID!
    first_name: String!
    last_name: String!
  }

  # 📦 INVENTORY V3 - VERITAS CRITICAL PROTECTION
  type InventoryV3 {
    id: ID!
    itemName: String!
    itemCode: String!
    supplierId: String!
    category: String!
    quantity: Int!
    unitPrice: Float!
    description: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    # Anidado
    supplier: SupplierV3
  }

  # 🧪 MATERIAL V3 - Dental Materials from Suppliers
  type MaterialV3 {
    id: ID!
    name: String
    description: String
    category: String
    unitCost: Float
    unit: String
    quantityInStock: Int
    reorderPoint: Int
    supplierId: ID
    createdAt: String
    updatedAt: String
    # Anidados
    supplier: SupplierV3
    suppliers: [SupplierV3!]
  }

  # 💰 BILLING DATA V3 - VERITAS CRITICAL PROTECTION
  type BillingDataV3 {
    id: ID!
    patientId: ID!
    invoiceNumber: String!
    subtotal: Float!
    taxRate: Float
    taxAmount: Float
    discountAmount: Float
    totalAmount: Float!
    currency: String!
    issueDate: String!
    dueDate: String
    paidDate: String
    status: BillingStatus!
    paymentTerms: String
    notes: String
    veritasSignature: String
    blockchainTxHash: String
    createdBy: ID
    createdAt: String!
    updatedAt: String!
    
    # 💰 ECONOMIC SINGULARITY (Directiva #005)
    treatmentId: ID
    materialCost: Float
    profitMargin: Float
  }

  # 📋 COMPLIANCE V3 - VERITAS CRITICAL PROTECTION
  type ComplianceV3 {
    id: ID!
    patientId: ID!
    regulationId: String!
    complianceStatus: ComplianceStatus!
    description: String
    lastChecked: String
    nextCheck: String
    createdAt: String!
    updatedAt: String!
  }

  enum DocumentType {
    XRAY
    MRI
    CT_SCAN
    ULTRASOUND
    BLOOD_TEST
    PRESCRIPTION
    TREATMENT_PLAN
    CONSENT_FORM
    INSURANCE_CLAIM
    MEDICAL_HISTORY
    OTHER
  }

  enum AccessLevel {
    PUBLIC
    INTERNAL
    CONFIDENTIAL
    RESTRICTED
  }

  enum BillingStatus {
    PENDING
    PAID
    OVERDUE
    CANCELLED
  }

  enum ComplianceStatus {
    COMPLIANT
    NON_COMPLIANT
    PENDING
    UNDER_REVIEW
  }

  input DocumentV3Input {
    # 🏥 MEDICAL DOMAIN - Patient-centric relationships
    patientId: ID!
    appointmentId: ID
    medicalRecordId: ID
    
    # 💰 ADMINISTRATIVE DOMAIN - Clinic operations
    treatmentId: ID
    purchaseOrderId: ID
    subscriptionId: ID
    
    # Core document fields
    uploaderId: ID!
    fileName: String!
    filePath: String!
    fileHash: String!
    fileSize: Int!
    mimeType: String!
    documentType: DocumentType!
    category: String
    tags: [String!]
    description: String
    isEncrypted: Boolean
    encryptionKey: String
    accessLevel: AccessLevel
    expiresAt: String
  }

  input UpdateDocumentV3Input {
    # 🏥 MEDICAL DOMAIN - Patient-centric relationships
    patientId: ID
    appointmentId: ID
    medicalRecordId: ID
    
    # 💰 ADMINISTRATIVE DOMAIN - Clinic operations
    treatmentId: ID
    purchaseOrderId: ID
    subscriptionId: ID
    
    # Core document fields
    uploaderId: ID
    fileName: String
    filePath: String
    fileHash: String
    fileSize: Int
    mimeType: String
    documentType: DocumentType
    category: String
    tags: [String!]
    description: String
    isEncrypted: Boolean
    encryptionKey: String
    accessLevel: AccessLevel
    expiresAt: String
  }

  # 🔔 NOTIFICATIONS V3 - REAL DATA + GDPR AUDIT TRAIL
  type NotificationV3 {
    id: ID!
    patientId: ID!
    type: NotificationType!
    channel: NotificationChannel!
    title: String!
    message: String!
    priority: NotificationPriority!
    status: NotificationStatus!
    sentAt: String!
    readAt: String
    metadata: JSON
    createdAt: String!
    updatedAt: String!
  }

  type NotificationPreferencesV3 {
    id: ID!
    patientId: ID!
    smsEnabled: Boolean!
    emailEnabled: Boolean!
    pushEnabled: Boolean!
    appointmentReminders: Boolean!
    billingAlerts: Boolean!
    treatmentUpdates: Boolean!
    marketingEmails: Boolean!
    updatedAt: String!
  }

  enum NotificationType {
    APPOINTMENT_REMINDER
    APPOINTMENT_CONFIRMED
    APPOINTMENT_CANCELLED
    BILLING_DUE
    BILLING_PAID
    TREATMENT_UPDATED
    DOCUMENT_SHARED
    SYSTEM_ALERT
    PRESCRIPTION_READY
  }

  enum NotificationChannel {
    EMAIL
    SMS
    IN_APP
    PUSH
  }

  enum NotificationPriority {
    LOW
    NORMAL
    HIGH
    URGENT
  }

  enum NotificationStatus {
    PENDING
    SENT
    READ
    FAILED
  }

  input NotificationPreferencesInput {
    smsEnabled: Boolean
    emailEnabled: Boolean
    pushEnabled: Boolean
    appointmentReminders: Boolean
    billingAlerts: Boolean
    treatmentUpdates: Boolean
    marketingEmails: Boolean
  }

  input InventoryV3Input {
    itemName: String!
    itemCode: String!
    supplierId: String!
    category: String!
    quantity: Int!
    unitPrice: Float!
    description: String
    isActive: Boolean
  }

  input UpdateInventoryV3Input {
    itemName: String
    itemCode: String
    supplierId: String
    category: String
    quantity: Int
    unitPrice: Float
    description: String
    isActive: Boolean
  }

  input BillingDataV3Input {
    patientId: ID!
    invoiceNumber: String!
    subtotal: Float!
    taxRate: Float
    taxAmount: Float
    discountAmount: Float
    totalAmount: Float!
    currency: String
    issueDate: String
    dueDate: String
    status: BillingStatus
    paymentTerms: String
    notes: String
    createdBy: ID
    
    # 💰 ECONOMIC SINGULARITY (Directiva #005)
    treatmentId: ID
  }

  input UpdateBillingDataV3Input {
    subtotal: Float
    taxRate: Float
    taxAmount: Float
    discountAmount: Float
    totalAmount: Float
    currency: String
    issueDate: String
    dueDate: String
    status: BillingStatus
    paymentTerms: String
    notes: String
  }

  input ComplianceV3Input {
    patientId: ID!
    regulationId: String!
    complianceStatus: ComplianceStatus!
    description: String
    lastChecked: String
    nextCheck: String
  }

  input UpdateComplianceV3Input {
    patientId: ID
    regulationId: String
    complianceStatus: ComplianceStatus
    description: String
    lastChecked: String
    nextCheck: String
  }

  # 🩺 TREATMENTS (Selene Song Core Enhanced)
  type Treatment {
    id: ID!
    patientId: ID!
    patient: Patient
    practitionerId: ID!
    practitioner: User
    treatmentType: String!
    description: String!
    status: String!
    startDate: String!
    endDate: String
    cost: Float
    notes: String
    aiRecommendations: [String!]
    veritasScore: Float
    createdAt: String!
    updatedAt: String!
  }

  input TreatmentInput {
    patientId: ID!
    practitionerId: ID!
    treatmentType: String!
    description: String!
    startDate: String!
    endDate: String
    cost: Float
    notes: String
  }

  # 🩺 TREATMENTS V3 - VERITAS ENHANCED (Nueva Era)
  type TreatmentV3 {
    id: ID!
    patientId: ID!
    patient: Patient
    practitionerId: ID!
    practitioner: User
    treatmentType: String!
    description: String!
    status: String!
    startDate: String!
    endDate: String
    cost: Float
    notes: String
    aiRecommendations: [String!]
    veritasScore: Float
    createdAt: String!
    updatedAt: String!
  }

  input TreatmentV3Input {
    patientId: ID!
    practitionerId: ID!
    treatmentType: String!
    description: String!
    startDate: String!
    endDate: String
    cost: Float
    notes: String
  }

  input UpdateTreatmentV3Input {
    patientId: ID
    practitionerId: ID
    treatmentType: String
    description: String
    status: String
    startDate: String
    endDate: String
    cost: Float
    notes: String
  }

  # Treatment Recommendations V3 - AI Generated
  type TreatmentRecommendationV3 {
    id: ID!
    treatmentType: String!
    description: String!
    estimatedCost: Float!
    priority: String!
    reasoning: String!
    confidence: Float!
    recommendedDate: String!
  }

  # 🦷💀 ODONTOGRAM 3D V3 - QUANTUM DENTAL VISUALIZATION
  type OdontogramDataV3 {
    id: ID!
    patientId: ID!
    patient: Patient
    teeth: [ToothDataV3!]!
    lastUpdated: String!
    createdAt: String!
  }

  type ToothDataV3 {
    id: ID!
    toothNumber: Int!
    status: ToothStatus!
    condition: String
    surfaces: [ToothSurfaceV3!]
    notes: String
    lastTreatmentDate: String
    color: String
    position: ToothPositionV3
  }

  type ToothSurfaceV3 {
    surface: String!
    status: String!
    notes: String
  }

  type ToothPositionV3 {
    x: Float!
    y: Float!
    z: Float!
  }

  enum ToothStatus {
    HEALTHY
    CAVITY
    FILLING
    CROWN
    EXTRACTED
    IMPLANT
    ROOT_CANAL
    CHIPPED
    CRACKED
    MISSING
  }

  input UpdateToothStatusV3Input {
    toothNumber: Int!
    status: ToothStatus!
    condition: String
    notes: String
    surfaces: [ToothSurfaceInput!]
  }

  input ToothSurfaceInput {
    surface: String!
    status: String!
    notes: String
  }

  # 🏥 CLINIC RESOURCE V3 - VERITAS ENHANCED (Nueva Era)
  type ClinicResourceV3 {
    # Treatment Rooms
    treatmentRooms: [TreatmentRoomV3!]!
    treatmentRoom(id: ID!): TreatmentRoomV3
    
    # Dental Equipment
    dentalEquipment: [DentalEquipmentV3!]!
    dentalEquipmentById(id: ID!): DentalEquipmentV3
    
    # Maintenance & Cleaning
    maintenanceSchedule: [MaintenanceScheduleV3!]!
    cleaningSchedule: [RoomCleaningScheduleV3!]!
    
    # Analytics
    stats: ClinicResourceStatsV3
    utilization(startDate: String!, endDate: String!): [ResourceUtilizationV3!]!
  }

  type TreatmentRoomV3 {
    id: ID!
    name: String!
    roomNumber: String!
    type: TreatmentRoomType!
    status: TreatmentRoomStatus!
    capacity: Int!
    equipment: [DentalEquipmentV3!]!
    isActive: Boolean!
    lastCleaning: String
    nextCleaningDue: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type DentalEquipmentV3 {
    id: ID!
    name: String!
    type: DentalEquipmentType!
    status: DentalEquipmentStatus!
    manufacturer: String!
    model: String!
    serialNumber: String!
    purchaseDate: String!
    warrantyExpiry: String
    lastMaintenance: String
    nextMaintenanceDue: String
    location: String!
    assignedRoomId: ID
    assignedRoom: TreatmentRoomV3
    isActive: Boolean!
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type MaintenanceScheduleV3 {
    id: ID!
    equipmentId: ID!
    equipment: DentalEquipmentV3
    scheduledDate: String!
    completedDate: String
    maintenanceType: MaintenanceType!
    description: String!
    technician: String
    cost: Float
    status: MaintenanceStatus!
    priority: MaintenancePriority!
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type RoomCleaningScheduleV3 {
    id: ID!
    roomId: ID!
    room: TreatmentRoomV3
    scheduledDate: String!
    completedDate: String
    cleaningType: CleaningType!
    staffMember: String
    status: CleaningStatus!
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type ClinicResourceStatsV3 {
    totalRooms: Int!
    activeRooms: Int!
    totalEquipment: Int!
    activeEquipment: Int!
    maintenanceOverdue: Int!
    cleaningOverdue: Int!
    equipmentUtilization: Float!
    roomUtilization: Float!
    maintenanceCosts: Float!
    equipmentAges: EquipmentAgesV3!
  }

  type EquipmentAgesV3 {
    average: Float!
    oldest: Int!
    newest: Int!
  }

  type ResourceUtilizationV3 {
    date: String!
    roomUtilization: [RoomUtilizationV3!]!
    equipmentUtilization: [EquipmentUtilizationV3!]!
  }

  type RoomUtilizationV3 {
    roomId: ID!
    roomName: String!
    utilizationPercentage: Float!
    totalAppointments: Int!
    averageDuration: Float!
  }

  type EquipmentUtilizationV3 {
    equipmentId: ID!
    equipmentName: String!
    utilizationHours: Float!
    maintenanceHours: Float!
    downtimeHours: Float!
  }

  # Enums for Clinic Resources
  enum TreatmentRoomType {
    GENERAL
    SURGERY
    ORTHODONTICS
    PEDIATRICS
    COSMETIC
    EMERGENCY
  }

  enum TreatmentRoomStatus {
    AVAILABLE
    OCCUPIED
    MAINTENANCE
    CLEANING
    OUT_OF_ORDER
  }

  enum DentalEquipmentType {
    XRAY_MACHINE
    ULTRASOUND
    LASER
    SCALER
    DRILL
    LIGHT
    STERILIZER
    SUCTION
    COMPRESSOR
    MONITOR
    CHAIR
    INSTRUMENT
  }

  enum DentalEquipmentStatus {
    ACTIVE
    MAINTENANCE
    OUT_OF_ORDER
    DEPRECATED
    DISPOSED
  }

  enum MaintenanceType {
    ROUTINE
    REPAIR
    CALIBRATION
    SOFTWARE_UPDATE
    HARDWARE_REPLACEMENT
  }

  enum MaintenancePriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum MaintenanceStatus {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    OVERDUE
  }

  enum CleaningType {
    DAILY
    DEEP
    STERILIZATION
    DISINFECTION
  }

  enum CleaningStatus {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    OVERDUE
  }

  # 🔬 SELENE SONG CORE SYSTEM STATUS
  type NuclearSystemStatus {
    reactor: String!
    radiation: String!
    fusion: String!
    containment: String!
    veritas: Float!
    consciousness: String!
    offline: Boolean!
    healing: String!
    prediction: String!
    uptime: Float!
    timestamp: String!
  }

  type NuclearHealth {
    overall: String!
    components: [ComponentHealth!]!
    timestamp: String!
  }

  type ComponentHealth {
    name: String!
    status: String!
    lastCheck: String!
    metrics: String
  }

  # ⚡ QUANTUM RESURRECTION RESULT - Veritas V4.0 Nuclear Core Reconstruction
  type QuantumResurrectionResult {
    success: Boolean!
    message: String!
    certificateChainLength: Int!
    integrityScore: Float!
    timestamp: String!
    nuclearStatus: NuclearSystemStatus!
  }

  # � AUDIT & VERIFICATION TYPES (PHASE 3 Dashboard)
  """
  Un registro individual del log de auditoría.
  Captura cada mutación con before/after state.
  """
  type AuditLogEntry {
    id: ID!
    entityType: String!
    entityId: String!
    operation: String!
    oldValues: JSON
    newValues: JSON
    changedFields: [String!]
    userId: String
    userEmail: String
    ipAddress: String
    integrityStatus: String!
    timestamp: String!
    createdAt: String!
  }

  """
  El historial completo de una entidad.
  Muestra: mutations totales, history, state transitions, current state.
  """
  type EntityAuditTrail {
    entityType: String!
    entityId: String!
    totalMutations: Int!
    firstMutation: AuditLogEntry!
    lastMutation: AuditLogEntry!
    history: [AuditLogEntry!]!
    currentState: JSON
    stateTransitions: [StateTransition!]
  }

  """
  Una transición de estado individual (cambio de estado).
  """
  type StateTransition {
    from: JSON!
    to: JSON!
    operation: String!
    timestamp: String!
    userId: String
  }

  """
  Resumen de auditoría para el dashboard.
  Muestra: total de operaciones, fallos, warnings, score de integridad.
  """
  type VerificationDashboard {
    reportDate: String!
    totalOperations: Int!
    failedChecks: Int!
    criticalIssues: Int!
    warningIssues: Int!
    integrityScore: Float!
  }

  """
  Estadísticas de integridad en un rango de fechas.
  """
  type IntegrityStats {
    total: Int!
    valid: Int!
    warned: Int!
    failed: Int!
    blocked: Int!
    integrityPercentage: Float!
  }

  """
  Resumen de mutaciones por entity type.
  """
  type MutationByType {
    entityType: String!
    count: Int!
  }

  """
  Resumen de mutaciones por operación (CREATE, UPDATE, DELETE, etc).
  """
  type MutationStats {
    operation: String!
    count: Int!
  }

  """
  Usuario más activo.
  """
  type ActiveUser {
    userId: String!
    mutationCount: Int!
  }

  # �📊 QUERIES
  type Query {
    # 🔐 Authentication Queries (V3 - VERITAS)
    me: User
    
    # Health & Status
    health: String!
    nuclearStatus: NuclearSystemStatus!
    nuclearHealth: NuclearHealth!
    
    # Patients
    patients(limit: Int, offset: Int): [Patient!]!
    patient(id: ID!): Patient
    searchPatients(query: String!): [Patient!]!
    
    # Patients V3 - Veritas Enhanced
    patientsV3(limit: Int, offset: Int): [Patient!]!
    patientV3(id: ID!): Patient
    
    # Appointments
    appointments(limit: Int, offset: Int, patientId: ID): [Appointment!]!
    appointment(id: ID!): Appointment
    appointmentsByDate(date: String!): [Appointment!]!
    
    # AppointmentsV3 - Veritas Enhanced
    appointmentsV3(limit: Int, offset: Int, patientId: ID, startDate: String, endDate: String): [AppointmentV3!]!
    appointmentV3(id: ID!): AppointmentV3
    appointmentsV3ByDate(date: String!): [AppointmentV3!]!
    
    # Medical Records
    medicalRecords(patientId: ID, limit: Int, offset: Int): [MedicalRecord!]!
    medicalRecord(id: ID!): MedicalRecord
    
    # Medical Records V3 - Veritas Critical Protection
    medicalRecordsV3(patientId: ID, limit: Int, offset: Int): [MedicalRecordV3!]!
    medicalRecordV3(id: ID!): MedicalRecordV3
    
    # Documents V3 - Veritas Critical Protection
    documentsV3(
      patientId: ID
      appointmentId: ID
      medicalRecordId: ID
      treatmentId: ID
      purchaseOrderId: ID
      subscriptionId: ID
      limit: Int
      offset: Int
    ): [DocumentV3!]!
    documentV3(id: ID!): DocumentV3
    
    # Unified Documents V3 - Full Schema with AI & @veritas
    unifiedDocumentsV3(patientId: ID, limit: Int, offset: Int): [UnifiedDocumentV3!]!
    unifiedDocumentV3(id: ID!): UnifiedDocumentV3
    
    # Inventory V3 - Veritas Critical Protection
    inventoriesV3(category: String, limit: Int, offset: Int): [InventoryV3!]!
    inventoryV3(id: ID!): InventoryV3
    
    # Billing Data V3 - Veritas Critical Protection
    billingDataV3(patientId: ID, limit: Int, offset: Int): [BillingDataV3!]!
    billingDatumV3(id: ID!): BillingDataV3
    
    # Compliance V3 - Veritas Critical Protection
    compliancesV3(patientId: ID, limit: Int, offset: Int): [ComplianceV3!]!
    complianceV3(id: ID!): ComplianceV3
    
    # Treatments (Selene Song Core Enhanced)
    treatments(patientId: ID, limit: Int, offset: Int): [Treatment!]!
    treatment(id: ID!): Treatment
    treatmentRecommendations(patientId: ID!): [Treatment!]!
    
    # Treatments V3 - Veritas Enhanced
    treatmentsV3(patientId: ID, limit: Int, offset: Int): [TreatmentV3!]!
    treatmentV3(id: ID!): TreatmentV3
    treatmentRecommendationsV3(patientId: ID!): [TreatmentRecommendationV3!]!
    
    # Odontogram 3D V3 - Quantum Dental Visualization
    odontogramDataV3(patientId: ID!): OdontogramDataV3
    
    # Users
    users(limit: Int, offset: Int): [User!]!
    user(id: ID!): User

    # Clinic Resources V3 - Veritas Enhanced
    clinicResourcesV3: ClinicResourceV3!
    treatmentRoomsV3(limit: Int, offset: Int): [TreatmentRoomV3!]!
    treatmentRoomV3(id: ID!): TreatmentRoomV3
    dentalEquipmentV3(limit: Int, offset: Int): [DentalEquipmentV3!]!
    dentalEquipmentV3ById(id: ID!): DentalEquipmentV3
    maintenanceScheduleV3(limit: Int, offset: Int): [MaintenanceScheduleV3!]!
    cleaningScheduleV3(limit: Int, offset: Int): [RoomCleaningScheduleV3!]!
    clinicResourceStatsV3: ClinicResourceStatsV3
  }

  # ⚡ MUTATIONS
  type Mutation {
    # 🔐 Authentication Mutations (V3 - VERITAS)
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!
    refreshToken(input: RefreshTokenInput!): AuthResponse!
    
    # 🏛️ EMPIRE ARCHITECTURE V2 - CLINIC SWITCHING (Owner Mode)
    selectClinic(clinicId: ID!): ClinicSwitchResponse!
    exitClinic: ClinicSwitchResponse!
    
    # 🔐 Patient Registration (GDPR Article 9 Compliant)
    registerPatient(input: RegisterPatientInput!): RegisterPatientResponse!
    
    # Patients
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: UpdatePatientInput!): Patient!
    deletePatient(id: ID!): Boolean!
    
    # 🔗 BLOCKCHAIN: Update patient wallet address
    updatePatientWallet(walletAddress: String!): Patient!
    
    # Patients V3 - Veritas Enhanced (PURE V3 - NO LEGACY)
    createPatientV3(input: PatientInput!): Patient!
    updatePatientV3(id: ID!, input: UpdatePatientInput!): Patient!
    deletePatientV3(id: ID!): DeleteResult!
    
    # Appointments
    createAppointment(input: AppointmentInput!): Appointment!
    updateAppointment(id: ID!, input: UpdateAppointmentInput!): Appointment!
    deleteAppointment(id: ID!): Boolean!
    
    # AppointmentsV3 - Veritas Enhanced
    createAppointmentV3(input: AppointmentInput!): AppointmentV3!
    updateAppointmentV3(id: ID!, input: UpdateAppointmentInput!): AppointmentV3!
    deleteAppointmentV3(id: ID!): DeleteResult!
    
    # Medical Records
    createMedicalRecord(input: MedicalRecordInput!): MedicalRecord!
    updateMedicalRecord(id: ID!, input: MedicalRecordInput!): MedicalRecord!
    deleteMedicalRecord(id: ID!): Boolean!
    
    # Medical Records V3 - Veritas Critical Protection
    createMedicalRecordV3(input: MedicalRecordV3Input!): MedicalRecordV3!
    updateMedicalRecordV3(id: ID!, input: UpdateMedicalRecordV3Input!): MedicalRecordV3!
    deleteMedicalRecordV3(id: ID!): Boolean!
    
    # Documents V3 - Veritas Critical Protection
    createDocumentV3(input: DocumentV3Input!): DocumentV3!
    updateDocumentV3(id: ID!, input: UpdateDocumentV3Input!): DocumentV3!
    deleteDocumentV3(id: ID!): Boolean!
    
    # Unified Documents V3 Operations
    uploadUnifiedDocumentV3(input: DocumentV3Input!): UnifiedDocumentV3!
    
    # Inventory V3 - Veritas Critical Protection
    createInventoryV3(input: InventoryV3Input!): InventoryV3!
    updateInventoryV3(id: ID!, input: UpdateInventoryV3Input!): InventoryV3!
    deleteInventoryV3(id: ID!): Boolean!
    
    # Billing Data V3 - Veritas Critical Protection
    createBillingDataV3(input: BillingDataV3Input!): BillingDataV3!
    updateBillingDataV3(id: ID!, input: UpdateBillingDataV3Input!): BillingDataV3!
    deleteBillingDataV3(id: ID!): Boolean!
    
    # Compliance V3 - Veritas Critical Protection
    createComplianceV3(input: ComplianceV3Input!): ComplianceV3!
    updateComplianceV3(id: ID!, input: UpdateComplianceV3Input!): ComplianceV3!
    deleteComplianceV3(id: ID!): Boolean!
    
    # Treatments (Selene Song Core Enhanced)
    createTreatment(input: TreatmentInput!): Treatment!
    updateTreatment(id: ID!, input: TreatmentInput!): Treatment!
    deleteTreatment(id: ID!): Boolean!
    generateTreatmentPlan(patientId: ID!): [Treatment!]!
    
    # Treatments V3 - Veritas Enhanced
    createTreatmentV3(input: TreatmentV3Input!): TreatmentV3!
    updateTreatmentV3(id: ID!, input: UpdateTreatmentV3Input!): TreatmentV3!
    deleteTreatmentV3(id: ID!): DeleteResult!
    generateTreatmentPlanV3(patientId: ID!, conditions: [String!]!): [TreatmentRecommendationV3!]!
    
    # Odontogram 3D V3 - Quantum Dental Visualization
    updateToothStatusV3(patientId: ID!, input: UpdateToothStatusV3Input!): ToothDataV3!
    
    # Clinic Resources V3 - Veritas Enhanced
    createTreatmentRoomV3(input: TreatmentRoomInputV3!): TreatmentRoomV3!
    updateTreatmentRoomV3(id: ID!, input: UpdateTreatmentRoomInputV3!): TreatmentRoomV3!
    deleteTreatmentRoomV3(id: ID!): Boolean!
    
    createDentalEquipmentV3(input: DentalEquipmentInputV3!): DentalEquipmentV3!
    updateDentalEquipmentV3(id: ID!, input: UpdateDentalEquipmentInputV3!): DentalEquipmentV3!
    deleteDentalEquipmentV3(id: ID!): Boolean!
    
    scheduleMaintenanceV3(input: MaintenanceScheduleInputV3!): MaintenanceScheduleV3!
    completeMaintenanceV3(id: ID!, input: MaintenanceCompletionInputV3!): MaintenanceScheduleV3!
    cancelMaintenanceV3(id: ID!, reason: String): Boolean!
    createMaintenanceV3(input: CreateMaintenanceInputV3!): EquipmentMaintenanceV3!
    updateMaintenanceV3(id: ID!, input: UpdateMaintenanceInputV3!): EquipmentMaintenanceV3!
    
    scheduleRoomCleaningV3(input: RoomCleaningScheduleInputV3!): RoomCleaningScheduleV3!
    completeRoomCleaningV3(id: ID!, input: RoomCleaningCompletionInputV3!): RoomCleaningScheduleV3!

    # Nuclear Operations
    nuclearSelfHeal: Boolean!
    nuclearOptimize: Boolean!
    nuclearRestart: Boolean!

    # ⚡ Quantum Resurrection - Veritas V4.0 Nuclear Core Reconstruction
    quantumResurrection: QuantumResurrectionResult!
  }

  # 🔔 SUBSCRIPTIONS (Real-time)
  type Subscription {
    # Real-time updates
    patientCreated: Patient!
    patientUpdated: Patient!
    appointmentCreated: Appointment!
    appointmentUpdated: Appointment!
    appointmentV3Created: AppointmentV3!
    appointmentV3Updated: AppointmentV3!
    medicalRecordCreated: MedicalRecord!
    medicalRecordV3Created: MedicalRecordV3!
    medicalRecordV3Updated: MedicalRecordV3!
    medicalRecordV3Deleted: MedicalRecordV3!
    treatmentCreated: Treatment!
    
    # Odontogram 3D V3 - Real-time Updates
    odontogramUpdatedV3(patientId: ID!): OdontogramDataV3!
    
    # Documents V3 - Veritas Critical Protection
    documentV3Created: DocumentV3!
    documentV3Updated: DocumentV3!
    documentUploaded: DocumentV3!
    
    # Inventory V3 - Veritas Critical Protection
    inventoryV3Created: InventoryV3!
    inventoryV3Updated: InventoryV3!
    inventoryV3Deleted: InventoryV3!
    stockLevelChanged(itemId: ID!, newQuantity: Int!, threshold: Int!): InventoryV3!
    
    # Nuclear system events
    nuclearStatusUpdated: NuclearSystemStatus!
    nuclearHealthChanged: NuclearHealth!
    
    # Emergency alerts
    criticalAlert: String!

    # Clinic Resource V3 - Veritas Enhanced
    treatmentRoomV3Created: TreatmentRoomV3!
    treatmentRoomV3Updated: TreatmentRoomV3!
    dentalEquipmentV3Created: DentalEquipmentV3!
    dentalEquipmentV3Updated: DentalEquipmentV3!
    maintenanceV3Scheduled: MaintenanceScheduleV3!
    maintenanceV3Completed: MaintenanceScheduleV3!
    roomCleaningV3Scheduled: RoomCleaningScheduleV3!
    roomCleaningV3Completed: RoomCleaningScheduleV3!

    # Treatments V3 - Veritas Enhanced
    treatmentV3Created: TreatmentV3!
    treatmentV3Updated: TreatmentV3!
  }

  input TreatmentRoomInputV3 {
    name: String!
    roomNumber: String!
    type: TreatmentRoomType!
    capacity: Int!
    notes: String
  }

  input UpdateTreatmentRoomInputV3 {
    name: String
    roomNumber: String
    type: TreatmentRoomType
    status: TreatmentRoomStatus
    capacity: Int
    isActive: Boolean
    lastCleaning: String
    nextCleaningDue: String
    notes: String
  }

  input DentalEquipmentInputV3 {
    name: String!
    type: DentalEquipmentType!
    manufacturer: String!
    model: String!
    serialNumber: String!
    purchaseDate: String!
    warrantyExpiry: String
    location: String!
    assignedRoomId: ID
    notes: String
  }

  input UpdateDentalEquipmentInputV3 {
    name: String
    type: DentalEquipmentType
    status: DentalEquipmentStatus
    manufacturer: String
    model: String
    serialNumber: String
    purchaseDate: String
    warrantyExpiry: String
    lastMaintenance: String
    nextMaintenanceDue: String
    location: String
    assignedRoomId: ID
    isActive: Boolean
    notes: String
  }

  input MaintenanceScheduleInputV3 {
    equipmentId: ID!
    scheduledDate: String!
    maintenanceType: MaintenanceType!
    description: String!
    technician: String
    priority: MaintenancePriority!
    notes: String
  }

  input MaintenanceCompletionInputV3 {
    completedDate: String!
    cost: Float
    notes: String
  }

  input RoomCleaningScheduleInputV3 {
    roomId: ID!
    scheduledDate: String!
    cleaningType: CleaningType!
    notes: String
  }

  input RoomCleaningCompletionInputV3 {
    completedDate: String!
    staffMember: String!
    notes: String
  }

  # 🛒 MARKETPLACE V3 - B2B DENTAL SUPPLY SYSTEM
  # Sistema completo de marketplace B2B para suministros dentales

  type MarketplaceProductV3 {
    id: ID!
    name: String!
    description: String
    category: String!
    subcategory: String
    brand: String!
    manufacturer: String!
    sku: String!
    price: Float!
    originalPrice: Float
    discount: Float
    image: String!
    images: [String!]!
    stock: Int!
    minOrderQuantity: Int!
    supplier: SupplierV3!
    specifications: JSON
    certifications: [String!]
    warranty: String
    shipping: ShippingInfoV3!
    bulkPricing: [BulkPricingV3!]
    featured: Boolean!
    newArrival: Boolean!
    bestSeller: Boolean!
    riskLevel: RiskLevel
    encryptedDelivery: Boolean
    blackMarketPrice: Float
    premiumFeatures: [String!]
    createdAt: String!
    updatedAt: String!
    
  }

  # ========================================
  # INVENTORY V3 - Dental Materials & Equipment
  # ========================================
  
  type DentalMaterialV3 {
    id: ID!
    name: String!
    category: String
    unit: String
    currentStock: Float
    minimumStock: Float
    unitCost: Float
    supplier: String
    expiryDate: String
    batchNumber: String
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type EquipmentV3 {
    id: ID!
    name: String!
    model: String
    serialNumber: String
    manufacturer: String
    equipmentType: String
    roomId: Int
    status: String
    purchaseDate: String
    warrantyExpiry: String
    lastMaintenance: String
    nextMaintenanceDue: String
    purchaseCost: Float
    currentValue: Float
    depreciationRate: Float
    powerRequirements: String
    maintenanceIntervalDays: Int
    operatingHours: Int
    isActive: Boolean
    notes: String
    createdAt: String
    updatedAt: String
  }

  # 🔧 MAINTENANCE V3 - Equipment Maintenance Records
  type MaintenanceV3 {
    id: ID!
    equipmentId: ID
    maintenanceType: String
    description: String
    performedBy: String
    cost: Float
    scheduledDate: String
    completedDate: String
    nextMaintenanceDate: String
    status: String
    findings: String
    recommendations: String
    createdAt: String
    updatedAt: String
    # Anidado
    equipment: EquipmentV3
  }

  # ========================================
  # MARKETPLACE V3 - Suppliers & Orders
  # ========================================

  type SupplierV3 {
    id: ID!
    name: String!
    contactPerson: String
    email: String
    phone: String
    address: String
    paymentTerms: String
    deliveryTimeDays: Int
    minimumOrderValue: Float
    rating: Float
    isActive: Boolean
    notes: String
    createdAt: String
    updatedAt: String
    # Anidados
    materials: [MaterialV3!]
    purchaseOrders: [PurchaseOrderV3!]
  }

  type PurchaseOrderV3 {
    id: ID!
    orderNumber: String!
    supplierId: ID!
    supplier: SupplierV3
    orderDate: String
    expectedDeliveryDate: String
    actualDeliveryDate: String
    status: String
    totalAmount: Float
    taxAmount: Float
    discountAmount: Float
    notes: String
    approvedBy: String
    receivedBy: String
    createdAt: String
    updatedAt: String
    # Anidado
    items: [PurchaseOrderItemV3!]
  }

  type EquipmentMaintenanceV3 {
    id: ID!
    equipmentId: ID!
    maintenanceType: String!
    description: String
    performedBy: String
    cost: Float
    scheduledDate: String
    completedDate: String
    nextMaintenanceDate: String
    status: String
    findings: String
    recommendations: String
    createdAt: String
    updatedAt: String
  }

  type InventoryDashboardV3 {
    totalMaterials: Int!
    totalEquipment: Int!
    lowStockMaterials: Int!
    expiredMaterials: Int!
    maintenanceDueEquipment: Int!
    totalInventoryValue: Float!
    recentPurchaseOrders: [PurchaseOrderV3!]!
    topSuppliers: [SupplierV3!]!
  }

  type InventoryAlertV3 {
    id: ID!
    type: String!
    severity: String!
    message: String!
    itemId: ID
    itemName: String
    currentValue: Float
    thresholdValue: Float
    createdAt: String!
  }

  type PurchaseOrderItemV3 {
    id: ID!
    purchaseOrderId: ID!
    productId: ID!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    deliveredQuantity: Int
    notes: String
    # Anidado
    product: MaterialV3
  }

  type CartItemV3 {
    id: ID!
    userId: ID!
    productId: ID!
    product: MarketplaceProductV3!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    addedAt: String!
    notes: String
    
  }

  type ShippingInfoV3 {
    free: Boolean!
    cost: Float!
    estimatedDays: Int!
  }

  type BulkPricingV3 {
    quantity: Int!
    price: Float!
  }

  type AddressV3 {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  enum RiskLevel {
    LOW
    MEDIUM
    HIGH
  }

  enum PurchaseOrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
  }

  # Marketplace V3 Queries
  type Query {
    # ... existing queries ...
    
    # Inventory V3 - Dental Materials & Equipment
    materialsV3(
      category: String
      lowStock: Boolean
      expired: Boolean
      limit: Int
      offset: Int
    ): [DentalMaterialV3!]!
    
    materialV3(id: ID!): DentalMaterialV3
    
    equipmentsV3(
      type: String
      status: String
      roomId: Int
      limit: Int
      offset: Int
    ): [EquipmentV3!]!
    
    equipmentV3(id: ID!): EquipmentV3
    
    # Inventory V3 - Equipment Maintenance
    maintenancesV3(
      equipmentId: ID
      status: String
      limit: Int
      offset: Int
    ): [MaintenanceV3!]!
    
    maintenanceV3(id: ID!): MaintenanceV3
    
    maintenanceHistoryV3(equipmentId: ID!): [MaintenanceV3!]!
    
    equipmentMaintenanceScheduleV3(equipmentId: ID!): [MaintenanceV3!]!
    
    # Inventory V3 - Suppliers Management
    suppliersV3(
      category: String
      status: String
      limit: Int
      offset: Int
    ): [SupplierV3!]!
    
    supplierV3(id: ID!): SupplierV3
    
    # Inventory V3 - Purchase Orders Management
    purchaseOrdersV3(
      supplierId: ID
      status: String
      limit: Int
      offset: Int
    ): [PurchaseOrderV3!]!
    
    purchaseOrderV3(id: ID!): PurchaseOrderV3
    
    supplierPurchaseOrdersV3(supplierId: ID!, limit: Int): [PurchaseOrderV3!]!
    
    purchaseOrderItemsV3(purchaseOrderId: ID!): [PurchaseOrderItemV3!]!
    
    # Inventory V3 - Dashboard Analytics
    inventoryDashboardV3: InventoryDashboardV3!
    inventoryAlertsV3: [InventoryAlertV3!]!
    
    # Marketplace V3 - B2B Dental Supply System
    marketplaceProductsV3(
      category: String
      searchTerm: String
      minPrice: Float
      maxPrice: Float
      supplierId: ID
      verifiedOnly: Boolean
      limit: Int
      offset: Int
    ): [MarketplaceProductV3!]!
    
    marketplaceProductV3(id: ID!): MarketplaceProductV3
    
    suppliersV3(
      category: String
      verifiedOnly: Boolean
      limit: Int
      offset: Int
    ): [SupplierV3!]!
    
    supplierV3(id: ID!): SupplierV3
    
    purchaseOrdersV3(
      status: String
      supplierId: ID
      dateFrom: String
      dateTo: String
      limit: Int
      offset: Int
    ): [PurchaseOrderV3!]!
    
    purchaseOrderV3(id: ID!): PurchaseOrderV3
    
    cartItemsV3(userId: ID!): [CartItemV3!]!
  }

  # Marketplace V3 Mutations
  type Mutation {
    # ... existing mutations ...
    
    # Inventory V3 - Dental Materials & Equipment
    createMaterialV3(input: CreateMaterialInputV3!): DentalMaterialV3!
    updateMaterialV3(id: ID!, input: UpdateMaterialInputV3!): DentalMaterialV3!
    deleteMaterialV3(id: ID!): Boolean!
    
    createEquipmentV3(input: CreateEquipmentInputV3!): EquipmentV3!
    updateEquipmentV3(id: ID!, input: UpdateEquipmentInputV3!): EquipmentV3!
    deleteEquipmentV3(id: ID!): Boolean!
    
    # Inventory V3 - Inventory Management
    createInventoryV3(input: CreateInventoryInputV3!): InventoryV3!
    updateInventoryV3(id: ID!, input: UpdateInventoryInputV3!): InventoryV3!
    deleteInventoryV3(id: ID!): Boolean!
    adjustInventoryStockV3(inventoryId: ID!, quantity: Float!, reason: String): InventoryV3!
    
    # Inventory V3 - Material Management
    reorderMaterialV3(materialId: ID!, quantity: Float!): DentalMaterialV3!
    acknowledgeInventoryAlertV3(alertId: ID!): Boolean!
    
    # Inventory V3 - Suppliers Management
    createSupplierV3(input: CreateSupplierInputV3!): SupplierV3!
    updateSupplierV3(id: ID!, input: UpdateSupplierInputV3!): SupplierV3!
    deleteSupplierV3(id: ID!): Boolean!
    
    # Inventory V3 - Purchase Orders Management
    createPurchaseOrderV3(input: CreatePurchaseOrderInputV3!): PurchaseOrderV3!
    updatePurchaseOrderV3(id: ID!, input: UpdatePurchaseOrderInputV3!): PurchaseOrderV3!
    deletePurchaseOrderV3(id: ID!): Boolean!
    cancelPurchaseOrderV3(id: ID!, reason: String): PurchaseOrderV3!
    receivePurchaseOrderV3(id: ID!, receivedBy: String!): PurchaseOrderV3!
    
    # Inventory V3 - Purchase Order Items
    addPurchaseOrderItemV3(purchaseOrderId: ID!, input: AddPurchaseOrderItemInputV3!): PurchaseOrderItemV3!
    updatePurchaseOrderItemV3(id: ID!, input: UpdatePurchaseOrderItemInputV3!): PurchaseOrderItemV3!
    removePurchaseOrderItemV3(id: ID!): Boolean!
    
    # Marketplace V3 - B2B Dental Supply System
    addToCartV3(input: AddToCartInputV3!): CartItemV3!
    updateCartItemV3(id: ID!, quantity: Int!): CartItemV3!
    removeFromCartV3(id: ID!): Boolean!
    clearCartV3(userId: ID!): Boolean!
    
    createSupplierV3(input: CreateSupplierInputV3!): SupplierV3!
    updateSupplierV3(id: ID!, input: UpdateSupplierInputV3!): SupplierV3!
  }

  # Inventory V3 Inputs
  input CreateMaterialInputV3 {
    name: String!
    category: String
    unit: String
    unitCost: Float
    minimumStock: Float
    supplier: String
    expiryDate: String
    batchNumber: String
  }

  input UpdateMaterialInputV3 {
    name: String
    category: String
    unit: String
    currentStock: Float
    minimumStock: Float
    unitCost: Float
    supplier: String
    expiryDate: String
    batchNumber: String
    isActive: Boolean
  }

  input CreateEquipmentInputV3 {
    name: String!
    model: String
    serialNumber: String
    manufacturer: String
    equipmentType: String
    roomId: Int
    purchaseDate: String
    warrantyExpiry: String
    purchaseCost: Float
    powerRequirements: String
    maintenanceIntervalDays: Int
  }

  input UpdateEquipmentInputV3 {
    name: String
    model: String
    serialNumber: String
    status: String
    lastMaintenance: String
    nextMaintenanceDue: String
    currentValue: Float
    depreciationRate: Float
    operatingHours: Int
    isActive: Boolean
    notes: String
  }

  # Inventory V3 Inputs
  input CreateInventoryInputV3 {
    name: String!
    category: String
    description: String
    quantity: Float!
    unitCost: Float
  }

  input UpdateInventoryInputV3 {
    name: String
    category: String
    description: String
    quantity: Float
    unitCost: Float
  }

  input CreateMaintenanceInputV3 {
    equipmentId: ID!
    maintenanceType: String!
    description: String
    performedBy: String
    cost: Float
    scheduledDate: String
    findings: String
    recommendations: String
  }

  input UpdateMaintenanceInputV3 {
    maintenanceType: String
    description: String
    performedBy: String
    cost: Float
    findings: String
    recommendations: String
    status: String
  }

  input CreateSupplierInputV3 {
    name: String!
    contactPerson: String
    email: String
    phone: String
    address: String
    paymentTerms: String
    deliveryTimeDays: Int
    minimumOrderValue: Float
    notes: String
  }

  input UpdateSupplierInputV3 {
    name: String
    contactPerson: String
    email: String
    phone: String
    address: String
    paymentTerms: String
    deliveryTimeDays: Int
    minimumOrderValue: Float
    rating: Float
    notes: String
    isActive: Boolean
  }

  input AddPurchaseOrderItemInputV3 {
    productId: ID!
    quantity: Int!
    unitPrice: Float!
  }

  input UpdatePurchaseOrderItemInputV3 {
    quantity: Int
    unitPrice: Float
    deliveredQuantity: Int
    notes: String
  }

  # Marketplace V3 Inputs
  input CreatePurchaseOrderInputV3 {
    supplierId: ID!
    items: [PurchaseOrderItemInputV3!]!
    shippingCost: Float!
    notes: String
  }

  input PurchaseOrderItemInputV3 {
    productId: ID!
    quantity: Int!
    unitPrice: Float!
  }

  input UpdatePurchaseOrderInputV3 {
    status: PurchaseOrderStatus
    estimatedDeliveryDate: String
    actualDeliveryDate: String
    notes: String
  }

  input AddToCartInputV3 {
    productId: ID!
    quantity: Int!
    notes: String
  }

  # Marketplace V3 Subscriptions
  type Subscription {
    # ... existing subscriptions ...
    
    # Marketplace V3 - Real-time B2B updates
    marketplaceProductV3Created: MarketplaceProductV3!
    marketplaceProductV3Updated: MarketplaceProductV3!
    purchaseOrderV3Created: PurchaseOrderV3!
    purchaseOrderV3Updated: PurchaseOrderV3!
    purchaseOrderV3StatusChanged(orderId: ID!, newStatus: PurchaseOrderStatus!): PurchaseOrderV3!
    PO_STATUS_UPDATED_V3(orderId: ID!): PurchaseOrderV3!
    cartItemV3Added: CartItemV3!
    cartItemV3Updated: CartItemV3!
    supplierV3Created: SupplierV3!
    supplierV3Updated: SupplierV3!
    
    # Inventory V3 - Real-time inventory updates
    inventoryUpdatedV3(productId: ID): InventoryV3!
    lowStockAlertV3(productId: ID): InventoryV3!
    purchaseOrderStatusV3(orderId: ID): PurchaseOrderV3!
  }

  # 🎬 SUBSCRIPTIONS V3 - NETFLIX-DENTAL SYSTEM
  # Sistema completo de suscripciones dentales estilo Netflix

  type SubscriptionPlanV3 {
    id: ID!
    name: String!
    description: String
    tier: SubscriptionTier!
    price: Float!
    currency: String!
    billingCycle: BillingCycleType!
    maxServicesPerMonth: Int!
    maxServicesPerYear: Int!
    features: [SubscriptionFeatureV3!]!
    popular: Boolean!
    recommended: Boolean!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
    
  }

  type SubscriptionV3 {
    id: ID!
    patientId: ID!
    patient: Patient!
    planId: ID!
    plan: SubscriptionPlanV3!
    status: SubscriptionStatus!
    startDate: String!
    endDate: String
    nextBillingDate: String!
    autoRenew: Boolean!
    paymentMethodId: ID
    usageThisMonth: Int!
    usageThisYear: Int!
    remainingServices: Int!
    billingCycles: [BillingCycleV3!]!
    createdAt: String!
    updatedAt: String!
    
  }

  type BillingCycleV3 {
    id: ID!
    subscriptionId: ID!
    subscription: SubscriptionV3!
    cycleStartDate: String!
    cycleEndDate: String!
    amount: Float!
    currency: String!
    status: BillingStatus!
    paymentDate: String
    transactionId: String
    invoiceUrl: String
    usageCount: Int!
    notes: String
    createdAt: String!
    
  }

  type SubscriptionFeatureV3 {
    id: ID!
    planId: ID!
    name: String!
    description: String
    included: Boolean!
    limit: Int
    unit: String
    createdAt: String!
    
  }

  type UsageTrackingV3 {
    id: ID!
    subscriptionId: ID!
    serviceType: String!
    serviceId: ID!
    usageDate: String!
    cost: Float!
    notes: String
    createdAt: String!
    
  }

  enum SubscriptionTier {
    BASIC
    STANDARD
    PREMIUM
    ENTERPRISE
  }

  enum BillingCycleType {
    MONTHLY
    QUARTERLY
    SEMI_ANNUAL
    ANNUAL
  }

  enum SubscriptionStatus {
    ACTIVE
    INACTIVE
    CANCELLED
    SUSPENDED
    EXPIRED
    PENDING
  }

  enum BillingStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
    CANCELLED
  }

  # Subscriptions V3 Queries
  type Query {
    # ... existing queries ...
    
    # Subscriptions V3 - Netflix-Dental System (MULTI-TENANT)
    # Note: clinicId is automatically extracted from user context (user.clinic_id)
    # Staff sees their clinic's plans, Patients see their clinic's plans
    subscriptionPlansV3(activeOnly: Boolean): [SubscriptionPlanV3!]!
    subscriptionPlanV3(id: ID!): SubscriptionPlanV3
    
    subscriptionsV3(
      patientId: ID
      status: SubscriptionStatus
      planId: ID
      limit: Int
      offset: Int
    ): [SubscriptionV3!]!
    
    subscriptionV3(id: ID!): SubscriptionV3
    
    billingCyclesV3(
      subscriptionId: ID
      status: BillingStatus
      dateFrom: String
      dateTo: String
      limit: Int
      offset: Int
    ): [BillingCycleV3!]!
    
    usageTrackingV3(
      subscriptionId: ID
      dateFrom: String
      dateTo: String
      limit: Int
      offset: Int
    ): [UsageTrackingV3!]!
  }

  # Subscriptions V3 Mutations
  type Mutation {
    # ... existing mutations ...
    
    # Subscriptions V3 - Netflix-Dental System
    createSubscriptionV3(input: CreateSubscriptionInputV3!): SubscriptionV3!
    updateSubscriptionV3(id: ID!, input: UpdateSubscriptionInputV3!): SubscriptionV3!
    cancelSubscriptionV3(id: ID!, reason: String): Boolean!
    renewSubscriptionV3(id: ID!): SubscriptionV3!
    
    createSubscriptionPlanV3(input: CreateSubscriptionPlanInputV3!): SubscriptionPlanV3!
    updateSubscriptionPlanV3(id: ID!, input: UpdateSubscriptionPlanInputV3!): SubscriptionPlanV3!
    
    processBillingCycleV3(subscriptionId: ID!): BillingCycleV3!
    trackServiceUsageV3(input: TrackUsageInputV3!): UsageTrackingV3!
  }

  # Subscriptions V3 Inputs
  input CreateSubscriptionInputV3 {
    patientId: ID!
    planId: ID!
    clinicId: ID           # ⚓ OPCIONAL: Si no se provee, usa el anclaje del paciente (patient_clinic_access)
    paymentMethodId: ID
    autoRenew: Boolean
    startDate: String
  }

  input UpdateSubscriptionInputV3 {
    status: SubscriptionStatus
    autoRenew: Boolean
    paymentMethodId: ID
  }

  input CreateSubscriptionPlanInputV3 {
    name: String!
    description: String
    tier: SubscriptionTier!
    price: Float!
    currency: String!
    billingCycle: BillingCycleType!
    maxServicesPerMonth: Int!
    maxServicesPerYear: Int!
    features: [SubscriptionFeatureInputV3!]!
    popular: Boolean
    recommended: Boolean
  }

  input UpdateSubscriptionPlanInputV3 {
    name: String
    description: String
    price: Float
    maxServicesPerMonth: Int
    maxServicesPerYear: Int
    features: [SubscriptionFeatureInputV3!]
    popular: Boolean
    recommended: Boolean
    active: Boolean
  }

  input SubscriptionFeatureInputV3 {
    name: String!
    description: String
    included: Boolean!
    limit: Int
    unit: String
  }

  input TrackUsageInputV3 {
    subscriptionId: ID!
    serviceType: String!
    serviceId: ID!
    cost: Float!
    notes: String
  }

  # Subscriptions V3 Real-time Updates
  type Subscription {
    # ... existing subscriptions ...
    
    # Subscriptions V3 - Real-time Netflix-Dental updates
    subscriptionV3Created: SubscriptionV3!
    subscriptionV3Updated: SubscriptionV3!
    subscriptionV3Cancelled(subscriptionId: ID!): SubscriptionV3!
    billingCycleV3Processed: BillingCycleV3!
    serviceUsageV3Tracked: UsageTrackingV3!
    subscriptionPlanV3Created: SubscriptionPlanV3!
    subscriptionPlanV3Updated: SubscriptionPlanV3!
  }

  # 📅 CUSTOM CALENDAR V3 - AINARKLENDAR SYSTEM
  # Advanced calendar views, settings, and custom event management

  enum CalendarViewV3 {
    MONTH
    WEEK
    DAY
    AGENDA
    TIMELINE
  }

  enum CalendarEventTypeV3 {
    APPOINTMENT
    BLOCKED_TIME
    HOLIDAY
    MAINTENANCE
    PERSONAL
    SYSTEM_EVENT
  }

  type CustomCalendarViewV3 {
    id: ID!
    userId: ID!
    name: String!
    viewType: CalendarViewV3!
    defaultDate: String
    filters: JSON
    layoutSettings: JSON
    isDefault: Boolean!
    isPublic: Boolean!
    createdAt: String!
    updatedAt: String!

  }

  type CalendarSettingsV3 {
    id: ID!
    userId: ID!
    workingHoursStart: String
    workingHoursEnd: String
    workingDays: [Int!]
    timeZone: String
    defaultView: CalendarViewV3
    appointmentDuration: Int
    reminderSettings: JSON
    notificationSettings: JSON
    colorScheme: JSON
    createdAt: String!
    updatedAt: String!

  }

  type CalendarFilterV3 {
    id: ID!
    userId: ID!
    name: String!
    filterType: String!
    criteria: JSON
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!

  }

  type CalendarEventV3 {
    id: ID!
    userId: ID!
    title: String!
    description: String
    eventType: CalendarEventTypeV3!
    startDate: String!
    endDate: String!
    isAllDay: Boolean!
    recurrenceRule: String
    location: String
    attendees: JSON
    metadata: JSON
    color: String
    isVisible: Boolean!
    createdAt: String!
    updatedAt: String!

  }

  input CustomCalendarViewInputV3 {
    name: String!
    viewType: CalendarViewV3!
    defaultDate: String
    filters: JSON
    layoutSettings: JSON
    isDefault: Boolean
    isPublic: Boolean
  }

  input UpdateCustomCalendarViewInputV3 {
    name: String
    viewType: CalendarViewV3
    defaultDate: String
    filters: JSON
    layoutSettings: JSON
    isDefault: Boolean
    isPublic: Boolean
  }

  input CalendarSettingsInputV3 {
    workingHoursStart: String
    workingHoursEnd: String
    workingDays: [Int!]
    timeZone: String
    defaultView: CalendarViewV3
    appointmentDuration: Int
    reminderSettings: JSON
    notificationSettings: JSON
    colorScheme: JSON
  }

  input CalendarFilterInputV3 {
    name: String!
    filterType: String!
    criteria: JSON!
    isActive: Boolean
  }

  input UpdateCalendarFilterInputV3 {
    name: String
    filterType: String
    criteria: JSON
    isActive: Boolean
  }

  input CalendarEventInputV3 {
    title: String!
    description: String
    eventType: CalendarEventTypeV3!
    startDate: String!
    endDate: String!
    isAllDay: Boolean
    recurrenceRule: String
    location: String
    attendees: JSON
    metadata: JSON
    color: String
    isVisible: Boolean
  }

  input UpdateCalendarEventInputV3 {
    title: String
    description: String
    eventType: CalendarEventTypeV3
    startDate: String
    endDate: String
    isAllDay: Boolean
    recurrenceRule: String
    location: String
    attendees: JSON
    metadata: JSON
    color: String
    isVisible: Boolean
  }

  # CustomCalendar V3 Queries
  type Query {
    # AppointmentsV3 - Veritas Enhanced
    appointmentsV3(limit: Int, offset: Int, patientId: ID, startDate: String, endDate: String): [AppointmentV3!]!
    appointmentV3(id: ID!): AppointmentV3
    appointmentsV3ByDate(date: String!): [AppointmentV3!]!

    # CustomCalendar V3 - AinarkLendar System
    customCalendarViewsV3(userId: ID): [CustomCalendarViewV3!]!
    customCalendarViewV3(id: ID!): CustomCalendarViewV3
    calendarSettingsV3(userId: ID!): CalendarSettingsV3
    calendarFiltersV3(userId: ID): [CalendarFilterV3!]!
    calendarFilterV3(id: ID!): CalendarFilterV3
    calendarEventsV3(userId: ID, startDate: String, endDate: String): [CalendarEventV3!]!
    calendarEventV3(id: ID!): CalendarEventV3
    calendarAvailabilityV3(userId: ID!, date: String!): JSON

    # 📋 AUDIT & VERIFICATION QUERIES (PHASE 3)
    """
    Dashboard principal de verificación.
    Muestra: total de operaciones, fallos, warnings, score de integridad.
    """
    verificationDashboard: VerificationDashboard!

    """
    Historial completo de una entidad.
    entityType: ej. 'InventoryV3', 'CartItemV3'
    entityId: ID de la entidad
    limit: número de registros (default: 100)
    """
    auditTrail(entityType: String!, entityId: String!, limit: Int): EntityAuditTrail!

    """
    Reporte de violaciones de integridad.
    severity: WARNING | ERROR | CRITICAL
    limit: número de registros (default: 50)
    """
    integrityReport(severity: String!, limit: Int): [AuditLogEntry!]!

    """
    Cambios recientes (últimas N mutaciones).
    Útil para activity feeds y timelines.
    """
    recentChanges(limit: Int): [AuditLogEntry!]!

    """
    Mutaciones agrupadas por tipo de entidad.
    Ver qué se está modificando más.
    """
    mutationsByEntityType(limit: Int): [MutationByType!]!

    """
    Estadísticas de integridad en un rango de fechas.
    """
    integrityStats(startDate: String, endDate: String): IntegrityStats!

    """
    Usuarios más activos.
    Ver quiénes están modificando más datos.
    """
    mostActiveUsers(limit: Int): [ActiveUser!]!
  }

  # CustomCalendar V3 Mutations
  type Mutation {
    # AppointmentsV3 - Veritas Enhanced
    createAppointmentV3(input: AppointmentInput!): AppointmentV3!
    updateAppointmentV3(id: ID!, input: UpdateAppointmentInput!): AppointmentV3!
    deleteAppointmentV3(id: ID!): DeleteResult!

    # CustomCalendar V3 - AinarkLendar System
    createCustomCalendarViewV3(input: CustomCalendarViewInputV3!): CustomCalendarViewV3!
    updateCustomCalendarViewV3(id: ID!, input: UpdateCustomCalendarViewInputV3!): CustomCalendarViewV3!
    deleteCustomCalendarViewV3(id: ID!): Boolean!
    setDefaultCalendarViewV3(id: ID!): Boolean!

    updateCalendarSettingsV3(input: CalendarSettingsInputV3!): CalendarSettingsV3!

    createCalendarFilterV3(input: CalendarFilterInputV3!): CalendarFilterV3!
    updateCalendarFilterV3(id: ID!, input: UpdateCalendarFilterInputV3!): CalendarFilterV3!
    deleteCalendarFilterV3(id: ID!): Boolean!
    toggleCalendarFilterV3(id: ID!): Boolean!

    createCalendarEventV3(input: CalendarEventInputV3!): CalendarEventV3!
    updateCalendarEventV3(id: ID!, input: UpdateCalendarEventInputV3!): CalendarEventV3!
    deleteCalendarEventV3(id: ID!): Boolean!
  }

  # CustomCalendar V3 Subscriptions
  type Subscription {
    appointmentV3Created: AppointmentV3!
    appointmentV3Updated: AppointmentV3!

    # CustomCalendar V3 - AinarkLendar System
    customCalendarViewV3Created: CustomCalendarViewV3!
    customCalendarViewV3Updated: CustomCalendarViewV3!
    calendarSettingsV3Updated: CalendarSettingsV3!
    calendarFilterV3Created: CalendarFilterV3!
    calendarFilterV3Updated: CalendarFilterV3!
    calendarEventV3Created: CalendarEventV3!
    calendarEventV3Updated: CalendarEventV3!
    calendarAvailabilityV3Changed(userId: ID!): JSON
  }

  # ======================================================
  # PAYMENT TRACKING MODULE V3 - BILLING REVOLUTION
  # Derived from: PAYMENT_TRACKING_BLUEPRINT.md
  # Status: Veritas RSA + AuditLogger (4-Gate Pattern)
  # ======================================================

  # Types — Los Entes Financieros Míticos
  type PaymentPlan {
    id: ID!
    billingId: ID!
    patientId: ID!
    totalAmount: Float!
    installmentsCount: Int!
    installmentAmount: Float!
    frequency: String!
    startDate: String!
    endDate: String
    status: String!
    veritasSignature: String
    createdBy: ID
    createdAt: String!
    updatedAt: String!
  }

  type PartialPayment {
    id: ID!
    invoiceId: ID!
    patientId: ID!
    paymentPlanId: ID
    amount: Float!
    currency: String!
    methodId: ID
    methodType: String!
    transactionId: String
    status: String!
    processedAt: String
    veritasSignature: String
    metadata: JSON
    createdBy: ID
    createdAt: String!
    updatedAt: String!
  }

  type PaymentReminder {
    id: ID!
    billingId: ID!
    patientId: ID!
    reminderType: String!
    scheduledAt: String!
    sentAt: String
    status: String!
    messageTemplate: String
    veritasSignature: String
    metadata: JSON
    createdBy: ID
    createdAt: String!
    updatedAt: String!
  }

  type PaymentReceipt {
    id: ID!
    paymentId: ID!
    billingId: ID!
    patientId: ID!
    receiptNumber: String!
    totalAmount: Float!
    paidAmount: Float!
    balanceRemaining: Float!
    generatedAt: String!
    veritasSignature: String!
    pdfUrl: String
    metadata: JSON
    createdBy: ID
    createdAt: String!
    updatedAt: String!
  }

  # Inputs — Las Armas de Entrada Financiera
  input CreatePaymentPlanInput {
    billingId: ID!
    patientId: ID!
    totalAmount: Float!
    installmentsCount: Int!
    installmentAmount: Float!
    frequency: String!
    startDate: String!
    endDate: String
  }

  input RecordPartialPaymentInput {
    invoiceId: ID!
    patientId: ID!
    paymentPlanId: ID
    amount: Float!
    currency: String!
    methodId: ID
    methodType: String!
    transactionId: String
    metadata: JSON
  }

  input ScheduleReminderInput {
    billingId: ID!
    patientId: ID!
    reminderType: String!
    scheduledAt: String!
    messageTemplate: String
  }

  input GenerateReceiptInput {
    paymentId: ID!
    billingId: ID!
    patientId: ID!
    receiptNumber: String!
    totalAmount: Float!
    paidAmount: Float!
    metadata: JSON
  }

  # Extended Queries — Las Consultas del Oráculo Financiero
  extend type Query {
    getPaymentPlans(billingId: ID, patientId: ID, status: String): [PaymentPlan!]!
    getPaymentPlanById(id: ID!): PaymentPlan
    getPartialPayments(invoiceId: ID!, patientId: ID): [PartialPayment!]!
    getPaymentReminders(billingId: ID, patientId: ID, status: String): [PaymentReminder!]!
    getPaymentReceipts(invoiceId: ID!, patientId: ID): [PaymentReceipt!]!
    getPaymentReceiptById(id: ID!): PaymentReceipt
  }

  # Extended Mutations — Las Mutaciones del Caos Financiero
  extend type Mutation {
    createPaymentPlan(input: CreatePaymentPlanInput!): PaymentPlan!
    updatePaymentPlanStatus(planId: ID!, status: String!): PaymentPlan!
    cancelPaymentPlan(planId: ID!): Boolean!
    recordPartialPayment(input: RecordPartialPaymentInput!): PartialPayment!
    processPaymentOrder(orderId: ID!): PartialPayment!
    scheduleReminder(input: ScheduleReminderInput!): PaymentReminder!
    sendReminder(reminderId: ID!): PaymentReminder!
    generateReceipt(input: GenerateReceiptInput!): PaymentReceipt!
    regenerateReceipt(receiptId: ID!): PaymentReceipt!
  }

  # ============================================================================
  # DIRECTIVA #004: AI-Assisted Appointment Scheduling (GeminiEnder CEO)
  # Fecha: 17-Nov-2025
  # ============================================================================

  enum AppointmentType {
    normal
    urgent
  }

  enum UrgencyLevel {
    low
    medium
    high
    critical
  }

  enum SuggestionStatus {
    pending_approval
    approved
    rejected
  }

  type IADiagnosisResponse {
    urgency_score: Int!
    urgency_level: UrgencyLevel!
    preliminary_diagnosis: String
    confidence: Float!
    suggested_duration: Int
    recommended_specialist: String
    notes: String
  }

  type AppointmentSuggestion {
    id: ID!
    patient_id: ID!
    patient: PatientV3
    clinic_id: ID
    appointment_type: AppointmentType!
    suggested_date: String!
    suggested_time: String!
    suggested_duration: Int!
    suggested_practitioner_id: ID
    confidence_score: Float!
    reasoning: String
    ia_diagnosis: IADiagnosisResponse
    patient_request: String
    status: SuggestionStatus!
    reviewed_by: ID
    reviewed_at: String
    rejection_reason: String
    created_at: String!
    updated_at: String!
  }

  input AppointmentRequestInput {
    patientId: ID!
    appointmentType: AppointmentType!
    consultationType: String
    preferredDates: [String!]
    preferredTimes: [String!]
    urgency: String
    notes: String
    symptoms: String
  }

  input AppointmentAdjustments {
    date: String
    time: String
    duration: Int
    practitionerId: ID
  }

  extend type Query {
    appointmentSuggestionsV3(
      status: String
      patientId: ID
      clinicId: ID
    ): [AppointmentSuggestion!]!
  }

  extend type Mutation {
    requestAppointment(input: AppointmentRequestInput!): AppointmentSuggestion!
    approveAppointmentSuggestion(
      suggestionId: ID!
      adjustments: AppointmentAdjustments
    ): AppointmentV3!
    rejectAppointmentSuggestion(
      suggestionId: ID!
      reason: String!
    ): String!
  }

  # 🔔 NOTIFICATIONS - Query & Mutation Extensions
  extend type Query {
    patientNotifications(
      patientId: ID!
      status: NotificationStatus
      limit: Int
      offset: Int
    ): [NotificationV3!]!
    
    notificationPreferences(patientId: ID!): NotificationPreferencesV3
  }

  extend type Mutation {
    markNotificationAsRead(id: ID!): NotificationV3!
    
    updateNotificationPreferences(
      patientId: ID!
      input: NotificationPreferencesInput!
    ): NotificationPreferencesV3!
  }
`;

export default typeDefs;



