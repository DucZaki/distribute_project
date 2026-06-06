export type MemberTierInfo = {
  name: string
  icon: string
  color: string
  progress: number
  nextTier: string
  targetLabel: string
}

export function getMemberTier(totalSpending: number): MemberTierInfo {
  const s = Math.max(0, totalSpending)
  if (s >= 100_000_000) {
    return { name: 'Kim Cương', icon: '👑', color: 'tier-diamond', progress: 100, nextTier: '', targetLabel: '' }
  }
  if (s >= 50_000_000) {
    return {
      name: 'Bạch Kim',
      icon: '💎',
      color: 'tier-platinum',
      progress: Math.min(100, ((s - 50_000_000) / 500_000) * 100),
      nextTier: 'Kim Cương 👑',
      targetLabel: '100 tr',
    }
  }
  if (s >= 20_000_000) {
    return {
      name: 'Vàng',
      icon: '🥇',
      color: 'tier-gold',
      progress: Math.min(100, ((s - 20_000_000) / 300_000) * 100),
      nextTier: 'Bạch Kim 💎',
      targetLabel: '50 tr',
    }
  }
  if (s >= 10_000_000) {
    return {
      name: 'Bạc',
      icon: '🥈',
      color: 'tier-silver',
      progress: Math.min(100, ((s - 10_000_000) / 100_000) * 100),
      nextTier: 'Vàng 🥇',
      targetLabel: '20 tr',
    }
  }
  return {
    name: 'Đồng',
    icon: '🥉',
    color: 'tier-bronze',
    progress: Math.min(100, (s / 100_000) * 100),
    nextTier: 'Bạc 🥈',
    targetLabel: '10 tr',
  }
}
