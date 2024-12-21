import React from 'react';
import { Loader } from 'lucide-react';

export const Button = ({ children, onClick, disabled, variant = 'primary' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      variant === 'primary'
        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100'
    } disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

export const Input = ({ label, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    )}
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {...props}
    />
  </div>
);

export const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
    {children}
  </div>
);

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <Loader className="animate-spin h-8 w-8 text-blue-600" />
  </div>
);

export const Alert = ({ type = 'info', message }) => {
  const styles = {
    success: 'bg-green-100 text-green-800 border-green-400',
    error: 'bg-red-100 text-red-800 border-red-400',
    info: 'bg-blue-100 text-blue-800 border-blue-400',
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border ${styles[type]}`}>
      {message}
    </div>
  );
};

export default {
  Button,
  Input,
  Card,
  LoadingSpinner,
  Alert,
};