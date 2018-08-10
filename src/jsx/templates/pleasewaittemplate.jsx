import React from 'react';
import CompanyLogo from '../component/companylogo';

export default function () {
  const PleaseWaitTemplate = () => {
    return (
      <div id="please-wait-template">
        <CompanyLogo />

        <div className="top-border">
          <div className="loader" />

          <p className="loadingtext2">
            { t('PleaseWait') }
          </p>
        </div>
      </div>
    );
  };

  return PleaseWaitTemplate;
}
