import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "@config/context/auth-context";

const Sidebar = ({ isOpen, onClose, currentPath, userRole }) => {
  const { logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
      adminOnly: true, 
    },
    {
      name: "Objetos",
      href: "/objects",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      userOnly:true,
    },
    {
      name: "Publicar",
      href: "/publish",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      userOnly: true, 
    },
    {
      name: "Mis Intereses",
      href: "/my-interests",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      userOnly: true, 
    },
  ];

  const adminNavigation = [
    {
      name: "Categorías",
      href: "/admin/categories",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      name: "Reportes",
      href: "/admin/reports",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-15 h-25" />
              </div>
              <span className="text-xl font-bold text-gray-900">DORECO</span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation
                    .filter((item) => {
                      if (userRole === "ADMIN") return !item.userOnly;
                      if (userRole === "USER") return !item.adminOnly;
                      return true;
                    })
                    .map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            currentPath === item.href
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>

              {userRole === "ADMIN" && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                    Administración
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            currentPath === item.href
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}

              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link
                      to="/profile"
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        currentPath === "/profile"
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Perfil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div
        className={`lg:hidden fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DORECO</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation
                    .filter((item) => {
                      if (userRole === "ADMIN") return !item.userOnly;
                      if (userRole === "USER") return !item.adminOnly;
                      return true;
                    })
                    .map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            currentPath === item.href
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>

              {userRole === "ADMIN" && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                    Administración
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                            currentPath === item.href
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}

              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link
                      to="/profile"
                      onClick={onClose}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        currentPath === "/profile"
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Perfil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
