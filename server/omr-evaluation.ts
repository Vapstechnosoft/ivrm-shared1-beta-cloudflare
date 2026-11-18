'use server';

export async function evaluateOmr(formData: FormData) {
    try {
        const response = await fetch('https://omrivrm.vercel.app/evaluate/pdf', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `External API returned status ${response.status}`);
        }

        const buffer = await response.arrayBuffer();

        // Return as base64 or similar if needed, but since we want a file,
        // we'll return the arrayBuffer as a base64 string for the client to convert back to a blob
        return {
            success: true,
            data: Buffer.from(buffer).toString('base64'),
            contentType: response.headers.get('content-type') || 'application/pdf'
        };
    } catch (error: any) {
        console.error('OMR Server Action Error:', error);
        return {
            success: false,
            message: error.message || 'Failed to communicate with the OMR evaluation server.'
        };
    }
}
