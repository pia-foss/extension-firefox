import React from 'react';
import PropTypes from 'prop-types';

const BypassItem = ({ rule, theme, onRemoveRule }) => {
  return (
    <div className={`bypass-rule ${theme}`}>
      <span className="name">
        { rule }
      </span>

      <span
        role="button"
        tabIndex="-1"
        className="rem"
        onClick={onRemoveRule}
        onKeyPress={onRemoveRule}
      />
    </div>
  );
};

BypassItem.propTypes = {
  rule: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  onRemoveRule: PropTypes.func.isRequired,
};

export default BypassItem;
