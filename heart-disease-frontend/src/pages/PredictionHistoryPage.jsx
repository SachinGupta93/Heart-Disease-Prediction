import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import PredictionHistory from '../components/PredictionHistory';

const PredictionHistoryPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <PredictionHistory />
      </Box>
    </Container>
  );
};

export default PredictionHistoryPage;