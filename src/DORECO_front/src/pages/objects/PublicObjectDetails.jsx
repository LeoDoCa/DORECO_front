import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '@config/http-client/axios-client';

const translateCondition = (condition) => {
  switch (condition) {
    case 'new': return 'Nuevo';
    case 'like_new': return 'Como nuevo';
    case 'good': return 'En buen estado';
    case 'fair': return 'En estado regular';
    case 'poor': return 'En mal estado';
    default: return 'Desconocido';
  }
};

const translatePublicationType = (type) => {
  switch (type) {
    case 'donation': return 'Donar';
    case 'sale': return 'Vender';
    case 'loan': return 'Prestar';
    default: return 'Otro';
  }
};

const translateStatus = (status) => {
  switch (status) {
    case 'available': return 'Disponible';
    case 'reserved': return 'Reservado';
    case 'completed': return 'Completado';
    default: return status;
  }
};

const getPublicationColor = (type) => {
  switch (type) {
    case 'Donar':
      return 'bg-green-100 text-green-800';
    case 'Vender':
      return 'bg-yellow-100 text-yellow-800';
    case 'Prestar':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const PublicObjectDetails = () => {
  const { uuid } = useParams();
  const [object, setObject] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchObject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(`/api/publications/${uuid}/public/`, {
          headers: { Authorization: undefined }
        });
        setObject(response.data);
        setMainImageIndex(0);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (uuid) fetchObject();
  }, [uuid]);

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!object) return null;

  const images = [object.image1, object.image2, object.image3].filter(Boolean);
  const translatedCondition = translateCondition(object.condition);
  const translatedType = translatePublicationType(object.publication_type);
  const translatedStatus = translateStatus(object.status);

  return (
<div className="flex justify-center items-center h-screen mx-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1">
            <img
              src={images[mainImageIndex] || "/placeholder.svg"}
              alt={object.title}
              className="w-96 h-96 object-cover rounded-lg bg-gray-100 transition-all duration-500 ease-in-out mx-auto"
              style={{ opacity: 1, transform: "scale(1)" }}
              key={mainImageIndex}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${object.title} - imagen ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-75 border-2 ${mainImageIndex === index
                      ? "border-blue-500"
                      : "border-transparent"
                    }`}
                  onClick={() => setMainImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {object.title}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPublicationColor(translatedType)}`}
                >
                  {translatedType}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-sm">
            <div className="flex items-center space-x-3">
              <img
                src={object.owner_photo || "/placeholder.svg"}
                alt={object.owner_name}
                className="w-10 h-10 rounded-full bg-gray-100"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {object.owner_name}
                </p>
                <p className="text-sm text-gray-500">
                  Publicado el: {object.created_at ? new Date(object.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Descripción
            </h3>
            <p className="text-gray-600">{object.description}</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {translatedType === "Vender" && object.price && (
              <p className="text-lg font-semibold text-[#28344F]">
                Precio: ${object.price}
              </p>
            )}
            {translatedType === "Prestar" && object.duration && (
              <p className="text-lg font-semibold text-[#28344F]">
                Días de préstamo: {object.duration} días
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-md py-4 mt-4 flex justify-between items-center">
            <div>
              <span className="block font-medium text-lg text-gray-900 mb-1">
                Categoría
              </span>
              <span className="block text-base text-gray-700">
                {object.category_name}
              </span>
            </div>
            <div>
              <span className="block font-medium text-lg text-gray-900 mb-1">
                Estado
              </span>
              <span className="block text-base text-gray-700">
                {translatedCondition}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicObjectDetails;
