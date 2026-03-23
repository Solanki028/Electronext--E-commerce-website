'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: { fontFamily: 'Inter, system-ui, sans-serif' },
        }}
      />
    </Provider>
  );
}
