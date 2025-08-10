const Header = ({ onMenuClick, user }) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Abrir sidebar</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      <a
        href="/profile"
        className="ml-auto flex items-center p-1.5 -m-1.5 hover:bg-gray-50 rounded transition"
      >
        <span className="sr-only">Ir al perfil</span>
        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden">
          {user?.photo ? (
            <img
              src={user.photo.startsWith('http') ? user.photo : `http://localhost:8000${user.photo}`}
              alt={user?.name || user?.email}
              className="h-8 w-8 object-cover rounded-full"
              onError={e => { e.target.onerror = null; e.target.src = '/placeholder.svg'; }}
            />
          ) : (
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
        </div>
        <span className="hidden lg:flex lg:items-center">
          <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
            {user?.name || user?.email}
          </span>
        </span>
      </a>
    </div>
  )
}

export default Header