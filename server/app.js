const express = require("express");

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api/pdf", require("./routes/pdf"));

const PORT = 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
