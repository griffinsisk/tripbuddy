import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import RecommendationForm from './components/RecommendationForm';
import ResultCard from './components/ResultCard';
import Itinerary from './components/Itinerary';
import Loading from './components/Loading';

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectRecommendations = (recs) => {
    setRecommendations(recs);
    navigate('/recommendations');
  };

  const selectDestination = (destination) => {
    setSelectedDestination(destination);
    navigate('/itinerary', { state: { name: destination.name, itinerary: destination.itinerary } });
  };

  return (
    <>
      {loading && <Loading />}
      <Routes>
        <Route
          path="/"
          element={
            <RecommendationForm
              selectRecommendations={selectRecommendations}
              setSelectedDestination={setSelectedDestination}
              setDepartureDate={setDepartureDate}
              setReturnDate={setReturnDate}
              setLoading={setLoading}
              loading={loading} // Pass the loading state as a prop
            />
          }
        />
        <Route
          path="/recommendations"
          element={
            <ResultCard
              recommendations={recommendations}
              selectDestination={selectDestination}
              departureDate={departureDate}
              returnDate={returnDate}
              setLoading={setLoading} // Pass the setLoading function as a prop
              loading={loading} // Pass the loading state as a prop
            />
          }
        />
        <Route
          path="/itinerary"
          element={
            <Itinerary
              selectedDestination={selectedDestination}
              setLoading={setLoading} // Pass the setLoading function as a prop
              loading={loading} // Pass the loading state as a prop
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;