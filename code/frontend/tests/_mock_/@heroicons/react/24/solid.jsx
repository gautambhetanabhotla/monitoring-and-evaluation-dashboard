import React from 'react';

// Create a simple mock implementation for all exported icons
const createIconMock = (name) => {
  const IconComponent = (props) => (
    <svg 
      data-testid={`solid-${name}`}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...props}
    >
      <rect width="24" height="24" opacity="0" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
  return IconComponent;
};

// Mock exports for all the icons used in the codebase
export const HomeIcon = createIconMock('HomeIcon');
export const UserIcon = createIconMock('UserIcon');
export const ChevronDownIcon = createIconMock('ChevronDownIcon');
export const ChevronUpIcon = createIconMock('ChevronUpIcon');
export const MagnifyingGlassIcon = createIconMock('MagnifyingGlassIcon');
export const BellIcon = createIconMock('BellIcon');
export const ArrowRightIcon = createIconMock('ArrowRightIcon');
export const DocumentTextIcon = createIconMock('DocumentTextIcon');
export const ArrowLeftIcon = createIconMock('ArrowLeftIcon');
export const PlusIcon = createIconMock('PlusIcon');
export const CheckIcon = createIconMock('CheckIcon');
export const XMarkIcon = createIconMock('XMarkIcon');

