import React from 'react';
import {
  Box, Flex, SimpleGrid,
  Skeleton, SkeletonText, useColorModeValue
} from '@chakra-ui/react';

const ModelComparisonSkeleton = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      {/* Header skeleton */}
      <Flex align="center" mb={6} justifyContent="center">
        <Skeleton height="36px" width="300px" />
      </Flex>
      
      <SkeletonText mt="2" noOfLines={2} spacing="4" skeletonHeight="3" width="80%" mx="auto" mb={8} />

      {/* Model Metrics Cards Skeleton */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {Array(4).fill(0).map((_, index) => (
          <Box 
            key={index}
            p={5} 
            borderRadius="lg" 
            borderWidth="1px" 
            bg={bgColor} 
            boxShadow="md" 
            borderColor={borderColor}
          >
            <Skeleton height="24px" width="120px" mb={3} />
            <Skeleton height="40px" width="80px" mb={2} />
            <SkeletonText mt="2" noOfLines={1} spacing="4" skeletonHeight="2" />
          </Box>
        ))}
      </SimpleGrid>

      {/* Comparison Chart Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Flex justify="space-between" align="center" mb={4}>
          <Skeleton height="24px" width="180px" />
          <Skeleton height="24px" width="100px" />
        </Flex>
        
        <Skeleton height="300px" width="100%" borderRadius="md" mb={4} />
      </Box>

      {/* Model Details Table Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Skeleton height="24px" width="180px" mb={4} />
        
        <Skeleton height="40px" width="100%" mb={2} />
        
        {Array(4).fill(0).map((_, index) => (
          <Skeleton key={index} height="30px" width="100%" mb={2} />
        ))}
      </Box>
    </>
  );
};

export default ModelComparisonSkeleton;