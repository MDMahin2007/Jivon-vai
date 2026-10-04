import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

// সার্ভার রান করা
app.listen(PORT, () => {
    console.log(`Contact API running on port ${PORT}`);
});