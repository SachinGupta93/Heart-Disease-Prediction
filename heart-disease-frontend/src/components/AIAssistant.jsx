import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Box, 
  Button, 
  Drawer, 
  DrawerBody, 
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
  useBreakpointValue,
  Spinner,
  useToast,
  Image,
  Badge,
  Heading,
  Center
} from '@chakra-ui/react';
import { FaRobot, FaPaperPlane, FaHeartbeat, FaInfoCircle, FaMicrophone, FaStop } from 'react-icons/fa';
import { BsQuestionCircle, BsTools, BsHeartPulseFill, BsListCheck } from 'react-icons/bs';
import axios from 'axios';
import { API_URL } from '../config';

/**
 * AI Assistant Component for Heart Health App
 * Provides a chat interface for users to ask health-related questions
 */
const AIAssistant = forwardRef(({ userData }, ref) => {
  // Drawer state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Chat state
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // References
  const chatEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const toast = useToast();
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('red.500', 'red.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const userBubbleBg = useColorModeValue('blue.50', 'blue.900');
  const userBubbleColor = useColorModeValue('blue.800', 'white');
  const aiBubbleBg = useColorModeValue('red.50', 'red.900');
  const aiBubbleColor = useColorModeValue('gray.800', 'white');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const highlightColor = useColorModeValue('red.500', 'red.300');
  
  // Categories for suggested questions
  const questionCategories = [
    {
      name: "Heart Disease",
      icon: BsHeartPulseFill,
      questions: [
        "What are early signs of heart disease?",
        "How can I lower my risk of heart disease?",
        "What's the difference between heart attack and cardiac arrest?"
      ]
    },
    {
      name: "App Help",
      icon: BsQuestionCircle,
      questions: [
        "How do I use the risk predictor?",
        "What do my prediction results mean?",
        "How accurate is this prediction model?"
      ]
    },
    {
      name: "Risk Factors",
      icon: BsTools,
      questions: [
        "What are modifiable risk factors?",
        "How does cholesterol affect heart health?",
        "Is family history important for heart disease?"
      ]
    },
    {
      name: "Prevention",
      icon: BsListCheck,
      questions: [
        "Best exercises for heart health?",
        "Heart-healthy diet tips?",
        "How can I manage stress for heart health?"
      ]
    }
  ];
  
  // Expose component methods via ref
  useImperativeHandle(ref, () => ({
    open: onOpen,
    close: onClose,
    addMessage: (text) => handleUserMessage(text)
  }));
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Helper for scrolling to bottom of chat
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle sending user message and getting AI response
  const handleUserMessage = async (text) => {
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, { sender: 'user', text }]);
    setInput('');
    
    // Show loading state
    setLoading(true);
    
    try {
      // Get response from API (with fallback handling)
      const response = await getAIResponseWithFallback(text, userData || {});
      
      // Process response (truncate if needed)
      const { processedText, fullText } = processResponse(response);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: processedText, 
        fullText: fullText
      }]);
      
    } catch (error) {
      console.error("Error in AI response:", error);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        isError: true 
      }]);
      
      toast({
        title: "Connection Error",
        description: "Could not reach the AI assistant service.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get AI response with fallback
  const getAIResponseWithFallback = async (userInput, healthData) => {
    try {
      const requestData = {
        question: userInput,
        health_data: healthData || {}
      };
      
      const response = await axios.post(`${API_URL}/assistant/chat`, requestData);
      
      if (response.data && response.data.success) {
        return response.data.data.response;
      }
      
      // If API returns failure but with a message
      if (response.data && response.data.message) {
        console.warn("API returned an error:", response.data.message);
        return getFallbackResponse(userInput);
      }
      
      // Unknown API response format
      return getFallbackResponse(userInput);
    } catch (error) {
      console.error("Error getting AI response:", error);
      return getFallbackResponse(userInput);
    }
  };
  
  // Fallback responses when API fails
  const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Simple keyword matching for fallbacks
    if (input.includes("heart attack") || input.includes("cardiac arrest")) {
      return "A heart attack occurs when blood flow to part of the heart is blocked, while cardiac arrest means the heart suddenly stops beating. Heart attacks can lead to cardiac arrest, but they're different medical emergencies.";
    }
    
    if (input.includes("cholesterol") || input.includes("ldl") || input.includes("hdl")) {
      return "Cholesterol comes in two main types: LDL (often called 'bad' cholesterol) and HDL ('good' cholesterol). High LDL levels can build up in your arteries, increasing heart disease risk. Aim for LDL below 100mg/dL and HDL above 60mg/dL.";
    }
    
    if (input.includes("diet") || input.includes("eat") || input.includes("food")) {
      return "A heart-healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats like those in olive oil and avocados. Limit sodium, added sugars, and saturated fats. The Mediterranean and DASH diets are both excellent for heart health.";
    }
    
    if (input.includes("exercise") || input.includes("activity") || input.includes("workout")) {
      return "For heart health, aim for at least 150 minutes of moderate aerobic activity weekly (like brisk walking). Include strength training twice weekly. Always check with your doctor before starting a new exercise program, especially if you have existing heart conditions.";
    }
    
    // Default fallback
    return "I'm here to help with heart health questions and guide you through using this application. Please feel free to ask me about heart disease risk factors, prevention tips, or how to use the prediction tools.";
  };
  
  // Process and potentially truncate long responses
  const processResponse = (text, maxWords = 80) => {
    const words = text.split(' ');
    if (words.length <= maxWords) {
      return { processedText: text, fullText: null };
    }
    
    return {
      processedText: words.slice(0, maxWords).join(' ') + '...',
      fullText: text
    };
  };
  
  // Send message when button clicked or Enter pressed
  const handleSendMessage = () => {
    if (input.trim()) {
      handleUserMessage(input);
    }
  };
  
  // Handle keyboard input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleSendMessage();
    }
  };
  
  // Handle clicking a suggested question
  const handleSuggestedQuestion = (question) => {
    handleUserMessage(question);
  };
  
  // Expand truncated message
  const handleReadMore = (fullText, index) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, text: fullText, fullText: null } : msg
    ));
  };
  
  // Speech recognition for voice input (if browser supports it)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser.",
        status: "warning",
        duration: 3000
      });
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  const stopListening = () => {
    setIsListening(false);
    window.webkitSpeechRecognition && window.webkitSpeechRecognition().stop();
  };
  
  // Responsive layout
  const drawerWidth = useBreakpointValue({ base: "100%", md: "450px" });
  
  // Message bubble component
  const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <Flex 
        justify={isUser ? 'flex-end' : 'flex-start'} 
        mb={3}
        alignItems="flex-start"
      >
        {!isUser && (
          <Avatar 
            icon={<FaRobot />} 
            bg={highlightColor} 
            color="white" 
            size="sm" 
            mr={2} 
            mt={1} 
          />
        )}
        
        <Box
          maxW="80%"
          bg={isUser ? userBubbleBg : aiBubbleBg}
          color={isUser ? userBubbleColor : aiBubbleColor}
          px={4}
          py={2}
          borderRadius="lg"
          boxShadow="sm"
          borderTopLeftRadius={isUser ? 'lg' : 'sm'}
          borderTopRightRadius={isUser ? 'sm' : 'lg'}
        >
          <Text>{message.text}</Text>
          {message.fullText && (
            <Button
              size="xs"
              variant="link"
              colorScheme="red" 
              mt={1}
              onClick={() => handleReadMore(message.fullText, messages.findIndex(m => m === message))}
            >
              Read More
            </Button>
          )}
        </Box>
        
        {isUser && (
          <Avatar 
            icon={<Text fontSize="xs">You</Text>} 
            bg="blue.500"
            color="white" 
            size="sm" 
            ml={2} 
            mt={1} 
          />
        )}
      </Flex>
    );
  };
  
  // Welcome screen component
  const WelcomeScreen = () => (
    <VStack spacing={8} pt={6} pb={12}>
      <Box 
        bg={cardBgColor} 
        borderRadius="xl" 
        p={6} 
        shadow="md"
        width="100%"
        textAlign="center"
      >
        <Center mb={6}>
          <Avatar 
            size="xl" 
            bg={headerBgColor}
            icon={<FaRobot fontSize="2rem" />}
          />
        </Center>
        <Heading size="md" mb={2}>Heart Health Assistant</Heading>
        <Text mb={4}>
          I can answer your questions about heart health and help you navigate this app.
          What would you like to know?
        </Text>
      </Box>
      
      {questionCategories.map((category, idx) => (
        <Box 
          key={idx} 
          width="100%" 
          bg={cardBgColor} 
          p={4} 
          borderRadius="lg"
          shadow="sm"
        >
          <HStack mb={3}>
            <Box as={category.icon} color={highlightColor} />
            <Text fontWeight="bold">{category.name}</Text>
          </HStack>
          
          <VStack align="stretch" spacing={2}>
            {category.questions.map((question, qIdx) => (
              <Button
                key={qIdx}
                variant="ghost"
                justifyContent="flex-start"
                size="sm"
                leftIcon={<Text fontSize="xs">•</Text>}
                onClick={() => handleSuggestedQuestion(question)}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                {question}
              </Button>
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
  
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
      finalFocusRef={null}
    >
      <DrawerOverlay />
      <DrawerContent width={drawerWidth} bg={bgColor}>
        <DrawerCloseButton color="white" />
        <DrawerHeader bg={headerBgColor} color="white">
          <Flex align="center" justify="space-between">
            <HStack>
              <FaHeartbeat />
              <Text>Heart Health Assistant</Text>
            </HStack>
            {messages.length > 0 && (
              <Badge colorScheme="white" variant="outline" fontSize="xs" px={2}>
                {messages.filter(m => m.sender === 'user').length} Questions
              </Badge>
            )}
          </Flex>
        </DrawerHeader>

        <DrawerBody p={0} bg={bgColor}>
          {/* Chat area with messages or welcome screen */}
          <Box 
            height="calc(100vh - 150px)" 
            overflowY="auto" 
            px={4} 
            py={3}
            ref={scrollAreaRef}
          >
            {messages.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <VStack spacing={4} align="stretch">
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                
                {/* Loading indicator */}
                {loading && (
                  <Flex align="center" ml={10}>
                    <Avatar 
                      icon={<FaRobot />} 
                      bg={highlightColor} 
                      color="white" 
                      size="sm" 
                      mr={2} 
                    />
                    <Box 
                      bg={aiBubbleBg} 
                      color={aiBubbleColor}
                      px={4} 
                      py={2} 
                      borderRadius="lg"
                    >
                      <HStack>
                        <Spinner size="sm" />
                        <Text fontStyle="italic">Thinking...</Text>
                      </HStack>
                    </Box>
                  </Flex>
                )}
                <div ref={chatEndRef} />
              </VStack>
            )}
          </Box>
          
          {/* Input area */}
          <Box
            p={3}
            borderTopWidth="1px"
            borderColor={borderColor}
            bg={cardBgColor}
            position="relative"
          >
            <InputGroup>
              <Input
                placeholder="Type your question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                bg={inputBgColor}
                pr="4.5rem"
                disabled={loading || isListening}
              />
              <InputRightElement width="4.5rem">
                <HStack spacing={1}>
                  <IconButton
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                    icon={isListening ? <FaStop /> : <FaMicrophone />}
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    colorScheme={isListening ? "red" : "gray"}
                  />
                  <IconButton
                    aria-label="Send message"
                    icon={<FaPaperPlane />}
                    size="sm"
                    colorScheme="red"
                    onClick={handleSendMessage}
                    isDisabled={!input.trim() || loading}
                  />
                </HStack>
              </InputRightElement>
            </InputGroup>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default AIAssistant;