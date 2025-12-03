// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const cors = require("cors");
// dotenv.config();

// const myRouter = require("./src/routes/myRouter");
// const connectDB = require("./src/config/connectDB");

// const port = process.env.PORT || 3000;

// app.use(express.json());

// app.use(express.urlencoded({ extended: true }));
// app.use(cors());
// app.use("/api", myRouter);

// app.listen(port, () => {
//   try {
//     connectDB().then(() => {
//       console.log(`Server is running on port ${port}`);
//     });
//   } catch (error) {
//     console.error("Error starting server:", error);
//   }
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const myRouter = require("./src/routes/myRouter");
const connectDB = require("./src/config/connectDB");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api", myRouter);

// Start server ONLY after DB connects
async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
