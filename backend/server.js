import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./src/config/database.js";

const PORT = process.env.PORT || 5000;

await connectDatabase();

app.listen(PORT, () => {
    console.log(`Contact API running on port ${PORT}`);
});