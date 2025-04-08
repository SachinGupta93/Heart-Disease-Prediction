import React, { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, FormControl, FormLabel, Input, VStack,
    Heading, Text, Link, Alert, AlertIcon, Container,
    useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
    const emailRef = useRef();
    const { resetPassword } = useAuth();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const bgColor = useColorModeValue('white', 'gray.700');

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(emailRef.current.value);
            setMessage('Check your inbox for further instructions');
        } catch (error) {
            setError('Failed to reset password: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxW="md" py={12}>
            <Box p={8} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
                <VStack spacing={4} align="flex-start">
                    <Heading>Password Reset</Heading>
                    <Text>Enter your email to reset your password</Text>
                    
                    {error && (
                        <Alert status="error">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    
                    {message && (
                        <Alert status="success">
                            <AlertIcon />
                            {message}
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
                            
                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                width="full" 
                                isLoading={loading}
                            >
                                Reset Password
                            </Button>
                        </VStack>
                    </form>
                    
                    <Link as={RouterLink} to="/login" color="blue.500" alignSelf="center">
                        Back to Login
                    </Link>
                </VStack>
            </Box>
        </Container>
    );
};

export default ForgotPassword;
