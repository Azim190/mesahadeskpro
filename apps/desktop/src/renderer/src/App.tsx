import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './app/ThemeProvider';
import './i18n/config'; // Initialize i18n
import {
  LoginPage,
  VerifyOtpPage,
  DashboardPage,
  SurveyTransferPage,
  ReportsPage,
  SurveySketchPage,
  BaladiTransactionsPage,
  SurveyDecisionPage,
  PriceOffersPage,
  ContractsPage,
  ProjectDetailsPage,
  SettingsUsersPage,
  SettingsGeneralPage,
  SupportPage,
  MasterLogPage,
} from './features/placeholders/Placeholders';

function ProtectedRoute({ children }: { children: React.ReactElement }): React.ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    window.api.secureStorage.getItem('accessToken').then((token) => {
      setIsAuthenticated(!!token);
    });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/master-log" element={<ProtectedRoute><MasterLogPage /></ProtectedRoute>} />
          <Route path="/work/survey-transfer" element={<ProtectedRoute><SurveyTransferPage /></ProtectedRoute>} />
          <Route path="/work/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/work/survey-sketch" element={<ProtectedRoute><SurveySketchPage /></ProtectedRoute>} />
          <Route path="/work/baladi-transactions" element={<ProtectedRoute><BaladiTransactionsPage /></ProtectedRoute>} />
          <Route path="/work/survey-decision" element={<ProtectedRoute><SurveyDecisionPage /></ProtectedRoute>} />
          <Route path="/work/price-offers" element={<ProtectedRoute><PriceOffersPage /></ProtectedRoute>} />
          <Route path="/work/contracts" element={<ProtectedRoute><ContractsPage /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
          <Route path="/settings/users" element={<ProtectedRoute><SettingsUsersPage /></ProtectedRoute>} />
          <Route path="/settings/general" element={<ProtectedRoute><SettingsGeneralPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          
          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
