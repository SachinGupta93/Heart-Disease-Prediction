import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Button,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure,
  Spinner, Alert, AlertIcon, Text, HStack, Icon, Flex, Spacer,
  useToast, useColorModeValue, SimpleGrid, Tabs, TabList, Tab, 
  TabPanels, TabPanel, Stat, StatLabel, StatNumber, StatHelpText,
  Divider, Tooltip, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, NumberInput, NumberInputField, Select,
  RadioGroup, Radio, VStack, FormHelperText, FormErrorMessage, Input
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon, InfoIcon, ChevronRightIcon, CheckIcon } from '@chakra-ui/icons';
import { 
  FaHistory, FaChartLine, FaChartBar, FaExclamationTriangle,
  FaCalendarAlt, FaHeartbeat, FaArrowUp, FaArrowDown, 
  FaEquals, FaFileMedical, FaFileExport, FaTrashAlt,
  FaChartPie, FaTachometerAlt, FaStethoscope, FaDownload, FaTrash, FaInfoCircle,
  FaCalculator, FaChild, FaVenusMars, FaHeart, FaTint, FaFlask, FaRunning,
  FaHospitalUser, FaCapsules
} from 'react-icons/fa';
import { MdTimeline, MdShowChart, MdInsights } from 'react-icons/md';
import { BsGraphUp } from 'react-icons/bs';
import { getUserPredictions, deletePrediction, getEnsemblePrediction, savePrediction } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell
} from 'recharts';

const PredictionHistory = () => {
  // Original prediction history state
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  
  // New prediction form state
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    thalach: '',
    exang: '',
    fbs: '',
    restecg: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isPredicting, setIsPredicting] = useState(false);

  // Create a separate disclosure for the clear history modal 
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isClearModalOpen, onOpen: onOpenClearModal, onClose: onCloseClearModal } = useDisclosure();
  const { isOpen: isPredictionModalOpen, onOpen: onOpenPredictionModal, onClose: onClosePredictionModal } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  
  const { currentUser } = useAuth();
  
  // Use semantic tokens for better dark mode support
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const fieldBg = useColorModeValue('gray.50', 'gray.600');
  
  // Risk colors remain consistent across light/dark modes
  const RISK_COLORS = {
    high: '#E53E3E',    // red
    moderate: '#ED8936', // orange
    low: '#48BB78'      // green
  };
  
  // Format date for better display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // For recent dates, show relative time (e.g., "2 days ago")
      const relative = formatDistanceToNow(date, { addSuffix: true });
      
      // For actual date display, use locale-specific format
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const formatted = date.toLocaleDateString(undefined, options);
      
      return { 
        relative,
        formatted
      };
    } catch (error) {
      console.error('Date formatting error:', error);
      return { relative: 'Unknown date', formatted: 'Unknown date' };
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [currentUser]);
  
  useEffect(() => {
    // Set chart ready after a delay to ensure containers are mounted
    const timer = setTimeout(() => {
      setChartReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [predictions]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        try {
          const response = await getUserPredictions(currentUser.uid);
          
          if (response && response.success && Array.isArray(response.data)) {
            console.log('Fetched predictions:', response.data);
            setPredictions(response.data);
          } else {
            console.log('Using sample data due to invalid API response');
            setPredictions(generateSamplePredictions());
          }
        } catch (error) {
          console.error('API error:', error);
          setPredictions(generateSamplePredictions());
        }
      } else {
        console.log('Using sample data for guest user');
        setPredictions(generateSamplePredictions());
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setError('Failed to load prediction history. Please try again later.');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Form handling functions
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

  // Reset form data
  const resetForm = () => {
    setFormData({
      age: '',
      sex: '',
      cp: '',
      trestbps: '',
      chol: '',
      thalach: '',
      exang: '',
      fbs: '',
      restecg: '',
      oldpeak: '',
      slope: '',
      ca: '',
      thal: ''
    });
    setFormErrors({});
  };

  // Validate form for simplified prediction
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Required fields for minimalist prediction
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
    
    // Maximum heart rate validation
    if (formData.thalach && (formData.thalach < 60 || formData.thalach > 220)) {
      errors.thalach = 'Maximum heart rate must be between 60 and 220 bpm';
      isValid = false;
    }
    
    // ST depression validation
    if (formData.oldpeak && (formData.oldpeak < 0 || formData.oldpeak > 10)) {
      errors.oldpeak = 'ST depression must be between 0 and 10 mm';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission for prediction
  const handlePredictionSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Form Validation Error',
        description: 'Please fill all required fields correctly',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsPredicting(true);
    
    try {
      // Call the prediction API
      const response = await getEnsemblePrediction(formData);
      
      if (response && response.success) {
        // Add to predictions
        const newPrediction = {
          id: `pred-${Date.now()}`,
          date: new Date().toISOString(),
          probability: response.data?.primary_prediction?.probability || 0,
          probability_percent: response.data?.primary_prediction?.probability_percent || 
                              (response.data?.primary_prediction?.probability * 100).toFixed(1),
          risk_level: response.data?.primary_prediction?.risk_level || determineRiskLevel(0),
          inputs: formData
        };
        
        // Add to the prediction list
        setPredictions([newPrediction, ...predictions]);
        
        // If user is logged in, save prediction
        if (currentUser) {
          try {
            await savePrediction(currentUser.uid, {
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
          title: 'Prediction Complete',
          description: `Your heart disease risk: ${response.data?.primary_prediction?.risk_level || 'Unknown'}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        resetForm();
        onClosePredictionModal();
      } else {
        throw new Error('Failed to get prediction results');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: 'Prediction Failed',
        description: 'Unable to complete your heart disease risk assessment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPredicting(false);
    }
  };

  // Determine risk level based on probability
  const determineRiskLevel = (probability) => {
    const prob = parseFloat(probability);
    if (prob < 0.3) return 'Low Risk';
    if (prob < 0.7) return 'Moderate Risk';
    return 'High Risk';
  };

  const handleDelete = async () => {
    if (!selectedPrediction) return;
    
    setIsDeleting(true);
    
    try {
      if (currentUser) {
        await deletePrediction(currentUser.uid, selectedPrediction.id);
      }
      
      setPredictions(predictions.filter(p => p.id !== selectedPrediction.id));
      
      toast({
        title: 'Record deleted',
        description: 'Your prediction record has been removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting prediction:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the prediction record',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const getRiskColor = (risk) => {
    if (typeof risk === 'string') {
      if (risk.toLowerCase().includes('high')) return RISK_COLORS.high;
      if (risk.toLowerCase().includes('moderate')) return RISK_COLORS.moderate;
      return RISK_COLORS.low;
    }
    
    // Numeric risk
    const numRisk = parseFloat(risk);
    if (numRisk >= 70) return RISK_COLORS.high;
    if (numRisk >= 30) return RISK_COLORS.moderate;
    return RISK_COLORS.low;
  };

  const handleDeleteClick = (prediction) => {
    setSelectedPrediction(prediction);
    onOpen();
  };

  const exportToCSV = () => {
    try {
      // Create CSV headers
      const headers = [
        'Date', 
        'Probability (%)', 
        'Risk Level', 
        'Age', 
        'Blood Pressure', 
        'Cholesterol'
      ].join(',');
      
      // Create CSV rows
      const rows = predictions.map(pred => {
        // Get probability as percentage
        const probability = pred.probability_percent 
          ? parseFloat(pred.probability_percent) 
          : (pred.probability ? parseFloat(pred.probability) * 100 : 0);
          
        return [
          new Date(pred.date).toISOString().split('T')[0],
          probability.toFixed(1),
          pred.risk_level || 'Unknown',
          pred.inputs?.age || '',
          pred.inputs?.trestbps || '',
          pred.inputs?.chol || ''
        ].join(',');
      });
      
      // Combine headers and rows
      const csvContent = [
        headers,
        ...rows
      ].join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `heart_health_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Your health history has been downloaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export your prediction history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handles clearing all history entries
  const handleClearHistory = async () => {
    try {
      setIsDeleting(true);
      
      if (currentUser && predictions.length > 0) {
        // Delete all predictions one by one
        for (const prediction of predictions) {
          await deletePrediction(currentUser.uid, prediction.id);
        }
        
        // Clear the local state
        setPredictions([]);
        
        toast({
          title: 'History cleared',
          description: 'All prediction records have been removed',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Operation failed',
        description: 'Could not clear prediction history. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onCloseClearModal();
    }
  };

  // Extract probability values for chart
  const chartData = useMemo(() => {
    if (!predictions.length) return [];
    
    // Clone and reverse array so dates are in ascending order for the chart
    const orderedPredictions = [...predictions].reverse();
    
    return orderedPredictions.map(pred => {
      // Calculate probability as a number
      const probability = pred.probability_percent 
        ? parseFloat(pred.probability_percent) 
        : (pred.probability ? parseFloat(pred.probability) * 100 : 0);
      
      // Determine risk level for color coding
      let riskCategory = 'low';
      if (probability > 70 || pred.risk_level?.includes('High')) {
        riskCategory = 'high';
      } else if (probability > 40 || pred.risk_level?.includes('Moderate')) {
        riskCategory = 'moderate';
      }
      
      // Format date for display
      const dates = formatDate(pred.date);
      
      return {
        date: dates.formatted,
        dateRelative: dates.relative,
        timestamp: new Date(pred.date).getTime(),
        probability,
        risk: riskCategory,
        riskLevel: pred.risk_level || 'Unknown',
        age: pred.inputs?.age || 0,
        bloodPressure: pred.inputs?.trestbps || 0,
        cholesterol: pred.inputs?.chol || 0
      };
    });
  }, [predictions]);

  // Statistics for risk distribution
  const riskDistribution = useMemo(() => {
    if (!chartData.length) return [];
    
    // Count occurrences of each risk level
    const counts = chartData.reduce((acc, item) => {
      const risk = item.risk;
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for pie chart
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1) + ' Risk',
      value,
      color: RISK_COLORS[name]
    }));
  }, [chartData]);

  // Overall statistics
  const stats = useMemo(() => {
    if (!chartData.length) return null;
    
    const probabilities = chartData.map(d => d.probability);
    
    return {
      avg: probabilities.reduce((a, b) => a + b, 0) / probabilities.length,
      min: Math.min(...probabilities),
      max: Math.max(...probabilities),
      count: chartData.length,
      trend: probabilities.length > 1 
        ? (probabilities[probabilities.length - 1] > probabilities[0] ? 'increasing' : 'decreasing')
        : 'stable'
    };
  }, [chartData]);

  // Generate sample data for development/preview
  const generateSamplePredictions = () => {
    const today = new Date();
    const predictions = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i * 15); // every 15 days
      
      const probability = Math.round(30 + Math.random() * 55);
      let riskLevel;
      
      if (probability < 33) riskLevel = "Low Risk";
      else if (probability < 67) riskLevel = "Moderate Risk";
      else riskLevel = "High Risk";
      
      predictions.push({
        id: `sample-${i}`,
        date: date.toISOString(),
        probability: probability / 100,
        probability_percent: probability.toString(),
        risk_level: riskLevel,
        inputs: {
          age: Math.round(45 + Math.random() * 30),
          trestbps: Math.round(110 + Math.random() * 60),
          chol: Math.round(180 + Math.random() * 120)
        }
      });
    }
    
    return predictions;
  };

  if (loading) {
    return (
      <Box textAlign="center" p={10}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4} color="textSecondary">Loading your health history...</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex align="center" mb={6} justify="space-between">
        <Flex align="center">
          <Icon as={FaHistory} w={6} h={6} color={headingColor} mr={2} />
          <Heading size="lg" color={headingColor}>Prediction History</Heading>
        </Flex>
        
        <Flex gap={3}>
          <Button 
            colorScheme="blue" 
            leftIcon={<FaCalculator />}
            onClick={onOpenPredictionModal}
            size="sm"
          >
            New Prediction
          </Button>
          
          <Button 
            leftIcon={<FaDownload />} 
            colorScheme="teal" 
            variant="outline"
            onClick={exportToCSV}
            size="sm"
          >
            Export History
          </Button>
          
          {predictions.length > 0 && (
            <Button 
              leftIcon={<FaTrash />} 
              colorScheme="red" 
              variant="ghost"
              onClick={onOpenClearModal}
              size="sm"
            >
              Clear All
            </Button>
          )}
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <>
          {/* Risk Trend Chart */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            {/* Rest of the component remains the same */}
            <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} 
                 boxShadow="sm" height={{ base: "auto", md: "400px" }} minHeight="350px">
              <Flex align="center" mb={4}>
                <Icon as={MdTimeline} w={5} h={5} color={headingColor} mr={2} />
                <Heading size="md">Risk Trend</Heading>
              </Flex>
              <Box height="90%">
                {chartReady && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 50,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} stroke={borderColor} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: textColor }}
                        angle={-30}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Risk Probability (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: textColor }
                        }}
                        domain={[0, 100]}
                        tick={{ fill: textColor }}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Risk Probability']}
                        labelFormatter={(_, payload) => {
                          if (payload && payload.length > 0) {
                            return `${payload[0].payload.date} (${payload[0].payload.dateRelative})`;
                          }
                          return '';
                        }}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          color: textColor
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
                      <Line 
                        type="monotone" 
                        dataKey="probability" 
                        name="Risk Probability"
                        stroke="#3182CE" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        dot={{ 
                          fill: (entry) => RISK_COLORS[entry.risk], 
                          stroke: '#fff', 
                          strokeWidth: 2,
                          r: 5
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex justify="center" align="center" height="100%">
                    <Text color={textColor}>No prediction data available</Text>
                  </Flex>
                )}
              </Box>
            </Box>

            {/* Risk Distribution */}
            <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} 
                 boxShadow="sm" height={{ base: "auto", md: "400px" }} minHeight="350px">
              <Flex align="center" mb={4}>
                <Icon as={FaChartPie} w={5} h={5} color={headingColor} mr={2} />
                <Heading size="md">Risk Distribution</Heading>
              </Flex>
              <Box height="90%">
                {chartReady && riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          color: textColor
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex justify="center" align="center" height="100%">
                    <Text color={textColor}>No risk distribution data available</Text>
                  </Flex>
                )}
              </Box>
            </Box>
                
            {/* Key Metrics */}
            <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
              <Flex align="center" mb={4}>
                <Icon as={MdInsights} w={5} h={5} color={headingColor} mr={2} />
                <Heading size="md">Health Metrics</Heading>
              </Flex>
              <Box height="300px">
                {chartReady && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData.slice(-5)} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} stroke={borderColor} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: textColor }}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: textColor }} />
                      <RechartsTooltip 
                        formatter={(value) => [value, '']} 
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          color: textColor
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
                      <Bar name="Blood Pressure (mmHg)" dataKey="bloodPressure" fill="#3182CE" />
                      <Bar name="Cholesterol (mg/dL)" dataKey="cholesterol" fill="#805AD5" />
                      <Bar name="Age" dataKey="age" fill="#38A169" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex justify="center" align="center" height="100%">
                    <Text color={textColor}>No health metrics available</Text>
                  </Flex>
                )}
              </Box>
            </Box>
          </SimpleGrid>
              
          {/* Summary Stats */}
          {stats && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mt={6}>
              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaHeartbeat} w={4} h={4} color="red.500" mr={2} />
                    <StatLabel>Average Risk</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>{stats.avg.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={
                      stats.avg > 50 ? "red" : 
                      stats.avg > 25 ? "yellow" : "green"
                    }>
                      {stats.avg > 50 ? "High" : 
                       stats.avg > 25 ? "Moderate" : "Low"}
                    </Badge>
                  </StatHelpText>
                </Stat>
              </Box>

              {/* Continue with other stat boxes, adding appropriate icons */}
              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaHeartbeat} w={4} h={4} color="red.500" mr={2} />
                    <StatLabel>Latest Risk</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>{chartData[chartData.length - 1]?.probability.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={
                      chartData[chartData.length - 1]?.probability > 50 ? "red" : 
                      chartData[chartData.length - 1]?.probability > 25 ? "yellow" : "green"
                    }>
                      {chartData[chartData.length - 1]?.probability > 50 ? "High" : 
                       chartData[chartData.length - 1]?.probability > 25 ? "Moderate" : "Low"}
                    </Badge>
                  </StatHelpText>
                </Stat>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaHeartbeat} w={4} h={4} color="red.500" mr={2} />
                    <StatLabel>Risk Trend</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>{stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={
                      stats.trend === 'increasing' ? "red" : 
                      stats.trend === 'decreasing' ? "green" : "blue"
                    }>
                      {stats.trend === 'increasing' ? "Increasing" : 
                       stats.trend === 'decreasing' ? "Decreasing" : "Stable"}
                    </Badge>
                  </StatHelpText>
                </Stat>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaHeartbeat} w={4} h={4} color="red.500" mr={2} />
                    <StatLabel>Risk Range</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>
                    <Text as="span" color={getRiskColor(stats.min)}>{stats.min.toFixed(1)}%</Text>
                    <Text as="span" mx={2}>-</Text>
                    <Text as="span" color={getRiskColor(stats.max)}>{stats.max.toFixed(1)}%</Text>
                  </StatNumber>
                  <StatHelpText>Min / Max values</StatHelpText>
                </Stat>
              </Box>
            </SimpleGrid>
          )}
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="cardBg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="textPrimary">
              Delete Health Record
            </AlertDialogHeader>

            <AlertDialogBody color="textSecondary">
              Are you sure you want to delete this health record? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isDeleting}
                leftIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Update the modal with icons */}
      <Modal isOpen={isClearModalOpen} onClose={onCloseClearModal}>
        <ModalOverlay />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>
            <HStack>
              <Icon as={FaExclamationTriangle} color="red.500" />
              <Text>Confirm Deletion</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete all your prediction history? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseClearModal}>Cancel</Button>
            <Button colorScheme="red" leftIcon={<FaTrash />} onClick={handleClearHistory}>Delete All</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Prediction Form Modal */}
      <Modal isOpen={isPredictionModalOpen} onClose={onClosePredictionModal} size="xl">
        <ModalOverlay />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>
            <HStack>
              <Icon as={FaHeartbeat} color="red.500" />
              <Text>Quick Heart Disease Risk Assessment</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handlePredictionSubmit}>
              <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <Text fontSize="sm">
                    Fill out the form below to assess your heart disease risk. Required fields are marked with an asterisk (*).
                  </Text>
                </Box>
              </Alert>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Age */}
                <FormControl isRequired isInvalid={!!formErrors.age}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaChild} mr={2} color="blue.500" />
                      Age *
                    </Flex>
                  </FormLabel>
                  <NumberInput 
                    min={20} 
                    max={100} 
                    value={formData.age} 
                    onChange={(v) => handleNumberChange('age', v)}
                  >
                    <NumberInputField 
                      name="age" 
                      placeholder="Enter your age" 
                      bg={fieldBg}
                    />
                  </NumberInput>
                  <FormErrorMessage>{formErrors.age}</FormErrorMessage>
                </FormControl>
                
                {/* Sex */}
                <FormControl isRequired isInvalid={!!formErrors.sex}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaVenusMars} mr={2} color="purple.500" />
                      Sex *
                    </Flex>
                  </FormLabel>
                  <RadioGroup 
                    onChange={(v) => handleNumberChange('sex', v)} 
                    value={formData.sex}
                  >
                    <HStack spacing={5} bg={fieldBg} p={2} borderRadius="md">
                      <Radio value="1" colorScheme="blue">Male</Radio>
                      <Radio value="0" colorScheme="pink">Female</Radio>
                    </HStack>
                  </RadioGroup>
                  <FormErrorMessage>{formErrors.sex}</FormErrorMessage>
                </FormControl>
                
                {/* Chest Pain Type */}
                <FormControl isRequired isInvalid={!!formErrors.cp}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaHeart} mr={2} color="red.500" />
                      Chest Pain Type *
                    </Flex>
                  </FormLabel>
                  <Select 
                    name="cp" 
                    placeholder="Select chest pain type" 
                    value={formData.cp} 
                    onChange={handleChange}
                    bg={fieldBg}
                  >
                    <option value="0">Typical Angina</option>
                    <option value="1">Atypical Angina</option>
                    <option value="2">Non-anginal Pain</option>
                    <option value="3">Asymptomatic</option>
                  </Select>
                  <FormErrorMessage>{formErrors.cp}</FormErrorMessage>
                </FormControl>
                
                {/* Blood Pressure */}
                <FormControl isRequired isInvalid={!!formErrors.trestbps}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaTint} mr={2} color="red.500" />
                      Resting Blood Pressure (mmHg) *
                    </Flex>
                  </FormLabel>
                  <NumberInput 
                    min={80} 
                    max={200} 
                    value={formData.trestbps} 
                    onChange={(v) => handleNumberChange('trestbps', v)}
                  >
                    <NumberInputField 
                      name="trestbps" 
                      placeholder="Enter blood pressure" 
                      bg={fieldBg}
                    />
                  </NumberInput>
                  <FormErrorMessage>{formErrors.trestbps}</FormErrorMessage>
                </FormControl>
                
                {/* Cholesterol */}
                <FormControl isRequired isInvalid={!!formErrors.chol}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaFlask} mr={2} color="orange.500" />
                      Serum Cholesterol (mg/dl) *
                    </Flex>
                  </FormLabel>
                  <NumberInput 
                    min={100} 
                    max={600} 
                    value={formData.chol} 
                    onChange={(v) => handleNumberChange('chol', v)}
                  >
                    <NumberInputField 
                      name="chol" 
                      placeholder="Enter cholesterol level" 
                      bg={fieldBg}
                    />
                  </NumberInput>
                  <FormErrorMessage>{formErrors.chol}</FormErrorMessage>
                </FormControl>
                
                {/* Max Heart Rate */}
                <FormControl isRequired isInvalid={!!formErrors.thalach}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaHeartbeat} mr={2} color="red.500" />
                      Maximum Heart Rate (bpm) *
                    </Flex>
                  </FormLabel>
                  <NumberInput 
                    min={60} 
                    max={220} 
                    value={formData.thalach} 
                    onChange={(v) => handleNumberChange('thalach', v)}
                  >
                    <NumberInputField 
                      name="thalach" 
                      placeholder="Enter maximum heart rate" 
                      bg={fieldBg}
                    />
                  </NumberInput>
                  <FormErrorMessage>{formErrors.thalach}</FormErrorMessage>
                </FormControl>
                
                {/* Exercise Induced Angina */}
                <FormControl isRequired isInvalid={!!formErrors.exang}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaRunning} mr={2} color="green.500" />
                      Exercise Induced Angina *
                    </Flex>
                  </FormLabel>
                  <RadioGroup 
                    onChange={(v) => handleNumberChange('exang', v)} 
                    value={formData.exang}
                  >
                    <HStack spacing={5} bg={fieldBg} p={2} borderRadius="md">
                      <Radio value="1" colorScheme="red">Yes</Radio>
                      <Radio value="0" colorScheme="green">No</Radio>
                    </HStack>
                  </RadioGroup>
                  <FormErrorMessage>{formErrors.exang}</FormErrorMessage>
                </FormControl>
                
                {/* Fasting Blood Sugar */}
                <FormControl isInvalid={!!formErrors.fbs}>
                  <FormLabel>
                    <Flex align="center">
                      <Icon as={FaCapsules} mr={2} color="blue.500" />
                      Fasting Blood Sugar {'>'} 120 mg/dl
                    </Flex>
                  </FormLabel>
                  <RadioGroup 
                    onChange={(v) => handleNumberChange('fbs', v)} 
                    value={formData.fbs}
                  >
                    <HStack spacing={5} bg={fieldBg} p={2} borderRadius="md">
                      <Radio value="1" colorScheme="purple">Yes</Radio>
                      <Radio value="0" colorScheme="green">No</Radio>
                    </HStack>
                  </RadioGroup>
                  <FormErrorMessage>{formErrors.fbs}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              
              <Text fontSize="xs" color="gray.500" mt={6} mb={2}>
                <Icon as={FaInfoCircle} mr={1} />
                This assessment is for informational purposes only. Always consult with healthcare professionals.
              </Text>
            </form>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClosePredictionModal}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              leftIcon={<FaHeartbeat />} 
              onClick={handlePredictionSubmit}
              isLoading={isPredicting}
              loadingText="Calculating"
            >
              Calculate Risk
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PredictionHistory;