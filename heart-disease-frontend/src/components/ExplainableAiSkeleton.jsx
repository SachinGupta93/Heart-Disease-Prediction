import React from 'react';
import {
  Box, Flex, SimpleGrid,
  Skeleton, SkeletonText, useColorModeValue
} from '@chakra-ui/react';

const ExplainableAiSkeleton = () => {
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

      {/* Feature Importance Visualization Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Skeleton height="24px" width="250px" mb={6} />
        
        {/* Chart placeholder */}
        <Skeleton height="350px" width="100%" borderRadius="md" mb={4} />
        
        <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="3" width="80%" />
      </Box>

      {/* Feature Details Skeleton */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        {Array(2).fill(0).map((_, index) => (
          <Box 
            key={index}
            p={5} 
            borderRadius="lg" 
            borderWidth="1px" 
            bg={bgColor} 
            boxShadow="md" 
            borderColor={borderColor}
          >
            <Skeleton height="24px" width="180px" mb={4} />
            
            <Skeleton height="200px" width="100%" borderRadius="md" mb={4} />
            
            <SkeletonText mt="2" noOfLines={3} spacing="3" skeletonHeight="3" />
          </Box>
        ))}
      </SimpleGrid>

      {/* Feature Interactions Skeleton */}
      <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
        <Skeleton height="24px" width="200px" mb={6} />
        
        {/* Interaction plot placeholder */}
        <Skeleton height="300px" width="100%" borderRadius="md" mb={4} />
        
        <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="3" width="70%" />
      </Box>
    </>
  );
};

export default ExplainableAiSkeleton;