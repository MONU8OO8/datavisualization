import React from 'react';
import DataTable from './components/DataTable';

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-r from-purple-500 via-pink-300 to-red-500 p-4">
      <h1 className="text-4xl font-bold text-white mb-8">Data Visualization App</h1>
      <DataTable />
    </div>
  );
}

export default App;
