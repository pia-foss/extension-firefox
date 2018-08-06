import React, { Component } from 'react';
import PropType from 'prop-types';

const BypassItem = ({ onRemoveRule, rule }) => {
  return (
    <div className="otherbypassitem">
      <span className="name">{rule}</span>
      <span className="rem" onClick={onRemoveRule} />
    </div>
  );
}

BypassItem.propTypes = {
  rule: PropType.string.isRequired,
  onRemoveRule: PropType.func.isRequired
};

export default BypassItem;
