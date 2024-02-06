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
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);
  const [numToShow, setNumToShow] = useState(5);

  useEffect(() => {
    if (numToShow > 0) {
      fetchData();
    }
  }, [currentPage, searchTerm, itemsPerPage, numToShow]);

  useEffect(() => {
    updateChartData();

    localStorage.setItem('selectedData', JSON.stringify(selectedData));
  }, [selectedData]);

  useEffect(() => {
    if (!initialSelectionDone && data.length > 0) {
      setSelectedData(data.slice(0, numToShow));
      setInitialSelectionDone(true);
    }
  }, [data, initialSelectionDone, numToShow]); 

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=${numToShow}&q=${searchTerm}`
      ); 
      setData(response.data);
      setTotalPages(Math.ceil(response.headers['x-total-count'] / numToShow));  
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateChartData = () => {
    const prevXValues = chartData.x;
    const prevYValues = chartData.y;

    const newXValues = selectedData.map((row) => row.title);
    const newYValues = selectedData.map((row) => row.id);

    const addedXValues = newXValues.filter((x) => !prevXValues.includes(x));
    const addedYValues = newYValues.filter((y) => !prevYValues.includes(y));

    const newColors = Array.from({ length: addedXValues.length }, () => getRandomColor());

    const updatedXValues = [...prevXValues, ...addedXValues];
    const updatedYValues = [...prevYValues, ...addedYValues];
    const updatedColors = [...chartData.marker.color, ...newColors];

    setChartData({
      x: updatedXValues,
      y: updatedYValues,
      type: 'bar',
      marker: {
        color: updatedColors,
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
    
      setChartData((prevChartData) => {
        const updatedXValues = prevChartData.x.filter((x) => x !== updatedData.title);
        const updatedYValues = prevChartData.y.filter((y) => y !== updatedData.id);
        const updatedColors = prevChartData.marker.color.filter((_, index) => {
          return prevChartData.x[index] !== updatedData.title;
        });
        return {
          ...prevChartData,
          x: updatedXValues,
          y: updatedYValues,
          marker: {
            ...prevChartData.marker,
            color: updatedColors,
          },
        };
      });
    } else {
      setSelectedData((prevData) => [...prevData, updatedData]);
       
      setChartData((prevChartData) => ({
        ...prevChartData,
        x: [...prevChartData.x, updatedData.title],
        y: [...prevChartData.y, updatedData.id],
        marker: {
          ...prevChartData.marker,
          color: [...prevChartData.marker.color, getRandomColor()],
        },
      }));
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

  const handleNumToShowChange = (value) => {
    setNumToShow(value);
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded shadow-2xl">
      <div className="mb-4 items-center space-x-4">


        <span className="text-sm text-gray-600">Page:</span>
        {totalPagesArray.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`p-2 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-black'
              }`}
          >
            {page}
          </button>
        ))}

        <div className="mt-2">
          <input
            type="text"
            placeholder="Number of items to show"
            value={numToShow}
            onChange={(e) => handleNumToShowChange(e.target.value)}
            className="p-2 mr-2 border border-white rounded bg-opacity-70 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="p-2 border border-white rounded bg-opacity-70 focus:outline-none"
          />
        </div>
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
