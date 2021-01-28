import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import withAppContext from '@hoc/withAppContext';
import LoadingEllipsis from '@component/LoadingEllipsis';
import onFlagError from '@eventhandler/pages/changeregion/onFlagError';

class CurrentRegion extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.isAuto = this.app.util.regionlist.getIsAuto();

    // bindings
    this.changeRegion = this.changeRegion.bind(this);
    this.getRegionName = this.getRegionName.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  onFlagLoadError(event) {
    const { region } = this.props;
    return onFlagError(event, region);
  }

  getRegionName() {
    let regionName = '';
    const { isAuto } = this;
    const { region } = this.props;

    if (isAuto && region) { regionName = `${t('Auto')} (${region.localizedName()})`; }
    else if (region) { regionName = region.localizedName(); }
    else { regionName = t('NoRegionSelected'); }

    return regionName;
  }

  changeRegion() {
    return this.history.push('/region');
  }

  render() {
    const { region, autoLoading, context: { theme } } = this.props;

    if (!region) { return <LoadingEllipsis theme={theme} />; }

    return (
      <div
        role="button"
        tabIndex="-1"
        className={`current-region ${theme}`}
        onClick={this.changeRegion}
        onKeyPress={this.changeRegion}
      >
        <div className="region-content">
          <div className="flag">
            {
              (region && !region.override)
                ? <img alt={region.iso} onError={this.onFlagLoadError} src={region.flag} />
                : <div className="empty-flag" />
            }
          </div>

          <div className="region-name">
            <div className="title">
              { t('CurrentRegionText') }
            </div>

            <div className="name">
              { this.getRegionName() }
            </div>
          </div>
        </div>

        <div className="go-forward-image" />
      </div>
    );
  }
}

CurrentRegion.propTypes = {
  region: PropTypes.object,
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  autoLoading: PropTypes.bool.isRequired,
};

CurrentRegion.defaultProps = {
  region: undefined,
};

export default withRouter(withAppContext(CurrentRegion));
