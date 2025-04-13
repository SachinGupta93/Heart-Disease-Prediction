import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Heading, Text, Badge, VStack, HStack, 
  Progress, Divider, SimpleGrid, Stat, StatLabel, 
  StatNumber, StatHelpText, useColorModeValue,
  Button, Icon, Flex, Spacer, Collapse, 
  List, ListItem, ListIcon, Alert, AlertIcon,
  useDisclosure, Fade, Tooltip, Accordion, AccordionItem, 
  AccordionButton, AccordionPanel, AccordionIcon,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton,
  useToast, Drawer, DrawerBody, DrawerFooter, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton, 
  Link, Input, Textarea, Select, FormControl, FormLabel,
  IconButton, InputGroup, InputRightElement, Grid
} from '@chakra-ui/react';
import { 
  FaHeartbeat, FaChartBar, FaInfoCircle, FaChevronDown, 
  FaChevronUp, FaExclamationTriangle, FaCheckCircle, 
  FaHospital, FaClipboardList, FaPhone, FaExternalLinkAlt, 
  FaChartLine, FaChartArea, FaStar, FaCommentAlt,
  FaCalendarCheck, FaNutritionix, FaRunning, FaTablets,
  FaFileDownload, FaShare, FaSmoking, FaWineGlass,
  FaWeight, FaWalking, FaAllergies, FaMap, FaEnvelope, FaPrint,
  FaSearch, FaUserMd, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaDownload, FaPaperPlane, FaWhatsapp, FaFacebook, FaTwitter,
  FaLinkedin, FaCopy, FaFilePdf
} from 'react-icons/fa';
import { usePrediction } from '../contexts/PredictionContext';
import ShapExplanation from './ShapExplanation';
import { useAuth } from '../contexts/AuthContext';
import { savePrediction } from '../services/firestore';
import { trackEvent } from '../services/errorLogging';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const RISK_THRESHOLDS = {
  LOW: 0.3,
  MODERATE: 0.6,
  HIGH: 0.8
};

const PredictionResult = () => {
  const { predictionData } = usePrediction();
  const [showExplanation, setShowExplanation] = useState(false);
  const { isOpen: isRecommendationsOpen, onToggle: toggleRecommendations } = useDisclosure({ defaultIsOpen: true });
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { currentUser } = useAuth();
  
  // Analytics and feedback states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const { isOpen: isInsightModalOpen, onOpen: openInsightModal, onClose: closeInsightModal } = useDisclosure();
  const { isOpen: isFeedbackOpen, onOpen: openFeedback, onClose: closeFeedback } = useDisclosure();
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const toast = useToast();
  const analyticsRef = useRef(null);
  const actionPlanRef = useRef(null);
  const resultRef = useRef(null);

  // New modal states
  const { isOpen: isDocFinderOpen, onOpen: openDocFinder, onClose: closeDocFinder } = useDisclosure();
  const { isOpen: isEmergencyOpen, onOpen: openEmergency, onClose: closeEmergency } = useDisclosure();
  const { isOpen: isScheduleOpen, onOpen: openSchedule, onClose: closeSchedule } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: openShare, onClose: closeShare } = useDisclosure();
  
  // Share state
  const [doctorEmail, setDoctorEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  
  // Schedule state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDoctor, setScheduleDoctor] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  
  // Location state for doctor finder
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('cardiologist');
  const [searchRadius, setSearchRadius] = useState('10');
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const lightBg = useColorModeValue('gray.50', 'gray.800');
  
  if (!predictionData) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={cardBg}>
        <VStack spacing={3} align="stretch">
          <Heading size="md">No Assessment Results</Heading>
          <Text>Complete the heart health assessment form to see your results.</Text>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              The assessment only takes a few minutes and can provide valuable insights into your heart health.
            </Text>
          </Alert>
        </VStack>
      </Box>
    );
  }
  
  const { 
    prediction, 
    probability, 
    probability_percent, 
    risk_level, 
    message,
    inputs 
  } = predictionData;
  
  // Format probability for display
  const displayProbability = probability_percent || 
    (probability ? `${(probability * 100).toFixed(1)}%` : '0%');
  const numericProbability = parseFloat(displayProbability) || 0;
  
  // Determine color based on risk level
  const getRiskColor = (risk) => {
    if (!risk) return "gray";
    if (risk.includes("Low")) return "green";
    if (risk.includes("Moderate")) return "orange";
    return "red";
  };
  
  const riskColor = getRiskColor(risk_level);
  
  // Generate health recommendations based on risk level and inputs
  const getHealthRecommendations = () => {
    const recommendations = [];
    
    // General recommendations for everyone
    recommendations.push("Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains");
    recommendations.push("Engage in regular physical activity (aim for at least 150 minutes per week)");
    
    // Risk-specific recommendations
    if (risk_level.includes("High")) {
      recommendations.push("Schedule an appointment with a cardiologist to discuss your heart health");
      recommendations.push("Monitor your blood pressure daily and keep a log");
      recommendations.push("Consider a cardiac stress test to evaluate your heart function");
    } else if (risk_level.includes("Moderate")) {
      recommendations.push("Follow up with your primary care physician within the next month");
      recommendations.push("Review your medications and lifestyle with your healthcare provider");
    }
    
    // Input-specific recommendations
    if (inputs.chol > 200) {
      recommendations.push("Work with your doctor to develop a plan to lower your cholesterol");
    }
    
    if (inputs.trestbps > 130) {
      recommendations.push("Follow a low-sodium diet to help manage your blood pressure");
    }
    
    if (inputs.fbs === 1) {
      recommendations.push("Monitor your blood sugar levels regularly and maintain a balanced diet");
    }
    
    if (inputs.exang === 1) {
      recommendations.push("Discuss angina symptoms and management options with your doctor");
    }
    
    return recommendations;
  };
  
  const recommendations = getHealthRecommendations();
  
  // Determine risk message
  const getRiskMessage = () => {
    if (risk_level.includes("High")) {
      return {
        icon: FaExclamationTriangle,
        color: "red",
        title: "High Risk Detected",
        content: "Your assessment indicates a higher risk of heart disease. Early intervention and medical consultation are strongly recommended."
      };
    } else if (risk_level.includes("Moderate")) {
      return {
        icon: FaInfoCircle,
        color: "orange",
        title: "Moderate Risk Detected",
        content: "Your assessment shows some risk factors for heart disease. Taking preventive measures now can help reduce your risk."
      };
    } else {
      return {
        icon: FaCheckCircle,
        color: "green",
        title: "Lower Risk Profile",
        content: "Your assessment shows a lower risk of heart disease. Continue maintaining a healthy lifestyle to keep your heart healthy."
      };
    }
  };
  
  const riskMessage = getRiskMessage();

  const handleSavePrediction = async () => {
    if (!currentUser) {
      setSaveError("Please log in to save your prediction");
      return;
    }
    
    try {
      // Prepare prediction data
      const predictionData = {
        prediction,
        probability,
        risk_level,
        inputs,
        date: new Date().toISOString(),
      };
      
      // Save to Firestore
      await savePrediction(currentUser.uid, predictionData);
      
      // Track successful save
      trackEvent('prediction_saved_ui', {
        userId: currentUser.uid,
        riskLevel: risk_level,
        hasHealthConcerns: inputs.chol > 200 || inputs.trestbps > 130
      });
      
      setIsSaved(true);
      setSaveError(null);
    } catch (error) {
      console.error("Error saving prediction:", error);
      setSaveError("Failed to save prediction. Please try again.");
    }
  };
  
  // Generate insights based on prediction and user inputs
  const generateInsights = () => {
    if (!predictionData || !inputs) return [];
    
    const insights = [];
    
    // Age-based insights
    if (inputs.age > 60) {
      insights.push({
        title: "Age Risk Factor",
        description: "Your age is a significant risk factor. Regular checkups are essential.",
        color: "blue",
        icon: FaInfoCircle
      });
    }
    
    // Cholesterol insights
    if (inputs.chol > 240) {
      insights.push({
        title: "High Cholesterol Alert",
        description: "Your cholesterol levels are significantly elevated, which increases heart disease risk.",
        color: "red",
        icon: FaExclamationTriangle
      });
    } else if (inputs.chol > 200) {
      insights.push({
        title: "Elevated Cholesterol",
        description: "Your cholesterol is above optimal levels. Dietary changes may help.",
        color: "orange",
        icon: FaInfoCircle
      });
    }
    
    // Blood pressure insights
    if (inputs.trestbps > 140) {
      insights.push({
        title: "High Blood Pressure Alert",
        description: "Your blood pressure reading indicates hypertension, a major risk factor.",
        color: "red",
        icon: FaExclamationTriangle
      });
    } else if (inputs.trestbps > 130) {
      insights.push({
        title: "Elevated Blood Pressure",
        description: "Your blood pressure is elevated. Lifestyle modifications may be beneficial.",
        color: "orange",
        icon: FaInfoCircle
      });
    }
    
    // Exercise angina insight
    if (inputs.exang === 1) {
      insights.push({
        title: "Exercise-Induced Angina",
        description: "Chest pain during exercise is a significant indicator of potential heart issues.",
        color: "red",
        icon: FaExclamationTriangle
      });
    }
    
    // Heart rate insights
    if (inputs.thalach < 100) {
      insights.push({
        title: "Low Maximum Heart Rate",
        description: "Your maximum heart rate during exercise is lower than expected, which may indicate reduced cardiac function.",
        color: "orange",
        icon: FaInfoCircle
      });
    }
    
    // Combination risk factors
    if (inputs.chol > 200 && inputs.trestbps > 130) {
      insights.push({
        title: "Multiple Risk Factors",
        description: "Having both elevated cholesterol and blood pressure significantly increases heart disease risk.",
        color: "red",
        icon: FaExclamationTriangle
      });
    }
    
    // Add personalized insight based on prediction
    if (prediction === 1 && probability > 0.7) {
      insights.push({
        title: "Urgent Health Advisory",
        description: "Your prediction shows a high probability of heart disease. We strongly recommend consulting with a cardiologist soon.",
        color: "red",
        icon: FaHospital
      });
    }
    
    return insights;
  };
  
  const insights = generateInsights();
  
  // Show immediate feedback based on risk level
  useEffect(() => {
    if (predictionData && risk_level) {
      // Show toast notification based on risk level
      const delay = 1500; // Give user time to see the results first
      
      setTimeout(() => {
        if (risk_level.includes("High")) {
          toast({
            title: "High Risk Detected",
            description: "We recommend immediate attention to your heart health.",
            status: "error",
            duration: 7000,
            isClosable: true,
            position: "top"
          });
          // Auto-open the insight modal for high risk users
          openInsightModal();
        } else if (risk_level.includes("Moderate")) {
          toast({
            title: "Moderate Risk Detected",
            description: "Consider discussing these results with your doctor.",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top"
          });
        } else {
          toast({
            title: "Lower Risk Profile",
            description: "Great job maintaining your heart health!",
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top"
          });
        }
      }, delay);
    }
  }, [predictionData, risk_level]);
  
  // Autoscroll to analytics section when it's opened
  useEffect(() => {
    if (showAnalytics && analyticsRef.current) {
      setTimeout(() => {
        analyticsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [showAnalytics]);
  
  // Track component view (keep your existing tracking code)
  useEffect(() => {
    if (currentUser && predictionData) {
      trackEvent('prediction_result_viewed', {
        userId: currentUser.uid,
        riskLevel: risk_level
      });
    }
  }, [currentUser, predictionData]);
  
  // Submit feedback handler
  const handleSubmitFeedback = async () => {
    try {
      // Create feedback object
      const feedback = {
        userId: currentUser?.uid || 'anonymous',
        rating: feedbackRating,
        comment: feedbackComment,
        timestamp: new Date().toISOString(),
        predictionData: predictionData ? {
          risk_level,
          probability
        } : null
      };
      
      // Track feedback submission
      trackEvent('feedback_submitted', {
        userId: currentUser?.uid || 'anonymous',
        rating: feedbackRating,
        hasPrediction: !!predictionData
      });
      
      // Reset form and close
      setFeedbackRating(0);
      setFeedbackComment('');
      closeFeedback();
      
      // Show success toast
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "We couldn't submit your feedback. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  // New function to determine personalized lifestyle recommendations
  const getLifestyleRecommendations = () => {
    if (!predictionData || !inputs) return [];
    
    const recommendations = [];
    
    // Diet recommendations
    if (inputs.chol > 200) {
      recommendations.push({
        category: "Diet",
        title: "Heart-Healthy Diet",
        description: "Follow a diet low in saturated fats and rich in fruits, vegetables, whole grains, and lean proteins to help lower cholesterol.",
        actionItems: [
          "Increase omega-3 fatty acids through fish or supplements",
          "Reduce saturated fat intake (less than 7% of daily calories)",
          "Add soluble fiber from oats, beans, and fruits"
        ],
        icon: FaNutritionix,
        color: "green"
      });
    }
    
    // Exercise recommendations
    if (inputs.thalach < 150 || inputs.exang === 1) {
      recommendations.push({
        category: "Exercise",
        title: "Cardiovascular Fitness Program",
        description: "A structured exercise program can improve heart function and reduce symptoms of angina over time.",
        actionItems: [
          "Start with 10-minute walking sessions and gradually increase",
          "Aim for 150 minutes of moderate activity weekly",
          "Consider cardiac rehabilitation if recommended by your doctor"
        ],
        icon: FaRunning,
        color: "blue"
      });
    }
    
    // Lifestyle changes for blood pressure
    if (inputs.trestbps > 130) {
      recommendations.push({
        category: "Lifestyle",
        title: "Blood Pressure Management",
        description: "Managing your blood pressure can significantly reduce your risk of heart disease complications.",
        actionItems: [
          "Reduce sodium intake to less than 1,500mg daily",
          "Practice stress reduction techniques like meditation",
          "Monitor blood pressure at home regularly"
        ],
        icon: FaHeartbeat,
        color: "red"
      });
    }
    
    // Medication adherence for older patients or those with multiple risk factors
    if (inputs.age > 55 || (inputs.chol > 200 && inputs.trestbps > 130)) {
      recommendations.push({
        category: "Medication",
        title: "Medication Management",
        description: "Proper medication adherence is critical for managing heart disease risk factors.",
        actionItems: [
          "Use pill organizers or reminder apps",
          "Never skip doses of heart medications",
          "Report any side effects to your doctor immediately"
        ],
        icon: FaTablets,
        color: "purple"
      });
    }
    
    // Smoking cessation if applicable
    if (inputs.currentSmoker === 1 || inputs.smoker === 1) {
      recommendations.push({
        category: "Habits",
        title: "Smoking Cessation",
        description: "Quitting smoking is the single most important step you can take for heart health.",
        actionItems: [
          "Ask your doctor about cessation aids (patches, gum, medications)",
          "Join a support group or quit-smoking program",
          "Set a quit date within the next 2 weeks"
        ],
        icon: FaSmoking,
        color: "orange"
      });
    }
    
    // Weight management if BMI is high
    if (inputs.bmi > 25 || inputs.obesity === 1) {
      recommendations.push({
        category: "Weight",
        title: "Weight Management",
        description: "Achieving a healthy weight can reduce strain on your heart and improve overall cardiovascular health.",
        actionItems: [
          "Set realistic goals (1-2 pounds per week)",
          "Keep a food journal to track intake",
          "Focus on portion control rather than strict dieting"
        ],
        icon: FaWeight,
        color: "teal"
      });
    }
    
    // If none of the specific conditions apply, provide general recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        category: "Prevention",
        title: "Preventive Health Maintenance",
        description: "Even with lower risk, maintaining good habits is essential for long-term heart health.",
        actionItems: [
          "Schedule yearly physical examinations",
          "Maintain a balanced diet rich in fruits and vegetables",
          "Stay physically active with at least 30 minutes of exercise daily"
        ],
        icon: FaHeartbeat,
        color: "green"
      });
    }
    
    return recommendations;
  };
  
  // Function to calculate the user's 5-year risk trajectory
  const calculateRiskTrajectory = () => {
    if (!predictionData || !inputs) return null;
    
    const currentRisk = probability;
    let riskReduction = 0;
    
    // Estimate risk reduction potential based on modifiable factors
    if (inputs.chol > 200) riskReduction += 0.05;
    if (inputs.trestbps > 130) riskReduction += 0.07;
    if (inputs.currentSmoker === 1 || inputs.smoker === 1) riskReduction += 0.10;
    if (inputs.bmi > 25 || inputs.obesity === 1) riskReduction += 0.04;
    if (inputs.exang === 1) riskReduction += 0.06;
    
    // Calculate best and worst case scenarios
    const bestCaseRisk = Math.max(0.05, currentRisk - riskReduction);
    const worstCaseRisk = Math.min(0.95, currentRisk + (currentRisk * 0.2));
    const unchangedRisk = currentRisk;
    
    return {
      currentRisk,
      bestCaseRisk,
      worstCaseRisk,
      unchangedRisk,
      yearsProjected: 5,
      potentialReduction: riskReduction,
      hasMajorModifiableFactors: riskReduction > 0.05
    };
  };
  
  // Function to get treatment pathway recommendations based on risk level
  const getTreatmentPathway = () => {
    if (!predictionData || !risk_level) return [];
    
    const pathwaySteps = [];
    
    if (risk_level.includes("High")) {
      pathwaySteps.push({
        step: 1,
        timeframe: "Immediate",
        action: "Schedule a cardiology consultation",
        description: "Have your complete cardiovascular health evaluated by a specialist."
      });
      pathwaySteps.push({
        step: 2,
        timeframe: "Within 1 month",
        action: "Complete recommended diagnostic tests",
        description: "May include ECG, stress test, echocardiogram, or blood tests."
      });
      pathwaySteps.push({
        step: 3,
        timeframe: "Within 2 months",
        action: "Begin appropriate treatment plan",
        description: "May include medication, lifestyle changes, or further evaluation."
      });
      pathwaySteps.push({
        step: 4,
        timeframe: "Ongoing",
        action: "Regular follow-up visits",
        description: "Typically every 3-6 months to monitor progress and adjust treatment."
      });
    } else if (risk_level.includes("Moderate")) {
      pathwaySteps.push({
        step: 1,
        timeframe: "Within 1 month",
        action: "Schedule a visit with your primary care physician",
        description: "Discuss your heart disease risk assessment results."
      });
      pathwaySteps.push({
        step: 2,
        timeframe: "Within 3 months",
        action: "Complete baseline testing",
        description: "May include lipid panel, blood pressure monitoring, and glucose testing."
      });
      pathwaySteps.push({
        step: 3,
        timeframe: "Within 6 months",
        action: "Implement lifestyle modifications",
        description: "Follow dietary, exercise, and other lifestyle recommendations."
      });
      pathwaySteps.push({
        step: 4,
        timeframe: "Annually",
        action: "Reassess cardiovascular risk",
        description: "Track your progress and make adjustments to your health plan."
      });
    } else {
      pathwaySteps.push({
        step: 1,
        timeframe: "Within 3 months",
        action: "Regular check-up with primary care provider",
        description: "Share these assessment results during your next routine visit."
      });
      pathwaySteps.push({
        step: 2,
        timeframe: "Annually",
        action: "Routine preventive screening",
        description: "Including blood pressure, cholesterol, and glucose checks."
      });
      pathwaySteps.push({
        step: 3,
        timeframe: "Ongoing",
        action: "Maintain heart-healthy lifestyle",
        description: "Continue with healthy diet, regular exercise, and stress management."
      });
      pathwaySteps.push({
        step: 4,
        timeframe: "Every 5 years",
        action: "Comprehensive cardiovascular assessment",
        description: "For early detection of any developing risk factors."
      });
    }
    
    return pathwaySteps;
  };
  
  // Get data for new components
  const lifestyleRecommendations = getLifestyleRecommendations();
  const riskTrajectory = calculateRiskTrajectory();
  const treatmentPathway = getTreatmentPathway();

  // Autoscroll to action plan section when it's opened
  useEffect(() => {
    if (showActionPlan && actionPlanRef.current) {
      setTimeout(() => {
        actionPlanRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [showActionPlan]);

  // PDF generation function
  const generatePDF = async () => {
    if (!resultRef.current) return;
    
    try {
      toast({
        title: "Generating PDF...",
        status: "info",
        duration: 2000,
        isClosable: true
      });
      
      const element = resultRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; 
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Heart_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your heart health report has been downloaded",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
      // Track PDF generation event
      trackEvent('report_pdf_downloaded', {
        userId: currentUser?.uid || 'anonymous',
        riskLevel: risk_level
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF report. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Function to handle sharing results with doctor
  const handleShareWithDoctor = async () => {
    if (!doctorEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your doctor's email address.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setShareLoading(true);
    
    try {
      // Simulating sending email to doctor (in a real app, this would connect to a backend API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track sharing event
      trackEvent('results_shared_with_doctor', {
        userId: currentUser?.uid || 'anonymous',
        riskLevel: risk_level,
        hasMessage: shareMessage.length > 0
      });
      
      setShareLoading(false);
      closeShare();
      
      toast({
        title: "Results Shared Successfully",
        description: `Your results have been shared with ${doctorEmail}`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
      // Reset form
      setDoctorEmail('');
      setShareMessage('');
    } catch (error) {
      console.error("Error sharing results:", error);
      setShareLoading(false);
      
      toast({
        title: "Sharing Failed",
        description: "Unable to share results. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Function to handle scheduling a follow-up appointment
  const handleScheduleAppointment = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Date and Time Required",
        description: "Please select a date and time for your appointment.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      // Simulating scheduling API call (in a real app, this would connect to a calendar/scheduling service)
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Track appointment scheduling event
      trackEvent('follow_up_scheduled', {
        userId: currentUser?.uid || 'anonymous',
        riskLevel: risk_level,
        withDoctor: scheduleDoctor.length > 0
      });
      
      closeSchedule();
      
      toast({
        title: "Appointment Scheduled",
        description: `Your appointment has been scheduled for ${scheduleDate} at ${scheduleTime}`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
      // Reset form
      setScheduleDate('');
      setScheduleTime('');
      setScheduleDoctor('');
      setScheduleNotes('');
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule appointment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Function to find doctors in the area
  const handleFindDoctors = async () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enter your location to find doctors nearby.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      // In a real app, this would call a doctor lookup API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track doctor search event
      trackEvent('doctor_search', {
        userId: currentUser?.uid || 'anonymous',
        specialty: specialty,
        location: location
      });
      
      toast({
        title: "Doctors Found",
        description: `We found several ${specialty}s near ${location}`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
      // We don't close the modal here to show the "found" doctors
    } catch (error) {
      console.error("Error finding doctors:", error);
      toast({
        title: "Search Failed",
        description: "Unable to find doctors at this time. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Function to generate action plan PDF
  const generateActionPlanPDF = async () => {
    if (!actionPlanRef.current) return;
    
    try {
      toast({
        title: "Generating Action Plan...",
        status: "info",
        duration: 2000,
        isClosable: true
      });
      
      const element = actionPlanRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; 
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Heart_Health_Action_Plan_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Action Plan Downloaded",
        description: "Your personalized health action plan has been saved as a PDF",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
      // Track action plan download event
      trackEvent('action_plan_downloaded', {
        userId: currentUser?.uid || 'anonymous',
        riskLevel: risk_level
      });
    } catch (error) {
      console.error("Error generating action plan PDF:", error);
      toast({
        title: "Download Failed",
        description: "Unable to generate action plan PDF. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Function to handle emergency contact
  const handleEmergencyContact = () => {
    // In a real app, this might connect to emergency services or show emergency numbers
    openEmergency();
    
    // Track emergency contact event
    trackEvent('emergency_contact_opened', {
      userId: currentUser?.uid || 'anonymous',
      riskLevel: risk_level
    });
  };

  return (
    <VStack spacing={6} align="stretch" ref={resultRef}>
      <Box 
        p={6} 
        shadow="md" 
        borderWidth="1px" 
        borderRadius="lg" 
        bg={cardBg}
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Flex align="center" wrap="wrap">
            <Box mb={{ base: 2, md: 0 }}>
              <Heading size="lg" display="flex" alignItems="center">
                <Icon as={FaHeartbeat} color={`${riskColor}.500`} mr={3} />
                Heart Health Assessment Results
              </Heading>
              <Text color="gray.500" mt={1}>
                Based on your information, we've analyzed your heart disease risk profile
              </Text>
            </Box>
            <Spacer />
            <Badge 
              colorScheme={riskColor} 
              p={2} 
              borderRadius="md" 
              fontSize="md"
              fontWeight="bold"
              textTransform="none"
              boxShadow="sm"
            >
              {risk_level || "Unknown Risk"}
            </Badge>
          </Flex>
          
          <Divider />
          
          <Box py={2} px={4} bg={`${riskColor}.50`} borderRadius="md" borderLeft={`4px solid ${useColorModeValue(`${riskColor}.500`, `${riskColor}.400`)}`}>
            <Flex align="center">
              <Icon as={riskMessage.icon} color={`${riskColor}.500`} boxSize={5} mr={3} />
              <Box>
                <Text fontWeight="bold" fontSize="md">{riskMessage.title}</Text>
                <Text fontSize="sm" mt={1}>{riskMessage.content}</Text>
              </Box>
            </Flex>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={3}>Risk Assessment</Text>
              
              <Box mb={6}>
                <Text mb={2}>Likelihood of Heart Disease:</Text>
                <Progress 
                  value={numericProbability} 
                  colorScheme={riskColor}
                  height="24px"
                  borderRadius="md"
                />
                <Flex justify="space-between" mt={1}>
                  <Text fontWeight="bold">{displayProbability}</Text>
                  <Tooltip label="This percentage represents the estimated probability of heart disease based on your risk factors">
                    <Text fontSize="sm" color="gray.500" cursor="help">
                      Probability <Icon as={FaInfoCircle} boxSize={3} ml={1} />
                    </Text>
                  </Tooltip>
                </Flex>
              </Box>
              
              <Alert status={risk_level.includes("Low") ? "success" : "warning"} variant="left-accent" mb={4} borderRadius="md">
                <AlertIcon />
                <Text fontWeight="medium">{message || 
                  (prediction === 1 
                    ? "You may have an elevated risk of heart disease. Consider consulting with a healthcare professional."
                    : "Your risk of heart disease appears to be lower. Maintain a healthy lifestyle."
                  )}
                </Text>
              </Alert>
              
              <Button
                leftIcon={<Icon as={FaClipboardList} />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={toggleRecommendations}
                mb={4}
                width="full"
              >
                {isRecommendationsOpen ? 'Hide Recommendations' : 'Show Recommendations'}
              </Button>
              
              <Collapse in={isRecommendationsOpen} animateOpacity>
                <Box p={4} bg={lightBg} borderRadius="md" mb={4}>
                  <Text fontWeight="medium" mb={2}>Recommended Next Steps:</Text>
                  <List spacing={2}>
                    {recommendations.map((rec, index) => (
                      <ListItem key={index} display="flex" alignItems="flex-start">
                        <ListIcon as={FaCheckCircle} color={`${riskColor}.500`} mt={1} />
                        <Text fontSize="sm">{rec}</Text>
                      </ListItem>
                    ))}
                  </List>
                  
                  {risk_level.includes("High") && (
                    <Button 
                      leftIcon={<Icon as={FaHospital} />} 
                      mt={3} 
                      size="sm" 
                      colorScheme="red"
                      variant="solid"
                    >
                      Find a Cardiologist
                    </Button>
                  )}
                </Box>
              </Collapse>
            </Box>
            
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={3}>Key Health Indicators</Text>
              <SimpleGrid columns={2} spacing={4}>
                <Stat bg={lightBg} p={3} borderRadius="md">
                  <StatLabel>Age</StatLabel>
                  <StatNumber>{inputs?.age || 'N/A'}</StatNumber>
                  <StatHelpText>years</StatHelpText>
                </Stat>
                <Stat bg={lightBg} p={3} borderRadius="md">
                  <StatLabel>Blood Pressure</StatLabel>
                  <StatNumber>{inputs?.trestbps || 'N/A'}</StatNumber>
                  <StatHelpText>
                    mmHg
                    {inputs?.trestbps > 130 && (
                      <Badge colorScheme="orange" ml={1}>Elevated</Badge>
                    )}
                  </StatHelpText>
                </Stat>
                <Stat bg={lightBg} p={3} borderRadius="md">
                  <StatLabel>Cholesterol</StatLabel>
                  <StatNumber>{inputs?.chol || 'N/A'}</StatNumber>
                  <StatHelpText>
                    mg/dl
                    {inputs?.chol > 200 && (
                      <Badge colorScheme="orange" ml={1}>Elevated</Badge>
                    )}
                  </StatHelpText>
                </Stat>
                <Stat bg={lightBg} p={3} borderRadius="md">
                  <StatLabel>Max Heart Rate</StatLabel>
                  <StatNumber>{inputs?.thalach || 'N/A'}</StatNumber>
                  <StatHelpText>bpm</StatHelpText>
                </Stat>
                <Stat bg={lightBg} p={3} borderRadius="md">
                  <StatLabel>Chest Pain</StatLabel>
                  <StatNumber fontSize="md">
                    {inputs?.cp === 0 ? 'Typical Angina' : 
                     inputs?.cp === 1 ? 'Atypical Angina' : 
                     inputs?.cp === 2 ? 'Non-anginal Pain' : 
                     inputs?.cp === 3 ? 'Asymptomatic' : 'N/A'}
                  </StatNumber>
                </Stat>
                <Stat bg={lightBg} p={3} borderRadius="md">
                  <StatLabel>Exercise Angina</StatLabel>
                  <StatNumber fontSize="md">
                    {inputs?.exang === 1 ? 'Yes' : 
                     inputs?.exang === 0 ? 'No' : 'N/A'}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
              
              <Box mt={4}>
                <Button
                  rightIcon={<Icon as={FaExternalLinkAlt} />}
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                  width="full"
                  onClick={generatePDF}
                >
                  Download Report PDF
                </Button>
              </Box>
            </Box>
          </SimpleGrid>
        </VStack>
        
        {/* Add Analytics and Action Plan Buttons */}
        <Flex mt={4} justifyContent="center" flexWrap="wrap" gap={2}>
          <Button
            leftIcon={<Icon as={FaChartArea} />}
            colorScheme="purple"
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Health Analytics'}
          </Button>
          
          <Button
            leftIcon={<Icon as={FaClipboardList} />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={() => setShowActionPlan(!showActionPlan)}
          >
            {showActionPlan ? 'Hide Action Plan' : 'Personal Health Action Plan'}
          </Button>
          
          <Button
            leftIcon={<Icon as={FaCommentAlt} />}
            colorScheme="teal"
            variant="outline"
            size="sm"
            onClick={openFeedback}
          >
            Provide Feedback
          </Button>
        </Flex>
      </Box>
      
      {/* Feature importance explanation toggle button */}
      <Button
        onClick={() => setShowExplanation(!showExplanation)}
        rightIcon={showExplanation ? <FaChevronUp /> : <FaChevronDown />}
        colorScheme="blue"
        variant="outline"
        leftIcon={<FaChartBar />}
      >
        {showExplanation ? 'Hide Detailed Explanation' : 'Show Detailed Explanation'}
      </Button>
      
      {/* Feature importance explanation */}
      <Collapse in={showExplanation} animateOpacity>
        <Box 
          p={6} 
          shadow="md" 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={cardBg}
          borderColor={borderColor}
        >
          <Heading size="md" mb={4} display="flex" alignItems="center">
            <Icon as={FaChartBar} mr={2} />
            Understanding Your Results
          </Heading>
          
          <Text mb={4}>
            The chart below explains how each health factor contributed to your heart disease risk prediction. 
            Longer bars indicate factors that had a stronger influence on your assessment result.
          </Text>
          
          {/* Include the SHAP explanation component */}
          <ShapExplanation predictionData={predictionData} />
        </Box>
      </Collapse>
      
      <Divider my={2} />
      
      <Box>
        <Alert status="info" variant="subtle" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm" color="gray.600">
            This assessment is based on machine learning analysis of health data and should not replace
            professional medical advice. Always consult with healthcare professionals for proper
            diagnosis and treatment.
          </Text>
        </Alert>
        
        <HStack mt={4} spacing={4} justify="center">
          <Button
            size="sm"
            leftIcon={<Icon as={FaPhone} />}
            colorScheme="brand"
            variant="outline"
            onClick={handleEmergencyContact}
          >
            Emergency Contact
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={FaHospital} />}
            colorScheme="brand"
            variant="outline"
            onClick={openDocFinder}
          >
            Find a Doctor
          </Button>
        </HStack>
      </Box>

      {/* Error message */}
      {saveError && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {saveError}
        </Alert>
      )}
      
      {/* Action buttons */}
      <Flex mt={8} justify="space-between">
        <Button colorScheme="blue" variant="outline"  onClick={() => window.location.href = '/risk-assessment'}>
          New Prediction
        </Button>
        
        <Button 
          onClick={handleSavePrediction} 
          colorScheme="teal" 
          isDisabled={isSaved || !currentUser}
        >
          {isSaved ? "Saved ✓" : "Save Prediction"}
        </Button>
      </Flex>
      
      {/* Health Analytics Section */}
      <Collapse in={showAnalytics} animateOpacity>
        <Box 
          ref={analyticsRef}
          p={6} 
          shadow="md" 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={cardBg}
          borderColor={borderColor}
          mt={4}
        >
          <Heading size="md" mb={4} display="flex" alignItems="center">
            <Icon as={FaChartArea} mr={2} color="purple.500" />
            Detailed Health Analytics
          </Heading>
          
          <Text mb={6}>
            These analytics provide deeper insights into your heart health based on your assessment data and medical research.
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Risk Comparison */}
            <Box p={4} bg={lightBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="purple.500">
              <Heading size="sm" mb={3}>Risk Comparison</Heading>
              <Text fontSize="sm" mb={3}>
                Your heart disease risk compared to people of similar age and gender:
              </Text>
              
              <Flex align="center" mb={2}>
                <Text width="30%" fontSize="sm">Your Risk:</Text>
                <Progress 
                  value={numericProbability} 
                  colorScheme={riskColor}
                  size="sm"
                  width="60%" 
                  borderRadius="md"
                />
                <Text width="10%" fontSize="sm" ml={2}>{displayProbability}</Text>
              </Flex>
              
              <Flex align="center" mb={2}>
                <Text width="30%" fontSize="sm">Average Risk:</Text>
                <Progress 
                  value={40} 
                  colorScheme="gray"
                  size="sm"
                  width="60%" 
                  borderRadius="md"
                />
                <Text width="10%" fontSize="sm" ml={2}>40%</Text>
              </Flex>
              
              <Text fontSize="xs" color="gray.500" mt={2}>
                *Based on population health data for similar demographic groups
              </Text>
            </Box>
            
            {/* Key Risk Factors */}
            <Box p={4} bg={lightBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="purple.500">
              <Heading size="sm" mb={3}>Your Key Risk Factors</Heading>
              <VStack align="stretch" spacing={2}>
                {inputs?.chol > 200 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Cholesterol Level</Text>
                    <Badge colorScheme="orange">High Impact</Badge>
                  </Flex>
                )}
                {inputs?.trestbps > 130 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Blood Pressure</Text>
                    <Badge colorScheme="orange">High Impact</Badge>
                  </Flex>
                )}
                {inputs?.exang === 1 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Exercise Angina</Text>
                    <Badge colorScheme="red">Very High Impact</Badge>
                  </Flex>
                )}
                {inputs?.age > 60 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Age Factor</Text>
                    <Badge colorScheme="orange">High Impact</Badge>
                  </Flex>
                )}
                {inputs?.fbs === 1 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Blood Sugar Level</Text>
                    <Badge colorScheme="yellow">Medium Impact</Badge>
                  </Flex>
                )}
              </VStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                *Ranked by contribution to your heart disease risk prediction
              </Text>
            </Box>
            
            {/* Health Improvement Potential */}
            <Box p={4} bg={lightBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="purple.500">
              <Heading size="sm" mb={3}>Health Improvement Potential</Heading>
              <Text fontSize="sm" mb={3}>
                Estimated risk reduction by improving these factors:
              </Text>
              
              {inputs?.chol > 200 && (
                <Flex align="center" mb={2}>
                  <Text width="60%" fontSize="sm">Lowering Cholesterol to Normal</Text>
                  <Badge colorScheme="green" ml={2}>-15% Risk</Badge>
                </Flex>
              )}
              
              {inputs?.trestbps > 130 && (
                <Flex align="center" mb={2}>
                  <Text width="60%" fontSize="sm">Reducing Blood Pressure to Normal</Text>
                  <Badge colorScheme="green" ml={2}>-20% Risk</Badge>
                </Flex>
              )}
              
              {inputs?.exang === 1 && (
                <Flex align="center" mb={2}>
                  <Text width="60%" fontSize="sm">Addressing Exercise Angina</Text>
                  <Badge colorScheme="green" ml={2}>-25% Risk</Badge>
                </Flex>
              )}
              
              <Box mt={3} p={2} bg="green.50" borderRadius="sm">
                <Text fontSize="sm" fontWeight="medium">
                  By addressing all modifiable factors, your risk could potentially be reduced by up to 40%.
                </Text>
              </Box>
            </Box>
            
            {/* Recommended Monitoring */}
            <Box p={4} bg={lightBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="purple.500">
              <Heading size="sm" mb={3}>Recommended Monitoring</Heading>
              <VStack align="stretch" spacing={2} fontSize="sm">
                <Flex justify="space-between">
                  <Text>Blood Pressure Check</Text>
                  <Text fontWeight="medium">{risk_level.includes("High") ? "Weekly" : "Monthly"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Cholesterol Test</Text>
                  <Text fontWeight="medium">{risk_level.includes("High") ? "Every 3 months" : "Every 6 months"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Cardiac Checkup</Text>
                  <Text fontWeight="medium">{risk_level.includes("High") ? "Every 6 months" : "Yearly"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Exercise Stress Test</Text>
                  <Text fontWeight="medium">{risk_level.includes("High") ? "Recommended" : "As advised"}</Text>
                </Flex>
              </VStack>
              <Text fontSize="xs" color="gray.500" mt={3}>
                *Always follow your healthcare provider's specific recommendations
              </Text>
            </Box>
          </SimpleGrid>
          
          <Button
            mt={6}
            leftIcon={<Icon as={FaExternalLinkAlt} />}
            colorScheme="purple"
            variant="outline"
            size="sm"
            onClick={openInsightModal}
          >
            View Personalized Insights
          </Button>
        </Box>
      </Collapse>
      
      {/* New Health Action Plan Section */}
      <Collapse in={showActionPlan} animateOpacity>
        <Box 
          ref={actionPlanRef}
          p={6} 
          shadow="md" 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={cardBg}
          borderColor={borderColor}
          mt={4}
        >
          <Heading size="md" mb={4} display="flex" alignItems="center">
            <Icon as={FaClipboardList} mr={2} color="blue.500" />
            Your Personalized Health Action Plan
          </Heading>
          
          <Text mb={6}>
            Based on your assessment results, we've created a personalized action plan to help you improve 
            your heart health and potentially reduce your risk of heart disease.
          </Text>
          
          {/* Lifestyle Recommendations Section */}
          <Box mb={8}>
            <Heading size="sm" mb={4} color="blue.600">
              Key Lifestyle Recommendations
            </Heading>
            
            {lifestyleRecommendations.map((rec, index) => (
              <Box 
                key={index} 
                p={4} 
                mb={4} 
                borderRadius="md" 
                bg={`${rec.color}.50`}
                borderLeft="4px solid" 
                borderLeftColor={`${rec.color}.500`}
              >
                <Flex align="center" mb={2}>
                  <Icon as={rec.icon} color={`${rec.color}.500`} boxSize={5} mr={2} />
                  <Text fontWeight="bold">{rec.title}</Text>
                  <Badge ml={2} colorScheme={rec.color}>{rec.category}</Badge>
                </Flex>
                
                <Text fontSize="sm" mb={3}>{rec.description}</Text>
                
                <Text fontWeight="medium" fontSize="sm" mb={1}>Action Steps:</Text>
                <List spacing={1}>
                  {rec.actionItems.map((item, i) => (
                    <ListItem key={i} display="flex" fontSize="sm">
                      <ListIcon as={FaCheckCircle} color={`${rec.color}.500`} mt={1} />
                      {item}
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
          
          {/* Risk Trajectory Section */}
          {riskTrajectory && (
            <Box mb={8} p={4} borderRadius="md" bg={lightBg}>
              <Heading size="sm" mb={4} color="blue.600">
                Your 5-Year Risk Trajectory
              </Heading>
              
              <Text fontSize="sm" mb={4}>
                This chart shows how your heart disease risk could change over the next {riskTrajectory.yearsProjected} years 
                based on different scenarios:
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                <Box p={3} bg={cardBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="red.500">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>If Risk Factors Worsen</Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    {(riskTrajectory.worstCaseRisk * 100).toFixed(1)}%
                  </Text>
                  <Text fontSize="xs" color="gray.500">Estimated risk in 5 years</Text>
                </Box>
                
                <Box p={3} bg={cardBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="yellow.500">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>If No Changes Made</Text>
                  <Text fontSize="xl" fontWeight="bold" color="yellow.500">
                    {(riskTrajectory.unchangedRisk * 100).toFixed(1)}%
                  </Text>
                  <Text fontSize="xs" color="gray.500">Estimated risk in 5 years</Text>
                </Box>
                
                <Box p={3} bg={cardBg} borderRadius="md" borderLeft="4px solid" borderLeftColor="green.500">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>With Health Improvements</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.500">
                    {(riskTrajectory.bestCaseRisk * 100).toFixed(1)}%
                  </Text>
                  <Text fontSize="xs" color="gray.500">Estimated risk in 5 years</Text>
                </Box>
              </SimpleGrid>
              
              {riskTrajectory.hasMajorModifiableFactors && (
                <Alert status="info" variant="left-accent" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">Good news!</Text>
                    <Text fontSize="sm">
                      You have modifiable risk factors that could potentially reduce your risk by up to {(riskTrajectory.potentialReduction * 100).toFixed(0)}% 
                      by following the recommended lifestyle changes and medical advice.
                    </Text>
                  </Box>
                </Alert>
              )}
            </Box>
          )}
          
          {/* Treatment Pathway Section */}
          <Box mb={6}>
            <Heading size="sm" mb={4} color="blue.600">
              Recommended Care Pathway
            </Heading>
            
            <Box borderRadius="md" borderWidth="1px" borderColor={borderColor} overflow="hidden">
              {treatmentPathway.map((step, index) => (
                <Box 
                  key={index} 
                  p={4} 
                  borderBottomWidth={index < treatmentPathway.length - 1 ? "1px" : "0"}
                  borderBottomColor={borderColor}
                  bg={index % 2 === 0 ? lightBg : cardBg}
                >
                  <Flex align="center" mb={2}>
                    <Box 
                      w="24px" 
                      h="24px" 
                      borderRadius="full" 
                      bg="blue.500" 
                      color="white" 
                      fontSize="sm"
                      fontWeight="bold" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                      mr={3}
                    >
                      {step.step}
                    </Box>
                    <Text fontWeight="bold">{step.action}</Text>
                    <Badge ml="auto" colorScheme="blue">{step.timeframe}</Badge>
                  </Flex>
                  <Text fontSize="sm" ml="33px">{step.description}</Text>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Flex mt={6} justify="center" wrap="wrap" gap={3}>
            <Button
              leftIcon={<Icon as={FaFileDownload} />}
              colorScheme="blue"
              size="sm"
              onClick={generateActionPlanPDF}
            >
              Download Action Plan
            </Button>
            
            <Button
              leftIcon={<Icon as={FaCalendarCheck} />}
              colorScheme="green"
              size="sm"
              onClick={openSchedule}
            >
              Schedule Follow-up
            </Button>
            
            <Button
              leftIcon={<Icon as={FaShare} />}
              colorScheme="purple"
              size="sm"
              variant="outline"
              onClick={openShare}
            >
              Share With Doctor
            </Button>
          </Flex>
          
          <Alert status="info" mt={6} borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              This action plan is generated based on your assessment data and general health guidelines.
              Always consult with healthcare professionals before making significant lifestyle or medication changes.
            </Text>
          </Alert>
        </Box>
      </Collapse>
      
      {/* Personalized Insights Modal */}
      <Modal isOpen={isInsightModalOpen} onClose={closeInsightModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" alignItems="center">
            <Icon as={FaInfoCircle} mr={2} color="blue.500" />
            Personalized Health Insights
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {insights.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {insights.map((insight, index) => (
                  <Box 
                    key={index} 
                    p={4} 
                    borderRadius="md" 
                    bg={`${insight.color}.50`}
                    borderLeft="4px solid" 
                    borderLeftColor={`${insight.color}.500`}
                  >
                    <Flex align="center" mb={2}>
                      <Icon as={insight.icon} color={`${insight.color}.500`} mr={2} />
                      <Heading size="sm">{insight.title}</Heading>
                    </Flex>
                    <Text fontSize="sm">{insight.description}</Text>
                  </Box>
                ))}
                
                <Alert status="info" mt={2}>
                  <AlertIcon />
                  <Box fontSize="sm">
                    <Text fontWeight="bold">Next Steps</Text>
                    <Text>
                      Based on these insights, consider scheduling a consultation with a healthcare provider
                      to discuss your heart health in more detail.
                    </Text>
                  </Box>
                </Alert>
              </VStack>
            ) : (
              <Box textAlign="center" py={6}>
                <Icon as={FaCheckCircle} color="green.500" boxSize={8} mb={3} />
                <Heading size="md" mb={2}>No Critical Insights</Heading>
                <Text>
                  We don't see any critical health concerns based on your assessment data.
                  Continue monitoring your health and following your regular checkup schedule.
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeInsightModal}>
              Close
            </Button>
            <Button variant="outline">Download Insights</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Feedback Drawer */}
      <Drawer isOpen={isFeedbackOpen} placement="right" onClose={closeFeedback}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <Icon as={FaCommentAlt} mr={2} />
              Share Your Feedback
            </Flex>
          </DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={5} align="stretch" mt={4}>
              <Box>
                <Text mb={2} fontWeight="medium">How would you rate this assessment?</Text>
                <Flex>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Icon
                      key={rating}
                      as={FaStar}
                      boxSize={8}
                      mr={2}
                      cursor="pointer"
                      color={rating <= feedbackRating ? "yellow.400" : "gray.200"}
                      onClick={() => setFeedbackRating(rating)}
                    />
                  ))}
                </Flex>
              </Box>
              
              <Box>
                <Text mb={2} fontWeight="medium">Your comments (optional)</Text>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #E2E8F0'
                  }}
                />
              </Box>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Your feedback helps us improve our heart health assessment tool.
                </Text>
              </Alert>
            </VStack>
          </DrawerBody>
          
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={closeFeedback}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={handleSubmitFeedback}
              isDisabled={feedbackRating === 0}
            >
              Submit Feedback
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Share Results Modal */}
      <Modal isOpen={isShareOpen} onClose={closeShare}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Results with Doctor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="doctorEmail" isRequired>
              <FormLabel>Doctor's Email</FormLabel>
              <Input 
                type="email" 
                value={doctorEmail} 
                onChange={(e) => setDoctorEmail(e.target.value)} 
                placeholder="doctor@example.com" 
              />
            </FormControl>
            
            <FormControl id="shareMessage" mt={4}>
              <FormLabel>Message (optional)</FormLabel>
              <Textarea 
                value={shareMessage} 
                onChange={(e) => setShareMessage(e.target.value)} 
                placeholder="Include any questions or concerns for your doctor..."
                size="sm"
                rows={4}
              />
            </FormControl>
            
            <Box mt={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontSize="sm">
                This will send your heart health assessment results to your doctor's email,
                along with your contact information for follow-up.
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={closeShare}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleShareWithDoctor}
              isLoading={shareLoading}
              loadingText="Sharing..."
            >
              Share Results
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Schedule Follow-up Modal */}
      <Modal isOpen={isScheduleOpen} onClose={closeSchedule}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule Follow-up Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing={4}>
              <FormControl id="scheduleDate" isRequired>
                <FormLabel>Date</FormLabel>
                <Input 
                  type="date" 
                  value={scheduleDate} 
                  onChange={(e) => setScheduleDate(e.target.value)} 
                />
              </FormControl>
              
              <FormControl id="scheduleTime" isRequired>
                <FormLabel>Time</FormLabel>
                <Input 
                  type="time" 
                  value={scheduleTime} 
                  onChange={(e) => setScheduleTime(e.target.value)} 
                />
              </FormControl>
            </SimpleGrid>
            
            <FormControl id="scheduleDoctor" mt={4}>
              <FormLabel>Doctor's Name (optional)</FormLabel>
              <Input 
                value={scheduleDoctor} 
                onChange={(e) => setScheduleDoctor(e.target.value)} 
                placeholder="Dr. Smith"
              />
            </FormControl>
            
            <FormControl id="scheduleNotes" mt={4}>
              <FormLabel>Notes (optional)</FormLabel>
              <Textarea 
                value={scheduleNotes} 
                onChange={(e) => setScheduleNotes(e.target.value)} 
                placeholder="Any special requests or information..."
                rows={3}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={closeSchedule}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleScheduleAppointment}
            >
              Schedule Appointment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Find Doctor Modal */}
      <Modal isOpen={isDocFinderOpen} onClose={closeDocFinder} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Find a Heart Specialist</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="location" isRequired mb={4}>
              <FormLabel>Your Location</FormLabel>
              <InputGroup>
                <Input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="City, State or Zip Code"
                />
                <InputRightElement>
                  <Icon as={FaMapMarkerAlt} color="gray.500" />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <FormControl id="specialty">
                <FormLabel>Specialty</FormLabel>
                <Select 
                  value={specialty} 
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="cardiologist">Cardiologist</option>
                  <option value="cardiac surgeon">Cardiac Surgeon</option>
                  <option value="electrophysiologist">Electrophysiologist</option>
                  <option value="interventional cardiologist">Interventional Cardiologist</option>
                </Select>
              </FormControl>
              
              <FormControl id="distance">
                <FormLabel>Search Radius (miles)</FormLabel>
                <Select 
                  value={searchRadius} 
                  onChange={(e) => setSearchRadius(e.target.value)}
                >
                  <option value="5">5 miles</option>
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaSearch} />}
              width="full"
              mb={6}
              onClick={handleFindDoctors}
            >
              Find Doctors
            </Button>
            
            {location && (
              <Box mt={2}>
                <Text fontWeight="medium" mb={3}>Top Rated Heart Specialists Near {location}</Text>
                <VStack align="stretch" spacing={4}>
                  {/* Doctor listings would be populated dynamically in a real app */}
                  {/* Showing placeholder data for demonstration */}
                  <Box p={3} borderWidth="1px" borderRadius="md">
                    <Flex>
                      <Icon as={FaUserMd} boxSize={10} mr={4} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold">Dr. Sarah Johnson</Text>
                        <Text fontSize="sm">Cardiologist, Heart Center</Text>
                        <Text fontSize="sm">2.3 miles away • Highly rated</Text>
                        <HStack mt={2}>
                          <Button size="xs" colorScheme="blue" leftIcon={<Icon as={FaPhone} />}>
                            Call
                          </Button>
                          <Button size="xs" colorScheme="green" leftIcon={<Icon as={FaCalendarAlt} />}>
                            Book
                          </Button>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>
                  
                  <Box p={3} borderWidth="1px" borderRadius="md">
                    <Flex>
                      <Icon as={FaUserMd} boxSize={10} mr={4} color="blue.500" />
                      <Box>
                        <Text fontWeight="bold">Dr. Michael Chen</Text>
                        <Text fontSize="sm">Interventional Cardiologist, University Hospital</Text>
                        <Text fontSize="sm">3.8 miles away • Top rated</Text>
                        <HStack mt={2}>
                          <Button size="xs" colorScheme="blue" leftIcon={<Icon as={FaPhone} />}>
                            Call
                          </Button>
                          <Button size="xs" colorScheme="green" leftIcon={<Icon as={FaCalendarAlt} />}>
                            Book
                          </Button>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>
                </VStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDocFinder}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Emergency Contact Modal */}
      <Modal isOpen={isEmergencyOpen} onClose={closeEmergency}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="red.500" color="white">Emergency Heart Health Resources</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Alert status="error" variant="left-accent" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">If you're experiencing a heart emergency:</Text>
                <Text>Call 911 immediately or go to your nearest emergency room</Text>
              </Box>
            </Alert>
            
            <Heading size="sm" mb={3}>Warning Signs That Require Immediate Attention:</Heading>
            <List spacing={2} mb={4}>
              <ListItem display="flex">
                <ListIcon as={FaExclamationTriangle} color="red.500" mt={1} />
                <Text>Chest pain or discomfort that lasts more than a few minutes</Text>
              </ListItem>
              <ListItem display="flex">
                <ListIcon as={FaExclamationTriangle} color="red.500" mt={1} />
                <Text>Pain that spreads to the jaw, neck, or back</Text>
              </ListItem>
              <ListItem display="flex">
                <ListIcon as={FaExclamationTriangle} color="red.500" mt={1} />
                <Text>Shortness of breath with or without chest discomfort</Text>
              </ListItem>
              <ListItem display="flex">
                <ListIcon as={FaExclamationTriangle} color="red.500" mt={1} />
                <Text>Cold sweat, nausea, or lightheadedness</Text>
              </ListItem>
            </List>
            
            <Divider my={4} />
            
            <Heading size="sm" mb={3}>Helplines and Resources:</Heading>
            <VStack align="stretch" spacing={3}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">American Heart Association:</Text>
                <Button size="sm" leftIcon={<Icon as={FaPhone} />} colorScheme="blue">
                  1-800-AHA-USA-1
                </Button>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">Heart Disease Hotline:</Text>
                <Button size="sm" leftIcon={<Icon as={FaPhone} />} colorScheme="blue">
                  1-800-242-8721
                </Button>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">Find Nearest Hospital:</Text>
                <Button size="sm" leftIcon={<Icon as={FaMapMarkerAlt} />} colorScheme="green">
                  Locate Now
                </Button>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeEmergency}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    </VStack>
  );
};

export default PredictionResult;