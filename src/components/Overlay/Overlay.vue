<template>
    <Teleport to="body" v-if="updating">
        <div class="drop">
            <IconLoaderQuarter class="w-8 h-8 loading-circle" />
            <span>Statistiken werden aktualisiert</span>
        </div>
    </Teleport>

    <button type="button" :disabled="loading || updating" class="overlay-btn" @click="showOverlay">
        <div class="overlay-im-new" v-if="!loading && indicatorNewOverlay">
            Schon gesehen? Dieser Button gehört zu FAFIX, klick drauf und kuck was passiert.
        </div>
        <IconLoaderQuarter class="w-6 h-6 text-pink-600 loading-circle" v-if="loading" />
        <IconEditCircle class="w-6 h-6" v-else />
        <span v-if="indicatorNewVersion" class="w-2.5 h-2.5 absolute bg-pink-600 rounded-full top-0.5 right-0.5"></span>
    </button>

    <Transition name="overlay">
        <div class="contents" v-if="visible">
            <div class="backdrop" @click="visible = false">
                <div class="modal" @click.stop>
                    <div class="flex" v-if="indicatorNewVersion">
                        <div class="rounded px-3 py-1.5 text-xs cursor-pointer bg-pink-50 flex items-center gap-2 text-pink-600" @click="openGitHub">
                            <span class="w-2.5 h-2.5 bg-pink-600 rounded-full"></span>
                            <span>Eine neue Version ist verfügbar</span>
                        </div>
                    </div>

                    <div class="text-xl font-semibold">
                        FAFIX v{{ system.getInstalledScriptVersion() }}
                    </div>

                    <div class="flex flex-col gap-2 items-start">
                        <div class="w-full flex flex-row justify-between">
                            <select class="shrink-0 grow-0 w-[265px] basis-[265px]" v-model="exportAs">
                                <option value="json">Als JSON Datei</option>
                                <option value="csv">Als CSV / Excel Datei</option>
                            </select>
                            <button 
                                type="button" 
                                class="w-[170px] shrink-0"
                                :disabled="loading"
                                @click="exportData">
                                <span>Daten exportieren</span>
                            </button>
                        </div>

                        <div class="w-full flex flex-row justify-between">
                            <input type="file" class="shrink-0 grow-0 w-[265px] basis-[265px]" accept=".json,.csv" v-on:change="onChangeFile" />
                            <button 
                                type="button" 
                                class="w-[170px] shrink-0"
                                :disabled="loading || importFile == null" 
                                @click="importData">
                                <span>Daten importieren</span>
                            </button>
                        </div>

                        <div class="w-full flex flex-row justify-between">
                            <span class="shrink-0 grow-0 w-[265px] basis-[265px]"></span>
                            <button 
                                type="button" 
                                class="w-[170px] shrink-0"
                                :disabled="loading"
                                @click="resetData">
                                <span>Daten löschen</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { IconEditCircle, IconLoaderQuarter } from '@tabler/icons-vue';
import { nextTick, onMounted, ref } from 'vue';
import { useStorage } from '../../composables/use-storage';
import { useSystem } from '../../composables/use-system';
import { useDatabase } from '../../composables/use-database';

// Composables
const db = useDatabase();
const storage = useStorage();
const system = useSystem();

// States
const loading = ref<boolean>(false);
const updating = ref<boolean>(false);
const visible = ref<boolean>(false);

const exportAs = ref<'json'|'csv'>('json');
const importFile = ref<File|null>(null);

const indicatorNewOverlay = ref<boolean>(storage.local.get('new_overlay_button', true));
const indicatorNewVersion = ref<boolean>(false);

// Component mounted
onMounted(async () => {
    loading.value = true;
    await nextTick();

    // Fetch latest release
    if (!system.scriptVersion) {
        await system.getLatestScriptVersion();
    }
    indicatorNewVersion.value = await system.isScriptUpdateAvailable();

    // Execute Data-Update
    if (system.isUpdateRequired()) {
        updating.value = true;
        await system.runUpdate();
        updating.value = false;
    }

    await nextTick();
    loading.value = false;
});

/**
 * Show Overlay
 */
function showOverlay() {
    visible.value = true;
    if (indicatorNewOverlay.value) {
        storage.local.set('new_overlay_button', false);
        indicatorNewOverlay.value = false;
    }
}

/**
 * Open GitHub Page
 */
function openGitHub() {
    window.open(GITHUB_REPO_URL + '?tab=readme-ov-file#aktualisierung', '_blank');
}

/**
 * Change File
 * @param ev 
 */
function onChangeFile(ev: Event) {
    if (!(ev && ev.target instanceof HTMLInputElement)) {
        importFile.value = null;
        return;
    }

    if (ev.target.files && ev.target.files.length === 1) {
        importFile.value = ev.target.files[0];
    } else {
        importFile.value = null;
    }
}

/**
 * Export Data
 */
async function exportData() {
    loading.value = true;
    try {
        const blob = await db.exportData(exportAs.value);
        if (!(blob instanceof Blob)) {
            throw new Error('Die Daten konnten nicht korrekt exportiert werden.');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fafix-export_${(new Date).toISOString().replace(/[:.]/g, "-").replace('T', '_').slice(0, 19)}.${exportAs.value}`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert(`Folgender Fehler ist aufgetreten: ${(err as Error).message}`);
    } finally {
        loading.value = false;
    }
}

/**
 * Import Data
 */
async function importData() {
    if (!importFile.value) {
        return;
    }

    loading.value = true;
    try {
        await db.importData(importFile.value);
        window.location.reload();
    } catch (err) {
        alert(`Folgender Fehler ist aufgetreten: ${(err as Error).message}`);
    } finally {
        loading.value = false;
    }
}

/**
 * Reset Data
 */
async function resetData() {
    let check = confirm('Bist du sicher, dass du sämtliche Daten löschen möchtest? Dieser Schritt kann nicht rückgängig gemacht werdne.');
    if (!check) {
        return;
    }
    
    loading.value = true;
    try {
        await system.reset();
        window.location.reload();
    } catch (err) {
        alert(`Folgender Fehler ist aufgetreten: ${(err as Error).message}`);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
@keyframes bounce {
    0% {
        margin-bottom: 1.5rem;
    }
    50% {
        margin-bottom: 0.25rem;
    }
    100% {
        margin-bottom: 1.5rem;
    }
}

:global(:root) {
    --tw-translate-x: 0;
    --tw-translate-y: 0;
    --tw-rotate: 0;
    --tw-skew-x: 0;
    --tw-skew-y: 0;
    --tw-scale-x: 1;
    --tw-scale-y: 1;
}

.drop {
    @apply fixed inset-0 flex items-center justify-center gap-4;
    @apply bg-black/25 text-pink-600;
    z-index: 999;
    backdrop-filter: blur(5px);

    & span {
        @apply text-white;
        text-shadow: 0 0 5px rgba(0 0 0 / .5);
    }
}

.loading-circle {
    @apply animate-spin;
    animation-timing-function: steps(8);
}

.overlay-btn {
    @apply fixed right-10 bottom-10 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer;
    @apply transition-colors duration-200 ease-in-out;
    @apply bg-transparent text-black/20 border-0;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.15), 0 0 0 4px rgb(0 0 0 / 0.05);
    transition-property: background-color, box-shadow, color;

    &[disabled] {
        @apply bg-neutral-200/50;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.15);
    }

    &:not([disabled]):hover {
        @apply bg-pink-600 text-white;
        box-shadow: 0 0 0 4px rgba(219 39 119 / 0.3175);
    }
}

.overlay-im-new {
    @apply p-3 w-48 text-xs rounded-md absolute bottom-full right-0 mb-6 -mr-4 font-sans pointer-events-none;
    @apply bg-pink-600 text-white;
    animation: bounce 2s ease-in-out 0ms infinite;

    &::before {
        @apply absolute top-full right-8 -mr-0.5 inline-block w-0 h-0 border-solid;
        @apply border-transparent border-t-pink-600;
        border-width: 10px 10px 0px 10px;
        content: "";
    }
}

.overlay-enter-active, 
.overlay-leave-active {
    transition-duration: 0.3s;

    & .backdrop {
        transition: opacity 0.3s ease;
    }
    & .modal {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
}
.overlay-enter-from, 
.overlay-leave-to {
    & .backdrop {
        opacity: 0;
    }
    & .modal {
        opacity: 0;
        transform: translateY(2rem);
    }
}
.overlay-enter-to, 
.overlay-leave-from {
    & .backdrop {
        opacity: 1;
    }
    & .modal {
        opacity: 1;
        transform: translateY(0);
    }
}

.backdrop {
    @apply fixed inset-0 flex items-center justify-center;
    @apply bg-black/50;
    z-index: 500;
}

.modal {
    @apply w-full flex flex-col gap-4 max-w-md p-4 rounded-lg shadow-lg;
    @apply bg-white;
    z-index: 501;

    * {
        box-sizing: border-box;
    }
}
</style>