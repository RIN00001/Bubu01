import express from 'express';
import { PORT } from './utils/env-utils';
import { publicRouter } from './routes/public-api';
import { errorMiddleware } from './middleware/error-middleware';
import { privateRouter } from './routes/private-api';
const app = express()

app.use(express.json());
app.use("/api", publicRouter)
app.use("/api", privateRouter)
app.use(errorMiddleware)

app.listen(PORT || 3000, () => {
    console.log(`Server is running on port ${PORT}`);
}) 