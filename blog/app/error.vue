<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

useSeoMeta({
  title: '404 - 页面未找到',
  description: '抱歉，您访问的页面不存在或已被删除。',
});

const handleError = () => {
  clearError({ redirect: '/' });
};
</script>

<template>
  <div class="error-page-wrapper">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-description">抱歉，您访问的页面不存在或已被删除。</p>
      <button class="btn btn-primary" @click="handleError">
        <i class="ri-home-line" />
        返回首页
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 20px;
  text-align: center;
}

.error-content {
  max-width: 400px;
  width: 100%;
}

.error-code {
  font-size: 4rem;
  font-weight: 300;
  color: #333;
  margin: 0 0 1rem;
}

.error-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1rem;
  font-weight: 500;
}

.error-description {
  font-size: 1rem;
  color: #666;
  margin: 0 0 2rem;
  line-height: 1.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  i {
    font-size: 1rem;
  }

  &.btn-primary {
    background: #49b1f5;
    color: white;

    &:hover {
      background: #3da0e3;
    }
  }
}

@media (prefers-color-scheme: dark) {
  .error-page-wrapper {
    background: #0a0a0a;
  }

  .error-code,
  .error-title {
    color: #e0e0e0;
  }

  .error-description {
    color: #888;
  }
}

[data-theme='dark'] {
  .error-page-wrapper {
    background: #0a0a0a;
  }

  .error-code,
  .error-title {
    color: #e0e0e0;
  }

  .error-description {
    color: #888;
  }
}
</style>
