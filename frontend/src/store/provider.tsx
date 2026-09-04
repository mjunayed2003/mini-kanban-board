'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './index';
import { initAuth } from './slices/authSlice';

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
