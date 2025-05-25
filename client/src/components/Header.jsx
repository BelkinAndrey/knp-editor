import React, { useState } from 'react';
import MongoDBModal from './MongoDBModal';
import './Header.css';

const Header = ({ currentSchema, onLoadSchema }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src="/logo.svg" alt="Logo" className="logo-img" />
          <span className="app-name"><span className="app-name-bold">KNP</span> Editor</span>
        </div>
        <button 
          className="hamburger-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <button className="create-code-button">
        Create code
      </button>

      <MongoDBModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoadSchema={onLoadSchema}
        currentSchema={currentSchema}
      />
    </header>
  );
};

export default Header;