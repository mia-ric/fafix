import { type JSONContent } from '@tiptap/vue-3';

/**
 * Convert BBCode to HTML
 * @param bbcode 
 * @returns 
 */
export function bbcodeToHTML(bbcode: string): string {
    const escapeHtml = (str: string): string => {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    const tagRegex = /\[([a-z]+)(?:\s+type="([^"]+)")?(?:\s+href="([^"]+)")?\]|\[\/([a-z]+)\]/gi;

    const convert = (input: string): string => {
        const stack: { tag: string, htmlOpen: string, htmlClose: string, attrs?: string }[] = [];
        let output = '';
        let lastIndex = 0;

        let match: RegExpExecArray | null;
        while ((match = tagRegex.exec(input)) !== null) {
            const [full, openTag, typeAttr, hrefAttr, closeTag] = match;

            if (match.index > lastIndex) {
                const text = input.slice(lastIndex, match.index);
                output += escapeHtml(text);
            }

            if (closeTag) {
                const last = stack.pop();
                if (last && last.tag === closeTag) {
                    output += last.htmlClose;
                } else {
                    output += escapeHtml(full);
                }
            } else {
                let htmlOpen = '', htmlClose = '', attrs = '';

                if (openTag === 'style') {
                    switch (typeAttr) {
                        case 'bold': htmlOpen = '<strong>'; htmlClose = '</strong>'; break;
                        case 'italic': htmlOpen = '<em>'; htmlClose = '</em>'; break;
                        case 'underlined': htmlOpen = '<u>'; htmlClose = '</u>'; break;
                        case 'linethrough': htmlOpen = '<s>'; htmlClose = '</s>'; break;
                    }
                } else if (openTag === 'link' && hrefAttr) {
                    htmlOpen = `<a href="${hrefAttr}">`;
                    htmlClose = '</a>';
                } else if (openTag === 'align' && typeAttr) {
                    // Setzen von text-align je nach type-Attribut
                    attrs = `style="text-align:${typeAttr};"`;
                    htmlOpen = `<p ${attrs}>`;
                    htmlClose = '</p>';
                }

                output += htmlOpen;
                stack.push({ tag: openTag, htmlOpen, htmlClose, attrs });
            }

            lastIndex = tagRegex.lastIndex;
        }

        if (lastIndex < input.length) {
            output += escapeHtml(input.slice(lastIndex));
        }

        while (stack.length > 0) {
            output += stack.pop()?.htmlClose;
        }

        return output;
    };
    
    const paragraphs = bbcode.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
    const htmlParagraphs = paragraphs.map(p => {
        const result = convert(p);
        return result.startsWith('<p') ? result : `<p>${result}</p>`;
    });
    return htmlParagraphs.join('\n');
}

/**
 * Convert BBCode to TipTap Document
 * @bug doesn't support nested tags atm.
 * @param bbcode 
 * @returns 
 */
export function bbcodeToDoc(bbcode: string): JSONContent {
    const blocks: JSONContent[] = [];

    const parseInline = (text: string): JSONContent[] => {
        const result: JSONContent[] = [];
        const tagPattern = /\[style type="(bold|italic|underlined|linethrough)"\](.*?)\[\/style\]|\[link href="(.*?)"\](.*?)\[\/link\]/gs;

        let match: RegExpExecArray | null;
        let lastIndex = 0;
        while ((match = tagPattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push(...handleLineBreaks(text.slice(lastIndex, match.index)));
            }

            if (match[1]) {
                const type = match[1];
                const content = match[2];
                const marks = [];

                if (type === 'bold') marks.push({ type: 'bold' });
                if (type === 'italic') marks.push({ type: 'italic' });
                if (type === 'underlined') marks.push({ type: 'underline' });
                if (type === 'linethrough') marks.push({ type: 'strike' });

                result.push(...handleLineBreaks(content, marks));
            } else if (match[3]) {
                const href = match[3];
                const content = match[4];
                result.push(...handleLineBreaks(content, [{ type: 'link', attrs: { href } }]));
            }

            lastIndex = tagPattern.lastIndex;
        }

        if (lastIndex < text.length) {
            result.push(...handleLineBreaks(text.slice(lastIndex)));
        }

        return result;
    }

    const handleLineBreaks = (text: string, marks: any[] = []): JSONContent[] => {
        const parts = text.split('\n');
        const result: JSONContent[] = [];

        parts.forEach((part, i) => {
            if (part.length > 0) {
                result.push({
                    type: 'text',
                    text: part,
                    ...(marks.length > 0 ? { marks } : {}),
                });
            }

            if (i < parts.length - 1) {
                result.push({ type: 'hardBreak' });
            }
        })

        return result;
    }

    const alignPattern = /\[align type="(left|center|right)"\](.*?)\[\/align\]/gs;
    const paragraphs = bbcode.split(/\n{2,}/);
    paragraphs.forEach((rawParagraph) => {
        let match: RegExpExecArray | null;
        let cursor = 0;

        while ((match = alignPattern.exec(rawParagraph)) !== null) {
            if (match.index > cursor) {
                const plainText = rawParagraph.slice(cursor, match.index).trim();
                if (plainText) {
                    blocks.push({
                        type: 'paragraph',
                        content: parseInline(plainText),
                    });
                }
            }

            const alignType = match[1];
            const content = match[2].trim();
            blocks.push({
                type: 'paragraph',
                attrs: { textAlign: alignType },
                content: parseInline(content),
            });

            cursor = alignPattern.lastIndex;
        }

        if (cursor < rawParagraph.length) {
            const rest = rawParagraph.slice(cursor).trim();
            if (rest) {
                blocks.push({
                    type: 'paragraph',
                    content: parseInline(rest),
                });
            }
        }
    });

    return {
        type: 'doc',
        content: blocks,
    };
}

/**
 * Convert TipTap Document to BBCode
 * @param content
 * @returns 
 */
export function docToBBCode(content: JSONContent[]): string {
    const convertInline = (node: JSONContent): string => {
        if (node.type === 'text') {
            let text = node.text || '';

            if (node.marks) {
                node.marks.forEach(mark => {
                    if (mark.type === 'bold') {
                        text = `[style type="bold"]${text}[/style]`;
                    } else if (mark.type === 'italic') {
                        text = `[style type="italic"]${text}[/style]`;
                    } else if (mark.type === 'underline') {
                        text = `[style type="underlined"]${text}[/style]`;
                    } else if (mark.type === 'strike') {
                        text = `[style type="linethrough"]${text}[/style]`;
                    } else if (mark.type === 'link' && mark.attrs?.href) {
                        text = `[link href="${mark.attrs.href}"]${text}[/link]`;
                    }
                })
            }
            return text;
        }
        return '';
    };

    const convertBlock = (node: JSONContent): string => {
        if (node.type === 'paragraph') {
            let result = '';

            if (node.attrs?.textAlign) {
                result += `[align type="${node.attrs.textAlign}"]`;
            }
            if (node.content) {
                let inner = '';
                node.content.forEach(subNode => {
                    inner += convertInline(subNode);
                });
                result += inner;
            }
            if (node.attrs?.textAlign) {
                result += `[/align]`;
            }
            return result;
        }
        return '';
    }

    return content.map(node => convertBlock(node)).join('\n\n');
}
