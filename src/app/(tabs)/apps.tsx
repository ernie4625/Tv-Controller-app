import { EmptyState, Screen } from '@/ui/components';

export default function AppsScreen() {
  return (
    <Screen>
      <EmptyState
        title="No apps yet"
        message="Connect to a device on the Devices tab to see its installed apps here."
      />
    </Screen>
  );
}
