import React from 'react';
import { Flex, Spinner, Text, VStack, Box, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Flex 
      height="100vh" 
      width="100%" 
      align="center" 
      justify="center" 
      bg={bgColor}
    >
      <VStack spacing={6}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading...
          </Text>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Box maxW="300px" textAlign="center">
            <Text fontSize="sm" color={textColor}>
              Preparing your heart health platform
            </Text>
          </Box>
        </motion.div>
      </VStack>
    </Flex>
  );
};

export default LoadingScreen;