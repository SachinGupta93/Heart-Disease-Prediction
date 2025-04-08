/**
 * Simple risk calculator that simulates ML model prediction
 * This is used for the risk simulator when we don't want to make API calls
 */
export const calculateRisk = (formData) => {
  // Convert formData to features array in the right order for our "model"
  const features = [
    formData.age,
    formData.sex,
    formData.cp,
    formData.trestbps,
    formData.chol,
    formData.fbs,
    formData.restecg,
    formData.thalach,
    formData.exang,
    formData.oldpeak,
    formData.slope,
    formData.ca,
    formData.thal
  ];
  
  // Calculate base risk from age and sex (these are strong predictors)
  let baseRisk = 0.1 + (formData.age - 20) * 0.005;  // Age risk increases 0.5% per year over 20
  baseRisk += formData.sex * 0.05;  // Men have slightly higher base risk
  
  // Chest pain type is a strong predictor
  const cpWeights = [0, 0.05, 0.1, 0.25];  // Asymptomatic (3) is highest risk
  baseRisk += cpWeights[formData.cp];
  
  // Number of vessels is a strong predictor
  baseRisk += formData.ca * 0.07;
  
  // Thalassemia is a strong predictor
  const thalWeights = [0, 0.05, 0.15, 0.07];
  baseRisk += thalWeights[formData.thal];
  
  // ST depression is a moderate predictor
  baseRisk += formData.oldpeak * 0.02;
  
  // Slope is a moderate predictor
  const slopeWeights = [0, 0.03, 0.08];  // Downsloping (2) is highest risk
  baseRisk += slopeWeights[formData.slope];
  
  // Exercise-induced angina is a moderate predictor
  baseRisk += formData.exang * 0.1;
  
  // Blood pressure is a mild predictor
  baseRisk += Math.max(0, (formData.trestbps - 120) * 0.0005);
  
  // Cholesterol is a mild predictor
  baseRisk += Math.max(0, (formData.chol - 200) * 0.0002);
  
  // Fasting blood sugar is a mild predictor
  baseRisk += formData.fbs * 0.02;
  
  // Heart rate has a complex relationship - both very low and very high can be issues
  const optimalHeartRate = 150;
  baseRisk += Math.abs(formData.thalach - optimalHeartRate) * 0.0005;
  
  // Clamp the risk probability between 0 and 1
  const probability = Math.min(0.98, Math.max(0.02, baseRisk));
  
  // Determine risk level based on probability
  let risk_level;
  if (probability < 0.3) {
    risk_level = "Low Risk";
  } else if (probability < 0.7) {
    risk_level = "Moderate Risk";
  } else {
    risk_level = "High Risk";
  }
  
  // Determine binary prediction (0 = negative, 1 = positive)
  const prediction = probability >= 0.5 ? 1 : 0;
  
  return {
    prediction,
    probability,
    probability_percent: (probability * 100).toFixed(1),
    risk_level,
    inputs: { ...formData }
  };
};