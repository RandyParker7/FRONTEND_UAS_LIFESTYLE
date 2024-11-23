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
const commentSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a Model based on the schema
const Article = mongoose.model('Article', articleSchema);
const Workout = mongoose.model('Workout', workoutSchema);
const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Routes to handle CRUD operations

// Login Register Start //
// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
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

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});
// Login Register End //

// Articles Start //
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

// Get an article by ID
app.get('/api/articles/:id', (req, res) => {
  Article.findById(req.params.id)
      .then(article => {
          if (!article) {
              return res.status(404).send('Article not found');
          }
          res.json(article);
      })
      .catch(err => {
          console.error('Error retrieving article:', err);
          res.status(500).send('Error retrieving article');
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
        req.params.id,
        { title: req.body.title, content: req.body.content },
        { new: true }
      );
  
      if (!updatedArticle) {
        return res.status(404).send('Article not found');
      }
  
      res.json(updatedArticle);
    } catch (err) {
      console.error('Error updating article:', err);
      res.status(500).send('Error updating article');
    }
  });

// Get comments for an article
app.get('/api/articles/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.id });
    res.json(comments);
  } catch (err) {
    res.status(500).send('Error retrieving comments');
  }
});

// Add a comment to an article
app.post('/api/articles/:id/comments', async (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).send('Author and content are required');
  }

  try {
    const comment = new Comment({ articleId: req.params.id, author, content });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).send('Error adding comment');
  }
});

// Edit a comment
app.put('/api/comments/:id', async (req, res) => {
  const { content } = req.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).send('Comment not found');
    }

    res.json(updatedComment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).send('Error updating comment');
  }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).send('Comment not found');
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).send('Error deleting comment');
  }
});
// Articles End //

// Workout Start //
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
// Workout End //

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
