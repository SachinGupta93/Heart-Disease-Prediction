import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  useColorModeValue,
  Alert,
  AlertIcon,
  Icon,
  Flex,
  Badge,
  Divider,
  Tooltip,
  Image,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPredictions } from '../services/firestore';
import { checkApiHealth } from '../services/api';
import { API_URL } from "../config";
// import PredictionCard from "./PredictionCard";
import { 
  FaHeartbeat, 
  FaChartLine, 
  FaHistory, 
  FaUserMd, 
  FaClipboardCheck, 
  FaChartBar, 
  FaThumbsUp, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaHospital, 
  FaArrowRight,
  FaServer,
  FaPlusSquare,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import DashboardSkeleton from './DashboardSkeleton';
import AIAssistant from './AIAssistant'; // Import AIAssistant component

// Create motion components for animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Dashboard = () => {
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for the AI Assistant
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Add ref for the AI Assistant component
  const aiAssistantRef = useRef(null);
  
  // Enhanced color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const statBg = useColorModeValue('blue.50', 'blue.900');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');

  // Check API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await checkApiHealth();
        setApiStatus('online');
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('offline');
      }
    };
    
    checkHealth();
  }, []);

  // Load user's recent predictions from API
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/history/${currentUser.uid}`);
        const result = await response.json();
        
        // Debug the API response
        console.log("API Response:", result);
        
        if (result.success && result.data) {
          // Debug the data structure
          console.log("Data type:", typeof result.data);
          console.log("Is Array:", Array.isArray(result.data));
          
          let dataArray = [];
          
          // Check if result.data is an array
          if (Array.isArray(result.data)) {
            dataArray = [...result.data];
          } 
          // Check if result.data is an object containing prediction entries
          else if (typeof result.data === 'object' && result.data !== null) {
            // Convert object to array if it's not already an array
            dataArray = Object.values(result.data);
          }
          
          // Extra safety check - ensure dataArray is actually an array
          if (!Array.isArray(dataArray)) {
            console.error("dataArray is still not an array:", dataArray);
            dataArray = [];
          }
          
          // Debug the array before sorting
          console.log("Data array before sorting:", dataArray);
          
          // Now dataArray is guaranteed to be an array, so we can safely sort it
          if (dataArray.length > 0) {
            try {
              const sortedData = [...dataArray].sort((a, b) => {
                // Check if a and b are valid objects with timestamp property
                if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
                  console.warn("Invalid objects in sort function:", { a, b });
                  return 0;
                }
                
                // Make sure timestamp exists before using it
                return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
              });
              console.log("Sorted data:", sortedData);
              setRecentPredictions(sortedData);
            } catch (sortError) {
              console.error("Error sorting data:", sortError);
              setRecentPredictions(dataArray); // Use unsorted data as fallback
              setError("Error sorting predictions");
            }
          } else {
            setRecentPredictions([]);
          }
        } else {
          console.log("No history data found or invalid response format:", result);
          setRecentPredictions([]);
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setRecentPredictions([]);
        setError("Error fetching predictions");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.uid) {
      fetchPredictions();
    }
  }, [currentUser]);

  // Get risk level color
  const getRiskColor = (riskLevel) => {
    // Check if riskLevel is undefined or null
    if (!riskLevel) return 'gray';
    
    if (riskLevel.toLowerCase().includes('high')) return 'red';
    if (riskLevel.toLowerCase().includes('moderate')) return 'orange';
    return 'green';
  };

  // Function to handle "Continue to iterate?" click
  const handleContinueIteration = () => {
    // Set initial question for the AI Assistant
    const question = 'I want to continue analyzing my heart health data. What insights can you provide based on my recent predictions?';
    // Open the AI Assistant drawer using the ref
    if (aiAssistantRef.current) {
      aiAssistantRef.current.openDrawer(question);
    }
  };

  // Render loading skeleton if data is loading
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <DashboardSkeleton />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Add AIAssistant component with ref */}
      <AIAssistant ref={aiAssistantRef}/>
      
      <VStack spacing={8} align="stretch">
        {/* Welcome Section with Animation */}
        <MotionBox 
          textAlign="center" 
          py={10} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Flex justify="center" mb={4}>
            <Icon as={FaHeartbeat} w={10} h={10} color="red.500" />
          </Flex>
          <Heading as="h1" size="2xl" mb={4} color={headingColor}>
            Heart Disease Risk Assessment
          </Heading>
          <Text fontSize="xl" maxW="600px" mx="auto" mb={8} color={secondaryText}>
            Use our AI-powered tool to assess your risk of heart disease based on your health data.
          </Text>
          
          {apiStatus === 'offline' && (
            <Alert status="error" mb={6} borderRadius="md">
              <AlertIcon />
              <Flex align="center">
                <Icon as={FaExclamationTriangle} mr={2} />
                Our prediction service is currently offline. Please try again later.
              </Flex>
            </Alert>
          )}
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={() => navigate('/risk-assessment')}
            isDisabled={apiStatus === 'offline'}
            rightIcon={<FaArrowRight />}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            Get Your Prediction
          </Button>
        </MotionBox>

        {/* Statistics Section with Icons */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <MotionBox 
            key="stat-prediction-accuracy"
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={bgColor}
            boxShadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            _hover={{ boxShadow: 'md', transform: 'translateY(-5px)' }}
          >
            <Flex align="center" mb={3}>
              <Icon as={FaChartBar} w={6} h={6} color={iconColor} mr={3} />
              <Stat>
                <StatLabel fontSize="lg">Prediction Accuracy</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color={headingColor}>87.4%</StatNumber>
                <StatHelpText>Based on ensemble model</StatHelpText>
              </Stat>
            </Flex>
          </MotionBox>
          
          <MotionBox 
            key="stat-features-analyzed"
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={bgColor}
            boxShadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            _hover={{ boxShadow: 'md', transform: 'translateY(-5px)' }}
          >
            <Flex align="center" mb={3}>
              <Icon as={FaClipboardCheck} w={6} h={6} color={iconColor} mr={3} />
              <Stat>
                <StatLabel fontSize="lg">Features Analyzed</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color={headingColor}>13</StatNumber>
                <StatHelpText>Clinical parameters</StatHelpText>
              </Stat>
            </Flex>
          </MotionBox>
          
          <MotionBox 
            key="stat-service-status"
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={bgColor}
            boxShadow="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            _hover={{ boxShadow: 'md', transform: 'translateY(-5px)' }}
          >
            <Flex align="center" mb={3}>
              <Icon 
                as={apiStatus === 'online' ? FaCheckCircle : apiStatus === 'offline' ? FaTimesCircle : FaServer} 
                w={6} h={6} 
                color={apiStatus === 'online' ? 'green.500' : apiStatus === 'offline' ? 'red.500' : 'yellow.500'} 
                mr={3} 
              />
              <Stat>
                <StatLabel fontSize="lg">Service Status</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color={
                  apiStatus === 'online' ? 'green.500' : 
                  apiStatus === 'offline' ? 'red.500' : 'yellow.500'
                }>
                  {apiStatus === 'checking' ? 'Checking...' : 
                   apiStatus === 'online' ? 'Online' : 'Offline'}
                </StatNumber>
                <StatHelpText>Prediction API</StatHelpText>
              </Stat>
            </Flex>
          </MotionBox>
        </SimpleGrid>

        {/* Featured Services Section */}
        <Box mt={8}>
          <Flex align="center" mb={6}>
            <Icon as={FaUserMd} w={6} h={6} color={iconColor} mr={3} />
            <Heading size="lg" color={headingColor}>Our Services</Heading>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <LinkBox as={MotionBox}
              key="service-risk-assessment"
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
              cursor="pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              _hover={{ 
                boxShadow: 'md', 
                borderColor: 'blue.300',
                transform: 'scale(1.02)',
                bg: cardHoverBg
              }}
            >
              <Flex direction="column" align="center" textAlign="center">
                <Icon as={FaHeartbeat} w={10} h={10} color="red.500" mb={4} />
                <LinkOverlay onClick={() => navigate('/prediction')}>
                  <Heading size="md" mb={2}>Risk Assessment</Heading>
                </LinkOverlay>
                <Text color={secondaryText}>
                  Get a personalized heart disease risk assessment based on your health data.
                </Text>
              </Flex>
            </LinkBox>
            
            <LinkBox as={MotionBox}
              key="service-health-information"
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
              cursor="pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              _hover={{ 
                boxShadow: 'md', 
                borderColor: 'blue.300',
                transform: 'scale(1.02)',
                bg: cardHoverBg
              }}
            >
              <Flex direction="column" align="center" textAlign="center">
                <Icon as={FaInfoCircle} w={10} h={10} color="green.500" mb={4} />
                <LinkOverlay onClick={() => navigate('/health-information')}>
                  <Heading size="md" mb={2}>Health Information</Heading>
                </LinkOverlay>
                <Text color={secondaryText}>
                  Learn about heart disease risk factors and prevention strategies.
                </Text>
              </Flex>
            </LinkBox>
            
            <LinkBox as={MotionBox}
              key="service-model-insights"
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
              cursor="pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              _hover={{ 
                boxShadow: 'md', 
                borderColor: 'blue.300',
                transform: 'scale(1.02)',
                bg: cardHoverBg
              }}
            >
              <Flex direction="column" align="center" textAlign="center">
                <Icon as={FaChartLine} w={10} h={10} color="purple.500" mb={4} />
                <LinkOverlay onClick={() => navigate('/model-comparison')}>
                  <Heading size="md" mb={2}>Model Insights</Heading>
                </LinkOverlay>
                <Text color={secondaryText}>
                  Explore our prediction models and understand how they work.
                </Text>
              </Flex>
            </LinkBox>
          </SimpleGrid>
        </Box>
        
        <Divider my={4} />

        {/* Recent Predictions Section */}
        {currentUser ? (
          <Box>
            <Flex align="center" mb={6}>
              <Icon as={FaHistory} w={6} h={6} color={iconColor} mr={3} />
              <Heading size="lg" color={headingColor}>Your Recent Predictions</Heading>
            </Flex>
            
            {loading ? (
              <Text>Loading your recent predictions...</Text>
            ) : recentPredictions.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {recentPredictions.map((prediction) => (
                  <MotionBox 
                    key={prediction.id} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="md"
                    borderColor={borderColor}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    _hover={{ 
                      boxShadow: 'sm', 
                      bg: cardHoverBg,
                      borderColor: getRiskColor(prediction.risk_level) + '.300'
                    }}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Flex align="center">
                          <Icon as={FaHeartbeat} color={getRiskColor(prediction.risk_level) + '.500'} mr={2} />
                          <Text fontWeight="bold">
                            Risk Level: 
                            <Badge ml={2} colorScheme={getRiskColor(prediction.risk_level)} borderRadius="full" px={2}>
                              {prediction.risk_level}
                            </Badge>
                          </Text>
                        </Flex>
                        <Flex align="center">
                          <Icon as={FaCalendarAlt} color="gray.500" size="sm" mr={2} />
                          <Text fontSize="sm" color="gray.500">
                            {new Date(prediction.date).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </VStack>
                      <Tooltip label="Probability of heart disease">
                        <Badge 
                          px={3}
                          py={2}
                          borderRadius="lg"
                          fontSize="lg"
                          fontWeight="bold"
                          colorScheme={getRiskColor(prediction.risk_level)}
                        >
                          {prediction.probability_percent}%
                        </Badge>
                      </Tooltip>
                    </HStack>
                  </MotionBox>
                ))}
                
                <HStack spacing={4} justify="flex-end">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/prediction-history')}
                    rightIcon={<FaArrowRight />}
                    colorScheme="blue"
                    _hover={{
                      transform: 'translateX(2px)'
                    }}
                  >
                    View Complete History
                  </Button>
                  <Button 
                    colorScheme="teal" 
                    onClick={handleContinueIteration}
                    rightIcon={<FaArrowRight />}
                    _hover={{
                      transform: 'translateX(2px)'
                    }}
                  >
                    Continue to iterate?
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Box p={6} borderWidth="1px" borderRadius="lg" bg="gray.50" textAlign="center">
                <Icon as={FaPlusSquare} w={10} h={10} color="blue.400" mb={4} />
                <Text mb={4}>
                  You don't have any predictions yet. Get started by making your first prediction.
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => navigate('/prediction')}
                  rightIcon={<FaArrowRight />}
                >
                  Make First Prediction
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <MotionBox 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={bgColor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex direction={{ base: "column", md: "row" }} align="center">
              <Icon as={FaUserMd} w={12} h={12} color="blue.400" mr={{ base: 0, md: 6 }} mb={{ base: 4, md: 0 }} />
              <Box>
                <Heading size="md" mb={4} color={headingColor}>
                  Sign In to Save Your Predictions
                </Heading>
                <Text mb={4} color={secondaryText}>
                  Create an account or sign in to save your prediction history and track changes over time.
                </Text>
                <HStack spacing={4}>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => navigate('/login')}
                    leftIcon={<FaCheckCircle />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md',
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/signup')}
                    leftIcon={<FaPlusSquare />}
                  >
                    Create Account
                  </Button>
                </HStack>
              </Box>
            </Flex>
          </MotionBox>
        )}
      </VStack>
    </Container>
  );
};

export default Dashboard;
