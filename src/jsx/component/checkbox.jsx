import React from 'react';
import PropType from 'prop-types';

import remove from '../../js/helpers/remove';

const buildClassName = function (postfix, name, ...others) {
  let classNames = [`checkbox-${postfix}`];
  if (name) {
    classNames = [...classNames, `name-${postfix}`];
  }
  classNames = [...classNames, ...others];

  return classNames.join(' ');
}

const extractInputProps = function (props) {
  return remove(props, 'id', 'labelLocaleKey', 'className')
}

const Checkbox = ({id, labelLocaleKey, className}) => (
  <div className={buildClassName('container', id, className)}>
    <input
      className={buildClassName('input', id)}
      type="checkbox"
      id={id}
      {...extractInputProps(props)}
    />
    <label
      htmlFor={id}
      className={buildClassName('label', id)}
    >{t(labelLocaleKey)}</label>
  </div>
)

Checkbox.propTypes = {
  id: PropType.string.isRequired,
  labelLocaleKey: PropType.string,
  className: PropType.string,
}

export default Checkbox;
