import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FlowEditor from './components/FlowEditor';
import './App.css';

function App() {
  const [currentSchema, setCurrentSchema] = useState({
    name: '',
    nodes: [],
    edges: [],
    position: [0, 0],
    zoom: 1,
    isPanelCollapsed: false,
    panelWidth: 300,
    globalParams: [],
    flowHistoryStack: []
  });
  const clearInternalSchemaRef = useRef(null);

  const handleLoadSchema = useCallback((schema) => {
    setCurrentSchema(schema);
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (clearInternalSchemaRef.current) {
      clearInternalSchemaRef.current();
    }
  }, []);

  return (
    <div className="app">
      <Header 
        currentSchema={currentSchema}
        onLoadSchema={handleLoadSchema}
        onClearCanvas={handleClearCanvas}
      />
      <main className="main-content">
        <FlowEditor 
          currentSchema={currentSchema}
          onSchemaChange={setCurrentSchema}
          clearInternalSchemaRef={clearInternalSchemaRef}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
