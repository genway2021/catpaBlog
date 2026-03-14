<template>
  <el-form :model="form" label-width="120px" class="setting-form">
    <el-form-item label="API 端点">
      <el-input v-model="form.base_url" placeholder="例如 https://api.deepseek.com" :disabled="loading" />
    </el-form-item>

    <el-form-item label="API 密钥">
      <el-input v-model="form.api_key" type="password" show-password placeholder="输入 API Key" :disabled="loading" autocomplete="off" />
    </el-form-item>

    <el-form-item label="模型名称">
      <el-input v-model="form.model" placeholder="例如 deepseek-chat" :disabled="loading" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
interface AIForm {
  base_url: string
  api_key: string
  model: string
}

const form = defineModel<AIForm>('form', { required: true })

defineProps<{
  loading?: boolean
}>()
</script>

<style lang="scss" scoped>
// 移动端适配
@media (max-width: 768px) {
  :deep(.el-form-item__label) {
    width: 100px !important;
    font-size: 13px;
  }
}
</style>
