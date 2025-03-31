import { useEffect, useState } from 'react'
import loading from '../../assets/loading.gif'
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 40) // 2s / 100% * 2% = 40ms

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-white'>
      <div className='relative mb-8 h-32 w-32'>
        <img
          src={loading} // Thay bằng đường dẫn ảnh của bạn
          alt='loading'
          className='h-full w-full animate-pulse'
        />
      </div>

      <p className='mb-4 text-xl font-medium text-gray-700'>Đang tải...</p>

      <div className='h-2 w-64 overflow-hidden rounded-full bg-gray-200'>
        <div className='h-full bg-pink-500 transition-all duration-300 ease-out' style={{ width: `${progress}%` }} />
      </div>

      <p className='mt-2 text-sm text-gray-500'>{progress}%</p>
    </div>
  )
}

export default LoadingScreen
