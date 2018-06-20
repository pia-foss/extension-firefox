import React, { Component } from 'react';

const ErrorBoundary = function (ReactClass) {
  return class ErrorBoundary extends Component {
    constructor(props) {
      super(props);

      this.state = { isError: false, msg: '' };
    }

    componentDidCatch(err) {
      console.error(err);
      const msg = JSON.stringify(err, Object.getOwnPropertyNames(err));
      this.setState(() => ({ isError: true, msg }));
    }

    render() {
      if (this.state.isError) {
        return React.createElement(
          'div',
          { className: 'error-boundary' },
          'error'
        );
      } else {
        return React.createElement(ReactClass, this.props);
      }
    }
  };
};

export default ErrorBoundary;
