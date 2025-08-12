import { useState, useEffect } from "react";
import { useAuth } from "@config/context/auth-context";
import Skeleton from "react-loading-skeleton";
import { useApi } from "@hooks/useApi";

const BarChartIcon = (
  <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M4 20v-6m6 6v-10m6 10v-4" />
    <path strokeWidth="4" d="M3 20h18" />
  </svg>
);

const UsersIcon = (
  <svg className="w-10 h-10" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="#1e3a8a">
      <circle cx="32" cy="20" r="8" />
      <path d="M20 40c0-6.6 5.4-12 12-12s12 5.4 12 12v4H20v-4z" />

      <circle cx="16" cy="24" r="6" />
      <path d="M8 40c0-5.3 4.3-9.6 9.6-9.6S27.2 34.7 27.2 40v3H8v-3z" />

      <circle cx="48" cy="24" r="6" />
      <path d="M36.8 40c0-5.3 4.3-9.6 9.6-9.6S56 34.7 56 40v3H36.8v-3z" />
    </g>
  </svg>
);

const FlagIcon = (
  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14m0-14h12l-2 5 2 5H5" />
  </svg>
);

const ClockIcon = (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HeartIcon = (
  <svg className="mx-auto h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
);

const CashIcon = (
  <svg className="mx-auto h-8 w-8 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M12 2v20M17 5H9a3 3 0 000 6h6a3 3 0 010 6H7"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StatCard = ({ title, value, icon, color = "blue" }) => (
  <div className="card bg-white shadow-sm rounded-lg p-4">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="text-xl font-bold text-gray-900">{value ?? <Skeleton width={50} />}</dd>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { getSilence } = useApi();
  const [stats, setStats] = useState({
    totalPublicaciones: null,
    totalUsuarios: null,
    reportesPendientes: null,
    prestados: null,
    donados: null,
    vendidos: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getSilence("api/users/statistics/");
      if (res.success && res.data) {
        setStats({
          totalPublicaciones: res.data.total_active_publications,
          totalUsuarios: res.data.total_users,
          reportesPendientes: res.data.pending_reports,
          prestados: res.data.total_loaned,
          donados: res.data.total_donated,
          vendidos: res.data.total_sold,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.name || user?.email}</h1>
        <p className="mt-1 text-sm text-gray-500">Aquí tienes un resumen de tu actividad en DORECO</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total de publicaciones" value={stats.totalPublicaciones} icon={BarChartIcon} color="white"/>
        <StatCard title="Total de usuarios" value={stats.totalUsuarios} icon={UsersIcon} color="white"/>
        <StatCard title="Reportes pendientes" value={stats.reportesPendientes} icon={FlagIcon} color="red" />
        <StatCard title="Objetos prestados" value={stats.prestados} icon={ClockIcon} color="blue" />
        <StatCard title="Objetos donados" value={stats.donados} icon={HeartIcon} color="green" />
        <StatCard title="Objetos vendidos" value={stats.vendidos} icon={CashIcon} color="yellow" />
      </div>
    </div>
  );
};

export default Dashboard;