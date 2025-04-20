<template>
    <div class="flex flex-row gap-2">
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-pink-50 text-pink-600">
            <IconEye class="w-4 h-4" />
            <span v-text="newViews"></span>
        </div>
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-[#b45309]/10 text-[#b45309]">
            <IconMessageCircleFilled class="w-4 h-4" />
            <span v-text="newReviews"></span>
        </div>
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-[#c026d3]/10 text-[#c026d3]">
            <IconStarFilled class="w-4 h-4" />
            <span v-text="newRecommendations"></span>
        </div>
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-[#dc2626]/10 text-[#dc2626]">
            <IconHeartFilled class="w-4 h-4" />
            <span v-text="newFavorites"></span>
        </div>
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-[#16a34a]/10 text-[#16a34a]">
            <IconBookmarkFilled class="w-4 h-4" />
            <span v-text="newBookmarks"></span>
        </div>
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-[#0891b2]/10 text-[#0891b2]">
            <IconDeviceMobile class="w-4 h-4" />
            <span v-text="newOfflineLibraries"></span>
        </div>
        <div class="flex flex-row items-center gap-1.5 px-2 py-1 text-sm rounded bg-[#4b5563]/10 text-[#4b5563]">
            <IconBooks class="w-4 h-4" />
            <span v-text="newBookshelves"></span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useStatistics } from '../../composables/use-statistics';
import { IconBookmarkFilled, IconBooks, IconDeviceMobile, IconEye, IconHeartFilled, IconMessageCircleFilled, IconStarFilled } from '@tabler/icons-vue';

// Composables
const stats = useStatistics();

// States
const newViews = ref<number>();
const newReviews = ref<number>();
const newRecommendations = ref<number>();
const newFavorites = ref<number>();
const newBookmarks = ref<number>();
const newOfflineLibraries = ref<number>();
const newBookshelves = ref<number>();

// Component mounted
onMounted(async () => {
    const summary = await stats.deltaSummary();
    newViews.value = summary.newViews;
    newReviews.value = summary.newReviews;
    newRecommendations.value = summary.newRecommendations;
    newFavorites.value = summary.newFavorites;
    newBookmarks.value = summary.newBookmarks;
    newOfflineLibraries.value = summary.newOfflineLibraries;
    newBookshelves.value = summary.newBookshelves;
});
</script>