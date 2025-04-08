import React, { useState } from 'react';
import { Box, VStack, Heading, FormControl, FormLabel, Input, Select, Button, Text, useToast, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip } from '@chakra-ui/react';
import { getEnsemblePrediction } from '../services/api';

const RiskSimulator = ({ onPredictionResult }) => {
  const [values, setValues] = useState({
    age: 45,
    sex: 'male',
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 'no',
    restecg: 0,
    thalach: 150,
    exang: 'no',
    oldpeak: 0,
    slope: 1,
    ca: 0,
    thal: 1
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const toast = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSliderChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSimulation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format data for API
      const formattedData = {
        age: parseInt(values.age),
        sex: values.sex === 'male' ? 1 : 0,
        cp: parseInt(values.cp),
        trestbps: parseInt(values.trestbps),
        chol: parseInt(values.chol),
        fbs: values.fbs === 'yes' ? 1 : 0,
        restecg: parseInt(values.restecg),
        thalach: parseInt(values.thalach),
        exang: values.exang === 'yes' ? 1 : 0,
        oldpeak: parseFloat(values.oldpeak),
        slope: parseInt(values.slope),
        ca: parseInt(values.ca),
        thal: parseInt(values.thal)
      };
      
      // Call the real API
      const response = await getEnsemblePrediction(formattedData);
      
      if (response.success) {
        const result = {
          prediction: response.data.prediction,
          probability: response.data.probability,
          probability_percent: (response.data.probability * 100).toFixed(1),
          risk_level: response.data.risk_level,
          message: response.data.message || '',
          inputs: formattedData
        };
        
        // Call parent component callback
        if (onPredictionResult) {
          onPredictionResult(result);
        }
        
        toast({
          title: 'Simulation Complete',
          description: `Risk level: ${result.risk_level}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to get prediction from API');
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setError('Failed to run simulation. Please try again.');
      
      toast({
        title: 'Error',
        description: 'Failed to run simulation. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box p={5} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Risk Factor Simulator</Heading>
        <Text>Adjust the values to see how they affect your heart disease risk.</Text>
        
        {error && (
          <Text color="red.500">{error}</Text>
        )}
        
        <FormControl>
          <FormLabel>Age</FormLabel>
          <Slider 
            min={20} 
            max={100} 
            step={1}
            value={values.age}
            onChange={(val) => handleSliderChange('age', val)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg='blue.500'
              color='white'
              placement='top'
              isOpen={showTooltip}
              label={`${values.age} years`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
          <HStack justify="space-between">
            <Text fontSize="sm">20</Text>
            <Text fontSize="sm" fontWeight="bold">{values.age} years</Text>
            <Text fontSize="sm">100</Text>
          </HStack>
        </FormControl>
        
        <FormControl>
          <FormLabel>Sex</FormLabel>
          <Select name="sex" value={values.sex} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Chest Pain Type</FormLabel>
          <Select name="cp" value={values.cp} onChange={handleChange}>
            <option value="0">Typical Angina</option>
            <option value="1">Atypical Angina</option>
            <option value="2">Non-anginal Pain</option>
            <option value="3">Asymptomatic</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Resting Blood Pressure (mm Hg)</FormLabel>
          <Slider 
            min={90} 
            max={200} 
            step={5}
            value={values.trestbps}
            onChange={(val) => handleSliderChange('trestbps', val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <HStack justify="space-between">
            <Text fontSize="sm">90</Text>
            <Text fontSize="sm" fontWeight="bold">{values.trestbps} mm Hg</Text>
            <Text fontSize="sm">200</Text>
          </HStack>
        </FormControl>
        
        <FormControl>
          <FormLabel>Cholesterol (mg/dl)</FormLabel>
          <Slider 
            min={100} 
            max={500} 
            step={10}
            value={values.chol}
            onChange={(val) => handleSliderChange('chol', val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <HStack justify="space-between">
            <Text fontSize="sm">100</Text>
            <Text fontSize="sm" fontWeight="bold">{values.chol} mg/dl</Text>
            <Text fontSize="sm">500</Text>
          </HStack>
        </FormControl>
        
        <FormControl>
          <FormLabel>Fasting Blood Sugar {'>'} 120 mg/dl</FormLabel>
          <Select name="fbs" value={values.fbs} onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Resting ECG</FormLabel>
          <Select name="restecg" value={values.restecg} onChange={handleChange}>
            <option value="0">Normal</option>
            <option value="1">ST-T Wave Abnormality</option>
            <option value="2">Left Ventricular Hypertrophy</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Maximum Heart Rate</FormLabel>
          <Slider 
            min={60} 
            max={220} 
            step={5}
            value={values.thalach}
            onChange={(val) => handleSliderChange('thalach', val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <HStack justify="space-between">
            <Text fontSize="sm">60</Text>
            <Text fontSize="sm" fontWeight="bold">{values.thalach} bpm</Text>
            <Text fontSize="sm">220</Text>
          </HStack>
        </FormControl>
        
        <FormControl>
          <FormLabel>Exercise Induced Angina</FormLabel>
          <Select name="exang" value={values.exang} onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>ST Depression Induced by Exercise</FormLabel>
          <Slider 
            min={0} 
            max={6.2} 
            step={0.1}
            value={values.oldpeak}
            onChange={(val) => handleSliderChange('oldpeak', val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <HStack justify="space-between">
            <Text fontSize="sm">0</Text>
            <Text fontSize="sm" fontWeight="bold">{values.oldpeak}</Text>
            <Text fontSize="sm">6.2</Text>
          </HStack>
        </FormControl>
        
        <FormControl>
          <FormLabel>Slope of Peak Exercise ST Segment</FormLabel>
          <Select name="slope" value={values.slope} onChange={handleChange}>
            <option value="0">Upsloping</option>
            <option value="1">Flat</option>
            <option value="2">Downsloping</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Number of Major Vessels Colored by Fluoroscopy</FormLabel>
          <Select name="ca" value={values.ca} onChange={handleChange}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Thalassemia</FormLabel>
          <Select name="thal" value={values.thal} onChange={handleChange}>
            <option value="1">Normal</option>
            <option value="2">Fixed Defect</option>
            <option value="3">Reversible Defect</option>
          </Select>
        </FormControl>
        
        <Button
          colorScheme="teal"
          onClick={handleSimulation}
          isLoading={isLoading}
          loadingText="Simulating"
        >
          Run Simulation
        </Button>
      </VStack>
    </Box>
  );
};

export default RiskSimulator;