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

// Annotation-Type Colors
const colors: any = {
    'reviews': '#b45309', 
    'recommendations': '#c026d3', 
    'favorites': '#dc2626', 
    'bookmarks': '#16a34a', 
    'offlineLibraries': '#0891b2', 
    'bookshelves': '#4b5563',
};

// Annotation-Type Icons
const icons: any = {
    'reviews': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" class="icon icon-tabler icons-tabler-filled icon-tabler-message-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5.821 4.91c3.899 -2.765 9.468 -2.539 13.073 .535c3.667 3.129 4.168 8.238 1.152 11.898c-2.841 3.447 -7.965 4.583 -12.231 2.805l-.233 -.101l-4.374 .931l-.04 .006l-.035 .007h-.018l-.022 .005h-.038l-.033 .004l-.021 -.001l-.023 .001l-.033 -.003h-.035l-.022 -.004l-.022 -.002l-.035 -.007l-.034 -.005l-.016 -.004l-.024 -.005l-.049 -.016l-.024 -.005l-.011 -.005l-.022 -.007l-.045 -.02l-.03 -.012l-.011 -.006l-.014 -.006l-.031 -.018l-.045 -.024l-.016 -.011l-.037 -.026l-.04 -.027l-.002 -.004l-.013 -.009l-.043 -.04l-.025 -.02l-.006 -.007l-.056 -.062l-.013 -.014l-.011 -.014l-.039 -.056l-.014 -.019l-.005 -.01l-.042 -.073l-.007 -.012l-.004 -.008l-.007 -.012l-.014 -.038l-.02 -.042l-.004 -.016l-.004 -.01l-.017 -.061l-.007 -.018l-.002 -.015l-.005 -.019l-.005 -.033l-.008 -.042l-.002 -.031l-.003 -.01v-.016l-.004 -.054l.001 -.036l.001 -.023l.002 -.053l.004 -.025v-.019l.008 -.035l.005 -.034l.005 -.02l.004 -.02l.018 -.06l.003 -.013l1.15 -3.45l-.022 -.037c-2.21 -3.747 -1.209 -8.391 2.413 -11.119z" /></svg>', 
    'recommendations': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" class="icon icon-tabler icons-tabler-filled icon-tabler-star"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" /></svg>', 
    'favorites': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" class="icon icon-tabler icons-tabler-filled icon-tabler-heart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" /></svg>', 
    'bookmarks': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" class="icon icon-tabler icons-tabler-filled icon-tabler-bookmark"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z" /></svg>', 
    'offlineLibraries': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-mobile"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z" /><path d="M11 4h2" /><path d="M12 17v.01" /></svg>', 
    'bookshelves': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-books"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M5 8h4" /><path d="M9 16h4" /><path d="M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z" /><path d="M14 9l4 -1" /><path d="M16 16l3.923 -.98" /></svg>',
};

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
                    path: `data:image/svg+xml;base64,${btoa(icons[key])}`,
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