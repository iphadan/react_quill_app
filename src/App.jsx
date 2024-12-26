import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PdfUpload from './components/PdfUpload';
import Login from './components/Login';
import PdfViewer from './components/PdfViewer';
import ExistingQuillEditor from './components/ExistingQuillEditor'; // Import the new component
import './App.css';


function App() {
  const [fileData, setFileData] = useState({ file: null, fileURL: null });

  function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem('token'); // Check for token
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    const fileURL = URL.createObjectURL(uploadedFile);
    setFileData({ file: uploadedFile, fileURL });
  };

  return (
    <div className="App">
      <div className="mash-background">
        <Router>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Route for PDF Upload and Viewer */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <PdfUpload onFileChange={handleFileChange} />
                    {fileData.file && <PdfViewer uploadedFile={fileData.file} file={fileData.fileURL} />}
                  </>
                </ProtectedRoute>
              }
            />

            {/* Route for Editing Existing PDFs */}
            <Route
              path="/ExistingQuillEditor"
              element={
                <ProtectedRoute>
                  <>
                    <PdfUpload onFileChange={handleFileChange} />
                    {fileData.file && <ExistingQuillEditor uploadedFile={fileData.file} file={fileData.fileURL} />}
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
