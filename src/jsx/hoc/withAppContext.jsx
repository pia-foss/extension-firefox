import React from 'react';

import { AppConsumer } from '@contexts/AppContext';

function withAppContext(ChildComponent) {
  function injector(props) {
    return (
      <AppConsumer>
        { (context) => { return <ChildComponent context={context} {...props} />; } }
      </AppConsumer>
    );
  }
  return injector;
}

export default withAppContext;
