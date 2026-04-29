import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface SearchHighlightOptions {
  searchTerm: string;
  activeIndex: number;
}

export const searchHighlightPluginKey = new PluginKey('searchHighlight');

export const SearchHighlightExtension = Extension.create<SearchHighlightOptions>({
  name: 'searchHighlight',

  addOptions() {
    return {
      searchTerm: '',
      activeIndex: 0,
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;

    return [
      new Plugin({
        key: searchHighlightPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState) {
            const meta = tr.getMeta(searchHighlightPluginKey);
            if (meta !== undefined) {
              return meta;
            }
            if (tr.docChanged) {
              return oldState.map(tr.mapping, tr.doc);
            }
            return oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state) || DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

export function getSearchDecorations(
  doc: any,
  searchTerm: string,
  activeIndex: number
): { decorationSet: DecorationSet; totalMatches: number } {
  if (!searchTerm) {
    return { decorationSet: DecorationSet.empty, totalMatches: 0 };
  }

  const decorations: Decoration[] = [];
  const searchLower = searchTerm.toLowerCase();
  let matchCount = 0;

  doc.descendants((node: any, pos: number) => {
    if (!node.isText) return;
    const text = node.text || '';
    const textLower = text.toLowerCase();
    let index = textLower.indexOf(searchLower);

    while (index >= 0) {
      const from = pos + index;
      const to = from + searchTerm.length;
      const isActive = matchCount === activeIndex;

      decorations.push(
        Decoration.inline(from, to, {
          class: isActive ? 'search-highlight search-highlight-active' : 'search-highlight',
        })
      );

      matchCount++;
      index = textLower.indexOf(searchLower, index + 1);
    }
  });

  return {
    decorationSet: DecorationSet.create(doc, decorations),
    totalMatches: matchCount,
  };
}
