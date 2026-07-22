import express from "express";
import 'dotenv/config';
import {connectDB} from "./lib/db.js"
//---
import authRoutes from "./routes/auth.route.js"


//------- connect To DB


//-------
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json())
app.use("/api/auth",authRoutes)


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port,()=>{
  console.log(`Server is running on ${port}`)
  connectDB();
})

