import app from './app.ts';
import { config } from './config/env.ts';
import { swaggerDocs } from './config/swagger.ts';
const port = config.PORT || 3000;

swaggerDocs(app,port);

app.listen(config.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});