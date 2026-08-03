import app from './src/app.js';
import { connectDB } from './src/db/connect.js';

connectDB().then(() => {
  app.listen(3000, () => {
    console.log("🚀 AI Battle Arena Server is running on port 3000");
  });
});