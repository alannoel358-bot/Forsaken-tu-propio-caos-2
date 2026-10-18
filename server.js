
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
app.use(express.json());
app.post("/api/chat", async (req, res) => {
  const { character, message } = req.body || {};

  const personalities = {
    "Chaos Sonic":
      "Eres Chaos Sonic, arrogante, sarcástico y provocador. Hablas en español y actúas con superioridad.",
    "Nine":
      "Eres Nine, inteligente, reservado y desconfiado. Hablas en español.",
    "Sonic":
      "Eres Sonic, bromista, valiente y seguro de sí mismo. Hablas en español."
  };

  if (!personalities[character]) {
    return res.status(400).json({
      error: "Personaje desconocido."
    });
  }

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Escribe un mensaje."
    });
  }

  if (!process.env.HF_TOKEN) {
    return res.status(500).json({
      error: "Falta configurar HF_TOKEN en Render."
    });
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:fastest",
          messages: [
            {
              role: "system",
              content: personalities[character]
            },
            {
              role: "user",
              content: message.slice(0, 1000)
            }
          ],
          max_tokens: 180
        })
      }
    );

    if (!response.ok) {
      console.error("Error del proveedor:", response.status);
      return res.status(502).json({
        error: "La IA no pudo responder. Comprueba el modelo y los créditos disponibles."
      });
    }

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content ||
        "No recibí una respuesta de la IA."
    });
  } catch (error) {
    console.error("Falló la conexión con el proveedor.");
    res.status(500).json({
      error: "No se pudo conectar con la IA."
    });
  }
});
