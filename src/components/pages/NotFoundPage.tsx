import { useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  const handleReturn = () => {
    navigate(-1) // Navigates to the previous page
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen gap-5 text-center'>
      <img
        className='h-96 w-auto object-cover'
        src='https://cdni.iconscout.com/illustration/premium/thumb/page-not-found-illustration-download-in-svg-png-gif-file-formats--available-invalid-address-wrong-error-state-pack-seo-web-illustrations-2133703.png?f=webp'
        alt='Page not found'
      />
      <h1 className='text-3xl font-bold'>Oops! Page Not Found</h1>
      <p className='text-lg'>Sorry, but the page you are looking for does not exist.</p>
      <p className='text-md'>Please check the URL or return to the previous page</p>
      <button
        onClick={handleReturn}
        className='mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition duration-300'
      >
        Return
      </button>
    </div>
  )
}

export default NotFoundPage
