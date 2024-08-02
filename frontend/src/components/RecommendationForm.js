import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecommendationForm.css';
import TripBuddyImage from '../TripBuddy.png';

function RecommendationForm({ selectRecommendations, setSelectedDestination, setDepartureDate, setReturnDate, setLoading, loading }) {
  const [departureCity, setDepartureCity] = useState('');
  const [departureDate, setDepartureDateState] = useState('');
  const [returnDate, setReturnDateState] = useState('');
  const [themes, setThemes] = useState([]);
  const [budget, setBudget] = useState('');
  const [customTheme, setCustomTheme] = useState(''); // State for custom theme
  const [isCustomThemeSelected, setIsCustomThemeSelected] = useState(false); // State for custom theme selection
  const navigate = useNavigate();

  const themeOptions = [
    'Adventure and Exploration', 'History and Culture', 'Relaxation and Wellness', 'Shopping and Fashion',
    'Art and Creativity', 'Music and Festivals', 'Family-Friendly', 'Romantic Getaway', 'Food and Wine',
    'Sports and Fitness', 'Nature and Wildlife', 'Beaches', 'Technology and Innovation', 'Nightlife and Entertainment',
    'Outdoor Activities', 'Mountains', 'Surfing', 'Volunteer Work', 'Unique Experience', 'Remote Location',
    'English Speaking', 'Warm Weather', 'Cold Weather', 'Seasonal Festivals or Events', 'Meet New People', 'Solo Travel',
    'Luxury Experience', 'Skiing and Snowboarding', 'All-inclusive Resorts', 'Asia', 'North America', 'Australia', 
    'Europe', 'Africa', 'South America', 'Affordable', 'Crazy and Wild', 'Renowned Monuments'
  ];

  useEffect(() => {
    if (departureDate) {
      setReturnDateState(departureDate);
    }
  }, [departureDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalThemes = [...themes];
      if (isCustomThemeSelected && customTheme.trim()) {
        finalThemes.push(customTheme.trim());
      }

      console.log('Submitting request with data:', {
        departureCity,
        departureDate,
        returnDate,
        themes: finalThemes,
        budget,
      });

      const response = await fetch('https://tripbuddy-47t7vv2dsa-ue.a.run.app/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departureCity,
          departureDate,
          returnDate,
          themes: finalThemes,
          budget,
        }),
      });

      if (!response.ok) {
        console.error('Error fetching recommendations:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Recommendations received from API:', data); // Log API response

      if (Array.isArray(data) && data.length > 0) {
        selectRecommendations(data);
        navigate('/recommendations'); // Navigate to the correct route
      } else {
        console.warn('Received empty or invalid recommendations:', data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setThemes((prevThemes) =>
      prevThemes.includes(value)
        ? prevThemes.filter((theme) => theme !== value)
        : prevThemes.length < 5
          ? [...prevThemes, value]
          : prevThemes
    );
  };

  const handleCustomThemeChange = (e) => {
    setCustomTheme(e.target.value);
  };

  const handleCustomThemeSelect = (e) => {
    setIsCustomThemeSelected(e.target.checked);
  };

  // Get today's date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="recommendation-page">
      <div className="recommendation-trip-buddy-container">
        <img src={TripBuddyImage} alt="TripBuddy" className="recommendation-trip-buddy-logo" />
        <div className="recommendation-speech-bubble">
          Hi, I'm TripBuddy great to meet you! I'm here to help you plan your perfect trip. Please fill out this form and we'll get started!
        </div>
      </div>
      <div className="recommendation-form-container">
        <form className="recommendation-form" onSubmit={handleSubmit}>
          <h1>Find Your Perfect Trip</h1>
          <div className="form-group">
            <label>Departure City:</label>
            <span className="small-text">Please use a city, state or country format</span>
            <input
              type="text"
              value={departureCity}
              placeholder="ex. Boston, MA"
              onChange={(e) => setDepartureCity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Departure Date:</label>
            <span className="small-text">When would you like to arrive?</span>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => {
                setDepartureDateState(e.target.value);
                setDepartureDate(e.target.value);
              }}
              min={getCurrentDate()} // Set the min attribute to today's date
              required
            />
          </div>
          <div className="form-group">
            <label>Return Date:</label>
            <span className="small-text">When would you like to leave?</span>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => {
                setReturnDateState(e.target.value);
                setReturnDate(e.target.value);
              }}
              min={departureDate}
              required
            />
          </div>
          <div className="form-group">
            <label>Budget:</label>
            <span className="small-text">How much can you spend for your trip?</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label><b>Themes:</b></label>
            <p>Please select up to 5 themes to help TripBuddy customize a few recommendations</p>
            <div className="themes-grid">
              {themeOptions.map((theme) => (
                <div key={theme} className="theme-option">
                  <input
                    type="checkbox"
                    value={theme}
                    checked={themes.includes(theme)}
                    onChange={handleThemeChange}
                    disabled={!themes.includes(theme) && themes.length >= 5} // Disable checkbox if limit is reached
                  />
                  {theme}
                </div>
              ))}
              <div className="theme-option">
                <input
                  type="checkbox"
                  checked={isCustomThemeSelected}
                  onChange={handleCustomThemeSelect}
                  disabled={!isCustomThemeSelected && themes.length >= 5} // Disable checkbox if limit is reached
                />
                <input
                  type="text"
                  placeholder="Custom Theme"
                  value={customTheme}
                  onChange={handleCustomThemeChange}
                />
              </div>
            </div>
          </div>
          <button type="submit">
            {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RecommendationForm;