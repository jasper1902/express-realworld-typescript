import mongoose from "mongoose";

export default (uri: string) => {
  mongoose.set("strictQuery", false);
  mongoose.connect(uri);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
};
