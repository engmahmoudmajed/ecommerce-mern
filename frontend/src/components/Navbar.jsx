import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import useUserStore from '../stores/useUserStore.js'

const Navbar = () => {
  const { user,logout } = useUserStore();
  const { isAdmin } = useUserStore();
  return (
    <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex flex-wrap justify-between items-center'>

          <Link to='/' className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
            E-Commerce
          </Link>

          <nav className='flex items-center space-x-4'>
            <Link to="/" className='text-emerald-400 hover:text-emerald-300'>
              Home
            </Link>
            {user ? (
              <>
                <Link to="/cart" className='relative group text-emerald-400 hover:text-emerald-300'>
                  <ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={16} />
                  <span className='hidden sm:inline'>Cart</span>
                  <span className='absolute -top-2 -left-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                    3
                  </span>
                </Link>
              </>
            ) : (
              <>
              </>
            )}
            {isAdmin && (
              <Link
                className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
								 transition duration-300 ease-in-out flex items-center'
                to={"/secret-dashboard"}
              >
                <Lock className='inline-block mr-1' size={18} />
                <span className='hidden sm:inline'>Dashboard</span>
              </Link>
            )}
            {user ? (
              <button onClick={logout}
                className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out'
              >
                <LogOut size={18} />
                <span className='hidden sm:inline ml-2'>Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out'
                >
                  <UserPlus className='mr-2' size={18} />
                  Sign Up
                </Link>
                <Link
                  to={"/login"}
                  className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out'
                >
                  <LogIn className='mr-2' size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar
