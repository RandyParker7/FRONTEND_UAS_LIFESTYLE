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
  intensity: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
const commentSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const recipeSchema = new mongoose.Schema({
  title: String,
  content: String
});
const recipeCommentSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a Model based on the schema
const Article = mongoose.model('Article', articleSchema);
const Workout = mongoose.model('Workout', workoutSchema);
const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);
const RecipeComment = mongoose.model('RecipeComment', recipeCommentSchema);

// Routes to handle CRUD operations

// Login Register Start //
// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token with both id and username
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});
// Login Register End //

// Middleware to verify JWT token and extract user info
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
          console.error('JWT Verification Error:', err.message);
          return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = { id: user.id, username: user.username };
      next();
  });
};

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
app.post('/api/articles/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content) {
      return res.status(400).send('Content is required');
  }

  try {
      const comment = new Comment({
          articleId: req.params.id,
          author: req.user.username,
          content,
      });
      await comment.save();
      res.status(201).json(comment);
  } catch (err) {
      console.error('Error adding comment:', err);
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
app.get('/api/workouts', authenticateToken, async (req, res) => {
  try {
      const workouts = await Workout.find({ userId: req.user.id });
      res.json(workouts);
  } catch (err) {
      console.error('Error fetching workouts:', err);
      res.status(500).json({ error: err.message });
  }
});

// Add a new workout
app.post('/api/workouts', authenticateToken, async (req, res) => {
  try {
      const newWorkout = new Workout({
          ...req.body,
          userId: req.user.id,
      });
      const savedWorkout = await newWorkout.save();
      res.status(201).json(savedWorkout);
  } catch (err) {
      console.error('Error adding workout:', err);
      res.status(400).json({ error: err.message });
  }
});

// Update a workout
app.put('/api/workouts/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found or not authorized to edit' });
    }

    const { name, duration, intensity } = req.body;
    if (!name || !duration || !intensity) {
      return res.status(400).json({ message: 'All fields (name, duration, intensity) are required' });
    }

    workout.name = name;
    workout.duration = duration;
    workout.intensity = intensity;

    const updatedWorkout = await workout.save();
    res.json(updatedWorkout);
  } catch (err) {
    console.error('Error updating workout:', err);
    res.status(500).json({ error: err.message });
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

// Food Start //
// Get all recipes
app.get('/api/recipes', (req, res) => {
  Recipe.find({})
    .then(recipes => {
      res.json(recipes);
    })
    .catch(err => {
      res.status(500).send('Error retrieving recipes');
    });
});

// Get a recipe by ID
app.get('/api/recipes/:id', (req, res) => {
  Recipe.findById(req.params.id)
    .then(recipe => {
      if (!recipe) {
        return res.status(404).send('Recipe not found');
      }
      res.json(recipe);
    })
    .catch(err => {
      console.error('Error retrieving recipe:', err);
      res.status(500).send('Error retrieving recipe');
    });
});

// Add a new recipe
app.post('/api/recipes', (req, res) => {
  const newRecipe = new Recipe(req.body);
  newRecipe.save()
    .then(recipe => {
      res.status(201).json(recipe);
    })
    .catch(err => {
      res.status(500).send('Error adding recipe');
    });
});

// Delete a recipe by ID
app.delete('/api/recipes/:id', (req, res) => {
  Recipe.findByIdAndDelete(req.params.id)
    .then(recipe => {
      if (!recipe) {
        return res.status(404).send('Recipe not found');
      }
      res.json({ message: 'Recipe deleted successfully' });
    })
    .catch(err => {
      res.status(500).send('Error deleting recipe');
    });
});

// Update a recipe by ID
app.put('/api/recipes/:id', async (req, res) => {
  try {
      const updatedRecipe = await Recipe.findByIdAndUpdate(
          req.params.id, 
          req.body, // This will update all fields sent in the body
          { new: true }
      );

      if (!updatedRecipe) {
          return res.status(404).send('Recipe not found');
      }

      res.json(updatedRecipe);
  } catch (err) {
      console.error('Error updating recipe:', err);
      res.status(500).send('Error updating recipe');
  }
});

// Get comments for a specific recipe
app.get('/api/recipes/:id/comments', async (req, res) => {
  try {
    const comments = await RecipeComment.find({ recipeId: req.params.id }).populate('recipeId');
    res.json(comments);
  } catch (err) {
    console.error('Error retrieving comments:', err);
    res.status(500).send('Error retrieving comments');
  }
});

// Add a comment to a recipe
app.post('/api/recipes/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).send('Content is required');
  }

  try {
    const comment = new RecipeComment({
      recipeId: req.params.id,
      author: req.user.username,
      content,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Error adding comment');
  }
});

// Edit a comment on a recipe
app.put('/api/recipes/:recipeId/comments/:id', async (req, res) => {
  const { content } = req.body;

  try {
    const updatedComment = await RecipeComment.findByIdAndUpdate(
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

// Delete a comment from a recipe
app.delete('/api/recipes/:recipeId/comments/:id', async (req, res) => {
  const { recipeId, id } = req.params;
  try {
    const deletedComment = await RecipeComment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).send('Comment not found');
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Error deleting comment');
  }
});
// Food End //

// Profile Start //
// Profile endpoint to get the user's profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});
// Profile End //

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
