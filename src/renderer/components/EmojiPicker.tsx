import React, { useState } from 'react';

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Popularne',
    emojis: ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💡', '⚡', '🚀', '✅', '❌', '⭐', '📌', '📝', '💬', '🎯', '🏆', '💪', '🙏'],
  },
  {
    name: 'Praca',
    emojis: ['📋', '📊', '📈', '📉', '💼', '🖥️', '⏰', '📅', '🔔', '📎', '✏️', '📁', '🗂️', '📧', '💡', '🔍', '🛠️', '⚙️', '🔗', '📱'],
  },
  {
    name: 'Emocje',
    emojis: ['😊', '😍', '🤔', '😅', '😢', '😤', '🥳', '😎', '🤗', '😴', '🙄', '😱', '🤯', '😇', '🥺', '😏', '🤓', '😬', '🫡', '🫠'],
  },
  {
    name: 'Natura',
    emojis: ['🌟', '🌈', '☀️', '🌙', '⛅', '🌊', '🌸', '🍀', '🌲', '🔮', '💎', '🦋', '🐱', '🐶', '🌺', '🍎', '🍕', '☕', '🎵', '🎨'],
  },
  {
    name: 'Symbole',
    emojis: ['➡️', '⬅️', '⬆️', '⬇️', '↩️', '🔄', '➕', '➖', '✖️', '➗', '💯', '🔴', '🟢', '🔵', '🟡', '⚪', '⚫', '🟣', '🟠', '🔶'],
  },
];

function EmojiPicker({ onSelect, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="emoji-picker" onMouseDown={(e) => e.stopPropagation()}>
      <div className="emoji-categories">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            className={`emoji-cat-btn ${i === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(i)}
            title={cat.name}
          >
            {cat.emojis[0]}
          </button>
        ))}
      </div>
      <div className="emoji-grid">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            className="emoji-btn"
            onClick={() => { onSelect(emoji); onClose(); }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiPicker;
