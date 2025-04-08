import React from 'react';
import {
  Box, Flex, HStack, Button, IconButton, useDisclosure,
  Stack, Text, Avatar, Menu, MenuButton, MenuList, MenuItem,
  MenuDivider, useColorMode, useColorModeValue, Image,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Tooltip, Badge
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HamburgerIcon, CloseIcon, MoonIcon, SunIcon, 
  SettingsIcon, ChevronDownIcon, QuestionOutlineIcon
} from '@chakra-ui/icons';
import { 
  FaHeartbeat, FaHistory, FaChartLine, FaInfoCircle, 
  FaSignOutAlt, FaUser, FaClipboardList, FaHome, 
  FaHospital, FaBell, FaQuestionCircle, FaComment,
  FaBrain, FaLightbulb, FaChartBar, FaUserMd,
  FaClock, FaLock, FaUnlock, FaRegChartBar,
  FaRandom, FaToolbox, FaDesktop
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logoColor = useColorModeValue('red.600', 'red.400');
  const activeNavBg = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.300');
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Check if a route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Main navigation items updated to match App.jsx routes
  const navItems = [
    {
      name: 'Dashboard',
      icon: <FaRegChartBar />,
      path: '/dashboard',
      public: false,
      tooltip: 'Your personalized health dashboard'
    },
    {
      name: 'Risk Assessment',
      icon: <FaHeartbeat />,
      path: '/risk-assessment',
      public: true,
      tooltip: 'Check your heart disease risk'
    },
    {
      name: 'Risk Simulator',
      icon: <FaRandom />, // Changed to FaRandom which is available in react-icons/fa
      path: '/simulator',
      public: false,
      tooltip: 'Simulate how lifestyle changes affect your risk'
    },
    {
      name: 'Model Comparison',
      icon: <FaChartLine />,
      path: '/model-comparison',
      public: true,
      tooltip: 'Compare different prediction models'
    },
    {
      name: 'Feature Importance',
      icon: <FaChartBar />,
      path: '/features',
      public: true,
      tooltip: 'See which factors impact heart disease risk most'
    },
    {
      name: 'Explainable AI',
      icon: <FaBrain />,
      path: '/explain-ai',
      public: false,
      tooltip: 'Understand how AI evaluates your risk factors'
    },
    {
      name: 'My History',
      icon: <FaHistory />,
      path: '/prediction-history',
      public: false,
      tooltip: 'View your past risk assessments'
    },
    {
      name: 'Health Info',
      icon: <FaInfoCircle />,
      path: '/health-information',
      public: true,
      tooltip: 'Learn about heart disease risk factors'
    },
    {
      name: 'Reminders',
      icon: <FaClock />,
      path: '/reminders',
      public: false,
      tooltip: 'Set health check-up reminders'
    }
  ];
  
  // Group navigation items for better organization in the UI
  const publicNavItems = navItems.filter(item => item.public);
  const protectedNavItems = navItems.filter(item => !item.public);
  
  return (
    <Box 
      position="fixed" 
      w="100%" 
      zIndex="999"
      borderBottom="1px"
      borderColor={borderColor}
      bg={bgColor}
      px={4}
      boxShadow="sm"
    >
      <Flex h={{ base: '60px', md: '80px' }} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        
        <HStack spacing={8} alignItems="center">
          <Box 
            as={RouterLink} 
            to={currentUser ? "/dashboard" : "/login"} 
            display="flex" 
            alignItems="center" 
            fontWeight="bold" 
            fontSize="xl"
          >
            <FaHeartbeat color={logoColor} size="24px" style={{ marginRight: '8px' }} />
            <Text display={{ base: 'none', md: 'flex' }} color={useColorModeValue('gray.700', 'white')}>
              Heart Health Predictor
            </Text>
          </Box>
          
          {/* Desktop Navigation - Only show a limited set of important navigation items */}
          <HStack as="nav" spacing={1} display={{ base: 'none', md: 'flex' }}>
            {/* Public routes for everyone */}
            {publicNavItems.slice(0, 3).map((item) => (
              <Tooltip key={item.name} label={item.tooltip} hasArrow placement="bottom" openDelay={500}>
                <Button
                  as={RouterLink}
                  to={item.path}
                  size="md"
                  variant="ghost"
                  leftIcon={item.icon}
                  px={3}
                  bg={isActiveRoute(item.path) ? activeNavBg : 'transparent'}
                  color={isActiveRoute(item.path) ? activeTextColor : 'inherit'}
                  fontWeight={isActiveRoute(item.path) ? 'semibold' : 'normal'}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.name}
                </Button>
              </Tooltip>
            ))}
            
            {/* Protected routes only for logged in users */}
            {currentUser && protectedNavItems.slice(0, 2).map((item) => (
              <Tooltip key={item.name} label={item.tooltip} hasArrow placement="bottom" openDelay={500}>
                <Button
                  as={RouterLink}
                  to={item.path}
                  size="md"
                  variant="ghost"
                  leftIcon={item.icon}
                  px={3}
                  bg={isActiveRoute(item.path) ? activeNavBg : 'transparent'}
                  color={isActiveRoute(item.path) ? activeTextColor : 'inherit'}
                  fontWeight={isActiveRoute(item.path) ? 'semibold' : 'normal'}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.name}
                </Button>
              </Tooltip>
            ))}

            {/* More dropdown for additional navigation items */}
            {navItems.length > 5 && (
              <Menu>
                <Tooltip label="More options" hasArrow placement="bottom">
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="md"
                    rightIcon={<ChevronDownIcon />}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.700')
                    }}
                  >
                    More
                  </MenuButton>
                </Tooltip>
                <MenuList>
                  {navItems.slice(5).map((item) => (
                    (item.public || currentUser) && (
                      <MenuItem 
                        key={item.name}
                        as={RouterLink}
                        to={item.path}
                        icon={item.icon}
                        bg={isActiveRoute(item.path) ? activeNavBg : 'transparent'}
                        _hover={{
                          bg: useColorModeValue('gray.100', 'gray.700')
                        }}
                      >
                        {item.name}
                        {!item.public && (
                          <Badge ml={2} colorScheme="blue" fontSize="2xs">
                            Account
                          </Badge>
                        )}
                      </MenuItem>
                    )
                  ))}
                </MenuList>
              </Menu>
            )}
          </HStack>
        </HStack>

        <HStack spacing={3}>
          <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton
              size="md"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              aria-label="Toggle Color Mode"
              onClick={toggleColorMode}
              variant="ghost"
            />
          </Tooltip>
          
          {currentUser ? (
            <Menu>
              <Tooltip label="Your account">
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar
                    size="sm"
                    name={currentUser.displayName || currentUser.email}
                    src={currentUser.photoURL}
                    bg="brand.500"
                  />
                </MenuButton>
              </Tooltip>
              <MenuList>
                <MenuItem 
                  as={RouterLink} 
                  to="/profile"
                  icon={<FaUser />}
                >
                  My Profile
                </MenuItem>
                <MenuItem 
                  as={RouterLink} 
                  to="/prediction-history"
                  icon={<FaHistory />}
                >
                  Health History
                </MenuItem>
                <MenuItem 
                  as={RouterLink} 
                  to="/reminders"
                  icon={<FaClock />}
                >
                  Reminders
                </MenuItem>
                <MenuDivider />
                <MenuItem 
                  icon={<FaSignOutAlt />}
                  onClick={handleLogout}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack>
              <Button
                as={RouterLink}
                to="/signup"
                colorScheme="gray"
                variant="outline"
                size="sm"
                display={{ base: "none", md: "flex" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'sm',
                }}
                transition="all 0.2s"
                leftIcon={<FaUnlock />}
              >
                Sign Up
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                colorScheme="brand"
                size="sm"
                fontWeight="bold"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                }}
                transition="all 0.2s"
                leftIcon={<FaLock />}
              >
                Sign In
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <FaHeartbeat color={logoColor} style={{ marginRight: '8px' }} />
              Heart Health Predictor
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={4} mt={2}>
              {/* Public navigation items */}
              {publicNavItems.map((item) => (
                <Button
                  key={item.name}
                  as={RouterLink}
                  to={item.path}
                  justifyContent="flex-start"
                  variant="ghost"
                  leftIcon={item.icon}
                  onClick={onClose}
                  bg={isActiveRoute(item.path) ? activeNavBg : 'transparent'}
                  color={isActiveRoute(item.path) ? activeTextColor : 'inherit'}
                  w="100%"
                >
                  {item.name}
                </Button>
              ))}
              
              {currentUser && (
                <>
                  <Box pt={4} pb={2}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.500">Account Features</Text>
                  </Box>
                  
                  {/* Protected navigation items */}
                  {protectedNavItems.map((item) => (
                    <Button
                      key={item.name}
                      as={RouterLink}
                      to={item.path}
                      justifyContent="flex-start"
                      variant="ghost"
                      leftIcon={item.icon}
                      onClick={onClose}
                      bg={isActiveRoute(item.path) ? activeNavBg : 'transparent'}
                      color={isActiveRoute(item.path) ? activeTextColor : 'inherit'}
                      w="100%"
                    >
                      {item.name}
                    </Button>
                  ))}
                </>
              )}
              
              <Box pt={4}>
                <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>Account</Text>
                {!currentUser ? (
                  <>
                    <Button
                      colorScheme="brand"
                      as={RouterLink}
                      to="/login"
                      onClick={onClose}
                      leftIcon={<FaLock />}
                      w="100%"
                      mb={2}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      as={RouterLink}
                      to="/signup"
                      onClick={onClose}
                      leftIcon={<FaUnlock />}
                      w="100%"
                    >
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      as={RouterLink}
                      to="/profile"
                      onClick={onClose}
                      leftIcon={<FaUser />}
                      variant="ghost"
                      justifyContent="flex-start"
                      w="100%"
                      mb={2}
                    >
                      My Profile
                    </Button>
                    <Button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      leftIcon={<FaSignOutAlt />}
                      variant="ghost"
                      justifyContent="flex-start"
                      w="100%"
                      colorScheme="red"
                    >
                      Sign Out
                    </Button>
                  </>
                )}
              </Box>
              
              <Box pt={4}>
                <Button
                  onClick={toggleColorMode}
                  leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  variant="outline"
                  size="sm"
                  w="100%"
                >
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Button>
              </Box>
              
              <Box pt={4}>
                <Text fontSize="xs" color="gray.500">
                  Version 1.0.0 • Heart Health Predictor
                </Text>
              </Box>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
