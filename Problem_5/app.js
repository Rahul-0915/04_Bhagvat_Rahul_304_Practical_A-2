const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});