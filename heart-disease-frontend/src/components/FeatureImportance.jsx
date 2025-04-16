import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  Box, Heading, Text, VStack, SimpleGrid, Flex, Spacer,
  Spinner, Alert, AlertIcon, Badge, Button,
  Tooltip as ChakraTooltip, useColorModeValue, Divider,
  IconButton, useDisclosure, Collapse, List, ListItem,
  ListIcon, Icon, Card, CardBody, CardHeader, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { InfoIcon, QuestionIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, LabelList
} from 'recharts';
import { FaHeart, FaHeartbeat, FaInfoCircle, FaExclamationCircle, FaCheckCircle, FaSync } from 'react-icons/fa';
import { getFeatureImportance } from '../services/api.js';

// Feature descriptions with layman explanations for patients
const featureDescriptions = {
  'age': 'Your age in years. Heart disease risk increases with age, especially after 45 for men and 55 for women.',
  'sex': 'Biological sex assigned at birth. Men generally have a higher risk of heart disease than women before menopause.',
  'cp': 'Chest pain type. Different types of chest pain can indicate different levels of heart disease risk.', 
  'trestbps': 'Resting blood pressure in mm Hg. High blood pressure (above 130/80) is a major risk factor for heart disease.',
  'chol': 'Serum cholesterol in mg/dl. High cholesterol (above 200 mg/dl) can lead to fatty deposits in blood vessels.',
  'fbs': 'Fasting blood sugar above 120 mg/dl. High blood sugar can damage blood vessels and the nerves that control your heart.',
  'restecg': 'Resting electrocardiogram results. This measures electrical activity in your heart at rest.',
  'thalach': 'Maximum heart rate achieved during exercise. A lower than expected max heart rate may indicate heart problems.',
  'exang': 'Exercise-induced angina (chest pain). Chest pain during physical activity can be a sign of coronary artery disease.',
  'oldpeak': 'ST depression induced by exercise relative to rest. A measure of heart stress during a stress test.',
  'slope': 'Slope of the peak exercise ST segment. Another measure from a stress test indicating heart function.',
  'ca': 'Number of major vessels colored by fluoroscopy. More colored vessels may indicate more extensive heart disease.',
  'thal': 'Thalassemia (blood disorder) or results from a nuclear stress test. Some types indicate higher heart risk.'
};

// More patient-friendly feature names
const featureNameMapping = {
  'age': 'Age',
  'sex': 'Gender',
  'cp': 'Chest Pain Pattern',
  'trestbps': 'Blood Pressure',
  'chol': 'Cholesterol',
  'fbs': 'Blood Sugar Level',
  'restecg': 'Resting ECG',
  'thalach': 'Max Heart Rate',
  'exang': 'Chest Pain on Exertion',
  'oldpeak': 'Heart Stress Level',
  'slope': 'ST Segment Pattern',
  'ca': 'Blocked Vessels',
  'thal': 'Blood Flow to Heart'
};

// Health action recommendations based on feature importance
const featureActionRecommendations = {
  'cp': "Discuss any chest pain with your doctor immediately. Even minor chest discomfort can be significant.",
  'ca': "If you have blocked vessels, follow your doctor's advice regarding medications and lifestyle changes.",
  'thal': "Follow up with your healthcare provider to discuss blood flow issues to your heart.",
  'oldpeak': "Consider a stress test to evaluate your heart function during exercise.",
  'age': "As you age, regular cardiovascular check-ups become increasingly important.",
  'thalach': "Regular aerobic exercise helps improve your heart's efficiency and maximum capacity.",
  'sex': "Discuss gender-specific heart disease risks with your healthcare provider.",
  'exang': "Report any chest pain during physical activity to your doctor promptly.",
  'trestbps': "Monitor your blood pressure regularly and follow strategies to maintain healthy levels.",
  'slope': "Follow your cardiologist's recommendations regarding exercise intensity and frequency.",
  'restecg': "Have regular ECG check-ups as recommended by your healthcare provider.",
  'chol': "Maintain a heart-healthy diet low in saturated fats to manage cholesterol levels.",
  'fbs': "Monitor blood sugar levels and adopt a diet that helps regulate them."
};

// Color scheme that works well in both light and dark modes
const COLORS = [
  '#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8', 
  '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', 
  '#83a6ed', '#667fcc', '#e78ac3'
];

// Handle any SVG icons with proper sizing
const IconComponent = ({ icon: IconElement, size, ...props }) => {
  // Convert Chakra UI size tokens to numerical pixel values
  const sizeMap = {
    xs: "12px",
    sm: "16px",
    md: "20px",
    lg: "24px",
    xl: "30px"
  };

  // If size is a string that matches Chakra sizes, convert it
  const finalSize = sizeMap[size] || size;
  
  // For SVG elements, we need to ensure the size is a valid CSS value
  // Only pass valid CSS dimensions to SVG elements, not Chakra tokens
  return React.cloneElement(IconElement, { 
    size: finalSize,
    // Only include width/height if finalSize is a valid CSS dimension
    ...(finalSize && typeof finalSize === 'string' && 
       (finalSize.includes('px') || finalSize.includes('em') || finalSize.includes('rem') || 
        finalSize.includes('%') || !isNaN(parseInt(finalSize, 10))) 
       ? { width: finalSize, height: finalSize } : {}),
    ...props
  });
};

// Fallback data for when API fails
const getFallbackData = (errorReason = "Using simulated feature importance data") => {
  return [
    { feature: "Chest Pain Pattern", featureKey: "cp", importance: 0.22, color: COLORS[0], 
      description: featureDescriptions["cp"], action: featureActionRecommendations["cp"] },
    { feature: "Blocked Vessels", featureKey: "ca", importance: 0.18, color: COLORS[1], 
      description: featureDescriptions["ca"], action: featureActionRecommendations["ca"] },
    { feature: "Blood Flow to Heart", featureKey: "thal", importance: 0.15, color: COLORS[2], 
      description: featureDescriptions["thal"], action: featureActionRecommendations["thal"] },
    { feature: "Heart Stress Level", featureKey: "oldpeak", importance: 0.10, color: COLORS[3], 
      description: featureDescriptions["oldpeak"], action: featureActionRecommendations["oldpeak"] },
    { feature: "Age", featureKey: "age", importance: 0.08, color: COLORS[4], 
      description: featureDescriptions["age"], action: featureActionRecommendations["age"] },
    { feature: "Max Heart Rate", featureKey: "thalach", importance: 0.07, color: COLORS[5], 
      description: featureDescriptions["thalach"], action: featureActionRecommendations["thalach"] },
    { feature: "Gender", featureKey: "sex", importance: 0.06, color: COLORS[6], 
      description: featureDescriptions["sex"], action: featureActionRecommendations["sex"] },
    { feature: "Chest Pain on Exertion", featureKey: "exang", importance: 0.05, color: COLORS[7], 
      description: featureDescriptions["exang"], action: featureActionRecommendations["exang"] },
    { feature: "Blood Pressure", featureKey: "trestbps", importance: 0.03, color: COLORS[8], 
      description: featureDescriptions["trestbps"], action: featureActionRecommendations["trestbps"] },
    { feature: "ST Segment Pattern", featureKey: "slope", importance: 0.03, color: COLORS[9], 
      description: featureDescriptions["slope"], action: featureActionRecommendations["slope"] },
    { feature: "Resting ECG", featureKey: "restecg", importance: 0.01, color: COLORS[10], 
      description: featureDescriptions["restecg"], action: featureActionRecommendations["restecg"] },
    { feature: "Cholesterol", featureKey: "chol", importance: 0.01, color: COLORS[11], 
      description: featureDescriptions["chol"], action: featureActionRecommendations["chol"] },
    { feature: "Blood Sugar Level", featureKey: "fbs", importance: 0.01, color: COLORS[12], 
      description: featureDescriptions["fbs"], action: featureActionRecommendations["fbs"] }
  ];
};

// Process feature data helper
const processFeatureData = (importanceData) => {
  try {
    // Format data for your chart and add colors
    const formattedData = Object.entries(importanceData)
      .map(([feature, value], index) => ({
        feature: featureNameMapping[feature] || feature,
        featureKey: feature, // Store original key for descriptions
        importance: typeof value === 'number' ? value : parseFloat(value) || 0,
        color: COLORS[index % COLORS.length],
        description: featureDescriptions[feature],
        action: featureActionRecommendations[feature]
      }))
      .filter(item => !isNaN(item.importance)); // Filter out any NaN values
    
    // Sort by importance descending
    formattedData.sort((a, b) => b.importance - a.importance);
    
    console.log("Formatted feature data:", formattedData);
    
    if (formattedData.length > 0) {
      return { formattedData, error: null };
    } else {
      // If we have no valid data after processing, use fallback
      console.warn("No valid feature data after processing, using fallback");
      return { 
        formattedData: getFallbackData(), 
        error: "No valid feature data found" 
      };
    }
  } catch (err) {
    console.error("Error processing feature data:", err);
    return { 
      formattedData: getFallbackData(), 
      error: "Error processing feature data" 
    };
  }
};

const FeatureImportance = () => {
  // State declarations - ALL hooks need to be at the top level
  const [featureData, setFeatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const { isOpen: isActionsOpen, onToggle: toggleActions } = useDisclosure();
  const [animationPercent, setAnimationPercent] = useState(0);
  
  // Refs
  const chartContainerRef = useRef(null);
  const animationTimer = useRef(null);
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const featureCardBg = useColorModeValue('gray.50', 'gray.800');
  const barColor = useColorModeValue('#4299E1', '#63B3ED');
  const hoverColor = useColorModeValue('#2B6CB0', '#3182CE');
  const skeletonColor = useColorModeValue('gray.100', 'gray.700');
  const skeletonHighlight = useColorModeValue('gray.200', 'gray.600');
  
  // Load feature importance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await getFeatureImportance();
          console.log("Feature importance response:", response);
          
          // Check if we should immediately use fallback data
          if (response?.useFallback) {
            console.log("API indicated we should use fallback data:", response.error);
            setFeatureData(getFallbackData());
            setError(response.error || "Using simulated feature importance data");
          } else if (response && response.success && response.data) {
            let importanceData = {};
            
            // Try different possible response structures
            if (response.data.feature_importance) {
              importanceData = response.data.feature_importance;
            } else if (response.data.features) {
              importanceData = response.data.features;
            } else if (response.data.importance) {
              importanceData = response.data.importance;
            } else {
              // Check if data itself has the feature keys directly
              const possibleFeatures = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
                                      'restecg', 'thalach', 'exang', 'oldpeak', 
                                      'slope', 'ca', 'thal'];
              
              // If at least 3 expected feature keys exist directly in data, use it
              const directFeatures = possibleFeatures.filter(f => response.data[f] !== undefined);
              if (directFeatures.length >= 3) {
                importanceData = {};
                directFeatures.forEach(f => {
                  importanceData[f] = response.data[f];
                });
              }
            }
            
            // Process the data if we found it in any format
            if (Object.keys(importanceData).length > 0) {
              const { formattedData, error: processingError } = processFeatureData(importanceData);
              setFeatureData(formattedData);
              if (processingError) {
                setError(processingError);
              }
            } else {
              // If we couldn't extract data in any format, use fallback
              console.warn("API returned data in an unrecognized format. Using fallback data.");
              setFeatureData(getFallbackData());
              setError("Could not parse data from API");
            }
          } else {
            // If the response was invalid, use fallback
            console.warn("API returned invalid response. Using fallback data.");
            setFeatureData(getFallbackData());
            setError("Invalid response from API");
          }
        } catch (apiError) {
          console.error("Error loading feature importance:", apiError);
          setFeatureData(getFallbackData());
          setError("Error connecting to API server");
        }
      } finally {
        // Set loading to false
        setLoading(false);
        
        // Start animation after a short delay
        setTimeout(() => {
          setIsChartReady(true);
          
          // Clear any existing animation
          if (animationTimer.current) {
            clearInterval(animationTimer.current);
          }
          
          // Start progressive animation from 0 to 100%
          let progress = 0;
          animationTimer.current = setInterval(() => {
            progress += 2;
            setAnimationPercent(Math.min(progress, 100));
            
            if (progress >= 100) {
              clearInterval(animationTimer.current);
            }
          }, 16); // ~60 fps
        }, 300);
      }
    };
    
    fetchData();
    
    // Cleanup animation timer
    return () => {
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
      }
    };
  }, []);
  
  // Handle bar click to show feature details
  const handleBarClick = useCallback((data) => {
    setSelectedFeature(data);
  }, []);
  
  // Clear selected feature
  const clearSelectedFeature = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  // Custom tooltip component for BarChart
  const CustomTooltip = useCallback(({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <Box 
          bg={cardBg} 
          p={3} 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="md"
          maxW="300px"
          animation="fadeIn 0.2s ease-in-out"
          sx={{
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(10px)" },
              "100%": { opacity: 1, transform: "translateY(0)" }
            }
          }}
        >
          <Text fontWeight="bold" color={data.color}>{data.feature}</Text>
          <Text fontSize="sm" mt={1}>Importance: {(data.importance * 100).toFixed(1)}%</Text>
          <Divider my={2} />
          <Text fontSize="xs" color={mutedTextColor}>
            {data.description || featureDescriptions[data.featureKey] || "No description available"}
          </Text>
          <Text fontSize="xs" fontWeight="medium" mt={2} color="blue.500">
            Click bar for more details and recommendations
          </Text>
        </Box>
      );
    }
    
    return null;
  }, [cardBg, borderColor, mutedTextColor]);

  // Loading skeleton for chart
  const ChartSkeleton = () => (
    <Box height={{ base: "400px", md: "500px", lg: "600px" }} width="100%" position="relative">
      {/* Y-Axis Labels Skeleton */}
      <VStack 
        position="absolute"
        left={0}
        top={20}
        height="calc(100% - 40px)"
        width="120px"
        alignItems="flex-start"
        justifyContent="space-between"
        p={2}
        spacing={0}
      >
        {Array(10).fill(0).map((_, i) => (
          <Box 
            key={i}
            width={`${70 + Math.random() * 30}px`} 
            height="10px" 
            bg={skeletonColor}
            borderRadius="md"
            sx={{ 
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.5 },
              }
            }}
          />
        ))}
      </VStack>
      
      {/* Bars Skeleton */}
      <VStack 
        position="absolute"
        left="120px"
        top={20}
        height="calc(100% - 40px)"
        width="calc(100% - 120px)"
        alignItems="flex-start"
        justifyContent="space-between"
        p={2}
        spacing={0}
      >
        {Array(10).fill(0).map((_, i) => (
          <Box 
            key={i}
            width={`${25 + Math.random() * 50}%`} 
            height="16px" 
            bg={skeletonColor}
            borderRadius="md"
            sx={{ 
              animation: "shimmer 2s infinite",
              background: `linear-gradient(90deg, ${skeletonColor} 0%, ${skeletonHighlight} 50%, ${skeletonColor} 100%)`,
              backgroundSize: "200% 100%",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "200% 0" },
                "100%": { backgroundPosition: "-200% 0" }
              }
            }}
          />
        ))}
      </VStack>
      
      {/* X-Axis Skeleton */}
      <Box 
        position="absolute"
        left="120px"
        bottom={0}
        height="20px"
        width="calc(100% - 120px)"
        bg={skeletonColor}
        sx={{ 
          animation: "pulse 1.5s infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.5 },
          }
        }}
      />
    </Box>
  );

  // Loading state with skeleton
  if (loading) {
    return (
      <Box>
        <Card boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader>
            <Flex align="center" wrap="wrap">
              <Box mb={{ base: 2, md: 0 }} width={{ base: "100%", md: "auto" }}>
                <Heading size="md" display="flex" alignItems="center">
                  <Icon as={FaHeartbeat} color="heartRed.500" mr={2} />
                  Health Factors Influencing Your Heart
                </Heading>
                <Text color={mutedTextColor} fontSize="sm" mt={1}>
                  Understanding which factors have the most impact on heart disease risk
                </Text>
              </Box>
              <Spacer />
              <IconButton
                icon={<InfoIcon />}
                aria-label="More information"
                size="sm"
                variant="ghost"
                colorScheme="blue"
              />
            </Flex>
          </CardHeader>
          
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box textAlign="center" py={2}>
                <Text fontSize="sm" color={mutedTextColor}>Analyzing your health factors...</Text>
              </Box>
              
              <ChartSkeleton />
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  // Calculate animated data for smooth entry
  const animatedData = featureData.map(item => ({
    ...item,
    animatedImportance: (item.importance * (animationPercent / 100))
  }));

  // Render the main component
  return (
    <Box>
      <Card boxShadow="md" borderRadius="lg" bg={cardBg}>
        <CardHeader>
          <Flex align="center" wrap="wrap">
            <Box mb={{ base: 2, md: 0 }}>
              <Heading size="md" display="flex" alignItems="center">
                <Icon as={FaHeartbeat} color="heartRed.500" mr={2} />
                Health Factors Influencing Your Heart
              </Heading>
              <Text color={mutedTextColor} fontSize="sm" mt={1}>
                Understanding which factors have the most impact on heart disease risk
              </Text>
            </Box>
            <Spacer />
            <ChakraTooltip 
              label="This analysis shows which health factors have the strongest influence on heart disease prediction"
              hasArrow
              placement="top"
            >
              <IconButton
                icon={<InfoIcon />}
                aria-label="More information"
                size="sm"
                variant="ghost"
                colorScheme="blue"
              />
            </ChakraTooltip>
          </Flex>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Show info alert when using fallback data */}
            {error && (
              <Alert status="info" mb={3} borderRadius="md"
                animation="fadeIn 0.5s ease-in-out"
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
                    The chart below shows representative data that may not reflect the most current model.
                  </Text>
                </Box>
              </Alert>
            )}
            
            {/* Feature detail modal */}
            {selectedFeature && (
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor={borderColor}
                bg={featureCardBg}
                position="relative"
                mb={4}
                animation="slideDown 0.3s ease-in-out"
                sx={{
                  "@keyframes slideDown": {
                    "0%": { opacity: 0, transform: "translateY(-20px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" }
                  }
                }}
              >
                <IconButton
                  icon={<ChevronUpIcon />}
                  aria-label="Close feature details"
                  size="sm"
                  position="absolute"
                  right={2}
                  top={2}
                  onClick={clearSelectedFeature}
                />
                
                <Flex align="center" mb={3}>
                  <Box bg={selectedFeature.color} w={3} h={3} borderRadius="full" mr={2} />
                  <Heading size="md">{selectedFeature.feature}</Heading>
                  <Badge ml={2} colorScheme="blue">
                    {(selectedFeature.importance * 100).toFixed(1)}% impact
                  </Badge>
                </Flex>
                
                <Text fontSize="sm" mb={3}>
                  {selectedFeature.description || featureDescriptions[selectedFeature.featureKey] || "No description available"}
                </Text>
                
                <Box p={3} bg={cardBg} borderRadius="md" borderLeft="4px solid" borderLeftColor={selectedFeature.color}>
                  <Heading size="xs" mb={1} display="flex" alignItems="center">
                    <Icon as={FaInfoCircle} mr={2} color="blue.400" />
                    Health Recommendation
                  </Heading>
                  <Text fontSize="sm">
                    {selectedFeature.action || featureActionRecommendations[selectedFeature.featureKey] || 
                     "Discuss this factor with your healthcare provider."}
                  </Text>
                </Box>
              </Box>
            )}
            
            {/* Feature importance chart */}
            <Box 
              position="relative"
              height={{ base: "400px", md: "500px", lg: "600px" }}
              width="100%"
              overflow="hidden"
              ref={chartContainerRef}
              sx={{
                ".recharts-bar-rectangle": {
                  transition: "all 0.4s ease-in-out"
                }
              }}
            >
              {isChartReady && featureData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={animatedData}
                    margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    onClick={(data) => data && data.activePayload && handleBarClick(data.activePayload[0].payload)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0', '#4A5568')} />
                    <XAxis 
                      type="number" 
                      domain={[0, 0.25]} 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fill: textColor }}
                      animationDuration={1000}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="feature" 
                      width={120}
                      tick={{ fill: textColor }}
                      animationDuration={1000}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)') }} />
                    <Bar 
                      dataKey="animatedImportance" 
                      name="Importance"
                      cursor="pointer"
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    >
                      {animatedData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.feature === hoveredFeature ? hoverColor : entry.color} 
                          onMouseEnter={() => setHoveredFeature(entry.feature)} 
                          onMouseLeave={() => setHoveredFeature(null)}
                        />
                      ))}
                      <LabelList 
                        dataKey="animatedImportance" 
                        position="right" 
                        formatter={(value) => `${(value * 100).toFixed(1)}%`}
                        fill={textColor}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
            
            {/* Rest of the component remains the same */}
            <Box textAlign="center">
              <Text fontSize="sm" color={mutedTextColor} mb={2}>
                Click on any bar in the chart for more information and health recommendations
              </Text>
            </Box>
            
            <Divider />
            
            <Button
              onClick={toggleActions}
              rightIcon={isActionsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              variant="outline"
              colorScheme="blue"
              width="full"
            >
              {isActionsOpen ? "Hide Action Steps" : "Show Recommended Action Steps"}
            </Button>
            
            <Collapse in={isActionsOpen} animateOpacity>
              <VStack 
                spacing={4} 
                align="stretch" 
                p={4} 
                bg={featureCardBg} 
                borderRadius="md"
              >
                <Heading size="sm" display="flex" alignItems="center">
                  <Icon as={FaCheckCircle} color="green.500" mr={2} />
                  Top Actions to Improve Heart Health
                </Heading>
                
                <List spacing={3}>
                  {featureData.slice(0, 5).map((feature, index) => (
                    <ListItem key={index} display="flex">
                      <ListIcon as={FaHeartbeat} color={feature.color} mt={1} />
                      <Box>
                        <Text fontWeight="medium" fontSize="sm">{feature.feature}</Text>
                        <Text fontSize="sm" color={mutedTextColor}>
                          {feature.action || featureActionRecommendations[feature.featureKey] || 
                           "Discuss with your healthcare provider."}
                        </Text>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Remember that these factors work together. Even small improvements in multiple areas can significantly reduce your heart disease risk.
                  </Text>
                </Alert>
                
                <Button 
                  leftIcon={<Icon as={FaHeart} />} 
                  colorScheme="heartRed" 
                  size="sm" 
                  alignSelf="center"
                >
                  Learn More About Heart Health
                </Button>
              </VStack>
            </Collapse>
            
            <Box bg="blue.50" p={4} borderRadius="md" mt={2} color="blue.800">
              <Flex align="center" mb={2}>
                <InfoIcon color="blue.500" mr={2} />
                <Heading size="sm" color="blue.700">Understanding This Analysis</Heading>
              </Flex>
              <Text fontSize="sm">
                This chart shows which health factors most strongly influence heart disease prediction based on medical research and data analysis.
                The top factors (like chest pain patterns and blocked vessels) have the greatest impact on your heart health risk.
                Focusing on improving these factors can have the most significant benefits for your heart health.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default FeatureImportance;