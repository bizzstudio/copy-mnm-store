// src/utils/sanitizeScripts.js
/**
 * סניטציה בסיסית לסקריפטים דינמיים מהשרת
 * מונע XSS על ידי בדיקה שהתוכן מכיל רק סקריפטים מורשים
 */

// Whitelist של דומיינים מורשים לסקריפטים חיצוניים
const ALLOWED_SCRIPT_SOURCES = [
    'googletagmanager.com',
    'google-analytics.com',
    'googleadservices.com',
    'facebook.net',
    'connect.facebook.net',
    'flashyapp.com',
    'js.flashyapp.com',
    'hotjar.com',
    'script.hotjar.com',
];

/**
 * בודק אם URL הוא מ-domain מורשה
 */
function isAllowedSource(url) {
    if (!url) return false;
    try {
        const urlObj = new URL(url);
        return ALLOWED_SCRIPT_SOURCES.some(domain =>
            urlObj.hostname.includes(domain)
        );
    } catch {
        return false;
    }
}

/**
 * מסנן event handlers ו-inline JS מסוכן
 * מסיר: onclick, onerror, onload, javascript:, data:, vbscript:
 */
function sanitizeScriptContent(content) {
    if (!content || typeof content !== 'string') return '';

    // הסרת event handlers
    let sanitized = content
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^>\s]*/gi, '');

    // הסרת javascript: ו-data: URLs
    sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/data:\s*text\/html/gi, '')
        .replace(/vbscript:/gi, '');

    return sanitized;
}

/**
 * בודק אם התוכן מכיל רק סקריפטים מורשים
 * מחזיר true אם התוכן בטוח, false אחרת
 */
export function isScriptSafe(scriptContent) {
    if (!scriptContent || typeof scriptContent !== 'string') return false;

    // בדיקה אם יש inline JS מסוכן
    const dangerousPatterns = [
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /Function\s*\(/gi,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(scriptContent)) {
            // אם זה <script src="..."> מורשה - זה בסדר
            const scriptSrcMatch = scriptContent.match(/<script[^>]*src=["']([^"']+)["']/i);
            if (scriptSrcMatch && isAllowedSource(scriptSrcMatch[1])) {
                continue;
            }
            // אם זה לא מורשה - זה מסוכן
            return false;
        }
    }

    return true;
}

/**
 * מסנן ומחזיר תוכן סקריפט בטוח
 * אם התוכן לא בטוח - מחזיר string ריק
 */
export function sanitizeScript(scriptContent) {
    if (!scriptContent || typeof scriptContent !== 'string') return '';

    // אם התוכן לא בטוח - מחזיר ריק
    if (!isScriptSafe(scriptContent)) {
        console.warn('Script content rejected by sanitizer');
        return '';
    }

    // סניטציה נוספת
    return sanitizeScriptContent(scriptContent);
}

/**
 * מסנן אובייקט של scripts (head, bodyStart, bodyEnd)
 */
export function sanitizeScripts(scripts) {
    if (!scripts || typeof scripts !== 'object') {
        return { head: '', bodyStart: '', bodyEnd: '' };
    }

    return {
        head: sanitizeScript(scripts.head || ''),
        bodyStart: sanitizeScript(scripts.bodyStart || ''),
        bodyEnd: sanitizeScript(scripts.bodyEnd || ''),
    };
};