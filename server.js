const express = require('express');
const videoRoutes = require('./routes/videoRoutes');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/videos', videoRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
