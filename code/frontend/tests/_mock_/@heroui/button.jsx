import React from 'react';

// Mock implementation of the @heroui/button component
const Button = ({ children, onClick, className, type, size, variant, disabled, ...props }) => {
  // Create a simple button element that takes the same props as the real component
  return (
    <button
      onClick={onClick}
      type={type || 'button'}
      className={className}
      disabled={disabled}
      data-size={size}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  );
};

// Export any other components or functions that might be used from the package
export { Button };
export default Button;

