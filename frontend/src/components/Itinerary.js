import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Itinerary.css';
import TripBuddyImage from '../TripBuddy.png';

const Itinerary = () => {
  const location = useLocation();
  const { name, itinerary } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top of the page on component mount
  }, []);

  if (!name || !itinerary) {
    return <div>Invalid itinerary data. Please go back and select a valid destination.</div>;
  }

  const cleanName = name.replace(/^\d+\.\s*/, ''); // Remove any leading number and dot

  return (
    <div className="itinerary-container">
      <div className="itinerary-header">
        <h1>Itinerary</h1>
      </div>
      <div className="itinerary-location">
        <h2>{cleanName}</h2>
        <p>{itinerary.description}</p>
      </div>
      <div className="itinerary-details">
        {itinerary.itinerary.length > 0 ? (
          itinerary.itinerary.map((day, index) => (
            <div key={index} className="itinerary-day">
              <h3>{day.day}</h3>
              {day.activities.map((activity, idx) => (
                <p key={idx}>{activity}</p>
              ))}
            </div>
          ))
        ) : (
          <p>No activities available for this itinerary.</p>
        )}
      </div>
      <div className="itinerary-trip-buddy-container">
        <img src={TripBuddyImage} alt="TripBuddy" className="itinerary-trip-buddy-logo" />
        <div className="itinerary-speech-bubble">
          Your itinerary is ready! Here are some activities you can do for each day of your trip. You can always go back and select a different destination. Have fun!
        </div>
      </div>
    </div>
  );
};

export default Itinerary;