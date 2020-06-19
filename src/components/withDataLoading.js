import React from 'react';

function WithDataLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    console.log(typeof Component)
    if (!isLoading) return <Component {...props} />;
    return (
      <p style={{ textAlign: 'center', fontSize: '30px' }}>
        Hold on, fetching data may take some time :)
      </p>
    );
  };
}
export default WithDataLoading;
