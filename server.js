const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const bcrypt = require('bcrypt');

// Create an Express application
const app = express();
const port = 3000;

// Enable CORS for requests from your Angular app
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/uas-frontend', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schema
const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});
const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  intensity: { type: String, required: true }
});
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create a Model based on the schema
const Article = mongoose.model('Article', articleSchema);
const Workout = mongoose.model('Workout', workoutSchema);
const User = mongoose.model('User', userSchema);

// Routes to handle CRUD operations

// Dummy user data (untuk testing)
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' }
];

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Find user in MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error during login' });
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Failed to authenticate token' });
      }

      req.user = decoded;
      next();
  });
};

app.get('/api/protected-route', authenticate, (req, res) => {
  res.json({ message: 'You have access to this protected route', user: req.user });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Articles CRUD Start //
// Get all articles
app.get('/api/articles', (req, res) => {
    Article.find({})
      .then(articles => {
        res.json(articles);
      })
      .catch(err => {
        res.status(500).send('Error retrieving articles');
      });
  });

// Add a new article
app.post('/api/articles', (req, res) => {
    const newArticle = new Article(req.body);
    newArticle.save()
      .then(article => {
        res.json(article);
      })
      .catch(err => {
        res.status(500).send('Error adding article');
      });
  });

// Delete an article by ID
app.delete('/api/articles/:id', (req, res) => {
    Article.findByIdAndDelete(req.params.id)
        .then(article => {
        if (!article) {
            return res.status(404).send('Article not found');
        }
        res.json({ message: 'Article deleted successfully' });
        })
        .catch(err => {
        res.status(500).send('Error deleting article');
        });
    });

// Update an article by ID
app.put('/api/articles/:id', async (req, res) => {
    try {
      const updatedArticle = await Article.findByIdAndUpdate(
        req.params.id, // ID artikel yang ingin diperbarui
        { title: req.body.title, content: req.body.content }, // Data baru untuk diperbarui
        { new: true } // Mengembalikan artikel yang sudah diperbarui
      );
  
      if (!updatedArticle) {
        return res.status(404).send('Article not found');
      }
  
      res.json(updatedArticle); // Mengirimkan artikel yang telah diperbarui
    } catch (err) {
      console.error('Error updating article:', err); // Log jika terjadi error di server
      res.status(500).send('Error updating article');
    }
  });
  
// Articles CRUD End //

// Workout CRUD Start //
// Get all workouts
app.get('/api/workouts', async (req, res) => {
  try {
      const workouts = await Workout.find();
      res.json(workouts);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Add a new workout
app.post('/api/workouts', async (req, res) => {
  try {
      const newWorkout = new Workout(req.body);
      const savedWorkout = await newWorkout.save();
      res.status(201).json(savedWorkout);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

// Delete a workout
app.delete('/api/workouts/:id', async (req, res) => {
  try {
      await Workout.findByIdAndDelete(req.params.id);
      res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
// Workout CRUD End //

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
