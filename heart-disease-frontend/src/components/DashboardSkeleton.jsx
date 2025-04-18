import React from 'react';
import {
  Box, Container, Heading, Text, Flex, SimpleGrid, HStack, VStack,
  Skeleton, SkeletonText, SkeletonCircle, useColorModeValue, Button, Icon, Divider, Badge
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaHeartbeat, FaChartBar, FaHistory, FaUserMd, FaClipboardCheck, FaCalendarAlt, FaServer, FaComments, FaArrowRight, FaInfoCircle, FaChartLine } from 'react-icons/fa';

const DashboardSkeleton = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  
  // Create enhanced animation keyframes
  const pulseAnimation = keyframes`
    0% { opacity: 0.6; transform: scale(0.98); }
    50% { opacity: 0.9; transform: scale(1); }
    100% { opacity: 0.6; transform: scale(0.98); }
  `;
  
  const shimmerAnimation = keyframes`
    0% { background-position: -768px 0; }
    100% { background-position: 768px 0; }
  `;
  
  const floatAnimation = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  `;
  
  const waveAnimation = keyframes`
    0% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(2px) translateY(-2px); }
    50% { transform: translateX(0) translateY(0); }
    75% { transform: translateX(-2px) translateY(2px); }
    100% { transform: translateX(0) translateY(0); }
  `;
  
  // Animation variables
  const pulse = `${pulseAnimation} 2s ease-in-out infinite`;
  const shimmer = `${shimmerAnimation} 1.8s linear infinite`;
  const float = `${floatAnimation} 3s ease-in-out infinite`;
  const wave = `${waveAnimation} 4s ease-in-out infinite`;
  
  // Custom styled skeleton props
  const skeletonProps = {
    startColor: useColorModeValue('gray.100', 'gray.700'),
    endColor: useColorModeValue('gray.300', 'gray.500'),
    speed: '1.2s',
  };

  // Chart pattern background function
  const getChartPattern = (index) => {
    const patterns = [
      // Line chart pattern
      {
        content: '""',
        position: 'absolute',
        top: '60%',
        left: '10%',
        width: '80%',
        height: '2px',
        background: useColorModeValue('gray.300', 'gray.500'),
        borderRadius: '1px',
        zIndex: 1,
        _before: {
          content: '""',
          position: 'absolute',
          top: '-10px',
          left: '10%',
          width: '60%',
          height: '2px',
          background: useColorModeValue('gray.200', 'gray.600'),
          borderRadius: '1px',
        },
        _after: {
          content: '""',
          position: 'absolute',
          top: '-20px',
          left: '30%',
          width: '40%',
          height: '2px',
          background: useColorModeValue('gray.200', 'gray.600'),
          borderRadius: '1px',
        }
      },
      // Bar chart pattern
      {
        content: '""',
        position: 'absolute',
        bottom: '30%',
        left: '15%',
        width: '10%',
        height: '40%',
        background: useColorModeValue('gray.200', 'gray.600'),
        borderRadius: '3px 3px 0 0',
        zIndex: 1,
        _before: {
          content: '""',
          position: 'absolute',
          bottom: '0',
          left: '150%',
          width: '10%',
          height: '60%',
          background: useColorModeValue('gray.300', 'gray.500'),
          borderRadius: '3px 3px 0 0',
        },
        _after: {
          content: '""',
          position: 'absolute',
          bottom: '0',
          left: '300%',
          width: '10%',
          height: '25%',
          background: useColorModeValue('gray.200', 'gray.600'),
          borderRadius: '3px 3px 0 0',
        }
      },
      // Donut chart pattern
      {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '60%',
        height: '60%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: `8px solid ${useColorModeValue('gray.200', 'gray.600')}`,
        borderTopColor: useColorModeValue('gray.300', 'gray.500'),
        borderRightColor: useColorModeValue('gray.300', 'gray.500'),
        zIndex: 1
      }
    ];
    
    return patterns[index % patterns.length];
  };

  return (
    <>
      {/* Welcome Section Skeleton */}
      <Flex direction="column" align="center" textAlign="center" py={10} mb={8}>
        <SkeletonCircle size="16" mb={4} {...skeletonProps} animation={float} />
        <Skeleton height="40px" width="80%" maxW="500px" mb={4} {...skeletonProps} />
        <SkeletonText mt="4" noOfLines={2} spacing="4" width="70%" maxW="600px" mb={8} {...skeletonProps} />
        <Skeleton height="48px" width="200px" borderRadius="md" animation={pulse} {...skeletonProps} />
      </Flex>
      
      {/* Statistics Section Skeleton - Enhanced with chart-like patterns */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {[0, 1, 2].map((i) => (
          <Box 
            key={`stat-skeleton-${i}`}
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            bg={bgColor}
            boxShadow="sm"
            animation={`${pulse} ${1.8 + i * 0.2}s ease-in-out infinite`}
            transition="all 0.3s ease"
            position="relative"
            overflow="hidden"
            _after={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(to right, transparent 0%, ${useColorModeValue('rgba(255,255,255,0.4)', 'rgba(60,60,60,0.4)')} 50%, transparent 100%)`,
              backgroundSize: '950px 100%',
              animation: shimmer,
              zIndex: 1
            }}
          >
            <Flex align="center" mb={3} position="relative" zIndex={2}>
              <SkeletonCircle size="12" mr={3} {...skeletonProps} animation={float} />
              <Box width="full">
                <Skeleton height="20px" width="80%" mb={2} {...skeletonProps} />
                <Skeleton height="28px" width="50%" mb={2} {...skeletonProps} />
              </Box>
            </Flex>
            
            {/* Chart-like visual element */}
            <Box 
              position="relative" 
              height="80px" 
              mt={4} 
              borderRadius="md" 
              overflow="hidden"
              animation={wave}
              {...getChartPattern(i)}
            />
          </Box>
        ))}
      </SimpleGrid>
      
      {/* AI Assistant Section Skeleton - Enhanced */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg={bgColor}
        boxShadow="sm"
        mb={8}
        animation={pulse}
        position="relative"
        overflow="hidden"
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to right, transparent 0%, ${useColorModeValue('rgba(255,255,255,0.4)', 'rgba(60,60,60,0.4)')} 50%, transparent 100%)`,
          backgroundSize: '950px 100%',
          animation: shimmer,
        }}
      >
        <Flex align="center" position="relative" zIndex={2}>
          <SkeletonCircle size="12" mr={4} {...skeletonProps} animation={float} />
          <Box flex="1">
            <Skeleton height="24px" width="180px" mb={2} {...skeletonProps} />
            <SkeletonText mt="2" noOfLines={2} spacing="2" {...skeletonProps} />
          </Box>
          <Skeleton height="20px" width="20px" {...skeletonProps} animation={pulse} />
        </Flex>
      </Box>
      
      {/* Featured Services Section Skeleton - Enhanced with visual flair */}
      <Box mt={8} mb={8}>
        <Flex align="center" mb={6}>
          <SkeletonCircle size="10" mr={3} {...skeletonProps} animation={float} />
          <Skeleton height="28px" width="180px" {...skeletonProps} />
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {[1, 2, 3].map((i) => (
            <Box 
              key={`service-skeleton-${i}`}
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
              animation={`${pulse} ${1.8 + i * 0.2}s ease-in-out infinite`}
              transition="all 0.3s ease"
              position="relative"
              overflow="hidden"
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(to right, transparent 0%, ${useColorModeValue('rgba(255,255,255,0.4)', 'rgba(60,60,60,0.4)')} 50%, transparent 100%)`,
                backgroundSize: '950px 100%',
                animation: `${shimmer} ${1.8 + i * 0.3}s linear infinite`,
              }}
            >
              <Flex direction="column" align="center" textAlign="center" position="relative" zIndex={2}>
                <SkeletonCircle size="16" mb={4} {...skeletonProps} animation={float} />
                <Skeleton height="24px" width="70%" mb={3} {...skeletonProps} />
                <SkeletonText mt="2" noOfLines={3} spacing="2" textAlign="center" {...skeletonProps} />
                
                {/* Service chart placeholder */}
                <Box 
                  position="relative" 
                  height="60px" 
                  width="80%" 
                  mt={4} 
                  borderRadius="md" 
                  overflow="hidden"
                  opacity={0.7}
                  animation={wave}
                >
                  <Box 
                    position="absolute"
                    width="100%"
                    height="100%"
                    top={0}
                    left={0}
                    background={`repeating-linear-gradient(
                      45deg,
                      ${useColorModeValue('gray.200', 'gray.600')},
                      ${useColorModeValue('gray.200', 'gray.600')} 10px,
                      ${useColorModeValue('gray.100', 'gray.700')} 10px,
                      ${useColorModeValue('gray.100', 'gray.700')} 20px
                    )`}
                  />
                </Box>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      
      <Divider my={8} />
      
      {/* Recent Predictions Section Skeleton - Enhanced */}
      <Box mb={8}>
        <Flex align="center" mb={6}>
          <SkeletonCircle size="10" mr={3} {...skeletonProps} animation={float} />
          <Skeleton height="28px" width="240px" {...skeletonProps} />
        </Flex>
        
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Box 
              key={`prediction-skeleton-${i}`}
              p={4} 
              borderWidth="1px" 
              borderRadius="md"
              borderColor={borderColor}
              animation={`${pulse} ${1.5 + i * 0.15}s ease-in-out infinite`}
              position="relative"
              overflow="hidden"
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(to right, transparent 0%, ${useColorModeValue('rgba(255,255,255,0.3)', 'rgba(60,60,60,0.3)')} 50%, transparent 100%)`,
                backgroundSize: '950px 100%',
                animation: `${shimmer} ${1.5 + i * 0.25}s linear infinite`,
                zIndex: 1
              }}
            >
              <HStack justify="space-between" position="relative" zIndex={2}>
                <VStack align="start" spacing={1}>
                  <Flex align="center">
                    <SkeletonCircle size="6" mr={2} {...skeletonProps} />
                    <Skeleton height="20px" width="150px" {...skeletonProps} />
                  </Flex>
                  <Flex align="center">
                    <SkeletonCircle size="6" mr={2} {...skeletonProps} />
                    <Skeleton height="16px" width="120px" {...skeletonProps} />
                  </Flex>
                </VStack>
                
                {/* Prediction result indicator with animation */}
                <Flex 
                  direction="column" 
                  align="center" 
                  justify="center"
                  animation={float}
                >
                  <Skeleton height="28px" width="60px" borderRadius="lg" {...skeletonProps} />
                  <Box 
                    mt={2}
                    width="40px"
                    height="4px"
                    background={`linear-gradient(to right, ${useColorModeValue('gray.200', 'gray.600')}, ${useColorModeValue('blue.200', 'blue.600')})`}
                    borderRadius="full"
                  />
                </Flex>
              </HStack>
            </Box>
          ))}
        </VStack>
        
        <HStack spacing={4} justify="flex-end" mt={4}>
          <Skeleton height="40px" width="180px" borderRadius="md" {...skeletonProps} animation={pulse} />
          <Skeleton height="40px" width="180px" borderRadius="md" {...skeletonProps} animation={pulse} />
        </HStack>
      </Box>
    </>
  );
};

export default DashboardSkeleton;