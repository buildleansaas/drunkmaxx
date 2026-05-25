import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AppShell() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  if (!clerkPublishableKey) {
    return <AppShell />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppShell />
    </ClerkProvider>
  );
}
