import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, VStack, Accordion, AccordionItem, 
  AccordionButton, AccordionPanel, AccordionIcon, UnorderedList, 
  ListItem, Link, Spinner, Alert, AlertIcon, SimpleGrid, 
  Icon, Flex, useColorModeValue
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FaHeartbeat, FaAppleAlt, FaRunning, FaNotesMedical } from 'react-icons/fa';
import { getHealthInfo } from '../services/api';

const HealthInfo = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchHealthInfo = async () => {
      try {
        setLoading(true);
        const response = await getHealthInfo();
        
        if (response.success && response.data) {
          setHealthData(response.data);
        } else {
          throw new Error("Failed to load health information");
        }
      } catch (err) {
        console.error('Error fetching health information:', err);
        setError('Failed to load health information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthInfo();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" p={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading health information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" p={5} borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={5}>
      <VStack spacing={6} align="stretch">
        <Flex align="center">
          <Icon as={FaHeartbeat} mr={3} color="red.500" boxSize={6} />
          <Heading size="lg">Heart Disease Information</Heading>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg} boxShadow="sm">
            <Flex align="center" mb={4}>
              <Icon as={FaNotesMedical} mr={2} color="blue.500" />
              <Heading size="md" mb={0}>Key Risk Factors</Heading>
            </Flex>
            
            <Accordion allowMultiple>
              {healthData?.risk_factors.map((factor, index) => (
                <AccordionItem key={index} border="none" mb={2}>
                  <h2>
                    <AccordionButton 
                      bg={useColorModeValue('gray.50', 'gray.600')} 
                      borderRadius="md"
                      _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                    >
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {factor.name}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} pt={3}>
                    <Text mb={3}>{factor.description}</Text>
                    <Text fontWeight="medium" mb={1}>Recommendations:</Text>
                    <UnorderedList pl={4} spacing={1}>
                      {factor.recommendations.map((rec, idx) => (
                        <ListItem key={idx}>{rec}</ListItem>
                      ))}
                    </UnorderedList>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
          
          <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg} boxShadow="sm">
            <Flex align="center" mb={4}>
              <Icon as={FaAppleAlt} mr={2} color="green.500" />
              <Heading size="md" mb={0}>Prevention Tips</Heading>
            </Flex>
            
            <UnorderedList spacing={3} pl={5}>
              {healthData?.prevention_tips.map((tip, index) => (
                <ListItem key={index}>
                  <Text>{tip}</Text>
                </ListItem>
              ))}
            </UnorderedList>
            
            <Flex align="center" mt={8} mb={4}>
              <Icon as={FaRunning} mr={2} color="orange.500" />
              <Heading size="md" mb={0}>Lifestyle Changes</Heading>
            </Flex>
            
            <UnorderedList spacing={3} pl={5}>
              <ListItem>
                <Text fontWeight="medium">Regular Physical Activity</Text>
                <Text fontSize="sm">Aim for at least 150 minutes of moderate exercise per week.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="medium">Healthy Diet</Text>
                <Text fontSize="sm">Focus on fruits, vegetables, whole grains, and lean proteins.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="medium">Stress Management</Text>
                <Text fontSize="sm">Practice relaxation techniques like meditation or deep breathing.</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="medium">Regular Check-ups</Text>
                <Text fontSize="sm">Monitor your blood pressure, cholesterol, and blood sugar levels.</Text>
              </ListItem>
            </UnorderedList>
          </Box>
        </SimpleGrid>
        
        <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg} boxShadow="sm">
          <Heading size="md" mb={4}>Helpful Resources</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {healthData?.resources.map((resource, index) => (
              <Link 
                key={index} 
                href={resource.url} 
                isExternal 
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                _hover={{ 
                  textDecoration: 'none', 
                  bg: useColorModeValue('blue.50', 'blue.900'),
                  boxShadow: 'sm'
                }}
                display="flex"
                alignItems="center"
              >
                <Text fontWeight="medium">{resource.name}</Text>
                <ExternalLinkIcon ml={2} />
              </Link>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
};

export default HealthInfo;