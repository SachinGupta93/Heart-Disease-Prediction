import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, FormControl, FormLabel, FormHelperText, Input, Select,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Heading, Text, VStack, HStack, Radio, RadioGroup,
  Tooltip, Icon, Flex, Spacer, useColorModeValue, Divider,
  Alert, AlertIcon, Progress, SimpleGrid, useToast, Slider, SliderTrack,
  SliderFilledTrack, SliderThumb, Collapse, InputGroup, InputLeftAddon,
  InputRightAddon, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, Badge, Card, CardBody, Center
} from '@chakra-ui/react';
import { 
  InfoIcon, 
  CheckIcon, 
  WarningIcon, 
  QuestionIcon, 
  ChevronRightIcon,
  CloseIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { 
  FaHeartbeat, 
  FaWeight, 
  FaRulerVertical, 
  FaChild, 
  FaRestroom, 
  FaRunning, 
  FaSmokingBan,
  FaVenusMars,
  FaHeart,
  FaStethoscope,
  FaTint,
  FaHospital,
  FaFlask,
  FaCalculator,
  FaCapsules,
  FaChartLine,
  FaEye,
  FaExclamationCircle,
  FaHospitalUser,
  FaUserMd,
  FaClock,
  FaEraser,
  FaArrowRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { usePrediction } from '../contexts/PredictionContext';
import { useAuth } from '../contexts/AuthContext';
import { getEnsemblePrediction, savePrediction } from '../services/api';
import ModelSelector from './ModelSelector';

// Create motion components for animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Component for form field info tooltips with animation
const FieldInfoTooltip = ({ label, info }) => (
  <Tooltip 
    hasArrow 
    label={info} 
    placement="top" 
    bg="blue.700" 
    color="white"
    borderRadius="md"
    px={3}
    py={2}
    openDelay={300}
  >
    <Icon 
      as={InfoIcon} 
      ml={1} 
      w={3.5} 
      h={3.5} 
      color="blue.500" 
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.2)' }}
    />
  </Tooltip>
);

// Risk level indicators with clearer labels for patients
const riskLevels = [
  { value: 'Low Risk', color: 'green', range: 'Less than 30%', icon: FaHeartbeat },
  { value: 'Moderate Risk', color: 'orange', range: '30% to 70%', icon: FaHeartbeat },
  { value: 'High Risk', color: 'red', range: 'Greater than 70%', icon: FaHeartbeat }
];

// Form field icons mapping
const fieldIcons = {
  age: FaChild,
  sex: FaVenusMars,
  cp: FaHeart,
  trestbps: FaTint,
  chol: FaFlask,
  fbs: FaCapsules,
  restecg: FaChartLine,
  thalach: FaClock,
  exang: FaRunning,
  oldpeak: FaStethoscope,
  slope: FaChartLine,
  ca: FaHospital,
  thal: FaHospitalUser
};

const PredictionForm = () => {
  const toast = useToast();
  const { updatePrediction } = usePrediction();
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Add navigation hook
  
  // States
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    restecg: '',
    thalach: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formCompletion, setFormCompletion] = useState(0);
  const [selectedModel, setSelectedModel] = useState('ensemble'); // Default to ensemble
  
  // Enhanced color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tooltipBg = useColorModeValue('blue.700', 'blue.200');
  const tooltipColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const fieldBg = useColorModeValue('gray.50', 'gray.600');
  const progressTrackBg = useColorModeValue('gray.100', 'gray.600');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  
  // Form field descriptions
  const fieldDescriptions = {
    age: 'Your current age in years',
    sex: 'Biological sex at birth',
    cp: 'The type of chest pain or discomfort you experience, if any',
    trestbps: 'Your resting blood pressure in mm Hg, measured when youre not physically active',
    chol: 'Total cholesterol level in mg/dl from your most recent blood test',
    fbs: 'Whether your fasting blood sugar is greater than 120 mg/dl',
    restecg: 'Results from your resting electrocardiogram',
    thalach: 'Your maximum heart rate achieved during exercise',
    exang: 'Whether you experience angina (chest pain) during exercise',
    oldpeak: 'ST depression induced by exercise relative to rest (measured in mm)',
    slope: 'The slope of the peak exercise ST segment on your ECG',
    ca: 'Number of major blood vessels colored by fluoroscopy',
    thal: 'Results from your thallium stress test'
  };
  
  // Form field guides for patients
  const fieldGuides = {
    trestbps: 'Normal range is typically below 120/80 mm Hg. Higher values may indicate hypertension.',
    chol: 'Desirable levels are below 200 mg/dl. Values of 200-239 mg/dl are borderline high.',
    thalach: 'For adults, max heart rate is typically calculated as 220 minus your age.',
    oldpeak: 'This measures ST depression induced by exercise. Higher values may indicate ischemia.'
  };
  
  // Calculate form completion percentage
  useEffect(() => {
    const requiredFields = ['age', 'sex', 'cp', 'trestbps', 'chol', 'thalach', 'exang'];
    const filledRequiredFields = requiredFields.filter(field => formData[field] !== '').length;
    const completionPercentage = (filledRequiredFields / requiredFields.length) * 100;
    setFormCompletion(completionPercentage);
  }, [formData]);
  
  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Handle number input change
  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Required fields
    const requiredFields = ['age', 'sex', 'cp', 'trestbps', 'chol', 'thalach', 'exang'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });
    
    // Age validation
    if (formData.age && (formData.age < 20 || formData.age > 100)) {
      errors.age = 'Age must be between 20 and 100';
      isValid = false;
    }
    
    // Blood pressure validation
    if (formData.trestbps && (formData.trestbps < 80 || formData.trestbps > 200)) {
      errors.trestbps = 'Blood pressure must be between 80 and 200 mm Hg';
      isValid = false;
    }
    
    // Cholesterol validation
    if (formData.chol && (formData.chol < 100 || formData.chol > 600)) {
      errors.chol = 'Cholesterol must be between 100 and 600 mg/dl';
      isValid = false;
    }
    
    // Max heart rate validation
    if (formData.thalach && (formData.thalach < 60 || formData.thalach > 220)) {
      errors.thalach = 'Max heart rate must be between 60 and 220 bpm';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: 'Form validation error',
        description: 'Please correct the errors in the form.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // If using ensemble, use the ensemble endpoint
      if (selectedModel === 'ensemble') {
        const response = await getEnsemblePrediction(formData);
        
        // Check if response is a fallback
        if (response.data?.is_fallback) {
          toast({
            title: 'Using fallback prediction',
            description: 'The server is taking too long to respond. Using a local estimation.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
        
        // Save prediction data to context
        updatePrediction({
          inputs: formData,
          prediction: response.data?.primary_prediction?.prediction || 0,
          probability: response.data?.primary_prediction?.probability || 0,
          risk_level: response.data?.primary_prediction?.risk_level || determineRiskLevel(0),
          model: response.data?.primary_prediction?.model || 'ensemble',
          is_fallback: response.data?.is_fallback || false
        });
        
        // If user is logged in, save prediction
        if (currentUser) {
          try {
            await savePrediction({
              user_id: currentUser.uid,
              inputs: formData,
              prediction: response.data?.primary_prediction?.prediction || 0,
              probability: response.data?.primary_prediction?.probability || 0,
              risk_level: response.data?.primary_prediction?.risk_level || determineRiskLevel(0),
              model: response.data?.primary_prediction?.model || 'ensemble',
              is_fallback: response.data?.is_fallback || false
            });
          } catch (saveError) {
            console.error('Error saving prediction:', saveError);
          }
        }
        
        toast({
          title: 'Analysis complete',
          description: 'Your heart disease risk assessment is ready.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Navigate to the prediction result page
        navigate('/prediction-result');
      } else {
        toast({
          title: 'Feature coming soon',
          description: 'Individual model selection is coming soon!',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error making prediction:', err);
      toast({
        title: 'Error',
        description: 'Could not get prediction results. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Determine risk level based on probability
  const determineRiskLevel = (probability) => {
    const prob = parseFloat(probability);
    if (prob < 0.3) return 'Low Risk';
    if (prob < 0.7) return 'Moderate Risk';
    return 'High Risk';
  };
  
  // Helper function for field completion styling
  const getFieldStatus = (fieldName) => {
    if (formErrors[fieldName]) return 'error';
    if (formData[fieldName]) return 'filled';
    return 'empty';
  };
  
  return (
    <MotionBox
      as="form" 
      onSubmit={handleSubmit} 
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      boxShadow="sm"
      bg={cardBg}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      position="relative"
    >
      <VStack spacing={5} align="stretch">
        <MotionFlex 
          align="center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Box>
            <Heading size="lg" color={headingColor} display="flex" alignItems="center">
              <Icon as={FaHeartbeat} w={6} h={6} mr={3} color="red.500" /> 
              Heart Health Assessment
            </Heading>
            <Text mt={2} color={secondaryText}>
              Complete the form below to assess your heart disease risk
            </Text>
          </Box>
          <Spacer />
          <Button 
            size="sm" 
            colorScheme="blue" 
            variant="outline"
            leftIcon={<InfoIcon />}
            onClick={() => setShowGuidance(!showGuidance)}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'sm',
            }}
            transition="all 0.2s"
          >
            {showGuidance ? 'Hide Guidance' : 'Show Guidance'}
          </Button>
        </MotionFlex>
        
        <Collapse in={showGuidance} animateOpacity>
          <Alert 
            status="info" 
            borderRadius="md" 
            mb={4}
            variant="solid"
            bg={highlightBg}
            color={secondaryText}
          >
            <AlertIcon color="blue.500" />
            <Box>
              <Text fontWeight="medium" color={headingColor}>Need help with this form?</Text>
              <Text fontSize="sm" mt={1}>
                This assessment uses medical data to estimate your heart disease risk. 
                If you don't know some values, try to provide your best estimate or consult recent medical records.
              </Text>
              <Text fontSize="sm" mt={2} fontWeight="medium">
                Fields marked with <Text as="span" color="red.500">*</Text> are required to generate a prediction.
              </Text>
            </Box>
          </Alert>
        </Collapse>
        
        <Box 
          p={4} 
          borderRadius="md" 
          bg={highlightBg}
          borderLeft="4px solid"
          borderColor="blue.500"
        >
          <Flex align="center" justify="space-between">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color={headingColor}>Form Completion</Text>
              <Progress 
                value={formCompletion} 
                colorScheme={
                  formCompletion < 50 ? "red" : 
                  formCompletion < 100 ? "orange" : 
                  "green"
                }
                borderRadius="full"
                size="sm"
                w="200px"
                bg={progressTrackBg}
              />
            </Box>
            <Flex align="center" gap={2}>
              <Box 
                p={2} 
                borderRadius="full" 
                bg={
                  formCompletion < 50 ? "red.100" : 
                  formCompletion < 100 ? "orange.100" : 
                  "green.100"
                }
              >
                <Icon 
                  as={
                    formCompletion < 50 ? FaExclamationCircle : 
                    formCompletion < 100 ? WarningIcon : 
                    CheckIcon
                  } 
                  color={
                    formCompletion < 50 ? "red.500" : 
                    formCompletion < 100 ? "orange.500" : 
                    "green.500"
                  }
                  w={5}
                  h={5}
                />
              </Box>
              <Badge 
                fontSize="md" 
                px={2} 
                py={1} 
                borderRadius="md" 
                colorScheme={
                  formCompletion < 50 ? "red" : 
                  formCompletion < 100 ? "orange" : 
                  "green"
                }
              >
                {formCompletion.toFixed(0)}% Complete
              </Badge>
            </Flex>
          </Flex>
        </Box>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 10 }} mt={4}>
          {/* Personal Information Section */}
          <MotionBox
            p={5} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={cardBg}
            boxShadow="sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Flex align="center" mb={6}>
              <Icon as={FaUserMd} w={6} h={6} color={headingColor} mr={3} />
              <Heading size="md" color={headingColor}>Personal Information</Heading>
            </Flex>
            
            <VStack spacing={6} align="stretch">
              {/* Age */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.age}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.age} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Age</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.age} />
                  {getFieldStatus('age') === 'filled' && !formErrors.age && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <NumberInput 
                  min={20} 
                  max={100} 
                  value={formData.age} 
                  onChange={(v) => handleNumberChange('age', v)}
                  bg={fieldBg}
                >
                  <NumberInputField 
                    name="age" 
                    placeholder="Enter your age" 
                    borderColor={
                      formErrors.age ? 'red.500' : 
                      getFieldStatus('age') === 'filled' ? 'green.500' : 
                      borderColor
                    }
                    _hover={{ borderColor: 'blue.300' }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {formErrors.age && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.age}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Sex */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.sex}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.sex} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Sex</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.sex} />
                  {getFieldStatus('sex') === 'filled' && !formErrors.sex && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <RadioGroup 
                  onChange={(v) => handleNumberChange('sex', v)} 
                  value={formData.sex}
                >
                  <HStack spacing={5} bg={fieldBg} p={3} borderRadius="md">
                    <Radio 
                      value="1"
                      colorScheme="blue"
                      size="lg"
                      isChecked={formData.sex === "1"}
                    >
                      <Flex align="center">
                        <Icon as={FaVenusMars} mr={2} color="blue.500" />
                        Male
                      </Flex>
                    </Radio>
                    <Radio 
                      value="0"
                      colorScheme="pink"
                      size="lg"
                      isChecked={formData.sex === "0"}
                    >
                      <Flex align="center">
                        <Icon as={FaVenusMars} mr={2} color="pink.500" />
                        Female
                      </Flex>
                    </Radio>
                  </HStack>
                </RadioGroup>
                {formErrors.sex && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.sex}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Chest Pain Type */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.cp}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.cp} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Chest Pain Type</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.cp} />
                  {getFieldStatus('cp') === 'filled' && !formErrors.cp && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <Select 
                  name="cp" 
                  placeholder="Select chest pain type" 
                  value={formData.cp} 
                  onChange={handleChange}
                  bg={fieldBg}
                  borderColor={
                    formErrors.cp ? 'red.500' : 
                    getFieldStatus('cp') === 'filled' ? 'green.500' : 
                    borderColor
                  }
                  _hover={{ borderColor: 'blue.300' }}
                  icon={<ChevronRightIcon />}
                >
                  <option value="0">Typical Angina</option>
                  <option value="1">Atypical Angina</option>
                  <option value="2">Non-anginal Pain</option>
                  <option value="3">Asymptomatic</option>
                </Select>
                {formErrors.cp && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.cp}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Exercise Induced Angina */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.exang}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.exang} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Exercise Induced Angina</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.exang} />
                  {getFieldStatus('exang') === 'filled' && !formErrors.exang && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <RadioGroup 
                  onChange={(v) => handleNumberChange('exang', v)} 
                  value={formData.exang}
                >
                  <HStack spacing={5} bg={fieldBg} p={3} borderRadius="md">
                    <Radio 
                      value="1"
                      colorScheme="red"
                      size="lg"
                      isChecked={formData.exang === "1"}
                    >
                      <Flex align="center">
                        <Icon as={FaHeart} mr={2} color="red.500" />
                        Yes
                      </Flex>
                    </Radio>
                    <Radio 
                      value="0"
                      colorScheme="green"
                      size="lg"
                      isChecked={formData.exang === "0"}
                    >
                      <Flex align="center">
                        <Icon as={FaHeart} mr={2} color="green.500" />
                        No
                      </Flex>
                    </Radio>
                  </HStack>
                </RadioGroup>
                {formErrors.exang && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.exang}
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          </MotionBox>
          
          {/* Health Metrics Section */}
          <MotionBox 
            p={5} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={cardBg}
            boxShadow="sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Flex align="center" mb={6}>
              <Icon as={FaStethoscope} w={6} h={6} color={headingColor} mr={3} />
              <Heading size="md" color={headingColor}>Health Metrics</Heading>
            </Flex>
            
            <VStack spacing={6} align="stretch">
              {/* Resting Blood Pressure */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.trestbps}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.trestbps} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Resting Blood Pressure</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.trestbps} />
                  {getFieldStatus('trestbps') === 'filled' && !formErrors.trestbps && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <InputGroup>
                  <NumberInput 
                    min={80} 
                    max={200} 
                    w="100%"
                    value={formData.trestbps} 
                    onChange={(v) => handleNumberChange('trestbps', v)}
                    bg={fieldBg}
                  >
                    <NumberInputField 
                      name="trestbps" 
                      placeholder="Enter systolic value" 
                      borderColor={
                        formErrors.trestbps ? 'red.500' : 
                        getFieldStatus('trestbps') === 'filled' ? 'green.500' : 
                        borderColor
                      }
                      _hover={{ borderColor: 'blue.300' }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon 
                    children="mm Hg" 
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    color={headingColor}
                    fontWeight="medium"
                    px={4}
                  />
                </InputGroup>
                {formErrors.trestbps ? (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.trestbps}
                  </FormHelperText>
                ) : (
                  <FormHelperText fontSize="xs" color={secondaryText}>
                    <Icon as={InfoIcon} mr={1} color="blue.500" />
                    {fieldGuides.trestbps}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Cholesterol */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.chol}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.chol} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Serum Cholesterol</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.chol} />
                  {getFieldStatus('chol') === 'filled' && !formErrors.chol && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <InputGroup>
                  <NumberInput 
                    min={100} 
                    max={600} 
                    w="100%"
                    value={formData.chol} 
                    onChange={(v) => handleNumberChange('chol', v)}
                    bg={fieldBg}
                  >
                    <NumberInputField 
                      name="chol" 
                      placeholder="Enter cholesterol level" 
                      borderColor={
                        formErrors.chol ? 'red.500' : 
                        getFieldStatus('chol') === 'filled' ? 'green.500' : 
                        borderColor
                      }
                      _hover={{ borderColor: 'blue.300' }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon 
                    children="mg/dl" 
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    color={headingColor}
                    fontWeight="medium"
                    px={4}
                  />
                </InputGroup>
                {formErrors.chol ? (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.chol}
                  </FormHelperText>
                ) : (
                  <FormHelperText fontSize="xs" color={secondaryText}>
                    <Icon as={InfoIcon} mr={1} color="blue.500" />
                    {fieldGuides.chol}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Fasting Blood Sugar */}
              <FormControl 
                isInvalid={!!formErrors.fbs}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.fbs} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Fasting Blood Sugar {'>'} 120 mg/dl</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.fbs} />
                  {getFieldStatus('fbs') === 'filled' && !formErrors.fbs && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <RadioGroup 
                  onChange={(v) => handleNumberChange('fbs', v)} 
                  value={formData.fbs}
                >
                  <HStack spacing={5} bg={fieldBg} p={3} borderRadius="md">
                    <Radio 
                      value="1"
                      colorScheme="purple"
                      size="lg"
                      isChecked={formData.fbs === "1"}
                    >
                      <Flex align="center">
                        <Icon as={FaFlask} mr={2} color="purple.500" />
                        Yes
                      </Flex>
                    </Radio>
                    <Radio 
                      value="0"
                      colorScheme="green"
                      size="lg"
                      isChecked={formData.fbs === "0"}
                    >
                      <Flex align="center">
                        <Icon as={FaFlask} mr={2} color="green.500" />
                        No
                      </Flex>
                    </Radio>
                  </HStack>
                </RadioGroup>
                {formErrors.fbs && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.fbs}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Maximum Heart Rate */}
              <FormControl 
                isRequired 
                isInvalid={!!formErrors.thalach}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.thalach} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Maximum Heart Rate</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.thalach} />
                  {getFieldStatus('thalach') === 'filled' && !formErrors.thalach && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <InputGroup>
                  <NumberInput 
                    min={60} 
                    max={220} 
                    w="100%"
                    value={formData.thalach} 
                    onChange={(v) => handleNumberChange('thalach', v)}
                    bg={fieldBg}
                  >
                    <NumberInputField 
                      name="thalach" 
                      placeholder="Enter maximum heart rate" 
                      borderColor={
                        formErrors.thalach ? 'red.500' : 
                        getFieldStatus('thalach') === 'filled' ? 'green.500' : 
                        borderColor
                      }
                      _hover={{ borderColor: 'blue.300' }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon 
                    children="bpm" 
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    color={headingColor}
                    fontWeight="medium"
                    px={4}
                  />
                </InputGroup>
                {formErrors.thalach ? (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.thalach}
                  </FormHelperText>
                ) : (
                  <FormHelperText fontSize="xs" color={secondaryText}>
                    <Icon as={InfoIcon} mr={1} color="blue.500" />
                    {fieldGuides.thalach}
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          </MotionBox>
        </SimpleGrid>
        
        {/* Advanced Clinical Parameters (No longer collapsible) */}
        <MotionBox
          mt={3}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Header for Advanced Clinical Parameters */}
          <Box 
            px={4}
            py={3} 
            bg={highlightBg}
            borderRadius="md"
            mb={4}
          >
            <Flex flex="1" align="center">
              <Icon as={FaHospitalUser} w={5} h={5} color={headingColor} mr={3} />
              <Heading size="md" color={headingColor} display="flex" alignItems="center">
                Advanced Clinical Parameters
              </Heading>
            </Flex>
          </Box>

          {/* Info message */}
          <Box 
            p={4} 
            mb={5} 
            bg={cardBg} 
            borderRadius="md" 
            borderLeft="4px"
            borderColor="purple.500"
          >
            <Text fontSize="sm" color={secondaryText}>
              <Icon as={InfoIcon} mr={2} color="purple.500" />
              These fields are optional and typically provided by your healthcare provider.
              Adding this data may improve prediction accuracy.
            </Text>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              {/* Resting ECG */}
              <FormControl 
                mb={6}
                isInvalid={!!formErrors.restecg}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.restecg} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Resting ECG Results</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.restecg} />
                  {getFieldStatus('restecg') === 'filled' && !formErrors.restecg && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <Select 
                  name="restecg" 
                  placeholder="Select ECG result" 
                  value={formData.restecg} 
                  onChange={handleChange}
                  bg={fieldBg}
                  borderColor={
                    formErrors.restecg ? 'red.500' : 
                    getFieldStatus('restecg') === 'filled' ? 'green.500' : 
                    borderColor
                  }
                  _hover={{ borderColor: 'blue.300' }}
                  icon={<ChevronRightIcon />}
                >
                  <option value="0">Normal</option>
                  <option value="1">ST-T Wave Abnormality</option>
                  <option value="2">Left Ventricular Hypertrophy</option>
                </Select>
                {formErrors.restecg && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.restecg}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* ST Depression */}
              <FormControl 
                mb={6}
                isInvalid={!!formErrors.oldpeak}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.oldpeak} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>ST Depression</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.oldpeak} />
                  {getFieldStatus('oldpeak') === 'filled' && !formErrors.oldpeak && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <NumberInput 
                  min={0} 
                  max={10}
                  step={0.1}
                  precision={1}
                  value={formData.oldpeak} 
                  onChange={(v) => handleNumberChange('oldpeak', v)}
                  bg={fieldBg}
                >
                  <NumberInputField 
                    name="oldpeak" 
                    placeholder="Enter ST depression value" 
                    borderColor={
                      formErrors.oldpeak ? 'red.500' : 
                      getFieldStatus('oldpeak') === 'filled' ? 'green.500' : 
                      borderColor
                    }
                    _hover={{ borderColor: 'blue.300' }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {formErrors.oldpeak ? (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.oldpeak}
                  </FormHelperText>
                ) : (
                  <FormHelperText fontSize="xs" color={secondaryText}>
                    <Icon as={InfoIcon} mr={1} color="blue.500" />
                    {fieldGuides.oldpeak}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
            
            <Box>
              {/* ST Slope */}
              <FormControl 
                mb={6}
                isInvalid={!!formErrors.slope}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.slope} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>ST Segment Slope</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.slope} />
                  {getFieldStatus('slope') === 'filled' && !formErrors.slope && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <Select 
                  name="slope" 
                  placeholder="Select slope type" 
                  value={formData.slope} 
                  onChange={handleChange}
                  bg={fieldBg}
                  borderColor={
                    formErrors.slope ? 'red.500' : 
                    getFieldStatus('slope') === 'filled' ? 'green.500' : 
                    borderColor
                  }
                  _hover={{ borderColor: 'blue.300' }}
                  icon={<ChevronRightIcon />}
                >
                  <option value="0">Upsloping</option>
                  <option value="1">Flat</option>
                  <option value="2">Downsloping</option>
                </Select>
                {formErrors.slope && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.slope}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Number of Vessels */}
              <FormControl 
                mb={6}
                isInvalid={!!formErrors.ca}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.ca} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Number of Major Vessels</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.ca} />
                  {getFieldStatus('ca') === 'filled' && !formErrors.ca && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <Select 
                  name="ca" 
                  placeholder="Select number of vessels" 
                  value={formData.ca} 
                  onChange={handleChange}
                  bg={fieldBg}
                  borderColor={
                    formErrors.ca ? 'red.500' : 
                    getFieldStatus('ca') === 'filled' ? 'green.500' : 
                    borderColor
                  }
                  _hover={{ borderColor: 'blue.300' }}
                  icon={<ChevronRightIcon />}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </Select>
                {formErrors.ca && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.ca}
                  </FormHelperText>
                )}
              </FormControl>
              
              {/* Thalassemia */}
              <FormControl 
                isInvalid={!!formErrors.thal}
                position="relative"
              >
                <Flex align="center" mb={1}>
                  <Icon as={fieldIcons.thal} color={headingColor} mr={2} />
                  <FormLabel fontWeight="medium" mb={0}>Thalassemia</FormLabel>
                  <FieldInfoTooltip info={fieldDescriptions.thal} />
                  {getFieldStatus('thal') === 'filled' && !formErrors.thal && (
                    <Icon as={CheckIcon} ml={2} color="green.500" />
                  )}
                </Flex>
                <Select 
                  name="thal" 
                  placeholder="Select thalassemia type" 
                  value={formData.thal} 
                  onChange={handleChange}
                  bg={fieldBg}
                  borderColor={
                    formErrors.thal ? 'red.500' : 
                    getFieldStatus('thal') === 'filled' ? 'green.500' : 
                    borderColor
                  }
                  _hover={{ borderColor: 'blue.300' }}
                  icon={<ChevronRightIcon />}
                >
                  <option value="1">Normal</option>
                  <option value="2">Fixed Defect</option>
                  <option value="3">Reversible Defect</option>
                </Select>
                {formErrors.thal && (
                  <FormHelperText color="red.500">
                    <Icon as={FaExclamationCircle} mr={1} />
                    {formErrors.thal}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
          </SimpleGrid>
        </MotionBox>
        
        <Divider my={5} />
        
        <MotionFlex 
          justifyContent="space-between" 
          direction={{ base: 'column', sm: 'row' }} 
          gap={4}
          mt={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            leftIcon={<Icon as={FaEraser} />}
            variant="outline"
            onClick={() => {
              setFormData({
                age: '',
                sex: '',
                cp: '',
                trestbps: '',
                chol: '',
                fbs: '',
                restecg: '',
                thalach: '',
                exang: '',
                oldpeak: '',
                slope: '',
                ca: '',
                thal: ''
              });
              setFormErrors({});
            }}
            borderRadius="md"
            _hover={{
              bg: 'red.50',
              borderColor: 'red.300',
              color: 'red.500'
            }}
          >
            Reset Form
          </Button>
          
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isSubmitting}
            loadingText="Calculating Risk"
            size="lg"
            rightIcon={<Icon as={FaCalculator} />}
            leftIcon={<Icon as={FaHeartbeat} />}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
            borderRadius="md"
          >
            Calculate Heart Disease Risk
          </Button>
        </MotionFlex>
        
        {/* Risk level legend */}
        <MotionBox 
          mt={6} 
          p={4} 
          borderRadius="md" 
          bg={highlightBg}
          shadow="sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Text fontWeight="medium" mb={3} color={headingColor}>Risk Level Scale:</Text>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
            {riskLevels.map((level) => (
              <Flex 
                key={level.value} 
                align="center" 
                bg={useColorModeValue(`${level.color}.50`, `${level.color}.900`)} 
                p={3} 
                borderRadius="md"
                borderLeft="3px solid"
                borderColor={`${level.color}.500`}
              >
                <Icon 
                  as={level.icon} 
                  color={`${level.color}.500`} 
                  w={5} 
                  h={5} 
                  mr={3} 
                />
                <Box>
                  <Text fontWeight="bold" fontSize="sm">{level.value}</Text>
                  <Text fontSize="xs" color={secondaryText}>{level.range}</Text>
                </Box>
              </Flex>
            ))}
          </SimpleGrid>
        </MotionBox>
        
        <MotionBox
          mt={4}
          p={3}
          borderRadius="md"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Text fontSize="xs" color={secondaryText} textAlign="center">
            <Icon as={FaExclamationCircle} mr={1} color="blue.500" />
            Disclaimer: This assessment is for informational purposes only and should not replace professional medical advice.
            Always consult with your healthcare provider regarding health concerns.
          </Text>
        </MotionBox>
      </VStack>
    </MotionBox>
  );
};

export default PredictionForm;