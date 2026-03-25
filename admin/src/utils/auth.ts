import { ref } from 'vue'
import type { User } from '@/types/user'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const LEGACY_USER_INFO_KEY = 'userInfo'

const currentUser = ref<User | null>(null)
let userInfoPromise: Promise<User | null> | null = null
let userInfoRequestId = 0
let redirectingToLogin = false

/**
 * 获取本地存储中的access token
 * @returns {string | null} access token字符串或null
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * 获取本地存储中的refresh token
 * @returns {string | null} refresh token字符串或null
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 将双token保存到本地存储
 * @param {string} accessToken access token字符串
 * @param {string} refreshToken refresh token字符串
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  redirectingToLogin = false
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 设置access token（用于token刷新）
 * @param {string} accessToken access token字符串
 */
export const setAccessToken = (accessToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

/**
 * 从本地存储中移除双token
 */
export const removeTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

const clearLegacyUserInfo = (): void => {
  localStorage.removeItem(LEGACY_USER_INFO_KEY)
}

/**
 * 设置当前登录用户信息
 */
export const setUserInfo = (user: User | null): void => {
  currentUser.value = user
  clearLegacyUserInfo()
}

/**
 * 清空当前登录用户信息
 */
export const clearUserInfo = (): void => {
  currentUser.value = null
  userInfoRequestId += 1
  userInfoPromise = null
  clearLegacyUserInfo()
}

/**
 * 获取当前登录用户信息
 */
export const getUserInfo = (): User | null => {
  return currentUser.value
}

/**
 * 从服务端拉取当前登录用户信息
 */
export const fetchUserInfo = async (): Promise<User | null> => {
  if (!checkAuth()) {
    clearUserInfo()
    return null
  }

  if (!userInfoPromise) {
    const requestId = ++userInfoRequestId

    userInfoPromise = import('@/api/user')
      .then(({ getProfile }) => getProfile())
      .then((user) => {
        if (requestId !== userInfoRequestId || !checkAuth()) {
          return currentUser.value
        }

        setUserInfo(user)
        return user
      })
      .catch((error) => {
        if (requestId === userInfoRequestId) {
          clearUserInfo()
        }
        throw error
      })
      .finally(() => {
        if (requestId === userInfoRequestId) {
          userInfoPromise = null
        }
      })
  }

  return userInfoPromise
}

/**
 * 确保当前登录用户信息已初始化
 */
export const ensureUserInfo = async (): Promise<User | null> => {
  if (currentUser.value) return currentUser.value
  return fetchUserInfo()
}

/**
 * 获取当前登录用户角色
 */
export const getCurrentUserRole = (): string => {
  return currentUser.value?.role || ''
}

/**
 * 当前用户是否为超级管理员
 */
export const isSuperAdmin = (): boolean => {
  return currentUser.value?.role === 'super_admin'
}

/**
 * 检查用户是否已经登录（是否有access token）
 * @returns {boolean} true表示已登录，false表示未登录
 */
export const checkAuth = (): boolean => {
  const token = getAccessToken()
  return token !== null && token !== ''
}

/**
 * 清除本地认证状态
 */
export const clearAuthState = (): void => {
  removeTokens()
  clearUserInfo()
}

/**
 * 跳转到登录页并清理认证状态
 */
export const redirectToLogin = (): void => {
  clearAuthState()

  if (window.location.pathname === '/login') {
    return
  }

  if (redirectingToLogin) return

  redirectingToLogin = true
  window.location.replace('/login')
}

/**
 * 注销用户，清除token和用户信息
 */
export const logout = (): void => {
  clearAuthState()
}
