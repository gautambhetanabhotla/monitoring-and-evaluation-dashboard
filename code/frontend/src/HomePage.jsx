// frontend/HomePage.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from './AuthContext';

const HomePage = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/clients" replace />;
      case 'field staff':
        return <Navigate to="/field-staff" replace />;
      case 'user':
        return <Navigate to="/projects" replace />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }
  // Otherwise, render the login page
  return <Login />;
};

export default HomePage;
