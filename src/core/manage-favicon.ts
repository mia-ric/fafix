import { drawFavicon } from "../utils/favicon";

/**
 * Receive Favicon
 * @returns 
 */
async function getFavicon() {
    if ((window as any)['__ORIGINAL_FAVICON']) {
        return (window as any)['__ORIGINAL_FAVICON']
    }

    return new Promise(res => {
        const favicon = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement;
        const img = new Image();
        img.onload = () => {
            res((window as any)['__ORIGINAL_FAVICON'] = img);
        };
        img.src = favicon.getAttribute('href') as string;
    });
}

/**
 * Receive Title
 * @returns 
 */
function getTitle() {
    if ((window as any)['__ORIGINAL_TITLE']) {
        return (window as any)['__ORIGINAL_TITLE']
    } else {
        return (window as any)['__ORIGINAL_TITLE'] = document.title;
    }
}

/**
 * Manage Favicon
 * @returns 
 */
export default async function () {
    const favicon = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const alertCountElement = document.querySelector('[href="/?a=i"]') as HTMLAnchorElement;
    const messageCountElement = document.querySelector('[href="/m/"]') as HTMLAnchorElement;
    if (!favicon || !alertCountElement || !messageCountElement) {
        return;
    }

    const img = await getFavicon();
    const alertCount = parseInt(alertCountElement.textContent || '0');
    const messageCount = parseInt(messageCountElement.textContent || '0');
    const totalCount = alertCount + messageCount;
    const newFavicon = drawFavicon(img, totalCount);
    if (newFavicon) {
        favicon.setAttribute('href', newFavicon);
    }

    let countString = '';
    if (alertCount > 0) {
        countString += `[${alertCount}]`;
    }
    if (messageCount > 0) {
        countString += `[${messageCount}]`;
    }
    if (countString.length > 0) {
        countString += ' ';
    }

    document.title = `${countString}${getTitle()}`;
};
