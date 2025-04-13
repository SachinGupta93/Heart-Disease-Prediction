import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box, Flex, Heading, Text, Icon, Button, Spinner,
  SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  Badge, useColorModeValue, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Select, Input, InputGroup, InputLeftAddon
} from '@chakra-ui/react';
import {
  FaHistory, FaChartLine, FaChartBar, 
  FaCalendarAlt, FaHeartbeat, FaArrowUp, FaArrowDown, 
  FaEquals, FaDownload, FaTrash, FaChartPie, 
  FaTachometerAlt, FaCalculator, FaExclamationTriangle
} from 'react-icons/fa';
import { MdTimeline, MdInsights } from 'react-icons/md';
import { getUserPredictions, deletePrediction, savePrediction } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell, Sector, RadialBarChart, RadialBar, Area, AreaChart
} from 'recharts';

// Custom active shape for pie chart to create rotation effect
const renderActiveShape = (props) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} fontSize={16} fontWeight="bold">
        {name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#999" fontSize={14}>
        {`${value} prediction${value !== 1 ? 's' : ''}`}
      </text>
      <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" fontSize={14}>
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

// Risk level color mapping
const RISK_COLORS = {
  low: '#48BB78',     // green
  moderate: '#ECC94B', // yellow
  high: '#E53E3E'      // red
};

const RiskHistory = ({ currentPrediction }) => {
  // State for risk history data
  const [riskHistory, setRiskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // States for enhanced animations
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartAnimConfig, setChartAnimConfig] = useState({
    duration: 1500,
    isAnimationActive: true,
    animationBegin: 0,
    animationEasing: 'ease-out'
  });
  
  // Refs for charts
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  
  // Modal states
  const [isClearModalOpen, setClearModalOpen] = useState(false);
  const onOpenClearModal = () => setClearModalOpen(true);
  const onCloseClearModal = () => setClearModalOpen(false);
  
  // Get current user
  const { currentUser } = useAuth();
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('blue.600', 'blue.300');

  // Format date helper function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      const relative = formatDistanceToNow(date, { addSuffix: true });
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

  // Fetch user's risk history
  const fetchRiskHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        try {
          const response = await getUserPredictions(currentUser.uid);
          
          if (response && response.success && Array.isArray(response.data)) {
            console.log('Fetched risk history:', response.data);
            setRiskHistory(response.data);
          } else {
            // If no data or empty array, show sample data for demonstration
            setRiskHistory(generateSampleRiskHistory());
          }
        } catch (error) {
          console.error('Error fetching risk history:', error);
          setError('Failed to load your risk history. Please try again later.');
          // Show sample data for demonstration
          setRiskHistory(generateSampleRiskHistory());
        }
      } else {
        // Not logged in, show sample data
        setRiskHistory(generateSampleRiskHistory());
      }
    } finally {
      setLoading(false);
    }
  };

  // Save current prediction to history
  const saveCurrentPrediction = async () => {
    if (!currentUser) {
      toast({
        title: 'Login required',
        description: 'Please log in to save your prediction history',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!currentPrediction) {
      toast({
        title: 'No prediction available',
        description: 'Make a prediction first to save it to your history',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format the prediction data
      const historyEntry = {
        user_id: currentUser.uid,
        inputs: currentPrediction.inputs,
        prediction: currentPrediction.prediction || 0,
        probability: currentPrediction.probability || 0,
        probability_percent: currentPrediction.probability_percent || 
                            (currentPrediction.probability * 100).toFixed(1),
        risk_level: currentPrediction.risk_level || currentPrediction.riskLevel || 'Unknown',
        date: new Date().toISOString()
      };
      
      // Save to database
      await savePrediction(currentUser.uid, historyEntry);
      
      // Refresh history list
      await fetchRiskHistory();
      
      toast({
        title: 'Success!',
        description: 'Your prediction has been saved to your history',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving prediction:', error);
      setError('Failed to save your prediction. Please try again.');
      toast({
        title: 'Save failed',
        description: 'Could not save your prediction. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    setIsDeleting(true);
    
    try {
      if (currentUser) {
        // Delete each prediction one by one
        for (const prediction of riskHistory) {
          await deletePrediction(currentUser.uid, prediction.id);
        }
        
        // Clear the local state
        setRiskHistory([]);
        
        toast({
          title: 'History cleared',
          description: 'All risk history records have been removed',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Operation failed',
        description: 'Could not clear risk history. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onCloseClearModal();
    }
  };

  // Export history to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Risk Level', 'Probability', 'Age', 'Blood Pressure', 'Cholesterol'];
    const data = chartData.map(item => [
      item.date,
      item.riskLevel,
      `${item.probability.toFixed(1)}%`,
      item.age,
      item.bloodPressure,
      item.cholesterol
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `heart_risk_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract data for charts
  const chartData = useMemo(() => {
    if (!riskHistory.length) return [];
    
    // Clone and reverse array so dates are in ascending order for the chart
    const orderedHistory = [...riskHistory].reverse();
    
    return orderedHistory.map(pred => {
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
  }, [riskHistory]);

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
  const generateSampleRiskHistory = () => {
    const today = new Date();
    const history = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i * 15); // every 15 days
      
      const probability = Math.round(30 + Math.random() * 55);
      let riskLevel;
      
      if (probability < 33) riskLevel = "Low Risk";
      else if (probability < 67) riskLevel = "Moderate Risk";
      else riskLevel = "High Risk";
      
      history.push({
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
    
    return history;
  };

  // Fetch risk history on component mount
  useEffect(() => {
    fetchRiskHistory();
  }, [currentUser]);
  
  useEffect(() => {
    // Set chart ready after a delay to ensure containers are mounted
    const timer = setTimeout(() => {
      setChartReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [riskHistory]);

  // Animation handlers for pie chart
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);
  
  // Reset animations periodically to create dynamic effect
  useEffect(() => {
    // Auto-rotate through pie chart segments
    if (riskDistribution.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % riskDistribution.length);
      }, 3000); // Rotate every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [riskDistribution.length]);
  
  // Enhanced animation effect for charts
  useEffect(() => {
    if (chartReady && chartData.length > 0) {
      // Apply a sequence of animation effects
      const sequence = [
        {duration: 1000, easing: 'ease-out'},
        {duration: 1500, easing: 'elastic'},
        {duration: 1200, easing: 'ease-in-out'}
      ];
      
      let currentIndex = 0;
      const rotateAnimations = setInterval(() => {
        const config = sequence[currentIndex % sequence.length];
        setChartAnimConfig(prev => ({
          ...prev,
          duration: config.duration,
          animationEasing: config.easing
        }));
        currentIndex++;
      }, 8000); // Change animation style every 8 seconds
      
      return () => clearInterval(rotateAnimations);
    }
  }, [chartReady, chartData.length]);

  if (loading) {
    return (
      <Box textAlign="center" p={10}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4} color="textSecondary">Loading your health risk history...</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex align="center" mb={6} justify="space-between">
        <Flex align="center">
          <Icon as={FaHistory} w={6} h={6} color={headingColor} mr={2} />
          <Heading size="lg" color={headingColor}>Risk History</Heading>
        </Flex>
        
        <Flex gap={3}>
          {currentPrediction && (
            <Button 
              colorScheme="blue" 
              leftIcon={<FaHeartbeat />}
              onClick={saveCurrentPrediction}
              size="sm"
            >
              Save Current Prediction
            </Button>
          )}
          
          <Button 
            leftIcon={<FaDownload />} 
            colorScheme="teal" 
            variant="outline"
            onClick={exportToCSV}
            size="sm"
            isDisabled={chartData.length === 0}
          >
            Export History
          </Button>
          
          {chartData.length > 0 && (
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
                      ref={lineChartRef}
                      {...chartAnimConfig}
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
                    <PieChart ref={pieChartRef} {...chartAnimConfig}>
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
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                        activeIndex={activeIndex}
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
          </SimpleGrid>

          {/* Stats Cards */}
          {stats && (
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaTachometerAlt} w={4} h={4} color="blue.500" mr={2} />
                    <StatLabel>Average Risk</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>{stats.avg.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    Over {stats.count} predictions
                  </StatHelpText>
                </Stat>
              </Box>
              
              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaArrowDown} w={4} h={4} color="green.500" mr={2} />
                    <StatLabel>Lowest Risk</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>{stats.min.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme="green">Minimum</Badge>
                  </StatHelpText>
                </Stat>
              </Box>
              
              <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor} boxShadow="sm">
                <Stat>
                  <Flex align="center">
                    <Icon as={FaArrowUp} w={4} h={4} color="red.500" mr={2} />
                    <StatLabel>Highest Risk</StatLabel>
                  </Flex>
                  <StatNumber color={textColor}>{stats.max.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    <Badge colorScheme="red">Maximum</Badge>
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
            </SimpleGrid>
          )}

          {/* Recent Predictions Table */}
          {chartData.length > 0 ? (
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor} bg={bgColor}>
              <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                <Flex align="center">
                  <Icon as={FaCalendarAlt} w={5} h={5} color={headingColor} mr={2} />
                  <Heading size="md">Recent Predictions</Heading>
                </Flex>
              </Box>
              <Box overflowX="auto">
                <Box as="table" width="100%" style={{ borderCollapse: 'collapse' }}>
                  <Box as="thead" bg={useColorModeValue('gray.50', 'gray.900')}>
                    <Box as="tr">
                      <Box as="th" px={4} py={3} textAlign="left">Date</Box>
                      <Box as="th" px={4} py={3} textAlign="left">Risk Level</Box>
                      <Box as="th" px={4} py={3} textAlign="left">Probability</Box>
                      <Box as="th" px={4} py={3} textAlign="left">Age</Box>
                      <Box as="th" px={4} py={3} textAlign="left">Blood Pressure</Box>
                      <Box as="th" px={4} py={3} textAlign="left">Cholesterol</Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {chartData.slice(0, 10).map((item, index) => (
                      <Box 
                        as="tr" 
                        key={index}
                        bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.800')}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                      >
                        <Box as="td" px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
                          <Text fontWeight="medium" color={textColor}>{item.date}</Text>
                          <Text fontSize="sm" color={textSecondary}>{item.dateRelative}</Text>
                        </Box>
                        <Box as="td" px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
                          <Badge colorScheme={
                            item.risk === 'high' ? 'red' : 
                            item.risk === 'moderate' ? 'yellow' : 'green'
                          }>
                            {item.riskLevel}
                          </Badge>
                        </Box>
                        <Box as="td" px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
                          <Text fontWeight="medium" color={
                            item.risk === 'high' ? 'red.500' : 
                            item.risk === 'moderate' ? 'yellow.500' : 'green.500'
                          }>
                            {item.probability.toFixed(1)}%
                          </Text>
                        </Box>
                        <Box as="td" px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
                          {item.age}
                        </Box>
                        <Box as="td" px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
                          {item.bloodPressure} mmHg
                        </Box>
                        <Box as="td" px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
                          {item.cholesterol} mg/dL
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box textAlign="center" p={10} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor}>
              <Icon as={FaExclamationTriangle} w={8} h={8} color="yellow.500" mb={4} />
              <Heading size="md" mb={2}>No Prediction History</Heading>
              <Text color={textSecondary} mb={6}>
                You haven't made any heart risk predictions yet. Make a prediction to track your heart health over time.
              </Text>
            </Box>
          )}
        </>
      )}

      {/* Clear History Confirmation Modal */}
      <Modal isOpen={isClearModalOpen} onClose={onCloseClearModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Clear Prediction History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to clear all your prediction history? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseClearModal}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              leftIcon={<FaTrash />} 
              onClick={handleClearHistory}
              isLoading={isDeleting}
              loadingText="Clearing"
            >
              Clear All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RiskHistory;