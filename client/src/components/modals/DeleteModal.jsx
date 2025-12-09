import React, { useState, useEffect } from 'react';
import '../../assets/css/components/DeleteModal.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, propertyName }) => {
  const [randomCode, setRandomCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');

  // Generate 4 random numbers when modal opens
  useEffect(() => {
    if (isOpen) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setRandomCode(code);
      setUserInput('');
      setError('');
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (userInput === randomCode) {
      onConfirm();
      handleClose();
    } else {
      setError('Verification code does not match!');
    }
  };

  const handleClose = () => {
    setUserInput('');
    setError('');
    onClose();
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setUserInput(value);
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={handleClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="delete-modal-title">Delete Property</h2>
        </div>

        <div className="delete-modal-body">
          <p className="delete-modal-message">
            Are you sure you want to delete <strong>{propertyName || 'this property'}</strong>?
          </p>
          <p className="delete-modal-warning">
            This action cannot be undone. All data associated with this property will be permanently removed.
          </p>

          <div className="verification-section">
            <p className="verification-label">
              Please enter the verification code to confirm deletion:
            </p>
            <div className="verification-code">
              {randomCode}
            </div>
            <input
              type="text"
              className={`verification-input ${error ? 'error' : ''}`}
              placeholder="Enter 4-digit code"
              value={userInput}
              onChange={handleInputChange}
              maxLength="4"
              inputMode="numeric"
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>

        <div className="delete-modal-footer">
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="btn-delete" 
            onClick={handleDelete}
            disabled={userInput.length !== 4}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;