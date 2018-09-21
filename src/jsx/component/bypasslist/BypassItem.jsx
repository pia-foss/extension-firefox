import React from 'react';
import PropType from 'prop-types';

const BypassItem = ({ onRemoveRule, rule }) => {
  return (
    <div className="bypass-rule">
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
  rule: PropType.string.isRequired,
  onRemoveRule: PropType.func.isRequired,
};

export default BypassItem;
