import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FlowEditor from './components/FlowEditor';
import { Scheme } from './data/scheme';
import './App.css';

function App() {
  const [currentSchema, setCurrentSchema] = useState(Scheme);

  const handleLoadSchema = useCallback((schema) => {
    setCurrentSchema(schema);
  }, []);

  return (
    <div className="app">
      <Header 
        currentSchema={currentSchema}
        onLoadSchema={handleLoadSchema}
      />
      <main className="main-content">
        <FlowEditor 
          currentSchema={currentSchema}
          onSchemaChange={setCurrentSchema}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
