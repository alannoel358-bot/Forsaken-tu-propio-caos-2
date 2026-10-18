
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "20kb" }));

// Mostrar el juego
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Personalidades de los personajes
const PERSONAJES = {
  "c00lkidd": "Eres c00lkidd de Forsaken. Eres travieso, infantil y dices teamers >:( y ¡jaja! Hablas en español.",
  "1x1x1x1": "Eres 1x1x1x1 de Forsaken. Eres frío, malvado y serio. Sientes odio hacia Shedletsky. Hablas en español.",
  "two time": "Eres Two Time de Forsaken. Eres inquietante y hablas sobre respawn y segundas oportunidades. Hablas en español.",
  "shedletsky": "Eres Shedletsky de Forsaken. Eres amigable, veterano de Roblox y te gusta tu espada de pollo. Hablas en español.",
  "007n7": "Eres 007n7 de Forsaken. Eres un padre cansado y preocupado por c00lkidd. Hablas en español.",
  "chaos sonic": "Eres Chaos Sonic de Sonic Prime. Eres arrogante, sarcástico, provocador y actúas con superioridad. Hablas en español.",
  "nine": "Eres Nine de Sonic Prime. Eres inteligente, reservado y desconfiado. Hablas en español.",
  "sonic": "Eres Sonic. Eres bromista, valiente y seguro de ti mismo. Hablas en español."
};

// Conexión con la IA
app.post("/api/chat", async (req, res) => {
  const { personaje, mensaje } = req.body || {};

  if (typeof personaje !== "string" ||
      typeof mensaje !== "string" ||
      !mensaje.trim()) {
    return res.status(400).json({
      error: "Indica un personaje y escribe un mensaje."
    });
  }

  const nombre = personaje.trim().toLowerCase();
  const personalidad = PERSONAJES[nombre];

  if (!personalidad) {
    return res.status(400).json({
      error: "Ese personaje no está configurado."
    });
  }

  if (!process.env.HF_TOKEN) {
    return res.status(500).json({
      error: "Falta configurar HF_TOKEN en Render."
    });
  }

  try {
    const respuesta = await fetch(
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
              content: personalidad
            },
            {
              role: "user",
              content: mensaje.trim().slice(0, 1000)
            }
          ],
          max_tokens: 180
        })
      }
    );

    if (!respuesta.ok) {
      console.error("Error del proveedor de IA:", respuesta.status);

      return res.status(502).json({
        error: "La IA no respondió. Puede haber un problema con el modelo, el acceso o los créditos."
      });
    }

    const datos = await respuesta.json();
    const texto = datos.choices?.[0]?.message?.content;

    if (!texto) {
      return res.status(502).json({
        error: "La IA no devolvió una respuesta válida."
      });
    }

    return res.json({ respuesta: texto });

  } catch (error) {
    console.error("Error de conexión con la IA:", error.message);

    return res.status(502).json({
      error: "No se pudo conectar con la IA."
    });
  }
});

// Puerto asignado por Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor de Forsaken iniciado en puerto " + PORT);
});
          
