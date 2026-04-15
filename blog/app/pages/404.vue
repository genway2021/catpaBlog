<script setup lang="ts">
const router = useRouter();

definePageMeta({
  showSidebar: false,
});

useSeoMeta({
  title: '页面未找到',
  description: '抱歉，您访问的页面不存在或已被删除',
});

const goHome = () => {
  navigateTo('/');
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div id="page" class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">抱歉，您访问的页面不存在或已被删除。</p>
      <div class="error-actions">
        <button @click="goBack" class="btn btn-secondary">
          <i class="ri-arrow-left-line"></i>
          返回上一页
        </button>
        <button @click="goHome" class="btn btn-primary">
          <i class="ri-home-line"></i>
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/mixins' as *;

#page {
  @extend .cardHover;
  align-self: flex-start;
  padding: 60px 40px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-content {
  text-align: center;
  max-width: 600px;

  .error-code {
    font-size: 8rem;
    font-weight: bold;
    line-height: 1;
    background: linear-gradient(135deg, var(--theme-color), #78c2f4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
  }

  .error-title {
    font-size: 2rem;
    color: var(--font-color);
    margin: 0 0 1rem;
  }

  .error-description {
    font-size: 1.1rem;
    color: var(--theme-meta-color);
    margin: 0 0 2.5rem;
    line-height: 1.6;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;

      i {
        font-size: 1.2rem;
      }

      &.btn-primary {
        background: linear-gradient(135deg, var(--theme-color), #78c2f4);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(73, 177, 245, 0.4);
        }
      }

      &.btn-secondary {
        background: var(--flec-page-bg);
        color: var(--font-color);
        border: 1px solid rgba(128, 128, 128, 0.2);

        &:hover {
          background: var(--flec-card-bg);
          border-color: var(--theme-color);
        }
      }
    }
  }
}

// 响应式设�?
@media screen and (max-width: 768px) {
  #page {
    padding: 40px 20px;
  }

  .not-found-content {
    .error-code {
      font-size: 5rem;
    }

    .error-title {
      font-size: 1.5rem;
    }

    .error-description {
      font-size: 1rem;
    }

    .error-actions {
      flex-direction: column;

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
