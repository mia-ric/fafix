<template>
    <div ref="outside" class="note">
        <div ref="reference" 
            class="note-badge" 
            :class="[props.danger ? 'badge-error' : null, visible ? 'is-visible' : null]" 
            @click="visible = !visible">
            <template v-if="!visible">
                <span v-if="props.danger">Warum werden keine Daten angezeigt?</span>
                <span v-else>Wie funktioniert diese Statistik?</span>
            </template>
            <span v-else>Info-Popover schließen</span>
        </div>

        <Transition name="fade">
            <div ref="popover" class="note-popover" :style="floatingStyles" v-if="visible">
                <dl>
                    <dt>Warum werden noch keine Daten angezeigt?</dt>
                    <dd>
                        Die Statistik zeigt tägliche Aufrufe & Events nach dem ersten erfassten Tag. Spätestens also nach 24 Stunden sollte der erste Punkt erscheinen, nach 48 Stunden dann die erste Linie.
                    </dd>
    
                    <dt>Wie funktioniert die Berechnung?</dt>
                    <dd>
                        Die Seite muss täglich aufgerufen werden. Fehlt ein Tag, wird er aktuell dem aktuellen Tag zugerechnet. Eine geschätzte Verteilung über ein oder mehrere verpasste Tage ist (noch) nicht implementiert.
                    </dd>
                    
                    <dt>Kann ich die Daten exportieren oder löschen?</dt>
                    <dd>
                        Über den FAFIX-Button unten rechts kannst du die Statistik importieren, exportieren oder zurücksetzen. Achtung: Beim Zurücksetzen gehen alle Daten dauerhaft verloren.
                    </dd>
                </dl>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts">
export interface ChartsNoteProps {
    danger: boolean;
}
</script>

<script lang="ts" setup>
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/vue';
import { onBeforeUnmount, ref, watch } from 'vue';


// Define Component
const props = defineProps<ChartsNoteProps>();

// States
const visible = ref<boolean>(false);
const outside = ref<HTMLElement|null>(null);
const reference = ref<HTMLElement|null>(null);
const popover = ref<HTMLElement|null>(null);
const { floatingStyles } = useFloating(reference, popover, {
    strategy: 'absolute',
    placement: 'top-end',
    middleware: [
        flip(),
        offset(10)
    ],
    whileElementsMounted: autoUpdate
});

// Component mounted
watch(reference, () => {
    if (reference.value) {
        document.removeEventListener('click', onClickOutside);
        document.addEventListener('click', onClickOutside);
    }
}, { immediate: true });

// Component unmounted
onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside);
});

/**
 * Check if click occurred outside of element.
 * @param event 
 */
function onClickOutside(event: any) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !outside.value) {
        return;
    }
    
    if (!target.parentElement || target === outside.value || outside.value.contains(target)) {
        return;
    }

    if (visible.value) {
        visible.value = false;
    }
}
</script>

<style scoped>
.note {
    @apply relative flex flex-row justify-end;

    & .note-badge {
        @apply w-[190px] rounded px-3 py-1.5 text-xs cursor-pointer text-center;
        @apply transition-colors duration-200 ease-in-out;

        &.badge-error {
            @apply bg-red-100 text-red-600;

            &:hover {
                @apply bg-red-600 text-white;
            }
        }
        
        &:not(.badge-error) {
            @apply bg-pink-100 text-pink-600;

            &:hover {
                @apply bg-pink-600 text-white;
            }
        }

        &.is-visible {
            @apply bg-neutral-600 text-white;

            &:hover {
                @apply bg-neutral-900 text-white;
            }
        }
    }

    & .note-popover {
        @apply absolute w-96 rounded-md p-4 text-sm shadow;
        @apply bg-white;
        z-index: 900;

        & dl {
            @apply m-0;
        }

        & dl dt {
            @apply font-semibold;
        }

        & dl dd {
            @apply p-0 m-0 mt-2;

            &:not(:last-child) {
                @apply mb-6
            }
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    @apply transition-opacity duration-150 ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>