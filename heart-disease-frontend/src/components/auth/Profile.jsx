import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Heading, Text, Button, VStack, HStack,
    FormControl, FormLabel, Input, Avatar, AvatarBadge,
    useToast, Spinner, Alert, AlertIcon, Divider,
    useColorModeValue, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, IconButton
} from '@chakra-ui/react';
import { EditIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase';

const Profile = () => {
    const { currentUser, updateUserProfile, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
    const fileInputRef = useRef();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const bgColor = useColorModeValue('white', 'gray.700');

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            setError('Failed to log out');
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setError('');

        try {
            const profileUpdates = {};
            
            if (displayName !== currentUser.displayName) {
                profileUpdates.displayName = displayName;
            }
            
            if (photoURL !== currentUser.photoURL) {
                profileUpdates.photoURL = photoURL;
            }
            
            if (Object.keys(profileUpdates).length > 0) {
                await updateUserProfile(currentUser, profileUpdates);
                
                toast({
                    title: 'Profile updated',
                    description: 'Your profile has been successfully updated.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: 'No changes',
                    description: 'No changes were made to your profile.',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                });
            }
            
            onClose();
        } catch (error) {
            setError('Failed to update profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select an image file (jpeg, png, or gif)');
            return;
        }
        
        setLoading(true);
        
        try {
            const storage = getStorage(app);
            const storageRef = ref(storage, `profile-images/${currentUser.uid}/${Date.now()}_${file.name}`);
            
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            setPhotoURL(downloadURL);
            
            toast({
                title: 'Image uploaded',
                description: 'Your profile image has been uploaded.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
                <VStack spacing={6} align="stretch">
                    <Heading size="lg">User Profile</Heading>
                    
                    {error && (
                        <Alert status="error">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    
                    <HStack spacing={6}>
                        <Box position="relative">
                            <Avatar 
                                size="xl" 
                                src={currentUser.photoURL} 
                                name={currentUser.displayName || currentUser.email}
                            >
                                <AvatarBadge
                                    as={IconButton}
                                    size="sm"
                                    rounded="full"
                                    top="-10px"
                                    colorScheme="blue"
                                    aria-label="Edit profile picture"
                                    icon={<EditIcon />}
                                    onClick={() => fileInputRef.current.click()}
                                />
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </Box>
                        
                        <VStack align="start" spacing={1}>
                            <Heading size="md">
                                {currentUser.displayName || 'User'}
                            </Heading>
                            <Text color="gray.600">{currentUser.email}</Text>
                            <Text fontSize="sm" color="gray.500">
                                Account created: {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                            </Text>
                        </VStack>
                    </HStack>
                    
                    <Divider />
                    
                    <Box>
                        <Heading size="sm" mb={4}>Account Information</Heading>
                        
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                                <Text fontWeight="medium">Email</Text>
                                <Text>{currentUser.email}</Text>
                            </HStack>
                            
                            <HStack justify="space-between">
                                <Text fontWeight="medium">Display Name</Text>
                                <Text>{currentUser.displayName || 'Not set'}</Text>
                            </HStack>
                            
                            <HStack justify="space-between">
                                <Text fontWeight="medium">Email Verified</Text>
                                <Text>{currentUser.emailVerified ? 'Yes' : 'No'}</Text>
                            </HStack>
                        </VStack>
                    </Box>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                        <Button colorScheme="blue" onClick={onOpen}>
                            Edit Profile
                        </Button>
                        <Button colorScheme="red" variant="outline" onClick={handleLogout}>
                            Log Out
                        </Button>
                    </HStack>
                </VStack>
            </Box>
            
            {/* Edit Profile Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Display Name</FormLabel>
                                <Input 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Profile Picture</FormLabel>
                                <HStack>
                                    <Avatar size="md" src={photoURL} />
                                    <Button
                                        onClick={() => fileInputRef.current.click()}
                                        size="sm"
                                    >
                                        Change Picture
                                    </Button>
                                    {photoURL && (
                                        <IconButton
                                            aria-label="Remove picture"
                                            icon={<SmallCloseIcon />}
                                            size="sm"
                                            onClick={() => setPhotoURL('')}
                                        />
                                    )}
                                </HStack>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleUpdateProfile}
                            isLoading={loading}
                        >
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default Profile;
