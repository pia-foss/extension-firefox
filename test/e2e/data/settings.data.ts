interface SettingData {
  sectionName: string;
  settingName: string;
  settingID: string;
  expectedDefault: boolean;
}

function createData(): SettingData[] {
  return [
    {
      sectionName: 'privacy',
      settingName: 'disableNetworkPrediction',
      settingID: 'blocknetworkprediction',
      expectedDefault: true,
    },
    {
      sectionName: 'security',
      settingName: 'preventWebRtcLeak',
      settingID: 'preventwebrtcleak',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'disableWebsiteReferrer',
      settingID: 'blockreferer',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'fingerprintProtection',
      settingID: 'fingerprintprotection',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'disableHyperLinkAuditing',
      settingID: 'blockhyperlinkaudit',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'removeUtmParameters',
      settingID: 'blockutm',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'piaMace',
      settingID: 'maceprotection',
      expectedDefault: true,
    },
    {
      sectionName: 'extension',
      settingName: 'logoutOnClose',
      settingID: 'logoutOnClose',
      expectedDefault: false,
    },
    {
      sectionName: 'extension',
      settingName: 'debugMode',
      settingID: 'debugmode',
      expectedDefault: false,
    },
  ];
}

export { createData, SettingData };
