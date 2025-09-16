import app from "./app.js";
import { config } from "./config/env.js";
import { swaggerDocs } from "./config/swagger.js";
const port = config.PORT || 3000;

swaggerDocs(app, port);

app.listen(config.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
