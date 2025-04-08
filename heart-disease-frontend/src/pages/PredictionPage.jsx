import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Heading, Text, useToast, 
  Alert, AlertIcon, AlertTitle, AlertDescription,
  Divider, Icon, VStack, Button
} from '@chakra-ui/react';
import { FaHeartbeat, FaArrowLeft } from 'react-icons/fa';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';
import { usePrediction } from '../contexts/PredictionContext';
import { checkApiHealth } from '../services/api';

const PredictionPage = () => {
  const [showResult, setShowResult] = useState(false);
  const [apiStatus, setApiStatus] = useState({ checked: false, online: true });
  const { predictionData, clearPrediction } = usePrediction();
  const toast = useToast();

  useEffect(() => {
    // Check API connection when component mounts
    const checkApi = async () => {
      const status = await checkApiHealth();
      setApiStatus({ checked: true, online: status.online });
      
      if (!status.online) {
        toast({
          title: 'Connection Issue',
          description: 'Unable to connect to the prediction service. Please try again later.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    };
    
    checkApi();
  }, [toast]);

  const handlePredictionUpdate = (result) => {
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setShowResult(false);
    clearPrediction();
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2} display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaHeartbeat} color="red.500" mr={2} />
            Heart Disease Risk Prediction
          </Heading>
          <Text color="gray.600">
            Fill in your health information to assess your risk of heart disease
          </Text>
        </Box>
        
        {apiStatus.checked && !apiStatus.online && (
          <Alert 
            status="error" 
            variant="subtle" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            textAlign="center" 
            borderRadius="md" 
            py={5}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Backend Service Unavailable
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              We cannot connect to our prediction service at the moment. 
              Please try again later or contact support if this problem persists.
            </AlertDescription>
          </Alert>
        )}
        
        {showResult && predictionData ? (
          <Box>
            <Button 
              leftIcon={<FaArrowLeft />} 
              onClick={handleBack}
              mb={4}
              size="sm"
              variant="outline"
            >
              Back to form
            </Button>
            <PredictionResult />
          </Box>
        ) : (
          <PredictionForm 
            onPredictionUpdate={handlePredictionUpdate} 
            resetAfterSubmit={false}
          />
        )}
        
        <Divider my={8} />
        
        <Box>
          <Heading as="h3" size="md" mb={4}>
            What is heart disease?
          </Heading>
          <Text mb={4}>
            Heart disease refers to several conditions that affect the heart's structure and function. 
            The most common type is coronary artery disease, which can lead to heart attacks. 
            Early detection and prevention are crucial for maintaining heart health.
          </Text>
          <Text>
            This prediction tool uses machine learning to analyze your health data and estimate 
            your risk of heart disease. While this tool can provide helpful insights, 
            it should not replace professional medical advice.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default PredictionPage;