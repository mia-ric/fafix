<template>
    <div class="stats" v-if="!loading">
        <nav class="stats-nav">
            <button v-for="item of books"
                type="button" 
                :class="['nav-btn', item.link === book ? 'is-active' : '']"
                @click="book = item.link">
                {{ item.title }}
            </button>
        </nav>
        <div class="stats-chart">
            <VueApexCharts type="line" height="350" :options="options" :series="series" v-if="!loading" />
            <div class="stats-overlay" v-if="insufficient">
                <p>Noch keine Daten verfügbar</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { ApexOptions } from 'apexcharts';
import VueApexCharts from 'vue3-apexcharts';
import { onMounted, ref, watch } from 'vue';
import { getStatistics } from '../stores/statistics';

const loading = ref<boolean>(true);
const insufficient = ref<boolean>(false);

const books = ref();
const book = ref<string>();
const series = ref();
const options = ref<ApexOptions>();

// Component Mounted
onMounted(async () => {
    books.value = await getStatistics();
    book.value = books.value[0].link;
});

// Watch current Book
watch(book, () => {
    if (!books.value) {
        return;
    }

    const data = books.value.find((item: any) => item.link === book.value);
    insufficient.value = !(data && data.data.length > 1);

    const { seriesData, annotations } = data && data.data.length > 1 ? calculateDailyStats(data.data) : {
        seriesData: [],
        annotations: {},
    };

    series.value = [{
        name: 'Aufrufe',
        data: seriesData
    }];
    options.value = {
        chart: {
            height: 350,
            type: 'line',
            id: 'views-diff-line'
        },
        annotations,
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'datetime',
        },
        title: {
            text: 'Aufrufe'
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
    };

    loading.value = false;
});

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
        const x = new Date(today.date).getTime();
        result.push({
            x,
            y: dailyViews,
        });
        
        // New chapter released
        const chapterDiff = today.chapters - yesterday.chapters;
        if (chapterDiff !== 0) {
            annotations.xaxis.push({
                x,
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

        const colors: any = {
            'reviews': '#b45309', 
            'recommendations': '#c026d3', 
            'favorites': '#dc2626', 
            'bookmarks': '#16a34a', 
            'offlineLibraries': '#0891b2', 
            'bookshelves': '#4b5563',
        }

        let changed = 0;
        changedKeys.forEach((key) => {
            if (today[key] === yesterday[key]) {
                return;
            }
            annotations.points.push({
                x,
                y: dailyViews,
                marker: {
                    size: 10,
                    offsetY: 25 * changed,
                    fillColor: colors[key],
                    strokeColor: colors[key],
                    cssClass: `apexcharts-icon-${key}`
                },
                image: {
                    path: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imljb24gaWNvbi10YWJsZXIgaWNvbnMtdGFibGVyLW91dGxpbmUgaWNvbi10YWJsZXItYm9vayI+PHBhdGggc3Ryb2tlPSJub25lIiBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTMgMTlhOSA5IDAgMCAxIDkgMGE5IDkgMCAwIDEgOSAwIiAvPjxwYXRoIGQ9Ik0zIDZhOSA5IDAgMCAxIDkgMGE5IDkgMCAwIDEgOSAwIiAvPjxwYXRoIGQ9Ik0zIDZsMCAxMyIgLz48cGF0aCBkPSJNMTIgNmwwIDEzIiAvPjxwYXRoIGQ9Ik0yMSA2bDAgMTMiIC8+PC9zdmc+',
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
        @apply flex items-center justify-center absolute inset-2 rounded z-20 pointer-events-none select-none;
        @apply bg-black/20 text-white;
        text-shadow: 0 0 3px rgba(0 0 0 / .25);
    }
}
</style>