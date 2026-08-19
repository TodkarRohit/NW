/**
 * Google Drive URL Validation & Sanitization Utility
 * Strictly enforces Google Drive Option A safety rules:
 * - Validates standard Google Drive and Docs sharing links
 * - Rejects non-Google domains, malicious protocols, and arbitrary URLs
 * - Produces safe preview/embed URLs
 * - Never leaks or logs URLs in debug/error contexts
 */

// Regex patterns for valid Google Drive/Docs file links
const DRIVE_FILE_REGEX = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{25,})\/?(?:view|edit|preview)?(?:\?.*)?$/i;
const DRIVE_OPEN_REGEX = /^https:\/\/drive\.google\.com\/open\?(?:.*&)?id=([a-zA-Z0-9_-]{25,})(?:&.*)?$/i;
const DRIVE_UC_REGEX = /^https:\/\/drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]{25,})(?:&.*)?$/i;
const DRIVE_FOLDER_REGEX = /^https:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]{25,})(?:\?.*)?$/i;
const DOCS_REGEX = /^https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]{25,})\/?(?:edit|view|preview)?(?:\?.*)?$/i;

/**
 * Validates whether a URL is a legitimate Google Drive or Docs share link
 * @param {string} url - Candidate URL
 * @returns {boolean}
 */
function isValidGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return false;

    const trimmedUrl = url.trim();

    try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol !== 'https:') return false;

        const hostname = parsed.hostname.toLowerCase();
        if (hostname !== 'drive.google.com' && hostname !== 'docs.google.com') {
            return false;
        }

        return (
            DRIVE_FILE_REGEX.test(trimmedUrl) ||
            DRIVE_OPEN_REGEX.test(trimmedUrl) ||
            DRIVE_UC_REGEX.test(trimmedUrl) ||
            DRIVE_FOLDER_REGEX.test(trimmedUrl) ||
            DOCS_REGEX.test(trimmedUrl)
        );
    } catch {
        return false;
    }
}

/**
 * Extracts the Google Drive File or Folder ID safely
 * @param {string} url - Validated Google Drive URL
 * @returns {string|null} - ID string or null
 */
function extractGoogleDriveId(url) {
    if (!isValidGoogleDriveUrl(url)) return null;

    const trimmedUrl = url.trim();

    let match = trimmedUrl.match(DRIVE_FILE_REGEX);
    if (match && match[1]) return match[1];

    match = trimmedUrl.match(DRIVE_OPEN_REGEX);
    if (match && match[1]) return match[1];

    match = trimmedUrl.match(DRIVE_UC_REGEX);
    if (match && match[1]) return match[1];

    match = trimmedUrl.match(DRIVE_FOLDER_REGEX);
    if (match && match[1]) return match[1];

    match = trimmedUrl.match(DOCS_REGEX);
    if (match && match[1]) return match[1];

    return null;
}

/**
 * Converts a valid Google Drive URL to a clean embed/preview URL
 * @param {string} url - Validated Google Drive URL
 * @returns {string|null} - Embed preview URL or null
 */
function getGoogleDriveEmbedUrl(url) {
    const fileId = extractGoogleDriveId(url);
    if (!fileId) return null;

    if (DRIVE_FOLDER_REGEX.test(url.trim())) {
        return `https://drive.google.com/embeddedfolderview?id=${fileId}#list`;
    }

    if (DOCS_REGEX.test(url.trim())) {
        if (url.includes('/document/d/')) {
            return `https://docs.google.com/document/d/${fileId}/preview`;
        }
        if (url.includes('/presentation/d/')) {
            return `https://docs.google.com/presentation/d/${fileId}/preview`;
        }
        if (url.includes('/spreadsheets/d/')) {
            return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
        }
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
}

module.exports = {
    isValidGoogleDriveUrl,
    extractGoogleDriveId,
    getGoogleDriveEmbedUrl
};
