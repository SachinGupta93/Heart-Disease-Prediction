import React from 'react';
import { Box, Flex, Heading, Text, Icon } from '@chakra-ui/react';
import { FaHeartbeat } from 'react-icons/fa';

const Header = () => {
  return (
    <Box bg="blue.600" color="white" px={4} py={3}>
      <Flex maxWidth="1200px" mx="auto" align="center">
        <Icon as={FaHeartbeat} w={8} h={8} mr={3} />
        <Box>
          <Heading size="lg">Heart Disease Prediction</Heading>
          <Text fontSize="sm">Powered by Machine Learning</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;
