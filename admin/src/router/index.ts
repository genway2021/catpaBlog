import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { checkAuth } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', requiresAuth: true }
      },
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/article/ArticleList.vue'),
        meta: { title: '文章管理', requiresAuth: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/user/UserList.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
      {
        path: 'comments',
        name: 'Comments',
        component: () => import('@/views/comment/CommentList.vue'),
        meta: { title: '评论管理', requiresAuth: true }
      },
      {
        path: 'files',
        name: 'Files',
        component: () => import('@/views/file/FileList.vue'),
        meta: { title: '文件管理', requiresAuth: true }
      },
      {
        path: 'friends',
        name: 'Friends',
        component: () => import('@/views/friend/FriendList.vue'),
        meta: { title: '友链管理', requiresAuth: true }
      },
      {
        path: 'rssfeed',
        name: 'RssFeed',
        component: () => import('@/views/rssfeed/RssFeedList.vue'),
        meta: { title: 'RSS订阅', requiresAuth: true }
      },
      {
        path: 'moments',
        name: 'Moments',
        component: () => import('@/views/moment/MomentList.vue'),
        meta: { title: '动态管理', requiresAuth: true }
      },
      {
        path: 'menus',
        name: 'Menus',
        component: () => import('@/views/menu/MenuList.vue'),
        meta: { title: '菜单管理', requiresAuth: true }
      },
      {
        path: 'visits',
        name: 'Visits',
        component: () => import('@/views/visit/VisitList.vue'),
        meta: { title: '访问日志', requiresAuth: true }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/feedback/FeedbackList.vue'),
        meta: { title: '反馈投诉', requiresAuth: true }
      },
      {
        path: 'feedback/:id',
        name: 'FeedbackDetail',
        component: () => import('@/views/feedback/FeedbackDetail.vue'),
        meta: { title: '反馈详情', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/setting/Setting.vue'),
        meta: { title: '系统设置', requiresAuth: true }
      },
      {
        path: 'systems',
        name: 'Systems',
        component: () => import('@/views/system/System.vue'),
        meta: { title: '系统信息', requiresAuth: true }
      }
    ]
  },
  {
    path: '/articles/create',
    name: 'ArticleCreate',
    component: () => import('@/views/article/ArticleForm.vue'),
    meta: { title: '创建文章', requiresAuth: true }
  },
  {
    path: '/articles/edit/:id',
    name: 'ArticleEdit',
    component: () => import('@/views/article/ArticleForm.vue'),
    meta: { title: '编辑文章', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = checkAuth()

  // 如果是登录页面
  if (to.path === '/login') {
    // 已登录则重定向到首页
    if (isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 需要认证但未登录，重定向到登录页
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router