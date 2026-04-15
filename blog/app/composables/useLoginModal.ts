// 全局共享的登录弹窗状态
const showLoginModal = ref(false);

export const useLoginModal = () => {
  const open = () => {
    showLoginModal.value = true;
  };

  const close = () => {
    showLoginModal.value = false;
  };

  return {
    showLoginModal,
    open,
    close,
  };
};
