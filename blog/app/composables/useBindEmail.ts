import { getUserProfile } from '@/composables/api/user';
import type { UserInfo } from '@@/types/user';

// 触发间隔配置
const GLOBAL_REMIND_INTERVAL = 12 * 60 * 60 * 1000; // 全局触发：12小时
const COMMENT_REMIND_INTERVAL = 10 * 60 * 1000; // 评论触发：10分钟

// 存储 key
const SKIP_TIME_KEY = 'bindEmailSkipTime';

// 全局状态
const showBindEmailModal = ref(false);

// 触发类型
type TriggerType = 'global' | 'comment';

/**
 * 邮箱绑定提示管理
 * - 全局触发（页面访问/刷新/路由切换）：间隔 12 小时
 * - 评论触发：间隔 10 分钟
 * - 关闭弹窗会重置计时器
 */
export function useBindEmail() {
  /**
   * 检查是否需要显示绑定邮箱提示
   * @param trigger 触发类型
   * @param userInfo 用户信息（可选）
   */
  const shouldShowPrompt = async (
    trigger: TriggerType,
    userInfo?: UserInfo | null
  ): Promise<boolean> => {
    // 未登录不提示
    if (!isLoggedIn.value) return false;

    // 如果没有传入用户信息，尝试获取
    let user = userInfo;
    if (!user) {
      try {
        user = await getUserProfile();
      } catch {
        return false;
      }
    }

    // 非虚拟邮箱不提示
    if (!user?.is_virtual_email) return false;

    // 检查上次跳过时间
    const skipTime = localStorage.getItem(SKIP_TIME_KEY);
    if (skipTime) {
      const elapsed = Date.now() - parseInt(skipTime, 10);
      const interval = trigger === 'comment' ? COMMENT_REMIND_INTERVAL : GLOBAL_REMIND_INTERVAL;
      if (elapsed < interval) return false;
    }

    return true;
  };

  /**
   * 全局触发（页面访问/刷新/路由切换）
   * @param userInfo 用户信息（可选）
   */
  const triggerGlobal = async (userInfo?: UserInfo | null) => {
    if (await shouldShowPrompt('global', userInfo)) {
      showBindEmailModal.value = true;
    }
  };

  /**
   * 评论触发
   */
  const triggerOnComment = async () => {
    if (await shouldShowPrompt('comment')) {
      showBindEmailModal.value = true;
    }
  };

  /**
   * 绑定成功后的回调
   */
  const onBindSuccess = () => {
    localStorage.removeItem(SKIP_TIME_KEY);
  };

  /**
   * 用户跳过时记录时间（由弹窗组件调用）
   */
  const onSkip = () => {
    localStorage.setItem(SKIP_TIME_KEY, String(Date.now()));
  };

  return {
    showBindEmailModal,
    triggerGlobal,
    triggerOnComment,
    onBindSuccess,
    onSkip,
  };
}
