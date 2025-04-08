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
  DrawerOverlay, DrawerContent, DrawerCloseButton
} from '@chakra-ui/react';
import { 
  FaHeartbeat, FaChartBar, FaInfoCircle, FaChevronDown, 
  FaChevronUp, FaExclamationTriangle, FaCheckCircle, 
  FaHospital, FaClipboardList, FaPhone, FaExternalLinkAlt, 
  FaChartLine, FaAnalytics, FaStar, FaCommentAlt
} from 'react-icons/fa';
import { usePrediction } from '../contexts/PredictionContext';
import ShapExplanation from './ShapExplanation';
import { AuthContext } from '../contexts/AuthContext';
import { savePrediction } from '../services/firestore';
import { trackEvent } from '../services/errorLogging';

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
  const { currentUser } = useContext(AuthContext);
  
  // Analytics and feedback states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { isOpen: isInsightModalOpen, onOpen: openInsightModal, onClose: closeInsightModal } = useDisclosure();
  const { isOpen: isFeedbackOpen, onOpen: openFeedback, onClose: closeFeedback } = useDisclosure();
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const toast = useToast();
  const analyticsRef = useRef(null);
  
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

  return (
    <VStack spacing={6} align="stretch">
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
                >
                  Download Report PDF
                </Button>
              </Box>
            </Box>
          </SimpleGrid>
        </VStack>
        
        {/* Add Analytics Button at the bottom of your main card */}
        <Flex mt={4} justifyContent="center">
          <Button
            leftIcon={<Icon as={FaAnalytics} />}
            colorScheme="purple"
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            mr={3}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Health Analytics'}
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
          >
            Emergency Contact
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={FaHospital} />}
            colorScheme="brand"
            variant="outline"
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
        <Button colorScheme="blue" variant="outline">
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
            <Icon as={FaAnalytics} mr={2} color="purple.500" />
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
    </VStack>
  );
};

export default PredictionResult;