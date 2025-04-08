import { useState } from 'react';
import { 
  Button, Box, Text, Textarea, useToast, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, ModalFooter,
  HStack, Icon, VStack, Alert, AlertIcon
} from '@chakra-ui/react';
import { FaStar, FaComment } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { currentUser } = useAuth();

  const handleSubmit = async () => {
    if (!feedback.trim() && rating === 0) {
      setError('Please provide a rating or feedback comment');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create feedback object that would be sent to backend
      const feedbackData = {
        userId: currentUser?.uid || 'anonymous',
        rating,
        comment: feedback.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };
      
      // Log feedback data for debugging
      console.log('Submitting feedback:', feedbackData);
      
      // Track feedback event if a tracking function exists
      if (typeof trackEvent === 'function') {
        trackEvent('feedback_submitted', {
          rating,
          hasComment: feedback.trim().length > 0,
          isLoggedIn: !!currentUser
        });
      }
      
      toast({
        title: 'Feedback received',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset and close
      setIsOpen(false);
      setFeedback('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('There was an error submitting your feedback. Please try again.');
      toast({
        title: 'Error',
        description: 'Could not submit feedback. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating === rating ? 0 : selectedRating);
  };

  return (
    <>
      <Button
        position="fixed"
        bottom="20px"
        right="20px"
        colorScheme="blue"
        boxShadow="md"
        onClick={() => setIsOpen(true)}
        zIndex={10}
        leftIcon={<Icon as={FaComment} />}
      >
        Give Feedback
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Your Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2} fontWeight="medium">
                  How would you rate our Heart Disease Prediction tool?
                </Text>
                <HStack spacing={2}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Icon
                      key={value}
                      as={FaStar}
                      boxSize={8}
                      color={value <= rating ? "yellow.400" : "gray.200"}
                      cursor="pointer"
                      onClick={() => handleRatingClick(value)}
                      _hover={{ color: "yellow.300" }}
                    />
                  ))}
                </HStack>
                <Text mt={1} fontSize="sm" color="gray.500">
                  {rating > 0 ? `You selected ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
                </Text>
              </Box>
              
              <Box>
                <Text mb={2} fontWeight="medium">
                  Please share your experience with our tool:
                </Text>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  size="md"
                  resize="vertical"
                  minH="150px"
                />
              </Box>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Your feedback is valuable to us and helps improve our heart disease prediction tool.
                  All feedback is anonymous unless you choose to include identifying information.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting"
              isDisabled={!feedback.trim() && rating === 0}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FeedbackButton;