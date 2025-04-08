import React from 'react';
import { useColorMode, useColorModeValue, IconButton, Tooltip } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const ColorModeSwitcher = props => {
  const { toggleColorMode, colorMode } = useColorMode();
  const text = useColorModeValue('dark', 'light');
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  const bgHover = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('blue.600', 'yellow.400');

  return (
    <Tooltip 
      label={`Switch to ${text} mode`} 
      placement="bottom" 
      hasArrow
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          size="md"
          fontSize="lg"
          aria-label={`Switch to ${text} mode`}
          variant="ghost"
          color={iconColor}
          marginLeft="2"
          onClick={toggleColorMode}
          icon={<SwitchIcon />}
          _hover={{ bg: bgHover }}
          transition="all 0.2s ease"
          {...props}
        />
      </motion.div>
    </Tooltip>
  );
};

export default ColorModeSwitcher;