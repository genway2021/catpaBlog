interface EmojiItem {
  key: string;
  val: string;
}

interface EmojiGroup {
  name: string;
  type: 'emoji' | 'image' | 'emoticon';
  items: EmojiItem[];
}

// 全局缓存表情映射
let emojiMapCache: Map<string, string> | null = null;
let emojiLoadPromise: Promise<Map<string, string>> | null = null;

/**
 * 加载表情映射表
 */
export async function loadEmojiMap(emojisUrl: string): Promise<Map<string, string>> {
  // 如果已经有缓存，直接返回
  if (emojiMapCache) {
    return emojiMapCache;
  }

  // 如果正在加载，返回加载 Promise
  if (emojiLoadPromise) {
    return emojiLoadPromise;
  }

  // 开始加载
  emojiLoadPromise = (async () => {
    try {
      const response = await fetch(emojisUrl);
      if (!response.ok) throw new Error('加载表情包失败');

      const data: EmojiGroup[] = await response.json();
      const map = new Map<string, string>();

      // 只处理 type === 'image' 的表情
      for (const group of data) {
        if (group.type === 'image') {
          for (const item of group.items) {
            map.set(item.key, item.val);
          }
        }
      }

      emojiMapCache = map;
      return map;
    } catch (error) {
      console.error('加载表情映射失败:', error);
      emojiLoadPromise = null;
      return new Map();
    }
  })();

  return emojiLoadPromise;
}

/**
 * 获取缓存的表情映射（同步）
 */
export function getEmojiMapSync(): Map<string, string> | null {
  return emojiMapCache;
}

/**
 * 清除表情映射缓存
 */
export function clearEmojiCache(): void {
  emojiMapCache = null;
  emojiLoadPromise = null;
}

/**
 * 替换文本中的表情占位符为 img 标签
 */
export function replaceEmojisInText(text: string, emojiMap: Map<string, string>): string {
  return text.replace(/:([^:\s]+):/g, (match, key) => {
    const url = emojiMap.get(key);
    if (url) {
      return `<img src="${url}" alt="${key}" class="emoji-image" title="${key}" />`;
    }
    return match;
  });
}

export default {
  loadEmojiMap,
  getEmojiMapSync,
  clearEmojiCache,
  replaceEmojisInText,
};
