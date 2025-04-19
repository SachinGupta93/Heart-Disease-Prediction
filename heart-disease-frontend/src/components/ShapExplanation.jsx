import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Text, Heading, SimpleGrid, Progress, VStack, HStack, 
  Badge, Spinner, Alert, AlertIcon, useColorModeValue, Icon,
  useToast, Flex, Divider, useBreakpointValue, useMediaQuery,
  ScaleFade, Collapse
} from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown, FaEquals, FaChartBar, FaInfoCircle } from 'react-icons/fa';
import { getFeatureExplanation } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

const ShapExplanation = ({ predictionData }) => {
  const [shapValues, setShapValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingRealData, setIsUsingRealData] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);
  const toast = useToast();
  
  // Enhanced screen size detection with lower breakpoints for tiny screens
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [isTiny] = useMediaQuery("(max-width: 350px)");
  const [isTablet] = useMediaQuery("(max-width: 768px)");
  const chartContainerRef = useRef(null);
  
  // Dynamic responsive values with improved mobile sizing
  const chartHeight = useBreakpointValue({ base: 220, sm: 250, md: 300, lg: 350 });
  const radarChartHeight = useBreakpointValue({ base: 250, sm: 280, md: 320, lg: 350 });
  const gridColumns = useBreakpointValue({ base: 1, md: 1, lg: 1, xl: 2 });
  const chartMargins = useBreakpointValue({ 
    base: { top: 5, right: 5, left: 40, bottom: 5 },
    sm: { top: 5, right: 10, left: 50, bottom: 5 },
    md: { top: 5, right: 20, left: 60, bottom: 5 },
    lg: { top: 5, right: 30, left: 80, bottom: 5 }
  });
  const yAxisWidth = useBreakpointValue({ base: 40, sm: 50, md: 60, lg: 80 });
  const featureCardPadding = useBreakpointValue({ base: 2, sm: 3, md: 4 });
  const maxFeaturesInRadar = useBreakpointValue({ base: 3, sm: 4, md: 5 });
  const topRadarHeadingText = useBreakpointValue({ base: "Top Impact Pattern", md: "Top Features Impact Pattern" });
  const spinnerSize = useBreakpointValue({ base: "lg", md: "xl" });
  const mainHeadingSize = useBreakpointValue({ base: "sm", md: "md" });
  const subHeadingSize = useBreakpointValue({ base: "xs", md: "sm" });
  const featureHeadingSize = useBreakpointValue({ base: "xs", md: "sm" });
  const progressHeight = useBreakpointValue({ base: "6px", sm: "8px", md: "12px" });
  const radarOuterRadius = useBreakpointValue({ base: "60%", sm: "65%", md: "70%", lg: "80%" });
  const radarFontSize = useBreakpointValue({ base: 8, sm: 10, md: 12 });
  const radarTickCount = useBreakpointValue({ base: 2, sm: 3, md: 5 });
  
  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const lightBg = useColorModeValue('gray.50', 'gray.700');
  
  const redBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.15)');
  const greenBg = useColorModeValue('green.50', 'rgba(154, 230, 180, 0.15)');
  const redText = useColorModeValue('red.600', 'red.200');
  const greenText = useColorModeValue('green.600', 'green.200');
  
  const positiveBarColor = useColorModeValue('#E53E3E', '#FC8181');
  const negativeBarColor = useColorModeValue('#38A169', '#68D391');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisTextColor = useColorModeValue('#2D3748', '#CBD5E0');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const progressVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { 
      width: "100%", 
      opacity: 1,
      transition: { 
        duration: 1.2, 
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.175, 0.885, 0.32, 1],
        delay: 0.5 
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.7 }
    }
  };

  const getFeatureExplanationText = (feature) => {
    const explanations = {
      'Age': 'Age is a non-modifiable risk factor. Advanced age correlates with increased heart disease risk due to natural changes in heart and blood vessels over time.',
      'Blood Pressure': 'High blood pressure forces your heart to work harder, increasing risk. Values above 130 mmHg may indicate hypertension that should be managed.',
      'Cholesterol': 'Elevated cholesterol can lead to plaque buildup in arteries. Levels above 200 mg/dL increase risk and may require dietary changes or medication.',
      'Max Heart Rate': 'Maximum heart rate during exercise can indicate cardiovascular fitness. Lower values may suggest reduced heart function.',
      'ST Depression': 'ST depression on an ECG indicates abnormal heart activity. Greater depression suggests more significant heart strain or reduced blood flow.',
      'Exercise Angina': 'Chest pain during exercise strongly suggests reduced blood flow to the heart muscle and is a significant predictor of coronary artery disease.',
      'Chest Pain Type': 'Different types of chest pain indicate varying levels of heart disease risk. Asymptomatic chest pain or typical angina can be associated with higher risk.'
    };
    
    return explanations[feature] || 'This feature contributes to your heart disease risk assessment.';
  };

  const generateShapValues = useCallback(async (predictionData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (predictionData && predictionData.inputs) {
        try {
          console.log('Fetching SHAP explanations from API with inputs:', predictionData.inputs);
          const response = await getFeatureExplanation(predictionData.inputs);
          
          if (response?.success && response?.data?.features && response.data.features.length > 0) {
            console.log('Received valid SHAP values from API:', response.data.features);
            setShapValues(response.data.features);
            setIsUsingRealData(true);
            setLoading(false);
            return;
          } else {
            console.warn('API returned success but no valid feature data');
            throw new Error('No valid feature data received');
          }
        } catch (apiError) {
          console.warn('Could not fetch SHAP values from API:', apiError);
          toast({
            title: "Using estimated feature importance",
            description: "We couldn't connect to our explanation service. Showing approximate values instead.",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      if (!predictionData || !predictionData.inputs) {
        throw new Error('Invalid prediction data');
      }
      
      const inputs = predictionData.inputs;
      setIsUsingRealData(false);
      
      const mockShapValues = [
        {
          feature: 'Age',
          value: inputs.age || 60,
          shap_value: inputs.age > 50 ? 0.15 : -0.12,
          impact: inputs.age > 50 ? 'high' : 'medium',
          direction: inputs.age > 50 ? 'positive' : 'negative'
        },
        {
          feature: 'Blood Pressure',
          value: inputs.trestbps || 130,
          shap_value: inputs.trestbps > 130 ? 0.18 : -0.09,
          impact: inputs.trestbps > 140 ? 'high' : 'medium',
          direction: inputs.trestbps > 130 ? 'positive' : 'negative'
        },
        {
          feature: 'Cholesterol',
          value: inputs.chol || 230,
          shap_value: inputs.chol > 240 ? 0.21 : -0.05,
          impact: inputs.chol > 240 ? 'high' : 'low',
          direction: inputs.chol > 240 ? 'positive' : 'negative'
        },
        {
          feature: 'Max Heart Rate',
          value: inputs.thalach || 160,
          shap_value: (inputs.thalach || 160) < 150 ? 0.14 : -0.11,
          impact: (inputs.thalach || 160) < 140 ? 'high' : 'medium',
          direction: (inputs.thalach || 160) < 150 ? 'positive' : 'negative'
        },
        {
          feature: 'ST Depression',
          value: inputs.oldpeak || 1.2,
          shap_value: (inputs.oldpeak || 1.2) > 1.0 ? 0.17 : -0.08,
          impact: (inputs.oldpeak || 1.2) > 1.5 ? 'high' : 'medium',
          direction: (inputs.oldpeak || 1.2) > 1.0 ? 'positive' : 'negative'
        },
        {
          feature: 'Exercise Angina',
          value: inputs.exang === 1 ? 'Yes' : 'No',
          shap_value: inputs.exang === 1 ? 0.25 : -0.15,
          impact: inputs.exang === 1 ? 'high' : 'medium',
          direction: inputs.exang === 1 ? 'positive' : 'negative'
        },
        {
          feature: 'Chest Pain Type',
          value: inputs.cp === 0 ? 'Typical Angina' : 
                 inputs.cp === 1 ? 'Atypical Angina' : 
                 inputs.cp === 2 ? 'Non-anginal Pain' : 'Asymptomatic',
          shap_value: inputs.cp === 0 ? 0.12 : 
                      inputs.cp === 1 ? 0.08 : 
                      inputs.cp === 2 ? -0.05 : 0.19,
          impact: inputs.cp === 0 || inputs.cp === 3 ? 'high' : 'medium',
          direction: inputs.cp === 2 ? 'negative' : 'positive'
        }
      ];
      
      mockShapValues.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
      
      console.log("Using fallback SHAP values:", mockShapValues);
      setShapValues(mockShapValues);
      setLoading(false);
    } catch (error) {
      console.error('Error generating SHAP values:', error);
      setError('Could not generate feature explanations');
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    console.log("ShapExplanation received data:", predictionData);
    if (predictionData) {
      generateShapValues(predictionData);
    }
  }, [predictionData, generateShapValues]);

  // Prepare data for bar chart with improved mobile handling
  const prepareBarChartData = () => {
    // Show fewer features on mobile to prevent overcrowding
    let maxFeatures = isTiny ? 3 : (isMobile ? 5 : shapValues.length);
    let shapValuesToShow = shapValues.slice(0, maxFeatures);
    
    return shapValuesToShow.map(feature => ({
      name: isMobile && feature.feature.length > (isTiny ? 8 : 10) 
        ? feature.feature.substring(0, isTiny ? 6 : 8) + '..' 
        : feature.feature,
      fullName: feature.feature,
      impact: feature.shap_value * 100,
      color: feature.direction === 'positive' ? positiveBarColor : negativeBarColor
    }));
  };

  // Prepare data for radar chart with dynamic feature limit
  const prepareRadarChartData = () => {
    // Dynamic feature limit based on screen size
    const radarData = shapValues.slice(0, maxFeaturesInRadar).map(feature => ({
      feature: isMobile && feature.feature.length > (isTiny ? 6 : 8) 
        ? feature.feature.substring(0, isTiny ? 4 : 6) + '..' 
        : feature.feature,
      impact: Math.abs(feature.shap_value) * 100,
      fullMark: 30
    }));
    
    const formattedData = [];
    radarData.forEach(item => {
      formattedData.push({
        subject: item.feature,
        A: item.impact,
        fullMark: item.fullMark
      });
    });
    
    return formattedData;
  };

  if (loading) {
    return (
      <MotionBox 
        textAlign="center" 
        p={{ base: 3, md: 5 }} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mobile-center"
      >
        <Spinner 
          size={spinnerSize} 
          color="blue.500" 
          thickness="4px" 
          speed="0.8s"
        />
        <MotionText 
          mt={2} 
          color={textColor}
          fontSize={{ base: "sm", md: "md" }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Analyzing your health factors...
        </MotionText>
      </MotionBox>
    );
  }

  if (error) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        px={{ base: 2, md: 0 }}
      >
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <Text fontSize={{ base: "sm", md: "md" }}>
              {error}
            </Text>
          </Box>
        </Alert>
      </MotionBox>
    );
  }

  if (!shapValues || shapValues.length === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        px={{ base: 2, md: 0 }}
      >
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontSize={{ base: "sm", md: "md" }}>
            No feature explanations are available at this time. Please try again later.
          </Text>
        </Alert>
      </MotionBox>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <MotionBox 
        as={VStack} 
        spacing={{ base: 4, md: 6 }} 
        align="stretch"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        width="100%"
        px={{ base: 2, md: 0 }}
      >
        <MotionBox variants={fadeInVariants}>
          <MotionHeading 
            size={mainHeadingSize}
            mb={2} 
            color={textColor} 
            display="flex" 
            alignItems="center"
            variants={headingVariants}
            className="mobile-text-optimize"
          >
            <Icon as={FaChartBar} mr={2} color="blue.500" />
            Feature Importance Analysis
          </MotionHeading>
          <MotionText 
            mb={4} 
            color={secondaryTextColor}
            fontSize={{ base: "xs", md: "sm" }}
            variants={fadeInVariants}
            className="mobile-text-optimize"
          >
            This explanation shows how each health factor contributes to your heart disease risk prediction.
            Positive values (red) increase risk, while negative values (green) decrease risk.
          </MotionText>
          
          {!isUsingRealData && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: 1, 
                height: "auto",
                transition: { duration: 0.5 }
              }}
            >
              <Alert status="info" mb={4} borderRadius="md" variant="left-accent">
                <AlertIcon />
                <Text fontSize={{ base: "xs", md: "sm" }} className="mobile-text-optimize">
                  We're showing estimated feature importance. For more accurate analysis, please try again later.
                </Text>
              </Alert>
            </MotionBox>
          )}
        </MotionBox>
        
        <MotionBox
          variants={chartVariants}
          p={{ base: 2, sm: 3, md: 4 }}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          boxShadow="sm"
          height={`${chartHeight}px`}
          minHeight={{ base: "200px", sm: "220px" }}
          whileHover={{ 
            boxShadow: "0px 10px 15px -5px rgba(0, 0, 0, 0.1)",
            y: -2,
            transition: { duration: 0.2 }
          }}
          ref={chartContainerRef}
          overflow="hidden"
          className="responsive-chart"
        >
          <MotionHeading 
            size={subHeadingSize}
            mb={{ base: 2, md: 4 }} 
            color={textColor} 
            variants={headingVariants}
            className="mobile-text-optimize"
          >
            Feature Impact on Risk Prediction
          </MotionHeading>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart 
              data={prepareBarChartData()} 
              layout="vertical"
              margin={chartMargins}
              className="feature-impact-chart"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis
                type="number"
                tick={{ 
                  fill: axisTextColor, 
                  fontSize: isTiny ? 8 : (isMobile ? 10 : 12) 
                }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={[-30, 30]}
                tickCount={isMobile ? 3 : 5}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ 
                  fill: axisTextColor, 
                  fontSize: isTiny ? 8 : (isMobile ? 10 : 12) 
                }}
                width={yAxisWidth}
                className="responsive-chart-label"
              />
              <RechartsTooltip 
                formatter={(value) => [`${Math.abs(value).toFixed(1)}%`, 'Impact']}
                labelFormatter={(name) => {
                  const item = prepareBarChartData().find(i => i.name === name);
                  return item ? item.fullName : name;
                }}
                labelStyle={{ color: textColor }}
                contentStyle={{ 
                  backgroundColor: bgColor, 
                  borderColor: borderColor,
                  color: textColor,
                  fontSize: isMobile ? '10px' : '12px',
                  padding: isMobile ? '2px 4px' : '5px 10px',
                }}
                animationDuration={300}
              />
              <Bar 
                dataKey="impact" 
                fill={(entry) => entry.color} 
                animationDuration={1500}
                animationEasing="ease-out"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </MotionBox>
        
        <MotionBox variants={fadeInVariants}>
          <MotionHeading 
            size={subHeadingSize}
            mb={{ base: 2, md: 3 }} 
            color={textColor} 
            variants={headingVariants}
            className="mobile-text-optimize"
          >
            Detailed Feature Analysis
          </MotionHeading>
          
          <SimpleGrid columns={gridColumns} spacing={{ base: 3, md: 4 }}>
            {shapValues.map((feature, index) => {
              const isPositive = feature.direction === 'positive';
              const color = isPositive ? 'red' : 'green';
              const bgColorValue = isPositive ? redBg : greenBg;
              const textColorValue = isPositive ? redText : greenText;
              const iconComponent = isPositive ? FaArrowUp : (feature.direction === 'negative' ? FaArrowDown : FaEquals);
              const absValue = Math.abs(feature.shap_value);
              const isActive = activeFeature === index;
              
              return (
                <MotionBox 
                  key={index} 
                  p={featureCardPadding}
                  borderWidth="1px" 
                  borderRadius="md" 
                  borderColor={borderColor}
                  bg={bgColorValue}
                  variants={featureCardVariants}
                  custom={index}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.08)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFeature(isActive ? null : index)}
                  cursor="pointer"
                  className="feature-card-responsive"
                >
                  <SimpleGrid columns={{ base: 1, sm: isActive ? 1 : 2 }} spacing={{ base: 2, md: 4 }}>
                    <VStack align="start" spacing={1}>
                      <HStack flexWrap="wrap">
                        <MotionHeading 
                          size={featureHeadingSize}
                          color={textColor}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 + (index * 0.05) }}
                          mr={1}
                          className="feature-name"
                          noOfLines={1}
                        >
                          {feature.feature}
                        </MotionHeading>
                        <MotionBox
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            transition: { delay: 0.2 + (index * 0.05), duration: 0.3 }
                          }}
                        >
                          <Badge colorScheme={color} borderRadius="full" px={2} fontSize="xs">
                            <Icon as={iconComponent} mr={1} boxSize={isTiny ? "1" : "2"} />
                            {isTiny ? (
                              feature.impact === 'high' ? 'Strong' : 
                              feature.impact === 'medium' ? 'Medium' : 'Low'
                            ) : (
                              feature.impact === 'high' ? 'Strong impact' : 
                              feature.impact === 'medium' ? 'Moderate impact' : 'Weak impact'
                            )}
                          </Badge>
                        </MotionBox>
                      </HStack>
                      <MotionText 
                        fontSize={{ base: "xs", md: "sm" }}
                        color={textColor}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + (index * 0.05) }}
                        className="feature-value"
                      >
                        Your value: {feature.value}
                      </MotionText>
                      <MotionText 
                        fontSize={{ base: "xs", md: "sm" }}
                        fontStyle="italic" 
                        color={textColorValue}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + (index * 0.05) }}
                        className="mobile-text-optimize"
                      >
                        {isPositive 
                          ? `This increases your heart disease risk.` 
                          : `This decreases your heart disease risk.`}
                      </MotionText>
                      
                      <Collapse in={isActive || !isMobile} animateOpacity>
                        <MotionText 
                          fontSize={{ base: "xs", md: "sm" }}
                          mt={2} 
                          fontWeight="normal" 
                          color={textColor}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + (index * 0.05) }}
                          className="mobile-text-optimize"
                        >
                          {getFeatureExplanationText(feature.feature)}
                        </MotionText>
                      </Collapse>
                      
                      {isMobile && !isActive && (
                        <Text fontSize="xs" color="blue.500" mt={1} className="mobile-touch-target">
                          <Icon as={FaInfoCircle} boxSize={3} mr={1} />
                          Tap for more info
                        </Text>
                      )}
                    </VStack>
                    
                    <Box>
                      <MotionText 
                        mb={1} 
                        textAlign={{ base: "left", sm: "right" }}
                        fontSize={{ base: "xs", md: "sm" }}
                        color={secondaryTextColor}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + (index * 0.05) }}
                        className="mobile-text-optimize"
                      >
                        Impact Strength
                      </MotionText>
                      <MotionBox 
                        initial="hidden" 
                        animate="visible" 
                        variants={progressVariants}
                        custom={index}
                      >
                        <Progress 
                          value={absValue * 100} 
                          max={0.3 * 100} 
                          colorScheme={color}
                          height={progressHeight}
                          borderRadius="full"
                          boxShadow="0px 1px 4px rgba(0,0,0,0.05)"
                        />
                      </MotionBox>
                      
                      <Collapse in={isActive || !isMobile}>
                        {(feature.feature === 'Blood Pressure' || 
                          feature.feature === 'Cholesterol' || 
                          feature.feature === 'Exercise Angina') && isPositive && (
                          <MotionText 
                            fontSize={{ base: "xs", md: "sm" }}
                            mt={3} 
                            fontWeight="medium" 
                            color={textColorValue}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { delay: 0.7 + (index * 0.05), duration: 0.5 }
                            }}
                            className="mobile-text-optimize"
                          >
                            Recommendation: Discuss with your doctor about ways to improve this risk factor.
                          </MotionText>
                        )}
                      </Collapse>
                    </Box>
                  </SimpleGrid>
                </MotionBox>
              );
            })}
          </SimpleGrid>
        </MotionBox>
        
        <MotionBox
          variants={chartVariants}
          p={{ base: 2, sm: 3, md: 4 }}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          boxShadow="sm"
          mt={{ base: 2, md: 4 }}
          height={`${radarChartHeight}px`}
          minHeight={{ base: "220px", sm: "250px" }}
          whileHover={{ 
            boxShadow: "0px 10px 25px -5px rgba(0, 0, 0, 0.1)",
            y: -3,
            transition: { duration: 0.2 }
          }}
          className="shap-radar-chart"
        >
          <MotionHeading 
            size={subHeadingSize}
            mb={{ base: 2, md: 4 }} 
            color={textColor} 
            variants={headingVariants}
            className="mobile-text-optimize"
          >
            {topRadarHeadingText}
          </MotionHeading>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart 
              outerRadius={radarOuterRadius} 
              data={prepareRadarChartData()}
            >
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: axisTextColor,
                  fontSize: radarFontSize
                }} 
                className="responsive-chart-label"
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 30]} 
                tick={{ 
                  fill: axisTextColor,
                  fontSize: radarFontSize
                }}
                tickCount={radarTickCount}
                className="responsive-chart-label"
              />
              <Radar
                name="Feature Impact"
                dataKey="A"
                stroke={useColorModeValue("#3182CE", "#63B3ED")}
                fill={useColorModeValue("#3182CE", "#63B3ED")}
                fillOpacity={0.6}
                animationDuration={2000}
                animationEasing="ease-out"
              />
              <Legend 
                wrapperStyle={{ 
                  color: textColor,
                  backgroundColor: bgColor,
                  fontSize: radarFontSize
                }}
              />
              <RechartsTooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Impact']}
                contentStyle={{ 
                  backgroundColor: bgColor, 
                  borderColor: borderColor,
                  color: textColor,
                  fontSize: isMobile ? '10px' : '12px',
                  padding: isMobile ? '2px 4px' : '5px 10px',
                }}
                animationDuration={300}
              />
            </RadarChart>
          </ResponsiveContainer>
        </MotionBox>
      </MotionBox>
    </AnimatePresence>
  );
};

export default ShapExplanation;
