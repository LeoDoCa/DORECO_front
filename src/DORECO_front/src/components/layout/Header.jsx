import { useState, useEffect } from 'react';
import { useAuth } from '@config/context/auth-context';
import { useApi } from '@hooks/useApi';

const Header = ({ onMenuClick, user }) => {
  const { updateUser } = useAuth();
  const { getSilence } = useApi();
  const [imageError, setImageError] = useState(false);

  // Función helper para manejar las URLs de imagen
  const getImageUrl = (photo) => {
    if (!photo || photo === '') {
      return '/placeholder.svg';
    }
    
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    
    if (photo.startsWith('/')) {
      return `http://localhost:8000${photo}`;
    }
    
    return `http://localhost:8000/${photo}`;
  };

  // Función para manejar errores de carga de imagen
  const handleImageError = (e) => {
    console.log('Error cargando imagen:', user?.photo);
    setImageError(true);
    e.target.onerror = null;
    e.target.src = '/placeholder.svg';
  };

  // Función para refrescar datos del usuario (solo cuando sea necesario)
  const refreshUserData = async () => {
    try {
      console.log('Refrescando datos del usuario...');
      const response = await getSilence('/auth/profile/');
      
      if (response.success && response.data) {
        console.log('Datos actualizados recibidos:', response.data);
        updateUser(response.data);
        setImageError(false);
      }
    } catch (error) {
      console.error('Error al refrescar datos:', error);
    }
  };

  // Solo refrescar una vez al montar el componente
  useEffect(() => {
    refreshUserData();
  }, []); // Array vacío - solo se ejecuta una vez

  // Escuchar cuando se actualiza el perfil
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('Perfil actualizado, datos recibidos:', event.detail);
      // Los datos ya están actualizados en el contexto por updateUser()
      // Solo reseteamos el error de imagen por si cambió la foto
      setImageError(false);
    };

    // Backup: refrescar si la página vuelve a ser visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUserData();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  console.log('Header - Datos del usuario:', user);

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
          {user?.photo && user.photo !== '' && !imageError ? (
            <img
              src={getImageUrl(user.photo)}
              alt={user?.name || user?.email || 'Usuario'}
              className="h-8 w-8 object-cover rounded-full"
              onError={handleImageError}
              onLoad={() => setImageError(false)}
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
            {user?.name || user?.email || 'Usuario'}
          </span>
        </span>
      </a>
    </div>
  )
}

export default Header