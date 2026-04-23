import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import router from "./router";
import swaggerSpec from "./swagger";
import { errorHandler } from "./shared/middleware/error-handler";
import { startEventReminderScheduler } from "./shared/scheduler/event-reminder";

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🎩 Sebastian API running on http://localhost:${config.port}`);
  startEventReminderScheduler();
});

export default app;
