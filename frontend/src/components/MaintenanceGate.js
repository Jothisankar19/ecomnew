import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../utils/api';
import LoadingScreen from './ui/LoadingScreen';
import MaintenancePage from '../pages/MaintenancePage';

const MaintenanceGate = () => {
  const [maintenance, setMaintenance] = useState(null);
  const [checking, setChecking] = useState(true);

  const fetchMaintenance = () => {
    api.get('/settings/maintenance')
      .then(({ data }) => setMaintenance(data.maintenance || { enabled: false }))
      .catch(() => setMaintenance({ enabled: false }))
      .finally(() => setChecking(false));
  };

  useEffect(() => {
    fetchMaintenance();
    const interval = setInterval(fetchMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking) return <LoadingScreen />;

  if (maintenance?.enabled) {
    return <MaintenancePage config={maintenance} />;
  }

  return <Outlet />;
};

export default MaintenanceGate;
