import { useEffect, useState } from 'react'
import { myBookings } from '../api/bookings'
import { getMemberTier } from '../utils/memberTier'

export function useMemberStats() {
  const [totalSpending, setTotalSpending] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let total = 0
        let page = 0
        while (!cancelled) {
          const res = await myBookings(page, 50)
          const items = res.data?.content ?? []
          for (const b of items) {
            if (b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED') {
              total += Number(b.tongGia) || 0
            }
          }
          if (res.data?.last || items.length === 0) break
          page += 1
        }
        if (!cancelled) setTotalSpending(total)
      } catch {
        if (!cancelled) setTotalSpending(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const tier = getMemberTier(totalSpending)
  return { totalSpending, loading, tier }
}
