import express, { NextFunction, Request, Response } from "express";
import connectDB from "./src/config/connectDB";
import * as dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import morgan from "morgan";
import corsOptions from "./src/config/corsOptions";
import userRoutes from "./src/routes/userRoutes";
import profileRoutes from "./src/routes/profileRoutes";
import { catchInvalidJsonError } from "./src/middlewares/catchInvalidJsonError";
import createHttpError, { isHttpError } from "http-errors";
import articleRoutes from "./src/routes/articleRoutes";

dotenv.config();
const app = express();

//middleware
app.use(cors(corsOptions));
app.use(express.json());
// app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/*+json" }));

app.use(catchInvalidJsonError);

// log only 4xx and 5xx responses to console
app.use(
  morgan("dev", {
    skip: function (req: Request, res: Response) {
      return res.statusCode < 400;
    },
  })
);

// log all requests to access.log
app.use(
  morgan("common", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  })
);

// connect to mongodb
let uri: string;
if (process.env.MONGO_URI) {
  uri = process.env.MONGO_URI;
} else {
  throw new Error("MONGO_URI not defined");
}
connectDB(uri);

// user routes - for /api/users and /api/user
app.use("/api", userRoutes);
// user routes - for profiles
app.use("/api/profiles", profileRoutes);
// article routes
app.use('/api/articles', articleRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
      statusCode = error.status;
      errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
