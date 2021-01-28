import http from '@helpers/http';
import { Type } from '@helpers/messaging';

const OVERRIDE_KEY = 'regionlist::override';
const FAVORITE_REGIONS_KEY = 'favoriteregions';
const defaultRegions = require('../data/regions.json');

class RegionList {
  constructor(app, foreground) {
    // bindings
    this.testHost = this.testHost.bind(this);
    this.testPort = this.testPort.bind(this);
    this.getPotentialHosts = this.getPotentialHosts.bind(this);
    this.getPotentialPorts = this.getPotentialPorts.bind(this);
    this.getPort = this.getPort.bind(this);
    this.getPotentialRegions = this.getPotentialRegions.bind(this);
    this.initialOverrideRegions = this.initialOverrideRegions.bind(this);
    this.addOverrideRegion = this.addOverrideRegion.bind(this);
    this.updateOverrideRegion = this.updateOverrideRegion.bind(this);
    this.removeOverrideRegion = this.removeOverrideRegion.bind(this);
    this.getOverrideArray = this.getOverrideArray.bind(this);
    this.updateRegion = this.updateRegion.bind(this);
    this.hasRegions = this.hasRegions.bind(this);
    this.hasRegion = this.hasRegion.bind(this);
    this.getRegion = this.getRegion.bind(this);
    this.getRegions = this.getRegions.bind(this);
    this.getIsAuto = this.getIsAuto.bind(this);
    this.setIsAuto = this.setIsAuto.bind(this);
    this.getFastestRegion = this.getFastestRegion.bind(this);
    this.getAutoRegion = this.getAutoRegion.bind(this);
    this.setAutoRegion = this.setAutoRegion.bind(this);
    this.toArray = this.toArray.bind(this);
    this.isSelectedRegion = this.isSelectedRegion.bind(this);
    this.getSelectedRegion = this.getSelectedRegion.bind(this);
    this.setSelectedRegion = this.setSelectedRegion.bind(this);
    this.sync = this.sync.bind(this);
    this.setFavoriteRegion = this.setFavoriteRegion.bind(this);
    this.resetFavoriteRegions = this.resetFavoriteRegions.bind(this);
    this.import = this.import.bind(this);
    this.export = this.export.bind(this);
    this.importAutoRegion = this.importAutoRegion.bind(this);
    this.exportAutoRegion = this.exportAutoRegion.bind(this);
    this.setDefaultRegions = this.setDefaultRegions.bind(this);
    this.getRegionById = this.getRegionById.bind(this);
    this.selectedRegionSmartLoc = null;

    // init
    this.app = app;
    this.storage = app.util.storage;
    this.foreground = foreground;
    this.normalRegions = {};
    this.overrideRegions = this.initialOverrideRegions(this.storage);
    this.defaultRegions = defaultRegions;


    // set isAuto property based on localStorage
    const isAutoString = this.app.util.storage.getItem('autoRegion');
    const region = this.app.util.storage.getItem('region');
    if (isAutoString === 'true') { this.isAuto = true; }
    else if (!isAutoString && !region) { this.isAuto = true; }
    else { this.isAuto = false; }

    // poll for new regions every 30 minutes
    this.setDefaultRegions();
    chrome.alarms.create('PollRegionList', { delayInMinutes: 30, periodInMinutes: 60 });
  }

  // --------------------- Auth Tests --------------------- //

  /**
   * Test to see if the provided host is potentially used w/ active proxy
   *
   * @param {string} host The host to test
   */
  testHost(host) {
    return this.getPotentialHosts().includes(host);
  }

  getRegionById(id){
    if(id){
      return Object.values(this.getRegions()).filter(v=>v.id === id)[0]
    }
  }

  setDefaultRegions() {
    const { util: { storage } } = this.app;

    // keep track of current favorite regions
    let favoriteRegions = storage.getItem('favoriteregions');
    if (favoriteRegions) { favoriteRegions = favoriteRegions.split(','); }
    else { favoriteRegions = []; }

    // clear current region data
    this.normalRegions = {};

    // replace with new data from server
    Object.keys(defaultRegions).forEach((regionID) => {
      const region = RegionList.createNormalRegion(regionID, defaultRegions[regionID]);
      if (favoriteRegions.includes(region.id)) { region.isFavorite = true; }
      this.normalRegions[region.id] = region;
    });
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

  getPort(){
    const { util: { settings } } = app;
    const key = settings.getItem('maceprotection') ? 'macePort' : 'port';
    return key;
  }

  getPotentialRegions() {
    let regions;
    const { util: { storage } } = this.app;
    const fromStorage = storage.getItem('region');
    const fromMemory = this.getRegions();
    if (fromStorage) {
      const storageRegion = JSON.parse(fromStorage);
      regions = Object.assign({}, fromMemory, {
        [storageRegion.id]: storageRegion,
      });
    }
    else {
      regions = fromMemory;
    }

    return Object.values(regions);
  }

  // --------------------- Override Regions ----------------------- //

  initialOverrideRegions() {
    let overrideRegions;
    const fromStorage = this.storage.getItem(OVERRIDE_KEY);
    if (fromStorage) {
      overrideRegions = {};
      const fromStorageMap = JSON.parse(fromStorage);
      Object.keys(fromStorageMap).forEach((id) => {
        overrideRegions[id] = RegionList.localize(fromStorageMap[id]);
      });
    }
    else {
      overrideRegions = {};
      this.storage.setItem(OVERRIDE_KEY, JSON.stringify(overrideRegions));
    }
    return overrideRegions;
  }

  async addOverrideRegion({ name, host, port }, stopPropagation) {
    const { app: { adapter } } = this;
    try {
      const region = RegionList.createOverrideRegion({ name, host, port });
      this.updateOverrideRegion(region);
      if (!stopPropagation) {
        adapter.sendMessage(Type.ADD_OVERRIDE_REGION, { name, host, port });
      }
    }
    catch (err) {
      const msg = err.message || err;
      debug(msg);
      throw err;
    }
  }

  updateOverrideRegion(region) {
    if (!region.override || !region.id) {
      throw new Error('invalid region');
    }
    this.overrideRegions[region.id] = region;
    this.storage.setItem(OVERRIDE_KEY, JSON.stringify(this.overrideRegions));
  }

  async removeOverrideRegion(name, stopPropagation) {
    const { app: { adapter } } = this;
    let wasSelected = false;
    const id = RegionList.createOverrideID(name);
    const region = this.overrideRegions[id];
    delete this.overrideRegions[id];
    if (region && region.active) {
      wasSelected = true;
      let toSelect = this.getFastestRegion();
      if (!toSelect) {
        ([toSelect] = this.getRegions());
      }
      if (toSelect) {
        this.setSelectedRegion(this.getFastestRegion().id);
      }
    }
    this.storage.setItem(OVERRIDE_KEY, JSON.stringify(this.overrideRegions));

    if (!stopPropagation) {
      adapter.sendMessage(Type.REMOVE_OVERRIDE_REGION, name);
    }

    return wasSelected;
  }

  getOverrideArray() {
    return Object.values(this.overrideRegions);
  }

  // --------------------- General --------------------- //

  updateRegion(region) {
    if (region.override) {
      this.updateOverrideRegion(region);
    }
    else {
      this.normalRegions[region.id] = region;
    }
  }

  /**
  * Returns whether there are regions in memory
  */
  hasRegions() {
    return !!this.toArray().length;
  }

  hasRegion(id) {
    return !!this.getRegion(id);
  }

  getRegion(id) {
    return this.getRegions()[id];
  }

  getRegions() {
    return Object.assign({}, this.normalRegions, this.overrideRegions);
  }

  /**
   * Returns the isAuto flag, this determines whether the extension is in 'auto' mode
   */
  getIsAuto() {
    return this.isAuto;
  }

  /**
   * Sets the given value to isAuto and saves that value to localStorage
   */
  setIsAuto(value) {
    this.isAuto = value;
    this.app.util.storage.setItem('autoRegion', value);
  }

  /**
   * Calculates the fastest region given current latency times.
   * Can return undefined if no regions exists.
   */
  getFastestRegion() {
    if (!this.hasRegions()) { return undefined; }
    const regions = this.toArray();
    const { regionsorter } = this.app.util;
    const sorted = regionsorter.latencySort(regions);
    return sorted[0];
  }

  /**
   * Returns the 'auto' region, the fastest region based on latency
   */
  getAutoRegion() {
    this.setAutoRegion(this.getFastestRegion());
    return this.autoRegion;
  }

  /**
   * Sets autoRegion to an immutable copy of given region value.
   */
  setAutoRegion(region, stopPropagation) {
    this.autoRegion = Object.assign({}, region);

    // send to background the new autoRegion
    const { adapter } = this.app;
    if (!stopPropagation) {
      adapter.sendMessage(Type.IMPORT_AUTO_REGION, this.exportAutoRegion());
    }
  }

  /**
   * Iterates through the regionMap and sets the active property to false for all regions.
   */
  clearActive() {
    this.toArray().forEach((currentRegion) => {
      const thisRegion = currentRegion;
      thisRegion.active = false;
    });
  }

  toArray() {
    return Object.values(this.getRegions());
  }

  isSelectedRegion(region) {
    if (!this.getSelectedRegion()) { return false; }
    return this.getSelectedRegion().id === region.id;
  }

  /*
    NOTE: we keep an on-disk copy of the last selected region,
    incase this method is called when the region list has
    not synced.
  */
  getSelectedRegion() {
    let selectedRegion;
    let storageRegion;

    // check if auto region is used
    if (this.getIsAuto()) { selectedRegion = this.getAutoRegion(); }

    // look for active region in memory
    if (!selectedRegion) {
      selectedRegion = this.toArray().find((region) => { return region.active; });
    }

    // look for active region in localStorage
    if (!selectedRegion) { storageRegion = this.storage.getItem('region'); }
    if (!selectedRegion && storageRegion) {
      try {
        selectedRegion = RegionList.localize(JSON.parse(storageRegion));
      }
      catch (_) { /* noop */ }
    }
    const region = this.selectedRegionSmartLoc ? Object.values(this.getRegions()).filter(v=>v.id === this.selectedRegionSmartLoc.id) : [];
    selectedRegion = region.length > 0 ? region[0] : selectedRegion;
    // selectedRegion can be undefined if there are no regions

    return selectedRegion;
  }

  async setSelectedRegion(id, stopPropagation) {
    let selectedRegion;
    const clearRegion = (r) => { this.updateRegion(Object.assign({}, r, { active: false })); };
    const activeRegions = this.toArray().filter((r) => { return r.active; });
    activeRegions.forEach(clearRegion);

    if (id === 'auto') {
      this.setIsAuto(true);
      selectedRegion = this.getAutoRegion();
    }
    else {
      this.setIsAuto(false);
      selectedRegion = this.getRegion(id);
      if (!selectedRegion) { throw new Error(`no such region with id ${id}`); }

      // Set new region active
      this.updateRegion(Object.assign({}, selectedRegion, { active: true }));
    }
    
    this.app.util.storage.setItem('region', JSON.stringify(selectedRegion));

    this.app.util.storage.setItem('region', JSON.stringify(selectedRegion));

    if (!stopPropagation) {
      await this.app.adapter.sendMessage(Type.SET_SELECTED_REGION, { id });
    }
  }

  async sync() {
    const { util: { storage, bypasslist, latencymanager }, adapter } = this.app;

    // keep track of current favorite regions
    let favoriteRegions = storage.getItem(FAVORITE_REGIONS_KEY);
    if (favoriteRegions) { favoriteRegions = favoriteRegions.split(','); }
    else { favoriteRegions = []; }

    RegionList.debug('start sync');

    try {
      // get latest regions from server
      const url = 'https://www.privateinternetaccess.com/api/client/services/https';
      const response = await http.get(url, { timeout: 5000 });
      const json = await response.json();

      // clear current region data
      this.normalRegions = {};

      // replace with new data from server
      Object.keys(json).forEach((regionID) => {
        const region = RegionList.createNormalRegion(regionID, json[regionID]);
        if (favoriteRegions.includes(region.id)) { region.isFavorite = true; }
        this.normalRegions[region.id] = region;
      });

      // update bypasslist with new dns records
      bypasslist.updatePingGateways();

      // update region latency
      await latencymanager.run();

      adapter.sendMessage(Type.IMPORT_REGIONS, this.export());

      // set new auto region
      this.setAutoRegion(this.getFastestRegion());

      // if auto mode and proxy is on, just connect to the new auto region
      if (this.getIsAuto() && this.app.proxy.enabled()) {
        await this.app.proxy.enable();
      }

      RegionList.debug('sync ok');

      return response;
    }
    catch (err) {
      RegionList.debug('sync error', err);
      return err;
    }
  }

  /**
   * Toggle whether or not the provided region is favorited
   *
   * @param {*|string} region Provided region to toggle
   */
  setFavoriteRegion(region, bridged) {
    const { util: { storage }, adapter } = this.app;

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
    let currentFavs = storage.getItem(FAVORITE_REGIONS_KEY);
    if (currentFavs) { currentFavs = currentFavs.split(','); }
    else { currentFavs = []; }

    // update favorite regions in storage
    if (!isFavorite) {
      currentFavs.push(regionId);
      const favs = [...new Set(currentFavs)];
      storage.setItem(FAVORITE_REGIONS_KEY, favs.join(','));
    }
    else {
      currentFavs = currentFavs.filter((fav) => { return fav !== regionId; });
      storage.setItem(FAVORITE_REGIONS_KEY, currentFavs.join(','));
    }

    // update in memory region
    this.updateRegion(Object.assign({}, memRegion, { isFavorite: !isFavorite }));
  }

  // ------------------------ Firefox ------------------------- //
  // ---------------------------------------------------------- //
  //    The following methods are used by the mockApp system    //
  // ---------------------------------------------------------- //

  resetFavoriteRegions(regions) {
    const { util: { storage } } = this.app;
    storage.setItem(FAVORITE_REGIONS_KEY, regions);

    if (regions) {
      regions.split(',').forEach((region) => {
        const memRegion = this.getRegion(region.id);
        if (memRegion) {
          this.updateRegion(Object.assign({}, memRegion, { isFavorite: !memRegion.isFavorite }));
        }
      });
    }
  }

  import(regions) {
    if (!regions || !Array.isArray(regions)) { return; }
    regions.forEach((region) => {
      this.updateRegion(RegionList.localize(region));
    });
    this.app.util.bypasslist.updatePingGateways();
  }

  export() {
    // Important to use ALL regions (override regions will override normal regions in toArray)
    return [...Object.values(this.overrideRegions), ...Object.values(this.normalRegions)]
      .map((region) => {
        // strip non-serializable properties
        return JSON.parse(JSON.stringify(region));
      });
  }

  importAutoRegion(autoRegion) {
    if (!autoRegion) { return; }
    this.setAutoRegion(RegionList.createNormalRegion(autoRegion.id, autoRegion), true);
  }

  exportAutoRegion() {
    if (!this.autoRegion) { return undefined; }
    return {
      id: this.autoRegion.id,
      ping: this.autoRegion.ping,
      name: this.autoRegion.name,
      iso: this.autoRegion.iso,
      dns: this.autoRegion.host,
      port: this.autoRegion.port,
      macePort: this.autoRegion.macePort,
      latency: this.autoRegion.latency,
    };
  }

  // -------------------- Static ----------------------- //

  static createOverrideID(name) {
    return `override::${name.trim().toLowerCase()}`.replace(' ', '_');
  }

  static createNormalRegion(regionID, region) {
    return RegionList.localize({
      scheme: 'https',
      id: regionID,
      ping: region.ping,
      name: region.name,
      iso: region.iso,
      host: region.dns,
      port: region.port,
      macePort: region.mace,
      flag: `/images/flags/${region.iso}_icon_64.png`,
      active: false,
      latency: region.latency || 'PENDING',
      offline: false,
      isFavorite: false,
      override: false,
    });
  }

  static createOverrideRegion({ name, host, port }) {
    if (!name) { throw new Error('name must not be empty'); }
    if (!host) { throw new Error('host must not be empty'); }
    if (typeof port !== 'number') { throw new Error('port must be a number'); }
    if (port < 0 || port > 65535) { throw new Error('invalid port range'); }
    const lowerCaseName = name.toLowerCase();
    return RegionList.localize({
      id: RegionList.createOverrideID(lowerCaseName),
      override: true,
      name: lowerCaseName,
      host,
      ping: host,
      port,
      ping: host,
      macePort: port,
      iso: 'OR',
      scheme: 'https',
      active: false,
      latency: 'PENDING',
      offline: false,
      isFavorite: true,
      flag: 'images/flags/override_icon_64.png',
    });
  }

  static localize(region) {
    const localized = Object.assign({}, region, {
      localizedName() {
        if (localized.id.includes('override::')) {
          return localized.name;
        }
        const name = t(localized.id);
        return name.length > 0 ? name : localized.name;
      },
    });

    return localized;
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
