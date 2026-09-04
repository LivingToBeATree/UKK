import { toast } from 'sonner';
import { api } from '@/services/api';

interface DownloadOptions {
    showToast?: boolean;
    customName?: string;
}

/**
 * Robustly downloads any file or media directly to the user's computer.
 * Uses client-side Blob generation and backend Content-Disposition attachment streaming
 * to ensure files are saved locally without opening new tabs or navigating away.
 */
export async function downloadFile(
    url: string,
    fallbackFileName?: string,
    options: DownloadOptions = { showToast: true }
): Promise<boolean> {
    if (!url) {
        toast.error('Unable to download: invalid file URL.');
        return false;
    }

    // 1. Determine clean filename
    let fileName = options.customName || fallbackFileName;
    if (!fileName || fileName.trim() === '' || fileName === 'deliverable' || fileName === 'attachment' || fileName === 'media') {
        try {
            const urlObj = new URL(url, window.location.href);
            const pathParts = urlObj.pathname.split('/');
            const rawLastPart = pathParts[pathParts.length - 1] || 'download';
            fileName = decodeURIComponent(rawLastPart);
        } catch {
            fileName = fallbackFileName || 'download';
        }
    }

    // Strip trailing query parameters
    fileName = fileName.split('?')[0].trim();

    const toastId = options.showToast !== false ? toast.loading(`Downloading ${fileName}...`) : undefined;

    // Helper: Trigger browser file save from Blob
    const triggerBlobSave = (blob: Blob, saveName: string) => {
        let finalName = saveName;
        // Ensure extension if missing
        if (!finalName.includes('.') && blob.type) {
            const ext = blob.type.split('/')[1]?.split(';')[0]?.replace('jpeg', 'jpg');
            if (ext && ext !== 'octet-stream') {
                finalName = `${finalName}.${ext}`;
            }
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', finalName);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 2000);

        if (toastId) {
            toast.success(`Downloaded ${finalName}`, { id: toastId });
        }
    };

    // Strategy 1: Dedicated backend attachment download API with Axios (handles credentials, CORS, and disk reading)
    try {
        const response = await api.get('/media/download-file', {
            params: { url, name: fileName },
            responseType: 'blob',
        });

        if (response.data && response.data instanceof Blob && response.data.size > 0) {
            // Verify it is not an HTML error response masquerading as a blob
            if (!response.data.type?.includes('text/html')) {
                triggerBlobSave(response.data, fileName);
                return true;
            }
        }
    } catch (apiErr) {
        console.warn('Backend download-file API endpoint error, trying direct fetch:', apiErr);
    }

    // Strategy 2: Direct fetch to URL with CORS
    try {
        const directUrl = url.includes('?') ? `${url}&download=1&name=${encodeURIComponent(fileName)}` : `${url}?download=1&name=${encodeURIComponent(fileName)}`;
        const response = await fetch(directUrl, {
            mode: 'cors',
            credentials: 'include',
        });

        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0 && !blob.type?.includes('text/html')) {
                triggerBlobSave(blob, fileName);
                return true;
            }
        }
    } catch (fetchErr) {
        console.warn('Direct fetch failed, trying hidden iframe fallback:', fetchErr);
    }

    // Strategy 3: Hidden iframe / forced attachment link
    try {
        const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const downloadEndpoint = `${rawBaseUrl.replace(/\/+$/, '')}/media/download-file?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;

        const hiddenIframe = document.createElement('iframe');
        hiddenIframe.style.display = 'none';
        hiddenIframe.src = downloadEndpoint;
        document.body.appendChild(hiddenIframe);

        setTimeout(() => {
            document.body.removeChild(hiddenIframe);
        }, 5000);

        if (toastId) {
            toast.success(`Downloaded ${fileName}`, { id: toastId });
        }
        return true;
    } catch (finalErr) {
        console.error('All download strategies failed:', finalErr);
        if (toastId) {
            toast.error(`Failed to download ${fileName}`, { id: toastId });
        }
        return false;
    }
}
