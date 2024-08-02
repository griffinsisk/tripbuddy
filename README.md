Overview:

TripBuddy is a dynamic web application designed to help users plan trips seamlessly by generating personalized travel recommendations and itineraries. Leveraging the capabilities of artificial intelligence through the OpenAI API, TripBuddy offers tailored suggestions based on user preferences such as travel themes, budget, and desired destinations.

Features:

	•	Custom Travel Recommendations: Users can receive travel recommendations by specifying their departure city, travel dates, interests, and budget.
	•	Dynamic Itineraries: Based on the selected destination, TripBuddy generates a detailed day-by-day itinerary showcasing activities, sites, and dining options.
	•	User-Friendly Interface: A clean and interactive interface that guides users through the process of finding the best travel options.

Technologies Used:

	•	Frontend: React.js, HTML, CSS
	•	Backend: Node.js, Express.js
	•	APIs: OpenAI for generating content, Unsplash for images
	•	Deployment: Docker, Google Cloud Run


**Local Setup**
 1. Clone Repo:

git clone https://github.com/yourusername/tripbuddy.git
cd tripbuddy

 2. Install Dependencies:

cd frontend
npm install

cd ../backend
npm install

 3. Set Up Environment Variables:

(create a .env file in the backend directory and add the following:)
OPENAI_API_KEY=your_openai_api_key
UNSPLASH_API_KEY=your_unsplash_api_key

 4. Run the App:

(in the frontend:)
npm start

(in the backend:)
node index.js


**Deployment**
To deploy TripBuddy using Docker and Google Cloud Run, follow these steps:

1. Build the Docker Image:

docker build --platform linux/amd64 -t gcr.io/your-project-id/tripbuddy .

2. Push the Image to Google Container Registry:

docker push gcr.io/your-project-id/tripbuddy

3. Deploy to Google Cloud Run:

gcloud run deploy tripbuddy --image gcr.io/your-project-id/tripbuddy --platform managed --region your-region --allow-unauthenticated


Contact: griffinjsisk@gmail.com for querys





