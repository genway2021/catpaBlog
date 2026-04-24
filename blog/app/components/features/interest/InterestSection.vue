<template>
  <div class="interest-section">
    <!-- 兴趣爱好标签 -->
    <div class="interest-tags">
      <h3 class="interest-title">兴趣爱好</h3>
      <div class="tags-container">
        <span class="tag-item">软路由</span>
        <span class="tag-item">服务器</span>
        <span class="tag-item">docker</span>
        <span class="tag-item">GitHub</span>
        <span class="tag-item">Pages</span>
        <span class="tag-item">cloudflare</span>
        <span class="tag-item">edgeone</span>
        <span class="tag-item">workers</span>
        <span class="tag-item">nas</span>
        <span class="tag-item">养猫撸猫</span>
        <span class="tag-item">养鱼赏鱼</span>
        <span class="tag-item">刷剧吃瓜</span>
        <span class="tag-item">看综艺</span>
        <span class="tag-item">听相声</span>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div class="cards-grid">
      <a :href="card.url" class="card-item" v-for="(card, index) in cards" :key="index" target="_blank" rel="noopener noreferrer">
        <div class="card-icon">
          <img :src="card.icon" :alt="card.title" class="card-icon-img" />
        </div>
        <h4 class="card-title">{{ card.title }}</h4>
        <p class="card-description">{{ card.description }}</p>
        <div class="card-arrow">
          <i class="ri-arrow-right-line"></i>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const cards = [
  {
    icon: '/docker.svg',
    title: '猫手册',
    description: '服务器, docker, workers, pages, 项目部署记录/教程',
    url: 'https://catpa.cn/manual'
  },
  {
    icon: '/cat.svg',
    title: '猫盒',
    description: '记录用过的或我感兴趣的GitHub开源项目',
    url: 'https://catpa.cn/box'
  },
  {
    icon: '/AI.png',
    title: '灵猫AI',
    description: '一个简单的AI导航页',
    url: 'https://catpa.cn/ai'
  },
  {
    icon: '/blog.png',
    title: '猫手猫脚',
    description: '暂时为在建设中的blog，后期会改名吧',
    url: 'https://catpa.cn/blog'
  },
  {
    icon: '/github2.svg',
    title: '喵站集',
    description: '猫咪的网站收藏，帖子/教程收藏',
    url: 'https://catpa.cn/links'
  },
  {
    icon: '/猫爪.svg',
    title: '拍他猫',
    description: '真的是猫哦',
    url: 'https://catpa.cn/photos'
  },
  {
    icon: '/tm.svg',
    title: '猫片',
    description: '猫和老鼠动画片/影视下载',
    url: 'https://mp.catpa.cn/'
  },
  {
    icon: '/电视剧.svg',
    title: '猫观世界',
    description: '影视剧电影分享',
    url: 'https://catpa.cn/movies'
  },
  {
    icon: '/时间.svg',
    title: '九条喵',
    description: '本喵的时光计算器',
    url: 'https://sg.catpa.cn/'
  },
  {
    icon: '/logo.svg',
    title: '猫乎',
    description: '猫咪的问答社区',
    url: 'https://catpa.cn/qa'
  },
  {
    icon: '/猫粮.svg',
    title: '赏猫粮',
    description: '感谢您的支持，欢迎请我喝杯咖啡',
    url: 'https://3q.catpa.cn/'
  }
];
</script>

<style scoped lang="scss">
.interest-section {
  margin: 40px 0;
  padding: 30px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  backdrop-filter: blur(10px);

  .interest-title {
    color: #fff;
    font-size: 1.2rem;
    margin-bottom: 15px;
    display: flex;
    align-items: center;

    &::before {
      content: '|';
      color: #ff6b6b;
      margin-right: 10px;
      font-weight: bold;
    }
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 30px;

    .tag-item {
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      font-size: 0.9rem;
      color: #ddd;
      transition: all 0.3s ease;
      cursor: default;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    .card-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 20px;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-5px);
      }

      .card-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 107, 107, 0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;

        .card-icon-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }
      }

      .card-title {
        color: #fff;
        font-size: 1.1rem;
        margin-bottom: 10px;
      }

      .card-description {
        color: #aaa;
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 15px;
      }

      .card-arrow {
        position: absolute;
        bottom: 20px;
        right: 20px;
        color: #888;
        transition: color 0.3s ease;

        i {
          font-size: 16px;
        }
      }

      &:hover .card-arrow {
        color: #ff6b6b;
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .interest-section {
    padding: 20px;

    .cards-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>