import dotenv from "dotenv";

import app from "./app";

dotenv.config();

const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
