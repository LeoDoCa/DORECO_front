import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@config/context/auth-context";
import { useApi } from "@hooks/useApi";
import { useConfirmAction } from "@hooks/useConfirmAction";
import Skeleton from "react-loading-skeleton";
import { useInterests } from "@hooks/useInterests";
import Swal from "sweetalert2";

const ObjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get, getSilence, post, loading } = useApi();
  const { confirmAction, showSuccess, showError } = useConfirmAction();
  const [object, setObject] = useState(null);
  const [relatedObjects, setRelatedObjects] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const {
    addToInterests,
    removeFromInterests,
    isInInterests,
    loading: interestsLoading,
  } = useInterests();

  useEffect(() => {
    loadObjectDetails();
    loadRelatedObjects();
  }, [id]);

  const loadObjectDetails = async () => {
    const response = await getSilence(`/api/publications/${id}/`);
    if (response && response.success) {
      let obj = response.data;
      if (obj.publication_data) {
        obj = obj.publication_data;
      }
      const images = [obj.image1, obj.image2, obj.image3].filter(Boolean);
      setObject({
        id: obj.id,
        name: obj.title,
        description: obj.description,
        category: obj.category_name,
        status: obj.status === "available" ? "Disponible" : obj.status,
        condition: obj.condition =="new" ? "Nuevo" : obj.condition == "like_new" ? "Como nuevo"  : obj.condition == "good" ? "En buen estado" : obj.condition == "fair" ? "En estado regular" : obj.condition == "poor" ? "En mal estado" : "Desconocido",
        duracion: obj.duration,
        price: obj.price,
        images,
        publication_type: obj.publication_type === "donation"
          ? "Donar"
          : obj.publication_type === "sale"
          ? "Vender"
          : "Prestar",
        publication_date: obj.created_at,
        owner: {
          name: obj.owner_name,
          avatar: obj.owner_photo,
          username: obj.owner_name,

        },
        keywords: obj.keywords,
        is_favorite: obj.is_favorite,
      });
      setMainImageIndex(0);
    }
  };

  const loadRelatedObjects = async () => {
    setTimeout(() => {
      setRelatedObjects([]);
    }, 1200);
  };

  // Nueva función usando useInterests
  const handleToggleFavorite = async () => {
    if (!object) return;
    let updatedFavorite = false;
    if (object.is_favorite) {
      const removed = await removeFromInterests(object.id);
      updatedFavorite = removed;
    } else {
      const added = await addToInterests(object.id);
      updatedFavorite = added;
    }
    setObject(prev => ({
      ...prev,
      is_favorite: updatedFavorite
    }));
  };

  const handleContactOwner = async () => {
  if (user && object && object.owner && user.username === object.owner.username) {
    showError("No puedes enviarte mensajes a ti mismo");
    return;
  }

  const { value: message, isConfirmed } = await Swal.fire({
    title: "Contactar con el propietario",
    text: "Escribe el mensaje que deseas enviar al propietario:",
    input: "textarea",
    inputPlaceholder: "¡Hola! ¿Aún sigue disponible?",
    showCancelButton: true,
    confirmButtonText: "Enviar mensaje",
    cancelButtonText: "Cancelar",
    icon: "question",
    customClass: {
      popup: "rounded-2xl",
      confirmButton: "btn-primary",
      cancelButton: "btn-secondary",
      input: "border rounded p-2",
    },
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "El mensaje no puede estar vacío.";
      }
      if (value.trim().length < 10) {
        return "El mensaje debe tener al menos 10 caracteres.";
      }
      return null;
    },
    buttonsStyling: false,
  });

  if (isConfirmed && message) {
    try {
      const response = await post(`/api/publications/${object.id}/send-message/`, {
        message: message.trim()
      });
      
      if (response && response.success) {
        showSuccess("Mensaje enviado exitosamente");
      } else {
        showError("No se pudo enviar el mensaje. Intenta nuevamente.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            showError(errorData.message[0]);
          } else {
            showError(errorData.message);
          }
        } else if (errorData.error) {
          showError(errorData.error);
        } else {
          showError("Error al enviar el mensaje. Intenta nuevamente.");
        }
      } else {
        showError("Error de conexión. Verifica tu internet e intenta nuevamente.");
      }
    }
  }
};

  const handleReportClick = async () => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Reportar publicación",
      html:
        '<select id="swal-input-reason" class="swal2-input">' +
        '<option value="inappropriate">Contenido inapropiado</option>' +
        '<option value="spam">Spam o publicidad</option>' +
        '<option value="scam">Estafa o fraude</option>' +
        '<option value="other">Otro</option>' +
        '</select>' +
        '<textarea id="swal-input-description" class="swal2-textarea" placeholder="Describe el motivo"></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reportar",
      cancelButtonText: "Cancelar",
      icon: "warning",
      preConfirm: () => {
        const reason = document.getElementById('swal-input-reason').value;
        const description = document.getElementById('swal-input-description').value;
        if (!description) {
          Swal.showValidationMessage('Debes escribir una descripción.');
        }
        return { reason, description };
      },
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "btn-primary",
        cancelButton: "btn-secondary",
        input: "border rounded p-2",
      },
      buttonsStyling: false,
    });

    if (isConfirmed && formValues) {
      const confirmed = await confirmAction({
        title: "¿Estás seguro que deseas reportar esta publicación?",
        text: `Motivo: ${formValues.reason}\n${formValues.description}`,
        confirmButtonText: "Sí, reportar",
        cancelButtonText: "Cancelar",
        icon: "question",
      });
      if (confirmed) {
        const response = await post("/api/reports/", {
          publication: object.id,
          reason: formValues.reason,
          description: formValues.description,
        });
        if (response && response.success) {
          showSuccess("Reporte enviado correctamente");
        } else {
          showError("No se pudo enviar el reporte");
        }
      } else {
        showError("Reporte cancelado");
      }
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

  if (loading || !object) {
    return (
      <div className="space-y-6">
        <Skeleton height={20} width={300} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton height={400} />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton height={32} width="80%" />
            <Skeleton height={24} width={100} />
            <Skeleton height={60} />
            <Skeleton height={200} />
            <Skeleton height={50} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/objects" className="text-gray-400 hover:text-gray-500">
              Objetos
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-500">
                {object.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1">
            <img
              src={object.images[mainImageIndex] || "/placeholder.svg"}
              alt={object.name}
              className="w-full h-96 object-cover rounded-lg bg-gray-100 transition-all duration-500 ease-in-out"
              style={{ opacity: 1, transform: "scale(1)" }}
              key={mainImageIndex}
            />
          </div>
          {object.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {object.images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${object.name} - imagen ${index + 1}`}
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
                  {object.name}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPublicationColor(
                    object.publication_type
                  )}`}
                >
                  {object.publication_type}
                </span>
              </div>
              {user?.role !== "admin" && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={interestsLoading}
                  className="relative group focus:outline-none ml-2"
                  aria-label={
                    object.is_favorite
                      ? "Quitar de favoritos"
                      : "Agregar a favoritos"
                  }
                >
                  {object.is_favorite ? (
                    <svg
                      className="w-6 h-6 fill-current text-red-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ) : (
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {object.is_favorite
                      ? "Quitar de favoritos"
                      : "Agregar a favoritos"}
                  </span>
                </button>
              )}
            </div>

          </div>

          <div className="p-4 bg-white rounded-sm">
            <div className="flex items-center space-x-3">
              <img
                src={object.owner.avatar || "/placeholder.svg"}
                alt={object.owner.name}
                className="w-10 h-10 rounded-full bg-gray-100"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {object.owner.name}
                </p>
                <p className="text-sm text-gray-500">
                  Publicado el: {new Date(object.publication_date).toLocaleDateString()}
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
            {object.publication_type === "Vender" && object.price && (
              <p className="text-lg font-semibold text-[#28344F]">
                Precio: ${object.price}
              </p>
            )}
            {object.publication_type === "Prestar" && object.duracion && (
               <p className="text-lg font-semibold text-[#28344F]">
                Días de préstamo: {object.duracion} días
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-md py-4 mt-4 flex justify-between items-center">
            <div>
              <span className="block font-medium text-lg text-gray-900 mb-1">
                Categoría
              </span>
              <span className="block text-base text-gray-700">
                {object.category}
              </span>
            </div>
            <div>
              <span className="block font-medium text-lg text-gray-900 mb-1">
                Estado
              </span>
              <span className="block text-base text-gray-700">
                {object.condition}
              </span>
            </div>
          </div>


          {object.status === "Disponible" && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleContactOwner}
                  className="flex-1 btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                    />
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  Contactar con el propietario
                </button>
                <button
                  onClick={handleReportClick}
                  className="flex-1 border border-red-400 text-red-600 bg-white hover:bg-red-50 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  title="Reportar publicación"
                >
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5v14m0-14h12l-2 5 2 5H5"
                    />
                  </svg>
                  Reportar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectDetails;
