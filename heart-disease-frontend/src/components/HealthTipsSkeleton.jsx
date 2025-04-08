import React from 'react';
import {
  Box, Flex, Skeleton, SkeletonText, Stack, Divider,
  useColorModeValue
} from '@chakra-ui/react';

const HealthTipsSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      borderWidth="1px" 
      bg={bgColor} 
      boxShadow="md" 
      borderColor={borderColor}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Skeleton height="24px" width="240px" />
        <Skeleton height="24px" width="24px" borderRadius="full" />
      </Flex>

      <SkeletonText mt={2} noOfLines={2} spacing="2" skeletonHeight="4" />
      
      <Flex my={4}>
        <Skeleton height="20px" width="120px" borderRadius="md" />
      </Flex>
      
      <Divider mb={4} />

      {/* Skeleton for accordions */}
      <Stack spacing={4}>
        <Box>
          <Skeleton height="36px" mb={2} borderRadius="md" />
          <SkeletonText mt={2} noOfLines={4} spacing="3" skeletonHeight="3" />
        </Box>
        
        <Box>
          <Skeleton height="36px" mb={2} borderRadius="md" />
          <SkeletonText mt={2} noOfLines={3} spacing="3" skeletonHeight="3" />
        </Box>
        
        <Box>
          <Skeleton height="36px" mb={2} borderRadius="md" />
          <SkeletonText mt={2} noOfLines={4} spacing="3" skeletonHeight="3" />
        </Box>

        <Box>
          <Skeleton height="36px" mb={2} borderRadius="md" />
          <SkeletonText mt={2} noOfLines={2} spacing="3" skeletonHeight="3" />
        </Box>
      </Stack>
    </Box>
  );
};

export default HealthTipsSkeleton;