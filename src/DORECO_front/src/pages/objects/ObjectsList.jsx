import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "@hooks/useApi";
import Skeleton from "react-loading-skeleton";

import { useInterests } from "@hooks/useInterests";
import { useAuth } from "@config/context/auth-context";

const ObjectsList = () => {
  const { getSilence, post, loading } = useApi();
  const [objects, setObjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });

  const { user } = useAuth();
  const {
    addToInterests,
    removeFromInterests,
    isInInterests,
    loading: interestsLoading,
  } = useInterests();

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, data } = await getSilence("/api/categories/active");
      if (success && Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    loadObjects();
  }, [filters]);

  const loadObjects = async () => {
    let url = "/api/publications/";
    const params = [];
    if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
    if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    const response = await getSilence(url);
    if (response && response.success) {
      const mapped = response.data.map(obj => ({
        id: obj.id,
        name: obj.title,
        description: obj.description,
        category: obj.category_name,
        is_active: obj.is_active,
        status: obj.status === "available" ? "Disponible" : obj.status,
        publication_type: obj.publication_type === "donation"
          ? "Donar"
          : obj.publication_type === "sale"
          ? "Vender"
          : "Prestar",
        image: obj.image1 || "/placeholder.svg",
        createdAt: obj.created_at,
        duracion: null,
        is_favorite: obj.is_favorite,
      }))
      .filter(obj => obj.is_active === true && (obj.status === "Disponible" || obj.status === "available"));
      setObjects(mapped);
    } else {
      setObjects([]);
    }
  };

  const getPublicationColor = (type) => {
    switch (type) {
      case "Donar":
        return "bg-green-100 text-green-800";
      case "Vender":
        return "bg-yellow-100 text-yellow-800";
      case "Prestar":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleToggleFavorite = async (object, e) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    let updatedFavorite = false;
    if (object.is_favorite) {
      const removed = await removeFromInterests(object.id);
      updatedFavorite = removed;
    } else {
      const added = await addToInterests(object.id);
      updatedFavorite = added;
    }
    setObjects(prev =>
      prev.map(obj =>
        obj.id === object.id
          ? { ...obj, is_favorite: updatedFavorite }
          : obj
      )
    );
  };

  const ObjectCard = ({ object }) => (
    <div className="card hover:shadow-medium transition-shadow duration-200 cursor-pointer group relative">
      <Link
        to={`/objects/${object.id}`}
        className="block"
        tabIndex={-1}
      >
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <img
            src={object.image || "/placeholder.svg"}
            alt={object.name}
            className="w-full h-48 object-cover rounded-lg bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {object.name}
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPublicationColor(
                object.publication_type
              )}`}
            >
              {object.publication_type}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {object.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-md">
              {object.category}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                {object.duracion != null && (
                  <span className="inline-flex items-center space-x-2 text-blue-800">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6l4 2M12 4a8 8 0 100 16 8 8 0 000-16z"
                      />
                    </svg>
                    <span>{object.duracion} días</span>
                  </span>
                )}
              </div>
              <span>{new Date(object.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
      {user?.role !== "admin" && (
        <button
          onClick={(e) => handleToggleFavorite(object, e)}
          disabled={interestsLoading}
          className={`absolute top-3 right-3 z-10 px-2 py-2 rounded-full transition-colors bg-white shadow group-hover:scale-110 ${
            object.is_favorite
              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
              : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
          }`}
          title={
            object.is_favorite
              ? "Remover de favoritos"
              : "Agregar a favoritos"
          }
        >
          {object.is_favorite ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
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
          )}
        </button>
      )}
    </div>
  );

  const SkeletonCard = () => (
    <div className="card">
      <Skeleton height={192} className="mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <Skeleton height={24} width="70%" />
          <Skeleton height={20} width={80} />
        </div>
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="60%" />
        <div className="flex justify-between items-center">
          <Skeleton height={24} width={80} />
          <Skeleton height={16} width={100} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#28344F]">
            Descubre objetos disponibles
          </h1>
          <p className="mt-1 text-base text-gray-500">
            Encuentra lo que necesitas o comparte lo que ya no usas, sé parte
            del cambio.
          </p>
        </div>

        <Link
          to="/publish"
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center px-4 py-2 rounded"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Agregar
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar
            </label>
            <input
              type="text"
              id="search"
              className="input-field"
              placeholder="Buscar objetos..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoría
            </label>
            <select
              id="category"
              className="input-field"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : objects.map((object) => (
              <ObjectCard key={object.id} object={object} />
            ))}
      </div>

      {!loading && objects.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay objetos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron objetos con los filtros seleccionados.
          </p>
          <div className="mt-6">
            <Link to="/publish" className="btn-primary">
              Publicar el primer objeto
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectsList;