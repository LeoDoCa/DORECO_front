
import { useState, useEffect } from "react"
import { useApi } from "@hooks/useApi"
import { useConfirmAction } from "@hooks/useConfirmAction"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import Skeleton from "react-loading-skeleton"
import { AuthManager } from "@config/context/auth-manager"

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#DC2626", "#059669", "#7C3AED", "#DB2777", "#F472B6"
]
function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

const Categories = () => {
  const { getSilence, post, put, delete: deleteApi, loading } = useApi()
  const { confirmAction, showSuccess } = useConfirmAction()
  const [categories, setCategories] = useState([])
  const [suggestedCategories, setSuggestedCategories] = useState([])
  const [stats, setStats] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [activeView, setActiveView] = useState("list")

  useEffect(() => {
    loadCategories()
    loadSuggestedCategories()
    loadStats()
  }, [])

  const loadCategories = async () => {
    const token = AuthManager.getToken()
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const res = await getSilence("http://localhost:8000/api/categories/", config)
    if (res.success && Array.isArray(res.data)) {
      const categoriesWithColor = res.data.map(cat => ({
        ...cat,
        color: cat.color || getRandomColor(),
        description: cat.description || '',
        status: cat.is_active === true ? "Activa" : (cat.is_active === false ? "Inactiva" : (cat.is_active === null ? "Rechazada" : "Pendiente")),
        createdAt: cat.created_at || new Date().toISOString(),
      }))
      setCategories(categoriesWithColor)
    }
  }

  const loadSuggestedCategories = async () => {
    const token = AuthManager.getToken()
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const res = await getSilence("http://localhost:8000/api/categories/suggested/", config)
    if (res.success && Array.isArray(res.data)) {
      const suggestionsWithColor = res.data.map(cat => ({
        ...cat,
        color: cat.color || getRandomColor(),
        description: cat.description || '',
        suggestedBy: cat.suggested_by || cat.user_email || '',
        suggestedAt: cat.suggested_at || cat.created_at || new Date().toISOString(),
        status: cat.is_active === true ? "Aceptada" : (cat.is_active === false ? "Pendiente" : (cat.is_active === 3 ? "Rechazada" : "Pendiente")),
      }))
      setSuggestedCategories(suggestionsWithColor)
    }
  }

  const loadStats = async () => {
    setTimeout(() => {
      setStats({ totalCategories: 12, activeCategories: 10, totalObjects: 139, avgObjectsPerCategory: 11.6, pendingSuggestions: 4 })
    }, 800)
  }

  const categorySchema = Yup.object().shape({
    name: Yup.string()
      .trim("No se permiten solo espacios en el nombre")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .required("El nombre es requerido")
      .test('not-empty', 'El nombre no puede estar vacío o solo contener espacios', value => value && value.trim() !== ''),
    description: Yup.string()
      .trim("No se permiten solo espacios en la descripción")
      .max(200, "La descripción no puede exceder 200 caracteres")
      .required("La descripción es requerida")
      .test('not-empty', 'La descripción no puede estar vacía o solo contener espacios', value => value && value.trim() !== ''),
    color: Yup.string().required("El color es requerido"),
  })


  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = AuthManager.getToken()
      const config = { headers: { Authorization: `Bearer ${token}` } }
      if (editingCategory) {
        showSuccess("Edición de categoría no implementada aún")
      } else {
        const res = await post("http://localhost:8000/api/categories/", values, config)
        if (res.success) {
          showSuccess("Categoría creada correctamente")
          loadCategories()
        }
      }
      resetForm()
      setShowModal(false)
      setEditingCategory(null)
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setSubmitting(false)
    }
  }


  const handleAcceptSuggestion = async (suggestion) => {
    const confirmed = await confirmAction({ title: "¿Aceptar sugerencia?", text: `Se aceptará la categoría "${suggestion.name}" sugerida por ${suggestion.suggestedBy || suggestion.user_email || ''}`, confirmButtonText: "Sí, aceptar", icon: "question" })
    if (confirmed) {
      const token = AuthManager.getToken()
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await post(`http://localhost:8000/api/categories/${suggestion.id}/toggle-status/`, config)
      if (res.success) {
        showSuccess(`Categoría "${suggestion.name}" aceptada exitosamente`)
        loadCategories()
        loadSuggestedCategories()
      }
    }
  }

  const handleRejectSuggestion = async (suggestion) => {
    const confirmed = await confirmAction({ title: "¿Rechazar sugerencia?", text: `Se rechazará la categoría "${suggestion.name}" sugerida por ${suggestion.suggestedBy || suggestion.user_email || ''}`, confirmButtonText: "Sí, rechazar", icon: "warning" })
    if (confirmed) {
      const token = AuthManager.getToken()
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await put(`http://localhost:8000/api/categories/${suggestion.id}/`, {name: suggestion.name, is_active: null }, config)
      if (res.success) {
        showSuccess("Sugerencia rechazada")
        loadSuggestedCategories()
      }
    }
  }

  const StatCard = ({ title, value, icon, color = "primary" }) => (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>{icon}</div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{loading ? <Skeleton width={60} /> : value}</dd>
          </dl>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">Administra las categorías de objetos del sistema</p>
        </div>
        <button onClick={() => { setEditingCategory(null); setShowModal(true); }} className="mt-4 sm:mt-0 btn-primary inline-flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Categoría
        </button>
      </div>


      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveView("list")}
            className={`${
              activeView === "list"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Lista de Categorías
          </button>
          <button
            onClick={() => setActiveView("suggestions")}
            className={`${
              activeView === "suggestions"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Categorías Sugeridas
            
          </button>
        </nav>
      </div>

      {activeView === 'suggestions' && (
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Categorías Sugeridas</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (<div key={i} className="flex items-center space-x-4 py-3"><Skeleton height={40} width={40} /><div className="flex-1"><Skeleton height={16} width="30%" /><Skeleton height={12} width="60%" /><Skeleton height={10} width="40%" /></div><Skeleton height={32} width={120} /></div>))}
            </div>
          ) : suggestedCategories.length > 0 ? (
            <div className="space-y-3">
              {suggestedCategories.map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: suggestion.color }}></div>
                      <div className="flex-1"><h4 className="text-sm font-medium text-gray-900">{suggestion.name}</h4><p className="text-sm text-gray-600">{suggestion.description}</p><div className="mt-1 flex items-center space-x-4 text-xs text-gray-500"><span>Sugerida por: <strong>{suggestion.suggestedBy}</strong></span><span>•</span><span>{new Date(suggestion.suggestedAt).toLocaleDateString()}</span></div></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleAcceptSuggestion(suggestion)} className="inline-flex items-center px-3 py-2 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Aceptar</button>
                      <button onClick={() => handleRejectSuggestion(suggestion)} className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Rechazar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8"><svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><h3 className="mt-2 text-sm font-medium text-gray-900">No hay sugerencias pendientes</h3><p className="mt-1 text-sm text-gray-500">No tienes categorías sugeridas por revisar en este momento.</p></div>
          )}
        </div>
      </div>
      )}

      {activeView === 'list' && (
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lista de Categorías</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center space-x-4 py-3"><Skeleton height={40} width={40} /><div className="flex-1"><Skeleton height={16} width="30%" /><Skeleton height={12} width="60%" /></div><Skeleton height={20} width={60} /><Skeleton height={20} width={80} /><Skeleton height={32} width={100} /></div>))}
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.filter(category => category.is_active !== null).map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }}></div><div><div className="text-sm font-medium text-gray-900">{category.name}</div></div></div></td>
                      <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate">{category.description}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.status === "Activa" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{category.status}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(category.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <Formik initialValues={{ name: editingCategory?.name || "", description: editingCategory?.description || "", color: editingCategory?.color || "#3B82F6" }} validationSchema={categorySchema} onSubmit={handleSubmit}>
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>
                          <div className="space-y-4">
                            <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><Field id="name" name="name" type="text" className={`input-field ${errors.name && touched.name ? "border-red-500" : ""}`} placeholder="Nombre de la categoría" /><ErrorMessage name="name" component="div" className="form-error" /></div>
                            <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label><Field as="textarea" id="description" name="description" rows={3} className={`input-field ${errors.description && touched.description ? "border-red-500" : ""}`} placeholder="Descripción de la categoría" /><ErrorMessage name="description" component="div" className="form-error" /></div>
                            <div><label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color *</label><Field id="color" name="color" type="color" className="h-10 w-20 border border-gray-300 rounded-md" /><ErrorMessage name="color" component="div" className="form-error" /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center btn-primary sm:ml-3 sm:w-auto sm:text-sm">{isSubmitting ? "Guardando..." : editingCategory ? "Actualizar" : "Crear"}</button>
                      <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center btn-secondary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancelar</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories