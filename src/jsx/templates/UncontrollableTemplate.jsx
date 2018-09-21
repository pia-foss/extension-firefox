import React from 'react';
import OfflineWarning from '../component/OfflineWarning';
import CompanyLogo from '../component/CompanyLogo';

export default function () {
  const UncontrollableTemplate = () => {
    return (
      <div className="uncontrollable-template row">
        <OfflineWarning />

        <CompanyLogo />

        <div className="top-border">
          <div className="warningicon" />

          <p className="warningtext">
            { t('CannotUsePIAMessage') }
          </p>
        </div>
      </div>
    );
  };

  return UncontrollableTemplate;
}
