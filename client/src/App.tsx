import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import Router from './Router';
import Header from './pages/Header/views/Header';
import Container from '@mui/material/Container';
import { store } from './common/store/RootStore';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Carousel from './pages/Main/components/Carousel';
import { ErrorBoundary } from 'react-error-boundary';
import Fallback from './common/components/Fallback';

function App() {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Carousel />
                    <Container maxWidth="lg">
                      <Router />
                    </Container>
                  </>
                }
              />
              <Route
                path="/*"
                element={
                  <Container maxWidth="lg" style={{ paddingTop: '4.5rem' }}>
                    <Router />
                  </Container>
                }
              />
            </Routes>
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
