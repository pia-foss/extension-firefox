import React from 'react';
import PropTypes from 'prop-types';

const DebugSettingItem = ({ onClick }) => {
  return (
    <div className="field settingitem noselect">
      <div className="col-xs-12 dlviewbtn">
        <button
          type="button"
          className="col-xs-12 btn btn-success"
          onClick={onClick}
        >
          { t('ViewDebugLog') }
        </button>
      </div>
    </div>
  );
};

DebugSettingItem.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DebugSettingItem;
