// import React, { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { setPDF } from "./redux/PDF Slice"; // Import your action
// import PDFDisplay from "./components/PDFViewer"; // Assuming you have this component
// import DownloadPdf from "./components/DownloadPdf";

// function PDFEditor({ pdfUrl }) {
//   const dispatch = useDispatch();

//   // Dispatch the uploaded PDF file (Blob URL) to Redux store
//   useEffect(() => {
//     if (pdfUrl) {
//       dispatch(setPDF(pdfUrl)); // Dispatch the PDF URL to Redux store
//     }
//   }, [pdfUrl, dispatch]);

//   return (
//     <div>

//       <DownloadPdf />
//       <PDFDisplay />
//     </div>
//   );
// }

// export default PDFEditor;
