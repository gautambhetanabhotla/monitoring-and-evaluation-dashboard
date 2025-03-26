import React from 'react';

const Input = ({ isRequired, errorMessage, label, id = 'input-id', value, onValueChange, ...props }) => (
  <div>
    {label && <label htmlFor={id}>{label}{isRequired && '*'}</label>}
    <input
      id={id} // Associate the input with the label
      value={value || ''}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      aria-invalid={!!errorMessage} // Indicate if there's an error
      {...props}
    />
    {errorMessage && <span role="alert">{errorMessage}</span>}
  </div>
);

const Textarea = ({ label, id = 'textarea-id', value, onValueChange, isReadOnly, ...props }) => (
  <div>
    {label && <label htmlFor={id}>{label}</label>}
    <textarea
      id={id} // Associate the textarea with the label
      value={value || ''}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      readOnly={isReadOnly}
      {...props}
    />
  </div>
);

export { Input, Textarea };