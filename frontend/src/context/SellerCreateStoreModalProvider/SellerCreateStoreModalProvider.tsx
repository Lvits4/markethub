import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CreateStoreForm } from '../../components/CreateStoreForm/CreateStoreForm';
import { Modal } from '../../components/Modal/Modal';

type SellerCreateStoreModalContextValue = {
  openCreateStoreModal: () => void;
  closeCreateStoreModal: () => void;
};

const SellerCreateStoreModalContext =
  createContext<SellerCreateStoreModalContextValue | null>(null);

export function SellerCreateStoreModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openCreateStoreModal = useCallback(() => setOpen(true), []);
  const closeCreateStoreModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openCreateStoreModal, closeCreateStoreModal }),
    [openCreateStoreModal, closeCreateStoreModal],
  );

  return (
    <SellerCreateStoreModalContext.Provider value={value}>
      {children}
      <Modal
        open={open}
        onClose={closeCreateStoreModal}
        title="Nueva tienda"
      >
        <CreateStoreForm
          onSuccess={closeCreateStoreModal}
          onCancel={closeCreateStoreModal}
        />
      </Modal>
    </SellerCreateStoreModalContext.Provider>
  );
}

export function useSellerCreateStoreModal() {
  const ctx = useContext(SellerCreateStoreModalContext);
  if (!ctx) {
    throw new Error(
      'useSellerCreateStoreModal debe usarse dentro de SellerCreateStoreModalProvider',
    );
  }
  return ctx;
}
