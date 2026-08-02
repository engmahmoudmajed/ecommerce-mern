import express from "express";
import "dotenv/config"; 
import cookieParser from "cookie-parser";

import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
//---
import authRoutes from "./routes/auth.route.js"


//------- connect To DB


//-------
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
// cookie-parser is Express middleware that reads the Cookie header
// sent by the browser and makes the cookies available as a JavaScript object.
// what mean its allow me to read coolies browser send with request to me in backend
app.use(cookieParser());
app.use("/api/auth", authRoutes)


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
  connectDB();
})

