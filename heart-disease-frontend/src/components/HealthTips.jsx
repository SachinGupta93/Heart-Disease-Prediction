import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Icon, List, ListItem, ListIcon,
  Divider, Badge, Flex, useColorModeValue
} from '@chakra-ui/react';
import { 
  FaHeartbeat, FaAppleAlt, FaRunning, FaSmoking, FaCheck, 
  FaBed, FaStethoscope, FaWeight
} from 'react-icons/fa';
import HealthTipsSkeleton from './HealthTipsSkeleton';

const HealthTips = ({ riskScore, isLoading = false }) => {
  // Define risk level
  let riskLevel = 'low';
  if (riskScore > 0.6) {
    riskLevel = 'high';
  } else if (riskScore > 0.3) {
    riskLevel = 'moderate';
  }

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Define tips based on risk level
  const generalTips = [
    { icon: FaAppleAlt, tip: 'Maintain a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins.' },
    { icon: FaRunning, tip: 'Aim for at least 150 minutes of moderate-intensity exercise per week.' },
    { icon: FaSmoking, tip: 'If you smoke, consider quitting. Talk to your doctor about smoking cessation programs.' },
    { icon: FaBed, tip: 'Get 7-9 hours of quality sleep each night to support heart health.' },
    { icon: FaWeight, tip: 'Maintain a healthy weight through balanced diet and regular physical activity.' }
  ];

  const moderateTips = [
    { icon: FaStethoscope, tip: 'Schedule regular check-ups with your doctor to monitor your heart health.' },
    { icon: FaHeartbeat, tip: 'Learn to manage stress through techniques like meditation, deep breathing, or yoga.' },
    { icon: FaAppleAlt, tip: 'Reduce sodium intake to less than 2,300mg per day (about 1 teaspoon of salt).' }
  ];

  const highRiskTips = [
    { icon: FaStethoscope, tip: 'Consult with a cardiologist for a comprehensive heart health evaluation.' },
    { icon: FaHeartbeat, tip: 'Monitor your blood pressure regularly at home with a reliable blood pressure device.' },
    { icon: FaAppleAlt, tip: 'Follow a DASH or Mediterranean diet plan, which are specifically recommended for heart health.' },
    { icon: FaRunning, tip: 'Begin a supervised exercise program under the guidance of a healthcare professional.' }
  ];

  // Return skeleton during loading
  if (isLoading) {
    return <HealthTipsSkeleton />;
  }

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      borderWidth="1px" 
      bg={bgColor} 
      boxShadow="md" 
      borderColor={borderColor}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color={headingColor}>
          Personalized Health Recommendations
        </Heading>
        <Icon as={FaHeartbeat} w={6} h={6} color="red.500" />
      </Flex>

      <Text mb={4} color={textColor}>
        Based on your heart disease risk assessment, here are some tailored recommendations 
        to help support your heart health.
      </Text>

      <Flex mb={4}>
        <Badge 
          colorScheme={riskLevel === 'low' ? 'green' : riskLevel === 'moderate' ? 'orange' : 'red'}
          p={2}
          borderRadius="md"
          fontSize="sm"
        >
          {riskLevel === 'low' ? 'Low Risk Profile' : 
           riskLevel === 'moderate' ? 'Moderate Risk Profile' : 'High Risk Profile'}
        </Badge>
      </Flex>
      
      <Divider mb={4} />

      <Accordion allowMultiple defaultIndex={[0]} borderColor={borderColor}>
        <AccordionItem border="none">
          <h2>
            <AccordionButton _expanded={{ bg: 'blue.50', color: 'blue.600' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                General Heart Health Recommendations
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <List spacing={3}>
              {generalTips.map((tip, index) => (
                <ListItem key={index} display="flex" alignItems="flex-start">
                  <ListIcon as={tip.icon} color="green.500" mt={1} />
                  <Text>{tip.tip}</Text>
                </ListItem>
              ))}
            </List>
          </AccordionPanel>
        </AccordionItem>

        {(riskLevel === 'moderate' || riskLevel === 'high') && (
          <AccordionItem border="none">
            <h2>
              <AccordionButton _expanded={{ bg: 'orange.50', color: 'orange.600' }}>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Additional Recommendations for Moderate Risk
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <List spacing={3}>
                {moderateTips.map((tip, index) => (
                  <ListItem key={index} display="flex" alignItems="flex-start">
                    <ListIcon as={tip.icon} color="orange.500" mt={1} />
                    <Text>{tip.tip}</Text>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        )}

        {riskLevel === 'high' && (
          <AccordionItem border="none">
            <h2>
              <AccordionButton _expanded={{ bg: 'red.50', color: 'red.600' }}>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Critical Recommendations for High Risk
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <List spacing={3}>
                {highRiskTips.map((tip, index) => (
                  <ListItem key={index} display="flex" alignItems="flex-start">
                    <ListIcon as={tip.icon} color="red.500" mt={1} />
                    <Text>{tip.tip}</Text>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        )}

        <AccordionItem border="none">
          <h2>
            <AccordionButton _expanded={{ bg: 'purple.50', color: 'purple.600' }}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                Important Disclaimer
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text fontSize="sm" fontStyle="italic">
              These recommendations are for general guidance only and are not a substitute for 
              professional medical advice. Always consult with a healthcare provider before 
              making significant changes to your diet, exercise routine, or medication regimen.
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default HealthTips;