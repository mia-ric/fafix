import { ref } from "vue";
import { useStorage } from "./use-storage";
import { useDatabase } from "./use-database";
import versionCompare from "../utils/version_compare";

export function useSystem() {
    const db = useDatabase();
    const storage = useStorage();
    const scriptVersion = ref<string>();

    /**
     * Get latest FAFIX Release Version
     * @param force
     */
    async function getLatestScriptVersion(force: boolean = false): Promise<null|string> {
        if (scriptVersion.value) {
            return scriptVersion.value;
        }

        let version = storage.local.get('latest_version', null);
        const lastChecked = storage.local.get('latest_version_checked_at', null);
        const requireUpdate = !(lastChecked && (Date.now() - lastChecked < 12 * 60 * 60 * 1000));

        if (!version || requireUpdate || force) {
            try {
                let response = await fetch(GITHUB_TAGS_URL);
                let result = await response.json();
                if (!(result && result.length > 0)) {
                    throw new Error('The received response is invalid.');
                }
                version = result[0].name;
            } catch (err) {
                console.error(err);
            }

            if (version) {
                storage.local.set('latest_version', version);
                storage.local.set('latest_version_checked_at', Date.now());
            }
        }

        scriptVersion.value = version;
        return version;
    }

    /**
     * Get currently installed FAFIX Version
     */
    function getInstalledScriptVersion() {
        return CURRENT_VERSION;
    }

    /**
     * Check if a script update is available.
     */
    async function isScriptUpdateAvailable() {
        let latestVersion = await getLatestScriptVersion();
        if (!latestVersion) {
            return false;
        } else {
            return Boolean(versionCompare(latestVersion, getInstalledScriptVersion(), '>'));
        }
    }

    /**
     * Fun Database Update
     */
    async function runUpdate() {
        if (import.meta.env.DEV || window.location.hash === '#fafix:updater') {
            return false;
        }

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

        return true;
    }

    /**
     * Check if data update is required
     * @returns 
     */
    function isUpdateRequired() {
        if (import.meta.env.DEV || window.location.hash === '#fafix:updater') {
            return false;
        }

        let booksUpdatedAt = storage.local.get('books_updated_at', null);
        let booksUpdateRequired = !(booksUpdatedAt && (Date.now() - booksUpdatedAt < 6 * 60 * 60 * 1000));
        let statsUpdatedAt = storage.local.get('statistics_updated_at', null);
        let statsUpdateRequired = !(statsUpdatedAt && (Date.now() - statsUpdatedAt < 6 * 60 * 60 * 1000));

        return booksUpdateRequired || statsUpdateRequired;
    }

    /**
     * Reset System / Extension
     */
    async function reset() {
        await db.db.delete();
        storage.local.clear();
        storage.session.clear();
    }

    // Export Composable
    return {
        scriptVersion,
        getLatestScriptVersion,
        getInstalledScriptVersion,
        isScriptUpdateAvailable,
        runUpdate,
        isUpdateRequired,
        reset,
    };
};
