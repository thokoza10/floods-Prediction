export interface FloodRecord {
  id: number;
  date: string;
  stationId: string;
  stationName: string;
  riverBasin: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  monsoonIntensity: number; // 0 - 10
  topographyDrainage: number; // 0 - 10
  riverDischarge_m3s: number; // m3/s
  waterLevel_m: number; // meters
  soilMoisture_pct: number; // %
  rainfall_mm: number; // 24h cumulative mm
  deforestationIndex: number; // 0 - 10
  urbanizationIndex: number; // 0 - 10
  climateChangeFactor: number; // 0 - 10
  elevation_m: number; // meters above sea level
  damsStorage_pct: number; // %
  siltationLevel: number; // 0 - 10
  inundationProbability: number; // 0.0 - 1.0 (Target variable)
  floodOccurred: number; // 0 or 1
  alertLevel: "Normal" | "Watch" | "Warning" | "Severe";
}

export interface BasinStation {
  id: string;
  name: string;
  riverBasin: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  dangerLevel_m: number;
  majorFloodLevel_m: number;
  currentWaterLevel: number;
  currentRainfall_mm: number;
  currentDischarge_m3s: number;
  currentSoilMoisture_pct: number;
  status: "Normal" | "Watch" | "Warning" | "Critical";
  riskScore: number;
}

export type MLModelType = 
  | "XGBoost (Gradient Boosted Trees)"
  | "Random Forest Classifier"
  | "Hydrological Deep LSTM"
  | "Support Vector Classifier (RBF)"
  | "ElasticNet Logistic Regression"
  | "SuperLearner Multi-Stack Ensemble";

export interface Hyperparameters {
  trainSplit: number; // 0.5 - 0.9 (e.g. 0.8)
  learningRate: number;
  nEstimators: number; // or epochs
  maxDepth: number;
  threshold: number; // classification decision boundary (default 0.5)
  randomSeed: number;
  kFold: number;
  regularization: number;
}

export interface TrainingMetrics {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAccuracy: number;
  valAccuracy: number;
  trainF1: number;
  valF1: number;
}

export interface EvaluationResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  logLoss: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
    total: number;
  };
  rocCurve: Array<{ fpr: number; tpr: number; threshold: number }>;
  precisionRecallCurve: Array<{ precision: number; recall: number; threshold: number }>;
  featureImportances: Array<{ feature: string; importance: number; description: string }>;
  predictions: Array<{
    id: number;
    date: string;
    actual: number;
    predicted: number;
    probability: number;
    correct: boolean;
  }>;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  predictedRainfall_mm: number;
  predictedDischarge_m3s: number;
  predictedWaterLevel_m: number;
  floodProbability: number;
  upperConfidence: number;
  lowerConfidence: number;
  status: "Safe" | "Elevated" | "Warning" | "Extreme Danger";
}

export interface WhatIfScenarioInput {
  rainfall_mm: number;
  monsoonIntensity: number;
  soilMoisture_pct: number;
  riverDischarge_m3s: number;
  damsStorage_pct: number;
  topographyDrainage: number;
  deforestationIndex: number;
  urbanizationIndex: number;
  climateChangeFactor: number;
  siltationLevel: number;
  elevation_m: number;
}
