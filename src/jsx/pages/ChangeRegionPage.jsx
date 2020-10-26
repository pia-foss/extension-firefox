import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PageTitle from '@component/PageTitle';
import RegionList from '@component/RegionList';
import withAppContext from '@hoc/withAppContext';
import RegionSearch from '@component/RegionSearch';

class ChangeRegionPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.mounted = false;
    this.app = props.context.app;
    this.storage = this.app.util.storage;
    this.settings = this.app.util.settings;
    this.regionlist = this.app.util.regionlist;
    this.state = {
      search: '',
      mode: 'render',
      autoLoading: false,
      regions: this.regionlist.toArray(),
      sortBy: this.storage.getItem('sortby') || 'name',
      showFavorites: this.storage.getItem('showFavorites') === 'true',
    };

    // bindings
    this.pollRegions = this.pollRegions.bind(this);
    this.changeSortBy = this.changeSortBy.bind(this);
    this.onSearchUpdate = this.onSearchUpdate.bind(this);
    this.renderFavorite = this.renderFavorite.bind(this);
    this.toggleFavorites = this.toggleFavorites.bind(this);
    this.updateRegionsLocally = this.updateRegionsLocally.bind(this);
    this.updateRegionsRemotely = this.updateRegionsRemotely.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.pollRegions();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSearchUpdate({ target: { value } }) {
    this.setState({ search: value });
  }

  updateRegionsLocally() {
    this.setState(() => {
      return {
        regions: this.regionlist.toArray(),
      };
    });
  }

  updateRegionsRemotely() {
    this.setState({ mode: 'loading' });
    this.regionlist.sync().then(() => {
      this.setState({ mode: 'render', regions: this.regionlist.toArray() });
    });
  }

  pollRegions() {
    if (!this.mounted) { return; }

    // update regions
    const regions = this.regionlist.toArray();
    this.setState({ regions });

    // check if there are still server latency checks ongoing
    const repoll = regions.some((region) => {
      return region.latency === 'PENDING';
    });

    if (repoll) {
      this.setState({ autoLoading: true });
      setTimeout(this.pollRegions, 500);
    }
    else { this.setState({ autoLoading: false }); }
  }

  changeSortBy(event) {
    const value = event.target.getAttribute('data-value');
    if (value === 'latency') { this.storage.setItem('sortby', 'latency'); }
    else { this.storage.setItem('sortby', 'name'); }
    this.setState({ sortBy: value });
  }

  toggleFavorites() {
    const favorite = this.storage.getItem('showFavorites') === 'true';
    this.storage.setItem('showFavorites', !favorite);
    this.setState({ showFavorites: !favorite });
  }

  renderFavorite() {
    const { showFavorites } = this.state;
    const heartUrl = showFavorites ? '/images/heart-full@3x.png' : '/images/heart-outline@3x.png';

    return (
      <div
        role="button"
        tabIndex="-1"
        className={`favorites heart-container noselect ${showFavorites ? 'active' : ''}`}
        onClick={this.toggleFavorites}
        onKeyPress={this.toggleFavorites}
      >
        <img
          alt="Favorite"
          className="heart"
          src={heartUrl}
        />
      </div>
    );
  }

  render() {
    const {
      mode,
      search,
      sortBy,
      regions,
      autoLoading,
      showFavorites,
    } = this.state;
    const { context: { theme } } = this.props;

    return (
      <div id="change-region-page" className={`row ${theme}`}>
        <PageTitle text={t('SelectRegionText')} />

        <RegionSearch theme={theme} search={search} onSearchUpdate={this.onSearchUpdate} />

        <div className={`region-sort-selection ${theme}`}>
          <button
            type="button"
            data-value="name"
            onClick={this.changeSortBy}
            className={`name ${sortBy === 'name' ? 'active' : ''}`}
          >
            { t('RegionName') }
          </button>

          <button
            type="button"
            data-value="latency"
            onClick={this.changeSortBy}
            className={`latency ${sortBy === 'latency' ? 'active' : ''}`}
          >
            { t('RegionLatency') }
          </button>

          { this.renderFavorite() }
        </div>

        <RegionList
          mode={mode}
          search={search}
          sortBy={sortBy}
          regions={regions}
          autoLoading={autoLoading}
          showFavorites={showFavorites}
          updateRegionsRemotely={this.updateRegionsRemotely}
          updateRegionsLocally={this.updateRegionsLocally}
        />
      </div>
    );
  }
}

ChangeRegionPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(ChangeRegionPage);
