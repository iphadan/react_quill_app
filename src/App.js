// src/App.js

import React, { useState } from 'react';
import PdfUpload from './components/PdfUpload';
import PdfViewer from './components/PdfViewer';
import './App.css';

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    const fileURL = URL.createObjectURL(uploadedFile);
    setFile(fileURL);
  };

  return (
    <div className="App">
      <h1>PDF Upload and Viewer</h1>
      <PdfUpload onFileChange={handleFileChange} />
      {file && <PdfViewer file={file} />}
    </div>
  );
}

export default App;
