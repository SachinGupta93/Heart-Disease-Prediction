import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Heading, Text, Box, Tabs, TabList, TabPanels, TabPanel, Tab,
  VStack, Flex, Spacer, Icon, useColorModeValue, Button, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  Spinner, useDisclosure, Tooltip, Divider, Alert, AlertIcon
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { 
  FaHeartbeat, FaChartBar, FaChartLine, FaBalanceScale, 
  FaDatabase, FaInfoCircle, FaExclamationTriangle, FaPercentage,
  FaClipboardCheck, FaUserMd, FaRegLightbulb, FaFingerprint
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import ShapExplanation from './ShapExplanation';

const MotionBox = motion(Box);

const ExplainableAi = () => {
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isChartReady, setIsChartReady] = useState(false);
  const tabsRef = useRef(null);
  
  const { currentUser } = useAuth();
  
  // Use semantic tokens for consistent light/dark mode colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  const highlightText = useColorModeValue('blue.800', 'blue.100');
  
  // Sample data for feature importance - more realistic values
  const featureImportanceData = [
    { name: 'Chest Pain Type', value: 0.22, color: '#FF8042' },
    { name: 'Number of Vessels', value: 0.18, color: '#FFBB28' },
    { name: 'Thalassemia', value: 0.16, color: '#00C49F' },
    { name: 'ST Slope', value: 0.12, color: '#0088FE' },
    { name: 'ST Depression', value: 0.10, color: '#8884d8' },
    { name: 'Maximum Heart Rate', value: 0.08, color: '#82ca9d' },
    { name: 'Age', value: 0.05, color: '#ffc658' },
    { name: 'Resting Blood Pressure', value: 0.04, color: '#8dd1e1' },
    { name: 'Cholesterol', value: 0.03, color: '#a4de6c' },
    { name: 'Exercise Angina', value: 0.02, color: '#d0ed57' }
  ];

  // Sample data for model performance - more realistic metrics
  const modelPerformanceData = [
    { name: 'Accuracy', Ensemble: 0.89, 'Random Forest': 0.86, 'Logistic Regression': 0.83 },
    { name: 'Precision', Ensemble: 0.88, 'Random Forest': 0.85, 'Logistic Regression': 0.80 },
    { name: 'Recall', Ensemble: 0.87, 'Random Forest': 0.84, 'Logistic Regression': 0.81 },
    { name: 'F1 Score', Ensemble: 0.88, 'Random Forest': 0.84, 'Logistic Regression': 0.80 },
  ];

  // Sample data for risk thresholds - improved data structure
  const riskThresholdData = [
    { threshold: 0.1, 'False Positives': 0.30, 'False Negatives': 0.03 },
    { threshold: 0.2, 'False Positives': 0.25, 'False Negatives': 0.05 },
    { threshold: 0.3, 'False Positives': 0.20, 'False Negatives': 0.08 },
    { threshold: 0.4, 'False Positives': 0.15, 'False Negatives': 0.12 },
    { threshold: 0.5, 'False Positives': 0.10, 'False Negatives': 0.15 },
    { threshold: 0.6, 'False Positives': 0.08, 'False Negatives': 0.18 },
    { threshold: 0.7, 'False Positives': 0.05, 'False Negatives': 0.22 },
    { threshold: 0.8, 'False Positives': 0.03, 'False Negatives': 0.24 },
    { threshold: 0.9, 'False Positives': 0.01, 'False Negatives': 0.30 }
  ];

  // Sample data for model distribution
  const distributionData = [
    { name: 'Healthy', value: 165, color: '#0088FE' },
    { name: 'Heart Disease', value: 137, color: '#FF8042' }
  ];

  useEffect(() => {
    // Small delay to ensure containers are properly mounted before rendering charts
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 1000); // Increasing timeout to ensure DOM is fully rendered
    
    return () => clearTimeout(timer);
  }, []);

  // Add sample prediction data
  const [predictionData, setPredictionData] = useState({
    inputs: {
      age: 55,
      trestbps: 140, // resting blood pressure
      chol: 220,      // cholesterol
      thalach: 145,   // maximum heart rate
      oldpeak: 1.2,   // ST depression
      exang: 1,       // exercise-induced angina (1 = yes)
      cp: 3,          // chest pain type (0-3)
      // Add other inputs as needed
    },
    prediction: 0.75, // Sample prediction probability
    risk_category: 'High'
  });

  const chartAnimationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  // Helper function to open modal with specific content
  const openExplanationModal = (title, content) => {
    setModalContent({
      title,
      content
    });
    setIsModalOpen(true);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading as="h1" size="xl" mb={4} color="textPrimary">
          <Flex align="center">
            <Icon as={FaRegLightbulb} color="yellow.400" mr={3} />
            AI Explanation Dashboard
          </Flex>
        </Heading>
        <Text mb={8} fontSize="lg" color={textSecondary}>
          Understand how our AI models assess your heart disease risk and what factors matter most for your health.
        </Text>
      </MotionBox>

      <Tabs variant="enclosed" colorScheme="blue" mb={8} ref={tabsRef}>
        <TabList>
          <Tab>
            <Flex align="center">
              <Icon as={FaChartBar} mr={2} />
              <Text>Health Factors</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <Icon as={FaClipboardCheck} mr={2} />
              <Text>Model Performance</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <Icon as={FaPercentage} mr={2} />
              <Text>Risk Thresholds</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <Icon as={FaDatabase} mr={2} />
              <Text>Dataset Overview</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <Icon as={FaFingerprint} mr={2} />
              <Text>SHAP Explanations</Text>
            </Flex>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Feature Importance Panel */}
          <TabPanel>
            <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor} mb={6}>
              <Flex align="center" mb={4}>
                <Icon as={FaChartBar} mr={2} color="blue.500" />
                <Heading size="md" color="textPrimary">Health Factors Importance</Heading>
                <Spacer />
                <Tooltip label="This chart shows which health measurements most strongly influence your heart disease risk prediction">
                  <InfoIcon color="blue.500" />
                </Tooltip>
              </Flex>

              <Text mb={6} color={textSecondary}>
                The chart below shows which health factors have the most influence on heart disease predictions. 
                Longer bars indicate greater importance in the model's decision-making process.
              </Text>
              
              <MotionBox 
                position="relative" 
                height="400px" 
                width="100%" 
                mb={6}
                display="block"
                minHeight="400px"
                overflow="hidden"
                variants={chartAnimationVariants}
                initial="hidden"
                animate={isChartReady ? "visible" : "hidden"}
              >
                {isChartReady && (
                  <ResponsiveContainer width="100%" height={400} minWidth={300} minHeight={300} aspect={1.5}>
                    <BarChart
                      data={featureImportanceData}
                      margin={{ top: 20, right: 30, left: 50, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        tick={{ fontSize: 12, fill: textColor }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Importance', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: textColor }
                        }}
                        tick={{ fill: textColor }}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importance']} 
                        contentStyle={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                          color: textColor
                        }}
                      />
                      <Bar dataKey="value" fill="#8884d8" animationDuration={1500} animationEasing="ease-out">
                        {featureImportanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </MotionBox>
              
              <Button 
                leftIcon={<InfoIcon />} 
                colorScheme="blue"
                variant="outline"
                onClick={() => openExplanationModal(
                  'Understanding Health Factors',
                  `Health factors importance helps explain which measurements most strongly influence your heart disease risk prediction.
                  
                  Our analysis shows that chest pain type, number of major vessels, and thalassemia are the strongest predictors of heart disease risk. These three factors alone account for over 50% of the model's predictive power.
                  
                  This means you should pay particular attention to these areas when discussing your health with your healthcare provider, especially if you have symptoms or abnormal test results related to these factors.
                  
                  While other factors like blood pressure and cholesterol still matter, their impact on the prediction is relatively smaller compared to the top factors.`
                )}
              >
                Learn More About Health Factors
              </Button>
            </Box>

            <Box p={6} bg={highlightBg} borderRadius="lg" borderLeft="4px solid" borderColor="blue.500" mb={6}>
              <Flex align="center" mb={3}>
                <Icon as={FaUserMd} mr={2} color="blue.500" />
                <Heading size="sm" color={highlightText}>What This Means For You</Heading>
              </Flex>
              <Text color={highlightText}>
                The most important health factors shown above have the biggest impact on your heart disease risk. 
                Focus on discussing these specific areas with your doctor, especially if you have concerns about 
                chest pain, previous heart tests, or family history of heart problems.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">Top 3 Risk Factors Explained</Heading>
                <VStack align="start" spacing={4}>
                  <Box>
                    <Flex align="center">
                      <Box w={3} h={3} borderRadius="full" bg={featureImportanceData[0].color} mr={2} />
                      <Text fontWeight="bold" color="textPrimary">Chest Pain Type</Text>
                    </Flex>
                    <Text fontSize="sm" color={textSecondary} mt={1}>
                      Different types of chest pain indicate different levels of heart disease risk. 
                      Typical angina (chest pain) is strongly associated with heart problems.
                    </Text>
                  </Box>

                  <Box>
                    <Flex align="center">
                      <Box w={3} h={3} borderRadius="full" bg={featureImportanceData[1].color} mr={2} />
                      <Text fontWeight="bold" color="textPrimary">Number of Vessels</Text>
                    </Flex>
                    <Text fontSize="sm" color={textSecondary} mt={1}>
                      This refers to the number of major blood vessels that show reduced blood flow in medical imaging.
                      More affected vessels indicate higher risk.
                    </Text>
                  </Box>

                  <Box>
                    <Flex align="center">
                      <Box w={3} h={3} borderRadius="full" bg={featureImportanceData[2].color} mr={2} />
                      <Text fontWeight="bold" color="textPrimary">Thalassemia</Text>
                    </Flex>
                    <Text fontSize="sm" color={textSecondary} mt={1}>
                      A blood disorder affecting oxygen transport. Certain types of thalassemia are 
                      associated with increased heart disease risk.
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">How AI Uses Your Health Data</Heading>
                <Text fontSize="sm" color={textSecondary} mb={4}>
                  Our AI model analyzes multiple aspects of your health to assess heart disease risk:
                </Text>
                <VStack align="start" spacing={3}>
                  <Flex>
                    <Icon as={FaChartLine} color="green.500" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Pattern Recognition:</Text> Identifies 
                      patterns in your health data similar to known heart disease cases
                    </Text>
                  </Flex>
                  <Flex>
                    <Icon as={FaBalanceScale} color="purple.500" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Weighted Analysis:</Text> Gives appropriate 
                      importance to each health factor based on medical research
                    </Text>
                  </Flex>
                  <Flex>
                    <Icon as={FaHeartbeat} color="red.500" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Risk Calculation:</Text> Combines all factors 
                      to estimate your probability of heart disease
                    </Text>
                  </Flex>
                </VStack>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* Model Performance Panel */}
          <TabPanel>
            <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor} mb={6}>
              <Flex align="center" mb={4}>
                <Icon as={FaClipboardCheck} mr={2} color="blue.500" />
                <Heading size="md" color="textPrimary">Model Performance</Heading>
                <Spacer />
                <Tooltip label="This chart shows how accurate our AI models are at predicting heart disease">
                  <InfoIcon color="blue.500" />
                </Tooltip>
              </Flex>
              
              <Text mb={6} color={textSecondary}>
                This chart compares the performance of different AI models used in heart disease prediction.
                Higher values indicate better performance on each metric.
              </Text>
              
              <MotionBox 
                position="relative" 
                height="400px" 
                width="100%" 
                mb={6}
                display="block"
                minHeight="400px"
                overflow="hidden"
                variants={chartAnimationVariants}
                initial="hidden"
                animate={isChartReady ? "visible" : "hidden"}
              >
                {isChartReady && (
                  <ResponsiveContainer width="100%" height={400} minWidth={300} minHeight={300} aspect={1.5}>
                    <BarChart
                      data={modelPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                      <XAxis dataKey="name" tick={{ fill: textColor }} />
                      <YAxis 
                        domain={[0.7, 0.9]} 
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        tick={{ fill: textColor }}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${(value * 100).toFixed(1)}%`, '']}
                        contentStyle={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                          color: textColor
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
                      <Bar dataKey="Ensemble" fill="#8884d8" name="Ensemble Model" animationDuration={1500} animationEasing="ease-out" />
                      <Bar dataKey="Random Forest" fill="#82ca9d" name="Random Forest" animationDuration={1500} animationEasing="ease-out" />
                      <Bar dataKey="Logistic Regression" fill="#ffc658" name="Logistic Regression" animationDuration={1500} animationEasing="ease-out" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </MotionBox>
              
              <Button 
                leftIcon={<InfoIcon />} 
                colorScheme="blue"
                variant="outline"
                onClick={() => openExplanationModal(
                  'Understanding Model Performance',
                  `These performance metrics show how accurate our AI models are at predicting heart disease:
                  
                  - Accuracy: The percentage of all predictions that are correct
                  - Precision: When the model predicts heart disease, how often it is correct
                  - Recall: How many actual heart disease cases the model correctly identifies
                  - F1 Score: A balance between precision and recall
                  
                  Our ensemble model combines the strengths of multiple algorithms to achieve higher overall performance. This means you're getting more reliable predictions than from any single model.`
                )}
              >
                Learn More About Model Performance
              </Button>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">Performance Metrics Explained</Heading>
                <VStack align="start" spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="textPrimary">Accuracy (89%)</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Out of all predictions made, 89% are correct. This includes both correctly identifying people with heart disease and correctly identifying healthy people.
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="textPrimary">Precision (88%)</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      When our model predicts someone has heart disease, it's right 88% of the time. This means the false alarm rate is only 12%.
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="textPrimary">Recall (87%)</Text>
                    <Text fontSize="sm" color={textSecondary}>
                      Our model correctly identifies 87% of all actual heart disease cases. This means it misses about 13% of cases.
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">Why We Use Multiple Models</Heading>
                <Text fontSize="sm" color={textSecondary} mb={4}>
                  We combine several AI models to provide you with the most reliable prediction:
                </Text>
                <VStack align="start" spacing={3}>
                  <Flex>
                    <Box w={3} h={3} borderRadius="full" bg="#8884d8" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Ensemble Model:</Text> Combines the strengths of all models for balanced predictions
                    </Text>
                  </Flex>
                  <Flex>
                    <Box w={3} h={3} borderRadius="full" bg="#82ca9d" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Random Forest:</Text> Excels at handling complex health data and interactions between factors
                    </Text>
                  </Flex>
                  <Flex>
                    <Box w={3} h={3} borderRadius="full" bg="#ffc658" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Logistic Regression:</Text> Provides transparent and interpretable predictions
                    </Text>
                  </Flex>
                </VStack>
                <Divider my={4} borderColor={borderColor} />
                <Alert status="info" variant="left-accent" mt={2}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    Our models are regularly tested and updated to maintain accuracy. Your prediction uses our latest models.
                  </Text>
                </Alert>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* Risk Thresholds Panel */}
          <TabPanel>
            <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor} mb={6}>
              <Flex align="center" mb={4}>
                <Icon as={FaPercentage} mr={2} color="blue.500" />
                <Heading size="md" color="textPrimary">
                  Risk Threshold Analysis
                </Heading>
                <Spacer />
                <Tooltip label="How we determine when to classify someone as high-risk">
                  <InfoIcon color="blue.500" />
                </Tooltip>
              </Flex>
              <Text mb={6} color={textSecondary}>
                We use a probability threshold of 0.5 (50%) to determine risk categories. This chart shows how different thresholds 
                would affect false positive and false negative rates.
              </Text>
              
              <MotionBox 
                position="relative" 
                height="400px" 
                width="100%" 
                mb={6}
                display="block"
                minHeight="400px"
                overflow="hidden"
                variants={chartAnimationVariants}
                initial="hidden"
                animate={isChartReady ? "visible" : "hidden"}
              >
                {isChartReady && (
                  <ResponsiveContainer width="100%" height={400} minWidth={300} minHeight={300} aspect={1.5}>
                    <LineChart
                      data={riskThresholdData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                      <XAxis 
                        dataKey="threshold" 
                        label={{ 
                          value: 'Risk Threshold', 
                          position: 'insideBottom', 
                          offset: -5,
                          style: { fill: textColor }
                        }}
                        tick={{ fill: textColor }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Error Rate', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: textColor }
                        }}
                        tick={{ fill: textColor }}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${(value * 100).toFixed(0)}%`, '']}
                        contentStyle={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                          color: textColor
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
                      <Line 
                        type="monotone" 
                        dataKey="False Positives" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="False Alarms"
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="False Negatives" 
                        stroke="#ff8042" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="Missed Cases"
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </MotionBox>
              
              <Button 
                leftIcon={<InfoIcon />} 
                colorScheme="blue"
                variant="outline"
                onClick={() => openExplanationModal(
                  'Understanding Risk Thresholds',
                  `Every prediction comes with a probability score between 0 and 1. We need to decide at what probability to consider someone "at risk."
                  
                  - A lower threshold (e.g., 0.3) catches more actual cases (fewer false negatives) but also generates more false alarms (more false positives)
                  - A higher threshold (e.g., 0.7) reduces false alarms but might miss some actual cases
                  
                  We've chosen a balanced threshold that minimizes both types of errors, but your doctor may interpret your specific probability differently based on your overall health context.`
                )}
              >
                Learn More About Risk Thresholds
              </Button>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">What Are Risk Thresholds?</Heading>
                <Text fontSize="sm" color={textSecondary} mb={4}>
                  Risk thresholds help convert probability scores into actionable risk categories:
                </Text>
                <VStack align="start" spacing={4} px={2}>
                  <Flex width="100%">
                    <Box bg="green.500" height="24px" width="30%" borderLeftRadius="md" />
                    <Box bg="orange.500" height="24px" width="30%" />
                    <Box bg="red.500" height="24px" width="40%" borderRightRadius="md" />
                  </Flex>
                  <SimpleGrid columns={3} width="100%" textAlign="center">
                    <Box>
                      <Text fontWeight="bold" color="green.500">Low Risk</Text>
                      <Text fontSize="xs" color={textSecondary}>0-30%</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="orange.500">Moderate Risk</Text>
                      <Text fontSize="xs" color={textSecondary}>30-60%</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="red.500">High Risk</Text>
                      <Text fontSize="xs" color={textSecondary}>60-100%</Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
                <Divider my={4} borderColor={borderColor} />
                <Text fontSize="sm" color={textSecondary}>
                  Your exact probability score is more informative than just the risk category. 
                  A score of 31% and 59% are both "moderate risk" but represent different situations.
                </Text>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">Understanding Prediction Errors</Heading>
                <VStack align="start" spacing={4}>
                  <Box>
                    <Flex align="center">
                      <Box w={3} h={3} borderRadius="full" bg="#8884d8" mr={2} />
                      <Text fontWeight="bold" color="textPrimary">False Positive (False Alarm)</Text>
                    </Flex>
                    <Text fontSize="sm" color={textSecondary} mt={1}>
                      When our model predicts heart disease but the person is actually healthy. 
                      This might lead to unnecessary worry or additional tests.
                    </Text>
                  </Box>
                  <Box>
                    <Flex align="center">
                      <Box w={3} h={3} borderRadius="full" bg="#ff8042" mr={2} />
                      <Text fontWeight="bold" color="textPrimary">False Negative (Missed Case)</Text>
                    </Flex>
                    <Text fontSize="sm" color={textSecondary} mt={1}>
                      When our model predicts someone is healthy, but they actually have heart disease. 
                      This could mean missing an opportunity for early intervention.
                    </Text>
                  </Box>
                </VStack>
                <Divider my={4} borderColor={borderColor} />
                <Alert status="warning" variant="left-accent">
                  <AlertIcon />
                  <Text fontSize="sm">
                    No prediction is 100% accurate. Always consult healthcare professionals for proper diagnosis.
                  </Text>
                </Alert>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* Dataset Overview Panel */}
          <TabPanel>
            <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor} mb={6}>
              <Flex align="center" mb={4}>
                <Icon as={FaDatabase} mr={2} color="blue.500" />
                <Heading size="md" color="textPrimary">
                  Dataset Overview
                </Heading>
                <Spacer />
                <Tooltip label="Information about the data used to train our AI models">
                  <InfoIcon color="blue.500" />
                </Tooltip>
              </Flex>
              <Text mb={6} color={textSecondary}>
                Our model was trained on the Cleveland Heart Disease dataset, containing data from 303 patients.
                The chart below shows the distribution of heart disease cases in the training data.
              </Text>
              
              <MotionBox 
                position="relative" 
                height="400px" 
                width="100%" 
                mb={6}
                display="block"
                minHeight="400px"
                overflow="hidden"
                variants={chartAnimationVariants}
                initial="hidden"
                animate={isChartReady ? "visible" : "hidden"}
              >
                {isChartReady && (
                  <ResponsiveContainer width="100%" height={400} minWidth={300} minHeight={300} aspect={1.5}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [value, 'Patients']}
                        contentStyle={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                          color: textColor
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </MotionBox>
              
              <Button 
                leftIcon={<InfoIcon />} 
                colorScheme="blue"
                variant="outline"
                onClick={() => openExplanationModal(
                  'About Our Training Data',
                  `Our AI model is trained using data from real patients with known heart disease status. This dataset includes:
                  
                  - 303 patients from the Cleveland Clinic
                  - Ages ranging from 29 to 77 years old
                  - Both men and women
                  - People with and without heart disease
                  
                  Having a balanced dataset with both positive and negative examples helps our model learn to distinguish between people with and without heart disease.
                  
                  While the training data is diverse, the model performs best on populations similar to those in the training set. Your doctor can help interpret results in the context of your specific background and health history.`
                )}
              >
                Learn More About Our Data
              </Button>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">Training Data Demographics</Heading>
                <VStack align="start" spacing={4}>
                  <SimpleGrid columns={2} width="100%">
                    <Box>
                      <Text fontWeight="bold" color="textPrimary">Age Range</Text>
                      <Text fontSize="sm" color={textSecondary}>29-77 years</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="textPrimary">Gender Distribution</Text>
                      <Text fontSize="sm" color={textSecondary}>68% Male, 32% Female</Text>
                    </Box>
                    <Box mt={4}>
                      <Text fontWeight="bold" color="textPrimary">Total Samples</Text>
                      <Text fontSize="sm" color={textSecondary}>303 patients</Text>
                    </Box>
                    <Box mt={4}>
                      <Text fontWeight="bold" color="textPrimary">Source</Text>
                      <Text fontSize="sm" color={textSecondary}>Cleveland Clinic</Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
                <Divider my={4} borderColor={borderColor} />
                <Text fontSize="sm" color={textSecondary}>
                  The dataset includes a wide range of health measurements including blood pressure,
                  cholesterol levels, ECG results, and exercise test information.
                </Text>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg={bgColor}>
                <Heading size="sm" mb={3} color="textPrimary">How AI Learns From Data</Heading>
                <Text fontSize="sm" color={textSecondary} mb={4}>
                  Our AI model learns to recognize patterns in patient data that are associated with heart disease:
                </Text>
                <VStack align="start" spacing={3}>
                  <Flex>
                    <Icon as={FaChartLine} color="purple.500" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Pattern Discovery:</Text> The AI identifies patterns in the data that humans might miss
                    </Text>
                  </Flex>
                  <Flex>
                    <Icon as={FaExclamationTriangle} color="orange.500" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Risk Factor Identification:</Text> The model determines which health factors most strongly predict heart disease
                    </Text>
                  </Flex>
                  <Flex>
                    <Icon as={FaInfoCircle} color="blue.500" mt={1} mr={2} />
                    <Text fontSize="sm" color={textSecondary}>
                      <Text as="span" fontWeight="bold" color="textPrimary">Testing & Validation:</Text> The model is rigorously tested to ensure it makes accurate predictions
                    </Text>
                  </Flex>
                </VStack>
                <Divider my={4} borderColor={borderColor} />
                <Alert status="info" variant="left-accent">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Our model is continually improved as more data becomes available, ensuring predictions remain accurate and up-to-date.
                  </Text>
                </Alert>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* SHAP Explanations Panel */}
          <TabPanel>
            <ShapExplanation predictionData={predictionData} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Explanation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader color="textPrimary">
            <Flex align="center">
              <InfoIcon mr={2} color="blue.500" />
              {modalContent.title}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text whiteSpace="pre-line" color={textSecondary}>{modalContent.content}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ExplainableAi;