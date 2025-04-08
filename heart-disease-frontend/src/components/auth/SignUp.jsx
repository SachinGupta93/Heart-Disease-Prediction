import React, { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box, Button, FormControl, FormLabel, Input, VStack,
    Heading, Text, Link, Alert, AlertIcon, Container,
    useColorModeValue, Divider, HStack
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const displayNameRef = useRef();
    const { signup, loginWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const bgColor = useColorModeValue('white', 'gray.700');

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(
                emailRef.current.value, 
                passwordRef.current.value,
                displayNameRef.current.value
            );
            navigate('/');
        } catch (error) {
            setError('Failed to create an account: ' + error.message);
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
            setError('Failed to sign up with Google: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxW="md" py={12}>
            <Box p={8} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
                <VStack spacing={4} align="flex-start">
                    <Heading>Sign Up</Heading>
                    <Text>Create your account to track your heart health</Text>
                    
                    {error && (
                        <Alert status="error">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={4} align="flex-start" width="100%">
                            <FormControl id="displayName">
                                <FormLabel>Name</FormLabel>
                                <Input 
                                    type="text" 
                                    ref={displayNameRef} 
                                    placeholder="Enter your name (optional)"
                                />
                            </FormControl>
                            
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
                            
                            <FormControl id="password-confirm" isRequired>
                                <FormLabel>Confirm Password</FormLabel>
                                <Input 
                                    type="password" 
                                    ref={passwordConfirmRef} 
                                    placeholder="Confirm your password"
                                />
                            </FormControl>
                            
                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                width="full" 
                                isLoading={loading}
                            >
                                Sign Up
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
                        Sign up with Google
                    </Button>
                    
                    <Text width="100%" textAlign="center">
                        Already have an account? <Link as={RouterLink} to="/login" color="blue.500">Log In</Link>
                    </Text>
                </VStack>
            </Box>
        </Container>
    );
};

export default Signup;
