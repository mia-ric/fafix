<template>
    <div class="stats">
        <ChartsNavbar :tabs="statTabs" v-model="statCurrent" v-if="statTabs" />
        
        <div class="stats-chart">
            <VueApexCharts v-if="statOptions && statSeries"
                type="line" 
                height="350" 
                :options="statOptions" 
                :series="statSeries" />
            
            <div class="stats-overlay" v-if="!loading && insufficient">
                <p>Noch keine Daten verfügbar</p>
            </div>
            <Transition name="fade">
                <div v-if="loading" class="stats-loading">
                    <IconLoaderQuarter class="loading-circle" />
                </div>
            </Transition>
        </div>

        <div class="flex flex-row items-center justify-between mt-4">
            <ChartsSummary />
            <ChartsNote :danger="insufficient" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { IconLoaderQuarter } from '@tabler/icons-vue';
import type { ApexOptions } from 'apexcharts';
import VueApexCharts from 'vue3-apexcharts';
import { computed, onMounted, ref, watch } from 'vue';
import { useBooks, type Book } from '../../composables/use-books';
import { useStatistics } from '../../composables/use-statistics';
import { useStorage } from '../../composables/use-storage';
import { MarkerColors, MarkerIcons, type MarkerKeys } from '../../enums/markers';
import ChartsNavbar, { type TabItem } from './ChartsNavbar.vue';
import ChartsNote from './ChartsNote.vue';
import ChartsSummary from './ChartsSummary.vue';

// States
const loading = ref<boolean>(false);
const insufficient = ref<boolean>(false);

const statBooks = ref<Book[]>([]);
const statTabs = computed<TabItem[]>(() => {
    const tabs: TabItem[] = [];
    statBooks.value.forEach(item => { tabs.push({ label: item.title, value: item.link }) });
    return tabs;
});
const statCurrent = ref<string|null>(null);
const statSeries = ref();
const statOptions = ref<ApexOptions>();

// Stores
const books = useBooks();
const stats = useStatistics();
const storage = useStorage();

// Component Mounted
onMounted(async () => {
    statBooks.value = await books.get();
    statCurrent.value = storage.local.get('statistics_current_book', statTabs.value ? statTabs.value[0]?.value || null : null);
});

// Watch current Book
watch(statCurrent, async (current) => {
    if (!statBooks.value || !current) {
        return;
    }
    storage.local.set('statistics_current_book', current);
    loading.value = true;
    await new Promise(res => setTimeout(res, 150));

    const data = await stats.stats(current);
    insufficient.value = !(data && data.length > 1);

    const { seriesData, annotations } = data && data.length > 1 ? calculateDailyStats(data) : {
        seriesData: [],
        annotations: {},
    };
    
    statSeries.value = [{
        name: 'Aufrufe',
        data: seriesData
    }];
    statOptions.value = {
        chart: {
            type: 'line',
            height: 350,
        },
        annotations,
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'category',
            categories: statSeries.value[0].data.map((point: any) => point.x)
        },
        yaxis: {
            forceNiceScale: true
        },
        title: {
            text: 'Tägliche Aufrufe & Events'
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            padding: {
                right: 30,
                left: 20
            }
        },
        tooltip: {
            y: {
                formatter: function (value, { seriesIndex, dataPointIndex, w }) {
                    const point = w.config.series[seriesIndex].data[dataPointIndex];
                    const total = point.meta?.totalViews ?? 0;
                    const formatter = new Intl.NumberFormat('de-DE');
                    return `${formatter.format(total)} (+${formatter.format(value)})`;
                }
            }
        }
    };

    await new Promise(res => setTimeout(res, 150));
    loading.value = false;
});

/**
 * Format Date/Timestamp
 * @param dateString 
 */
function formatDate(dateString: string | number) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
    });
};

/**
 * Calculate Statistics
 * @param data 
 */
function calculateDailyStats(data: any[]) {
    const result = [];
    const annotations: any = {
        xaxis: [],
        points: []
    };

    for (let i = 1; i < data.length; i++) {
        const today = data[i];
        const yesterday = data[i - 1];

        const dailyViews = today.views - yesterday.views;
        const x = new Date(`${today.date}T${today.time}`).getTime();
        result.push({
            x: formatDate(x),
            y: dailyViews,
            meta: {
                totalViews: today.views
            }
        });
        
        // New chapter released
        const chapterDiff = today.chapters - yesterday.chapters;
        if (chapterDiff !== 0) {
            annotations.xaxis.push({
                x: formatDate(x),
                strokeDashArray: 0,
                borderColor: '#9333ea',
                label: {
                    borderColor: '#9333ea',
                    style: {
                        color: '#fff',
                        background: '#9333ea',
                    },
                    text: `${chapterDiff > 0 ? '+' : ''}${chapterDiff} Kapitel`,
                }
            });
        }

        // Changed stats
        const changedKeys = [
            'reviews', 
            'recommendations', 
            'favorites', 
            'bookmarks', 
            'offlineLibraries', 
            'bookshelves'
        ];

        let changed = 0;
        changedKeys.forEach((key) => {
            if (today[key] === yesterday[key]) {
                return;
            }

            const mode = today[key] > yesterday[key] ? true : false;
            const enumKey = key[0].toUpperCase() + key.slice(1) as MarkerKeys;

            annotations.points.push({
                x: formatDate(x),
                y: dailyViews,
                marker: {
                    size: 10,
                    offsetY: 25 * changed,
                    fillColor: MarkerColors[enumKey],
                    strokeColor: MarkerColors[enumKey],
                    cssClass: `apexcharts-icon-${key} ${mode ? '' : 'apexcharts-annotation-lost'}`
                },
                image: {
                    path: `data:image/svg+xml;base64,${btoa(MarkerIcons[enumKey])}`,
                    width: 16,
                    height: 16,
                    offsetY: 25 * changed,
                }
            });
            changed++;
        });
    }

    return { seriesData: result, annotations };
}
</script>

<style scoped>
.stats {
    @apply flex flex-col gap-0;
}

.stats-nav {
    @apply w-full flex flex-row flex-1 border-0 border-b border-solid;
    @apply border-[#b9d2dc];
    
    & .nav-btn {
        @apply h-auto rounded-t rounded-b-none border border-solid -mb-px px-6 py-2.5 text-xs cursor-pointer;
        @apply border-transparent border-b-[#b9d2dc] text-gray-600 bg-transparent;
        @apply max-w-lg truncate;
        
        &:not(.is-active):hover {
            @apply bg-[#fcfcf6];
        }

        &.is-active {
            @apply border-[#b9d2dc] border-b-white bg-white;
        }
    }
}

.stats-chart {
    @apply relative w-full flex-1 border border-t-0 border-solid rounded-b p-2;
    @apply border-[#b9d2dc] bg-white;

    & .stats-overlay {
        @apply flex items-center justify-center absolute inset-2 rounded z-50 pointer-events-none select-none;
        @apply bg-black/20 text-white;
        text-shadow: 0 0 3px rgba(0 0 0 / .25);
    }
    
    & .stats-loading {
        @apply absolute inset-2 flex items-center justify-center rounded z-50 select-none;
        @apply bg-white/50 text-pink-400;
        backdrop-filter: blur(2px);

        & .loading-circle {
            @apply w-8 h-8 animate-spin;
            animation-timing-function: steps(8);
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

:deep(.apexcharts-annotation-lost) {
    fill: rgb(120 120 120);
    stroke: rgb(120 120 120);
}

:deep(.apexcharts-annotation-lost + * + image) {
    @apply opacity-70;
}
</style>