import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";


import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
const queryClient = new QueryClient();

import { Provider } from "react-redux";
import store from "./redux/store";

import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";


import { Toaster } from 'sonner';

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <Toaster richColors />
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>
);