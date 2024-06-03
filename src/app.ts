import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './schemas';
import connectDB from './config/database';
import dotenv from 'dotenv';
import cors from 'cors';
import AppError from './utils/AppError';
import setStatusCode from './middleware/statusCode';
import rootResolver from './resolvers';
import { buildSchema } from 'graphql';
dotenv.config();
const APP_URL = process.env.APP_URL || 'http://localhost:5000'
const app = express();
connectDB();


var corsOptions = {
  origin: APP_URL,
  optionsSuccessStatus: 200,
  methods: ['*'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}


app.use(cors(corsOptions));
app.use(setStatusCode);


app.use('/graphql', graphqlHTTP((req) => ({
  schema: schema,
  rootValue: rootResolver,
  graphiql: true,
  context: { headers: req.headers },
  customFormatErrorFn: (err: any) => {
    if(err.originalError instanceof AppError) {
      return {
        message: err.message,
        statusCode: err.originalError.statusCode,
        status: err.originalError.status,
      };
    }
    return {
      message: err.message,
      statusCode: 500,
      status: 'error',
    };
  },
})));

app.use((err: AppError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

export default app;
