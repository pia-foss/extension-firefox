import React from 'react';
import PropType from 'prop-types';

const buildClassName = function (postfix, name, ...others) {
  let classNames = [`checkbox-${postfix}`];
  if (name) {
    classNames = [...classNames, `name-${postfix}`];
  }
  classNames = [...classNames, ...others];

  return classNames.join(' ');
}

const extractInputProps = function (props) {
  const {id, labelLocaleKey, className, ...inputProps} = props;

  return inputProps;
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
