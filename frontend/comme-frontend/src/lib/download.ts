import { toast } from 'sonner';
import { api, getApiBaseUrl } from '@/services/api';

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

    // Determine clean filename
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
        link.download = finalName;
        link.style.display = 'none';
        document.body.appendChild(link);

        // Native .click() is required to trigger the browser's download action
        link.click();

        // Delay cleanup so browser has time to initiate the download
        setTimeout(() => {
            if (link.parentNode) {
                document.body.removeChild(link);
            }
            window.URL.revokeObjectURL(blobUrl);
        }, 2000);

        if (toastId) {
            toast.success(`Downloaded ${finalName}`, { id: toastId });
        }
    };

    // Strategy 0: Direct Axios call for authenticated API endpoints (proof, download-original, etc.)
    const apiBase = getApiBaseUrl();
    const isApiEndpoint = url.startsWith(apiBase) || url.includes('/api/');
    if (isApiEndpoint) {
        try {
            let apiPath = url;
            if (url.startsWith(apiBase)) {
                apiPath = url.slice(apiBase.length);
            } else if (url.includes('/api/')) {
                apiPath = '/' + url.split('/api/').slice(1).join('/api/');
            }
            if (!apiPath.startsWith('/')) {
                apiPath = '/' + apiPath;
            }

            const response = await api.get(apiPath, {
                responseType: 'blob',
            });

            if (response.data && response.data instanceof Blob && response.data.size > 0) {
                // If it's a json error masquerading as a blob
                if (response.data.type?.includes('application/json')) {
                    try {
                        const text = await response.data.text();
                        const json = JSON.parse(text);
                        const msg = json.message || 'Download failed';
                        if (toastId) toast.error(msg, { id: toastId });
                        return false;
                    } catch {
                        // ignore parse error
                    }
                }

                if (!response.data.type?.includes('text/html')) {
                    // Extract filename from Content-Disposition if present
                    const disposition = response.headers?.['content-disposition'];
                    let resolvedName = fileName;
                    if (disposition && disposition.includes('filename=')) {
                        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                        if (match && match[1]) {
                            resolvedName = match[1].replace(/['"]/g, '').trim();
                        }
                    }

                    triggerBlobSave(response.data, resolvedName);
                    return true;
                }
            }
        } catch (apiDirectErr: any) {
            console.warn('Direct API download failed:', apiDirectErr);
            if (apiDirectErr?.response?.data instanceof Blob) {
                try {
                    const text = await apiDirectErr.response.data.text();
                    const json = JSON.parse(text);
                    if (json.message) {
                        if (toastId) toast.error(json.message, { id: toastId });
                        return false;
                    }
                } catch {
                    // ignore
                }
            }
            if (apiDirectErr?.response?.status === 403 || apiDirectErr?.response?.status === 404) {
                if (toastId) toast.error('File not available for download.', { id: toastId });
                return false;
            }
        }
    }

    // Strategy 1: Dedicated backend attachment download API with Axios
    if (!isApiEndpoint) {
        try {
            const response = await api.get('/media/download-file', {
                params: { url, name: fileName },
                responseType: 'blob',
            });

            if (response.data && response.data instanceof Blob && response.data.size > 0) {
                if (!response.data.type?.includes('text/html') && !response.data.type?.includes('application/json')) {
                    triggerBlobSave(response.data, fileName);
                    return true;
                }
            }
        } catch (apiErr) {
            console.warn('Backend download-file API endpoint error, trying direct fetch:', apiErr);
        }
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
            if (blob.size > 0 && !blob.type?.includes('text/html') && !blob.type?.includes('application/json')) {
                triggerBlobSave(blob, fileName);
                return true;
            }
        }
    } catch (fetchErr) {
        console.warn('Direct fetch failed:', fetchErr);
    }

    // Strategy 3: Direct link click fallback for static media URLs
    if (!isApiEndpoint) {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                if (link.parentNode) {
                    document.body.removeChild(link);
                }
            }, 2000);

            if (toastId) {
                toast.success(`Downloading ${fileName}`, { id: toastId });
            }
            return true;
        } catch (linkErr) {
            console.error('Link fallback failed:', linkErr);
        }
    }

    if (toastId) {
        toast.error(`Failed to download ${fileName}`, { id: toastId });
    }
    return false;
}
