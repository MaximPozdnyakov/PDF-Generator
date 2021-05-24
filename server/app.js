const express = require("express");
require("dotenv").config({ path: "server/config/.env" });

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static folder
app.use(express.static("dist"));

// Routes
app.use("/api/pdf", require("./routes/pdf"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
