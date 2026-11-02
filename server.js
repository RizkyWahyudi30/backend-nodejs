import "dotenv/config";
import express from "express";
import AuthRouter from "./routers/auth.router.js";

const app = express();
const port = 3000;

app.use(express.json());

// route
app.use("/api/v1/", AuthRouter);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({
    message: "Internal server error!",
  });
});

app.listen(port, () => {
  console.log(`Server jalan di port: ${port}`);
});
