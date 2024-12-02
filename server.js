const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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
  content: String,
  category: String,
  image: String,
}, { timestamps: true });
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
  profileImage: { type: Buffer },
  isAdmin: { type: Boolean, default: false }
});
const commentSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const recipeSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  image: String,
}, { timestamps: true });
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

// Buat admin
(async () => {
  try {
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log('Admin user already exists.');
    } else {
      const hashedPassword = await bcrypt.hash('123', 10);
      const newAdminUser = new User({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        isAdmin: true
      });
      await newAdminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
})();

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
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      SECRET_KEY,
    );    
    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email, isAdmin } = req.body;

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

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      isAdmin: isAdmin === true // Default is `false` if not provided
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Hapus account
app.delete('/api/deleteAccount', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.id;

      // Hapus akun dari database
      const result = await User.deleteOne({ _id: userId });
      
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Akun berhasil dihapus' });
  } catch (err) {
      console.error('Error deleting account:', err);
      res.status(500).json({ message: 'Terjadi kesalahan saat menghapus akun' });
  }
});

// Ubah password
app.post('/api/changePassword', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { oldPassword, newPassword } = req.body;

  if (!token || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Semua data diperlukan.' });
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.id;

      // Temukan pengguna berdasarkan ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }

      // Verifikasi password lama
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Password lama salah.' });
      }

      // Hash password baru dan simpan
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password berhasil diubah.' });
  } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengubah password.' });
  }
});

// Forgot Password endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { username, email, newPassword } = req.body;

  if (!username || !email || !newPassword) {
    return res.status(400).json({ message: 'Username, email, and new password are required' });
  }

  try {
    // Find user with matching username and email
    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid username or email' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error during password reset:', err);
    res.status(500).json({ message: 'Error during password reset' });
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
      req.user = { id: user.id, username: user.username, isAdmin: user.isAdmin };
      next();
  });
};

// Articles Start //
// Get all articles
app.get('/api/articles', (req, res) => {
  const { search, category, sortBy } = req.query;

  let filter = {};
  if (search) {
      filter.title = { $regex: search, $options: 'i' };
  }
  if (category) {
      filter.category = category;
  }

  let sort = {};
  if (sortBy === 'newest') {
      sort.createdAt = -1;
  } else if (sortBy === 'oldest') {
      sort.createdAt = 1;
  }

  Article.find(filter)
      .sort(sort)
      .then(articles => res.json(articles))
      .catch(err => {
          console.error(err);
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
  const { title, content, category, image } = req.body;

  if (!title || !content || !category) {
      return res.status(400).send('Title, content, and category are required.');
  }

  const newArticle = new Article({ title, content, category, image });
  newArticle.save()
      .then(article => res.json(article))
      .catch(err => {
          console.error(err);
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
      const { title, content, category } = req.body;

      if (!title || !content || !category) {
          return res.status(400).send('Title, content, and category are required.');
      }

      const updatedArticle = await Article.findByIdAndUpdate(
          req.params.id,
          { title, content, category },
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
  const { search, category, sortBy } = req.query;

  let filter = {};
  if (search) {
      filter.title = { $regex: search, $options: 'i' };
  }
  if (category) {
      filter.category = category;
  }

  let sort = {};
  if (sortBy === 'newest') {
      sort.createdAt = -1;
  } else if (sortBy === 'oldest') {
      sort.createdAt = 1;
  }

  Recipe.find(filter)
      .sort(sort)
      .then(recipes => res.json(recipes))
      .catch(err => {
          console.error(err);
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
  const { title, content, category, image } = req.body;

  if (!title || !content || !category) {
    return res.status(400).send('Title, content, and category are required.');
  }

  const newRecipe = new Recipe({ title, content, category, image });
  newRecipe.save()
    .then(recipe => {
      res.status(201).json(recipe);
    })
    .catch(err => {
      console.error(err);
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
      const { title, content, category } = req.body;

      if (!title || !content || !category) {
          return res.status(400).send('Title, content, and category are required.');
      }

      const updatedRecipe = await Recipe.findByIdAndUpdate(
          req.params.id,
          { title, content, category },
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

// Add an endpoint to upload the profile image
app.post('/api/uploadProfileImage', authenticateToken, upload.single('image'), async (req, res) => {
  const userId = req.user.id;
  const image = req.file.buffer;

  try {
      const user = await User.findByIdAndUpdate(userId, { profileImage: image }, { new: true });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'Profile image uploaded successfully' });
  } catch (err) {
      console.error('Error uploading profile image:', err);
      res.status(500).json({ message: 'Error uploading profile image' });
  }
});

app.get('/api/profileImage', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
      const user = await User.findById(userId);
      if (!user || !user.profileImage) {
          return res.status(404).json({ message: 'Profile image not found' });
      }

      res.contentType('image/jpeg');
      res.send(user.profileImage);
  } catch (err) {
      console.error('Error fetching profile image:', err);
      res.status(500).json({ message: 'Error fetching profile image' });
  }
});
// Profile End //

// Admin Start //
app.get('/api/auth/user', authenticateToken, (req, res) => {
  if (req.user) {
      res.json({
          isAuthenticated: true,
          user: {
              id: req.user.id,
              username: req.user.username,
              isAdmin: req.user.isAdmin,
          },
      });
  } else {
      res.json({ isAuthenticated: false });
  }
});
// Fetch all comments
app.get('/api/comments', async (req, res) => {
  try {
      const comments = await Comment.find();
      res.status(200).json(comments);
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.get('/api/recipecomments', async (req, res) => {
  try {
    const comments = await RecipeComment.find();
    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: 'No comments found.' });
    }
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving comments', error });
  }
});

// Delete a recipe comment
app.delete('/api/recipecomments/:id', async (req, res) => {
  try {
    const commentId = req.params.id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Attempt to delete comment
    const deletedComment = await RecipeComment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});
// Admin End //

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
