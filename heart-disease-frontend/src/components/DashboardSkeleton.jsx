import React from 'react';
import {
  Box, Container, Heading, Text, Flex, SimpleGrid, HStack, VStack,
  Skeleton, SkeletonText, SkeletonCircle, useColorModeValue, Button, Icon, Divider, Badge
} from '@chakra-ui/react';
import { FaHeartbeat, FaChartBar, FaHistory, FaUserMd, FaClipboardCheck, FaCalendarAlt, FaServer, FaComments, FaArrowRight, FaInfoCircle, FaChartLine } from 'react-icons/fa';

const DashboardSkeleton = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');

  return (
    <>
      {/* Welcome Section Skeleton */}
      <Flex direction="column" align="center" textAlign="center" py={10} mb={8}>
        <SkeletonCircle size="16" mb={4} />
        <Skeleton height="40px" width="80%" maxW="500px" mb={4} />
        <SkeletonText mt="4" noOfLines={2} spacing="4" width="70%" maxW="600px" mb={8} />
        <Skeleton height="48px" width="200px" borderRadius="md" />
      </Flex>
      
      {/* Statistics Section Skeleton */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {[1, 2, 3].map((i) => (
          <Box 
            key={`stat-skeleton-${i}`}
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={bgColor}
            boxShadow="sm"
          >
            <Flex align="center" mb={3}>
              <SkeletonCircle size="12" mr={3} />
              <Box width="full">
                <Skeleton height="20px" width="80%" mb={2} />
                <Skeleton height="28px" width="50%" mb={2} />
                <Skeleton height="16px" width="70%" />
              </Box>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
      
      {/* AI Assistant Section Skeleton */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg={bgColor}
        boxShadow="sm"
        mb={8}
      >
        <Flex align="center">
          <SkeletonCircle size="12" mr={4} />
          <Box flex="1">
            <Skeleton height="24px" width="180px" mb={2} />
            <SkeletonText mt="2" noOfLines={2} spacing="2" />
          </Box>
          <Skeleton height="20px" width="20px" />
        </Flex>
      </Box>
      
      {/* Featured Services Section Skeleton */}
      <Box mt={8} mb={8}>
        <Flex align="center" mb={6}>
          <SkeletonCircle size="10" mr={3} />
          <Skeleton height="28px" width="180px" />
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {[1, 2, 3].map((i) => (
            <Box 
              key={`service-skeleton-${i}`}
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
            >
              <Flex direction="column" align="center" textAlign="center">
                <SkeletonCircle size="16" mb={4} />
                <Skeleton height="24px" width="70%" mb={3} />
                <SkeletonText mt="2" noOfLines={3} spacing="2" textAlign="center" />
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      
      <Divider my={8} />
      
      {/* Recent Predictions Section Skeleton */}
      <Box mb={8}>
        <Flex align="center" mb={6}>
          <SkeletonCircle size="10" mr={3} />
          <Skeleton height="28px" width="240px" />
        </Flex>
        
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Box 
              key={`prediction-skeleton-${i}`}
              p={4} 
              borderWidth="1px" 
              borderRadius="md"
              borderColor={borderColor}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Flex align="center">
                    <SkeletonCircle size="6" mr={2} />
                    <Skeleton height="20px" width="150px" />
                  </Flex>
                  <Flex align="center">
                    <SkeletonCircle size="6" mr={2} />
                    <Skeleton height="16px" width="120px" />
                  </Flex>
                </VStack>
                <Skeleton height="28px" width="60px" borderRadius="lg" />
              </HStack>
            </Box>
          ))}
        </VStack>
        
        <HStack spacing={4} justify="flex-end" mt={4}>
          <Skeleton height="40px" width="180px" borderRadius="md" />
          <Skeleton height="40px" width="180px" borderRadius="md" />
        </HStack>
      </Box>
    </>
  );
};

export default DashboardSkeleton;