import React from 'react';
import PropType from 'prop-types';

import remove from '../../../js/helpers/remove';
import ErrorBoundary from '../../hoc/errorboundary';

const extractInputProps = (props) => {
  return remove(props, 'className')
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

  const {id, className} = props;

  return (
    <div className={buildClassName('container', id, className)}>
      <input
        {...extractInputProps(props)}
        name={id}
        className={buildClassName('input', id)}
        type="checkbox"
      />
      <label
        htmlFor={id}
        className={buildClassName('label', id)}
      />
    </div>
  );
}

Checkbox.propTypes = {
  id: PropType.string.isRequired,
  className: PropType.string,
  onChange: PropType.func.isRequired,
  checked: PropType.bool.isRequired,
}

export default ErrorBoundary(Checkbox);
