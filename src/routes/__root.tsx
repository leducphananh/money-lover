import type { useAuth } from '@/features/auth/AuthContext';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

interface MyRouterContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.MODE === 'development' && <TanStackRouterDevtools />}
    </>
  ),
});
