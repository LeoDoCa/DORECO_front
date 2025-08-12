import { useState, useEffect } from 'react';
import { useAuth } from '@config/context/auth-context';
import { useApi } from '@hooks/useApi';

const Header = ({ onMenuClick, user }) => {
  const { updateUser } = useAuth();
  const { getSilence } = useApi();
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función helper para manejar las URLs de imagen de forma más robusta
  const getImageUrl = (photo) => {
    if (!photo || photo === '') {
      return '/placeholder.svg';
    }
    
    // Si ya es una URL completa, devolverla tal como está
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    
    // Si es una ruta relativa, construir la URL completa
    if (photo.startsWith('/')) {
      return `http://localhost:8000${photo}`;
    }
    
    // Si no tiene barra inicial, agregarla
    return `http://localhost:8000/${photo}`;
  };

  // Función para refrescar datos del usuario desde la API
  const refreshUserData = async () => {
    if (isRefreshing) return; // Evitar múltiples llamadas simultáneas
    
    try {
      setIsRefreshing(true);
      console.log('Refreshing user data from API...');
      
      const response = await getSilence('/auth/profile/');
      if (response.success && response.data) {
        console.log('Fresh user data:', response.data);
        updateUser(response.data); // Actualizar el contexto con datos frescos
        setImageError(false); // Reset error state
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para manejar errores de carga de imagen
  const handleImageError = async (e) => {
    console.log('Error cargando imagen:', user?.photo);
    setImageError(true);
    
    // Si la imagen actual es default.png, intentar refrescar los datos del usuario
    if (user?.photo && user.photo.includes('default.png')) {
      console.log('Detected default image, refreshing user data...');
      await refreshUserData();
    }
    
    e.target.onerror = null; // Prevenir bucle infinito
    e.target.src = '/placeholder.svg';
  };

  // Refrescar datos automáticamente cuando el componente se monta
  useEffect(() => {
    // Solo refrescar si tenemos un usuario y su foto es default.png
    if (user?.photo && user.photo.includes('default.png') && !isRefreshing) {
      console.log('User has default image on mount, refreshing...');
      refreshUserData();
    }
  }, []); // Solo ejecutar una vez al montar

  // Debug: Imprimir información del usuario en consola
  console.log('Header - User data:', user);
  console.log('Header - User photo:', user?.photo);
  console.log('Header - Image URL:', user?.photo ? getImageUrl(user.photo) : 'No photo');

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
              key={user.photo} // Forzar re-render cuando cambie la foto
              src={getImageUrl(user.photo)}
              alt={user?.name || user?.email || 'Usuario'}
              className="h-8 w-8 object-cover rounded-full"
              onError={handleImageError}
              onLoad={() => {
                console.log('Imagen cargada exitosamente:', user.photo);
                setImageError(false);
              }}
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