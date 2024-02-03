import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState(() => {
    const storedData = localStorage.getItem('selectedData');
    return storedData ? JSON.parse(storedData) : [];
  });
  const [chartData, setChartData] = useState({
    x: [],
    y: [],
    type: 'bar',
    marker: { color: [] },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    updateChartData();
    
    localStorage.setItem('selectedData', JSON.stringify(selectedData));
  }, [selectedData, currentPage]);  

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=5&q=${searchTerm}`
      );
      setData(response.data);
      setTotalPages(Math.ceil(response.headers['x-total-count'] / 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateChartData = () => {
    const xValues = selectedData.map((row) => row.title);
    const yValues = selectedData.map((row) => row.id);
    const colors = Array.from({ length: selectedData.length }, () => getRandomColor());
  
    setChartData({
      x: xValues,
      y: yValues,
      type: 'bar',
      marker: {
        color: colors,
        line: {
          color: 'rgba(255, 255, 255, 0.7)',  
          width: 1.5,
        },
      },
      hoverinfo: 'y+text', 
      hovertext: selectedData.map((row) => `ID: ${row.id}`),
    });
  };
  

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleCheckboxChange = (id) => {
    const updatedData = data.find((row) => row.id === id);

    if (selectedData.some((row) => row.id === id)) {
      setSelectedData((prevData) => prevData.filter((row) => row.id !== id));
    } else {
      setSelectedData((prevData) => [...prevData, updatedData]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="container mx-auto my-8 p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded shadow-2xl">
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="p-2 border border-white rounded bg-opacity-70 focus:outline-none"
        />
        <span className="text-sm text-gray-600">Page:</span>
        {totalPagesArray.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`p-2 rounded ${
              page === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-black'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <div className="flex">
        <div className="w-1/2 p-4">
          <table className="table-auto bg-white bg-opacity-70 shadow-md rounded-md w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                <th className="p-2">ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Body</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedData.some((selectedRow) => selectedRow.id === row.id)}
                      onChange={() => handleCheckboxChange(row.id)}
                    />
                  </td>
                  <td className="p-2">{row.id}</td>
                  <td className="p-2">{row.title.length > 20 ? `${row.title.slice(0, 20)}...` : row.title}</td>
                  <td className="p-2">{row.body.length > 50 ? `${row.body.slice(0, 50)}...` : row.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-1/2 p-4 bg-white bg-opacity-70 shadow-md rounded-md">
          <Plot
            data={[chartData]}
            layout={{ width: 550, height: 400, paper_bgcolor: 'rgba(255,255,255,0.8)', plot_bgcolor: 'rgba(255,255,255,0.8)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataTable;
