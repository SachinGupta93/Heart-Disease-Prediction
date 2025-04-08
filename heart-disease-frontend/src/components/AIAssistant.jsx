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
  Kbd,
  Divider,
  Badge,
  Link,
  Spinner,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { FaRobot, FaPaperPlane, FaUser, FaTimes, FaQuestionCircle, FaHistory, FaHeartbeat, FaInfoCircle, FaTools } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// HuggingFace Inference API configuration
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || "";
const HF_MODEL_ID = "google/flan-t5-large"; // A good free model for medical questions
const isHFConfigured = HF_API_KEY && HF_API_KEY.length > 10;

// API configuration settings
const API_CONFIG = {
  timeout: 15000, // 15 seconds timeout
  retryCount: 3,  // Number of retries on failure
  retryDelay: 1000, // Initial delay before retry (increases with backoff)
  requestCache: new Map(), // Cache for recent responses
  cacheExpiry: 300000, // Cache expiry time (5 minutes)
};

// Rate limiting settings
const RATE_LIMIT = {
  maxRequestsPerMinute: 10, // HuggingFace has generous limits for free tier
  requestTimestamps: [],
  resetTimestamps: function() {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < 60000
    );
  },
  isRateLimited: function() {
    this.resetTimestamps();
    return this.requestTimestamps.length >= this.maxRequestsPerMinute;
  },
  addRequest: function() {
    this.requestTimestamps.push(Date.now());
  }
};

// Predefined responses based on keywords - used as fallback if API fails
const AI_RESPONSES = {
  // General app questions
  'dashboard': 'The Dashboard shows an overview of your heart health data, recent predictions, and health tips.',
  'predict': 'You can get a heart disease risk prediction by filling out the form in the Risk Assessment section with your health metrics.',
  'assessment': 'The Risk Assessment feature analyzes your health data to estimate your heart disease risk.',
  'simulator': 'The Risk Simulator allows you to see how changing different health factors might affect your heart disease risk.',
  'history': 'Your Prediction History keeps track of all your previous risk assessments so you can monitor changes over time.',
  'explain': 'The Explainable AI section helps you understand how the AI reached its prediction about your heart disease risk.',
  'features': 'The Feature Importance section shows which health factors have the strongest influence on heart disease risk.',
  'comparison': 'The Model Comparison page demonstrates how different AI models evaluate heart disease risk.',
  'information': 'The Health Information section provides educational content about heart disease, prevention, and management.',
  
  // Heart disease information
  'heart disease': 'Heart disease refers to various conditions that affect the heart, with coronary artery disease being the most common. Risk factors include high blood pressure, high cholesterol, smoking, obesity, and family history.',
  'symptoms': 'Common heart disease symptoms include chest pain/pressure, shortness of breath, pain/numbness in limbs, and fatigue. Some people may not show symptoms until a heart attack occurs.',
  'prevention': 'To prevent heart disease: maintain a healthy diet, exercise regularly, avoid smoking, limit alcohol, manage stress, and get regular check-ups to monitor blood pressure, cholesterol, and blood sugar.',
  'risk factors': 'Major heart disease risk factors include age, sex, family history, smoking, high blood pressure, high cholesterol, diabetes, obesity, stress, and physical inactivity.',
  
  // Help with metrics
  'cholesterol': 'Healthy total cholesterol levels are below 200 mg/dL. LDL (bad) cholesterol should be below 100 mg/dL, and HDL (good) cholesterol should be 60 mg/dL or higher.',
  'blood pressure': 'Normal blood pressure is below 120/80 mmHg. Hypertension stage 1 is 130-139/80-89 mmHg, and stage 2 is 140/90 mmHg or higher.',
  'bmi': 'Body Mass Index (BMI) measures body fat based on height and weight. A healthy BMI range is 18.5-24.9. BMI 25-29.9 is overweight, and 30+ is obese.',
  'diabetes': 'Diabetes is a risk factor for heart disease. Normal fasting blood glucose is below 100 mg/dL. Prediabetes is 100-125 mg/dL, and diabetes is 126 mg/dL or higher.',
  
  // About the app
  'about': 'This is a Heart Disease Prediction application that uses machine learning to estimate your risk of heart disease based on your health metrics. The app includes various features to help you understand your risk factors and make informed health decisions.',
  'how it works': 'Our app uses machine learning models trained on medical data to predict heart disease risk. The models analyze your health metrics (like age, blood pressure, cholesterol) to calculate risk probability.',
  'accuracy': 'Our heart disease prediction models achieve approximately 85-90% accuracy. However, please note that this is not a medical diagnosis - always consult healthcare professionals for medical advice.',
  
  // Default responses
  'hello': 'Hello! I\'m your Heart Health Assistant. How can I help you with heart disease information or using the application?',
  'hi': 'Hi there! I\'m your Heart Health Assistant. Ask me about heart disease or how to use this application!',
  'help': 'I can help with: understanding heart disease, explaining app features, interpreting risk factors, or providing health information. What would you like to know?',
  'thanks': 'You\'re welcome! Feel free to ask if you have any other questions about heart health or using the application.',
  'thank you': 'You\'re welcome! Feel free to ask if you have any other questions about heart health or using the application.',
  
  // Enhanced medical information
  'coronary artery disease': 'Coronary artery disease (CAD) occurs when the arteries that supply blood to the heart muscle become hardened and narrowed due to plaque buildup. This can lead to chest pain (angina), shortness of breath, or a heart attack.',
  'heart attack': 'A heart attack (myocardial infarction) occurs when blood flow to part of the heart is blocked, causing damage to heart muscle. Symptoms include chest pain/pressure, pain in arms/shoulders/jaw, shortness of breath, cold sweat, and nausea. This is a medical emergency - call emergency services immediately if you suspect a heart attack.',
  'angina': 'Angina is chest pain or discomfort that occurs when your heart doesn\'t get enough oxygen-rich blood. It may feel like pressure, squeezing, or fullness in your chest. It\'s often a symptom of coronary artery disease.',
  'arrhythmia': 'Arrhythmia refers to an irregular heartbeat - either too fast, too slow, or with an irregular rhythm. Many arrhythmias are harmless, but some can be serious or life-threatening.',
  'heart failure': 'Heart failure occurs when the heart can\'t pump blood as well as it should. It doesn\'t mean your heart has stopped working, but that it needs support to work more efficiently. Symptoms include shortness of breath, fatigue, and swelling in legs/ankles.',
  
  // Model explanations
  'machine learning': 'Our application uses several machine learning models including Random Forest, Neural Networks, and ensemble methods to predict heart disease risk. These models were trained on medical datasets containing thousands of patient records with known outcomes.',
  'models': 'We use multiple prediction models including Random Forest, Neural Networks, and ensemble methods. Our Model Comparison feature shows how different models may provide slightly different predictions based on the same data.',
  'ensemble': 'Our ensemble model combines predictions from multiple machine learning algorithms to provide more accurate heart disease risk assessment than any single model alone.',
  'neural network': 'The neural network model in our application mimics the human brain\'s structure to identify complex patterns in health data that may indicate heart disease risk.',
  'random forest': 'The Random Forest model analyzes your health metrics by combining many decision trees, each evaluating different aspects of your data to predict heart disease risk.',
  'shap': 'SHAP (SHapley Additive exPlanations) values help explain which factors most strongly influence your prediction. This helps you understand which health metrics are contributing most to your risk assessment.',
  
  // Lifestyle advice
  'diet': 'A heart-healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats (like those in olive oil and avocados). Limit saturated fats, trans fats, sodium, red meat, sweets, and sugar-sweetened beverages.',
  'exercise': 'For heart health, aim for at least 150 minutes of moderate-intensity exercise per week (like brisk walking) or 75 minutes of vigorous exercise (like running). Also include muscle-strengthening activities at least twice a week.',
  'smoking': 'Smoking damages blood vessels, reduces oxygen in the blood, and makes the heart work harder. Quitting smoking is one of the best things you can do for heart health - risk of heart disease drops dramatically within just one year of quitting.',
  'stress': 'Chronic stress may contribute to heart disease risk by raising blood pressure and leading to unhealthy coping behaviors. Stress management techniques include regular exercise, adequate sleep, meditation, deep breathing, and social connection.',
  'alcohol': 'Excessive alcohol consumption can raise blood pressure and add calories to your diet. If you drink alcohol, do so in moderation - up to one drink per day for women and up to two drinks per day for men.',
  'weight': 'Maintaining a healthy weight is important for heart health. Excess weight, especially around the waist, increases risk of high blood pressure, high cholesterol, and type 2 diabetes - all risk factors for heart disease.',
  
  // Default response when no matching keywords are found
  'default': 'I\'m not sure I understand. You can ask me about heart disease, risk factors, app features, or interpreting your results.'
};

// Suggested questions for the user
const SUGGESTED_QUESTIONS = [
  'What is heart disease?',
  'How does the prediction work?',
  'What are the main risk factors?',
  'How can I prevent heart disease?',
  'What do my results mean?',
  'What\'s a healthy cholesterol level?',
  'How accurate is the prediction?',
  'How do I use the simulator?'
];

// Categories for quick navigation
const QUESTION_CATEGORIES = [
  { 
    name: 'Heart Health', 
    icon: <FaHeartbeat />,
    questions: [
      'What is heart disease?',
      'What are common symptoms?',
      'How can I prevent heart disease?',
      'What\'s a healthy blood pressure?'
    ]
  },
  { 
    name: 'Using the App', 
    icon: <FaTools />,
    questions: [
      'How does the prediction work?',
      'How accurate is the prediction?',
      'How do I use the simulator?',
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
      'What should I do if I have high risk?'
    ]
  }
];

const AIAssistant = forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I\'m your Heart Health Assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [useLocalResponse, setUseLocalResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const btnRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const bubbleBgUser = useColorModeValue('blue.100', 'blue.800');
  const bubbleBgAI = useColorModeValue('gray.100', 'gray.700');
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
  
  // Auto-scroll to the bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to get response from HuggingFace Inference API
  const getAIResponse = async (query) => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptHFCall = async () => {
      try {
        // Get chat history for context - last 4 messages max for model context limits
        const recentMessages = messages.slice(-4).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
        ).join('\n');

        // Create system prompt with heart health context
        const systemPrompt = `You are an expert heart health assistant for a heart disease prediction application. 
        Provide concise, accurate information about heart health, disease prevention, and how to interpret prediction results.
        
        This app includes:
        1. Risk assessment - Users input health metrics to get heart disease risk prediction
        2. Dashboard - Overview of health data and predictions
        3. Explainable AI - Shows how the model reached its prediction
        4. Feature Importance - Shows which health factors most influence risk
        5. Model Comparison - Demonstrates how different AI models evaluate risk
        6. Health Information - Educational content about heart disease
        
        Recent conversation:
        ${recentMessages}
        
        User: ${query}
        Assistant:`;

        // HuggingFace Inference API call with timeout protection
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('HuggingFace API request timed out')), 10000)
        );
        
        const apiPromise = fetch(`https://api-inference.huggingface.co/models/${HF_MODEL_ID}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            inputs: systemPrompt,
            parameters: {
              max_length: 300,
              temperature: 0.7,
              top_p: 0.9
            }
          })
        });
        
        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        if (!response.ok) {
          throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract the response text from HuggingFace's response
        let responseText;
        if (Array.isArray(data) && data.length > 0) {
          responseText = data[0].generated_text || "";
          
          // Clean up the response - remove system prompt if included
          if (responseText.includes('Assistant:')) {
            responseText = responseText.split('Assistant:').pop().trim();
          }
        } else if (typeof data === 'object' && data.generated_text) {
          responseText = data.generated_text;
        } else {
          responseText = "I couldn't generate a proper response at the moment.";
        }
        
        setUseLocalResponse(false);
        return responseText;
      } catch (error) {
        console.error(`HuggingFace API error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying HuggingFace API call (${retryCount}/${maxRetries})...`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptHFCall();
        }
        
        // If all retries fail, throw the error to be caught in the calling function
        throw error;
      }
    };
    
    try {
      // Check if HuggingFace is configured
      if (!isHFConfigured) {
        console.log('HuggingFace API not configured, using local response');
        setUseLocalResponse(true);
        return findLocalResponse(query);
      }
      
      // Check for rate limiting
      if (RATE_LIMIT.isRateLimited()) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait a moment before asking another question.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        return "Please wait a moment before asking another question.";
      }
      
      // Add request timestamp for rate limiting
      RATE_LIMIT.addRequest();
      
      // Attempt the API call
      return await attemptHFCall();
    } catch (error) {
      console.error("All HuggingFace API attempts failed:", error);
      setUseLocalResponse(true);
      toast({
        title: "AI service temporarily unavailable",
        description: "Using local responses instead",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return findLocalResponse(query);
    }
  };
  
  const findLocalResponse = (query) => {
    // Convert to lowercase for easier matching
    const lowercaseQuery = query.toLowerCase();
    
    // Check for navigation commands
    if (lowercaseQuery.includes('go to') || lowercaseQuery.includes('navigate to') || lowercaseQuery.includes('show me')) {
      if (lowercaseQuery.includes('dashboard')) {
        setTimeout(() => navigate('/dashboard'), 1000);
        return "I'll take you to the dashboard now.";
      } else if (lowercaseQuery.includes('prediction') || lowercaseQuery.includes('risk assessment')) {
        setTimeout(() => navigate('/prediction'), 1000);
        return "I'll take you to the risk assessment page now.";
      } else if (lowercaseQuery.includes('history')) {
        setTimeout(() => navigate('/history'), 1000);
        return "I'll show you your prediction history now.";
      } else if (lowercaseQuery.includes('simulator')) {
        setTimeout(() => navigate('/simulator'), 1000);
        return "Opening the risk simulator for you.";
      } else if (lowercaseQuery.includes('information') || lowercaseQuery.includes('health info')) {
        setTimeout(() => navigate('/information'), 1000);
        return "I'll take you to the health information section now.";
      }
    }
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
      if (lowercaseQuery.includes(keyword.toLowerCase())) {
        return response;
      }
    }
    
    // Return default response if no keywords match
    return AI_RESPONSES.default;
  };
  
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { sender: 'user', text: input }
    ];
    
    setMessages(newMessages);
    setInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get response from AI API or fallback to local responses
      const aiResponse = useLocalResponse 
        ? findLocalResponse(input)
        : await getAIResponse(input);
      
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: aiResponse }
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later." }
      ]);
    }
  };
  
  const handleQuestionClick = async (question) => {
    // Add user message
    const newMessages = [
      ...messages,
      { sender: 'user', text: question }
    ];
    
    setMessages(newMessages);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get response from AI API or fallback to local responses
      const aiResponse = useLocalResponse 
        ? findLocalResponse(question)
        : await getAIResponse(question);
      
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: aiResponse }
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later." }
      ]);
    }
  };

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    openDrawer: (initialQuestion = '') => {
      if (initialQuestion) {
        setInput(initialQuestion);
        // Option to auto-submit the initial question
        // handleAskQuestion(initialQuestion);
      }
      onOpen();
    }
  }));
  
  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Hello! I\'m your Heart Health Assistant. How can I help you today?'
      }
    ]);
  };
  
  return (
    <>
      <Tooltip label="Ask the AI Assistant" aria-label="Ask the AI Assistant">
        <IconButton
          icon={<FaRobot />}
          colorScheme="blue"
          borderRadius="full"
          position="fixed"
          bottom="65px"
          right="40px"
          size={buttonSize}
          ref={btnRef}
          onClick={onOpen}
          boxShadow="lg"
          aria-label="Open AI Assistant"
          zIndex={3}
        />
      </Tooltip>
      
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={{ base: "full", md: "md" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" display="flex" alignItems="center">
            <FaRobot style={{ marginRight: '10px' }} />
            Heart Health AI Assistant
            <Tooltip label="Clear conversation">
              <IconButton
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={clearChat}
                ml="auto"
                aria-label="Clear chat"
              />
            </Tooltip>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" mb={4}>
              {/* Category buttons */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Topics:
                </Text>
                <HStack spacing={2} overflowX="auto" pb={2} css={{
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
                    borderRadius: '8px',
                  },
                }}>
                  {QUESTION_CATEGORIES.map((category, index) => (
                    <Tag 
                      key={index}
                      size="md"
                      colorScheme={activeCategoryIndex === index ? "blue" : "gray"}
                      cursor="pointer"
                      onClick={() => setActiveCategoryIndex(activeCategoryIndex === index ? null : index)}
                      whiteSpace="nowrap"
                    >
                      <HStack spacing={1}>
                        <Box>{category.icon}</Box>
                        <Box>{category.name}</Box>
                      </HStack>
                    </Tag>
                  ))}
                </HStack>
              </Box>
              
              {/* Show questions for selected category */}
              {activeCategoryIndex !== null && (
                <VStack align="stretch" spacing={2} pb={2}>
                  {QUESTION_CATEGORIES[activeCategoryIndex].questions.map((question, index) => (
                    <Button 
                      key={index}
                      size="sm" 
                      variant="outline"
                      justifyContent="flex-start"
                      onClick={() => handleQuestionClick(question)}
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {question}
                    </Button>
                  ))}
                </VStack>
              )}
            </VStack>
            
            <Divider mb={4} />
            
            {/* Chat messages */}
            <VStack spacing={4} align="stretch" mb={4} overflowY="auto">
              {messages.map((message, index) => (
                <Flex 
                  key={index} 
                  direction={message.sender === 'user' ? 'row-reverse' : 'row'}
                  align="start"
                >
                  <Avatar
                    size="sm"
                    icon={message.sender === 'user' ? <FaUser /> : <FaRobot />}
                    bg={message.sender === 'user' ? 'blue.500' : 'gray.500'}
                    color="white"
                    mr={message.sender === 'user' ? 0 : 2}
                    ml={message.sender === 'user' ? 2 : 0}
                  />
                  <Box
                    maxW="75%"
                    borderRadius="lg"
                    px={4}
                    py={2}
                    bg={message.sender === 'user' ? bubbleBgUser : bubbleBgAI}
                  >
                    <Text>{message.text}</Text>
                  </Box>
                </Flex>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <Flex direction="row" align="start">
                  <Avatar
                    size="sm"
                    icon={<FaRobot />}
                    bg="gray.500"
                    color="white"
                    mr={2}
                  />
                  <Box
                    maxW="75%"
                    borderRadius="lg"
                    px={4}
                    py={2}
                    bg={bubbleBgAI}
                  >
                    <Spinner size="sm" mr={2} />
                    <Text as="span">Thinking...</Text>
                  </Box>
                </Flex>
              )}
              
              {/* For auto-scrolling */}
              <div ref={messagesEndRef} />
            </VStack>
            
            {/* API status indicator */}
            {useLocalResponse && (
              <Alert status="warning" mb={4} borderRadius="md" size="sm">
                <AlertIcon />
                <Text fontSize="sm">Using local responses (OpenAI service unavailable)</Text>
              </Alert>
            )}
            
            {/* Suggested questions */}
            {messages.length < 3 && (
              <Box mb={4}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Suggested questions:
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {SUGGESTED_QUESTIONS.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuestionClick(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </Flex>
              </Box>
            )}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about heart health or app features..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <InputRightElement width="4.5rem">
                <Button 
                  h="1.75rem" 
                  size="sm" 
                  colorScheme="blue"
                  onClick={handleSendMessage}
                  isDisabled={input.trim() === ''}
                >
                  <FaPaperPlane />
                </Button>
              </InputRightElement>
            </InputGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
});

export default AIAssistant;