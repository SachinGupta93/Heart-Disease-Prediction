import React from 'react';
import {
  Box, Flex, SimpleGrid, VStack,
  Skeleton, SkeletonText, useColorModeValue
} from '@chakra-ui/react';

const PredictionFormSkeleton = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box p={6} borderRadius="lg" borderWidth="1px" bg={bgColor} boxShadow="md" mb={8} borderColor={borderColor}>
      {/* Form header skeleton */}
      <Flex align="center" mb={6} justifyContent="center">
        <Skeleton height="32px" width="300px" />
      </Flex>
      
      <SkeletonText mt="2" noOfLines={2} spacing="4" skeletonHeight="3" width="80%" mx="auto" mb={8} />

      {/* Form fields skeleton */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
        {Array(9).fill(0).map((_, index) => (
          <Box key={index} mb={4}>
            <Skeleton height="20px" width="120px" mb={2} />
            <Skeleton height="40px" width="100%" borderRadius="md" />
            {index % 3 === 0 && <SkeletonText mt={1} noOfLines={1} width="80%" skeletonHeight="2" />}
          </Box>
        ))}
      </SimpleGrid>

      {/* Radio buttons skeleton */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {Array(2).fill(0).map((_, index) => (
          <Box key={index} mb={4}>
            <Skeleton height="20px" width="150px" mb={3} />
            <Flex>
              {Array(3).fill(0).map((_, idx) => (
                <Skeleton key={idx} height="24px" width="70px" mr={4} borderRadius="full" />
              ))}
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* Submit button skeleton */}
      <Flex justify="center" mt={8}>
        <Skeleton height="48px" width="200px" borderRadius="md" />
      </Flex>
    </Box>
  );
};

export default PredictionFormSkeleton;