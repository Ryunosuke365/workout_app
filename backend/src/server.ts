import dotenv from "dotenv";

dotenv.config();

import app from "./app";

const PORT: number = 3001;
const HOST: string = "0.0.0.0";

app.listen(PORT, HOST);