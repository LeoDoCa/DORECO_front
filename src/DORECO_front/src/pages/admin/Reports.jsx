"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Skeleton from "react-loading-skeleton"
import { useApi } from "@hooks/useApi"

// Mapeo de status del backend a los nombres de pestañas y pills del frontend
const STATUS_MAP = {
  pending: "Pendiente",
  resolved: "Aprobado",
  dismissed: "Rechazado",
}
const TAB_TO_STATUS = {
  Pendiente: "pending",
  Aprobado: "resolved",
  Rechazado: "dismissed",
}

const Reports = () => {
  const { get } = useApi()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [activeTab, setActiveTab] = useState("Todos")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (activeTab === "Todos") {
      setFilteredReports(reports)
    } else {
      setFilteredReports(
        reports.filter((report) => report.status === activeTab)
      )
    }
  }, [activeTab, reports])

  const loadReports = async () => {
    setLoading(true)
    // Consultar todos los reportes
    const allRes = await get("api/reports/")
    // Consultar reportes pendientes (opcional, pero útil si el endpoint da info extra)
    // const pendingRes = await get("/reports/pending/")
    let allReports = Array.isArray(allRes.data) ? allRes.data : []
    // Mapear los reportes a la estructura que espera el frontend
    const mapped = allReports.map((r) => ({
      id: r.id,
      objectName: r.publication_title,
      user: r.reported_by_username,
      date: r.created_at.split("T")[0],
      status: STATUS_MAP[r.status] || r.status,
      publicationId: r.publication_id,
      reason: r.reason,
      createdAt: r.created_at,
    }))
    setReports(mapped)
    setLoading(false)
  }

  const getStatusPill = (status) => {
    const colors = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Aprobado: "bg-green-100 text-green-800",
      Rechazado: "bg-red-100 text-red-800",
    }
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`
  }

  const TabButton = ({ name }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`$${
        activeTab === name
          ? "border-primary-500 text-primary-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm`}
    >
      {name}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="mt-1 text-sm text-gray-500">Revisa y gestiona los reportes de objetos enviados por los usuarios.</p>
      </div>

      {/* Pestañas de Filtro */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <TabButton name="Todos" />
          <TabButton name="Pendiente" />
          <TabButton name="Aprobado" />
          <TabButton name="Rechazado" />
        </nav>
      </div>

      {/* Lista de Reportes */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab} ({loading ? "..." : filteredReports.length})
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border-b">
                  <div className="flex-1"><Skeleton height={16} width="40%" /><Skeleton height={12} width="30%" className="mt-1"/></div>
                  <Skeleton height={20} width={80} />
                  <Skeleton height={32} width={100} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.length > 0 ? filteredReports.map((report) => (
                <div key={report.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{report.objectName}</h4>
                    <p className="text-sm text-gray-500">Reportado por: {report.user} • {report.date}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={getStatusPill(report.status)}>{report.status}</span>
                    <Link
                      to={`/admin/reports/${report.id}`}
                      state={{
                        publicationId: report.publicationId,
                        reason: report.reason,
                        createdAt: report.createdAt,
                      }}
                      className="btn-secondary text-sm"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay reportes en la categoría "{activeTab}".</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
