// This line waits for the entire HTML page to load before running any JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get references to our important HTML elements ---
    // We "grab" them by their 'id' so we can control them
    const generationForm = document.getElementById('generation-form');
    const topicInput = document.getElementById('topic-input');
    const difficultySelect = document.getElementById('difficulty-select');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsContainer = document.getElementById('results-container');
    const generateButton = document.getElementById('generate-button');

    // --- 2. Listen for the "submit" event on the form ---
    // This function will run every time the user clicks the "Generate Lesson" button
    generationForm.addEventListener('submit', async (event) => {
        
        // This stops the browser from doing its default "page refresh" on submit
        event.preventDefault(); 

        // --- 3. Show loading and clear old results ---
        loadingSpinner.classList.remove('hidden'); // Show the "Please wait..."
        resultsContainer.innerHTML = ''; // Clear any previous lesson
        generateButton.disabled = true; // Disable the button so we don't click it 100 times

        // --- 4. Get the user's input values ---
        const topic = topicInput.value;
        const difficulty = difficultySelect.value;
        
        // Find out which checkboxes are ticked
        const formats = [];
        if (document.getElementById('format-diagram').checked) {
            formats.push('diagram');
        }
        if (document.getElementById('format-audio').checked) {
            formats.push('audio');
        }
        if (document.getElementById('format-video').checked) {
            formats.push('video');
        }

        // --- 5. Send this data to your Backend (the Python AI) ---
        // 'fetch' is the built-in JavaScript command for making API calls (HTTP requests)
        try {
            const response = await fetch('http://localhost:8000/generate', {
                method: 'POST', // We are *sending* data
                headers: {
                    'Content-Type': 'application/json', // We are sending JSON
                },
                // This converts our JavaScript object into a JSON string to send
                body: JSON.stringify({
                    topic: topic,
                    difficulty: difficulty,
                    formats: formats
                }),
            });

            if (!response.ok) {
                // If the server sends an error (e.g., "500 Internal Server Error")
                throw new Error(`Server error: ${response.statusText}`);
            }

            // Get the JSON data back from the server
            const data = await response.json();
            
            // --- 6. Display the results! ---
            displayResults(data);

        } catch (error) {
            // This 'catch' block runs if the 'fetch' fails (e.g., network error or backend is off)
            console.error('Error fetching lesson:', error);
            resultsContainer.innerHTML = `<p style="color: red;">Oops! Something went wrong. ${error.message}</p>`;
        } finally {
            // This 'finally' block runs *no matter what* (success or error)
            loadingSpinner.classList.add('hidden'); // Hide the loading message
            generateButton.disabled = false; // Re-enable the button
        }
    });

    // --- 7. A helper function to put the results on the page ---
    function displayResults(data) {
        // Clear old results
        resultsContainer.innerHTML = '';

        // 'data' is the JSON object your Python backend sends.
        // We are *assuming* it has a structure like:
        // { text: "...", imageUrl: "...", audioUrl: "..." }

        // Add the text explanation
        if (data.text) {
            const textElement = document.createElement('p');
            textElement.textContent = data.text;
            resultsContainer.appendChild(textElement);
        }

        // Add the generated image
        if (data.imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = data.imageUrl;
            imgElement.alt = "Generated diagram";
            resultsContainer.appendChild(imgElement);
        }

        // Add the generated audio
        if (data.audioUrl) {
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = data.audioUrl;
            resultsContainer.appendChild(audioElement);
        }
        
        // (You would add a similar block for video if your backend sends a videoUrl)
    }
});
