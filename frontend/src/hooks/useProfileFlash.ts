import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function useProfileFlash() {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState<string>(
    (location.state as { flash?: string } | null)?.flash ?? '',
  )

  useEffect(() => {
    const msg = (location.state as { flash?: string } | null)?.flash
    if (msg) {
      setFlash(msg)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  return flash
}
