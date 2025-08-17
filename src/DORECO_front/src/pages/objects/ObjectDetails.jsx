import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@config/context/auth-context";
import { useApi } from "@hooks/useApi";
import { useConfirmAction } from "@hooks/useConfirmAction";
import Skeleton from "react-loading-skeleton";
import { useInterests } from "@hooks/useInterests";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ObjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get, getSilence, post, loading } = useApi();
  const { confirmAction, showSuccess, showError } = useConfirmAction();
  const [object, setObject] = useState(null);
  const [relatedObjects, setRelatedObjects] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const ContactSchema = Yup.object().shape({
    message: Yup.string()
      .trim("No se permiten solo espacios en el mensaje")
      .required("Debes escribir un mensaje.")
      .test('not-empty', 'Debes escribir un mensaje.', value => value && value.trim() !== ''),
  });

  const ReportSchema = Yup.object().shape({
    reason: Yup.string()
      .required("Debes seleccionar un motivo."),
    description: Yup.string()
      .trim("No se permiten solo espacios en la descripción")
      .required("Debes escribir una descripción.")
      .test('not-empty', 'Debes escribir una descripción.', value => value && value.trim() !== ''),
  });

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
        condition: obj.condition == "new" ? "Nuevo" : obj.condition == "like_new" ? "Como nuevo" : obj.condition == "good" ? "En buen estado" : obj.condition == "fair" ? "En estado regular" : obj.condition == "poor" ? "En mal estado" : "Desconocido",
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
          avatar: obj.owner_photo

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

  const handleContactOwner = () => {
    setShowContactModal(true);
    setContactSuccess("");
  };


  const handleReportClick = () => {
    setShowReportModal(true);
    setReportSuccess("");
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

  if (sendingContact) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-60">
        <div className="flex flex-col items-center bg-white rounded-xl py-8 px-8 shadow-lg">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="text-blue-800 text-lg font-semibold">Enviando mensaje...</div>
          <div className="mt-3 text-gray-600 text-center text-sm max-w-xs">Por favor espera, tu mensaje está siendo enviado. Esto puede tardar algunos segundos.</div>
        </div>
      </div>
    );
  }


  if (!sendingContact && !showContactModal && (loading || !object)) {
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
      {/* Breadcrumb */}
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

      {showContactModal && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-white bg-opacity-40">
          <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Contactar con el propietario</h3>
            <Formik
              initialValues={{ message: "" }}
              validationSchema={ContactSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setShowContactModal(false);
                setContactSuccess("");
                setSendingContact(true);
                const response = await post(`/api/publications/${object.id}/send-message/`, {
                  message: values.message
                });
                setSendingContact(false);
                if (response && response.success) {
                  setContactSuccess("Solicitud de contacto enviada correctamente");
                  resetForm();
                  await showSuccess("Solicitud de contacto enviada correctamente");
                } else {
                  setContactSuccess("");
                  await showError(response.error || "No se pudo enviar el mensaje. Intenta nuevamente.");
                }

                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Mensaje</label>
                    <Field as="textarea" name="message" rows={3} className="w-full border rounded-lg px-3 py-2" placeholder="Escribe tu mensaje..." />
                    <ErrorMessage name="message" component="div" className="text-xs text-red-600 mt-1" />
                  </div>
                  {contactSuccess && <div className="text-green-600 text-sm">{contactSuccess}</div>}
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>Enviar mensaje</button>
                    <button type="button" className="btn-secondary flex-1" onClick={() => setShowContactModal(false)}>Cancelar</button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Reportar publicación</h3>
            <Formik
              initialValues={{ reason: "inappropriate", description: "" }}
              validationSchema={ReportSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setShowReportModal(false);
                const confirmed = await confirmAction({
                  title: "¿Estás seguro que deseas reportar esta publicación?",
                  text: `Motivo: ${values.reason}\n${values.description}`,
                  confirmButtonText: "Sí, reportar",
                  cancelButtonText: "Cancelar",
                  icon: "question",
                });
                if (confirmed) {
                  const response = await post("/api/reports/", {
                    publication: object.id,
                    reason: values.reason,
                    description: values.description,
                  });
                  if (response && response.success) {
                    setReportSuccess("Reporte enviado correctamente");
                    resetForm();
                    await showSuccess("Reporte enviado correctamente");
                  } else {
                    setReportSuccess("");
                    await showError(response.error || "No se pudo enviar el reporte");
                  }

                }
                setSubmitting(false);
              }}
            >
            
              {({ isSubmitting }) => (
                <Form className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Motivo</label>
                    <Field as="select" name="reason" className="w-full border rounded-lg px-3 py-2">
                      <option value="inappropriate">Contenido inapropiado</option>
                      <option value="spam">Spam o publicidad</option>
                      <option value="fake">Estafa o fraude</option>
                      <option value="other">Otro</option>
                    </Field>
                    <ErrorMessage name="reason" component="div" className="text-xs text-red-600 mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Descripción</label>
                    <Field as="textarea" name="description" rows={3} className="w-full border rounded-lg px-3 py-2" placeholder="Describe el motivo..." />
                    <ErrorMessage name="description" component="div" className="text-xs text-red-600 mt-1" />
                  </div>
                  {reportSuccess && <div className="text-green-600 text-sm">{reportSuccess}</div>}
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>Reportar</button>
                    <button type="button" className="btn-secondary flex-1" onClick={() => setShowReportModal(false)}>Cancelar</button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {sendingContact && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex flex-col items-center bg-white rounded-xl py-8 px-8 shadow-lg">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="text-blue-800 text-lg font-semibold">Enviando mensaje...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectDetails;

