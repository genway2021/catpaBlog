<script lang="ts" setup></script>

<template>
  <footer class="flex flex-col justify-center items-center py-4 bg-black/80 backdrop-blur-md border-t border-white/20 w-full">
    <div class="flex flex-col items-center w-full max-w-4xl px-4">
      <p class="text-sm text-gray-300 mb-3 text-center">本站部署在EdgeOne和cloudflaer，是一个纯静态网站</p>
      <p class="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm w-full">
        <div class="flex items-center gap-2">
          <img src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png" alt="" class="w-5 h-5">
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010102000001" target="_blank" class="text-gray-300 hover:text-blue-400 transition-colors">粤公网安备44011302005280号</a>
        </div>
        <div class="flex items-center gap-2">
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" class="text-gray-300 hover:text-blue-400 transition-colors">粤ICP备2025450906号</a>
        </div>
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
footer {
  position: relative;
  z-index: 10;
}
</style>
