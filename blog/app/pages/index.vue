<script setup lang="ts">
import { getArticlesForWeb } from '@/composables/api/article'

definePageMeta({
  typeHeader: 'home'
})

const { articles, total, currentPage, pageSize, fetchArticles } = useArticles()
const { blogConfig } = useSysConfig()

const { waterfall } = useWaterfall({
  containerSelector: '#post-list',
  columns: 2,
  gap: 16,
  waitForImages: false,
  debounceDelay: 50
})

// 使用SSR获取首页数据
const { data: initialData } = await useAsyncData('articles-list', async () => {
  const { list, total: resTotal } = await getArticlesForWeb({
    page: 1,
    page_size: 20
  })
  return { list, total: resTotal }
})

// 初始化数据
if (initialData.value) {
  articles.value = initialData.value.list.slice(0, 10)
  total.value = initialData.value.total
  currentPage.value = 1
}

const handlePageChange = async (page: number) => {
  await fetchArticles({ page })
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  setTimeout(() => waterfall(), 100)
}

onMounted(async () => {
  // 只在客户端初始化瀑布流
  if (process.client) {
    await nextTick()
    // 延迟执行以确保 DOM 完全渲染
    requestAnimationFrame(() => {
      waterfall()
    })
  }
})

// 监听路由变化，处理从详情页返回的情况
const route = useRoute()
watch(() => route.path, async (newPath) => {
  if (newPath === '/' && process.client) {
    await nextTick()
    // 给 DOM 一点时间稳定
    setTimeout(() => {
      waterfall()
    }, 50)
  }
})

watch(() => articles.value.length, () => {
  setTimeout(() => waterfall(), 50)
})

useSeoMeta({
  title: '首页',
  description: () => blogConfig.value.description || '欢迎来到我的博客，分享技术、生活与思考的个人空间'
})
</script>

<template>
  <div>
    <!-- 文章列表 -->
    <div id="post-list">
      <div v-for="article in articles" :key="article.id" class="post-items">
        <div v-if="article.is_top || article.is_essence" class="post-badge">
          <span v-if="article.is_top" class="badge-top">置顶</span>
          <span v-else-if="article.is_essence" class="badge-essence">精选</span>
        </div>
        <div v-if="article.cover" class="post-cover">
          <NuxtLink :to="article.url">
            <NuxtImg :src="article.cover" :alt="article.title" loading="lazy" />
          </NuxtLink>
        </div>
        <div class="post-info">
          <NuxtLink class="article-title" :to="article.url">{{ article.title }}</NuxtLink>
          <div class="article-meta-wrap">
            <span class="article-date">
              <i class="ri-calendar-2-fill"></i>
              <span class="article-meta-label">发表于</span>
              <span>{{ formatDate(article.publish_time) }}</span>
            </span>
            <span class="article-meta" v-if="article.category">
              <i class="ri-inbox-2-fill"></i>
              <NuxtLink class="article-meta__categories" :to="article.category.url">{{ article.category.name }}</NuxtLink>
            </span>
            <span class="article-meta tags" v-if="article.tags?.length">
              <template v-for="(tag, index) in article.tags" :key="tag.id">
                <template v-if="Number(index) > 0">
                  <span class="article-meta-link">•</span>
                </template>
                <i class="ri-price-tag-3-fill"></i>
                <NuxtLink class="article-meta__tags" :to="tag.url">{{ tag.name }}</NuxtLink>
              </template>
            </span>
            <span class="article-meta comments">
              <i class="ri-message-3-fill"></i>
              <span>{{ article.comment_count }}条评论</span>
            </span>
          </div>
          <div class="post-desc">
            {{ article.summary }}
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <UiPagination v-if="articles.length > 0" :total="total" :current-page="currentPage" :page-size="pageSize"
      @change="handlePageChange" />
  </div>
</template>

<style lang="scss">
@use '@/assets/css/mixins' as *;

// 文章列表样式
#post-list {
  position: relative;
  width: 100%;
  min-height: 500px;

  .post-items {
    @extend .cardHover;
    position: relative;
    overflow: hidden;
    width: calc(50% - 8px);

    .post-badge {
       position: absolute;
       top: 10px;
       right: 10px;
       z-index: 10;
       display: flex;
       gap: 4px;

       .badge-top,
       .badge-essence {
         padding: 2px 4px;
         font-size: 0.8rem;
         color: #fff;
         border-radius: 3px;
       }

       .badge-top {
         background: #e64980;
       }

       .badge-essence {
         background: #fab005;
       }
     }

     .post-cover {
      overflow: hidden;
      width: 100%;
      aspect-ratio: 16 / 9;
      height: auto;

      img {
        @extend .imgHover
      }
    }

    .post-info {
      padding: 30px 30px 25px;

      .article-title {
        font-size: 1.55rem;
        line-height: 1.4;
        transition: all 0.2s ease-in-out;
      }

      .article-meta-wrap {
        margin: 6px 0;
        color: var(--theme-meta-color);
        font-size: 0.9rem;

        i {
          margin: 0 4px 0 0;
        }

        .article-meta-label {
          padding-right: 4px;
        }

        .article-meta {
          &::before {
            content: '|';
            margin: 0 6px;
            color: var(--theme-meta-color);
          }
        }

        .article-meta-link {
          margin: 0 4px;
        }

        .article-meta__categories,
        .article-meta__tags,
        .article-meta__comments {
          color: var(--theme-meta-color);
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: var(--theme-color);
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #post-list {
    .post-items {
      .post-info {
        padding: 20px 20px 18px;

        .article-title {
          font-size: 1.35rem;
        }

        .article-meta-wrap {
          font-size: 0.85rem;
        }

        .post-desc {
          font-size: 0.95rem;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  #post-list {
    .post-items {
      .post-info {
        padding: 16px 16px 14px;

        .article-title {
          font-size: 1.2rem;
          line-height: 1.3;
        }

        .article-meta-wrap {
          font-size: 0.78rem;
          flex-wrap: wrap;
        }

        .post-desc {
          font-size: 0.88rem;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>