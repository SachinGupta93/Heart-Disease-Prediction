import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, 
  Heading, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon,
  AlertTitle,
  SimpleGrid, 
  VStack, 
  HStack, 
  Flex, 
  Badge, 
  Button,
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Stat, 
  StatLabel, 
  StatNumber,
  useToast, 
  useColorModeValue, 
  Container, 
  Divider,
  Tooltip as ChakraTooltip, 
  IconButton, 
  Link,
  Spacer
} from '@chakra-ui/react';
import { InfoIcon, RepeatIcon, ExternalLinkIcon, QuestionIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import {
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar, 
  Legend, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Cell, 
  Tooltip,
} from 'recharts';
import { usePrediction } from '../contexts/PredictionContext';
import { getModelComparison, getModelComparisonPrediction } from '../services/api.js';

const MotionBox = motion(Box);

// Standardized colors for all models
const MODEL_COLORS = {
  ensemble: '#3182CE',        // Blue
  neural_network: '#E53E3E',  // Red
  random_forest: '#38A169',   // Green
  logistic_regression: '#DD6B20', // Orange
  svm: '#805AD5'              // Purple
};

// Standard model order for consistent display
const MODEL_DISPLAY_ORDER = ['ensemble', 'neural_network', 'random_forest', 'logistic_regression', 'svm'];

const ModelComparison = () => {
  // State variables
  const [modelMetrics, setModelMetrics] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState(null);
  const [modelResults, setModelResults] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Get values from context
  const { predictionData } = usePrediction();
  
  // UI theme values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const toast = useToast();

  // Model information with improved descriptions
  const models = [
    {
      id: 'ensemble',
      name: 'Ensemble Model',
      description: 'Combines predictions from multiple models for improved accuracy and robustness.',
      color: MODEL_COLORS.ensemble,
      longDescription: 'Ensemble methods combine multiple machine learning models to produce better predictive performance than could be obtained from any of the constituent models alone. For heart disease prediction, this approach minimizes the weaknesses of individual models.'
    },
    {
      id: 'neural_network',
      name: 'Neural Network',
      description: 'Deep learning model that mimics human brain structure to identify complex patterns.',
      color: MODEL_COLORS.neural_network,
      longDescription: 'Neural Networks use interconnected layers of artificial neurons to process data. They excel at identifying complex, non-linear patterns in medical data that simpler models might miss.'
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      description: 'Builds multiple decision trees and merges their predictions for better accuracy.',
      color: MODEL_COLORS.random_forest,
      longDescription: 'Random Forest creates multiple decision trees during training and outputs the class that is the mode of the classes output by individual trees. This algorithm handles complex medical data well and is less prone to overfitting.'
    },
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      description: 'Simple but interpretable model that estimates probabilities for binary classification.',
      color: MODEL_COLORS.logistic_regression,
      longDescription: 'Logistic Regression estimates the probability of a binary outcome using a logistic function. In heart disease prediction, it models the relationship between patient features and the probability of disease presence.'
    },
    {
      id: 'svm',
      name: 'Support Vector Machine',
      description: 'Finds the hyperplane that best separates patients with and without heart disease.',
      color: MODEL_COLORS.svm,
      longDescription: 'Support Vector Machine (SVM) works by finding the hyperplane that maximizes the margin between heart disease classes. SVMs handle complex, non-linear relationships within healthcare data using specialized kernel functions.'
    }
  ];

  // Load model metrics on component mount
  useEffect(() => {
    const loadModelMetrics = async () => {
      try {
        setLoadingMetrics(true);
        
        try {
          const response = await getModelComparison();
          
          // Handle HTML response error
          if (typeof response === 'string' && response.includes('<!doctype')) {
            throw new Error('API returned HTML instead of JSON');
          }
          
          // Comprehensive fallback metrics with all 5 models
          const fallbackMetrics = {
            ensemble: { accuracy: 0.89, precision: 0.90, recall: 0.88, f1: 0.89, roc_auc: 0.92 },
            neural_network: { accuracy: 0.88, precision: 0.87, recall: 0.89, f1: 0.88, roc_auc: 0.91 },
            random_forest: { accuracy: 0.87, precision: 0.88, recall: 0.85, f1: 0.86, roc_auc: 0.90 },
            logistic_regression: { accuracy: 0.83, precision: 0.84, recall: 0.82, f1: 0.83, roc_auc: 0.86 },
            svm: { accuracy: 0.85, precision: 0.86, recall: 0.83, f1: 0.84, roc_auc: 0.88 }
          };
          
          // If valid response, try to extract metrics
          if (response && typeof response === 'object' && response.success) {
            console.log('API response:', response);
            
            // Try to extract model metrics from the response
            let foundMetrics = {};
            
            // Handle nested data structure
            const dataObj = response.data?.data || response.data;
            
            if (dataObj?.models && Array.isArray(dataObj.models)) {
              dataObj.models.forEach(model => {
                if (model && model.id) {
                  foundMetrics[model.id] = {
                    accuracy: getNumericValue(model, ['accuracy']),
                    precision: getNumericValue(model, ['precision']),
                    recall: getNumericValue(model, ['recall']),
                    f1: getNumericValue(model, ['f1', 'f1_score']),
                    roc_auc: getNumericValue(model, ['roc_auc', 'auc'])
                  };
                }
              });
            }
            
            if (Object.keys(foundMetrics).length > 0) {
              console.log('Found metrics in API response:', foundMetrics);
              setModelMetrics(foundMetrics);
            } else {
              // Use fallback if no metrics were found
              console.log('No metrics found in response, using fallbacks');
              setModelMetrics(fallbackMetrics);
              setMetricsError('Using demo metrics data for visualization');
            }
          } else {
            // Use fallback if response is invalid
            console.log('Invalid API response, using fallback metrics');
            setModelMetrics(fallbackMetrics);
            setMetricsError('Using demo metrics data for visualization');
          }
        } catch (error) {
          console.error('API error:', error);
          
          // Use comprehensive fallback metrics
          const fallbackMetrics = {
            ensemble: { accuracy: 0.89, precision: 0.90, recall: 0.88, f1: 0.89, roc_auc: 0.92 },
            neural_network: { accuracy: 0.88, precision: 0.87, recall: 0.89, f1: 0.88, roc_auc: 0.91 },
            random_forest: { accuracy: 0.87, precision: 0.88, recall: 0.85, f1: 0.86, roc_auc: 0.90 },
            logistic_regression: { accuracy: 0.83, precision: 0.84, recall: 0.82, f1: 0.83, roc_auc: 0.86 },
            svm: { accuracy: 0.85, precision: 0.86, recall: 0.83, f1: 0.84, roc_auc: 0.88 }
          };
          
          setModelMetrics(fallbackMetrics);
          setMetricsError('Using demo metrics data for visualization');
        }
      } finally {
        setLoadingMetrics(false);
      }
    };
    
    loadModelMetrics();
  }, []);

  // Set chart ready state after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Run model comparison with all models
  const runComparison = async () => {
    try {
      setLocalLoading(true);
      
      // Use prediction data from context or create fallback data
      const inputData = predictionData?.inputs || {
        age: 55,
        sex: 1,
        cp: 2,
        trestbps: 140,
        chol: 230,
        fbs: 0,
        restecg: 0,
        thalach: 150,
        exang: 0,
        oldpeak: 1.5,
        slope: 1,
        ca: 1,
        thal: 2
      };
      
      // Show toast when using fallback data
      if (!predictionData?.inputs) {
        toast({
          title: 'Using sample data',
          description: 'We\'re using sample patient data for this comparison',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Call API to get model comparison predictions
      try {
        const response = await getModelComparisonPrediction(inputData);
        
        if (response && response.success) {
          // Format data for our component
          const formattedResults = {};
          
          // Process each model's data
          Object.entries(response.data).forEach(([modelId, modelData]) => {
            // Skip non-model entries
            if (modelId === 'is_fallback' || modelId === 'majority_vote' || !modelData) return;
            
            // Find the model info to get color
            const modelInfo = models.find(m => m.id === modelId);
            
            if (modelInfo) {
              formattedResults[modelId] = {
                model_name: modelData.model_name || modelInfo.name,
                model_id: modelId,
                prediction: modelData.prediction,
                probability: modelData.probability,
                probability_percent: modelData.probability_percent || (modelData.probability * 100).toFixed(1),
                color: modelData.color || modelInfo.color,
                risk_level: modelData.risk_level,
                message: modelData.message,
                specialties: modelData.specialties || getModelSpecialty(modelId)
              };
            }
          });
          
          // Set the model results
          setModelResults(formattedResults);
          
          // Show a warning if using fallback
          if (response.is_fallback) {
            toast({
              title: 'Using estimated predictions',
              description: 'Server did not respond. Using client-side estimates instead.',
              status: 'warning',
              duration: 4000,
              isClosable: true,
            });
          }
        } else {
          // Handle API error
          toast({
            title: 'Error',
            description: response?.error || 'Could not get model predictions',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          
          // Use fallback demo data
          useFallbackDemoData();
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        toast({
          title: 'Error',
          description: 'Could not compare models. Using demo data.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        
        // Use fallback demo data
        useFallbackDemoData();
      }
      
      setLocalLoading(false);
    } catch (error) {
      console.error('Error running model comparison:', error);
      toast({
        title: 'Error',
        description: 'Could not run model comparison',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLocalLoading(false);
    }
  };
  
  // Helper function to get model specialty based on ID
  const getModelSpecialty = (modelId) => {
    switch(modelId) {
      case 'ensemble':
        return 'Combines multiple models for improved reliability and accuracy';
      case 'neural_network':
        return 'Identifies complex patterns in medical data through deep learning';
      case 'random_forest':
        return 'Handles complex feature interactions and non-linear patterns';
      case 'logistic_regression':
        return 'Clear feature importance and good with linearly separable data';
      case 'svm':
        return 'Handles high-dimensional data with complex boundaries';
      default:
        return '';
    }
  };
  
  // Fallback function to use demo data if API fails
  const useFallbackDemoData = () => {
    // Create comprehensive sample model results with all 5 models
    const demoResults = {
      ensemble: {
        model_name: 'Ensemble Model',
        model_id: 'ensemble',
        prediction: 1,
        probability: 0.78,
        probability_percent: '78.0',
        color: MODEL_COLORS.ensemble,
        risk_level: 'High Risk',
        message: 'High risk of heart disease detected. Consultation recommended.',
        specialties: 'Combines multiple models for improved reliability and accuracy'
      },
      neural_network: {
        model_name: 'Neural Network',
        model_id: 'neural_network',
        prediction: 1,
        probability: 0.81,
        probability_percent: '81.0',
        color: MODEL_COLORS.neural_network,
        risk_level: 'High Risk',
        message: 'High risk of heart disease detected. Immediate consultation recommended.',
        specialties: 'Identifies complex patterns in medical data through deep learning'
      },
      random_forest: {
        model_name: 'Random Forest',
        model_id: 'random_forest',
        prediction: 1,
        probability: 0.75,
        probability_percent: '75.0',
        color: MODEL_COLORS.random_forest,
        risk_level: 'High Risk',
        message: 'High risk of heart disease detected. Consultation recommended.',
        specialties: 'Handles complex feature interactions and non-linear patterns'
      },
      logistic_regression: {
        model_name: 'Logistic Regression',
        model_id: 'logistic_regression',
        prediction: 1,
        probability: 0.68,
        probability_percent: '68.0',
        color: MODEL_COLORS.logistic_regression,
        risk_level: 'Moderate Risk',
        message: 'Moderate risk of heart disease detected. Consider lifestyle changes.',
        specialties: 'Clear feature importance and good with linearly separable data'
      },
      svm: {
        model_name: 'Support Vector Machine',
        model_id: 'svm',
        prediction: 0,
        probability: 0.42,
        probability_percent: '42.0',
        color: MODEL_COLORS.svm,
        risk_level: 'Moderate Risk',
        message: 'Moderate risk of heart disease detected. Consider lifestyle changes.',
        specialties: 'Handles high-dimensional data with complex boundaries'
      }
    };
    
    // Set the model results
    setModelResults(demoResults);
  };

  // Format metrics data for radar chart
  const metricsData = useMemo(() => {
    if (!modelMetrics) return [];
    
    // Create a metrics array with proper names
    const metrics = [
      { key: 'accuracy', name: 'Accuracy' },
      { key: 'precision', name: 'Precision' },
      { key: 'recall', name: 'Recall' },
      { key: 'f1', name: 'F1 Score' },
      { key: 'roc_auc', name: 'ROC AUC' }
    ];
    
    return metrics.map(({ key, name }) => {
      const dataPoint = { metric: name };
      
      // Add each model's metrics
      models.forEach(model => {
        if (modelMetrics[model.id] && 
            typeof modelMetrics[model.id][key] === 'number' && 
            !isNaN(modelMetrics[model.id][key])) {
          dataPoint[model.id] = modelMetrics[model.id][key];
        } else {
          dataPoint[model.id] = 0;
        }
      });
      
      return dataPoint;
    });
  }, [modelMetrics, models]);

  // Format results data for bar chart with consistent order
  const resultsData = useMemo(() => {
    if (!modelResults || typeof modelResults !== 'object') {
      return [];
    }
    
    // Convert to array and sort based on defined order
    return Object.values(modelResults)
      .sort((a, b) => {
        const indexA = MODEL_DISPLAY_ORDER.indexOf(a.model_id);
        const indexB = MODEL_DISPLAY_ORDER.indexOf(b.model_id);
        return indexA - indexB;
      })
      .map(result => ({
        model: result.model_name || 'Unknown',
        model_id: result.model_id,
        probability: result.probability_percent 
          ? parseFloat(result.probability_percent) 
          : (result.probability ? parseFloat(result.probability) * 100 : 0),
        color: result.color || 
          models.find(m => m.id === result.model_id)?.color || 
          '#cccccc',
        prediction: typeof result.prediction === 'number' ? result.prediction : 0
      }));
  }, [modelResults, models]);

  // Generate consensus analysis
  const consensusAnalysis = useMemo(() => {
    if (!modelResults || Object.keys(modelResults).length === 0) {
      return null;
    }
    
    try {
      const predictions = Object.values(modelResults)
        .map(r => typeof r.prediction === 'number' ? r.prediction : null)
        .filter(p => p !== null);
      
      const probabilities = Object.values(modelResults)
        .map(r => {
          if (r.probability_percent && !isNaN(parseFloat(r.probability_percent))) {
            return parseFloat(r.probability_percent);
          } else if (r.probability && !isNaN(parseFloat(r.probability))) {
            return parseFloat(r.probability) * 100;
          }
          return null;
        })
        .filter(p => p !== null);
      
      if (predictions.length === 0 || probabilities.length === 0) {
        return null;
      }
      
      const positiveCount = predictions.filter(p => p === 1).length;
      const negativeCount = predictions.filter(p => p === 0).length;
      const avgProbability = (probabilities.reduce((a, b) => a + b, 0) / probabilities.length).toFixed(1);
      
      let consensusLevel = 'No consensus';
      let consensusColor = 'gray';
      
      if (positiveCount === predictions.length) {
        consensusLevel = 'Strong consensus (High Risk)';
        consensusColor = 'red';
      } else if (negativeCount === predictions.length) {
        consensusLevel = 'Strong consensus (Low Risk)';
        consensusColor = 'green';
      } else if (positiveCount > negativeCount * 2) {
        consensusLevel = 'Weak consensus (Higher Risk)';
        consensusColor = 'orange';
      } else if (negativeCount > positiveCount * 2) {
        consensusLevel = 'Weak consensus (Lower Risk)';
        consensusColor = 'teal';
      } else {
        consensusLevel = 'Mixed predictions';
        consensusColor = 'gray';
      }
      
      const ensemblePrediction = modelResults.ensemble?.prediction;
      const disagreeingModels = Object.values(modelResults)
        .filter(r => r.prediction !== ensemblePrediction && r.model_name !== 'Ensemble Model')
        .map(r => r.model_name);
      
      return {
        consensusLevel,
        consensusColor,
        avgProbability,
        positiveCount,
        totalModels: predictions.length,
        disagreeingModels
      };
    } catch (error) {
      console.error('Error in consensus analysis:', error);
      return null;
    }
  }, [modelResults]);

  return (
    <Container maxW="container.xl" py={6}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
      >
        <Heading size="xl" mb={2}>Model Comparison</Heading>
        <Text fontSize="lg" color={textColor}>
          Compare how different machine learning models assess heart disease risk.
          <ChakraTooltip label="Each model uses different techniques to predict heart disease risk, providing multiple perspectives on your health data">
            <IconButton
              icon={<InfoIcon />}
              variant="ghost"
              size="sm"
              aria-label="Information"
              ml={2}
            />
          </ChakraTooltip>
        </Text>
      </MotionBox>

      <Flex justify="center" mb={8}>
        <Button
          leftIcon={<RepeatIcon />}
          colorScheme="blue"
          size="lg"
          onClick={runComparison}
          isLoading={localLoading}
          loadingText="Running comparison"
          boxShadow="md"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          Run Model Comparison
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Model Predictions Section */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box borderWidth="1px" borderRadius="lg" p={6} bg={cardBg} boxShadow="sm">
            <Heading size="md" mb={4} display="flex" alignItems="center">
              <Box mr={2} bg="blue.500" w={1} h={6}></Box>
              Risk Predictions by Model
            </Heading>
            
            {localLoading ? (
              <Box textAlign="center" my={10}>
                <Spinner size="xl" thickness="4px" color="blue.500" />
                <Text mt={4} fontSize="lg">Comparing models...</Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  This may take a few moments
                </Text>
              </Box>
            ) : resultsData.length > 0 ? (
              <VStack spacing={6} align="stretch">
                {/* Bar Chart of Results */}
                <Box 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  borderColor={borderColor}
                  bg={cardBg} 
                  h="300px"
                  boxShadow="sm"
                >
                  {isChartReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={resultsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                        <XAxis 
                          dataKey="model" 
                          angle={-30} 
                          textAnchor="end" 
                          height={80} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          label={{ value: 'Risk Probability (%)', angle: -90, position: 'insideLeft', style: { fill: textColor } }} 
                          domain={[0, 100]} 
                          tick={{ fill: textColor }}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [`${value.toFixed(1)}%`, 'Risk Probability'];
                          }} 
                          contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                        />
                        <Bar 
                          dataKey="probability" 
                          name="Risk Probability"
                          radius={[4, 4, 0, 0]}
                        >
                          {resultsData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke={entry.color}
                              strokeWidth={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
                
                {/* Table of Results */}
                <Box overflowX="auto" borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Model</Th>
                        <Th>Prediction</Th>
                        <Th isNumeric>Probability</Th>
                        <Th>Risk Level</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {resultsData.map((result, index) => (
                        <Tr key={index} bg={result.model.includes('Ensemble') ? highlightBg : 'inherit'}>
                          <Td>
                            <HStack>
                              <Box w="3" h="3" borderRadius="full" bg={result.color} />
                              <Text fontWeight={result.model.includes('Ensemble') ? 'bold' : 'normal'}>
                                {result.model}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            {result.prediction === 1 ? (
                              <Badge colorScheme="red">Heart Disease</Badge>
                            ) : (
                              <Badge colorScheme="green">No Heart Disease</Badge>
                            )}
                          </Td>
                          <Td isNumeric fontWeight="semibold">
                            {typeof result.probability === 'number' 
                              ? result.probability.toFixed(1) 
                              : '0.0'}%
                          </Td>
                          <Td>
                            <Badge colorScheme={
                              parseFloat(result.probability) < 33 ? "green" :
                              parseFloat(result.probability) < 66 ? "yellow" : "red"
                            }>
                              {parseFloat(result.probability) < 33 ? "Low Risk" :
                               parseFloat(result.probability) < 66 ? "Moderate Risk" : "High Risk"}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                
                {/* Consensus Analysis */}
                {consensusAnalysis && (
                  <MotionBox 
                    p={5} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    borderColor={borderColor}
                    bg={cardBg}
                    boxShadow="sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Heading size="sm" mb={3}>Consensus Analysis</Heading>
                    
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Consensus Level:</Text>
                        <Badge colorScheme={consensusAnalysis.consensusColor} fontSize="sm" px={2} py={1}>
                          {consensusAnalysis.consensusLevel}
                        </Badge>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Average Risk Probability:</Text>
                        <Text fontWeight="semibold">
                          {consensusAnalysis.avgProbability}%
                        </Text>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Models Predicting Heart Disease:</Text>
                        <Text>{consensusAnalysis.positiveCount} of {consensusAnalysis.totalModels}</Text>
                      </Flex>
                      
                      {consensusAnalysis.disagreeingModels && consensusAnalysis.disagreeingModels.length > 0 && (
                        <Box mt={2}>
                          <Text fontWeight="bold" mb={1}>Models Disagreeing with Ensemble:</Text>
                          <Text fontSize="sm">{consensusAnalysis.disagreeingModels.join(', ')}</Text>
                        </Box>
                      )}
                      
                      <Divider my={2} />
                      
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        Note: Model consensus doesn't guarantee accuracy. Always consult healthcare professionals.
                      </Text>
                    </VStack>
                  </MotionBox>
                )}
              </VStack>
            ) : (
              <Box p={8} textAlign="center" borderWidth="1px" borderRadius="lg" borderStyle="dashed">
                <InfoIcon boxSize={10} color="blue.400" mb={4} />
                <Text fontSize="lg" mb={4}>No comparison data yet</Text>
                <Text color="gray.500" mb={4}>
                  Click "Run Model Comparison" to see how different models assess your risk.
                </Text>
              </Box>
            )}
          </Box>
        </MotionBox>
        
        {/* Model Performance Section */}
        <MotionBox
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box borderWidth="1px" borderRadius="lg" p={6} bg={cardBg} boxShadow="sm">
            <Heading size="md" mb={4} display="flex" alignItems="center">
              <Box mr={2} bg="blue.500" w={1} h={6}></Box>
              Model Performance Metrics
              <ChakraTooltip label="These metrics show how well each model performed on test data">
                <QuestionIcon ml={2} color="blue.400" />
              </ChakraTooltip>
            </Heading>
            
            {loadingMetrics ? (
              <Box textAlign="center" my={10}>
                <Spinner size="sm" />
                <Text mt={2}>Loading model metrics...</Text>
              </Box>
            ) : metricsError ? (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Metrics unavailable</AlertTitle>
                  <Text fontSize="sm">{metricsError}</Text>
                </Box>
              </Alert>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Radar Chart of Metrics */}
                <Box 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  borderColor={borderColor}
                  bg={cardBg} 
                  h="400px"
                  boxShadow="sm"
                >
                  {isChartReady && metricsData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={150} data={metricsData}>
                        <PolarGrid stroke={borderColor} />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: textColor }} />
                        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: textColor }} />
                        
                        {models.map((model) => (
                          <Radar
                            key={model.id}
                            name={model.name}
                            dataKey={model.id}
                            stroke={model.color}
                            fill={model.color}
                            fillOpacity={0.2}
                            dot={true}
                            activeDot={{ r: 4, strokeWidth: 2 }}
                          />
                        ))}
                        
                        <Legend 
                          formatter={(value) => <span style={{ color: textColor }}>{value}</span>} 
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: "10px" }}
                        />
                        <RechartsTooltip 
                          formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Score']}
                          contentStyle={{ backgroundColor: cardBg, borderRadius: '4px', border: `1px solid ${borderColor}`, padding: '10px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
                
                {/* Model Explanations - sorted in display order */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {models
                    .sort((a, b) => MODEL_DISPLAY_ORDER.indexOf(a.id) - MODEL_DISPLAY_ORDER.indexOf(b.id))
                    .map((model) => (
                      <MotionBox
                        key={model.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={borderColor}
                        bg={cardBg}
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", borderColor: model.color }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: 0.1 * MODEL_DISPLAY_ORDER.indexOf(model.id) 
                        }}
                      >
                        <Heading size="sm" mb={2} color={model.color}>{model.name}</Heading>
                        <Text fontSize="sm" mb={3}>{model.description}</Text>
                        
                        {modelMetrics && modelMetrics[model.id] && (
                          <SimpleGrid columns={2} spacing={2} fontSize="sm">
                            <Stat size="sm">
                              <StatLabel>Accuracy</StatLabel>
                              <StatNumber>
                                {typeof modelMetrics[model.id].accuracy === 'number' 
                                  ? (modelMetrics[model.id].accuracy * 100).toFixed(1) 
                                  : 0}%
                              </StatNumber>
                            </Stat>
                            
                            <Stat size="sm">
                              <StatLabel>F1 Score</StatLabel>
                              <StatNumber>
                                {typeof modelMetrics[model.id].f1 === 'number'
                                  ? modelMetrics[model.id].f1.toFixed(2)
                                  : '0.00'}
                              </StatNumber>
                            </Stat>
                          </SimpleGrid>
                        )}
                        
                        <ChakraTooltip label="Learn more about this model">
                          <Link fontSize="xs" color="blue.500" mt={2} display="inline-block">
                            <ExternalLinkIcon mr={1} boxSize={3} />
                            Learn more
                          </Link>
                        </ChakraTooltip>
                      </MotionBox>
                    ))}
                </SimpleGrid>
                
                {/* Metrics Explanation */}
                <MotionBox
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={borderColor}
                  bg={highlightBg}
                  fontSize="sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Heading size="xs" mb={2}>Understanding Performance Metrics</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Box>
                      <Text fontWeight="bold">Accuracy</Text>
                      <Text>The proportion of correctly predicted instances out of the total instances.</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Precision</Text>
                      <Text>The proportion of correctly predicted positive instances among all predicted positive instances.</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Recall</Text>
                      <Text>The proportion of correctly predicted positive instances among all actual positive instances.</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">F1 Score</Text>
                      <Text>The harmonic mean of precision and recall, providing a balance between the two.</Text>
                    </Box>
                  </SimpleGrid>
                </MotionBox>
              </VStack>
            )}
          </Box>
        </MotionBox>
      </SimpleGrid>

      {/* Detailed Model Analysis Section */}
      {modelResults && Object.keys(modelResults).length > 0 && (
        <MotionBox
          mt={6}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Heading size="md" mb={4}>
            Detailed Model Analysis
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {Object.values(modelResults)
              .sort((a, b) => {
                const indexA = MODEL_DISPLAY_ORDER.indexOf(a.model_id);
                const indexB = MODEL_DISPLAY_ORDER.indexOf(b.model_id);
                return indexA - indexB;
              })
              .map((result, index) => (
                <MotionBox
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={borderColor}
                  bg={cardBg}
                  boxShadow="sm"
                  borderLeft="4px solid"
                  borderLeftColor={result.color}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <HStack mb={2}>
                    <Heading size="sm" color={result.color}>
                      {result.model_name}
                    </Heading>
                    <Spacer />
                    <Badge 
                      colorScheme={result.prediction === 1 ? "red" : "green"} 
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {result.prediction === 1 ? "Positive" : "Negative"}
                    </Badge>
                  </HStack>
                  
                  <Text mb={3} fontSize="sm">
                    {result.message || 
                      (result.prediction === 1 
                        ? "This model has detected patterns associated with heart disease."
                        : "This model has detected patterns suggesting absence of heart disease."
                      )
                    }
                  </Text>
                  
                  <Divider mb={3} />
                  
                  <SimpleGrid columns={2} spacing={2} mb={3}>
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Risk Probability</StatLabel>
                      <StatNumber fontSize="md">
                        {result.probability_percent || (result.probability * 100).toFixed(1)}%
                      </StatNumber>
                    </Stat>
                    
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Risk Level</StatLabel>
                      <StatNumber fontSize="md">
                        <Badge 
                          colorScheme={
                            result.risk_level?.includes("Low") ? "green" :
                            result.risk_level?.includes("Moderate") ? "yellow" : "red"
                          }
                        >
                          {result.risk_level || "Unknown"}
                        </Badge>
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                  
                  {result.specialties && (
                    <Box mt={2} fontSize="xs" color="gray.500" fontStyle="italic">
                      <Text fontWeight="bold" mb={1}>Model Specialty:</Text>
                      <Text>{result.specialties}</Text>
                    </Box>
                  )}
                </MotionBox>
              ))}
          </SimpleGrid>
        </MotionBox>
      )}
    </Container>
  );
};

// Helper function to extract numeric values
const getNumericValue = (obj, possibleKeys) => {
  if (!obj || typeof obj !== 'object') return 0;
  
  for (const key of possibleKeys) {
    if (obj[key] !== undefined) {
      const value = obj[key];
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) return parsed;
      }
    }
  }
  
  return 0;
};

export default ModelComparison;