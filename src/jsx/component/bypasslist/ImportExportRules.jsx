import PropTypes from 'prop-types';
import React, { Component } from 'react';

import withAppContext from '@hoc/withAppContext';

class ImportExportRules extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.state = { showCheckmark: false };
    this.bypasslist = this.app.util.bypasslist;
    this.region = this.app.util.regionlist.getSelectedRegion();

    // bindings
    this.onImportClick = this.onImportClick.bind(this);
    this.onExportClick = this.onExportClick.bind(this);
  }

  async onImportClick() {
    await this.bypasslist.spawnImportTab();
    window.close();
  }

  async onExportClick() {
    await this.bypasslist.saveRulesToFile();
    this.setState({ showCheckmark: true });
    setTimeout(() => {
      this.setState({ showCheckmark: false });
    }, 3000);
  }

  render() {
    const { showCheckmark } = this.state;
    const showClass = showCheckmark ? 'show' : '';
    return (
      <div className="import-export-wrapper">
        <h3 className="bl_sectionheader">
          { t('ImportExportHeader') }
        </h3>

        <div className="button-container">
          <button
            type="button"
            className="btn btn-success"
            disabled={!this.region}
            onClick={this.onImportClick}
          >
            { t('ImportLabel') }
          </button>

          <button
            type="button"
            className="btn btn-success"
            onClick={this.onExportClick}
          >
            { t('ExportLabel') }
            <img className={`${showClass}`} alt="Exported" src="/images/selected_2x.png" />
          </button>
        </div>
      </div>
    );
  }
}

ImportExportRules.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(ImportExportRules);
