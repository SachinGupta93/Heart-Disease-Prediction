import React from 'react';
import {
  Box, Flex, SimpleGrid,
  Skeleton, SkeletonText, useColorModeValue,
  keyframes
} from '@chakra-ui/react';

const ExplainableAiSkeleton = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Create animation keyframes
  const pulseAnimation = keyframes`
    0% { opacity: 0.6; transform: scale(0.99); }
    50% { opacity: 0.9; transform: scale(1); }
    100% { opacity: 0.6; transform: scale(0.99); }
  `;
  
  const shimmerAnimation = keyframes`
    0% { background-position: -768px 0; }
    100% { background-position: 768px 0; }
  `;
  
  const pulse = `${pulseAnimation} 2s ease-in-out infinite`;
  const shimmer = `${shimmerAnimation} 1.8s linear infinite`;
  
  // Custom styled skeleton props
  const skeletonProps = {
    startColor: useColorModeValue('gray.100', 'gray.700'),
    endColor: useColorModeValue('gray.300', 'gray.500'),
    speed: '1.2s',
  };

  return (
    <>
      {/* Header skeleton */}
      <Flex align="center" mb={6} justifyContent="center">
        <Skeleton height="36px" width="300px" animation={pulse} {...skeletonProps} />
      </Flex>
      
      <SkeletonText mt="2" noOfLines={2} spacing="4" skeletonHeight="3" width="80%" mx="auto" mb={8} {...skeletonProps} />

      {/* Feature Importance Visualization Skeleton */}
      <Box 
        p={6} 
        borderRadius="lg" 
        borderWidth="1px" 
        bg={bgColor} 
        boxShadow="md" 
        mb={8} 
        borderColor={borderColor}
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
          backgroundSize: '1550px 100%',
          animation: shimmer,
        }}
      >
        <Skeleton height="24px" width="250px" mb={6} {...skeletonProps} position="relative" zIndex={2} />
        
        {/* Chart placeholder with pulsing animation */}
        <Box 
          position="relative" 
          zIndex={2}
          animation={pulse}
          borderRadius="md"
          overflow="hidden"
        >
          <Skeleton 
            height="350px" 
            width="100%" 
            borderRadius="md" 
            mb={4} 
            {...skeletonProps}
            _before={{
              content: '""',
              position: 'absolute',
              top: '45%',
              left: '10%',
              width: '80%',
              height: '2px',
              backgroundColor: useColorModeValue('gray.200', 'gray.600'),
              zIndex: 1
            }}
          />
        </Box>
        
        <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="3" width="80%" {...skeletonProps} position="relative" zIndex={2} />
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
            animation={`${pulse} ${2 + index * 0.3}s ease-in-out infinite`}
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
              backgroundSize: '1550px 100%',
              animation: `${shimmer} ${1.8 + index * 0.4}s linear infinite`,
              zIndex: 1
            }}
          >
            <Skeleton height="24px" width="180px" mb={4} {...skeletonProps} position="relative" zIndex={2} />
            
            {/* Chart placeholder with visualization hints */}
            <Box position="relative" zIndex={2}>
              <Skeleton 
                height="200px" 
                width="100%" 
                borderRadius="md" 
                mb={4} 
                {...skeletonProps}
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: index === 0 ? '30%' : '60%',
                  left: '5%',
                  width: '90%',
                  height: index === 0 ? '60%' : '30%',
                  borderRadius: 'md',
                  backgroundColor: useColorModeValue('gray.200', 'gray.600'),
                  opacity: 0.7
                }}
              />
            </Box>
            
            <SkeletonText mt="2" noOfLines={3} spacing="3" skeletonHeight="3" {...skeletonProps} position="relative" zIndex={2} />
          </Box>
        ))}
      </SimpleGrid>

      {/* Feature Interactions Skeleton */}
      <Box 
        p={6} 
        borderRadius="lg" 
        borderWidth="1px" 
        bg={bgColor} 
        boxShadow="md" 
        mb={8} 
        borderColor={borderColor}
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
          backgroundSize: '1550px 100%',
          animation: shimmer,
        }}
      >
        <Skeleton height="24px" width="200px" mb={6} {...skeletonProps} position="relative" zIndex={2} />
        
        {/* Interaction plot placeholder with chart-like pattern */}
        <Box 
          position="relative" 
          zIndex={2}
          borderRadius="md"
          overflow="hidden"
          animation={pulse}
        >
          <Skeleton 
            height="300px" 
            width="100%" 
            borderRadius="md" 
            mb={4}
            {...skeletonProps}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              background: `repeating-linear-gradient(
                45deg,
                ${useColorModeValue('gray.200', 'gray.600')},
                ${useColorModeValue('gray.200', 'gray.600')} 10px,
                ${useColorModeValue('gray.100', 'gray.700')} 10px,
                ${useColorModeValue('gray.100', 'gray.700')} 20px
              )`,
              opacity: 0.3,
              borderRadius: 'md',
              zIndex: 1
            }}
          />
        </Box>
        
        <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="3" width="70%" {...skeletonProps} position="relative" zIndex={2} />
      </Box>
    </>
  );
};

export default ExplainableAiSkeleton;