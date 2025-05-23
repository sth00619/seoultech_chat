import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary': return 'btn-secondary';
      case 'outline': return 'btn-outline';
      case 'ghost': return 'btn-ghost';
      case 'danger': return 'btn-danger';
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'btn-sm';
      case 'large': return 'btn-lg';
      default: return '';
    }
  };

  const classes = [
    'btn',
    getVariantClass(),
    getSizeClass(),
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="spinner" />
      ) : icon ? (
        React.cloneElement(icon, { size: 16 })
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;