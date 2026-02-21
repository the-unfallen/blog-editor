// // src/index.js
// require("dotenv").config();
// const express = require("express");
// const prisma = require("./lib/prisma.js");
// const app = express();
// const cors = require("cors");
// const passport = require("passport");
// require("./lib/passport");
// app.use(express.json());
// const cookieParser = require("cookie-parser");
// app.use(cookieParser());
// app.use(
//     cors({
//         origin: ["http://localhost:4000", "http://localhost:5000"],
//     }),
// );

// app.use(passport.initialize());
// const routes = require("./routes");

// app.use("/posts", routes.posts);
// app.use("/users", routes.users);
// app.use("/comments", routes.comments);
// app.use("/auth", routes.auth);
// app.use("/", routes.home);

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

// src/index.js
require("dotenv").config();
const express = require("express");
const prisma = require("./lib/prisma.js");
const cors = require("cors");
const passport = require("passport");
require("./lib/passport");

const app = express();

// ---------------------------
// 1️⃣ Middleware order matters
// ---------------------------

// Parse JSON bodies
app.use(express.json());

// Parse cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// CORS configuration with credentials support
app.use(
    cors({
        origin: ["http://localhost:4000", "http://localhost:5000"], // frontends
        credentials: true, // <--- essential for cookie sending
    }),
);

// Initialize passport
app.use(passport.initialize());

// ---------------------------
// 2️⃣ Routes
// ---------------------------

const routes = require("./routes");

app.use("/posts", routes.posts);
app.use("/users", routes.users);
app.use("/comments", routes.comments);
app.use("/auth", routes.auth);
app.use("/", routes.home);

// ---------------------------
// 3️⃣ Start server
// ---------------------------

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
