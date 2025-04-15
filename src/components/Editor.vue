<template>
    <div class="flex flex-col gap-2">
        <div class="editor-screen">
            <div class="toolbar">
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().setTextAlign('left').run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().setTextAlign('left').run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('left') }">
                    <IconAlignLeft class="w-4 h-4" />
                </button>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().setTextAlign('center').run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().setTextAlign('center').run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('center') }">
                    <IconAlignCenter class="w-4 h-4" />
                </button>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().setTextAlign('right').run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().setTextAlign('right').run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('right') }">
                    <IconAlignRight class="w-4 h-4" />
                </button>
                <span class="toolbar-separator"></span>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().toggleBold().run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().toggleBold().run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('bold') }">
                    <IconBold class="w-4 h-4" />
                </button>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().toggleItalic().run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().toggleItalic().run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('italic') }">
                    <IconItalic class="w-4 h-4" />
                </button>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().toggleUnderline().run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().toggleUnderline().run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('underline') }">
                    <IconUnderline class="w-4 h-4" />
                </button>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().toggleStrike().run()" 
                    :disabled="view == 'code' || !editor.can().chain().focus().toggleStrike().run()" 
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('strike') }">
                    <IconStrikethrough class="w-4 h-4" />
                </button>
                <span class="toolbar-separator"></span>
                <button v-if="editor" 
                    type="button"
                    @click="openLinkDialog"    
                    :disabled="view == 'code'"
                    :class="{ 'toolbar-button': true, 'is-active': editor.isActive('link') }">
                    <IconLink class="w-4 h-4" />
                </button>
                <button v-if="editor"
                    type="button"
                    @click="editor.chain().focus().unsetLink().run()" 
                    :disabled="view == 'code' || !editor.isActive('link') " 
                    :class="{ 'toolbar-button': true }">
                    <IconLinkOff class="w-4 h-4" />
                </button>
                <span class="ml-auto"></span>
                <button v-if="editor" 
                    type="button" 
                    class="toolbar-button" 
                    @click="view = view == 'edit' ? 'code' : 'edit'">
                    <IconPencil class="w-4 h-4" v-if="view == 'code'" />
                    <IconCode class="w-4 h-4" v-else-if="view == 'edit'" />
                </button>
            </div>

            <div class="editor-content" :class="{ 'is-visible': view == 'edit' }">
                <EditorContent v-if="editor" :editor="(editor as any)" class="prose max-w-none"/>
            </div>
            <div ref="source" class="editor-source" :class="{ 'is-visible': view == 'code' }"></div>

            <div class="editor-footer">
                <div class="flex gap-1"><strong>Zeichen</strong> {{ charCount }}</div>
                <div class="flex gap-1"><strong>Wörter</strong> {{ wordCount }}</div>
            </div>
        </div>

        <div v-if="showLinkDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-4 rounded shadow max-w-sm w-full space-y-2">
                <label>
                    URL:
                    <input v-model="linkUrl" class="border p-1 w-full" />
                </label>
                <label>
                    Link-Text:
                    <input v-model="linkText" class="border p-1 w-full" />
                </label>
                <div class="flex justify-end gap-2">
                    <button type="button" @click="applyLink" class="bg-blue-500 text-white px-3 py-1 rounded">Einfügen</button>
                    <button type="button" @click="showLinkDialog = false" class="px-3 py-1">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { IconAlignCenter, IconAlignLeft, IconAlignRight, IconBold, IconCode, IconItalic, IconLink, IconLinkOff, IconPencil, IconStrikethrough, IconUnderline } from '@tabler/icons-vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { TextSelection } from '@tiptap/pm/state';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { computed, ref, onMounted, nextTick } from 'vue';
import { bbcodeToDoc, docToBBCode } from '../utils/format';

// States
const textarea = ref<HTMLTextAreaElement>();
const source = ref<HTMLDivElement>();
const editor = ref<Editor | null>(null);
const view = ref<'edit' | 'code'>('edit');

const showLinkDialog = ref<boolean>(false);
const linkUrl = ref<string>('');
const linkText = ref<string>('');

const charCount = computed(() => {
    return new Intl.NumberFormat('de-DE').format(editor.value?.getText().length ?? 0);
});
const wordCount = computed(() => {
    const text = editor.value?.getText() ?? '';
    const clean = text.replace(/[^\p{L}\p{N}'-]+/gu, ' ').trim();
    return new Intl.NumberFormat('de-DE').format(clean.split(/\s+/).filter(word => word.length > 0).length);
});

// Component mounted
onMounted(() => {
    editor.value = new Editor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
            }),
        ],
        content: '',
        onUpdate: updateTextarea,
        onBlur: updateTextarea,
    });
});

/**
 * Set textarea element
 * @param el 
 */
async function setTextarea(el: HTMLTextAreaElement) {
    textarea.value = el;
    await nextTick();

    if (!editor.value) {
        return;
    }
    editor.value.commands.setContent(bbcodeToDoc(el.value));

    if (source.value) {
        source.value.append(el);
    }
}

/**
 * Update Textarea Element
 */
function updateTextarea() {
    if (!textarea.value || !editor.value) {
        return;
    }
    textarea.value.value = docToBBCode(editor.value.getJSON().content || []);
}

/**
 * Open Link Modal
 */
function openLinkDialog() {
    if (!editor.value) {
        return;
    }
    const { state, view } = editor.value;
    const { selection } = state;
    const { from, to, empty } = selection;

    linkUrl.value = '';
    linkText.value = '';

    if (editor.value.isActive('link')) {
        let linkFound = false;

        state.doc.nodesBetween(from, to, (node, pos, parent, index) => {
            const linkMark = node.marks.find(mark => mark.type.name === 'link');
            if (!linkMark) {
                return true;
            }

            linkUrl.value = linkMark.attrs.href || '';
            linkText.value = node.text || '';

            if (empty && node.isText) {
                const start = pos;
                const end = pos + node.nodeSize;

                const transaction = state.tr.setSelection(
                    TextSelection.create(state.doc, start, end)
                );

                view.dispatch(transaction);
                view.focus();
            }

            linkFound = true;
            return false;
        });

        if (!linkFound && !empty) {
            linkText.value = state.doc.textBetween(from, to).trim();
        }
    } else if (!empty) {
        linkText.value = state.doc.textBetween(from, to).trim();
    }

    showLinkDialog.value = true;
}

/**
 * Apply Link
 */
function applyLink() {
    if (!editor.value) return;
    editor.value
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl.value}">${linkText.value}</a>`)
        .run();
    showLinkDialog.value = false;
}

// Expose Component
defineExpose({ setTextarea });
</script>

<style scoped>
.editor-screen {
    @apply border border-solid rounded;
    @apply border-[#b9d2dc];
}

.editor-content {
    @apply p-6 bg-[#fcfcf6] max-h-[600px] overflow-auto;

    &:not(.is-visible) {
        @apply hidden;
    }

    & :deep(.tiptap) {
        @apply outline-none;

        & :first-child {
            @apply mt-0;
        }
        & :last-child {
            @apply mb-0;
        }
    }
}

.editor-source {
    @apply bg-[#fcfcf6];

    &:not(.is-visible) {
        @apply hidden;
    }

    & :deep(textarea) {
        @apply w-full h-auto m-0 p-6 outline-none border-0;
        min-height: 300px;
        box-sizing: border-box;
    }
}

.editor-footer {
    @apply flex items-center justify-end gap-3;
    @apply text-xs border-0 border-t border-solid rounded-b px-4 py-1;
    @apply bg-neutral-100 border-[#b9d2dc] text-neutral-600;

    & strong {
        @apply font-semibold;
    }
}

.toolbar {
    @apply flex items-center gap-1 p-2 rounded-t;
    @apply bg-neutral-100;
}

.toolbar-button {
    @apply w-8 h-8 p-0 flex items-center justify-center border rounded;
    @apply transition-colors duration-200 ease-in-out;
    @apply border-transparent bg-transparent text-neutral-600;

    &:disabled {
        @apply cursor-not-allowed;
        @apply text-neutral-400;
    }

    &:not(:disabled) {
        @apply cursor-pointer;
    }

    &:not(:disabled):hover {
        @apply bg-white text-neutral-900;
    }

    &.is-active {
        @apply bg-neutral-300;
    }
}

.toolbar-separator {
    @apply w-px h-6 bg-neutral-300 mx-4;
}
</style>