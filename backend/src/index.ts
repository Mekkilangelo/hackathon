import express from "express";
import cors from "cors";
import { config } from "./config";
import router from "./router";
import { errorHandler } from "./shared/middleware/error-handler";

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🎩 Sebastian API running on http://localhost:${config.port}`);
});

export default app;
