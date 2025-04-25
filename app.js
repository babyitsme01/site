// Import dependencies
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create an express app instance
const app = express();  // <-- Define the app instance here

const PORT = 3000;

// Middleware for handling form submissions and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Handle the form submission and redirect to result page
app.post('/submit', upload.fields([{ name: 'photo' }, { name: 'song' }]), (req, res) => {
  const username = req.body.username;
  const photoPath = `/uploads/${req.files['photo'][0].filename}`;
  const songPath = `/uploads/${req.files['song'][0].filename}`;

  // Redirect to the result page with the data
  res.redirect(`/result?username=${username}&photo=${photoPath}&song=${songPath}`);
});

// Serve the result page with the submitted data
app.get('/result', (req, res) => {
  const username = req.query.username;
  const photoPath = req.query.photo;
  const songPath = req.query.song;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <title>${username}'s Song</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1e1e2f, #3a3a5f);
          font-family: 'Segoe UI', sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }

        .player-container {
          width: 90%;
          max-width: 400px;
          background: #121212;
          border-radius: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          padding: 30px 20px;
          text-align: center;
          position: relative;
        }

        .album-art {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 20px;
          box-shadow: 0 0 20px #f5c518;
          animation: pulse 3s infinite ease-in-out;
        }

        .album-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        h2 {
          margin: 10px 0;
          font-size: 1.4rem;
          color: #f5c518;
        }

        audio {
          display: none;
        }

        .bars {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin: 20px 0;
          height: 40px;
        }

        .bar {
          width: 4px;
          background: #f5c518;
          border-radius: 2px;
          animation: bounce 1s infinite ease-in-out;
        }

        .bar:nth-child(1) { animation-delay: 0s; }
        .bar:nth-child(2) { animation-delay: 0.2s; }
        .bar:nth-child(3) { animation-delay: 0.4s; }
        .bar:nth-child(4) { animation-delay: 0.2s; }
        .bar:nth-child(5) { animation-delay: 0s; }

        @keyframes bounce {
          0%, 100% { height: 10px; }
          50% { height: 40px; }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #f5c518; }
          50% { box-shadow: 0 0 30px #ff8c00; }
        }

        .controls {
          margin-top: 10px;
        }

        .play-btn {
          width: 60px;
          height: 60px;
          background: #f5c518;
          border-radius: 50%;
          border: none;
          color: #121212;
          font-size: 2rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .play-btn:hover {
          background: #ffcc00;
        }
      </style>
    </head>
    <body>
      <div class="player-container">
        <div class="album-art">
          <img src="${photoPath}" alt="Album Art">
        </div>
        <h2>${username}'s Song</h2>

        <div class="bars">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>

        <div class="controls">
          <button class="play-btn" id="playPauseBtn">▶</button>
        </div>

        <audio id="audio" src="${songPath}"></audio>
      </div>

      <script>
        const audio = document.getElementById('audio');
        const btn = document.getElementById('playPauseBtn');

        btn.addEventListener('click', () => {
          if (audio.paused) {
            audio.play();
            btn.textContent = '⏸';
          } else {
            audio.pause();
            btn.textContent = '▶';
          }
        });

        audio.addEventListener('ended', () => {
          btn.textContent = '▶';
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});