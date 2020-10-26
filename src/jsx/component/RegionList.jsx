import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Switch from '@component/Switch';
import RegionIso from '@component/RegionIso';
import RegionAuto from '@component/RegionAuto';
import withAppContext from '@hoc/withAppContext';
import RegionListItem from '@component/RegionListItem';

class RegionList extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.regionsorter = this.app.util.regionsorter;

    // bindings
    this.filterRegions = this.filterRegions.bind(this);
    this.renderAutoRegion = this.renderAutoRegion.bind(this);
    this.componentizeRegions = this.componentizeRegions.bind(this);
  }

  filterRegions(regions) {
    const { sortBy, search, showFavorites } = this.props;

    // determine sort order
    let sort = this.regionsorter.nameSort;
    if (sortBy === 'latency') { sort = this.regionsorter.latencySort; }

    // sort by name or latency
    return sort(regions)
      // filter by search input
      .filter((region) => {
        return region.localizedName().toLowerCase().includes(search.toLowerCase());
      })
      // filter favorites
      .filter((region) => {
        if (showFavorites) { return region.isFavorite; }
        return true;
      })
      // group regions by ISO
      .reduce((prev, curr) => {
        const isoMap = prev;
        if (isoMap[curr.iso]) { isoMap[curr.iso].push(curr); }
        else { isoMap[curr.iso] = [curr]; }
        return isoMap;
      }, {});
  }

  componentizeRegions() {
    const { regions, updateRegionsLocally } = this.props;
    const filteredRegions = this.filterRegions(regions);

    const componentRegions = [];
    Object.values(filteredRegions)
      .forEach((isoRegions) => {
        const region = isoRegions[0];

        if (isoRegions.length === 1) {
          componentRegions.push((
            <RegionListItem
              key={region.id}
              region={region}
              onRegionUpdate={updateRegionsLocally}
            />
          ));
        }
        else {
          const { iso } = region;
          componentRegions.push((
            <RegionIso
              key={iso}
              iso={iso}
              regions={isoRegions}
              updateRegionsLocally={updateRegionsLocally}
            />
          ));
        }
      });

    return componentRegions;
  }

  renderAutoRegion() {
    const { regions, autoLoading } = this.props;
    const region = this.regionsorter.latencySort(regions)[0];

    if (!region) { return ''; }

    return (<RegionAuto region={region} autoLoading={autoLoading} />);
  }

  render() {
    const filteredRegions = this.componentizeRegions();
    const {
      mode,
      regions,
      context: { theme },
      updateRegionsRemotely,
    } = this.props;

    // Loading screen when between actions
    if (mode === 'loading') {
      return (
        <div className="regions centered">
          <Switch
            theme={theme}
            mode="connecting"
            classes="waiting region"
            connection="disconnected"
            onToggleConnection={() => {}}
          />
        </div>
      );
    }

    // No Regions Found screen if no regions exists
    if (regions.length === 0) {
      return (
        <div className="no-regions">
          <div className={`no-regions-title ${theme}`}>
            { t('NoRegionsFound') }
          </div>

          <button
            type="button"
            className="btn btn-success"
            onClick={updateRegionsRemotely}
          >
            { t('RefreshRegions') }
          </button>
        </div>
      );
    }

    // Render regions
    return (
      <div className="regions">
        <div className="auto-region">
          { this.renderAutoRegion() }
        </div>
        <ul className="region-list">
          { filteredRegions }
        </ul>
      </div>
    );
  }
}

RegionList.propTypes = {
  mode: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  regions: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  autoLoading: PropTypes.bool.isRequired,
  showFavorites: PropTypes.bool.isRequired,
  updateRegionsLocally: PropTypes.func.isRequired,
  updateRegionsRemotely: PropTypes.func.isRequired,
};

export default withAppContext(RegionList);
