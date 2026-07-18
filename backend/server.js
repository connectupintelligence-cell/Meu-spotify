const express = require("express");
const cors = require("cors");
const axios = require("axios");
const xml2js = require("xml2js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the GitHub Pages frontend can access the backend
app.use(cors());
app.use(express.json());

// XML Parser for RSS feeds
const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Spotify Scribe Backend is running!" });
});

/**
 * POST /api/transcribe
 * Recebe o link do Spotify, busca metadados públicos, resolve para áudio do RSS
 * e transcreve usando Deepgram (com fallback inteligente via OpenAI GPT)
 */
app.post("/api/transcribe", async (req, res) => {
  try {
    const { url, language, action } = req.body;

    if (!url) {
      return res.status(400).json({ error: "A URL do Spotify é obrigatória." });
    }

    console.log(`[Transcribe] Iniciando processamento para URL: ${url}`);

    // Extrair ID e tipo de mídia da URL do Spotify
    let episodeId = "ep_" + Date.now();
    let mediaType = "episode";
    
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        mediaType = pathParts[0]; // e.g. "episode", "show", "track"
        episodeId = pathParts[1]; // e.g. "3Ur84Kfs82Jh98saHD8D"
      }
    } catch (e) {
      console.warn("[URL Parser] Não foi possível parsear a URL para extrair tipo/ID:", e.message);
    }

    // 1. Obter metadados do Spotify oEmbed
    let oembedData = null;
    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      const oembedResponse = await axios.get(oembedUrl);
      oembedData = oembedResponse.data;
    } catch (err) {
      console.error("[oEmbed] Erro ao obter metadados do oEmbed:", err.message);
      return res.status(400).json({ error: "Não foi possível obter metadados públicos deste link do Spotify. Verifique se o link está correto." });
    }

    // 2. Extrair título e nome do show
    let realTitle = oembedData.title || "Conteúdo do Spotify";
    let realShow = "Spotify Creator";
    const realCover = oembedData.thumbnail_url || "https://images.unsplash.com/photo-1614680376593?q=80&w=300&h=300&fit=crop";

    if (realTitle.includes(" - show ")) {
      const parts = realTitle.split(" - show ");
      realTitle = parts[0].trim();
      realShow = parts[1].trim();
    } else if (realTitle.includes(" | ")) {
      const parts = realTitle.split(" | ");
      realTitle = parts[0].trim();
      realShow = parts[1].trim();
    } else if (realTitle.includes(" by ")) {
      const parts = realTitle.split(" by ");
      realTitle = parts[0].trim();
      realShow = parts[1].trim();
    }

    console.log(`[Metadata] Título: "${realTitle}" | Show: "${realShow}"`);

    // 3. Mapear o podcast para seu feed RSS público via iTunes Search API
    let mp3Url = null;
    let duration = "04:10";
    let durationSeconds = 250;
    let resolvedFromRss = false;

    try {
      console.log(`[iTunes] Buscando feed RSS para o podcast: "${realShow}"`);
      const itunesSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(realShow)}&entity=podcast&limit=1`;
      const itunesResponse = await axios.get(itunesSearchUrl);
      
      if (itunesResponse.data.results && itunesResponse.data.results.length > 0) {
        const feedUrl = itunesResponse.data.results[0].feedUrl;
        console.log(`[iTunes] Feed RSS localizado: ${feedUrl}`);

        // Baixar e processar o feed XML do podcast
        const rssResponse = await axios.get(feedUrl, { timeout: 8000 });
        const parsedRss = await xmlParser.parseStringPromise(rssResponse.data);
        
        const items = parsedRss.rss.channel.item;
        const itemsArray = Array.isArray(items) ? items : [items];

        console.log(`[RSS] Analisando ${itemsArray.length} episódios do feed RSS...`);

        // Fuzzy match: Procura pelo episódio no feed RSS cujo título seja mais parecido
        let bestMatch = null;
        let highestScore = 0;

        const cleanString = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanTitleToMatch = cleanString(realTitle);

        for (const item of itemsArray) {
          const itemTitle = item.title;
          if (!itemTitle) continue;

          const cleanItemTitle = cleanString(itemTitle);
          
          // Verifica se um contém o outro (caso mais simples de match)
          let score = 0;
          if (cleanItemTitle.includes(cleanTitleToMatch) || cleanTitleToMatch.includes(cleanItemTitle)) {
            score = 100;
          } else {
            // Conta quantas palavras em comum existem
            const words1 = new Set(realTitle.toLowerCase().split(/\s+/));
            const words2 = new Set(itemTitle.toLowerCase().split(/\s+/));
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            score = (intersection.size / Math.max(words1.size, words2.size)) * 100;
          }

          if (score > highestScore && score > 30) {
            highestScore = score;
            bestMatch = item;
          }
        }

        if (bestMatch && bestMatch.enclosure && bestMatch.enclosure.url) {
          mp3Url = bestMatch.enclosure.url;
          resolvedFromRss = true;
          console.log(`[RSS] Sucesso! Episódio correspondente encontrado. Áudio MP3: ${mp3Url}`);
          
          // Tenta extrair a duração real
          if (bestMatch["itunes:duration"]) {
            const rawDuration = bestMatch["itunes:duration"];
            duration = rawDuration;
            if (rawDuration.includes(":")) {
              const parts = rawDuration.split(":").map(Number);
              if (parts.length === 3) {
                durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
              } else if (parts.length === 2) {
                durationSeconds = parts[0] * 60 + parts[1];
              }
            } else {
              durationSeconds = parseInt(rawDuration, 10) || 250;
              // formata para MM:SS
              const mins = Math.floor(durationSeconds / 60);
              const secs = durationSeconds % 60;
              duration = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
            }
          }
        } else {
          console.warn("[RSS] Nenhum episódio no feed RSS correspondeu ao título do Spotify oEmbed.");
        }
      } else {
        console.warn("[iTunes] Podcast não localizado no diretório do iTunes.");
      }
    } catch (rssErr) {
      console.error("[RSS Resolver] Falha ao obter ou processar feed RSS:", rssErr.message);
    }

    // Se falhar na resolução do RSS, usa um áudio de demonstração genérico
    if (!mp3Url) {
      console.log("[Audio] Usando áudio genérico para testes devido à falha de resolução do RSS.");
      mp3Url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
    }

    // 4. Executar a Transcrição Real (apenas se action !== "download")
    let transcript = [];
    let transcriptionEngine = "simulated";

    if (action === "download") {
      transcriptionEngine = "skipped";
      transcript = [
        { start: 0, speaker: "Sistema", text: "Transcrição não solicitada. O áudio do episódio foi carregado com sucesso para audição ou download direto." }
      ];
    } else {
      const deepgramKey = process.env.DEEPGRAM_API_KEY;

      if (deepgramKey && resolvedFromRss) {
      // Caso tenhamos a chave da Deepgram e o link do MP3 real do podcast
      try {
        const targetLanguage = language || "pt-BR";
        console.log(`[Deepgram] Iniciando transcrição real (${targetLanguage}) para URL: ${mp3Url}`);
        
        const deepgramResponse = await axios.post(
          `https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true&paragraphs=true&punctuate=true&language=${targetLanguage}`,
          { url: mp3Url },
          {
            headers: {
              "Authorization": `Token ${deepgramKey}`,
              "Content-Type": "application/json"
            },
            timeout: 60000 // 60 segundos de timeout para áudios longos
          }
        );

        const alternatives = deepgramResponse.data.results.channels[0].alternatives[0];
        
        if (alternatives.paragraphs && alternatives.paragraphs.paragraphs) {
          const paragraphs = alternatives.paragraphs.paragraphs;
          transcript = paragraphs.flatMap(para => {
            return para.sentences.map(sent => ({
              start: Math.round(sent.start),
              speaker: `Orador ${para.speaker + 1}`,
              text: sent.text.trim()
            }));
          });
          transcriptionEngine = "deepgram";
          console.log(`[Deepgram] Transcrição concluída! ${transcript.length} frases geradas.`);
        } else if (alternatives.words && alternatives.words.length > 0) {
          // Fallback se não tiver parágrafos estruturados (agrupa palavras por orador em janelas de 6 segundos)
          const words = alternatives.words;
          let currentSpeaker = words[0].speaker;
          let currentText = [];
          let startTime = words[0].start;

          for (const word of words) {
            if (word.speaker !== currentSpeaker || currentText.length > 15) {
              transcript.push({
                start: Math.round(startTime),
                speaker: `Orador ${currentSpeaker + 1}`,
                text: currentText.join(" ")
              });
              currentSpeaker = word.speaker;
              currentText = [word.punctuated_word || word.word];
              startTime = word.start;
            } else {
              currentText.push(word.punctuated_word || word.word);
            }
          }
          if (currentText.length > 0) {
            transcript.push({
              start: Math.round(startTime),
              speaker: `Orador ${currentSpeaker + 1}`,
              text: currentText.join(" ")
            });
          }
          transcriptionEngine = "deepgram";
          console.log(`[Deepgram] Transcrição (via palavras) concluída! ${transcript.length} frases geradas.`);
        }
      } catch (dgErr) {
        console.error("[Deepgram] Erro ao transcrever com a API:", dgErr.message);
      }
    }
  }

    // Fallback de Transcrição se não houver Deepgram ou se a transcrição falhou
    if (transcript.length === 0) {
      console.log("[Fallback] Carregando transcrição genérica estática.");
      transcript = [
        { start: 0, speaker: "Locutor A", text: `Olá! Carregamos com sucesso o link do episódio "${realTitle}".` },
        { start: 10, speaker: "Locutor A", text: `Este conteúdo é apresentado por "${realShow}".` },
        { start: 20, speaker: "Locutor B", text: "Para realizar transcrições reais de áudio, certifique-se de configurar a API key da Deepgram (DEEPGRAM_API_KEY) no arquivo .env do seu servidor backend." },
        { start: 35, speaker: "Locutor B", text: "O player sincronizado permite clicar em qualquer frase para pular o áudio para o tempo correspondente." },
        { start: 48, speaker: "Locutor A", text: "Você também pode exportar o resultado como legenda SRT ou arquivo de texto TXT." }
      ];
    }

    // 5. Insights estáticos (geração de resumo dinâmico via OpenAI removida)
    let aiInsights = {
      summary: `Resumo do episódio '${realTitle}' de '${realShow}'. (Geração de resumo automático desativada no momento).`,
      keyTakeaways: [
        "Metadados e detalhes do episódio carregados de forma automatizada.",
        "Link de reprodução de áudio original obtido via feed RSS.",
        "A extração de insights por inteligência artificial está temporariamente desativada."
      ],
      actionItems: [
        "Acompanhar o canal original para novos lançamentos.",
        "Baixar o arquivo TXT ou SRT da transcrição no topo da página."
      ],
      topics: ["Podcast", realShow || "Spotify"]
    };

    // 6. Retornar resposta completa montada
    const responsePayload = {
      id: episodeId,
      title: realTitle,
      showName: realShow,
      spotifyUrl: url,
      coverUrl: realCover,
      audioUrl: mp3Url,
      duration: duration,
      durationSeconds: durationSeconds,
      dateAdded: new Date().toISOString().split("T")[0],
      category: mediaType === "track" ? "Música" : "Podcast",
      aiInsights: aiInsights,
      transcript: transcript,
      metadata: {
        resolvedFromRss,
        transcriptionEngine
      }
    };

    console.log(`[Success] Processamento concluído com motor: ${transcriptionEngine}`);
    res.json(responsePayload);

  } catch (error) {
    console.error("[Server Error] Erro crítico no processamento:", error);
    res.status(500).json({ error: "Erro interno no servidor ao processar transcrição.", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Spotify Scribe Backend rodando com sucesso!`);
  console.log(` Servidor escutando na porta: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
