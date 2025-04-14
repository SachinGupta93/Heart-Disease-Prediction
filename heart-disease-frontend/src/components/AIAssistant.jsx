import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Box, 
  Button, 
  Drawer, 
  DrawerBody, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerOverlay, 
  DrawerContent, 
  DrawerCloseButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Flex,
  Avatar,
  IconButton,
  VStack,
  HStack,
  useColorModeValue,
  useDisclosure,
  Tag,
  Tooltip,
  useBreakpointValue,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaRobot, FaPaperPlane, FaUser, FaHeartbeat, FaInfoCircle, FaTools, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

// Shortened fallback responses
const AI_RESPONSES = {
  // General app questions
  'dashboard': 'The Dashboard shows your heart health overview and recent predictions.',
  'predict': 'Enter health metrics in Risk Assessment to get a heart disease risk prediction.',
  'assessment': 'Risk Assessment uses your health data to estimate heart disease risk.',
  'simulator': 'Risk Simulator shows how health changes affect your risk.',
  'history': 'Prediction History tracks your past risk assessments.',
  'explain': 'Explainable AI clarifies how predictions are made.',
  'features': 'Feature Importance highlights key risk factors.',
  'comparison': 'Model Comparison shows different AI model results.',
  'information': 'Health Information offers heart disease prevention tips.',
  
  // Heart disease info
  'heart disease': 'Heart disease affects the heart, often due to plaque buildup. Risk factors include high BP and cholesterol.',
  'symptoms': 'Symptoms include chest pain, shortness of breath, and fatigue. Some have no signs until a heart attack.',
  'prevention': 'Prevent heart disease with a healthy diet, exercise, no smoking, and regular check-ups.',
  'risk factors': 'Risk factors include age, sex, smoking, high BP, cholesterol, and diabetes.',
  
  // Metrics
  'cholesterol': 'Healthy cholesterol is <200 mg/dL. LDL <100, HDL ≥60.',
  'blood pressure': 'Normal BP is <120/80 mmHg. ≥140/90 is high.',
  'bmi': 'Healthy BMI is 18.5-24.9. ≥30 is obese.',
  'diabetes': 'Fasting glucose ≥126 mg/dL indicates diabetes, a heart risk factor.',
  
  // About
  'about': 'This app predicts heart disease risk using AI and health metrics.',
  'how it works': 'AI analyzes health metrics to predict heart disease risk.',
  'accuracy': 'Predictions are ~85% accurate. Consult a doctor for diagnosis.',
  
  // Greetings
  'hello': 'Hi! I’m your Heart Health Assistant. Ask about heart disease or the app.',
  'hi': 'Hey! Ask me about heart health or using the app.',
  'help': 'I can explain heart disease, risk factors, or app features. What’s up?',
  'thanks': 'You’re welcome! Ask anytime.',
  'thank you': 'No prob! Happy to help.',
  
  // Medical terms
  'coronary artery disease': 'CAD is narrowed heart arteries, causing chest pain or heart attacks.',
  'heart attack': 'A heart attack is blocked heart blood flow. Symptoms include chest pain, shortness of breath. Call emergency if suspected.',
  'angina': 'Angina is chest pain from low heart blood flow, often tied to CAD.',
  'arrhythmia': 'Arrhythmia is an irregular heartbeat, sometimes harmless, sometimes serious.',
  'heart failure': 'Heart failure is when the heart pumps weakly, causing fatigue and swelling.',
  
  // Model explanations
  'machine learning': 'Our AI uses a Neural Network to predict heart disease risk from health data.',
  'models': 'We use a Neural Network for predictions, trained on medical data.',
  'neural network': 'The Neural Network finds patterns in health data to predict risk.',
  'shap': 'SHAP shows which health factors most affect your risk prediction.',
  
  // Lifestyle
  'diet': 'Eat fruits, veggies, whole grains, and lean proteins. Limit salt and sugar.',
  'exercise': 'Aim for 150 min/week of moderate exercise like walking.',
  'smoking': 'Quitting smoking cuts heart disease risk significantly.',
  'stress': 'Manage stress with exercise, meditation, or relaxation techniques.',
  'alcohol': 'Limit alcohol to 1 drink/day for women, 2 for men.',
  'weight': 'Healthy weight lowers BP, cholesterol, and heart risk.',
  
  // Project-specific
  'thalach': 'Max heart rate (thalach) shows heart fitness. Normal is ~220 minus age.',
  'trestbps': 'Resting BP (trestbps) <120/80 mmHg is healthy.',
  'oldpeak': 'ST depression (oldpeak) signals heart stress during exercise.',
  'ca': 'Major vessels (ca) ≥1 indicates artery issues.',
  'thal': 'Thalassemia (thal) affects heart risk via blood health.',
  'cp': 'Chest pain (cp) types indicate varying heart risk levels.',
  'slope': 'ST slope during exercise helps assess heart function.',
  'exang': 'Exercise angina (exang) suggests heart oxygen issues.',
  'fbs': 'Fasting blood sugar (fbs) >120 mg/dL raises heart risk.',
  'restecg': 'Resting ECG (restecg) detects heart electrical issues.',
  'sex': 'Men face higher heart risk than women before menopause.',
  'age': 'Heart risk rises after age 45 (men) or 55 (women).',
  
  // App tips
  'feature importance chart': 'Feature Importance shows top risk factors.',
  'shap values': 'SHAP values explain how metrics affect your risk.',
  'risk factors chart': 'Risk Factors chart compares your metrics to norms.',
  'simulation': 'Simulator shows how health changes impact risk.',
  'prediction history': 'History tracks your risk trends.',
  'model comparison chart': 'Model Comparison shows AI prediction agreement.',
  
  // Default
  'default': 'I can help with heart health or app questions. Try “What is heart disease?” or “How does the app work?”'
};

// Suggested questions
const SUGGESTED_QUESTIONS = [
  'What is heart disease?',
  'How does the prediction work?',
  'What are risk factors?',
  'How to prevent heart disease?',
  'What do my results mean?',
  'What’s healthy cholesterol?',
  'How accurate is it?',
  'How to use the simulator?'
];

const QUESTION_CATEGORIES = [
  { 
    name: 'Heart Health', 
    icon: <FaHeartbeat />,
    questions: [
      'What is heart disease?',
      'What are common symptoms?',
      'How to prevent heart disease?',
      'What’s healthy blood pressure?'
    ]
  },
  { 
    name: 'Using the App', 
    icon: <FaTools />,
    questions: [
      'How does the prediction work?',
      'How accurate is the prediction?',
      'How to use the simulator?',
      'What features does the app have?'
    ]
  },
  { 
    name: 'Understanding Results', 
    icon: <FaInfoCircle />,
    questions: [
      'What do my results mean?',
      'How is my risk calculated?',
      'What are SHAP values?',
      'What if I have high risk?'
    ]
  }
];

const AIAssistant = forwardRef(({ userData }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const toast = useToast();
  
  // Background colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const userBubbleColor = useColorModeValue('blue.100', 'blue.700');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Suggested queries
  const suggestedQueries = [
    { text: 'Heart disease symptoms', icon: FaHeartbeat },
    { text: 'How to use this app?', icon: FaInfoCircle },
    { text: 'Risk factors', icon: FaTools },
    { text: 'Prevention tips', icon: FaQuestionCircle },
  ];
  
  // Expose functions via forwardRef
  useImperativeHandle(ref, () => ({
    open: onOpen,
    close: onClose,
    addMessage: (text) => handleUserMessage(text)
  }));
  
  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Truncate long responses
  const truncateResponse = (text, maxWords = 100) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return { text, truncated: false };
    return {
      text: words.slice(0, maxWords).join(' ') + '...',
      truncated: true
    };
  };
  
  // Get AI response
  const getAIResponse = async (userInput, healthData) => {
    try {
      setLoading(true);
      
      const requestData = {
        question: userInput,
        health_data: healthData || {}
      };
      
      const response = await axios.post(`${API_URL}/assistant/chat`, requestData);
      
      if (response.data.success) {
        return response.data.data.response;
      } else {
        console.error("API error:", response.data.message);
        return getFallbackResponse(userInput);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      return getFallbackResponse(userInput);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback response
  const getFallbackResponse = (userInput) => {
    const lowercaseInput = userInput.toLowerCase();
    if (AI_RESPONSES[lowercaseInput]) {
      return AI_RESPONSES[lowercaseInput];
    }
    for (const key of Object.keys(AI_RESPONSES)) {
      if (lowercaseInput.includes(key)) {
        return AI_RESPONSES[key];
      }
    }
    return AI_RESPONSES['default'];
  };
  
  const handleUserMessage = async (text) => {
    setMessages([...messages, { sender: 'user', text }]);
    setInput('');
    
    const healthData = userData || {};
    const aiResponse = await getAIResponse(text, healthData);
    
    // Truncate if too long
    const { text: truncatedText, truncated } = truncateResponse(aiResponse);
    setMessages(prev => [...prev, { sender: 'ai', text: truncatedText, fullText: truncated ? aiResponse : null }]);
    
    if (truncated) {
      toast({
        title: "Response Truncated",
        description: "The AI response was shortened. Click 'Read More' to see the full answer.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleSendMessage = () => {
    if (input.trim()) {
      handleUserMessage(input);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleSendMessage();
    }
  };
  
  const handleSuggestedQuery = (query) => {
    handleUserMessage(query);
  };
  
  // Handle Read More for truncated responses
  const handleReadMore = (fullText, index) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, text: fullText, fullText: null } : msg
    ));
  };
  
  const drawerWidth = useBreakpointValue({ base: "100%", md: "400px" });
  
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
      finalFocusRef={null}
    >
      <DrawerOverlay />
      <DrawerContent width={drawerWidth}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" bg={useColorModeValue('blue.500', 'blue.700')} color="white">
          <Flex align="center">
            <FaRobot style={{ marginRight: '8px', marginBottom:'10px' }} />
            <Text>Heart Health Assistant</Text>
          </Flex>
        </DrawerHeader>

        <DrawerBody p={0}>
          <VStack spacing={0} h="100%">
            <Box flex="1" width="100%" p={4} overflowY="auto" maxHeight="calc(100vh - 200px)">
              {messages.length === 0 ? (
                <VStack spacing={4} align="center" justify="center" height="100%">
                  <Avatar icon={<FaRobot fontSize="1.5rem"/>} bg="blue.500" size="xl" />
                  <Text fontWeight="bold" fontSize="lg">Hello! I'm your Heart Health Assistant</Text>
                  <Text textAlign="center">Ask about heart health or the app.</Text>
                  
                  <HStack spacing={2} mt={4} flexWrap="wrap" justifyContent="center">
                    {suggestedQueries.map((query, index) => (
                      <Tag 
                        key={index}
                        size="lg" 
                        borderRadius="full" 
                        variant="solid" 
                        colorScheme="blue"
                        cursor="pointer"
                        position={'relative'}
                        bottom={50}
                        onClick={() => handleSuggestedQuery(query.text)}
                        p={2}
                        m={1}
                      >
                        <HStack spacing={1}>
                          <Box as={query.icon} />
                          <Text>{query.text}</Text>
                        </HStack>
                      </Tag>
                    ))}
                  </HStack>
                </VStack>
              ) : (
                <VStack spacing={4} align="stretch">
                  {messages.map((message, index) => (
                    <Flex 
                      key={index} 
                      justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                    >
                      <Box
                        bg={message.sender === 'user' ? userBubbleColor : aiBubbleColor}
                        color={message.sender === 'user' ? 'black' : 'black'}
                        borderRadius="lg"
                        px={4}
                        py={2}
                        maxWidth="80%"
                        boxShadow="sm"
                      >
                        <Text>{message.text}</Text>
                        {message.fullText && (
                          <Button
                            size="xs"
                            variant="link"
                            color="blue.500"
                            mt={1}
                            onClick={() => handleReadMore(message.fullText, index)}
                          >
                            Read More
                          </Button>
                        )}
                      </Box>
                    </Flex>
                  ))}
                  {loading && (
                    <Flex justify="flex-start">
                      <Box
                        bg={aiBubbleColor}
                        borderRadius="lg"
                        px={4}
                        py={2}
                        maxWidth="80%"
                      >
                        <Spinner size="sm" color="blue.500" mr={2} />
                        <Text as="span">Typing...</Text>
                      </Box>
                    </Flex>
                  )}
                  <div ref={chatEndRef} />
                </VStack>
              )}
            </Box>
            
            <Box
              width="100%"
              p={4}
              borderTopWidth="1px"
              borderColor={borderColor}
              bg={bgColor}
            >
              <InputGroup size="md">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  bg={inputBgColor}
                  disabled={loading}
                />
                <InputRightElement width="3rem">
                  <IconButton
                    h="1.75rem"
                    w="1.75rem"
                    size="sm"
                    icon={<FaPaperPlane />}
                    colorScheme="red"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                  />
                </InputRightElement>
              </InputGroup>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default AIAssistant;