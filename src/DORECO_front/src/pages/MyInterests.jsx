"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@config/context/auth-context";
import { useApi } from "@hooks/useApi";
import { useConfirmAction } from "@hooks/useConfirmAction";
import Skeleton from "react-loading-skeleton";

const MyInterests = () => {
  const { user } = useAuth();
  const { confirmAction } = useConfirmAction();
  const { get, post } = useApi();
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterestedObjects();
  }, []);

  const loadInterestedObjects = async () => {
    setLoading(true);
    const response = await get("/api/favorites/");
    if (response && response.success) {
      const mapped = response.data.map(fav => ({
        id: fav.publication,
        name: fav.publication_title,
        description: fav.publication_data.description || "No hay descripción disponible",
        category: fav.publication_data.category_name, 
        status :
        fav.publication_type === "donation"
          ? "Donar"
          : fav.publication_type === "sale"
            ? "Vender"
            : fav.publication_type === "loan"
              ? "Prestar"
              : "Desconocido",
        image: fav.publication_data.image1 || "/placeholder.svg",
        createdAt: fav.created_at,
        owner: {
          name: fav.owner_name,
          avatar: "/placeholder.svg"
        },
        is_favorite: true,
      }));
      setObjects(mapped);
    } else {
      setObjects([]);
    }
    setLoading(false);
  };

  const handleRemoveInterest = async (object) => {
    const confirmed = await confirmAction({
      title: "¿Remover de favoritos?",
      text: `Se eliminará "${object.name}" de tus favoritos`,
      confirmButtonText: "Sí, remover",
      icon: "question",
    });

    if (confirmed) {
      const response = await post(`/api/publications/${object.id}/toggle_favorite/`);
      if (response && response.success && response.data.is_favorite === false) {
        setObjects(objects.filter((obj) => obj.id !== object.id));
      }
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case "Donar":
        return "bg-green-100 text-green-800";
      case "Vender":
        return "bg-yellow-100 text-yellow-800";
      case "No disponible":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ObjectCard = ({ object }) => (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <img
          src={
            object.image ||
            "https://icons.veryicon.com/png/o/miscellaneous/two-color-webpage-small-icon/user-244.png"
          }
          alt={object.name}
          className="w-full h-48 object-cover rounded-lg bg-gray-100"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {object.name}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              object.status
            )}`}
          >
            {object.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {object.description}
        </p>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{object.owner.name}</span>
          <span></span>
          <span>{object.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-md">
            {object.category}
          </span>
          <div className="flex items-center space-x-4">
            <span>{new Date(object.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2 border-t border-gray-100">
          <Link
            to={`/objects/${object.id}`}
            className="flex-1 btn-primary text-center text-sm py-2"
          >
            Ver Detalles
          </Link>
          <button
            onClick={() => handleRemoveInterest(object)}
            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Remover de favoritos"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
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
        <div className="flex space-x-2 pt-2">
          <Skeleton height={32} className="flex-1" />
          <Skeleton height={32} width={40} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Intereses</h1>
        </div>
        <Link
          to="/objects"
          className="mt-4 sm:mt-0 btn-secondary inline-flex items-center px-8 rounded-md">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Explorar Objetos
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : objects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {objects.map((object) => (
            <ObjectCard key={object.id} object={object} />
          ))}
        </div>
      ) : (
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tienes objetos de interés
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Explora objetos disponibles y marca los que te interesen para
            encontrarlos fácilmente aquí.
          </p>
          <div className="mt-6">
            <Link to="/objects" className="btn-primary">
              Explorar Objetos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInterests;
