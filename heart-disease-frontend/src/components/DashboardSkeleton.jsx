import React from 'react';
import {
  Box, Container, Heading, Text, Flex, SimpleGrid,
  Skeleton, SkeletonText, useColorModeValue
} from '@chakra-ui/react';

const DashboardSkeleton = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      <Flex align="center" mb={6}>
        <Heading as="h1" size="xl">
          <Skeleton height="36px" width="300px" />
        </Heading>
      </Flex>
      
      <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="4" width="70%" mb={8} />

      {/* Current Risk Score Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Flex justify="space-between" align="center" mb={4}>
          <Skeleton height="24px" width="200px" />
          <Skeleton height="24px" width="24px" borderRadius="full" />
        </Flex>
        
        <Box mb={6}>
          <Flex justify="space-between" align="center" mb={2}>
            <Skeleton height="20px" width="80px" />
            <Skeleton height="20px" width="120px" borderRadius="full" />
          </Flex>
          
          <Skeleton height="24px" width="100%" mb={2} borderRadius="full" />
          
          <Flex justify="space-between">
            <Skeleton height="16px" width="60px" />
            <Skeleton height="16px" width="90px" />
            <Skeleton height="16px" width="60px" />
          </Flex>
        </Box>
        
        <Flex justify="center">
          <Skeleton height="40px" width="160px" borderRadius="md" />
        </Flex>
      </Box>

      {/* Prediction History Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Flex justify="space-between" align="center" mb={4}>
          <Skeleton height="24px" width="200px" />
          <Skeleton height="24px" width="24px" borderRadius="full" />
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
          {[1, 2, 3].map((_, index) => (
            <Box 
              key={index} 
              p={4} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor={borderColor}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Skeleton height="20px" width="120px" />
                <Skeleton height="20px" width="100px" borderRadius="full" />
              </Flex>
              
              <SkeletonText mt="2" noOfLines={1} spacing="4" skeletonHeight="3" />
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Health Insights Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Flex justify="space-between" align="center" mb={4}>
          <Skeleton height="24px" width="150px" />
          <Skeleton height="24px" width="24px" borderRadius="full" />
        </Flex>
        
        <SkeletonText mt="2" noOfLines={2} spacing="4" skeletonHeight="3" mb={6} />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Skeleton height="100px" borderRadius="md" />
          <Skeleton height="100px" borderRadius="md" />
        </SimpleGrid>
        
        <Flex justify="center">
          <Skeleton height="40px" width="180px" borderRadius="md" />
        </Flex>
      </Box>
    </>
  );
};

export default DashboardSkeleton;