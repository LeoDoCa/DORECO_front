import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useApi } from "@hooks/useApi";
import { AuthManager } from "@config/context/auth-manager";
import { useConfirmAction } from "@hooks/useConfirmAction";
import icon from "../../assets/icon.png";

const PublishObject = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { post, put, loading, getSilence, get } = useApi();
  const { confirmAction, showSuccess } = useConfirmAction();
  const [imagePreview, setImagePreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    category: "",
    otherCategory: "",
    otherCategoryDescription: "",
    condition: "",
    tags: "",
    images: [],
    publication_type: "",
    price: "",
    loan_days: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const conditions = [
    { label: "Nuevo", value: "new" },
    { label: "Como nuevo", value: "like_new" },
    { label: "Bueno", value: "good" },
    { label: "Regular", value: "fair" },
    { label: "Malo", value: "poor" },
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .required("El nombre es requerido"),
    description: Yup.string()
      .min(10, "La descripción debe tener al menos 10 caracteres")
      .max(1000, "La descripción no puede exceder 1000 caracteres")
      .required("La descripción es requerida"),
    category: Yup.string().required("La categoría es requerida"),
    otherCategory: Yup.string().when("category", {
      is: (val) => val === "otros",
      then: (schema) =>
        schema
          .min(3, "La sugerencia debe tener al menos 3 caracteres")
          .required("Debes ingresar una sugerencia de categoría"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    otherCategoryDescription: Yup.string().when("category", {
      is: (val) => val === "otros",
      then: (schema) =>
        schema
          .min(3, "La descripción debe tener al menos 3 caracteres")
          .required("Debes ingresar una descripción para la categoría"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    condition: Yup.string().required("El estado es requerido"),
    tags: Yup.string(),
    images: Yup.array().min(1, "Debe subir al menos una imagen"),
    publication_type: Yup.string().required(
      "Debes seleccionar el tipo de publicación"
    ),
    price: Yup.number().when("publication_type", {
      is: "Vender",
      then: (schema) =>
        schema
          .typeError("El precio debe ser un número válido")
          .positive("El precio debe ser mayor a 0")
          .required("Debes ingresar el precio"),
      otherwise: (schema) => schema.notRequired(),
    }),
    loan_days: Yup.number().when("publication_type", {
      is: "Prestar",
      then: (schema) =>
        schema
          .typeError("La cantidad de días debe ser un número")
          .integer("Debe ser un número entero")
          .positive("Debe ser mayor a 0")
          .required("Debes ingresar la cantidad de días"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Cargar datos de publicación si es edición
  useEffect(() => {
    const fetchPublication = async () => {
      if (!editId) return;
      setLoadingInitial(true);
      setIsEdit(true);
      try {
        // get se toma del scope, pero no se pone como dependencia para evitar bucles
        const res = await get(`/api/publications/${editId}/`);
        if (res.success) {
          const obj = res.data.publication_data || res.data;
          setInitialValues({
            name: obj.title || "",
            description: obj.description || "",
            category: obj.category || obj.category_name || "",
            otherCategory: "",
            otherCategoryDescription: "",
            condition: obj.condition || "",
            tags: obj.keywords || "",
            images: [], // No se pueden precargar archivos, solo previews
            publication_type:
              obj.publication_type === "donation"
                ? "Donar"
                : obj.publication_type === "sale"
                ? "Vender"
                : obj.publication_type === "loan"
                ? "Prestar"
                : "",
            price: obj.price || "",
            loan_days: obj.duration || "",
          });
          // Previews de imágenes
          const previews = [obj.image1, obj.image2, obj.image3].filter(Boolean).map(img => img.startsWith("http") ? img : `http://localhost:8000${img}`);
          setImagePreview(previews);
        }
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchPublication();
    // Solo depende de editId para evitar bucles infinitos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleImageChange = (event, setFieldValue, currentImages) => {
    const files = Array.from(event.target.files);
    const remainingSlots = 3 - currentImages.length;

    if (files.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} imagen(es) más`);
      return;
    }

    const previews = [];
    const updatedFiles = [...currentImages, ...files];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target.result);
        if (previews.length === files.length) {
          setImagePreview((prev) => [...prev, ...previews]);
          setFieldValue("images", updatedFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const confirmed = await confirmAction({
      title: isEdit ? "¿Actualizar publicación?" : "¿Publicar objeto?",
      text: isEdit
        ? "Se actualizarán los datos de la publicación."
        : "El objeto será visible para todos los usuarios una vez publicado",
      confirmButtonText: isEdit ? "Sí, actualizar" : "Sí, publicar",
      icon: "question",
    });

    if (!confirmed) {
      setSubmitting(false);
      return;
    }

    try {
      let categoryId = values.category;

      // Si es "otros", primero crea la categoría sugerida
      if (values.category === "otros") {
        const categoryPayload = {
          name: values.otherCategory,
          description: values.otherCategoryDescription,
          is_active: false,
        };

        const token = AuthManager.getToken ? AuthManager.getToken() : null;

        const response = await fetch("http://localhost:8000/api/categories/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(categoryPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData && errorData.name) {
            setFieldError("otherCategory", errorData.name[0]);
          }
          if (errorData && errorData.description) {
            setFieldError("otherCategoryDescription", errorData.description[0]);
          }
          throw new Error("Error al crear la categoría sugerida");
        }

        const categoryData = await response.json();
        categoryId = categoryData.id;
      }

      // Crear o actualizar publicación
      const formData = new FormData();
      formData.append("title", values.name);
      formData.append("description", values.description);
      formData.append("category", categoryId);
      formData.append("condition", values.condition);

      let pubType = "donation";
      if (values.publication_type === "Vender") pubType = "sale";
      else if (values.publication_type === "Prestar") pubType = "loan";
      formData.append("publication_type", pubType);

      formData.append("keywords", values.tags || "");

      if (pubType === "sale") {
        formData.append("price", values.price);
      }
      if (pubType === "loan") {
        formData.append("duration", values.loan_days);
      }

      values.images.forEach((file, idx) => {
        formData.append(`image${idx + 1}`, file);
      });

      formData.append("is_active", true);

      if (isEdit) {
        await put(`/api/publications/${editId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSuccess("Publicación actualizada correctamente");
      } else {
        await post("/api/publications/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSuccess("Objeto publicado correctamente");
      }
      navigate("/objects");
    } catch (error) {
      console.error("Error publicando/actualizando objeto:", error);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, data } = await getSilence("/api/categories/active");

      if (success) {
        const categoriasBase = data.map(({ id, name }) => ({ id, name }));
        const categoriasFinal = categoriasBase.some(cat => cat.name === "Otros")
          ? categoriasBase
          : [...categoriasBase, { id: "otros", name: "Otros" }];

        setCategories(categoriasFinal);
      } else {
        setCategories([{ id: "otros", name: "Otros" }]);
      }
    };

    fetchCategories();
  }, []);

  if (loadingInitial) {
    return <div className="p-8 text-center">Cargando publicación...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#28344F]">
          {isEdit ? "Editar Publicación" : "Publicar Nuevo Objeto"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit
            ? "Modifica los datos de tu publicación."
            : "Comparte un objeto que ya no uses para que otros puedan aprovecharlo"}
        </p>
      </div>

      <div className="card">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <img src={icon} alt="Icono" className="w-10 h-10" />
                    <h3 className="text-lg font-semibold text-[#394867]">
                      Información Básica
                    </h3>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre del Objeto *
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    className={`input-field ${errors.name && touched.name
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                    placeholder="Ej: Calculadora científica Casio"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descripción *
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={4}
                    className={`input-field ${errors.description && touched.description
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                    placeholder="Describe el objeto que deseas publicar..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Categoría *
                    </label>
                    <Field
                      as="select"
                      id="category"
                      name="category"
                      className={`input-field ${errors.category && touched.category ? "border-red-500 focus:ring-red-500" : ""
                        }`}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setFieldValue("category", selected);
                        if (selected !== "otros") {
                          setFieldValue("otherCategory", "");
                          setFieldValue("otherCategoryDescription", "");
                        }
                      }}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories
                        .filter((category) => category.name !== "Otros")
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      <option value="otros">Otros</option>
                    </Field>

                    {values.category === "otros" && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="otherCategory"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Sugiere una categoría *
                          </label>
                          <Field
                            id="otherCategory"
                            name="otherCategory"
                            type="text"
                            placeholder="Ej. Arte digital, Antigüedades, etc."
                            className={`input-field ${errors.otherCategory && touched.otherCategory
                              ? "border-red-500 focus:ring-red-500"
                              : ""
                              }`}
                          />
                          <ErrorMessage
                            name="otherCategory"
                            component="div"
                            className="form-error"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="otherCategoryDescription"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Descripción de la categoría *
                          </label>
                          <Field
                            id="otherCategoryDescription"
                            name="otherCategoryDescription"
                            type="text"
                            placeholder="Describe brevemente la categoría sugerida"
                            className={`input-field ${errors.otherCategoryDescription && touched.otherCategoryDescription
                              ? "border-red-500 focus:ring-red-500"
                              : ""
                              }`}
                          />
                          <ErrorMessage
                            name="otherCategoryDescription"
                            component="div"
                            className="form-error"
                          />
                        </div>
                      </div>
                    )}

                    <ErrorMessage
                      name="category"
                      component="div"
                      className="form-error"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="condition"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Estado *
                    </label>
                    <Field
                      as="select"
                      id="condition"
                      name="condition"
                      className={`input-field ${errors.condition && touched.condition
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    >
                      <option value="">Selecciona el estado</option>
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="condition"
                      component="div"
                      className="form-error"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-semibold text-[#394867] mb-2"
                  >
                    Etiquetas
                  </label>
                  <Field
                    id="tags"
                    name="tags"
                    type="text"
                    className="input-field"
                    placeholder="Separadas por comas: calculadora, científica, casio, estudiantes"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Agrega palabras clave separadas por comas para ayudar a
                    otros usuarios a encontrar tu objeto
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#394867] border-b border-gray-200 pb-2">
                  Tipo de publicación
                </h3>

                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    {
                      label: "Donar",
                      value: "Donar",
                      color: "green-500",
                      ring: "green-500",
                      svg: (
                        <svg
                          className="mx-auto h-12 w-12 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                              2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09 
                              C13.09 4.01 14.76 3 16.5 3 
                              19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      label: "Prestar",
                      value: "Prestar",
                      color: "blue-800",
                      ring: "blue-800",
                      svg: (
                        <svg
                          className="mx-auto h-12 w-12 text-blue-800"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          <path
                            d="M12 6v6l4 2"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      label: "Vender",
                      value: "Vender",
                      color: "yellow-600",
                      ring: "yellow-600",
                      svg: (
                        <svg
                          className="mx-auto h-12 w-12 text-yellow-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M12 2v20M17 5H9a3 3 0 000 6h6a3 3 0 010 6H7"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                  ].map(({ label, value, color, ring, svg }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFieldValue("publication_type", value)}
                      className={`flex-1 min-w-[200px] p-4 border rounded transition-all duration-150 
                        focus:outline-none focus:ring-2 focus:ring-${ring} focus:border-${color}
                        ${values.publication_type === value
                          ? `border-${color} ring-2 ring-${ring} bg-${color}/10`
                          : "border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {svg}
                      <p className={`text-center mt-2 text-${color}`}>
                        {label}
                      </p>
                    </button>
                  ))}
                </div>

                <ErrorMessage
                  name="publication_type"
                  component="div"
                  className="form-error mt-2"
                />

                {values.publication_type === "Vender" && (
                  <div className="mt-4">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Precio (MXN) *
                    </label>
                    <Field
                      id="price"
                      name="price"
                      type="number"
                      placeholder="Ej. 500"
                      className={`input-field ${errors.price && touched.price
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="form-error"
                    />
                  </div>
                )}

                {values.publication_type === "Prestar" && (
                  <div className="mt-4">
                    <label
                      htmlFor="loan_days"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Días de préstamo *
                    </label>
                    <Field
                      id="loan_days"
                      name="loan_days"
                      type="number"
                      placeholder="Ej. 7"
                      className={`input-field ${errors.loan_days && touched.loan_days
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    <ErrorMessage
                      name="loan_days"
                      component="div"
                      className="form-error"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#394867] border-b border-gray-200 pb-2">
                  Imágenes *
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir Imágenes (máximo 3)
                  </label>

                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            onClick={() => {
                              const newPreviews = imagePreview.filter(
                                (_, i) => i !== index
                              );
                              setImagePreview(newPreviews);
                              const newFiles = Array.from(values.images).filter(
                                (_, i) => i !== index
                              );
                              setFieldValue("images", newFiles);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Subir archivos</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(e, setFieldValue, values.images)
                            }
                            disabled={values.images.length >= 3}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF hasta 10MB cada una
                      </p>
                    </div>
                  </div>
                  <ErrorMessage
                    name="images"
                    component="div"
                    className="form-error"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-center sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/objects")}
                  className="btn-secondary w-full sm:w-58"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center w-full sm:w-66"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isEdit ? "Actualizando..." : "Publicando..."}
                    </>
                  ) : (
                    isEdit ? "Actualizar Publicación" : "Publicar Objeto"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PublishObject;
