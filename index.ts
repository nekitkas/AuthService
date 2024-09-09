import express from 'express';
import cors from 'cors';
import { log } from './src/middleware/log';
import cookieParser from 'cookie-parser';
import { router } from './src/routes';
import swaggerOutput from './src/swagger_output.json';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(log);
app.use(router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const start = async () => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

void start();
