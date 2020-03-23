require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/agent", require("./routes/api/agent"));
app.use("/api/patients", require("./routes/api/patients"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
