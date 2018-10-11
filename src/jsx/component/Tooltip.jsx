import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({
  message,
  orientation,
}) => {
  switch (orientation) {
    case 'left':
    case 'right':
    case 'top':
      break;

    default: throw new Error(`invalid orientation: ${orientation}`);
  }

  return (
    <div className={`popover arrow-${orientation}`}>
      { message }
    </div>
  );
};

Tooltip.propTypes = {
  message: PropTypes.string.isRequired,
  orientation: PropTypes.string,
};

Tooltip.defaultProps = {
  orientation: 'bottom',
};

export default Tooltip;
