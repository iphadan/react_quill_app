// src/components/PdfUpload.js

import React, { useState } from 'react';

function PdfUpload({ onFileChange }) {
  return (
    <div>
      <input type="file" accept="application/pdf" onChange={onFileChange} />
    </div>
  );
}

export default PdfUpload;
