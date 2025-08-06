import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@hooks/useApi";
import { AuthManager } from "@config/context/auth-manager";

const API_PROFILE = "/auth/profile/";
const API_UPDATE = "/auth/update-profile/";

const Profile = () => {
  const navigate = useNavigate();
  const { get, getSilence, put, loading: apiLoading, error: apiError } = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surnames: "",
    email: "",
    username: "",
    phone_number: "",
    photo: "",
    password: "",
    password_confirm: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await get(API_PROFILE);
      if (res.success) {
        const data = res.data;
        setUser(data);
        setFormData({
          name: data.name || "",
          surnames: data.surnames || "",
          email: data.email || "",
          username: data.username || "",
          phone_number: data.phone_number || "",
          photo: data.photo || "",
          password: "",
          password_confirm: "",
        });
        setPhotoPreview(data.photo ? (data.photo.startsWith("http") ? data.photo : `http://localhost:8000${data.photo}`) : "/placeholder.svg");
      } else {
        setError("No se pudo cargar el perfil");
      }
      setLoading(false);
    };

    fetchProfile();
    fetchMyPublications();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setFormData({ ...formData, photo: files[0] });
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: user.name || "",
      surnames: user.surnames || "",
      email: user.email || "",
      username: user.username || "",
      phone_number: user.phone_number || "",
      photo: user.photo || "",
      password: "",
      password_confirm: "",
    });
    setPhotoPreview(user.photo ? (user.photo.startsWith("http") ? user.photo : `http://localhost:8000${user.photo}`) : "/placeholder.svg");
    setError("");
  };

  const handleSave = async () => {
    setError("");
    const form = new FormData();
    form.append("name", formData.name);
    form.append("surnames", formData.surnames);
    form.append("email", formData.email);
    form.append("username", formData.username);
    form.append("phone_number", formData.phone_number || "");
    if (formData.photo && formData.photo instanceof File) {
      form.append("photo", formData.photo);
    }
    if (formData.password) {
      form.append("password", formData.password);
      form.append("password_confirm", formData.password_confirm);
    }
    const res = await put(API_UPDATE, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.success) {
      const updated = res.data;
      setUser(updated);
      setEditMode(false);
      setFormData({
        name: updated.name || "",
        surnames: updated.surnames || "",
        email: updated.email || "",
        username: updated.username || "",
        phone_number: updated.phone_number || "",
        photo: updated.photo || "",
        password: "",
        password_confirm: "",
      });
      setPhotoPreview(updated.photo ? (updated.photo.startsWith("http") ? updated.photo : `http://localhost:8000${updated.photo}`) : "/placeholder.svg");
    } else {
      setError(res.error || "Error al actualizar perfil");
    }
  };

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  const fetchMyPublications = async () => {
    setPostsLoading(true);
    setPostsError("");
    const res = await get("/api/publications/my_publications/");
    if (res.success) {
      const mapped = res.data.map(obj => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        category: obj.category_name,
        condition: obj.condition,
        publication_type: obj.publication_type === "donation"
          ? "Donar"
          : obj.publication_type === "sale"
          ? "Vender"
          : "Prestar",
        price: obj.price || "0.00",
        keywords: obj.keywords || "",
        duration: obj.duration,
        status: obj.status,
        is_active: obj.is_active,
        owner: obj.owner,
        images: [obj.image1, obj.image2, obj.image3].filter(Boolean)
      }));
      setPosts(mapped);
    } else {
      setPostsError("No se pudieron cargar las publicaciones");
    }
    setPostsLoading(false);
  };

  const handleDeliver = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/publications/${postId}/change-status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(AuthManager.getToken() && { 'Authorization': `Bearer ${AuthManager.getToken()}` })
        },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, status: "completed" } : p
          )
        );
      } else {
        alert('No se pudo marcar como entregado');
      }
    } catch (error) {
      alert('Error de red al marcar como entregado');
    }
  };

  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRTitle, setCurrentQRTitle] = useState("");
  const [currentPostId, setCurrentPostId] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const openQRModal = async (post) => {
    if (post.status !== "available") return;
    
    if (qrImageUrl && qrImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(qrImageUrl);
    }
    
    setCurrentQRTitle(post.title);
    setCurrentPostId(post.id);
    setShowQRModal(true);
    setQrLoading(true);
    setQrError("");
    setQrImageUrl("");

    try {
      const token = AuthManager.getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const imageResponse = await fetch(`http://localhost:8000/api/publications/${post.id}/generate-qr/`, {
        method: 'GET',
        headers,
      });
      
      if (imageResponse.ok) {
        const contentType = imageResponse.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          const blob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          setQrImageUrl(imageUrl);
        } else {
          setQrError("El servidor no devolvió una imagen válida");
        }
      } else {
        const errorText = await imageResponse.text();
        console.error("Failed to fetch QR image:", imageResponse.status, errorText);
        setQrError(`Error ${imageResponse.status}: No se pudo generar el código QR`);
      }
    } catch (error) {
      console.error("QR generation error:", error);
      setQrError("Error de conexión al generar el código QR");
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrImageUrl) return;
    
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `QR_${currentQRTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${currentPostId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeQRModal = () => {
    if (qrImageUrl && qrImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(qrImageUrl);
    }
    
    setShowQRModal(false);
    setCurrentQRTitle("");
    setCurrentPostId(null);
    setQrImageUrl("");
    setQrError("");
    setQrLoading(false);
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
      <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-4">
        <img
          src={photoPreview}
          alt="Foto de perfil"
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
        />

        {editMode ? (
          <form className="w-full text-sm space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-1.5"
                  placeholder="Nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Apellidos</label>
                <input
                  type="text"
                  name="surnames"
                  value={formData.surnames}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-1.5"
                  placeholder="Apellidos"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-1.5"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-1.5"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Teléfono</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-1.5"
                  placeholder="Teléfono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-1.5"
                  placeholder="Nueva contraseña"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-1.5"
                  placeholder="Confirmar contraseña"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Foto de perfil</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-1.5"
              />
            </div>

            {error && <div className="text-red-600 text-xs">{error}</div>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full text-center text-sm space-y-1">
            <p className="font-semibold">{user.name} {user.surnames}</p>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">Usuario: {user.username}</p>
            <p className="text-gray-600">Teléfono: {user.phone_number || "-"}</p>
            <p className="text-gray-500">Miembro desde {new Date(user.created_at).toLocaleDateString()}</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar Información
            </button>
          </div>
        )}
      </div>

      {/* Publicaciones */}
      {user?.role_name !== "ADMIN" && (
        <div>
          <h2 className="text-lg font-semibold mb-2 mt-4">Mis Publicaciones</h2>
          {postsLoading ? (
            <div className="p-8 text-center">Cargando publicaciones...</div>
          ) : postsError ? (
            <div className="p-8 text-red-600 text-center">{postsError}</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-gray-500 text-center">No tienes publicaciones aún.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => {
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
              return (
                <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
                  {post.images && post.images.length > 0 && (
                    <img
                      src={post.images[0].startsWith("http") ? post.images[0] : `http://localhost:8000${post.images[0]}`}
                      alt={post.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  )}
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                        {post.title}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getPublicationColor(post.publication_type)}`}>
                        {post.publication_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {post.description}
                    </p>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                        Categoría {post.category}
                      </span>
                      <span>
                        ${post.price}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 p-2 flex space-x-1">
                    <button
                      onClick={() => navigate(`/publish?id=${post.id}`)}
                      className="flex-1 py-1 rounded-lg justify-center bg-gray-700 hover:bg-gray-800 text-white font-medium transition text-center flex items-center text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => openQRModal(post)}
                      className={`flex-1 py-1 rounded-lg justify-center text-white font-medium transition flex items-center gap-1 text-xs ${post.status === "available"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-300 cursor-not-allowed"
                        }`}
                      disabled={post.status !== "available"}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="5" height="5" fill="white" />
                        <rect x="13" y="2" width="5" height="5" fill="white" />
                        <rect x="2" y="13" width="5" height="5" fill="white" />
                        <rect x="9" y="9" width="2" height="2" fill="white" />
                        <rect x="12" y="9" width="2" height="2" fill="white" />
                        <rect x="15" y="9" width="2" height="2" fill="white" />
                        <rect x="9" y="12" width="2" height="2" fill="white" />
                        <rect x="12" y="12" width="2" height="2" fill="white" />
                      </svg>
                      QR
                    </button>
                    {post.status === "available" ? (
                      <button
                        onClick={() => handleDeliver(post.id)}
                        className="flex-1 justify-center py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center gap-1 text-xs"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Entregar
                      </button>
                    ) : (
                      <span className="flex-1 flex items-center justify-center text-gray-600 font-medium text-xs">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                        Entregado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* Modal QR */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold">Código QR</h3>
              <button onClick={closeQRModal} className="text-gray-500 hover:text-gray-700 text-lg">
                &times;
              </button>
            </div>
            <div className="text-center">
              {qrLoading ? (
                <div className="mx-auto mb-3 w-56 h-56 flex items-center justify-center">
                  <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : qrError ? (
                <div className="mx-auto mb-3 w-56 h-56 flex items-center justify-center text-red-600">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              ) : qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Código QR"
                  className="mx-auto mb-3 w-56 h-56 object-contain"
                  onError={(e) => {
                    console.error("Error loading QR image:", e);
                    setQrError("Error al cargar el código QR");
                  }}
                />
              ) : null}
              
              <p className="text-gray-700 mb-2 text-sm">{currentQRTitle}</p>
              
              {qrError && (
                <p className="text-red-600 mb-2 text-xs">{qrError}</p>
              )}
              
              <div className="flex gap-2 justify-center">
                {qrError && (
                  <button
                    onClick={() => {
                      const post = posts.find(p => p.id === currentPostId);
                      if (post) openQRModal(post);
                    }}
                    className="py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center gap-2"
                    disabled={qrLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                )}
                {qrImageUrl && !qrError && (
                  <button
                    onClick={downloadQR}
                    className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar
                  </button>
                )}
                <button
                  onClick={closeQRModal}
                  className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
