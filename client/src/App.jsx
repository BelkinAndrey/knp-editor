import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FlowEditor from './components/FlowEditor';
import './App.css';

function App() {


  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <FlowEditor />
      </main>
      <Footer />
    </div>
  );
}

export default App;
