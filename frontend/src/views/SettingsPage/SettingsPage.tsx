import { AccountSettingsBody } from '../../components/AccountSettingsBody/AccountSettingsBody';

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Ajustes
      </h1>

      <AccountSettingsBody className="mt-8" />
    </div>
  );
}
