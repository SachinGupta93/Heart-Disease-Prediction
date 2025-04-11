import React from 'react';
import {
  Box, Container, Heading, Text, SimpleGrid, Flex,
  Image, Icon, List, ListItem, ListIcon,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Divider, Badge, Button, VStack, HStack, useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { FaHeartbeat, FaRunning, FaAppleAlt, FaBriefcaseMedical, FaSmokingBan, FaWeight } from 'react-icons/fa';

const HealthInformation = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Risk factors information
  const riskFactors = [
    {
      name: 'Age',
      description: 'Risk increases with age, especially after 45 for men and 55 for women.',
      modifiable: false,
      icon: InfoIcon,
      color: 'blue.500'
    },
    {
      name: 'Gender',
      description: 'Men are generally at higher risk than women, though female risk increases after menopause.',
      modifiable: false,
      icon: InfoIcon,
      color: 'blue.500'
    },
    {
      name: 'Family History',
      description: 'Risk increases if a first-degree relative had heart disease at an early age.',
      modifiable: false,
      icon: InfoIcon,
      color: 'blue.500'
    },
    {
      name: 'Smoking',
      description: 'Damages blood vessels, reduces oxygen in blood, and raises blood pressure.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    },
    {
      name: 'High Blood Pressure',
      description: 'Forces the heart to work harder, causing it to enlarge and weaken over time.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    },
    {
      name: 'High Cholesterol',
      description: 'Contributes to plaque buildup in arteries, restricting blood flow to the heart.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    },
    {
      name: 'Diabetes',
      description: 'Increases the risk of heart disease and the chances of having a silent heart attack.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    },
    {
      name: 'Obesity',
      description: 'Puts extra strain on the heart and is linked to high cholesterol and diabetes.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    },
    {
      name: 'Physical Inactivity',
      description: 'Regular exercise strengthens the heart and improves circulation.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    },
    {
      name: 'Stress',
      description: 'Chronic stress may increase heart disease risk through inflammation and high blood pressure.',
      modifiable: true,
      icon: WarningIcon,
      color: 'red.500'
    }
  ];

  // Preventive measures
  const preventiveMeasures = [
    {
      title: 'Regular Exercise',
      description: 'Aim for at least 150 minutes of moderate-intensity exercise weekly, such as brisk walking, swimming, or cycling.',
      icon: FaRunning,
      color: 'green.500'
    },
    {
      title: 'Healthy Diet',
      description: 'Focus on fruits, vegetables, whole grains, lean proteins, and limit saturated fats, sodium, and added sugars.',
      icon: FaAppleAlt,
      color: 'green.500'
    },
    {
      title: 'Quit Smoking',
      description: 'If you smoke, quitting is one of the best things you can do for your heart health.',
      icon: FaSmokingBan,
      color: 'green.500'
    },
    {
      title: 'Maintain Healthy Weight',
      description: 'Aim for a BMI between 18.5 and 24.9. Even modest weight loss can improve heart health.',
      icon: FaWeight,
      color: 'green.500'
    },
    {
      title: 'Manage Stress',
      description: 'Practice stress-reduction techniques like meditation, deep breathing, or yoga.',
      icon: FaHeartbeat,
      color: 'green.500'
    },
    {
      title: 'Regular Check-ups',
      description: 'Monitor blood pressure, cholesterol, and blood sugar levels regularly with your healthcare provider.',
      icon: FaBriefcaseMedical,
      color: 'green.500'
    }
  ];

  // FAQs
  const faqs = [
    {
      question: 'What is heart disease?',
      answer: 'Heart disease is a term that encompasses various conditions affecting the heart, including coronary artery disease, heart rhythm problems, heart valve disease, and more. The most common type is coronary artery disease, which occurs when the blood vessels that supply the heart become narrowed or blocked.'
    },
    {
      question: 'How is heart disease diagnosed?',
      answer: 'Heart disease diagnosis typically involves a combination of medical history review, physical examination, and various tests including ECG/EKG, echocardiogram, stress tests, cardiac CT or MRI, coronary angiogram, and blood tests to check cholesterol levels and other markers of heart health.'
    },
    {
      question: 'What are the warning signs of heart disease?',
      answer: 'Warning signs include chest pain or discomfort, shortness of breath, pain or numbness in the arms or shoulders, fatigue, dizziness, heart palpitations, swelling in the feet, ankles, or legs, and for women, sometimes nausea, vomiting, or upper back or jaw pain. Some people, especially those with diabetes, may have "silent" heart disease with minimal symptoms.'
    },
    {
      question: 'Can heart disease be cured?',
      answer: 'While heart disease often cannot be completely cured, it can be effectively managed with lifestyle changes, medications, and in some cases, medical procedures or surgery. Many people with heart disease live long, full lives by following their treatment plan and making heart-healthy choices.'
    },
    {
      question: 'How accurate is this prediction tool?',
      answer: 'Our prediction tool uses machine learning algorithms trained on clinical data to estimate heart disease risk. While it provides a valuable assessment, it should not replace professional medical advice. The model has an accuracy of approximately 87% based on testing data, but individual cases may vary.'
    },
    {
      question: 'Should I see a doctor if the prediction shows high risk?',
      answer: 'Yes, if your prediction shows a high risk of heart disease, it is recommended to consult with a healthcare provider. This tool is designed to complement, not replace, medical care. A healthcare professional can provide a comprehensive evaluation and personalized recommendations.'
    }
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading as="h1" size="xl" mb={4}>
          Heart Health Information
        </Heading>
        <Text mb={8} fontSize="lg">
          Understanding heart disease risk factors and prevention measures can help you make informed decisions about your health.
        </Text>
      </motion.div>

      {/* Overview Section */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={12}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box>
            <Heading size="lg" mb={4} color={accentColor}>
              Understanding Heart Disease
            </Heading>
            <Text mb={4}>
              Heart disease refers to several conditions that affect the heart's structure and function. Coronary artery disease,
              the most common type, occurs when plaque builds up in the arteries that supply blood to the heart.
            </Text>
            <Text mb={4}>
              This buildup narrows the arteries, making it harder for blood to flow. Eventually, the restricted blood
              flow can cause chest pain (angina), shortness of breath, or a heart attack.
            </Text>
            <Text fontWeight="medium">
              According to the World Health Organization, cardiovascular diseases are the leading cause of death globally,
              taking an estimated 17.9 million lives each year.
            </Text>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Flex justify="center" align="center" h="auto" w="auto" >
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM22AVMgEuHxnD0zyxZpS8FG2KsnCkNnQE0g&s"
              alt="Heart disease prevention illustration"
              borderRadius="md"
              boxShadow="md"
              height="350px"
              w={'500px'}
              filter={'brightness(1)'}
              transition="0.3s ease-in-out"
              objectFit="cover"
              _hover={{
                filter: 'brightness(1.1)',
              }}
              
                        />
          </Flex>
        </motion.div>

      </SimpleGrid>

      {/* Risk Factors Section */}
      <Box mb={12}>
        <Heading size="lg" mb={6} color={accentColor}>
          Heart Disease Risk Factors
        </Heading>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {riskFactors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Box
                p={5}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={borderColor}
                bg={bgColor}
                height="100%"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="sm">{factor.name}</Heading>
                  <Icon as={factor.icon} color={factor.color} boxSize={5} />
                </Flex>
                <Text fontSize="sm" mb={3}>{factor.description}</Text>
                <Badge colorScheme={factor.modifiable ? "green" : "gray"}>
                  {factor.modifiable ? "Modifiable" : "Non-modifiable"}
                </Badge>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>

      {/* Prevention Section */}
      <Box mb={12} p={6} borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="lg" mb={6} color={accentColor}>
          Preventive Measures
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {preventiveMeasures.map((measure, index) => (
            <HStack key={index} spacing={4} align="start">
              <Box
                p={2}
                borderRadius="full"
                bg={measure.color}
                color="white"
              >
                <Icon as={measure.icon} boxSize={6} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="md">{measure.title}</Heading>
                <Text>{measure.description}</Text>
              </VStack>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* FAQs Section */}
      <Box mb={12}>
        <Heading size="lg" mb={6} color={accentColor}>
          Frequently Asked Questions
        </Heading>

        <Accordion allowMultiple>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} borderColor={borderColor}>
              <h2>
                <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    {faq.question}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>{faq.answer}</Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>

      {/* Call to Action */}
      <Box
        p={8}
        borderRadius="lg"
        bg="blue.50"
        _dark={{ bg: "blue.900" }}
        textAlign="center"
      >
        <Heading size="md" mb={4}>
          Take Control of Your Heart Health Today
        </Heading>
        <Text mb={6}>
          Early detection and prevention are key to maintaining a healthy heart. Use our prediction tool to assess your risk and consult with a healthcare professional for personalized advice.
        </Text>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={() => window.location.href = '/prediction'}
        >
          Check Your Risk Now
        </Button>
        <Button
          colorScheme="blue"
          size="lg"
          ml={4}
          onClick={() => window.location.href = '/health-info'}
        >
          Check Your Health-Info Now
        </Button>
      </Box>
    </Container>
  );
};

export default HealthInformation;