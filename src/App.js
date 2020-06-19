import React, { useEffect, useState } from 'react';
import './App.css';
import List from './components/List';
import withDataLoading from './components/withDataLoading';


function App() {
  const DataLoading = withDataLoading(List);
  const [appState, setAppState] = useState({
    loading: false,
    assets: null,
  });

  useEffect(() => {
    setAppState({ loading: true });
    const apiUrl = `https://api.coincap.io/v2/assets`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((assets) => {
        setAppState({ loading: false, assets: assets });
      });
  }, [setAppState]);
  return (
    <div className='App'>
      <div>
        <DataLoading isLoading={appState.loading} assets={appState.assets} />
      </div>
    </div>
  );
}


export default App;
