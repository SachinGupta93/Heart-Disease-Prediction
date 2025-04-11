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

// Keep AI_RESPONSES as fallback in case API fails
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
  
  // Project-specific responses
  'thalach': 'Maximum heart rate (thalach) during exercise is an important indicator of cardiovascular health. A higher maximum heart rate is generally better, but extremely high rates can also indicate issues. The typical formula is 220 minus your age.',
  'trestbps': 'Resting blood pressure (trestbps) is the pressure in your arteries when your heart is at rest. Normal range is below 120/80 mmHg. Higher values may indicate hypertension, a risk factor for heart disease.',
  'oldpeak': 'ST depression (oldpeak) refers to how much the ST segment on an ECG is depressed during exercise compared to rest. Higher values may indicate ischemia, or insufficient blood flow to the heart muscle.',
  'ca': 'The number of major vessels (ca) colored by fluoroscopy ranges from 0-3, with higher numbers indicating more severe coronary artery disease.',
  'thal': 'Thalassemia (thal) is a blood disorder that affects how your body makes hemoglobin. In the context of heart disease prediction, different types of thalassemia can impact your risk assessment.',
  'cp': 'Chest pain type (cp) is categorized as: 1 = typical angina, 2 = atypical angina, 3 = non-anginal pain, 4 = asymptomatic. Different types of chest pain indicate different levels of heart disease risk.',
  'slope': 'The slope of the peak exercise ST segment can be: 1 = upsloping, 2 = flat, 3 = downsloping. This is measured during an exercise stress test and helps evaluate heart function.',
  'exang': 'Exercise-induced angina (exang) means experiencing chest pain during physical activity, which can be a sign that your heart isn\'t getting enough oxygen during exertion.',
  'fbs': 'Fasting blood sugar (fbs) above 120 mg/dl indicates potential diabetes, which is a significant risk factor for heart disease. Maintaining normal blood sugar levels is important for heart health.',
  'restecg': 'Resting electrocardiographic results (restecg) show the electrical activity of your heart at rest. Abnormal readings may indicate existing heart damage or problems.',
  'sex': 'In heart disease risk assessment, biological sex is a factor as men generally have a higher risk of heart disease than women, especially before menopause. After menopause, women\'s risk increases significantly.',
  'age': 'Age is a significant risk factor for heart disease. Risk increases as you get older, particularly after age 45 for men and 55 for women.',
  
  // App tips
  'feature importance chart': 'The Feature Importance chart shows which health factors have the strongest influence on heart disease prediction. Factors at the top have more impact on your risk assessment.',
  'shap values': 'SHAP values in the Explainable AI section show how each of your health metrics affects your prediction - red points push your risk higher, while blue points lower your risk.',
  'risk factors chart': 'The Risk Factors chart shows how your values compare to typical ranges. Values outside the normal range may contribute to higher heart disease risk.',
  'simulation': 'Use the Risk Simulator to see how changing different health metrics might affect your heart disease risk. This can help you set health improvement goals.',
  'prediction history': 'Your Prediction History shows how your risk has changed over time. Regular improvements in your health metrics should reflect as a lower risk trend.',
  'model comparison chart': 'The Model Comparison chart shows how different AI approaches assess your risk. When multiple models agree, it provides more confidence in the prediction.',
  
  // Default response when no matching keywords are found
  'default': 'I\'m here to help with heart health questions and using this application. You can ask about heart disease, risk factors, app features, or interpreting your results. Try asking something like "What is heart disease?" or "How does the prediction work?"'
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
    open: () => {
      onOpen();
    },
    close: () => {
      onClose();
    },
    addMessage: (text) => {
      handleUserMessage(text);
    }
  }));
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Function to get AI response from backend
  const getAIResponse = async (userInput, healthData) => {
    try {
      setLoading(true);
      
      // Prepare the request data
      const requestData = {
        question: userInput,
        health_data: healthData || {}
      };
      
      // Make API request to the dedicated AI assistant chat endpoint
      const response = await axios.post(`${API_URL}/assistant/chat`, requestData);
      
      if (response.data.success) {
        return response.data.data.response;
      } else {
        // If API call fails, fall back to static responses
        console.error("API error:", response.data.message);
        return getFallbackResponse(userInput);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Fall back to static responses
      return getFallbackResponse(userInput);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback function to search static AI_RESPONSES
  const getFallbackResponse = (userInput) => {
    // Create a lowercase version for comparison
    const lowercaseInput = userInput.toLowerCase();
    
    // Check for exact match in AI_RESPONSES
    if (AI_RESPONSES[lowercaseInput]) {
      return AI_RESPONSES[lowercaseInput];
    }
    
    // Search for partial matches in the input
    for (const key of Object.keys(AI_RESPONSES)) {
      if (lowercaseInput.includes(key)) {
        return AI_RESPONSES[key];
      }
    }
    
    // Return a default response if no matches
    return "I'm not sure how to help with that specific question. You can ask me about heart disease, risk factors, prevention, or how to use this application.";
  };
  
  const handleUserMessage = async (text) => {
    // Add user message to chat
    setMessages([...messages, { sender: 'user', text }]);
    
    // Clear input field
    setInput('');
    
    // Extract health data if available
    const healthData = userData || {};
    
    // Get AI response (now from backend API)
    const aiResponse = await getAIResponse(text, healthData);
    
    // Add AI response to chat
    setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: aiResponse }]);
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
  
  // Responsive width
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
            <FaRobot style={{ marginRight: '8px',marginBottom:'10px' }} />
            <Text>Heart Health Assistant</Text>
          </Flex>
        </DrawerHeader>

        <DrawerBody p={0}>
          <VStack spacing={0} h="100%">
            {/* Chat messages area */}
            <Box flex="1" width="100%" p={4} overflowY="auto" maxHeight="calc(100vh - 200px)">
              {messages.length === 0 ? (
                <VStack spacing={4} align="center" justify="center" height="100%">
                  <Avatar icon={<FaRobot fontSize="1.5rem"/>} bg="blue.500" size="xl" />
                  <Text fontWeight="bold" fontSize="lg">Hello! I'm your Heart Health Assistant</Text>
                  <Text textAlign="center">Ask me anything about heart health or how to use this app.</Text>
                  
                  {/* Suggested queries */}
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
                        <Text as="span">Thinking...</Text>
                      </Box>
                    </Flex>
                  )}
                  <div ref={chatEndRef} />
                </VStack>
              )}
            </Box>
            
            {/* Input area */}
            <Box
              width="100%"
              p={4}
              borderTopWidth="1px"
              borderColor={borderColor}
              bg={bgColor}
            >
              <InputGroup size="md">
                <Input
                  placeholder="Type your question..."
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