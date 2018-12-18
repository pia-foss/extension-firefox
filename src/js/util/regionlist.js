import http from 'helpers/http';
import { Type, Target } from 'helpers/messaging';

class RegionList {
  constructor(app, foreground) {
    this.app = app;
    this.foreground = foreground;
    this.synced = false;
    this.syncing = false;
    this.regionMap = new Map();
    chrome.alarms.create('PollRegionList', { delayInMinutes: 30, periodInMinutes: 30 });

    // bindings
    this.testHost = this.testHost.bind(this);
    this.testPort = this.testPort.bind(this);
    this.getPotentialHosts = this.getPotentialHosts.bind(this);
    this.getPotentialPorts = this.getPotentialPorts.bind(this);
    this.hasRegions = this.hasRegions.bind(this);
    this.toArray = this.toArray.bind(this);
    this.isSelectedRegion = this.isSelectedRegion.bind(this);
    this.getSelectedRegion = this.getSelectedRegion.bind(this);
    this.setSelectedRegion = this.setSelectedRegion.bind(this);
    this.sync = this.sync.bind(this);
    this.import = this.import.bind(this);
    this.export = this.export.bind(this);
    this.setFavoriteRegion = this.setFavoriteRegion.bind(this);
    this.resetFavoriteRegions = this.resetFavoriteRegions.bind(this);
    this.getPotentialRegions = this.getPotentialRegions.bind(this);
  }

  /**
   * Test to see if the provided host is potentially used w/ active proxy
   *
   * @param {string} host The host to test
   */
  testHost(host) {
    return this.getPotentialHosts().includes(host);
  }

  /**
   * Test to see if the provided port is potentially used w/ active proxy
   *
   * @param {number} port The port to test
   */
  testPort(port) {
    return this.getPotentialPorts().includes(port);
  }

  /**
   * Get a list of hosts that are potentially being used for the active proxy connection
   */
  getPotentialHosts() {
    return this.getPotentialRegions()
      .map((r) => { return r.host; });
  }

  /**
   * Get a list of ports that are potentially being used for the active proxy connection
   */
  getPotentialPorts() {
    const { util: { settings } } = this.app;
    const key = settings.getItem('maceprotection') ? 'macePort' : 'port';

    return this.getPotentialRegions()
      .map((r) => { return r[key]; });
  }

  getPotentialRegions() {
    let regions;
    const { util: { storage } } = this.app;
    const fromStorage = storage.getItem('region');
    const fromMemory = this.toArray();
    if (fromStorage) {
      const storageRegion = JSON.parse(fromStorage);
      const filtered = fromMemory.filter((r) => { return r.id !== storageRegion.id; });
      regions = [...filtered, storageRegion];
    }
    else {
      regions = fromMemory;
    }

    return regions;
  }

  hasRegions() {
    return !!this.regionMap.size;
  }

  toArray() {
    return Array.from(this.regionMap.values());
  }

  isSelectedRegion(region) {
    return this.getSelectedRegion().id === region.id;
  }

  /*
    NOTE: we keep an on-disk copy of the last selected region,
    incase this method is called when the region list has
    not synced.
  */
  getSelectedRegion() {
    const { storage } = this.app.util;
    let selectedRegion;

    // check in memory
    selectedRegion = this.toArray().find((region) => { return region.active; });
    // check in storage
    if (!selectedRegion) {
      selectedRegion = Object.assign(
        {},
        JSON.parse(storage.getItem('region')),
        {
          localizedName() {
            return RegionList.createLocalizedName(selectedRegion.id, selectedRegion);
          },
        },
      );
    }

    return selectedRegion;
  }

  async setSelectedRegion(id, bridged) {
    const {
      util: { storage },
      adapter,
    } = this.app;
    const region = this.regionMap.get(id);
    if (bridged) { storage.setItem('activeproxy', id); }
    if (region) {
      this.toArray().forEach((currentRegion) => {
        const thisRegion = currentRegion;
        thisRegion.active = false;
      });
      region.active = true;
      storage.setItem('activeproxy', region.id);
      storage.setItem('region', JSON.stringify(region));
      if (!bridged) { await adapter.sendMessage(Type.SET_SELECTED_REGION, { id: region.id }); }
    }
  }

  async sync() {
    const {
      util: { storage, bypasslist },
      adapter,
      target,
    } = this.app;
    this.syncing = true;
    let favoriteRegions = storage.getItem('favoriteregions');
    if (favoriteRegions) { favoriteRegions = favoriteRegions.split(','); }
    else { favoriteRegions = []; }
    RegionList.debug('start sync');
    try {
      const response = await http.get(
        'https://www.privateinternetaccess.com/api/client/services/https',
        { timeout: 5000 },
      );
      this.regionMap.clear();
      const json = await response.json();
      Object.keys(json).forEach((regionID) => {
        const region = RegionList.createRegion(regionID, json[regionID]);
        if (favoriteRegions.includes(regionID)) { region.isFavorite = true; }
        this.regionMap.set(regionID, region);
      });
      await this.setSelectedRegion(storage.getItem('activeproxy') || RegionList.defaultRegionID);
      this.syncing = false;
      this.synced = true;
      bypasslist.updatePingGateways();
      // NOTE: Rather than using the "briged" pattern, we should move to this.
      if (target === Target.BACKGROUND) {
        adapter.sendMessage(Type.IMPORT_REGIONS, this.export());
      }
      debug('regionlist.js: sync ok');

      return response;
    }
    catch (err) {
      this.syncing = false;
      this.synced = false;
      RegionList.debug(err);
      return err;
    }
  }

  import(regions) {
    if (!regions || !Array.isArray(regions)) { return; }
    this.regionMap.clear();
    regions.forEach((region) => {
      const newRegion = RegionList.createRegion(region.id, region);
      this.regionMap.set(region.id, newRegion);
    });

    this.syncing = false;
    this.synced = true;
    this.app.util.bypasslist.updatePingGateways();
  }

  export() {
    return Array.from(this.regionMap.values())
      .map((region) => {
        return {
          id: region.id,
          name: region.name,
          iso: region.iso,
          dns: region.host,
          port: region.port,
          mace: region.macePort,
        };
      });
  }

  setFavoriteRegion(region, bridged) {
    const {
      util: { storage },
      adapter,
    } = this.app;

    // get this region from regionMap
    let regionId = '';
    if (typeof region === 'string') { regionId = region; }
    else { regionId = region.id; }

    // alert background page if not bridged
    if (!bridged) { adapter.sendMessage(Type.SET_FAVORITE_REGION, regionId); }

    // get this region isFavorite
    let isFavorite = false;
    const memRegion = this.toArray().find((r) => { return r.id === regionId; });
    ({ isFavorite } = memRegion);

    // get current favorite regions from storage
    let currentFavs = storage.getItem('favoriteregions');
    if (currentFavs) { currentFavs = currentFavs.split(','); }
    else { currentFavs = []; }

    // update favorite regions in storage
    if (!isFavorite) {
      currentFavs.push(regionId);
      const favs = [...new Set(currentFavs)];
      storage.setItem('favoriteregions', favs.join(','));
    }
    else {
      currentFavs = currentFavs.filter((fav) => { return fav !== regionId; });
      storage.setItem('favoriteregions', currentFavs.join(','));
    }

    // update in memory region
    memRegion.isFavorite = !memRegion.isFavorite;

    return region;
  }

  resetFavoriteRegions(regions) {
    const {
      util: { storage },
    } = this.app;

    storage.setItem('favoriteregions', regions);

    if (regions) {
      regions.split(',').forEach((region) => {
        const memRegion = this.toArray().find((r) => { return r.id === region.id; });
        if (memRegion) { memRegion.isFavorite = !memRegion.isFavorite; }
      });
    }
  }

  static get defaultRegionID() {
    return 'us_new_york_city';
  }

  static createLocalizedName(regionID, region) {
    const name = t(regionID);
    return name.length > 0 ? name : region.name;
  }

  static createRegion(regionID, region) {
    return {
      scheme: 'https',
      id: regionID,
      name: region.name,
      iso: region.iso,
      host: region.dns,
      port: region.port,
      macePort: region.mace,
      flag: `/images/flags/${region.iso}_icon_64.png`,
      active: false,
      latency: 0,
      offline: false,
      isFavorite: false,
      localizedName() {
        return RegionList.createLocalizedName(regionID, region);
      },
    };
  }

  static debug(msg, err) {
    const debugMsg = `regionlist.js: ${msg}`;
    debug(debugMsg);
    if (err) {
      const errMsg = `regionlist.js error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`;
      debug(errMsg);
    }
    return new Error(debugMsg);
  }
}

export default RegionList;
