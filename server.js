
const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Forsaken: Tu Propio Caos - servidor preparado");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor de Forsaken iniciado");
});
