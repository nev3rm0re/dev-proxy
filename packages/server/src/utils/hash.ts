/**
 * Generates a 6-character hash from the provided string arguments
 * @param args String arguments to combine and hash
 * @returns 6-character base36 hash
 */
export function shortId(...args: unknown[]): string {
    const combined = args.map(arg => {
        if (Array.isArray(arg) || (typeof arg === 'object' && arg !== null)) {
            return JSON.stringify(arg);
        }
        return String(arg);
    }).join(':');
    
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and take modulo to ensure 6 chars in base36
    const positiveHash = Math.abs(hash);
    const shortId = positiveHash.toString(36).padStart(6, '0').slice(-6);
    
    return shortId;
}