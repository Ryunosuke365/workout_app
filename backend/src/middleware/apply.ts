import express, { Application } from "express";
import cors, { CorsOptions } from "cors";

const allowedOrigin: string = "http://54.150.204.177";

export const applyMiddlewares = (app: Application): void => {
  app.use(express.json());

  const corsOptions: CorsOptions = { origin: allowedOrigin };
  app.use(cors(corsOptions));
};

export default applyMiddlewares;