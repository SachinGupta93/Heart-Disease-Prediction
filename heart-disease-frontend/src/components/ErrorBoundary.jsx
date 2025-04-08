import React, { Component } from 'react';
import { Box, Heading, Text, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log to an error monitoring service like Sentry here
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error}
        resetErrorBoundary={() => {
          this.setState({ 
            hasError: false,
            error: null,
            errorInfo: null
          });
        }}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      minHeight="calc(100vh - 180px)" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      p={4}
    >
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        bg={bgColor}
        p={8}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="xl"
        maxW="600px"
        textAlign="center"
      >
        <Heading
          display="inline-block"
          as="h1"
          size="xl"
          color="red.500"
          mb={4}
        >
          Something went wrong
        </Heading>

        <Text fontSize="lg" mb={6}>
          We apologize for the inconvenience. The application encountered an unexpected error.
        </Text>
        
        {error && (
          <Box 
            bg="red.50" 
            color="red.700" 
            p={4} 
            borderRadius="md" 
            mb={6}
            maxW="100%"
            overflowX="auto"
          >
            <Text fontFamily="monospace" fontSize="sm">
              {error.toString()}
            </Text>
          </Box>
        )}
        
        <Flex gap={4} flexDir={{ base: "column", sm: "row" }}>
          <Button
            onClick={resetErrorBoundary}
            colorScheme="blue"
            size="lg"
            mb={{ base: 2, sm: 0 }}
          >
            Try Again
          </Button>
          <Button
            as={RouterLink}
            to="/"
            variant="outline"
            colorScheme="blue"
            size="lg"
          >
            Return Home
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ErrorBoundary;