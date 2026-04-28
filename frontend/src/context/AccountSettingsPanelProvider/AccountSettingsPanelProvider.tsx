import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { MarketAccountSettingsDrawer } from '../../components/MarketAccountSettingsDrawer/MarketAccountSettingsDrawer';

type AccountSettingsPanelContextValue = {
  openPanel: () => void;
  closePanel: () => void;
};

const AccountSettingsPanelContext =
  createContext<AccountSettingsPanelContextValue | null>(null);

export function AccountSettingsPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openPanel, closePanel }),
    [openPanel, closePanel],
  );

  return (
    <AccountSettingsPanelContext.Provider value={value}>
      {children}
      <MarketAccountSettingsDrawer
        open={open}
        onClose={closePanel}
        onLogoutSuccess={closePanel}
      />
    </AccountSettingsPanelContext.Provider>
  );
}

export function useAccountSettingsPanel() {
  const ctx = useContext(AccountSettingsPanelContext);
  if (!ctx) {
    throw new Error(
      'useAccountSettingsPanel debe usarse dentro de AccountSettingsPanelProvider',
    );
  }
  return ctx;
}
