import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeartDiseaseForm from './components/HeartDiseaseForm';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import About from './components/About';
import Contact from './components/Contact';
import FeatureImportance from './components/FeatureImportance';
import ExplainableAi from './components/ExplainableAi';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = extendTheme({
  colors: {
    heartRed: {
      50: '#ffe5e5',
      100: '#f8bcbc',
      200: '#f09292',
      300: '#e86767',
      400: '#e03c3c',
      500: '#c72323',
      600: '#9b1a1a',
      700: '#701212',
      800: '#460808',
      900: '#200000',
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/predict" element={<HeartDiseaseForm />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="/feature-importance" element={<FeatureImportance />} />
              <Route path="/explainable-ai" element={<ExplainableAi />} />
              
              {/* Catch all route for 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;