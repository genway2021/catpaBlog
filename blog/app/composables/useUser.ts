import type { UserInfo } from '@@/types/user';
import { getUserProfile } from '@/composables/api/user';

// 用户信息状态
const userInfo = ref<UserInfo | null>(null);

/**
 * 用户信息 Composable
 */
export const useUser = () => {
  const isLoggedIn = useAuth();

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!isLoggedIn.value) {
      userInfo.value = null;
      return;
    }

    try {
      const data = await getUserProfile();
      userInfo.value = data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      userInfo.value = null;
    }
  };

  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null;
  };

  // 计算属性
  const userAvatar = computed(() => getAvatarUrl(userInfo.value || {}));

  const userNickname = computed(() => userInfo.value?.nickname || '用户');
  const userEmail = computed(() => userInfo.value?.email || '');

  return {
    userInfo,
    userAvatar,
    userNickname,
    userEmail,
    fetchUserInfo,
    clearUserInfo,
  };
};
