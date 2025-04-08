import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, Button, VStack, HStack, 
    FormControl, FormLabel, Input, Select, Textarea,
    useToast, Spinner, Badge, IconButton, Divider,
    useColorModeValue, useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CheckIcon, CalendarIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { 
    getUserReminders, 
    scheduleReminder, 
    completeReminder, 
    deleteReminder 
} from '../services/firestore';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        type: 'checkup',
        priority: 'medium'
    });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const { currentUser } = useAuth();
    const bgColor = useColorModeValue('white', 'gray.700');

    useEffect(() => {
        if (currentUser) {
            fetchReminders();
        } else {
            setReminders([]);
            setLoading(false);
        }
    }, [currentUser]);

    const fetchReminders = async () => {
        setLoading(true);
        try {
            const data = await getUserReminders(currentUser.uid);
            setReminders(data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
            toast({
                title: 'Error',
                description: 'Failed to load reminders.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.date) {
            toast({
                title: 'Missing information',
                description: 'Please provide a title and date for the reminder.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await scheduleReminder(currentUser.uid, formData);
            
            toast({
                title: 'Reminder scheduled',
                description: 'Your health reminder has been scheduled.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            // Reset form and close modal
            setFormData({
                title: '',
                description: '',
                date: '',
                type: 'checkup',
                priority: 'medium'
            });
            onClose();
            
            // Refresh reminders
            fetchReminders();
        } catch (error) {
            console.error("Error scheduling reminder:", error);
            toast({
                title: 'Error',
                description: 'Failed to schedule reminder.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleComplete = async (id) => {
        try {
            await completeReminder(id);
            
            toast({
                title: 'Reminder completed',
                description: 'The reminder has been marked as completed.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            // Refresh reminders
            fetchReminders();
        } catch (error) {
            console.error("Error completing reminder:", error);
            toast({
                title: 'Error',
                description: 'Failed to update reminder.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteReminder(id);
            
            toast({
                title: 'Reminder deleted',
                description: 'The reminder has been deleted.',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
            
            // Refresh reminders
            fetchReminders();
        } catch (error) {
            console.error("Error deleting reminder:", error);
            toast({
                title: 'Error',
                description: 'Failed to delete reminder.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Get color based on priority
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'red';
            case 'medium':
                return 'orange';
            case 'low':
                return 'green';
            default:
                return 'blue';
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Container maxW="container.md" py={8}>
            <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
                <HStack justify="space-between" mb={6}>
                    <Heading size="lg">Health Reminders</Heading>
                    <Button 
                        leftIcon={<AddIcon />} 
                        colorScheme="blue" 
                        onClick={onOpen}
                    >
                        Add Reminder
                    </Button>
                </HStack>
                
                <Text mb={6}>
                    Schedule reminders for medical appointments, medication refills, or health check-ups.
                </Text>
                
                {loading ? (
                    <Box textAlign="center" my={10}>
                        <Spinner size="xl" />
                        <Text mt={4}>Loading your reminders...</Text>
                    </Box>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {reminders.length === 0 ? (
                            <Box p={6} textAlign="center" borderWidth="1px" borderRadius="lg" borderStyle="dashed">
                                <CalendarIcon boxSize={10} color="gray.400" mb={4} />
                                <Text fontSize="lg" mb={2}>No reminders scheduled</Text>
                                <Text color="gray.500">
                                    Click "Add Reminder" to schedule your first health reminder.
                                </Text>
                            </Box>
                        ) : (
                            reminders.map((reminder) => (
                                <Box 
                                    key={reminder.id} 
                                    p={4} 
                                    borderWidth="1px" 
                                    borderRadius="md" 
                                    bg={reminder.isCompleted ? "gray.50" : "white"}
                                    opacity={reminder.isCompleted ? 0.7 : 1}
                                    position="relative"
                                >
                                    <HStack justify="space-between" mb={2}>
                                    <Heading size="sm" textDecoration={reminder.isCompleted ? "line-through" : "none"}>
                                            {reminder.title}
                                        </Heading>
                                        <HStack>
                                            <Badge colorScheme={getPriorityColor(reminder.priority)}>
                                                {reminder.priority}
                                            </Badge>
                                            <Badge>
                                                {reminder.type}
                                            </Badge>
                                        </HStack>
                                    </HStack>
                                    
                                    <Text mb={2} color="gray.600" fontSize="sm">
                                        {formatDate(reminder.date)}
                                    </Text>
                                    
                                    {reminder.description && (
                                        <Text mb={3} fontSize="md" textDecoration={reminder.isCompleted ? "line-through" : "none"}>
                                            {reminder.description}
                                        </Text>
                                    )}
                                    
                                    <Divider my={2} />
                                    
                                    <HStack justify="flex-end" spacing={2}>
                                        {!reminder.isCompleted && (
                                            <IconButton
                                                aria-label="Mark as completed"
                                                icon={<CheckIcon />}
                                                size="sm"
                                                colorScheme="green"
                                                onClick={() => handleComplete(reminder.id)}
                                            />
                                        )}
                                        <IconButton
                                            aria-label="Delete reminder"
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            colorScheme="red"
                                            variant="outline"
                                            onClick={() => handleDelete(reminder.id)}
                                        />
                                    </HStack>
                                </Box>
                            ))
                        )}
                    </VStack>
                )}
                
                <Box mt={8} p={4} bg="blue.50" borderRadius="md">
                    <Heading size="sm" mb={2}>Why set health reminders?</Heading>
                    <Text fontSize="sm">
                        Regular check-ups and medication adherence are crucial for managing heart health. 
                        Setting reminders helps you stay on track with your healthcare routine and ensures 
                        you don't miss important appointments or medications.
                    </Text>
                </Box>
            </Box>
            
            {/* Add Reminder Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Schedule Health Reminder</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                            <FormControl isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Doctor's Appointment"
                                />
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add details about this reminder"
                                    resize="vertical"
                                />
                            </FormControl>
                            
                            <FormControl isRequired>
                                <FormLabel>Date</FormLabel>
                                <Input 
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Type</FormLabel>
                                <Select 
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="checkup">Check-up</option>
                                    <option value="medication">Medication</option>
                                    <option value="test">Medical Test</option>
                                    <option value="exercise">Exercise</option>
                                    <option value="other">Other</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Priority</FormLabel>
                                <Select 
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleSubmit}>
                            Schedule
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default Reminders;
