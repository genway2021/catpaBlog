export function getAvatarUrl(user: { avatar?: string; email_hash?: string }, size = 48): string {
  if (user.avatar) return user.avatar;
  if (!user.email_hash) {
    return `data:image/svg+xml,%3Csvg width='${size}' height='${size}' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23E5E7EB'/%3E%3Cpath d='M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12Z' fill='%239CA3AF'/%3E%3Ccircle cx='24' cy='24' r='8' fill='%236B7280'/%3E%3C/svg%3E`;
  }
  return `https://cravatar.cn/avatar/${user.email_hash}?d=robohash&s=${size}`;
}
