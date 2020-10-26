import React from 'react';
import PropTypes from 'prop-types';

const Switch = (props) => {
  const {
    mode,
    theme,
    classes,
    connection,
    onToggleConnection,
  } = props;

  // noop if connection is 'error'
  let handler = onToggleConnection;
  if (connection === 'error') { handler = () => {}; }

  return (
    <div
      role="button"
      tabIndex="-1"
      className={`outer-circle ${theme} ${connection} ${mode} ${classes}`}
      onClick={handler}
      onKeyPress={handler}
    >
      <div className="spinner">
        <div className="spinner-gradient" />

        <div className="spinner-inner">
          <div className="power-icon" />
        </div>
      </div>
    </div>
  );
};

Switch.propTypes = {
  classes: PropTypes.string,
  mode: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  connection: PropTypes.string.isRequired,
  onToggleConnection: PropTypes.func.isRequired,
};

Switch.defaultProps = {
  classes: '',
};

export default Switch;
