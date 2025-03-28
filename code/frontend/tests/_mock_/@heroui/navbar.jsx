import React from 'react';

// Mock the components from @heroui/navbar
const Navbar = ({ children, ...props }) => (
  <nav data-testid="navbar" {...props}>
    {children}
  </nav>
);

const NavbarBrand = ({ children, ...props }) => (
  <div data-testid="navbar-brand" {...props}>
    {children}
  </div>
);

const NavbarContent = ({ children, ...props }) => (
  <div data-testid="navbar-content" {...props}>
    {children}
  </div>
);

const NavbarItem = ({ children, ...props }) => (
  <div data-testid="navbar-item" {...props}>
    {children}
  </div>
);

const NavbarMenu = ({ children, ...props }) => (
  <div data-testid="navbar-menu" {...props}>
    {children}
  </div>
);

const NavbarMenuToggle = ({ children, ...props }) => (
  <button data-testid="navbar-menu-toggle" {...props}>
    {children}
  </button>
);

const NavbarMenuItem = ({ children, ...props }) => (
  <div data-testid="navbar-menu-item" {...props}>
    {children}
  </div>
);

// Export all the components
export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem
};

// Default export
export default {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem
};

