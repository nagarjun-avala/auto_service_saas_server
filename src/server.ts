import "dotenv/config";

import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
    console.log(`🚗 Auto Service SaaS API running on port ${PORT}`);
});