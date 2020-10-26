function construct(path) {
  const Constructor = jest.requireMock(path).default;
  return new Constructor();
}

function createMockApp() {
  const app = {};

  // util
  app.util = {};
  app.util.httpsUpgrade = construct('@util/https-upgrade');
  const storage = construct('@util/storage');
  storage.map = new Map();
  storage.getItem.mockImplementation((key) => {
    return storage.map.get(key);
  });
  app.util.storage = storage;
  const settings = construct('@util/settings');
  settings.map = new Map();
  settings.getItem.mockImplementation((key) => {
    return settings.map.get(key);
  });
  app.util.settings = settings;

  return app;
}

export default createMockApp;
