import React from 'react';
import { Box, Flex, Heading, Text, Icon, Center } from '@chakra-ui/react';
import { FaHeartbeat } from 'react-icons/fa';

const Header = () => {
  return (
    <Box bg="blue.600" color="white" px={4} py={3}>
      <Flex maxWidth="1200px" mx="auto" align="center">
        <Icon as={FaHeartbeat} w={8} h={8} mr={3} />
        <Box display="flex" justifyContent="center" alignItems="center">  
          <Heading size="lg" textAlign="center">Heart Disease Prediction</Heading>
   
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;
