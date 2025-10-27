/**
 * 🧠 APOLLO TREATMENT AI ENGINE
 * AI-powered treatment suggestions and recommendations
 * Integrated with Veritas, Consciousness, and Predictive Analytics
 */

import { SeleneVeritas } from "../../Veritas/Veritas.js";
import { SeleneConscious } from "../../Conscious/Conscious.js";
import { SelenePredict } from "../../Predict/Predict.js";


export interface PatientHistory {
  id: string;
  patientId: string;
  treatments: TreatmentRecord[];
  allergies: string[];
  medicalConditions: string[];
  age: number;
  riskFactors: string[];
}

export interface TreatmentRecord {
  treatmentId: string;
  outcome: "successful" | "partial" | "failed";
  complications?: string[];
  satisfaction?: number;
  date: Date;
}

export interface AISuggestion {
  treatmentId: string;
  confidence: number;
  reasoning: string[];
  alternatives: string[];
  riskAssessment: RiskAssessment;
  ethicalScore: number;
  veritasValidated: boolean;
}

export interface RiskAssessment {
  level: "low" | "medium" | "high";
  factors: string[];
  mitigationStrategies: string[];
  successProbability: number;
}

export interface DynamicPricing {
  basePrice: number;
  regionMultiplier: number;
  complexityMultiplier: number;
  urgencyMultiplier: number;
  finalPrice: number;
  breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  profitMargin: number;
}

export class TreatmentAI {
  private veritas: SeleneVeritas;
  private consciousness: SeleneConscious;
  private prediction: SelenePredict;

  // AI Learning Data
  private patientOutcomes: Map<string, PatientHistory> = new Map();
  private treatmentSuccessRates: Map<string, number> = new Map();
  private regionalPricing: Map<string, number> = new Map();

  constructor(
    veritas: SeleneVeritas,
    consciousness: SeleneConscious,
    prediction: SelenePredict,
  ) {
    this.veritas = veritas;
    this.consciousness = consciousness;
    this.prediction = prediction;

    this.initializeAILearning();
    this.loadRegionalPricing();
  }

  /**
   * 🧠 Initialize AI Learning System
   */
  private async initializeAILearning(): Promise<void> {
    console.log("🧠 Initializing Treatment AI Learning System...");

    // Initialize default success rates
    this.treatmentSuccessRates.set("routine_cleaning", 0.99);
    this.treatmentSuccessRates.set("composite_filling", 0.95);
    this.treatmentSuccessRates.set("crown_porcelain", 0.92);
    this.treatmentSuccessRates.set("tooth_extraction", 0.96);
    this.treatmentSuccessRates.set("braces_metal", 0.88);

    console.log("✅ Treatment AI Learning System initialized");
  }

  /**
   * 💰 Load Regional Pricing Data
   */
  private async loadRegionalPricing(): Promise<void> {
    // Default regional multipliers (can be loaded from database)
    this.regionalPricing.set("spain", 1.0);
    this.regionalPricing.set("france", 1.15);
    this.regionalPricing.set("germany", 1.2);
    this.regionalPricing.set("italy", 1.05);
    this.regionalPricing.set("portugal", 0.85);
  }

  /**
   * 🎯 Generate AI Treatment Suggestions
   */
  async generateSuggestions(
    patientId: string,
    _symptoms: string[],
    _urgency: "low" | "medium" | "high" | "emergency",
  ): Promise<AISuggestion[]> {
    console.log(`🎯 Generating AI suggestions for patient ${patientId}`);

    const patientHistory = this.patientOutcomes.get(patientId);
    const suggestions: AISuggestion[] = [];

    // Analyze symptoms and generate suggestions
    for (const symptom of _symptoms) {
      const symptomSuggestions = await this.analyzeSymptom(
        symptom,
        patientHistory,
        _urgency,
      );
      suggestions.push(...symptomSuggestions);
    }

    // Sort by confidence and ethical score
    suggestions.sort(
      (a, b) => b.confidence * b.ethicalScore - a.confidence * a.ethicalScore,
    );

    // Limit to top 5 suggestions
    return suggestions.slice(0, 5);
  }

  /**
   * 🔍 Analyze Individual Symptom
   */
  private async analyzeSymptom(
    symptom: string,
    _patientHistory?: PatientHistory,
    _urgency: string = "medium",
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Symptom to treatment mapping
    const symptomTreatments: { [key: string]: string[] } = {
      toothache: [
        "routine_cleaning",
        "composite_filling",
        "emergency_pain_relief",
      ],
      cavity: ["composite_filling", "crown_porcelain"],
      gum_disease: ["routine_cleaning", "deep_cleaning"],
      broken_tooth: ["composite_filling", "crown_porcelain"],
      wisdom_tooth: ["tooth_extraction"],
      crooked_teeth: ["braces_metal", "clear_aligners"],
      stains: ["teeth_whitening"],
      missing_tooth: ["dental_implant", "bridge"],
    };

    const possibleTreatments = symptomTreatments[symptom.toLowerCase()] || [];

    for (const treatmentId of possibleTreatments) {
      const suggestion = await this.createAISuggestion(
        treatmentId,
        symptom,
        _patientHistory,
        _urgency,
      );
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  /**
   * 🤖 Create AI Suggestion with Full Analysis
   */
  private async createAISuggestion(
    treatmentId: string,
    symptom: string,
    patientHistory?: PatientHistory,
    urgency: string = "medium",
  ): Promise<AISuggestion | null> {
    try {
      // Calculate confidence based on historical data
      const baseConfidence = this.treatmentSuccessRates.get(treatmentId) || 0.8;
      let adjustedConfidence = baseConfidence;

      // Adjust based on patient history
      if (patientHistory) {
        adjustedConfidence = this.adjustConfidenceByHistory(
          adjustedConfidence,
          treatmentId,
          patientHistory,
        );
      }

      // Adjust based on urgency
      if (urgency === "high") adjustedConfidence *= 0.9;
      if (urgency === "emergency") adjustedConfidence *= 0.8;

      // Generate reasoning
      const reasoning = await this.generateReasoning(
        treatmentId,
        symptom,
        patientHistory,
      );

      // Risk assessment
      const riskAssessment = await this.assessRisk(treatmentId, patientHistory);

      // Ethical validation
      const ethicalDecision = await this.consciousness.makeEthicalDecision(
        `Recommend treatment ${treatmentId} for symptom: ${symptom}`,
        ["approve", "review", "reject"],
      );

      if (ethicalDecision.chosenOption === "reject") {
        return null;
      }

      // Veritas validation (certificate generated but not stored)
      await this.veritas.generateTruthCertificate(
        {
          treatmentId,
          symptom,
          confidence: adjustedConfidence,
          reasoning,
          riskAssessment,
        },
        "ai_treatment_suggestion",
        `suggestion_${treatmentId}_${Date.now()}`,
      );

      return {
        treatmentId,
        confidence: adjustedConfidence,
        reasoning,
        alternatives: this.getAlternativeTreatments(treatmentId),
        riskAssessment,
        ethicalScore: ethicalDecision.ethicalScore,
        veritasValidated: true,
      };
    } catch (error) {
      console.error(`Error creating AI suggestion for ${treatmentId}:`, error as Error);
      return null;
    }
  }

  /**
   * 📊 Adjust Confidence Based on Patient History
   */
  private adjustConfidenceByHistory(
    _baseConfidence: number,
    _treatmentId: string,
    patientHistory: PatientHistory,
  ): number {
    let adjustedConfidence = _baseConfidence;

    // Find previous treatments of same type
    const previousTreatments = patientHistory.treatments.filter(
      (_t) => _t.treatmentId === _treatmentId,
    );

    if (previousTreatments.length > 0) {
      const successRate =
        previousTreatments.filter((_t) => _t.outcome === "successful").length /
        previousTreatments.length;

      // Adjust confidence based on personal success rate
      if (successRate > 0.8) adjustedConfidence *= 1.1;
      else if (successRate < 0.6) adjustedConfidence *= 0.9;
    }

    // Age adjustments
    if (patientHistory.age > 65) adjustedConfidence *= 0.95; // Older patients may have complications
    if (patientHistory.age < 18) adjustedConfidence *= 0.98; // Younger patients generally better outcomes

    // Risk factors
    if (patientHistory.riskFactors.includes("diabetes"))
      adjustedConfidence *= 0.9;
    if (patientHistory.riskFactors.includes("smoking"))
      adjustedConfidence *= 0.85;

    return Math.max(0.1, Math.min(1.0, adjustedConfidence));
  }

  /**
   * 🧠 Generate AI Reasoning
   */
  private async generateReasoning(
    treatmentId: string,
    _symptom: string,
    patientHistory?: PatientHistory,
  ): Promise<string[]> {
    const reasoning: string[] = [];

    // Base reasoning
    reasoning.push(`Treatment ${treatmentId} addresses ${_symptom}`);

    // Historical reasoning
    if (patientHistory?.treatments.some((_t) => _t.treatmentId === treatmentId)) {
      reasoning.push("Patient has previous experience with this treatment");
    }

    // Success rate reasoning
    const successRate = this.treatmentSuccessRates.get(treatmentId);
    if (successRate) {
      reasoning.push(
        `Historical success rate: ${(successRate * 100).toFixed(1)}%`,
      );
    }

    // Age consideration
    if (patientHistory && patientHistory.age > 60) {
      reasoning.push("Adjusted for geriatric considerations");
    }

    return reasoning;
  }

  /**
   * ⚠️ Assess Treatment Risk
   */
  private async assessRisk(
    treatmentId: string,
    patientHistory?: PatientHistory,
  ): Promise<RiskAssessment> {
    let riskLevel: "low" | "medium" | "high" = "low";
    const factors: string[] = [];
    const mitigationStrategies: string[] = [];

    // Treatment-specific risks
    const treatmentRisks: {
      [key: string]: { level: string; factors: string[]; mitigation: string[] };
    } = {
      tooth_extraction: {
        level: "medium",
        factors: ["Bleeding", "Infection", "Dry socket"],
        mitigation: ["Antibiotics", "Follow-up care", "Pain management"],
      },
      dental_implant: {
        level: "high",
        factors: ["Implant failure", "Bone integration issues", "Infection"],
        mitigation: [
          "Bone quality assessment",
          "Proper sterilization",
          "Regular monitoring",
        ],
      },
      braces_metal: {
        level: "low",
        factors: ["Discomfort", "Oral hygiene challenges"],
        mitigation: [
          "Pain medication",
          "Oral hygiene education",
          "Regular adjustments",
        ],
      },
    };

    const treatmentRisk = treatmentRisks[treatmentId];
    if (treatmentRisk) {
      riskLevel = treatmentRisk.level as "low" | "medium" | "high";
      factors.push(...treatmentRisk.factors);
      mitigationStrategies.push(...treatmentRisk.mitigation);
    }

    // Patient-specific risks
    if (patientHistory) {
      if (patientHistory.medicalConditions.includes("diabetes")) {
        factors.push("Diabetes increases infection risk");
        mitigationStrategies.push("Blood sugar monitoring");
        if (riskLevel === "low") riskLevel = "medium";
      }

      if (patientHistory.age > 70) {
        factors.push("Advanced age increases complication risk");
        mitigationStrategies.push("Conservative approach");
      }
    }

    const successProbability =
      this.treatmentSuccessRates.get(treatmentId) || 0.8;

    return {
      level: riskLevel,
      factors,
      mitigationStrategies,
      successProbability,
    };
  }

  /**
   * 💰 Calculate Dynamic Pricing
   */
  async calculateDynamicPricing(
    _treatmentId: string,
    _region: string,
    _complexity: number,
    _urgency: string,
  ): Promise<DynamicPricing> {
    // Base prices (can be loaded from database)
    const basePrices: { [key: string]: number } = {
      routine_cleaning: 90,
      composite_filling: 150,
      crown_porcelain: 1200,
      tooth_extraction: 200,
      braces_metal: 3500,
      teeth_whitening: 300,
    };

    const basePrice = basePrices[_treatmentId] || 100;

    // Regional multiplier
    const regionMultiplier =
      this.regionalPricing.get(_region.toLowerCase()) || 1.0;

    // Complexity multiplier (1-5 scale)
    const complexityMultiplier = 1 + (_complexity - 1) * 0.2;

    // Urgency multiplier
    const urgencyMultipliers: { [key: string]: number } = {
      low: 1.0,
      medium: 1.1,
      high: 1.25,
      emergency: 1.5,
    };
    const urgencyMultiplier = urgencyMultipliers[_urgency] || 1.0;

    // Calculate final price
    const finalPrice =
      basePrice * regionMultiplier * complexityMultiplier * urgencyMultiplier;

    // Price breakdown
    const breakdown: PriceBreakdown = {
      materialCost: finalPrice * 0.3,
      laborCost: finalPrice * 0.4,
      equipmentCost: finalPrice * 0.15,
      overheadCost: finalPrice * 0.1,
      profitMargin: finalPrice * 0.05,
    };

    return {
      basePrice,
      regionMultiplier,
      complexityMultiplier,
      urgencyMultiplier,
      finalPrice: Math.round(finalPrice),
      breakdown,
    };
  }

  /**
   * 🔄 Get Alternative Treatments
   */
  private getAlternativeTreatments(_treatmentId: string): string[] {
    const alternatives: { [key: string]: string[] } = {
      composite_filling: ["crown_porcelain", "routine_cleaning"],
      crown_porcelain: ["composite_filling", "bridge"],
      tooth_extraction: ["root_canal", "routine_cleaning"],
      braces_metal: ["clear_aligners", "routine_cleaning"],
      teeth_whitening: ["routine_cleaning", "cosmetic_bonding"],
    };

    return alternatives[_treatmentId] || [];
  }

  /**
   * 📈 Learn from Treatment Outcomes
   */
  async learnFromOutcome(
    patientId: string,
    treatmentId: string,
    outcome: "successful" | "partial" | "failed",
    _complications?: string[],
  ): Promise<void> {
    // Update success rates
    const currentRate = this.treatmentSuccessRates.get(treatmentId) || 0.8;
    const newRate =
      outcome === "successful" ? currentRate * 1.01 : currentRate * 0.99;
    this.treatmentSuccessRates.set(
      treatmentId,
      Math.max(0.1, Math.min(1.0, newRate)),
    );

    // Store patient outcome for future suggestions
    const patientHistory = this.patientOutcomes.get(patientId) || {
      id: patientId,
      patientId,
      treatments: [],
      allergies: [],
      medicalConditions: [],
      age: 30,
      riskFactors: [],
    };

    patientHistory.treatments.push({
      treatmentId,
      outcome,
      complications: _complications,
      date: new Date(),
    });

    this.patientOutcomes.set(patientId, patientHistory);

    console.log(
      `🧠 AI learned from treatment outcome: ${treatmentId} - ${outcome}`,
    );
  }

  /**
   * 🎯 Get Treatment Recommendations for Patient
   */
  async getPersonalizedRecommendations(
    _patientId: string,
  ): Promise<AISuggestion[]> {
    const patientHistory = this.patientOutcomes.get(_patientId);

    if (!patientHistory || patientHistory.treatments.length === 0) {
      return [];
    }

    // Analyze patterns in patient history
    const successfulTreatments = patientHistory.treatments
      .filter((_t) => _t.outcome === "successful")
      .map((_t) => _t.treatmentId);

    const failedTreatments = patientHistory.treatments
      .filter((_t) => _t.outcome === "failed")
      .map((_t) => _t.treatmentId);

    // Generate recommendations based on patterns
    const recommendations: AISuggestion[] = [];

    // Recommend similar successful treatments
    for (const treatmentId of successfulTreatments) {
      const alternatives = this.getAlternativeTreatments(treatmentId);
      for (const altTreatment of alternatives) {
        if (!failedTreatments.includes(altTreatment)) {
          const suggestion = await this.createAISuggestion(
            altTreatment,
            "preventive_maintenance",
            patientHistory,
            "low",
          );
          if (suggestion) {
            recommendations.push(suggestion);
          }
        }
      }
    }

    return recommendations.slice(0, 3);
  }
}


