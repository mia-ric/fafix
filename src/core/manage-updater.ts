import { useStorage } from "../composables/use-storage";

export default async function () {
    if (window.location.hash === '#fafix:updater') {
        return false;
    }
    const storage = useStorage();

    // Check if update is required
    let booksUpdatedAt = storage.local.get('books_updated_at', null);
    let booksUpdateRequired = !(booksUpdatedAt && (Date.now() - booksUpdatedAt < 6 * 60 * 60 * 1000));

    let statsUpdatedAt = storage.local.get('statistics_updated_at', null);
    let statsUpdateRequired = !(statsUpdatedAt && (Date.now() - statsUpdatedAt < 6 * 60 * 60 * 1000));

    if (!booksUpdateRequired && !statsUpdateRequired) {
        return false; // No update required
    }

    // Set Overlay
    const overlay = document.createElement('div');
    overlay.style.inset = '0';
    overlay.style.zIndex = '100';
    overlay.style.position = 'fixed';
    overlay.style.background = 'rgb(0 0 0 / .25)';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center">
            <div style="font-size:22px;color:white;text-shadow:0 0 6px rgb(0 0 0 / .75)">Daten werden aktualisiert, bitte warten...</div>
        </div>
    `;
    document.body.append(overlay);
    
    // Update Books Storage
    let booksValueBefore = storage.local.get('books_updated_at', null);
    await new Promise(res => {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.fanfiktion.de/?a=b#fafix:updater';
        iframe.width = '600';
        iframe.height = '400';
        document.body.appendChild(iframe);

        const check = () => {
            if (storage.local.get('books_updated_at', booksValueBefore) !== booksValueBefore) {
                iframe.remove();
                res(true);
            } else {
                setTimeout(check, 250);
            }
        };
        setTimeout(check, 250);
    });
    
    // Update Statistics Storage
    let statisticsValueBefore = storage.local.get('statistics_updated_at', null);
    await new Promise(res => {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.fanfiktion.de/stats#fafix:updater';
        iframe.width = '600';
        iframe.height = '400';
        document.body.appendChild(iframe);

        const check = () => {
            if (storage.local.get('statistics_updated_at', statisticsValueBefore) !== statisticsValueBefore) {
                iframe.remove();
                res(true);
            } else {
                setTimeout(check, 250);
            }
        };
        setTimeout(check, 250);
    });

    // Remove & Return
    overlay.remove();
    return true;
};
