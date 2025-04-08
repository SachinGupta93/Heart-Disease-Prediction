import React, { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box, Button, FormControl, FormLabel, Input, VStack,
    Heading, Text, Link, Alert, AlertIcon, Container,
    useColorModeValue, Divider, HStack
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login, loginWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const bgColor = useColorModeValue('white', 'gray.700');

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch (error) {
            setError('Failed to log in: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            setError('Failed to log in with Google: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxW="md" py={12}>
            <Box p={8} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
                <VStack spacing={4} align="flex-start">
                    <Heading>Log In</Heading>
                    <Text>Access your heart health dashboard</Text>
                    
                    {error && (
                        <Alert status="error">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={4} align="flex-start" width="100%">
                            <FormControl id="email" isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input 
                                    type="email" 
                                    ref={emailRef} 
                                    placeholder="Enter your email"
                                />
                            </FormControl>
                            
                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input 
                                    type="password" 
                                    ref={passwordRef} 
                                    placeholder="Enter your password"
                                />
                            </FormControl>
                            
                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                width="full" 
                                isLoading={loading}
                            >
                                Log In
                            </Button>
                        </VStack>
                    </form>
                    
                    <Divider />
                    
                    <Button 
                        width="full" 
                        leftIcon={<FaGoogle />} 
                        onClick={handleGoogleLogin}
                        isLoading={loading}
                        colorScheme="red"
                        variant="outline"
                    >
                        Continue with Google
                    </Button>
                    
                    <HStack width="100%" justify="space-between">
                        <Link as={RouterLink} to="/forgot-password" color="blue.500">
                            Forgot Password?
                        </Link>
                        <Text>
                            Need an account? <Link as={RouterLink} to="/signup" color="blue.500">Sign Up</Link>
                        </Text>
                    </HStack>
                </VStack>
            </Box>
        </Container>
    );
};

export default Login;
