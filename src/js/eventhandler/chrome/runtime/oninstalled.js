import createApplyListener from '@helpers/applyListener';

function newVersionNotification(app) {
  const isNewVersion = (newVersionStr, oldVersionStr) => {
    const oldVersion = parseInt(oldVersionStr.replace(/\./g, ''));
    const newVersion = parseInt(newVersionStr.replace(/\./g, ''));
    return newVersion > oldVersion;
  };

  const notify = async (details) => {
    await app.util.i18n.worker();
    const type = 'basic';
    const title = t('ExtensionUpdated');
    const message = t('WelcomeToNewVersion', { appVersion: `v${app.buildinfo.version}` });
    const iconUrl = chrome.extension.getURL('images/icons/icon64.png');
    if (isNewVersion(app.buildinfo.version, details.previousVersion)) {
      chrome.notifications.create('UpdateMessage', {
        type,
        title,
        iconUrl,
        message,
      });
    }
  };

  return (details) => {
    if (details.reason === 'update') {
      notify(details);
    }
  };
}

export default createApplyListener((app, addListener) => {
  addListener(newVersionNotification(app));
});
