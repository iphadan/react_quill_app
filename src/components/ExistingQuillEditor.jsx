


import React,{ useState, useRef,useEffect } from 'react';
import { Viewer, Worker,SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import disableScrollPlugin from './../plugins/disableScrollPlugin';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { quillAddBoxApiCall } from '../services/QuillService';

function ExistingQuillEditor({ file,uploadedFile }) {
    const [textBox, setTextBox] = useState(null);  // Only one box allowed
    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [currentPage, setCurrentPage] = useState(0); // Track the current page


    const [existingBoxContent, setExistingBoxContent] = useState(null);  
    const [position, setPosition] = useState(null);  

    const [fileUrl,setFileUrl] = useState(file);
    const [fileUPloaded,setFileUploaded] = useState(file);

    const disableScrollPluginInstance = disableScrollPlugin();


    const overlayRef = useRef(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const zoomPluginInstance = zoomPlugin();
    useEffect(() => {
        zoomPluginInstance.zoomTo(1); // 1 represents 100%
    }, [zoomPluginInstance]);
    useEffect(() => {
        if (uploadedFile) {
            fetchAnnotations(uploadedFile);
        }
    }, [uploadedFile]);
    const token = localStorage.getItem('token');

    // Fetch annotations from the backend
    const fetchAnnotations = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8100/api/pdfbox/quill/existingQuillEditor', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
                
            });

            if (!response.ok) {
                throw new Error('Failed to fetch annotations');
            }

        const data = await response.json();
        setCurrentPage(3);
        const base64Pdf = data.result.manipulatedPdf;
        const byteArray = Uint8Array.from(atob(base64Pdf), c => c.charCodeAt(0)); // Convert base64 to byte array 
        const blob = new Blob([byteArray], { type: "application/pdf" }); 
        setFileUploaded(blob);
        const pdfUrl = URL.createObjectURL(blob); 
        setFileUrl(pdfUrl);
            const newBox = {
                id: Date.now(),
                element: 'text',
                position: { top: data.result.top,left: data.result.left  },
                size: { width: 224, height: 185 },
                text: data.result.content,
                options: [],
                content: '<p><span style="background-color: rgb(255, 255, 0); color: rgb(0, 138, 0);">type here</span></p>',
                delta: generateDelta('<p><span style="background-color: rgb(0, 0, 0); color: rgb(0, 138, 0);">type here</span></p>'),
            };
        
            setTextBox(newBox);
            setExistingBoxContent(data.result.content); // Assuming response includes { annotations: [...] }
            setPosition({left:data.result.left,top:data.result.top})
          


        } catch (error) {
            console.error('Error fetching annotations:', error);
        }
    };
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
        // setCurrentPage(pageNumber); // Update current page when user navigates
    };

    // Function to send JSON payload to the backend
    const sendJsonPayload = async () => {
        if (!textBox || !file) {
            alert('Please add a text box and upload a PDF file before sending the payload.');
            return;
        }
    
        // Ensure the file is a valid File or Blob
       
        let fileToSend = fileUPloaded;
        if (!(fileUPloaded instanceof Blob)) {
            try {
                // Convert Blob to File if necessary
                const randomFileName = `uploaded_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.pdf`;
            fileToSend = new File([fileUPloaded], randomFileName, { type: 'application/pdf' }); // Explicitly set the type
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
            position: position,
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
        formData.append('file', fileUPloaded); // Attach the file with the name
        formData.append('textBox', payloadJson); // Attach the JSON payload
       

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
        <div style={{ position: 'relative', width: '100%', height: '100vh',backgroundColor:"white" }}>
           

            {/* Send JSON Payload Button */}
            <button
                onClick={sendJsonPayload}
                style={{
                    position: 'absolute',
                    top: '20px',
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
                    fileUrl={fileUrl}
                    // plugins={[defaultLayoutPluginInstance]}
                    // onPageChange={({ currentPage }) => handlePageChange(currentPage)}     
                    plugins={[disableScrollPluginInstance]}
                    defaultScale={SpecialZoomLevel.PageFit}
                    initialPage={currentPage}


                />
            </Worker>

            {/* Clickable Overlay */}
            
                {textBox && (
                    <div
                        key={textBox.id}
                        style={{
                            position: 'absolute',
                            top: position.top-2,
                            left: position.left,
                            zIndex: 11,
                        }}
                    >
                        <ReactQuill
                            value={textBox.text}
                            onChange={handleTextChange}
                            modules={modules}
                            formats={formats}
                            style={{
                                width: 210,
                                height:240,
                                fontSize: '14px',
                                color: '#000000',
                            }}
                        />
                    </div>
                )}
            </div>
        
    );
}

export default ExistingQuillEditor;

