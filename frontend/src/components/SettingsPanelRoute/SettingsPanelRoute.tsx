import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { useAccountSettingsPanel } from '../../context/AccountSettingsPanelProvider/AccountSettingsPanelProvider';

/** Abre el panel de ajustes y deja la URL en inicio (marcadores a /settings). */
export function SettingsPanelRoute() {
  const navigate = useNavigate();
  const { openPanel } = useAccountSettingsPanel();

  useEffect(() => {
    openPanel();
    navigate(routePaths.browse, { replace: true });
  }, [navigate, openPanel]);

  return null;
}
