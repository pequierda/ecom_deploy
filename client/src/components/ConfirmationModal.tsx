// components/ConfirmationModal.tsx
import React from 'react';
import { AlertTriangle, X, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmButtonClass?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  confirmButtonClass,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmClass: confirmButtonClass || 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmClass: confirmButtonClass || 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      case 'info':
        return {
          icon: Info,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmClass: confirmButtonClass || 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmClass: confirmButtonClass || 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmClass: confirmButtonClass || 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Close button */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {title}
            </h3>
            <div className="mb-6">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${config.confirmClass}`}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;