
const token = localStorage.getItem('token');
const base_url = "http://127.0.0.1:8100/api/pdfbox";




export const apiCall = () =>{
    console.log("base url",base_url);
}

export const quillAddBoxApiCall = async (formData) => {

    try {
            
            // Use the correct Authorization token and endpoint
            const response = await fetch(`${base_url}/quill/savePayload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData, // FormData automatically sets the multipart/form-data content type
                credentials: 'include',
            });
            
            if (response.ok) {
                // Convert the byte array (response body) to a Blob
                const blob = await response.blob();
            
                // Create a URL for the Blob
                const url = URL.createObjectURL(blob);
            
                // Create an anchor element to trigger the download
                const a = document.createElement('a');
                a.href = url;
                a.download = 'document.pdf'; // Set the desired filename for the download
            
                // Programmatically click the anchor element to start the download
                a.click();
            
                // Revoke the URL after the download is triggered
                URL.revokeObjectURL(url);
            } else {
                const error = await response.json();
                alert(`Failed to send payload: ${error.message}`);
            }
            
        } catch (error) {
            console.error('Error sending payload:', error);
            alert('Error sending payload');
        }
}

export const loginApiCall = async (email, password) => {
    try {
        const response = await fetch(`${base_url}/auth/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to log in');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return { success: true, token: data.token };
    } catch (error) {
        return { success: false, message: error.message };
    }
};