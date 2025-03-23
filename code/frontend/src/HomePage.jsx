// frontend/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Login from './Login';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.user) {
          // Determine redirection path based on role
          const { role } = data.user;
          if (role === 'admin') {
            setRedirectPath('/clients');
          } else if (role === 'field staff') {
            setRedirectPath('/field-staff');
          } else if (role === 'client') {
            setRedirectPath('/projects');
          } else {
            setRedirectPath('/Unauthorised'); // default route if role doesn't match any case
          }
        } else {
          // No valid session found, remain on login page
          setRedirectPath(null);
        }
      } catch (error) {
        console.error('Error checking current user:', error);
        setRedirectPath(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If a valid session exists, redirect based on role
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render the login page
  return <Login />;
};

export default HomePage;
