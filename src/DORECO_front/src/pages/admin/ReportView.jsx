import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import Skeleton from "react-loading-skeleton"
import { useApi } from "@hooks/useApi"
import { useConfirmAction } from "@hooks/useConfirmAction"

const CONDITION_MAP = {
  new: "Nuevo",
  used: "Usado",
}
const TYPE_MAP = {
  sale: "Venta",
  donation: "Donación",
  loan: "Préstamo",
}
const STATUS_MAP = {
  pending: "Pendiente",
  resolved: "Aprobado",
  dismissed: "Rechazado",
}
const REASON_MAP = {
  inappropriate: "Contenido inapropiado",
  spam: "Spam", 
  fake: "Información falsa",
  duplicate: "Duplicado",
  other: "Otro",
}

const ReportView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getSilence, patch, put } = useApi()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [publication, setPublication] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { confirmAction } = useConfirmAction();
  const navState = location.state || {}

  useEffect(() => {
    loadReportAndPublication()
  }, [id])

  const loadReportAndPublication = async () => {
    setLoading(true)
    let reportData = null
    let publicationId = navState.publicationId
    let reason = navState.reason
    let description_report = navState.description_report || ""
    let createdAt = navState.createdAt
    if (!publicationId || !reason || !createdAt) {
      const res = await getSilence(`api/reports/${id}/`)
      if (res.success) {
        reportData = res.data
        publicationId = reportData.publication_id
        reason = reportData.reason
        createdAt = reportData.created_at
      }
    }
    if (publicationId) {
      const pubRes = await getSilence(`api/publications/${publicationId}`)
      if (pubRes.success) {
        setPublication(pubRes.data)
      }
    }
    setReport({
      id,
      reason: reason || navState.reason,
      createdAt: createdAt || navState.createdAt,
      status: reportData?.status || navState.status,
      description: description_report,
    })
    setLoading(false)
  }

  const handleResolve = async (status) => {
    setActionLoading(true)
    if (status === "resolved" && publication) {
      const pubBody = {
        title: publication.title,
        description: publication.description,
        category: publication.category,
        condition: publication.condition,
        publication_type: publication.publication_type,
        keywords: publication.keywords,
        is_active: false,
      };
      if (publication.publication_type === "loan") {
        pubBody.price = null;
        if ("duration" in publication) pubBody.duration = publication.duration;
      } else if (publication.publication_type === "sale") {
        pubBody.price = publication.price;
        if ("duration" in publication) pubBody.duration = null;
      } else if (publication.publication_type === "donation") {
        pubBody.price = null;
        if ("duration" in publication) pubBody.duration = null;
      }
      const putRes = await put(`api/publications/${publication.id}/`, pubBody)

      if (!putRes.success) {
        setActionLoading(false)
        if (window.Swal) {
          await window.Swal.fire({
            icon: 'error',
            title: 'No se pudo aprobar el reporte',
            text: 'Error al desactivar la publicación. No se pudo aprobar el reporte.',
            confirmButtonText: 'Cerrar',
          });
        } else {
          // fallback
          alert("Error al desactivar la publicación. No se pudo aprobar el reporte.")
        }
        return
      }
    }

    const body =
      status === "resolved"
        ? {
            status: "resolved",
            admin_comment: "Problema resuelto, contenido removido",
          }
        : {
            status: "dismissed",
            admin_comment:
              "Problema no se ha detectados, el contenido de la publicación puede permanecer en el sistema",
          }
    const res = await patch(`api/reports/${id}/resolve/`, body)
    setActionLoading(false)
    if (res.success) {
      navigate("/admin/reports")
    }
  }

  const InfoField = ({ label, value, isPill = false }) => {
    const pillStyles = {
      Venta: "bg-blue-100 text-blue-800",
      Donación: "bg-green-100 text-green-800",
      Préstamo: "bg-purple-100 text-purple-800",
      Nuevo: "bg-cyan-100 text-cyan-800",
      Usado: "bg-orange-100 text-orange-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      Aprobado: "bg-green-100 text-green-800",
      Rechazado: "bg-red-100 text-red-800",
    }
    return (
      <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          {isPill ? (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pillStyles[value]}`}>{value}</span>
          ) : (
            value
          )}
        </dd>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={36} width={250} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <Skeleton count={8} height={20} />
          </div>
          <div className="lg:col-span-1 card p-6">
            <Skeleton height={200} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/admin/reports")} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver a la lista de reportes
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detalle del Reporte #{report.id}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{publication?.title || "-"}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Información del objeto y la razón del reporte.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="divide-y divide-gray-200">
                <InfoField label="Razón del Reporte" value={REASON_MAP[report.reason] || report.reason || "-"} />
                <InfoField label="Descripción del Reporte" value={report.description || "-"} />
                <InfoField label="Descripción del Objeto" value={publication?.description || "-"} />
                <InfoField label="Categoría" value={publication?.category_name || "-"} />
                <InfoField label="Tipo de Publicación" value={TYPE_MAP[publication?.publication_type] || "-"} isPill />
                {publication && publication.price !== null && (
                  <InfoField label="Precio" value={`${publication.price} MXN`} />
                )}
                {publication && publication.duration !== null && (
                  <InfoField label="Duración" value={`${publication.duration} días`} />
                )}
                <InfoField label="Fecha del Reporte" value={report.createdAt?.split("T")[0] || "-"} />
              </dl>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn-secondary bg-white"
                disabled={actionLoading}
                onClick={async () => {
                  const confirmed = await confirmAction({
                    title: '¿Rechazar reporte?',
                    text: 'Esta acción marcará el reporte como rechazado. ¿Deseas continuar?',
                    confirmButtonText: 'Sí, rechazar',
                  });
                  if (confirmed) {
                    handleResolve("dismissed")
                  }
                }}
              >
                Rechazar Reporte
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={actionLoading}
                onClick={async () => {
                  const confirmed = await confirmAction({
                    title: '¿Aprobar reporte?',
                    text: 'Esto desactivará la publicación y aprobará el reporte. ¿Deseas continuar?',
                    confirmButtonText: 'Sí, aprobar',
                  });
                  if (confirmed) {
                    handleResolve("resolved")
                  }
                }}
              >
                Aprobar Reporte
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="card">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Imágenes del Objeto</h3>
              <div className="mt-4 space-y-4">
                {publication && (publication.image1 || publication.image2 || publication.image3) ? (
                  [publication.image1, publication.image2, publication.image3].filter(Boolean).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Imagen del objeto reportado ${index + 1}`}
                      className="w-full h-auto rounded-lg object-cover shadow-md"
                    />
                  ))
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-500">No hay imágenes disponibles.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportView
