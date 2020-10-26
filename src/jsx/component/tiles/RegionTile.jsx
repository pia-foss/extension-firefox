import React from 'react';
import PropTypes from 'prop-types';

import Tile from '@component/tiles/Tile';
import CurrentRegion from '@component/CurrentRegion';

const RegionTile = (props) => {
  const {
    region,
    saved,
    hideFlag,
    autoLoading,
    toggleTileSaved,
  } = props;

  return (
    <Tile
      name="RegionTile"
      saved={saved}
      hideFlag={hideFlag}
      toggleTileSaved={toggleTileSaved}
    >
      <CurrentRegion id="region" region={region} autoLoading={autoLoading} />
    </Tile>
  );
};

RegionTile.propTypes = {
  region: PropTypes.object,
  saved: PropTypes.bool.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  autoLoading: PropTypes.bool.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

RegionTile.defaultProps = {
  region: undefined,
};

export default RegionTile;
