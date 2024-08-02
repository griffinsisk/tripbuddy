const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow CORS from specific frontend domain when deployed
const allowedOrigins = ['https://tripbuddy-47t7vv2dsa-ue.a.run.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

console.log('Serving static files from:', path.join(__dirname, 'public'));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = new OpenAIApi(configuration);

const fetchImageFromUnsplash = async (query) => {
  try {
    const [city, stateOrCountry] = query.split(',').map(part => part.trim());

    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: `${city} ${stateOrCountry}`,
        client_id: process.env.UNSPLASH_API_KEY,
        per_page: 10,
        orientation: 'landscape',
      },
    });

    if (response.data.results.length > 0) {
      const images = response.data.results.filter(
        (result) =>
          result.urls &&
          !result.alt_description.toLowerCase().includes('political')
      );

      const cityName = city.toLowerCase();

      const matchedImages = images.filter((image) => {
        const altDescription = image.alt_description ? image.alt_description.toLowerCase() : '';
        const tags = image.tags ? image.tags.map(tag => tag.title.toLowerCase()) : [];
        const locationName = image.location && image.location.name ? image.location.name.toLowerCase() : '';
        return (
          (altDescription.includes(cityName) || tags.includes(cityName) || locationName.includes(cityName))
        );
      });

      if (matchedImages.length > 0) {
        matchedImages.sort((a, b) => b.likes - a.likes);
        return matchedImages[0].urls.regular;
      } else {
        images.sort((a, b) => b.likes - a.likes);
        return images[0].urls.regular;
      }
    } else {
      return 'https://via.placeholder.com/150?text=No+Image';
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return 'https://via.placeholder.com/150?text=No+Image';
  }
};

app.post('/api/recommendations', async (req, res) => {
  const { departureCity, departureDate, returnDate, themes, budget } = req.body;
  const question = `I live in ${departureCity}, I want to go on a trip from ${departureDate} to ${returnDate}, and I want to experience ${themes.join(', ')}. What are some good destinations within a budget of $${budget}? Provide 6 mostly international with some domestic options formatted as follows:

1. [Location]: [Description]
2. [Location]: [Description]
3. [Location]: [Description]
4. [Location]: [Description]
5. [Location]: [Description]
6. [Location]: [Description]

Ensure the descriptions are detailed.`;

  try {
    const response = await openaiClient.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: question },
      ],
      max_tokens: 3000,
    });

    const responseText = response.data.choices[0].message.content;
    console.log('Full GPT-3 Response:', responseText);

    const recommendations = [];
    const lines = responseText.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const description = parts.slice(1).join(':').trim();
        if (name && description) {
          const image = await fetchImageFromUnsplash(name);
          recommendations.push({
            name,
            description,
            image,
          });
        }
      }
    }

    if (recommendations.length !== 6) {
      console.error(`Expected 6 recommendations, but got ${recommendations.length}`);
      res.status(500).json({ error: 'Expected 6 recommendations, but got less' });
    } else {
      console.log('Final Recommendations Array:', recommendations);
      res.json(recommendations);
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

app.post('/api/itinerary', async (req, res) => {
  const { destination, departureDate, returnDate } = req.body;
  const tripDuration = calculateDaysBetweenDates(departureDate, returnDate);
  const question = `Create a detailed ${tripDuration}-day itinerary for a trip to ${destination}. Each day's activities should include specific names of places to visit, activities, food and drink places, must-see attractions, and local experiences. The response must follow this format exactly:

[3-paragraph description of the destination]

Day 1:
- Morning: [Description]
- Afternoon: [Description]
- Evening: [Description]

Day 2:
- Morning: [Description]
- Afternoon: [Description]
- Evening: [Description]

... (and so on for the remaining days)

Do not include any additional messaging or text beyond this format. Ensure the descriptions are detailed.`;

  try {
    const response = await openaiClient.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: question },
      ],
      max_tokens: 1500,
    });

    const responseText = response.data.choices[0].message.content;
    console.log('GPT-3 Itinerary Response:', responseText);

    const lines = responseText.split('\n').filter(line => line.trim() !== '');
    let destinationDescription = '';
    let itinerary = [];
    let currentDay = null;
    let descriptionComplete = false;

    const dayPattern = /Day\s*\d+:/i;

    lines.forEach(line => {
      console.log('Processing line:', line); // Log each line
      if (!descriptionComplete) {
        destinationDescription += line + ' ';
        if (line.trim().startsWith('Day')) {
          descriptionComplete = true;
          currentDay = { day: line.match(dayPattern)[0].trim(), activities: [] };
        }
      } else {
        if (dayPattern.test(line)) {
          if (currentDay) {
            itinerary.push(currentDay);
            console.log('Added day to itinerary:', currentDay); // Log added day
          }
          currentDay = { day: line.match(dayPattern)[0].trim(), activities: [] };
        } else if (currentDay && line.trim()) {
          currentDay.activities.push(line.trim());
          console.log('Added activity to day:', currentDay.day, line.trim()); // Log added activity
        }
      }
    });

    if (currentDay) {
      itinerary.push(currentDay);
    }

    if (itinerary.length === 0) {
      console.error('No itinerary activities found');
      res.status(500).json({ error: 'No itinerary activities found' });
    } else {
      console.log('Final Itinerary Array:', itinerary);
      res.json({ description: destinationDescription.trim(), itinerary });
    }
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function calculateDaysBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = Math.abs(end - start);
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
}