import React, { useState, lazy, Suspense } from 'react';
import { ChakraProvider, Box, Spinner, Center, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';

// Import components
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Header from './components/Header'
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary'; 
import PredictionResult from './components/PredictionResult'; // Changed from lazy import to static import

// Lazy-loaded components
const Dashboard = lazy(() => import('./components/Dashboard'));
const PredictionForm = lazy(() => import('./components/PredictionForm'));
// const RiskSimulator = lazy(() => import('./components/RiskSimulator'));
const PredictionHistory = lazy(() => import('./components/PredictionHistory'));
const ShapExplanation = lazy(() => import('./components/ShapExplanation')); // Add explicit import for ShapExplanation
const HealthInformation = lazy(() => import('./components/HealthInformation'));
const HealthInfo = lazy(() => import('./components/HealthInfo'));
const ExplainableAi = lazy(() => import('./components/ExplainableAi'));
const FeatureImportance = lazy(() => import('./components/FeatureImportance'));
const ModelComparison = lazy(() => import('./components/ModelComparison'));
const FeedbackButton = lazy(() => import('./components/FeedbackButton'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const Reminders = lazy(() => import('./components/Reminders'));
// Auth components
import Login from './components/auth/Login';
import Signup from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import Profile from './components/auth/Profile';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PredictionProvider } from './contexts/PredictionContext';

// Helper component to redirect based on authentication status
function AuthRedirect() {
  const { currentUser, loading } = useAuth();
  
  // Show loading spinner while authentication state is being determined
  if (loading) {
    return <Center h="60vh"><Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" /></Center>;
  }
  
  return currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  const [currentPrediction, setCurrentPrediction] = useState(null);

  // Handler to receive prediction data from PredictionForm or RiskSimulator
  const handlePredictionUpdate = (predictionData) => {
    setCurrentPrediction(predictionData);
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <PredictionProvider>
            <ErrorBoundary>
              <Box minHeight="100vh" display="flex" flexDirection="column">
                <Navbar />
                <Box 
                  flex="1" 
                  p={4}
                  pt={{ base: "70px", md: "90px" }}  // Adjusted padding to account for fixed navbar
                >
                  <Suspense fallback={<Center h="60vh"><Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" /></Center>}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />

                      {/* Protected routes */}
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      } />

                      <Route path="/reminders" element={
                        <PrivateRoute>
                          <Reminders />
                        </PrivateRoute>
                      } />

                      {/* Main application routes */}
                      <Route path="/dashboard" element={
                        <PrivateRoute>
                          <Dashboard
                            currentPrediction={currentPrediction}
                            onPredictionUpdate={handlePredictionUpdate}
                          />
                        </PrivateRoute>
                      } />

                      <Route path="/risk-assessment" element={
                        <PredictionForm onPredictionUpdate={handlePredictionUpdate} />
                      } />

                      {/* Add dedicated route for prediction results */}
                      <Route path="/prediction-result" element={
                        <PredictionResult />
                      } />

                      {/* Add dedicated route for SHAP explanations */}
                      <Route path="/explanation" element={
                        <ShapExplanation predictionData={currentPrediction} />
                      } />

                      {/* <Route path="/simulator" element={
                        <PrivateRoute>
                          <RiskSimulator onPredictionUpdate={handlePredictionUpdate} />
                        </PrivateRoute>
                      } /> */}

                      <Route path="/explain-ai" element={
                        <PrivateRoute>
                          <ExplainableAi predictionData={currentPrediction} />
                        </PrivateRoute>
                      } />

                      <Route path="/features" element={
                        <FeatureImportance />
                      } />

                      <Route path="/model-comparison" element={
                        <ModelComparison onPredictionUpdate={handlePredictionUpdate} />
                      } />

                      <Route path="/prediction-history" element={
                        <PrivateRoute>
                          <PredictionHistory currentPrediction={currentPrediction} />
                        </PrivateRoute>
                      } />

                      <Route path="/health-information" element={
                        <HealthInformation />
                      } />

                      <Route path="/health-info" element={
                        <HealthInfo />
                      } />
                      
                      {/* Redirect root to dashboard or login */}
                      <Route path="/" element={<AuthRedirect />} />

                      {/* Redirect any unknown routes */}
                      <Route path="*" element={<AuthRedirect />} />
                    </Routes>
                  </Suspense>
                </Box>
                <Footer />
                <Suspense fallback={null}>
                  <FeedbackButton />
                </Suspense>
                <Suspense fallback={null}>
                  <AIAssistant />
                </Suspense>
              </Box>
            </ErrorBoundary>
          </PredictionProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;