import React, { useState } from 'react';
import MongoDBModal from './MongoDBModal';
import './Header.css';

const Header = ({ currentSchema, onLoadSchema, onClearCanvas }) => {
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
      
      <div className="header-right-buttons">
        <button className="clear-canvas-button header-icon-button" onClick={onClearCanvas} aria-label="Очистить канвас">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
          <path d="M 12.5 4 C 10.032499 4 8 6.0324991 8 8.5 L 8 39.5 C 8 41.967501 10.032499 44 12.5 44 L 35.5 44 C 37.967501 44 40 41.967501 40 39.5 L 40 18.5 A 1.50015 1.50015 0 0 0 39.560547 17.439453 L 39.544922 17.423828 L 26.560547 4.4394531 A 1.50015 1.50015 0 0 0 25.5 4 L 12.5 4 z M 12.5 7 L 24 7 L 24 15.5 C 24 17.967501 26.032499 20 28.5 20 L 37 20 L 37 39.5 C 37 40.346499 36.346499 41 35.5 41 L 12.5 41 C 11.653501 41 11 40.346499 11 39.5 L 11 8.5 C 11 7.6535009 11.653501 7 12.5 7 z M 27 9.1210938 L 34.878906 17 L 28.5 17 C 27.653501 17 27 16.346499 27 15.5 L 27 9.1210938 z"></path>
          </svg>
        </button>
        <button className="create-code-button">
          Create code
        </button>
      </div>

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