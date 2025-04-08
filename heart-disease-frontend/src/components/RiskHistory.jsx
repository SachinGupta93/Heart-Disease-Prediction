import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, Button, IconButton, Flex, Spacer,
    VStack, HStack, SimpleGrid, Alert, AlertIcon, Spinner, useToast,
    Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
    ModalBody, ModalCloseButton, useDisclosure, Icon, useColorModeValue,
    Divider, Tooltip, AlertTitle, AlertDescription, Progress,
    Table, Thead, Tbody, Tr, Th, Td, ListItem, UnorderedList
} from '@chakra-ui/react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart,
    ReferenceLine
} from 'recharts';
import { 
    AddIcon, DownloadIcon, InfoIcon, DeleteIcon, CheckCircleIcon,
    WarningIcon, WarningTwoIcon 
} from '@chakra-ui/icons';
import { 
    FaHeartbeat, FaChartLine, FaCalendarAlt, FaClipboardList,
    FaHistory, FaUserMd, FaShieldAlt, FaChartArea
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { saveRiskHistory, getUserRiskHistory, deleteRiskHistory } from '../services/api';

const MotionBox = motion(Box);

const RiskHistory = ({ currentPrediction }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isChartReady, setIsChartReady] = useState(false);
    const [trendAnalysis, setTrendAnalysis] = useState(null);
    const [futureRiskEstimate, setFutureRiskEstimate] = useState(null);
    
    const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
    const { isOpen: isExportModalOpen, onOpen: onOpenExportModal, onClose: onCloseExportModal } = useDisclosure();
    const { isOpen: isDetailModalOpen, onOpen: onOpenDetailModal, onClose: onCloseDetailModal } = useDisclosure();
    
    const toast = useToast();
    const { currentUser } = useAuth();
    
    // Theme colors for light and dark mode
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const textSecondary = useColorModeValue('gray.600', 'gray.400');
    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const highlightBg = useColorModeValue('blue.50', 'blue.900');
    const highlightText = useColorModeValue('blue.800', 'blue.100');

    // Fetch user risk history on component mount
    useEffect(() => {
        if (currentUser) {
            fetchRiskHistory();
        } else {
            setLoading(false);
        }

        // Short delay to ensure chart containers are mounted
        const timer = setTimeout(() => {
            setIsChartReady(true);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [currentUser]);

    // Calculate trend and future risk when history changes
    useEffect(() => {
        if (history.length >= 2) {
            setTrendAnalysis(calculateRiskTrend());
            setFutureRiskEstimate(predictFutureRisk());
        }
    }, [history]);

    // Fetch risk history from API
    const fetchRiskHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const historyData = await getUserRiskHistory(currentUser.uid);
            
            if (historyData && historyData.length > 0) {
                // Sort history by date (newest first)
                const sortedHistory = historyData.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                setHistory(sortedHistory);
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error('Error fetching risk history:', error);
            setError('Failed to load your risk history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Save current prediction to history
    const saveCurrentPrediction = async () => {
        if (!currentUser) {
            toast({
                title: 'Authentication required',
                description: 'Please sign in to save your prediction',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!currentPrediction) {
            toast({
                title: 'No prediction available',
                description: 'Make a prediction first to save it to your history',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setLoading(true);
            
            // Format the prediction data
            const historyEntry = {
                userId: currentUser.uid,
                date: new Date().toISOString(),
                probability: currentPrediction.probability,
                risk_level: currentPrediction.riskLevel,
                inputs: currentPrediction.inputs
            };
            
            // Save to database
            await saveRiskHistory(historyEntry);
            
            // Refresh history list
            await fetchRiskHistory();
            
            toast({
                title: 'Success!',
                description: 'Your prediction has been saved to your history',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error saving prediction:', error);
            setError('Failed to save your prediction. Please try again.');
            toast({
                title: 'Save failed',
                description: 'Could not save your prediction. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete a history entry
    const deleteHistoryEntry = async () => {
        if (!selectedEntry) return;
        
        try {
            setLoading(true);
            
            // Delete from database
            await deleteRiskHistory(selectedEntry.id);
            
            // Refresh history list
            await fetchRiskHistory();
            
            toast({
                title: 'Entry deleted',
                description: 'The history entry has been removed',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
            
            onCloseDeleteModal();
        } catch (error) {
            console.error('Error deleting history entry:', error);
            toast({
                title: 'Delete failed',
                description: 'Could not delete the history entry. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle exporting history data
    const exportHistoryData = () => {
        try {
            if (history.length === 0) {
                toast({
                    title: 'No data to export',
                    description: 'Your history is empty',
                    status: 'warning',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }
            
            // Create CSV content
            const headers = ['Date', 'Risk Probability (%)', 'Risk Level', 'Age', 'Blood Pressure', 'Cholesterol'];
            
            let csvContent = headers.join(',') + '\n';
            
            history.forEach(entry => {
                const row = [
                    new Date(entry.date).toLocaleString(),
                    (entry.probability * 100).toFixed(1),
                    entry.risk_level,
                    entry.inputs?.age || '',
                    entry.inputs?.trestbps || '',
                    entry.inputs?.chol || ''
                ];
                csvContent += row.join(',') + '\n';
            });
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `heart_risk_history_${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
            
            onCloseExportModal();
            
            toast({
                title: 'Export complete',
                description: 'Your history data has been downloaded',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error exporting data:', error);
            toast({
                title: 'Export failed',
                description: 'Could not export your data. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get color based on risk level
    const getRiskColor = (probability) => {
        if (probability < 0.2) return "green.500";
        if (probability < 0.4) return "yellow.500";
        if (probability < 0.6) return "orange.500";
        return "red.500";
    };
    
    // Prepare data for the line chart
    const prepareChartData = () => {
        // Sort by date (oldest first for the chart)
        const sortedData = [...history].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
        
        return sortedData.map(item => ({
            date: formatDate(item.date),
            risk: (item.probability * 100).toFixed(1),
            riskLevel: item.risk_level,
            bp: item.inputs?.trestbps || 0,
            chol: item.inputs?.chol || 0
        }));
    };

    // Calculate risk trend
    const calculateRiskTrend = () => {
        if (history.length < 2) return null;

        // Sort by date (oldest first)
        const sortedData = [...history].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        const firstRisk = sortedData[0].probability;
        const lastRisk = sortedData[sortedData.length - 1].probability;
        const difference = lastRisk - firstRisk;
        
        // Calculate average change per period
        const totalDays = (new Date(sortedData[sortedData.length - 1].date) - 
                          new Date(sortedData[0].date)) / (1000 * 60 * 60 * 24);
        const averageChangePerDay = totalDays > 0 ? difference / totalDays : 0;
        
        return {
            direction: difference > 0 ? 'increased' : difference < 0 ? 'decreased' : 'unchanged',
            percentage: Math.abs(difference * 100).toFixed(1),
            firstDate: new Date(sortedData[0].date),
            lastDate: new Date(sortedData[sortedData.length - 1].date),
            startValue: firstRisk,
            endValue: lastRisk,
            averageChangePerDay
        };
    };

    // Predict future risk based on current trend
    const predictFutureRisk = () => {
        if (!trendAnalysis || trendAnalysis.averageChangePerDay === 0) return null;
        
        const lastDate = trendAnalysis.lastDate;
        const lastValue = trendAnalysis.endValue;
        
        // Predict risk 30 days in the future
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + 30);
        
        const predictedChange = trendAnalysis.averageChangePerDay * 30;
        let predictedValue = lastValue + predictedChange;
        
        // Ensure prediction is within valid range
        predictedValue = Math.max(0, Math.min(1, predictedValue));
        
        return {
            date: futureDate,
            value: predictedValue,
            risk: (predictedValue * 100).toFixed(1),
            trend: trendAnalysis.direction,
            isSignificant: Math.abs(predictedChange) > 0.05 // 5% change is significant
        };
    };

    // Format risk level for display
    const formatRiskLevel = (probability) => {
        const percentage = probability * 100;
        if (percentage < 20) return "Very Low Risk";
        if (percentage < 40) return "Low Risk";
        if (percentage < 60) return "Moderate Risk";
        if (percentage < 80) return "High Risk";
        return "Very High Risk";
    };

    // Get badge color based on risk level
    const getRiskBadgeColor = (probability) => {
        const percentage = probability * 100;
        if (percentage < 20) return "green";
        if (percentage < 40) return "teal";
        if (percentage < 60) return "yellow";
        if (percentage < 80) return "orange";
        return "red";
    };

    // Get appropriate icon based on risk trend
    const getTrendIcon = (trend) => {
        if (trend === 'increased') return WarningIcon;
        if (trend === 'decreased') return CheckCircleIcon;
        return InfoIcon;
    };

    // Get color based on risk trend
    const getTrendColor = (trend) => {
        if (trend === 'increased') return "orange.500";
        if (trend === 'decreased') return "green.500";
        return "blue.500";
    };

    // Render loading state
    if (loading && history.length === 0) {
        return (
            <Container maxW="container.lg" py={8}>
                <Box textAlign="center" py={10}>
                    <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                    <Text mt={4} color={textColor}>Loading your risk history...</Text>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" py={8}>
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Flex align="center" justify="space-between" wrap="wrap" mb={6}>
                    <Heading size="lg" color={textColor}>
                        <Flex align="center">
                            <Icon as={FaHistory} color="blue.500" mr={3} />
                            Risk History
                        </Flex>
                    </Heading>
                    <HStack spacing={3} mt={{ base: 4, md: 0 }}>
                        <Tooltip label="Export your risk history data">
                            <Button
                                leftIcon={<DownloadIcon />}
                                colorScheme="green"
                                variant="outline"
                                onClick={onOpenExportModal}
                                isDisabled={history.length === 0}
                                size={{ base: "sm", md: "md" }}
                            >
                                Export Data
                            </Button>
                        </Tooltip>
                        <Tooltip label="Save your current prediction to your history">
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={saveCurrentPrediction}
                                isDisabled={!currentPrediction}
                                size={{ base: "sm", md: "md" }}
                            >
                                Save Current Prediction
                            </Button>
                        </Tooltip>
                    </HStack>
                </Flex>
                <Text mb={6} color={textSecondary}>
                    Track how your heart disease risk changes over time. Save your current prediction to build your history and monitor your progress.
                </Text>
            </MotionBox>

            {error && (
                <Alert status="error" mb={6} borderRadius="md">
                    <AlertIcon />
                    <AlertTitle mr={2}>Error:</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!currentUser ? (
                <Box p={6} textAlign="center" borderWidth="1px" borderRadius="lg" borderStyle="dashed" bg={cardBg} borderColor={cardBorder}>
                    <Icon as={FaUserMd} boxSize={12} color="blue.400" mb={4} />
                    <Heading size="md" mb={2} color={textColor}>Sign in to track your heart health</Heading>
                    <Text color={textSecondary}>
                        Create an account to save your predictions and track changes in your heart disease risk over time.
                    </Text>
                </Box>
            ) : (
                <VStack spacing={8} align="stretch">
                    {history.length === 0 ? (
                        <Box p={6} textAlign="center" borderWidth="1px" borderRadius="lg" borderStyle="dashed" bg={cardBg} borderColor={cardBorder}>
                            <Icon as={FaHeartbeat} boxSize={12} color="blue.400" mb={4} />
                            <Heading size="md" mb={2} color={textColor}>No history data yet</Heading>
                            <Text color={textSecondary} mb={4}>
                                Save your current prediction to start tracking your risk over time.
                            </Text>
                            {currentPrediction && (
                                <Button 
                                    leftIcon={<AddIcon />} 
                                    colorScheme="blue" 
                                    onClick={saveCurrentPrediction}
                                >
                                    Save Your First Prediction
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <>
                            {/* Risk summary cards */}
                            {trendAnalysis && (
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={4}>
                                    <Box p={4} borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                                        <Flex align="center" mb={2}>
                                            <Icon as={FaHeartbeat} color="blue.500" mr={2} />
                                            <Heading size="sm" color={textColor}>Current Risk</Heading>
                                        </Flex>
                                        <Heading size="xl" color={getRiskColor(trendAnalysis.endValue)}>
                                            {(trendAnalysis.endValue * 100).toFixed(1)}%
                                        </Heading>
                                        <Badge colorScheme={getRiskBadgeColor(trendAnalysis.endValue)} mt={1}>
                                            {formatRiskLevel(trendAnalysis.endValue)}
                                        </Badge>
                                    </Box>
                                    
                                    <Box p={4} borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                                        <Flex align="center" mb={2}>
                                            <Icon as={FaChartLine} color={getTrendColor(trendAnalysis.direction)} mr={2} />
                                            <Heading size="sm" color={textColor}>Risk Trend</Heading>
                                        </Flex>
                                        <Flex align="center">
                                            <Icon 
                                                as={getTrendIcon(trendAnalysis.direction)} 
                                                color={getTrendColor(trendAnalysis.direction)}
                                                mr={2}
                                            />
                                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                                {trendAnalysis.direction === 'increased' ? 'Increased by' : 
                                                 trendAnalysis.direction === 'decreased' ? 'Decreased by' : 'Unchanged'}
                                            </Text>
                                        </Flex>
                                        <Text color={textSecondary}>
                                            {trendAnalysis.percentage}% since first assessment
                                        </Text>
                                    </Box>
                                    
                                    {futureRiskEstimate && (
                                        <Box p={4} borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                                            <Flex align="center" mb={2}>
                                                <Icon as={FaChartArea} color="purple.500" mr={2} />
                                                <Heading size="sm" color={textColor}>30-Day Forecast</Heading>
                                            </Flex>
                                            <Heading size="xl" color={getRiskColor(futureRiskEstimate.value)}>
                                                {(futureRiskEstimate.value * 100).toFixed(1)}%
                                            </Heading>
                                            <Text color={textSecondary} fontSize="sm">
                                                Estimated risk by {futureRiskEstimate.date.toLocaleDateString()}
                                            </Text>
                                            {futureRiskEstimate.isSignificant && (
                                                <Alert status={futureRiskEstimate.trend === 'increased' ? 'warning' : 'success'} size="sm" mt={2} borderRadius="md">
                                                    <AlertIcon />
                                                    <Text fontSize="xs">
                                                        {futureRiskEstimate.trend === 'increased' 
                                                            ? 'Significant risk increase predicted' 
                                                            : 'Significant risk reduction predicted'}
                                                    </Text>
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                </SimpleGrid>
                            )}

                            {/* Risk trend visualization */}
                            <Box p={4} borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                                <Flex align="center" justify="space-between" mb={4}>
                                    <Heading size="md" color={textColor}>
                                        <Flex align="center">
                                            <Icon as={FaChartLine} color="blue.500" mr={2} />
                                            Risk Trend Over Time
                                        </Flex>
                                    </Heading>
                                    <Tooltip label="How your heart disease risk has changed over time">
                                        <InfoIcon color="blue.500" />
                                    </Tooltip>
                                </Flex>
                                <Box h="300px" w="100%" position="relative">
                                    {isChartReady && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={prepareChartData()}
                                                margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                                                <XAxis 
                                                    dataKey="date"
                                                    tick={{ fill: textColor }}
                                                    tickFormatter={(value) => value.split(',')[0]} // Show only date, not time
                                                    angle={-30}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis 
                                                    domain={[0, 100]} 
                                                    label={{ 
                                                        value: 'Risk (%)', 
                                                        angle: -90, 
                                                        position: 'insideLeft',
                                                        style: { fill: textColor } 
                                                    }}
                                                    tick={{ fill: textColor }}
                                                />
                                                <RechartsTooltip 
                                                    formatter={(value) => [`${value}%`, 'Risk']}
                                                    labelFormatter={(label) => `Date: ${label}`}
                                                    contentStyle={{
                                                        backgroundColor: cardBg,
                                                        borderColor: cardBorder,
                                                        color: textColor
                                                    }}
                                                />
                                                <Legend wrapperStyle={{ color: textColor }} />
                                                
                                                {/* Reference lines for risk zones */}
                                                <ReferenceLine y={20} stroke="green" strokeDasharray="3 3" label={{ value: 'Low Risk', position: 'insideBottomRight', fill: textColor }} />
                                                <ReferenceLine y={40} stroke="yellow" strokeDasharray="3 3" />
                                                <ReferenceLine y={60} stroke="orange" strokeDasharray="3 3" label={{ value: 'Moderate Risk', position: 'insideBottomRight', fill: textColor }} />
                                                <ReferenceLine y={80} stroke="red" strokeDasharray="3 3" label={{ value: 'High Risk', position: 'insideTopRight', fill: textColor }} />
                                                
                                                <defs>
                                                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3182CE" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#3182CE" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="risk" 
                                                    stroke="#3182CE" 
                                                    fill="url(#riskGradient)" 
                                                    name="Risk Probability"
                                                    activeDot={{ r: 8, stroke: 'white', strokeWidth: 2, fill: '#3182CE' }}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                            </Box>

                            {/* Additional health metrics chart */}
                            {history.length >= 2 && (
                                <Box p={4} borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Heading size="md" color={textColor}>
                                            <Flex align="center">
                                                <Icon as={FaChartBar} color="purple.500" mr={2} />
                                                Health Metrics Over Time
                                            </Flex>
                                        </Heading>
                                        <Tooltip label="Changes in your key health measurements">
                                            <InfoIcon color="blue.500" />
                                        </Tooltip>
                                    </Flex>
                                    <Box h="300px" w="100%" position="relative">
                                        {isChartReady && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={prepareChartData()}
                                                    margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                                                    <XAxis 
                                                        dataKey="date"
                                                        tick={{ fill: textColor }}
                                                        tickFormatter={(value) => value.split(',')[0]}
                                                        angle={-30}
                                                        textAnchor="end" 
                                                        height={60}
                                                    />
                                                    <YAxis 
                                                        tick={{ fill: textColor }}
                                                        label={{ 
                                                            value: 'Value', 
                                                            angle: -90, 
                                                            position: 'insideLeft',
                                                            style: { fill: textColor } 
                                                        }}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => {
                                                            if (name === "bp") return [`${value} mmHg`, "Blood Pressure"];
                                                            if (name === "chol") return [`${value} mg/dL`, "Cholesterol"];
                                                            return [value, name];
                                                        }}
                                                        contentStyle={{
                                                            backgroundColor: cardBg,
                                                            borderColor: cardBorder,
                                                            color: textColor
                                                        }}
                                                    />
                                                    <Legend wrapperStyle={{ color: textColor }} />
                                                    <Bar 
                                                        dataKey="bp" 
                                                        name="Blood Pressure" 
                                                        fill="#805AD5" 
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                    <Bar 
                                                        dataKey="chol" 
                                                        name="Cholesterol" 
                                                        fill="#38B2AC" 
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </Box>
                                </Box>
                            )}

                            {/* Risk history list */}
                            <Box p={4} borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                                <Flex align="center" mb={4}>
                                    <Icon as={FaClipboardList} color="blue.500" mr={2} />
                                    <Heading size="md" color={textColor}>Risk Assessment History</Heading>
                                </Flex>
                                <Box overflowX="auto">
                                    <Table variant="simple">
                                        <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
                                            <Tr>
                                                <Th color={textColor}>Date</Th>
                                                <Th color={textColor} textAlign="center">Risk</Th>
                                                <Th color={textColor} textAlign="center">Category</Th>
                                                <Th color={textColor} textAlign="right">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {history.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={4} textAlign="center" color={textSecondary}>
                                                        No history entries yet
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                history.map((entry) => (
                                                    <Tr 
                                                        key={entry.id}
                                                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                                        borderBottomWidth="1px"
                                                        borderColor={borderColor}
                                                    >
                                                        <Td color={textColor}>
                                                            <Flex align="center">
                                                                <Icon as={FaCalendarAlt} color="blue.500" mr={2} />
                                                                {formatDate(entry.date)}
                                                            </Flex>
                                                        </Td>
                                                        <Td textAlign="center">
                                                            <Text 
                                                                fontWeight="bold" 
                                                                color={getRiskColor(entry.probability)}
                                                            >
                                                                {(entry.probability * 100).toFixed(1)}%
                                                            </Text>
                                                        </Td>
                                                        <Td textAlign="center">
                                                            <Badge
                                                                colorScheme={getRiskBadgeColor(entry.probability)}
                                                                px={2}
                                                                py={1}
                                                                borderRadius="full"
                                                            >
                                                                {entry.risk_level}
                                                            </Badge>
                                                        </Td>
                                                        <Td textAlign="right">
                                                            <HStack spacing={2} justifyContent="flex-end">
                                                                <Tooltip label="View details">
                                                                    <IconButton
                                                                        icon={<InfoIcon />}
                                                                        aria-label="View details"
                                                                        size="sm"
                                                                        colorScheme="blue"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSelectedEntry(entry);
                                                                            onOpenDetailModal();
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip label="Delete entry">
                                                                    <IconButton
                                                                        icon={<DeleteIcon />}
                                                                        aria-label="Delete entry"
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setSelectedEntry(entry);
                                                                            onOpenDeleteModal();
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                            {history.length >= 2 && (
                                <Box p={6} bg={highlightBg} borderRadius="lg" borderLeft="4px solid" borderColor="blue.500">
                                    <Flex align="center" mb={3}>
                                        <Icon as={FaUserMd} mr={2} color="blue.500" />
                                        <Heading size="sm" color={highlightText}>What Your Risk Trend Means</Heading>
                                    </Flex>
                                    <Text color={highlightText} mb={2}>
                                        {trendAnalysis?.direction === 'decreased' 
                                            ? 'Your risk is decreasing, which suggests your health management efforts may be working. Continue your current approach.' 
                                            : trendAnalysis?.direction === 'increased'
                                            ? 'Your risk is increasing over time. Consider discussing these changes with your healthcare provider.'
                                            : 'Your risk has remained stable. Regular monitoring is still important.'}
                                    </Text>
                                    <Text color={highlightText} fontSize="sm">
                                        Remember that risk predictions are estimates. Regular check-ups with your doctor are essential for proper heart health management.
                                    </Text>
                                </Box>
                            )}
                        </>
                    )}
                </VStack>
            )}

            {/* Delete confirmation modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
                <ModalOverlay />
                <ModalContent bg={cardBg}>
                    <ModalHeader color={textColor}>Confirm Deletion</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text color={textColor}>Are you sure you want to delete this risk history entry?</Text>
                        <Text fontWeight="bold" color="red.500" mt={2}>This action cannot be undone.</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={deleteHistoryEntry} isLoading={loading}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Export confirmation modal */}
            <Modal isOpen={isExportModalOpen} onClose={onCloseExportModal}>
                <ModalOverlay />
                <ModalContent bg={cardBg}>
                    <ModalHeader color={textColor}>Export Risk History</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text color={textColor}>
                            Your data will be exported as a CSV file that you can open in Excel or other spreadsheet software.
                        </Text>
                        <Text color={textColor} mt={4}>
                            This file will contain:
                        </Text>
                        <UnorderedList mt={2} spacing={1} color={textSecondary}>
                            <ListItem>Dates of your risk assessments</ListItem>
                            <ListItem>Risk probability percentages</ListItem>
                            <ListItem>Risk levels</ListItem>
                            <ListItem>Key health measurements</ListItem>
                        </UnorderedList>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCloseExportModal}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={exportHistoryData} leftIcon={<DownloadIcon />}>
                            Download CSV
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Detail view modal */}
            <Modal isOpen={isDetailModalOpen} onClose={onCloseDetailModal} size="lg">
                <ModalOverlay />
                <ModalContent bg={cardBg}>
                    <ModalHeader color={textColor}>
                        <Flex align="center">
                            <Icon as={FaHeartbeat} color="red.500" mr={2} />
                            Risk Assessment Details
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedEntry && (
                            <VStack spacing={4} align="stretch">
                                <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('gray.50', 'gray.800')}>
                                    <Heading size="md" mb={3} color={textColor}>
                                        <Flex align="center">
                                            <Icon as={FaCalendarAlt} color="blue.500" mr={2} />
                                            Assessment Date
                                        </Flex>
                                    </Heading>
                                    <Text color={textColor} fontSize="lg">{formatDate(selectedEntry.date)}</Text>
                                </Box>
                                
                                <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('gray.50', 'gray.800')}>
                                    <Heading size="md" mb={3} color={textColor}>
                                        <Flex align="center">
                                            <Icon as={FaHeartbeat} color="red.500" mr={2} />
                                            Risk Assessment
                                        </Flex>
                                    </Heading>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Box>
                                            <Text color={textSecondary} fontSize="sm">Risk Probability</Text>
                                            <Text color={getRiskColor(selectedEntry.probability)} fontSize="xl" fontWeight="bold">
                                                {(selectedEntry.probability * 100).toFixed(1)}%
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text color={textSecondary} fontSize="sm">Risk Category</Text>
                                            <Badge 
                                                colorScheme={getRiskBadgeColor(selectedEntry.probability)}
                                                fontSize="md"
                                                px={2}
                                                py={1}
                                            >
                                                {selectedEntry.risk_level}
                                            </Badge>
                                        </Box>
                                    </SimpleGrid>
                                </Box>
                                
                                <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('gray.50', 'gray.800')}>
                                    <Heading size="md" mb={3} color={textColor}>
                                        <Flex align="center">
                                            <Icon as={FaClipboardList} color="green.500" mr={2} />
                                            Health Measurements
                                        </Flex>
                                    </Heading>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                        <Box>
                                            <Text color={textSecondary} fontSize="sm">Age</Text>
                                            <Text color={textColor} fontSize="lg">{selectedEntry.inputs?.age || 'Not recorded'}</Text>
                                        </Box>
                                        <Box>
                                            <Text color={textSecondary} fontSize="sm">Blood Pressure</Text>
                                            <Text color={textColor} fontSize="lg">
                                                {selectedEntry.inputs?.trestbps 
                                                    ? `${selectedEntry.inputs.trestbps} mmHg` 
                                                    : 'Not recorded'}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text color={textSecondary} fontSize="sm">Cholesterol</Text>
                                            <Text color={textColor} fontSize="lg">
                                                {selectedEntry.inputs?.chol 
                                                    ? `${selectedEntry.inputs.chol} mg/dL` 
                                                    : 'Not recorded'}
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>
                                
                                <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('blue.50', 'blue.900')}>
                                    <Flex align="center" mb={2}>
                                        <Icon as={FaShieldAlt} color="blue.500" mr={2} />
                                        <Heading size="sm" color={highlightText}>Patient Information</Heading>
                                    </Flex>
                                    <Text fontSize="sm" color={highlightText}>
                                        This risk assessment is based on the information you provided at the time. Remember that predictions are estimates and should be discussed with healthcare professionals. Regular check-ups are essential for heart health.
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onCloseDetailModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default RiskHistory;