import express from "express";
import scaffoldRoutes from "./routes/scaffold";
import cors from "cors";

const app = express();

// Define the CORS options
const corsOptions = {
  origin: "http://localhost:3333",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", scaffoldRoutes);

export default app;
