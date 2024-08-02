import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultCard.css';
import TripBuddyImage from '../TripBuddy.png';

function ResultCard({ recommendations, departureDate, returnDate, selectDestination, setLoading, loading }) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Recommendations prop in ResultCard:', recommendations); // Log the recommendations prop
    if (recommendations.length > 0) {
      setLoading(false);
    } else {
      console.warn('No recommendations found, recommendations length:', recommendations.length); // Additional log for empty recommendations
    }
    window.scrollTo(0, 0); // Scroll to the top of the page when the component mounts
  }, [recommendations, setLoading]);

  const handleSelectDestination = async (destination) => {
    setLoading(true);
    try {
      const response = await fetch('https://tripbuddy-47t7vv2dsa-ue.a.run.app/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.name,
          departureDate: departureDate,
          returnDate: returnDate,
        }),
      });

      if (!response.ok) {
        console.error('Error fetching itinerary:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Itinerary data received:', data); // Log the itinerary data
      selectDestination({ name: destination.name, itinerary: data });
      navigate('/itinerary', { state: { name: destination.name, itinerary: data } }); // Navigate only after data is fully loaded
      setLoading(false); // Stop loading once navigation happens
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      setLoading(false);
    }
  };

  return (
    <div className="result-card-container">
      {loading && (
        <div className="loading-overlay">
          <p>Loading... Please wait, this may take a few minutes.</p>
        </div>
      )}
      <h1>Recommendations</h1>
      <p className="small-text">
        Due to a limited database of free stock images, some photos may not be an accurate depiction of the recommendation.
      </p>
      <div className="recommendations-container">
        {recommendations.length > 0 ? (
          recommendations.filter(rec => rec !== null).map((rec, index) => (
            <div key={index} className="recommendation-card">
              <h3>{rec.name}</h3>
              <img src={rec.image} alt={rec.name} />
              <p>{rec.description}</p>
              <button onClick={() => handleSelectDestination(rec)}>Select</button>
            </div>
          ))
        ) : (
          <p>No recommendations available. Please Open a new page and navigate to TripBuddy App</p>
        )}
      </div>
      <div className="result-trip-buddy-container">
        <img src={TripBuddyImage} alt="TripBuddy" className="result-trip-buddy-logo" />
        <div className="result-speech-bubble">
          Look at all these wonderful places! Please select one, and I will build you an itinerary to suit your taste.
        </div>
      </div>
    </div>
  );
}

export default ResultCard;