import React from 'react';
import { Box, Heading, Text, Button, Image, Flex, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
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
        maxW="500px"
        textAlign="center"
      >
        <Heading
          display="inline-block"
          as="h1"
          size="xl"
          color="red.500"
          mb={4}
        >
          404 - Page Not Found
        </Heading>

        <Text fontSize="lg" mb={6}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Button
          as={RouterLink}
          to="/"
          colorScheme="blue"
          size="lg"
          mb={4}
        >
          Return Home
        </Button>
      </Flex>
    </Box>
  );
};

export default NotFound;