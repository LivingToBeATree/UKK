import { toast } from 'sonner';

interface DownloadOptions {
    showToast?: boolean;
    customName?: string;
}

/**
 * Downloads any remote or local file/media directly to the user's device
 * by fetching it as a Blob, bypassing cross-origin restrictions on standard <a> tags.
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
    if (!fileName || fileName.trim() === '') {
        try {
            const urlObj = new URL(url, window.location.href);
            const pathParts = urlObj.pathname.split('/');
            fileName = decodeURIComponent(pathParts[pathParts.length - 1] || 'download');
        } catch {
            fileName = 'download';
        }
    }

    // Strip trailing query params from fileName if present
    fileName = fileName.split('?')[0];

    const toastId = options.showToast !== false ? toast.loading(`Downloading ${fileName}...`) : undefined;

    try {
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit',
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status} (${response.statusText})`);
        }

        const blob = await response.blob();

        // Ensure extension if missing from mime type
        if (!fileName.includes('.') && blob.type) {
            const ext = blob.type.split('/')[1]?.split(';')[0]?.replace('jpeg', 'jpg');
            if (ext && ext !== 'octet-stream') {
                fileName = `${fileName}.${ext}`;
            }
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke after slight delay to allow download initiation
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 1500);

        if (toastId) {
            toast.success(`Downloaded ${fileName}`, { id: toastId });
        }
        return true;
    } catch (err) {
        console.warn('Direct Blob download failed, attempting fallback download:', err);

        try {
            // Fallback for strict cross-origin blocks (e.g. S3 without permissive CORS headers)
            const fallbackLink = document.createElement('a');
            fallbackLink.href = url;
            fallbackLink.target = '_blank';
            fallbackLink.rel = 'noopener noreferrer';
            fallbackLink.download = fileName;
            fallbackLink.style.display = 'none';
            document.body.appendChild(fallbackLink);
            fallbackLink.click();
            document.body.removeChild(fallbackLink);

            if (toastId) {
                toast.success(`Opening ${fileName}...`, { id: toastId });
            }
            return true;
        } catch (fallbackErr) {
            console.error('Download fallback also failed:', fallbackErr);
            if (toastId) {
                toast.error('Failed to download file.', { id: toastId });
            }
            return false;
        }
    }
}
