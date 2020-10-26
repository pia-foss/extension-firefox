import PropTypes from 'prop-types';
import React, { Component } from 'react';

import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';

class UncontrollablePage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.settings = this.app.util.settings;
  }

  render() {
    const { context: { theme } } = this.props;

    return (
      <div className={`uncontrollable-page row ${theme}`}>
        <CompanyLogo hideLinks={true} />

        <div className="warningicon" />

        <p className="warningtext">
          { t('CannotUsePIAMessage') }
        </p>
      </div>
    );
  }
}

UncontrollablePage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(UncontrollablePage);
