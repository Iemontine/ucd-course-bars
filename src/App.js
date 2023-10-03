// App.js
// Written by darroll saddi at uc davis
// Utilizes UC Davis API by Marvin

import React, { useState, useEffect } from 'react';
import './App.css';

function formatDateFromEpoch(epochTime) {
  // Create a new Date object with the provided epoch time in milliseconds
  const date = new Date(epochTime * 1);
  
  // Define an array of month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Extract the date components
  const month = monthNames[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  let amOrPm = 'AM';

  // Convert hours to 12-hour format and determine AM or PM
  if (hours >= 12) {
    amOrPm = 'PM';
    if (hours > 12) {
      hours -= 12;
    }
  }

  // Ensure that hours are displayed as two digits with trailing zeros if necessary
  hours = String(hours).padStart(2, '0');

  // Construct the readable date string in the "YYYY-MM-DD hh:mm:ss AM/PM" format
  const formattedDate = `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds} ${amOrPm}`;

  return formattedDate;
}

const BarChart = () => {
  const [data, setData] = useState(null);             // State for API response data
  const [sliderValue, setSliderValue] = useState(0);  // Slider state
  const [maxValue, setMaxValue] = useState(0);  // State for highest possible value of the three bars
  const [inputCRN, setInputCRN] = useState(''); // State for input value
  const [noResults, setNoResults] = useState(false); // State for no results message

  // Extract the trailing part of the URL (e.g., /12345 from ucd-course-bars.pages.dev/12345)
  const trailingUrl = window.location.pathname.replace('/', '');

  var apiEndpoint;
  if (trailingUrl === '') {
    // this is extremely ugly i'll fix it one day
    apiEndpoint = `https://course-api.designedbymarvin.com/v1/seats/history/1`;
  }
  else {
    // construct the API endpoint using the trailing CRN at the end of the URL
    apiEndpoint = `https://course-api.designedbymarvin.com/v1/seats/history/${trailingUrl}?optimized=1`;
  }

  
  // Fetch JSON data from an API
  useEffect(() => {
    fetch(apiEndpoint)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        if (jsonData.warning === "no_results") {
          setNoResults(true);
        }
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, [apiEndpoint]);

  // calculate the highest value for the bars, used to dictate the upper limit of the bar height
  useEffect(() => {
    if (data) {
      const maxSeatsAvailable = Math.max(...data.history.map((item) => item.seats_available));
      const maxSeatsReserved = Math.max(...data.history.map((item) => item.seats_reserved));
      const maxWaitlist = Math.max(...data.history.map((item) => item.waitlist));
      setMaxValue(Math.max(maxSeatsAvailable, maxSeatsReserved, maxWaitlist));
    }
  }, [data]);

  // handle slider value changing
  const handleSliderChange = (event) => {
    setSliderValue(event.target.value);
  };

  // handle the CRN input box being used
  const handleCRNInput = () => {
    if (inputCRN) {
      // navigate to the new URL with the CRN
      window.location.href = `/${inputCRN}`;
    }
  };

  // page appearance, extremely ugly organization, very hard to read
  return (
    <div className="container">
      <h1 className="title">UCD CRN Tracker</h1>
      <p className="subtitle">by darroll saddi <br></br> using the <a href="https://course-api.designedbymarvin.com/UCDAPIDemo/home" className="blue-link">UC Davis API</a></p>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter a valid CRN"
          value={inputCRN}
          onChange={(e) => setInputCRN(e.target.value)}
        />
        <button onClick={handleCRNInput}>Enter</button>
      </div>
      {noResults ? (
        <p className="red-text">Please enter a valid CRN!</p> // display message when no results
      ) : data ? (
        <div> 
          <div className="bar-chart">
            <div
              className="bar seats-available"
              style={{ height: `${(data.history[sliderValue]?.seats_available / maxValue) * 100}%` }}
            >
              {data.history[sliderValue]?.seats_available}
            </div>
            <div
              className="bar seats-reserved"
              style={{ height: `${(data.history[sliderValue]?.seats_reserved / maxValue) * 100}%` }}
            >
              {data.history[sliderValue]?.seats_reserved}
            </div>
            <div
              className="bar waitlist"
              style={{ height: `${(data.history[sliderValue]?.waitlist / maxValue) * 100}%` }}
            >
              {data.history[sliderValue]?.waitlist}
            </div>
          </div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box seats-available"></div>
              Seats Available
            </div>
            <div className="legend-item">
              <div className="legend-box seats-reserved"></div>
              Seats Reserved
            </div>
            <div className="legend-item">
              <div className="legend-box waitlist"></div>
              Waitlisted
            </div>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min={0}
              max={data.history.length - 1}
              value={sliderValue}
              onChange={handleSliderChange}
            />
          </div>
          <p className="updatedAt">Displaying seats on {formatDateFromEpoch(data.history[sliderValue]?.timestamp_local)}</p>
        </div>
      ) : (
        <p>Loading data...</p>  // message that is displayed when API response is loading/failing to load
      )}

    </div>
    
  );
};

export default BarChart;
