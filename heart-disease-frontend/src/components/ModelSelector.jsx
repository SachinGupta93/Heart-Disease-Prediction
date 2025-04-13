import React from 'react';
import { Select, FormControl, FormLabel } from '@chakra-ui/react';

const ModelSelector = ({ selectedModel, onChange }) => {
  const models = [
    { id: 'random_forest', name: 'Random Forest' },
    { id: 'neural_network', name: 'Neural Network' },
    { id: 'logistic_regression', name: 'Logistic Regression' },
    { id: 'svm', name: 'Support Vector Machine' },
    { id: 'ensemble', name: 'Ensemble Model' }
  ];

  return (
    <FormControl>
      <FormLabel>Select Model</FormLabel>
      <Select 
        value={selectedModel} 
        onChange={(e) => onChange(e.target.value)}
        bg="white"
        borderColor="blue.300"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default ModelSelector;