import { createContext } from 'react';

const context = {
  app: {},
  theme: 'dark',
  updateTheme: () => {},
  getTheme: () => {}
};

const AppContext = createContext(context);

export const AppProvider = AppContext.Provider;
export const AppConsumer = AppContext.Consumer;
