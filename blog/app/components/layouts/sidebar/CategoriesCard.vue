<script setup lang="ts">
const { categories } = useCategories();
const { isExpanded, toggleExpand } = useExpandable();
</script>

<template>
  <div class="card-widget card-categories">
    <div class="item-headline" :class="{ 'is-expanded': isExpanded }">
      <i class="ri-folder-6-fill"></i>
      <span>分类</span>
      <i
        class="collapse-icon ri-arrow-left-s-fill"
        :class="{ 'is-expanded': isExpanded }"
        @click="toggleExpand"
      ></i>
    </div>
    <ul class="card-list" :class="{ 'is-expanded': isExpanded }">
      <li class="card-list-item" v-for="category in categories" :key="category.id">
        <router-link
          class="card-list-link"
          :to="category.url"
          :aria-label="`查看分类 ${category.name}，共 ${category.count} 篇文章`"
        >
          <span class="card-list-name">{{ category.name }}</span>
          <span class="card-list-count" aria-hidden="true">{{ category.count }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>
