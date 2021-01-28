import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Switch from '@component/Switch';
import Drawer from '@component/drawer/Drawer';
import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';
import DrawerOutlet from '@component/drawer/DrawerOutlet';
import DrawerHandle from '../component/drawer/DrawerHandle';
import { AppProvider } from '@contexts/AppContext';
import OnboardingPage from '@pages/OnboardingPage';
import JustInTime from '@component/JustInTime';
const SETTINGS_DISCLAIMER_KEY = 'app::justInTimeDismissed';


class AuthenticatedPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.mounted = false;
    this.debounce = null;
    this.app = props.context.app;
    this.proxy = this.app.proxy;
    this.adapter = this.app.adapter;
    this.storage = this.app.util.storage;
    this.settings = this.app.util.settings;
    this.regionlist = this.app.util.regionlist;
    const theme = this.app.util.settings.getItem('darkTheme') ? 'dark' : 'light';

    // binding
    this.pollRegions = this.pollRegions.bind(this);
    this.onToggleDrawer = this.onToggleDrawer.bind(this);
    this.onQuickConnect = this.onQuickConnect.bind(this);
    this.toggleTileSaved = this.toggleTileSaved.bind(this);
    this.onToggleConnection = this.onToggleConnection.bind(this);
    this.handleProxyConnection = this.handleProxyConnection.bind(this);
    this.updateFirstRun = this.updateFirstRun.bind(this);
    this.updateTheme = props.context.updateTheme;
    this.getTheme = props.context.getTheme;
    this.getjustInTimeDismissedDismissed = this.getjustInTimeDismissedDismissed.bind(this);
    this.dismissjustInTime = this.dismissjustInTime.bind(this);

    this.state = {
      mode: '',
      error: '',
      pollIteration: 0,
      autoLoading: false,
      enabled: this.proxy.enabled(),
      isAuto: this.regionlist.getIsAuto(),
      tiles: this.storage.getItem('tiles'),
      region: this.regionlist.getSelectedRegion(),
      drawerOpen: this.storage.getItem('drawerState') === 'open',
      firstRun: null,
      context: this.buildContext(theme),
      justInTimeDismissed: JSON.parse(this.getjustInTimeDismissedDismissed()),
    };

    // default tiles
    const defaultTiles = [
      { name: 'RegionTile', saved: true },
      { name: 'Ip', saved: true },
      { name: 'QuickConnect', saved: false },
      { name: 'QuickSettings', saved: false },
      { name: 'BypassRules', saved: false },
      { name: 'Subscription', saved: false },
    ];

    // parse tiles from JSON
    let { tiles } = this.state;

    if (tiles) {
      try { tiles = JSON.parse(tiles); }
      catch (err) { tiles = []; }
    }

    // ensure each tile from storage still exists
    if (tiles && tiles.length) {
      // remove any tiles that don't exist
      tiles = tiles.filter((tile) => {
        return defaultTiles.some((defaultTile) => {
          return tile.name === defaultTile.name;
        });
      });

      // add any new default tiles
      defaultTiles.forEach((defaultTile) => {
        const foundTile = tiles.find((tile) => {
          return tile.name === defaultTile.name;
        });
        if (!foundTile) { tiles.push(defaultTile); }
      });
    }
    // default tile data if no tile data found
    else { tiles = defaultTiles; }

    // check if this is the first time being run
    this.firstRun = this.app.util.settings.getItem('firstRun', true);

    // reset state.tiles
    this.state.tiles = tiles;
    this.state.firstRun = this.firstRun;
  }

  componentDidMount() {
    this.mounted = true;
    const { isAuto } = this.state;
    const autoRegion = this.regionlist.getAutoRegion();

    if (isAuto && !autoRegion) {
      this.setState({ autoLoading: true });
      // this.pollRegions();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onToggleDrawer() {
    const { drawerOpen } = this.state;
    if (drawerOpen) {
      this.storage.setItem('drawerState', 'closed');
      this.adapter.sendMessage('drawerState', 'closed');
    }
    else {
      this.storage.setItem('drawerState', 'open');
      this.adapter.sendMessage('drawerState', 'open');
    }

    this.setState({ drawerOpen: !drawerOpen });
  }

  onToggleConnection() {
    // debounce the calls to the proxy handler by 175ms
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => { this.handleProxyConnection(); }, 175);
  }

  updateFirstRun() {
    const firstRun = this.settings.getItem("firstRun");
    this.setState({ firstRun });
  }

  onQuickConnect(regionId) {
    this.regionlist.setSelectedRegion(regionId);
    const newRegion = this.regionlist.getSelectedRegion();
    this.setState({ mode: 'connecting', region: newRegion });
     this.proxy.enable()
      .then((proxy) => {
        // artificial delay to allow animation to shine
        setTimeout(() => { this.setState({ enabled: this.proxy.enabled(), mode: '' }); }, 500);
      })
      .catch((err) => {
        debug(err);
        this.error = t('UnknownProxyError');
      });
      this.app.util.ipManager.updateByCountry(newRegion);
  }

  handleProxyConnection() {
    this.setState({ mode: 'connecting' });

    const { region, isAuto } = this.state;

    if (this.state.enabled) {
      this.proxy.disable();
    } else {
      if (isAuto) {
        this.regionlist.setSelectedRegion('auto');
      } else {
        this.regionlist.setSelectedRegion(region.id);
      }
      this.app.util.ipManager.updateByCountry(region);
      this.proxy.enable();
    }
    this.setState({ enabled: this.proxy.enabled() });

    // artificial delay to allow animation to shine
    setTimeout(() => {
      if(!this.proxy.enabled()){
        this.incrementIndexConnection()
      }
      this.setState({ enabled: this.proxy.enabled(), mode: '' });
    }, 500);
  }

  pollRegions() {
    if (!this.mounted) { return; }
    // check if there are still server latency checks ongoing
    const regions = this.regionlist.toArray();

    if (!regions.length) {
      this.setState({ autoLoading: true });
      setTimeout(this.pollRegions, 500);
    }
    else {
      const selectedRegion = this.regionlist.getSelectedRegion();
      this.setState({ autoLoading: false, region: selectedRegion });
    }
  }

  toggleTileSaved(name, saved) {
    const { tiles } = this.state;
    const filteredTiles = tiles.filter((tile) => {
      return tile.name !== name;
    });

    filteredTiles.push({ name, saved });

    // save to storage
    this.storage.setItem('tiles', JSON.stringify(filteredTiles));
    this.adapter.sendMessage('tiles', filteredTiles);

    this.setState({ tiles: filteredTiles });
  }

  getjustInTimeDismissedDismissed() {
    const { app: { util: { storage } } } = this;
    const value = storage.getItem(SETTINGS_DISCLAIMER_KEY);

    // if(value == null){
    //   storage.setItem(SETTINGS_DISCLAIMER_KEY,false);
    //   this.setState({justInTimeDismissed:false})
    // }
    return value;
  }


  dismissjustInTime(what) {
    const objValues ={
      settings:{
        value:SETTINGS_DISCLAIMER_KEY,
        objState:{justInTimeDismissed: false}
      }
    }
    const { app: { util: { storage } } } = this;
    storage.setItem(objValues[what].value, false);
    this.setState(() => {
      return objValues[what].objState;
    });
  }

  incrementIndexConnection(){
    let connectionIndex = this.storage.getItem('connectionIndex') ? this.storage.getItem('connectionIndex') : 0;
    connectionIndex = Number(connectionIndex);
    if(connectionIndex == 10){
      this.storage.setItem(SETTINGS_DISCLAIMER_KEY, true);
      this.setState({justInTimeDismissed:true});
    }
    this.storage.setItem('connectionIndex' , connectionIndex += 1);
  }

  buildContext(newTheme) {
    const {
      app,
      updateTheme,
      getTheme,
      updateFirstRun,
      rebuildApp,
    } = this;
 
    return {
      app,
      theme: newTheme,
      updateTheme,
      getTheme,
      updateFirstRun,
      rebuildApp,
    };
  }

  render() {
    let {
      mode,
      tiles,
      // region,
      enabled,
      drawerOpen,
      firstRun,
      autoLoading,
      context,
      justInTimeDismissed
    } = this.state;

    const region = this.regionlist.getSelectedRegion();

    const { context: { theme } } = this.props;
    let { error } = this.state;
    let connection = enabled ? 'connected' : 'disconnected';
    const hasRegions = this.regionlist.hasRegions();
    
    // handle proxy errors
    if (!hasRegions) { error = t('NoRegionSelected'); } // put 'no region' error above all others
    if (error) { connection = 'error'; }
    
    // filter tiles
    const savedTiles = tiles.filter((tile) => { return tile.saved; });
    const unsavedTiles = tiles.filter((tile) => { return !tile.saved; });
    
    //if user los for first time we show him the onboarding page
    if (firstRun) {
      return (
        <AppProvider value={context} >
          <OnboardingPage updateFirstRun= {this.updateFirstRun} />
        </AppProvider>
      );
    }

    let ratingTile = null;
    if(justInTimeDismissed){
      ratingTile = 
        <JustInTime
        whichDisclaimer={'settingDisclaimer'}
        onDismiss={this.dismissjustInTime}
        theme={theme}
      />
    }
    return (
      <div id="authenticated-page" className="row">
        <CompanyLogo mode={mode} error={error} connection={connection} />

        <div className={`connection ${theme}`}>
          <div className={`switch-container ${drawerOpen ? 'closed' : ''}`}>
            <Switch
              mode={mode}
              theme={theme}
              connection={connection}
              onToggleConnection={this.onToggleConnection}
            />
          </div>

          { ratingTile }

          <div className="authenticated-tiles">
            <DrawerOutlet
              region={region}
              tiles={savedTiles}
              drawerOpen={drawerOpen}
              autoLoading={autoLoading}
              toggleTileSaved={this.toggleTileSaved}
              onQuickConnect={this.onQuickConnect}
              mode={mode}
              connection={connection}
            />

            <Drawer
              region={region}
              open={drawerOpen}
              tiles={unsavedTiles}
              autoLoading={autoLoading}
              toggleTileSaved={this.toggleTileSaved}
              onQuickConnect={this.onQuickConnect}
              mode={mode}
              connection={connection}
            />
          </div>
        </div>

        <DrawerHandle theme={theme} open={drawerOpen} onToggleDrawer={this.onToggleDrawer} />
      </div>
    );
  }
}

AuthenticatedPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(AuthenticatedPage);
