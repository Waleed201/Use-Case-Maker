import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [actors, setActors] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [colors, setColors] = useState({});

  // Load CSV Data
  const loadCSVData = async () => {
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSvTKVnzeZfNKhJ6ZJd3DlZNMmZw-qAlCPw1yxQ2sLEEJVo-6KZ9Leq6phmLljV-hpANe0AEFsP6M-G/pub?gid=0&single=true&output=csv');  // Replace with your correct link
      const reader = response.body.getReader();
      const result = await reader.read(); // raw array
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value); // the csv text
      console.log('Fetched CSV:', csv); // Check the raw CSV content

      // Parse the CSV
      const results = Papa.parse(csv, { header: true });
      console.log('Parsed CSV Data:', results.data); // Check parsed data
      setData(results.data);
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  };

  // Process the Data
  const processData = (data) => {
    if (!data.length) return;  // Avoid processing if data is empty
  
    // Clean up the headers and standardize the keys
    const cleanedData = data.map(item => {
      return {
        useCase: item['Use Case '].trim(),  // Adjust this key based on your actual data
        actors: Object.keys(item)
          .filter(key => key.startsWith('Actor') || key === 'Actor')
          .map(key => item[key] ? item[key].trim() : null)
          .filter(Boolean)  // Remove any null/empty values
      };
    });
  
    const actorsSet = new Set();
    cleanedData.forEach(({ actors }) => {
      actors.forEach(actor => {
        actorsSet.add(actor);
      });
    });
  
    console.log('Processed Use Cases:', cleanedData); // Check processed data
    setActors([...actorsSet]);  // Convert set to array
    setUseCases(cleanedData);
  };
  

  // Assign Colors to Each Use Case
  const assignColors = (useCases) => {
    const assignedColors = {};
    const colorPalette = [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FFA500', // Orange
      '#FF7F50', // Coral
      '#8A2BE2', // Violet
      '#32CD32', // Lime
      '#87CEEB', // Sky Blue
      '#FFD700', // Gold
      '#ADD8E6', // Light Blue
      '#FFB6C1', // Light Red
      '#90EE90', // Light Green
      // Add more colors as needed
    ];

    useCases.forEach(({ actors }) => {
      const actorKey = actors.sort().join('-'); // Create a unique key based on sorted actors
      if (!assignedColors[actorKey]) {
        // Find the next available color
        const availableColors = colorPalette.filter(color => !Object.values(assignedColors).includes(color));
        assignedColors[actorKey] = availableColors.length > 0 ? availableColors[0] : '#000000'; // Fallback to black if no colors are available
      }
    });

    console.log('Assigned Colors:', assignedColors); // Check assigned colors
    setColors(assignedColors);
  };

  useEffect(() => {
    loadCSVData();  // Fetch the CSV data
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      processData(data);
    }
  }, [data]);

  useEffect(() => {
    if (useCases.length > 0) {
      assignColors(useCases); // Update to use useCases instead of actors
    }
  }, [useCases]);

  return (
    <div className="App">
      <h1>Use Case Diagram</h1>
      <div className="diagram">
        {useCases.map(({ useCase, actors }, index) => {
          const actorKey = actors.sort().join('-'); // Create a unique key for color assignment
          return (
            <div key={index} className="use-case" style={{ backgroundColor: colors[actorKey] }}>
              <h2>{useCase}</h2>
              <div className="actors">
                {actors.map((actor, idx) => (
                  <div 
                    key={idx} 
                    className="actor" 
                    style={{ backgroundColor: colors[actorKey] }} // Use the unique color for the actor
                  >
                    {actor}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <h2>Actor Sets and Their Colors</h2>
        <div className="actor-sets">
          {Object.entries(colors).map(([actorSet, color]) => (
            <div key={actorSet} className="actor-set" style={{ marginBottom: '10px' }}>
              <div
                style={{
                  backgroundColor: color,
                  width: '20px',
                  height: '20px',
                  // display: 'inline-block',
                  marginRight: '10px',
                }}
              ></div>
              <span>{actorSet.split('-').join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
