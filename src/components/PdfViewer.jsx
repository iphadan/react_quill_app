
import React, { useState, useRef,useEffect } from 'react';
import { Viewer, Worker ,SpecialZoomLevel,PageChangeEvent} from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry.js';
import { quillAddBoxApiCall } from '../services/QuillService';
import disableScrollPlugin from './../plugins/disableScrollPlugin';


import { GlobalWorkerOptions } from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.js";

GlobalWorkerOptions.workerSrc = worker;


function PdfViewer({ file,uploadedFile }) {
    const [textBox, setTextBox] = useState(null);  // Only one box allowed
    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [currentPage, setCurrentPage] = useState(0); // Track the current page
    const overlayRef = useRef(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const zoomPluginInstance = zoomPlugin();


// -------------------------------


const pageNavigationPluginInstance = pageNavigationPlugin();
const disableScrollPluginInstance = disableScrollPlugin();
const { CurrentPageInput, GoToNextPageButton, GoToPreviousPage } = pageNavigationPluginInstance;

const changePage = (direction) => {


 let nextPage = currentPage;
    if (direction === 'next' ) {
        nextPage = currentPage + 1;
    } else if (direction === 'prev' ) {
        nextPage = currentPage - 1;
    }
    setCurrentPage(nextPage);
}








    // ----------------------
    useEffect(() => {
        zoomPluginInstance.zoomTo(1); // 1.5 represents 150%
    }, [zoomPluginInstance]);
    const toggleAddTextBoxMode = () => {
        
        setIsAddingTextBox(!isAddingTextBox);
    };
    const mutationObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Handle your logic for newly added nodes here
                handleNewNode(mutation.addedNodes[0]);
            }
        }
    });
    
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    
    function handleNewNode(node) {
        // Your logic for handling new nodes
    }
    
    const handleAddTextBox = (e) => {
    

        if (!isAddingTextBox || !overlayRef.current) return;
    
        const viewerContainer = document.querySelector('.rpv-core__inner-pages');
        if (!viewerContainer) return;
    
        const rect = overlayRef.current.getBoundingClientRect();
        const viewerRect = viewerContainer.getBoundingClientRect();
    
        // Calculate x and y positions relative to the viewerContainer, including PDF viewer scroll positions
        const x = e.clientX - rect.left     ;
        const y = e.clientY - rect.top ;
    
        const pageElements = Array.from(viewerContainer.querySelectorAll('.rpv-core__page-layer'));
        let pageNumber = 1;
        let cumulativeHeight = 0;
    
        for (let i = 0; i < pageElements.length; i++) {
            const pageHeight = pageElements[i].getBoundingClientRect().height;
            if (y <= cumulativeHeight + pageHeight) {
                pageNumber = i + 1;
                break;
            }
            cumulativeHeight += pageHeight;
        }
    
        const adjustedY = y - cumulativeHeight;

        if(x < 382 ||  x > 1000){
setIsAddingTextBox(false)         
   return;

        }
    
        const newBox = {
            id: Date.now(),
            element: 'text',
            position: { top: adjustedY, left: x  },
            size: { width: 224, height: 185 },
            text: 'Edit text',
            options: [],
            pageNumber,
            content: '<p><span style="background-color: rgb(255, 255, 0); color: rgb(0, 138, 0);">type here</span></p>',
            delta: generateDelta('<p><span style="background-color: rgb(0, 0, 0); color: rgb(0, 138, 0);">type here</span></p>'),
        };
    
        setTextBox(newBox);
    };
    
    
    // Optional: Add a MutationObserver to monitor changes in the PDF viewer
    const observePdfViewerChanges = () => {
        const viewerContainer = document.querySelector('.rpv-core__inner-pages');
        if (!viewerContainer) return;
    
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // console.log('PDF viewer content changed.');
                    // Handle content changes if needed
                }
            });
        });
    
        observer.observe(viewerContainer, { childList: true, subtree: true });
    };
    
    // Call this function when initializing the component
    observePdfViewerChanges();
    

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
        // Helper function to process each node
        const processNode = (node) => {
           
            if (node.nodeType === Node.ELEMENT_NODE) {      
                if (node.classList.value[3] === 's') currentAttributes.size = node.classList.length === 1 ? node.classList.value : node.classList[0];                 
                if (node.classList.value[3] === 'f' || node.classList.length === 2 ) currentAttributes.fontFamily= node.classList.length === 1 ? node.classList.value : node.classList[1];
                if (node.style.backgroundColor) currentAttributes.backgroundColor = node.style.backgroundColor;
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
        // console.log(pageNumber);
        setCurrentPage(pageNumber); // Update current page when user navigates
    };

    // Function to send JSON payload to the backend
    const sendJsonPayload = async () => {
        if (!textBox || !file) {
            alert('Please add a text box and upload a PDF file before sending the payload.');
            return;
        }
    
        // Ensure the file is a valid File or Blob
       
        let fileToSend = uploadedFile;
        if (!(uploadedFile instanceof File)) {
            try {
                // Convert Blob to File if necessary
                const randomFileName = `uploaded_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.pdf`;
            fileToSend = new File([uploadedFile], randomFileName, { type: 'application/pdf' }); // Explicitly set the type
            } catch (error) {
                console.error('Error converting Blob to File:', error);
                alert('Error with file upload. Please try again.');
                return;
            }
        }
        
        // Prepare the payload
        const payload = {
            id: textBox.id,
            element: textBox.element,
            position: textBox.position,
            size: textBox.size,
            text: textBox.text,
            options: textBox.options,
            pageNumber: currentPage,
            content: textBox.content,
            delta:textBox.delta
        };
        const payloadJson = JSON.stringify(payload);

        // console.log(textBox.content);
    
        // Create FormData
        const formData = new FormData();
        formData.append('file', uploadedFile); // Attach the file with the name
        formData.append('textBox', payloadJson); // Attach the JSON payload
        // console.log(formData.get('file').type)
        // console.log(formData.get('file').size)
        // console.log(formData.get('file').content)
        // console.log(formData.get('textBox').position)
        // apiCall();

    quillAddBoxApiCall(formData);
      
    };
    
    const modules = {
        toolbar: [
            [{ font: [] }], // Font style
            [{ size: [] }], // Text sizing
            [{ color: [] }, { background: [] }], // Text color and background color
            ['bold', 'italic', 'underline'], // Basic text styling
            ['clean'], // Clear formatting
        ],
    };
    
    const formats = [
        'font',
        'size', // Added size
        'color',
        'background',
        'bold',
        'italic',
        'underline',
    ];
    
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {/* Add Text Box Button */}
            <button
                onClick={toggleAddTextBoxMode}
                style={{
                    position: 'absolute',
                    top: '0px',
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
                Download
            </button>

            {/* PDF Viewer */}
            <Worker workerUrl={pdfjsWorker}>
                <Viewer
                    fileUrl={file}
                    // plugins={[defaultLayoutPluginInstance]}
                    onPageChange={({ currentPage }) => handlePageChange(currentPage)}     
                    defaultScale={SpecialZoomLevel.PageFit}
                    // plugins={[zoomPluginInstance]}
                    // initialPage={currentPage}
                    plugins={[pageNavigationPluginInstance,disableScrollPluginInstance]}
          

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
                    cursor: isAddingTextBox ? 'crosshair' : 'default'  ,
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

            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '20px',
                    zIndex: 15,
                    padding: '10px',
                    backgroundColor: 'green',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                  <GoToPreviousPage />
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '20px',
                    zIndex: 15,
                    padding: '10px',
                    backgroundColor: 'green',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                  <GoToNextPageButton />
              
            </div>
            
            <div
                style={{
                    position: 'absolute',
                    top: '0%',
                    right: '20px',
                    zIndex: 15,
                    padding: '10px',
                    backgroundColor: 'green',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                  <CurrentPageInput />
              
            </div>
          
        </div>
    );
}

export default PdfViewer;


