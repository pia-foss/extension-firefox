import React from 'react';
import PropType from 'prop-types';

import remove from '../../js/helpers/remove';
import ErrorBoundary from '../hoc/errorboundary';

const extractInputProps = (props) => {
  return remove(props, 'id', 'labelLocaleKey', 'className')
}

const buildClassName = (postfix, id, ...others) => {
  let classNames = [`checkbox-${postfix}`];
  if (id) {
    classNames = [...classNames, `${id}-${postfix}`];
  }
  classNames = [...classNames, ...others];

  return classNames.join(' ');
}

const Checkbox = (props) => {

  const {id, labelLocaleKey, className, onChange} = props;
  const message = typeof labelLocaleKey === 'string' ? t(labelLocaleKey) : '';

  return (
    <div className={buildClassName('container', id, className)}>
      <input
        name={id}
        className={buildClassName('input', id)}
        type="checkbox"
        id={id}
        onChange={onChange}
        {...extractInputProps(props)}
      />
      <label
        htmlFor={id}
        className={buildClassName('label', id)}
      >{message}</label>
    </div>
  );
}

Checkbox.propTypes = {
  id: PropType.string.isRequired,
  labelLocaleKey: PropType.string,
  className: PropType.string,
  onChange: PropType.func.isRequired,
  checked: PropType.bool.isRequired,
}

export default ErrorBoundary(Checkbox);
