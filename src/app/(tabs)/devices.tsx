import { EmptyState, Screen } from '@/ui/components';

export default function DevicesScreen() {
  return (
    <Screen>
      <EmptyState
        title="No devices"
        message="Device discovery arrives in the next update. Make sure your phone is on the same Wi-Fi as your TV."
      />
    </Screen>
  );
}
