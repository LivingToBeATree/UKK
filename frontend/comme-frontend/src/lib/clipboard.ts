/**
 * Robust clipboard copy utility with fallback for non-secure or restricted contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    // Try modern Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback to legacy execCommand below
        }
    }

    // Fallback using invisible textarea
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch {
        return false;
    }
}

/**
 * Trigger file download for recovery codes text file.
 */
export function downloadTextFile(filename: string, text: string): void {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
}
