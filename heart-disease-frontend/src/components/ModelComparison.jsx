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

const ModelComparison = ({ width }) => {
  const { colorMode } = useColorMode();
  const [isChartReady, setIsChartReady] = useState(false);
  const [modelData, setModelData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationPercent, setAnimationPercent] = useState(0);

  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Start animation when component mounts
  useEffect(() => {
    let start = null;
    const animationDuration = 2000; // Increased from 1500ms to 2000ms for smoother animation
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Use easeOutQuart easing function for smoother animation
      const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
      setAnimationPercent(easeOutQuart(progress) * 100);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    // Reduced delay before starting animation for faster initial loading
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 200);
  }, []);

  // Fetch model comparison data
  useEffect(() => {
    const fetchModelComparison = async () => {
      try {
        setIsLoading(true);
        const apiUrl = `${API_BASE_URL}/api/model/comparison`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch model comparison data');
        }
        
        const data = await response.json();
        
        // Transform data for the chart
        const transformedData = Object.entries(data).map(([model, metrics]) => ({
          model: formatModelName(model),
          accuracy: metrics.accuracy || 0,
          precision: metrics.precision || 0,
          recall: metrics.recall || 0,
          f1: metrics.f1 || 0,
          color: getModelColor(model),
          modelKey: model
        }));
        
        setModelData(transformedData);
        
        // Add delay before showing chart for smoother loading transition
        setTimeout(() => {
          setIsChartReady(true);
          setIsLoading(false);
        }, 500);
        
      } catch (err) {
        console.error("Error fetching model comparison:", err);
        setError("Unable to load model comparison data");
        setIsLoading(false);
        
        // Fallback to sample data
        setModelData([
          { model: 'Logistic Regression', accuracy: 0.85, precision: 0.84, recall: 0.83, f1: 0.83, color: '#4299E1', modelKey: 'logistic_regression' },
          { model: 'Random Forest', accuracy: 0.88, precision: 0.87, recall: 0.86, f1: 0.86, color: '#48BB78', modelKey: 'random_forest' },
          { model: 'SVM', accuracy: 0.83, precision: 0.82, recall: 0.80, f1: 0.81, color: '#ED8936', modelKey: 'svm' },
          { model: 'Neural Network', accuracy: 0.87, precision: 0.86, recall: 0.87, f1: 0.86, color: '#9F7AEA', modelKey: 'neural_network' },
          { model: 'Ensemble', accuracy: 0.90, precision: 0.89, recall: 0.88, f1: 0.89, color: '#F56565', modelKey: 'ensemble' }
        ]);
        
        // Show fallback data
        setTimeout(() => {
          setIsChartReady(true);
        }, 500);
      }
    };
    
    fetchModelComparison();
  }, []);

  // Format model names for display
  const formatModelName = (modelKey) => {
    return modelKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Assign colors to models
  const getModelColor = (modelKey) => {
    const colorMap = {
      'logistic_regression': '#4299E1', // blue
      'random_forest': '#48BB78', // green
      'svm': '#ED8936', // orange
      'neural_network': '#9F7AEA', // purple
      'ensemble': '#F56565', // red
      'xgboost': '#38B2AC', // teal
      'decision_tree': '#ECC94B', // yellow
      'knn': '#B794F4', // lavender
    };
    
    return colorMap[modelKey] || '#718096'; // default gray
  };

  // Calculate animated values for smoother chart appearance
  const animatedData = modelData.map(item => ({
    ...item,
    animatedAccuracy: (item.accuracy * (animationPercent / 100)),
    animatedPrecision: (item.precision * (animationPercent / 100)),
    animatedRecall: (item.recall * (animationPercent / 100)),
    animatedF1: (item.f1 * (animationPercent / 100)),
  }));

  // Custom tooltip component with enhanced styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={3}
          boxShadow="lg"
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor={payload[0].payload.color}
          animation="fadeIn 0.2s ease-out"
          sx={{
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "scale(0.95)" },
              "100%": { opacity: 1, transform: "scale(1)" }
            }
          }}
        >
          <Text fontWeight="bold" mb={1}>{label}</Text>
          {payload.map((entry, index) => (
            <Flex key={`item-${index}`} alignItems="center" mb={1}>
              <Box w={3} h={3} borderRadius="full" bg={entry.color} mr={2} />
              <Text fontSize="sm">
                {entry.name}: {(entry.value * 100).toFixed(1)}%
              </Text>
            </Flex>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Animation keyframes for skeleton loading effect
  const pulseAnimation = keyframes`
    0% { opacity: 0.6; }
    50% { opacity: 0.9; }
    100% { opacity: 0.6; }
  `;
  const pulse = `${pulseAnimation} 1.5s ease-in-out infinite`;

  return (
    <Card boxShadow="md" borderRadius="lg" bg={cardBg} overflow="hidden" transition="all 0.3s">
      <CardHeader pb={2}>
        <Flex align="center" wrap="wrap">
          <Box mb={{ base: 2, md: 0 }}>
            <Heading size="md" display="flex" alignItems="center">
              <Icon as={FaChartBar} color="blue.500" mr={2} />
              Model Performance Comparison
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm" mt={1}>
              Comparing accuracy metrics across different prediction models
            </Text>
          </Box>
          <Spacer />
          <ChakraTooltip 
            label="View detailed explanation of these metrics"
            hasArrow
            placement="top"
          >
            <Button
              leftIcon={<InfoIcon />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => console.log('Show metrics info modal')}
            >
              Learn More
            </Button>
          </ChakraTooltip>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Show info alert when using fallback data */}
          {error && (
            <Alert status="info" mb={3} borderRadius="md"
              animation="fadeIn 0.6s ease-in-out"
              sx={{
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" }
                }
              }}
            >
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">{error}</Text>
                <Text fontSize="sm">
                  The chart below shows representative data that may not reflect the most current models.
                </Text>
              </Box>
            </Alert>
          )}
          
          {/* Loading skeleton */}
          {isLoading && (
            <Box 
              height="400px"
              display="flex" 
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Box 
                width="80%" 
                height="300px" 
                bg={useColorModeValue("gray.100", "gray.600")}
                borderRadius="md"
                animation={pulse}
                mb={4}
              />
              <Stack width="80%" spacing={4}>
                <Flex justify="space-between">
                  {[1,2,3,4,5].map(i => (
                    <Box 
                      key={i}
                      height="20px" 
                      width={`${16 + Math.random() * 5}%`}
                      bg={useColorModeValue("gray.200", "gray.500")}
                      borderRadius="md"
                      animation={pulse}
                    />
                  ))}
                </Flex>
                <Box 
                  height="24px" 
                  width="40%" 
                  bg={useColorModeValue("gray.200", "gray.500")}
                  borderRadius="md"
                  animation={pulse}
                />
              </Stack>
            </Box>
          )}
          
          {!isLoading && (
            <>
              {/* Chart Container with enhanced animations */}
              <Box 
                position="relative" 
                height={{ base: "300px", md: "400px" }}
                sx={{
                  ".recharts-cartesian-axis": {
                    transition: "opacity 1s ease-in-out, transform 1s ease-in-out",
                    opacity: isChartReady ? 1 : 0,
                    transform: isChartReady ? "translateX(0)" : "translateX(-20px)"
                  },
                  ".recharts-cartesian-grid": {
                    transition: "opacity 1s ease-in-out",
                    opacity: isChartReady ? 0.6 : 0
                  },
                  ".recharts-bar-rectangles": {
                    transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-out"
                  },
                  ".recharts-legend-wrapper": {
                    transition: "opacity 1.2s ease-in-out, transform 0.8s ease-out",
                    opacity: isChartReady ? 1 : 0,
                    transform: isChartReady ? "translateY(0)" : "translateY(-10px)"
                  }
                }}
              >
                {isChartReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={animatedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      barGap={8}
                      barCategoryGap={16}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0', '#4A5568')} opacity={0.4} />
                      <XAxis 
                        dataKey="model" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{ fill: textColor, fontSize: 12 }}
                        tickMargin={20}
                        animationDuration={1500}
                        animationBegin={300}
                        animationEasing="ease-out-cubic"
                      />
                      <YAxis 
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                        domain={[0, 1]}
                        tick={{ fill: textColor }}
                        animationDuration={1500}
                        animationBegin={300}
                        animationEasing="ease-out-cubic"
                      />
                      <Tooltip content={<CustomTooltip />} animationDuration={300} animationEasing="ease-out-cubic" />
                      <Legend 
                        verticalAlign="top" 
                        wrapperStyle={{paddingBottom: "10px"}}
                        animationDuration={1200}
                      />
                      <Bar 
                        dataKey="animatedAccuracy" 
                        name="Accuracy" 
                        fill="#4299E1"
                        fillOpacity={0.85}
                        strokeWidth={1}
                        stroke="#3182CE"
                        radius={[3, 3, 0, 0]}
                        animationDuration={1000}
                        animationEasing="ease-out-bounce"
                        animationBegin={300}
                        isAnimationActive={true}
                      />
                      <Bar 
                        dataKey="animatedPrecision" 
                        name="Precision" 
                        fill="#48BB78"
                        fillOpacity={0.85}
                        strokeWidth={1}
                        stroke="#38A169"
                        radius={[3, 3, 0, 0]}
                        animationDuration={1000}
                        animationEasing="ease-out-bounce"
                        animationBegin={500}
                        isAnimationActive={true}
                      />
                      <Bar 
                        dataKey="animatedRecall" 
                        name="Recall" 
                        fill="#ED8936"
                        fillOpacity={0.85}
                        strokeWidth={1}
                        stroke="#DD6B20"
                        radius={[3, 3, 0, 0]}
                        animationDuration={1000}
                        animationEasing="ease-out-bounce"
                        animationBegin={700}
                        isAnimationActive={true}
                      />
                      <Bar 
                        dataKey="animatedF1" 
                        name="F1-Score" 
                        fill="#9F7AEA"
                        fillOpacity={0.85}
                        strokeWidth={1}
                        stroke="#805AD5"
                        radius={[3, 3, 0, 0]}
                        animationDuration={1000}
                        animationEasing="ease-out-bounce"
                        animationBegin={900}
                        isAnimationActive={true}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>

              {/* Legend description with enhanced animation */}
              <Box 
                borderWidth="1px" 
                borderRadius="md" 
                p={3} 
                borderColor={borderColor}
                mt={2}
                bg={useColorModeValue("gray.50", "gray.800")}
                opacity={isChartReady ? 1 : 0}
                transform={isChartReady ? "translateY(0)" : "translateY(10px)"}
                transition="opacity 0.8s ease-in-out 1.2s, transform 0.8s ease-in-out 1.2s"
              >
                <Flex wrap="wrap">
                  <MetricDescription 
                    title="Accuracy" 
                    color="blue.500" 
                    description="The proportion of correct predictions among all predictions made" 
                  />
                  <MetricDescription 
                    title="Precision" 
                    color="green.500" 
                    description="The ability of the model to avoid false positives" 
                  />
                  <MetricDescription 
                    title="Recall" 
                    color="orange.500" 
                    description="The ability of the model to find all positive samples" 
                  />
                  <MetricDescription 
                    title="F1-Score" 
                    color="purple.500" 
                    description="The harmonic mean of precision and recall" 
                  />
                </Flex>
              </Box>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Helper component for metric descriptions
const MetricDescription = ({ title, color, description }) => (
  <Box flex="1" minW={{ base: "100%", md: "180px" }} p={2}>
    <Flex align="center" mb={1}>
      <Box w={3} h={3} borderRadius="full" bg={color} mr={2} />
      <Text fontWeight="medium">{title}</Text>
    </Flex>
    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
      {description}
    </Text>
  </Box>
);

export default ModelComparison;