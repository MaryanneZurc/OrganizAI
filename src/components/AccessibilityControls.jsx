// src/components/AccessibilityControls.jsx
import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { FaAdjust, FaFont } from 'react-icons/fa';

const AccessibilityControls = () => {
  const { highContrast, toggleHighContrast, fontSize, setFontSizePreference } = useAccessibility();

  return (
    <div className="flex items-center gap-3 bg-gray-700 p-2 rounded-lg">
      <button
        onClick={toggleHighContrast}
        className={`p-2 rounded-lg transition-colors ${
          highContrast ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white hover:bg-gray-500'
        }`}
        title="Alternar alto contraste"
      >
        <FaAdjust />
      </button>

      <div className="flex items-center gap-1 border-l border-gray-500 pl-3">
        <button
          onClick={() => setFontSizePreference('small')}
          className={`p-2 rounded-lg text-xs transition-colors ${
            fontSize === 'small' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title="Fonte pequena"
        >
          A
        </button>
        <button
          onClick={() => setFontSizePreference('medium')}
          className={`p-2 rounded-lg text-base transition-colors ${
            fontSize === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title="Fonte média"
        >
          A
        </button>
        <button
          onClick={() => setFontSizePreference('large')}
          className={`p-2 rounded-lg text-xl transition-colors ${
            fontSize === 'large' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title="Fonte grande"
        >
          A
        </button>
      </div>
    </div>
  );
};

export default AccessibilityControls;