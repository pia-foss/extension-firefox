import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Switch from '@component/Switch';
import Drawer from '@component/drawer/Drawer';
import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';
import DrawerOutlet from '@component/drawer/DrawerOutlet';
import DrawerHandle from '../component/drawer/DrawerHandle';


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
    };

    // binding
    this.pollRegions = this.pollRegions.bind(this);
    this.onToggleDrawer = this.onToggleDrawer.bind(this);
    this.onQuickConnect = this.onQuickConnect.bind(this);
    this.toggleTileSaved = this.toggleTileSaved.bind(this);
    this.onToggleConnection = this.onToggleConnection.bind(this);
    this.handleProxyConnection = this.handleProxyConnection.bind(this);

    // default tiles
    const defaultTiles = [
      { name: 'RegionTile', saved: true },
      { name: 'QuickConnect', saved: false },
      { name: 'Subscription', saved: false },
      { name: 'QuickSettings', saved: false },
      { name: 'BypassRules', saved: false },
      { name: 'Ip', saved: false },
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

    // reset state.tiles
    this.state.tiles = tiles;
  }

  componentDidMount() {
    this.mounted = true;
    const { isAuto } = this.state;
    const autoRegion = this.regionlist.getAutoRegion();

    if (isAuto && !autoRegion) {
      this.setState({ autoLoading: true });
      this.pollRegions();
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
      this.setState({ enabled: this.proxy.enabled(), mode: '' });
    }, 500);
  }

  pollRegions() {
    if (!this.mounted) { return; }

    // check if there are still server latency checks ongoing
    const { pollIteration } = this.state;
    const regions = this.regionlist.toArray();
    const repoll = regions.some((currentRegion) => {
      return currentRegion.latency === 'PENDING';
    });

    this.setState({ pollIteration: pollIteration + 1 });

    if (repoll || (!regions.length && pollIteration < 8)) {
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

  render() {
    const {
      mode,
      tiles,
      region,
      enabled,
      drawerOpen,
      autoLoading
    } = this.state;
    const { context: { theme } } = this.props;
    let { error } = this.state;
    let connection = enabled ? 'connected' : 'disconnected';

    // handle proxy errors
    if (!region) { error = t('NoRegionSelected'); } // put 'no region' error above all others
    if (error) { connection = 'error'; }

    // filter tiles
    const savedTiles = tiles.filter((tile) => { return tile.saved; });
    const unsavedTiles = tiles.filter((tile) => { return !tile.saved; });

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
