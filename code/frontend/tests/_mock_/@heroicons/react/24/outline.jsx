import React from 'react';

// Create a simple mock implementation for all exported icons
const createIconMock = (name) => {
  const IconComponent = (props) => (
    <svg 
      data-testid={`outline-${name}`}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="24" height="24" opacity="0" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
  return IconComponent;
};

// Mock exports for all the icons used in the codebase
export const MapPinIcon = createIconMock('MapPinIcon');
export const CurrencyRupeeIcon = createIconMock('CurrencyRupeeIcon');
export const CalendarDateRangeIcon = createIconMock('CalendarDateRangeIcon');
export const UserIcon = createIconMock('UserIcon');
export const LinkIcon = createIconMock('LinkIcon');
export const ChevronRightIcon = createIconMock('ChevronRightIcon');
export const EnvelopeIcon = createIconMock('EnvelopeIcon');
export const PhoneIcon = createIconMock('PhoneIcon');
export const PencilIcon = createIconMock('PencilIcon');
export const TrashIcon = createIconMock('TrashIcon');
export const ArrowPathIcon = createIconMock('ArrowPathIcon');
export const PlusIcon = createIconMock('PlusIcon');
export const EllipsisVerticalIcon = createIconMock('EllipsisVerticalIcon');
export const MagnifyingGlassIcon = createIconMock('MagnifyingGlassIcon');
export const BellIcon = createIconMock('BellIcon');
export const PencilSquareIcon = createIconMock('PencilSquareIcon');
export const CheckCircleIcon = createIconMock('CheckCircleIcon');
export const ArrowTrendingDownIcon = createIconMock('ArrowTrendingDownIcon');
export const ArrowTrendingUpIcon = createIconMock('ArrowTrendingUpIcon');
export const CheckIcon = createIconMock('CheckIcon');
export const ArrowsUpDownIcon = createIconMock('ArrowsUpDownIcon');

