/**
 * 自定义代码注入插件
 * 自动将自定义 head 和 body 代码注入到页面中
 */

export default defineNuxtPlugin({
  name: 'custom-code',
  setup() {
    const { blogConfig } = useSysConfig();

    const parseHtmlTags = (html: string) => {
      if (!html) return [];

      const tags: any[] = [];
      const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>|<(\w+)([^>]*)\s*\/>/gi;
      let match;

      while ((match = tagRegex.exec(html)) !== null) {
        const tagName = match[1] || match[4];
        if (!tagName) continue;

        const attrsStr = match[2] || match[5];
        const innerHTML = match[3];

        const tagData: any = { tag: tagName.toLowerCase() };

        if (attrsStr) {
          const attrRegex = /(\S+)=["']([^"']*)["']/g;
          let attrMatch: RegExpExecArray | null;
          while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
            tagData[attrMatch[1]!] = attrMatch[2];
          }
        }

        if (innerHTML) {
          tagData.innerHTML = innerHTML;
        }

        tags.push(tagData);
      }

      return tags;
    };

    const buildHeadPayload = (headCode: string) => {
      if (!headCode) return null;

      const tags = parseHtmlTags(headCode);
      const headPayload: { meta: any[]; link: any[]; script: any[]; style: any[] } = {
        meta: [],
        link: [],
        script: [],
        style: [],
      };

      tags.forEach(tag => {
        const { tag: tagName, innerHTML, ...attrs } = tag;

        switch (tagName) {
          case 'meta':
            headPayload.meta.push(attrs);
            break;
          case 'link':
            headPayload.link.push(attrs);
            break;
          case 'script':
            headPayload.script.push(innerHTML ? { ...attrs, innerHTML } : attrs);
            break;
          case 'style':
            headPayload.style.push(innerHTML ? { ...attrs, innerHTML } : attrs);
            break;
        }
      });

      return headPayload;
    };

    const buildFontLink = (fontConfig: string) => {
      if (!fontConfig) return { link: [], style: [] };

      // 从配置中提取 URL 和字体名称
      const parts = fontConfig.split('|');
      const url = parts[0]?.trim() || '';
      const fontFamily = parts[1]?.trim() || '';

      if (!url) return { link: [], style: [] };

      const result: any = {
        link: [
          {
            rel: 'stylesheet',
            href: url,
          },
        ],
        style: [],
      };

      // 如果指定了字体名称，添加样式
      if (fontFamily) {
        result.style.push({
          innerHTML: `body { font-family: "${fontFamily}", sans-serif !important; font-weight: normal; }`,
        });
      }

      return result;
    };

    useHead(
      computed(() => {
        const customHead = buildHeadPayload(blogConfig.value.custom_head || '');
        const fontLink = buildFontLink(blogConfig.value.font || '');

        return {
          meta: customHead?.meta || [],
          link: [...(customHead?.link || []), ...fontLink.link],
          script: customHead?.script || [],
          style: [...(customHead?.style || []), ...fontLink.style],
        };
      })
    );

    const injectBodyCode = () => {
      const bodyCode = blogConfig.value.custom_body || '';

      if (bodyCode && process.client) {
        const oldContainer = document.getElementById('custom-body-inject');
        if (oldContainer) {
          oldContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'custom-body-inject';
        container.innerHTML = bodyCode;
        document.body.prepend(container);
      }
    };

    watch(blogConfig, injectBodyCode, { immediate: true });
  },
});
