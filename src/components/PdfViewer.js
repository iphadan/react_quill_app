
// import React from 'react';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import { pdfjs } from 'react-pdf';
// import { Viewer,Worker } from '@react-pdf-viewer/core';
// import '@react-pdf-viewer/core/lib/styles/index.css'; // Ensure the CSS is also included
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// function PdfViewer({ file }) {
//   const defaultLayoutPluginInstance = defaultLayoutPlugin();

//   return (
//     <div>
//       <Worker>
//         <Viewer fileUrl={file} plugins={[defaultLayoutPluginInstance]} />
//       </Worker>
//     </div>
//   );
// }

// export default PdfViewer;


import React, { useState, useRef } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

function PdfEditor({ file }) {
    const [textBox, setTextBox] = useState(null);  // Only one box allowed
    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const overlayRef = useRef(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const toggleAddTextBoxMode = () => {
        setIsAddingTextBox(!isAddingTextBox);
    };

    const handleAddTextBox = (e) => {
        if (!isAddingTextBox || !overlayRef.current) return;

        // Get position of the click relative to the overlay container
        const rect = overlayRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Ensure pageNumber is the updated one
        const newBox = {
            id: Date.now(),
            element: 'text',
            position: { top: y, left: x },
            size: { width: 224, height: 185 }, // Default size
            text: 'Edit text',
            options: [], // Add additional options if needed
            pageNumber: currentPage, // Ensure we use the dynamically updated currentPage
            content: '<p><span style="background-color: rgb(0, 0, 0); color: rgb(0, 138, 0);">type here</span></p>',
            delta: generateDelta('<p><span style="background-color: rgb(0, 0, 0); color: rgb(0, 138, 0);">type here</span></p>'),
        };

        setTextBox(newBox);  // Update the state with the new box data
    };

    const handleTextChange = (content) => {
        if (textBox) {
            setTextBox((prev) => ({
                ...prev,
                text: content,
                content: content,
                delta: generateDelta(content), // Update delta based on the content
            }));
        }
    };

    // Helper function to generate delta
    const generateDelta = (content) => {
        const delta = [];
        const doc = new DOMParser().parseFromString(content, 'text/html');
        const elements = doc.body.children;
    
        let currentAttributes = {}; // Holds attributes for the current block of text
    let i =0;
        // Helper function to process each node
        const processNode = (node) => {
           
            if (node.nodeType === Node.ELEMENT_NODE) {
        //  let _class = node
        //             console.log(JSON.stringify(_class))
                    
        //             console.log(_class)
                
                    // if (span.style.fontSize) currentAttributes.size = span.style.fontSize;                 
                if (node.attributes.class) currentAttributes.fontFamily=node.attributes.class.nodeValue;
                if (node.style.backgroundColor) currentAttributes.background = node.style.backgroundColor;
                if (node.style.color) currentAttributes.color = node.style.color;
                if (node.nodeName === 'STRONG') currentAttributes.bold = true;
                if (node.nodeName === 'EM') currentAttributes.italic = true;
                if (node.nodeName === 'U') currentAttributes.underline = true;
    
              
    
                // Process child nodes recursively
                Array.from(node.childNodes).forEach(childNode => {
                    processNode(childNode);
                });
            }
            if (node.nodeType === Node.TEXT_NODE) {
                // Add text content with current attributes
                if (node.textContent.trim()) {
                    delta.push({
                        insert: node.textContent,
                        attributes: { ...currentAttributes }
                    });
                    currentAttributes={};
                    delta.push({ insert: "\n"});
                    


                }
            }
           
        };
    
        // Process top-level elements
        Array.from(elements).forEach(element => {
            processNode(element);
        });
    
        return delta;
    };
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // Update current page when user navigates
    };

    // Function to send JSON payload to the backend
    const sendJsonPayload = async () => {
        if (!textBox) return;

        const payload = {
            id: textBox.id,
            element: textBox.element,
            position: textBox.position,
            size: textBox.size,
            text: textBox.text,
            options: textBox.options,
            pageNumber: textBox.pageNumber,
            content: textBox.content,
            delta: textBox.delta,
        };

        // try {
        //     const response = await fetch('https://your-backend-endpoint.com/api', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ textBox: payload }),
        //     });

        //     if (response.ok) {
        //         alert('Payload sent successfully!');
        //     } else {
        //         alert('Failed to send payload');
        //     }
        // } catch (error) {
        //     console.error('Error sending payload:', error);
        //     alert('Error sending payload');
        // }
        console.log(textBox);
    };
const modules = {
        toolbar: [
            [{ font: [] }], // Font style
            [{ color: [] }, { background: [] }], // Text color and background color
            ['bold', 'italic', 'underline'], // Basic text styling
            [{ align: [] }], // Alignment options
            ['clean'], // Clear formatting
        ],
    };

    const formats = [
        'font',
        'color',
        'background',
        'bold',
        'italic',
        'underline',
        'align',
    ];
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {/* Add Text Box Button */}
            <button
                onClick={toggleAddTextBoxMode}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '220px',
                    zIndex: 15,
                    padding: '10px',
                    backgroundColor: isAddingTextBox ? 'red' : 'green',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                {isAddingTextBox ? 'Stop Adding Text Box' : 'Add Text Box'}
            </button>

            {/* Send JSON Payload Button */}
            <button
                onClick={sendJsonPayload}
                style={{
                    position: 'absolute',
                    top: '50px',
                    left: '220px',
                    zIndex: 15,
                    padding: '10px',
                    backgroundColor: 'blue',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Send JSON Payload
            </button>

            {/* PDF Viewer */}
            <Worker workerUrl={pdfjsWorker}>
                <Viewer
                    fileUrl={file}
                    plugins={[defaultLayoutPluginInstance]}
                    onPageChange={({ currentPage }) => handlePageChange(currentPage)} // Track page number changes
                />
            </Worker>

            {/* Clickable Overlay */}
            <div
                ref={overlayRef}
                style={{
                    position: isAddingTextBox ? 'absolute' : 'none',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                    cursor: isAddingTextBox ? 'crosshair' : 'default',
                }}
                onClick={handleAddTextBox}
            >
                {textBox && (
                    <div
                        key={textBox.id}
                        style={{
                            position: 'absolute',
                            top: textBox.position.top,
                            left: textBox.position.left,
                            zIndex: 11,
                        }}
                    >
                        <ReactQuill
                            value={textBox.text}
                            onChange={handleTextChange}
                            modules={modules}
                            formats={formats}
                            style={{
                                width: textBox.size.width,
                                height: textBox.size.height,
                                fontSize: '16px',
                                color: '#000000',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PdfEditor;

