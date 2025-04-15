<template>
    <nav ref="navbar" class="stats-nav">
        <template v-for="(item, idx) in visibleTabs" :key="item.link">
            <button 
                :ref="el => (tabs[idx] = el as HTMLElement)" 
                type="button"
                :class="['nav-btn', item.value === value ? 'is-active' : '']" 
                @click="value = item.value">
                {{ item.label }}
            </button>
        </template>

        <div v-if="hiddenTabs.length" class="relative ml-auto">
            <select class="nav-select"
                @change="onChange($event.target as HTMLSelectElement);">
                <option value="-1">
                    Andere Geschichten
                </option>
                <option v-for="item in hiddenTabs" :key="item.value" :value="item.value" :selected="item.value == value">
                    {{ item.label }}
                </option>
            </select>
        </div>
    </nav>
</template>

<script lang="ts">
export interface TabItem { value: string, label: string };
export interface ComponentProps {
    tabs: TabItem[];
    modelValue: string|null;
}
</script>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick, watch } from 'vue';

// Define Component
const props = defineProps<ComponentProps>();
const value = defineModel<string|null>();

// States
const navbar = ref<HTMLElement|null>(null);
const tabs = ref<HTMLElement[]>([]);
const visibleCount = ref(props.tabs.length);
const visibleTabs = computed<TabItem[]>(() => props.tabs.slice(0, visibleCount.value));
const hiddenTabs = computed<TabItem[]>(() => props.tabs.slice(visibleCount.value));

// Component mounted
onMounted(() => {
    window.addEventListener('resize', updateVisibleTabs);
});

// Component before unmount
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateVisibleTabs);
});

// Watch Properties
watch(props, async () => {
    visibleCount.value = props.tabs.length;
    await nextTick();
    updateVisibleTabs();
}, { immediate: true });

/**
 * Handle changes on select field
 * @param target 
 */
function onChange(target: HTMLSelectElement) {
    let option = target.selectedOptions[0] || null;
    if (!option) {
        value.value = null;
    } else {
        value.value = option.value == '-1' ? null : option.value;
    }
}

/**
 * Update Visible Tabs
 */
async function updateVisibleTabs() {
    if (!navbar.value) {
        return;
    }
    await nextTick();

    let maxWidth = navbar.value.offsetWidth || 0;
    let usedWidth = 0;
    let count = 0;

    for (const tab of tabs.value) {
        if (!tab) {
            continue;
        }

        const tabWidth = tab.offsetWidth;
        usedWidth += tabWidth;
        if (usedWidth < maxWidth) {
            count++;
        } else {
            count--;
            break;
        }
    }

    visibleCount.value = count;
}
</script>

<style scoped>
.stats-nav {
    @apply w-full flex flex-row items-center flex-1 border-0 border-b border-solid;
    @apply border-[#b9d2dc];

    & .nav-btn {
        @apply h-auto rounded-t rounded-b-none border border-solid -mb-px px-6 py-2.5 text-xs cursor-pointer;
        @apply border-transparent border-b-[#b9d2dc] text-gray-600 bg-transparent;
        @apply max-w-lg truncate;
        min-width: fit-content;
        max-width: 250px;

        &:not(.is-active):hover {
            @apply bg-[#fcfcf6];
        }

        &.is-active {
            @apply border-[#b9d2dc] border-b-white bg-white;
        }
    }

    & .nav-select {
        @apply truncate min-w-[4rem] max-w-[10rem] border border-solid rounded-lg px-4 py-1;
        @apply border-[#b9d2dc] bg-[#fcfcf6];
    }
}
</style>