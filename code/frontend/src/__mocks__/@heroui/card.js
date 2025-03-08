import React from 'react';

// Mock implementation of Card component
const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`mock-card ${className}`} data-testid="mock-card" {...props}>
      {children}
    </div>
  );
};

// Mock implementation of CardHeader component
const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mock-card-header ${className}`} data-testid="mock-card-header" {...props}>
      {children}
    </div>
  );
};

// Mock implementation of CardBody component
const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`mock-card-body ${className}`} data-testid="mock-card-body" {...props}>
      {children}
    </div>
  );
};

// Mock implementation of CardFooter component
const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`mock-card-footer ${className}`} data-testid="mock-card-footer" {...props}>
      {children}
    </div>
  );
};

// Export all the mock components
export { Card, CardHeader, CardBody, CardFooter };
export default Card;

