/**
 * Spotify Scribe - Application Logic
 * Sincronização de áudio/texto, controle de player, busca com destaque,
 * importação de links, Web Speech API e persistência LocalStorage.
 */

// Application State
let currentEpisode = null;
let isPlaying = false;
let isEditMode = false;
let playbackSpeed = 1.0;
let previousVolume = 0.8;
let isMuted = false;

// Search State
let searchMatches = [];
let currentMatchIndex = -1;

// Settings
let defaultLanguage = "pt-BR";
let backendUrl = "http://localhost:3000";

// Elements
const audio = document.getElementById("main-audio-element");
const playBtn = document.getElementById("btn-player-play");
const timelineProgress = document.getElementById("player-progress-bar");
const timelineHandle = document.getElementById("player-slider-handle");
const timeCurrent = document.getElementById("player-time-current");
const timeTotal = document.getElementById("player-time-total");
const speedBadge = document.getElementById("btn-playback-speed");
const volumeSlider = document.getElementById("player-volume");
const volumeIcon = document.getElementById("volume-icon");

const emptyState = document.getElementById("empty-state-view");
const loaderState = document.getElementById("loader-view");
const activeWorkspace = document.getElementById("active-workspace-view");

const wsEpisodeCover = document.getElementById("ws-episode-cover");
const wsShowName = document.getElementById("ws-show-name");
const wsEpisodeTitle = document.getElementById("ws-episode-title");
const wsDateAdded = document.getElementById("ws-date-added");
const wsDuration = document.getElementById("ws-duration");
const wsSpotifyLink = document.getElementById("ws-spotify-link");

const insightsSummary = document.getElementById("insights-summary");
const insightsTakeaways = document.getElementById("insights-takeaways");
const insightsActions = document.getElementById("insights-actions");
const insightsTopics = document.getElementById("insights-topics");

const transcriptContainer = document.getElementById("transcript-container");
const historyList = document.getElementById("history-list");
const spotifyUrlInput = document.getElementById("spotify-url-input");

const searchInput = document.getElementById("transcript-search-input");
const searchNavControls = document.getElementById("search-nav-controls");

// Initialize application on load
window.addEventListener("DOMContentLoaded", () => {
  try {
    loadSettings();
    renderHistory();
    setupDragAndDrop();
    
    // Volume setup
    if (audio && volumeSlider) {
      audio.volume = parseFloat(volumeSlider.value);
    }
  } catch (error) {
    console.error("Erro na inicialização da aplicação:", error);
    alert("Erro ao inicializar o app: " + error.message);
  }
});

// Settings Management
function loadSettings() {
  try {
    defaultLanguage = localStorage.getItem("scribe_language") || "pt-BR";
    backendUrl = localStorage.getItem("scribe_backend_url") || "http://localhost:3000";
    
    const langSelect = document.getElementById("transcription-language");
    const backendInput = document.getElementById("api-backend-url");
    
    if (langSelect) langSelect.value = defaultLanguage;
    if (backendInput) backendInput.value = backendUrl;
  } catch (e) {
    console.warn("LocalStorage bloqueado ou indisponível ao carregar configurações:", e);
  }
}

function saveSettings() {
  try {
    const lang = document.getElementById("transcription-language").value;
    const bUrl = document.getElementById("api-backend-url").value.trim() || "http://localhost:3000";
    
    localStorage.setItem("scribe_language", lang);
    localStorage.setItem("scribe_backend_url", bUrl);
    
    defaultLanguage = lang;
    backendUrl = bUrl;
    
    toggleSettingsModal(false);
    alert("Configurações salvas com sucesso!");
  } catch (e) {
    console.error("Falha ao salvar configurações em LocalStorage:", e);
    alert("Não foi possível salvar as configurações localmente. Verifique se o seu navegador bloqueia cookies/armazenamento local.");
  }
}

function toggleSettingsModal(show) {
  const modal = document.getElementById("settings-modal");
  modal.style.display = show ? "flex" : "none";
}

function closeModalOnOuterClick(event) {
  const modal = document.getElementById("settings-modal");
  if (event.target === modal) {
    toggleSettingsModal(false);
  }
}

// Sidebar Navigation
function showHome() {
  emptyState.style.display = "flex";
  loaderState.style.display = "none";
  activeWorkspace.style.display = "none";
  
  // Pause audio
  if (isPlaying) {
    togglePlay();
  }
  
  document.getElementById("nav-home").classList.add("active");
  document.getElementById("nav-new-transcribe").classList.remove("active");
}

function focusSearch() {
  document.getElementById("nav-home").classList.remove("active");
  document.getElementById("nav-new-transcribe").classList.add("active");
  spotifyUrlInput.focus();
}

// Load Mock Episodes
function loadMockEpisode(id) {
  const episode = window.MOCK_EPISODES.find(ep => ep.id === id);
  if (episode) {
    loadEpisodeData(episode);
  }
}

// Load and Display Episode Data in Workspace
function loadEpisodeData(episode) {
  try {
    if (!episode) throw new Error("Dados do episódio ausentes.");
    currentEpisode = JSON.parse(JSON.stringify(episode)); // deep clone
    
    // Reset áudio & estado do player
    if (audio) {
      audio.src = currentEpisode.audioUrl;
      audio.playbackRate = playbackSpeed;
      audio.load();
    }
    
    isPlaying = false;
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    
    // Painel Header do Workspace
    if (wsEpisodeCover) wsEpisodeCover.src = currentEpisode.coverUrl;
    if (wsShowName) wsShowName.textContent = currentEpisode.showName;
    if (wsEpisodeTitle) wsEpisodeTitle.textContent = currentEpisode.title;
    if (wsDateAdded) wsDateAdded.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatDateString(currentEpisode.dateAdded)}`;
    if (wsDuration) wsDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${currentEpisode.duration}`;
    if (wsSpotifyLink) wsSpotifyLink.href = currentEpisode.spotifyUrl;
    
    // Rótulos do player inferior
    const playerTrackCover = document.getElementById("player-track-cover");
    const playerTrackTitle = document.getElementById("player-track-title");
    const playerTrackShow = document.getElementById("player-track-show");
    
    if (playerTrackCover) playerTrackCover.src = currentEpisode.coverUrl;
    if (playerTrackTitle) playerTrackTitle.textContent = currentEpisode.title;
    if (playerTrackShow) playerTrackShow.textContent = currentEpisode.showName;
    
    // Painel Lateral de IA (Insights)
    if (insightsSummary) insightsSummary.textContent = currentEpisode.aiInsights.summary;
    
    if (insightsTakeaways) {
      insightsTakeaways.innerHTML = currentEpisode.aiInsights.keyTakeaways
        .map(takeaway => `<li>${takeaway}</li>`)
        .join("");
    }
      
    if (insightsActions) {
      insightsActions.innerHTML = currentEpisode.aiInsights.actionItems
        .map(action => `<li>${action}</li>`)
        .join("");
    }
      
    if (insightsTopics) {
      insightsTopics.innerHTML = currentEpisode.aiInsights.topics
        .map(topic => `<span class="tag-badge" onclick="filterByTopic('${topic}')">${topic}</span>`)
        .join("");
    }
    
    // Renderiza linhas de transcrição
    renderTranscript();
    
    // Reseta Pesquisa
    if (searchInput) searchInput.value = "";
    searchMatches = [];
    currentMatchIndex = -1;
    if (searchNavControls) searchNavControls.style.display = "none";
    
    // Alterna Views
    if (emptyState) emptyState.style.display = "none";
    if (loaderState) loaderState.style.display = "none";
    if (activeWorkspace) activeWorkspace.style.display = "flex";
    
    // Destaca item ativo no menu lateral
    document.querySelectorAll(".episode-card-small").forEach(card => {
      card.classList.remove("active");
      if (card.getAttribute("data-id") === currentEpisode.id) {
        card.classList.add("active");
      }
    });
    
    // Salva no histórico se for novo
    saveToHistory(currentEpisode);
  } catch (error) {
    console.error("Erro ao carregar dados do episódio no workspace:", error);
    alert("Ocorreu um erro ao carregar os detalhes do áudio: " + error.message);
  }
}

// Render Transcript Lines inside the viewer
function renderTranscript() {
  if (!currentEpisode || !currentEpisode.transcript) return;
  
  transcriptContainer.innerHTML = currentEpisode.transcript
    .map((line, index) => {
      const formattedTime = formatTime(line.start);
      return `
        <div class="transcript-line" id="line-${index}" data-start="${line.start}" onclick="seekToTime(${line.start})">
          <div class="line-meta">
            <span class="line-timestamp">${formattedTime}</span>
            <span class="line-speaker" id="speaker-${index}" contenteditable="${isEditMode}" onblur="editSpeaker(${index}, this.textContent)" onclick="event.stopPropagation()">${line.speaker}</span>
          </div>
          <div class="line-text" id="text-${index}" contenteditable="${isEditMode}" onblur="editText(${index}, this.textContent)" onclick="event.stopPropagation()">${line.text}</div>
        </div>
      `;
    })
    .join("");
}

// Syncing Transcript Active Line Highlight with Audio playback
function onAudioTimeUpdate() {
  if (!currentEpisode || !currentEpisode.transcript) return;
  
  const currentTime = audio.currentTime;
  
  // Update timeline player UI
  const duration = audio.duration || currentEpisode.durationSeconds || 1;
  const progressPercent = (currentTime / duration) * 100;
  
  timelineProgress.style.width = `${progressPercent}%`;
  timelineHandle.style.left = `${progressPercent}%`;
  timeCurrent.textContent = formatTime(currentTime);
  
  // Find active transcript line
  let activeIndex = -1;
  for (let i = 0; i < currentEpisode.transcript.length; i++) {
    if (currentTime >= currentEpisode.transcript[i].start) {
      // Check if this is the last line or if the current time is before the next start
      if (i === currentEpisode.transcript.length - 1 || currentTime < currentEpisode.transcript[i+1].start) {
        activeIndex = i;
        break;
      }
    }
  }
  
  if (activeIndex !== -1) {
    // Remove active class from all lines
    document.querySelectorAll(".transcript-line").forEach(line => line.classList.remove("active"));
    
    // Add to current active line
    const activeLineElement = document.getElementById(`line-${activeIndex}`);
    if (activeLineElement) {
      activeLineElement.classList.add("active");
      
      // Auto scroll transcript container if not manually scrolling
      if (!isEditMode) {
        const containerHeight = transcriptContainer.clientHeight;
        const lineTop = activeLineElement.offsetTop;
        const lineHeight = activeLineElement.clientHeight;
        
        const scrollTarget = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        // Smooth scroll
        transcriptContainer.scrollTo({
          top: scrollTarget,
          behavior: "smooth"
        });
      }
    }
  }
}

function onAudioMetadataLoaded() {
  timeTotal.textContent = formatTime(audio.duration);
}

function onAudioEnded() {
  isPlaying = false;
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

// Audio Player Actions
function togglePlay() {
  if (!currentEpisode) return;
  
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  }
}

function skipAudio(seconds) {
  if (!currentEpisode) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
}

function seekAudio(event) {
  if (!currentEpisode) return;
  const sliderWidth = document.getElementById("player-slider").clientWidth;
  const clickX = event.offsetX;
  const percentage = clickX / sliderWidth;
  const duration = audio.duration || currentEpisode.durationSeconds || 1;
  
  audio.currentTime = percentage * duration;
}

function seekToTime(seconds) {
  if (!currentEpisode) return;
  audio.currentTime = seconds;
  if (!isPlaying) {
    togglePlay();
  }
}

function changePlaybackSpeed() {
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  let nextIndex = speeds.indexOf(playbackSpeed) + 1;
  if (nextIndex >= speeds.length) nextIndex = 0;
  
  playbackSpeed = speeds[nextIndex];
  speedBadge.textContent = `${playbackSpeed}x`;
  
  if (currentEpisode) {
    audio.playbackRate = playbackSpeed;
  }
}

function setVolume(val) {
  audio.volume = val;
  if (val == 0) {
    volumeIcon.className = "fa-solid fa-volume-xmark";
    isMuted = true;
  } else if (val < 0.4) {
    volumeIcon.className = "fa-solid fa-volume-low";
    isMuted = false;
  } else {
    volumeIcon.className = "fa-solid fa-volume-high";
    isMuted = false;
  }
}

function toggleMute() {
  if (isMuted) {
    setVolume(previousVolume);
    volumeSlider.value = previousVolume;
  } else {
    previousVolume = volumeSlider.value;
    setVolume(0);
    volumeSlider.value = 0;
  }
}

// Edit Mode Functions
function toggleEditMode() {
  isEditMode = !isEditMode;
  const btn = document.getElementById("btn-edit-mode");
  
  if (isEditMode) {
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Concluir Edição';
    btn.style.background = "rgba(29, 185, 84, 0.2)";
    btn.style.borderColor = "var(--spotify-green)";
  } else {
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modo Edição';
    btn.style.background = "";
    btn.style.borderColor = "";
    
    // Save updated transcript back to local storage
    updateHistoryItem(currentEpisode);
  }
  
  // Re-render to apply contenteditable properties
  renderTranscript();
}

function editSpeaker(index, name) {
  if (currentEpisode && currentEpisode.transcript[index]) {
    currentEpisode.transcript[index].speaker = name.trim();
  }
}

function editText(index, text) {
  if (currentEpisode && currentEpisode.transcript[index]) {
    currentEpisode.transcript[index].text = text.trim();
  }
}

// Search and Highlight Transcript
function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  
  // Reset previous highlights
  renderTranscript();
  
  if (query === "") {
    searchNavControls.style.display = "none";
    searchMatches = [];
    currentMatchIndex = -1;
    return;
  }
  
  const textNodes = document.querySelectorAll(".line-text");
  searchMatches = [];
  currentMatchIndex = -1;
  
  textNodes.forEach((node, nodeIndex) => {
    const text = node.textContent;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    
    if (text.toLowerCase().includes(query)) {
      searchMatches.push(nodeIndex);
      node.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
    }
  });
  
  if (searchMatches.length > 0) {
    searchNavControls.style.display = "flex";
    currentMatchIndex = 0;
    highlightCurrentMatch();
  } else {
    searchNavControls.style.display = "none";
  }
}

function highlightCurrentMatch() {
  // Clear previous current selection highlights
  document.querySelectorAll(".highlight").forEach(el => el.classList.remove("current-select"));
  
  if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;
  
  const targetNodeIndex = searchMatches[currentMatchIndex];
  const node = document.getElementById(`text-${targetNodeIndex}`);
  
  if (node) {
    const mark = node.querySelector(".highlight");
    if (mark) {
      mark.classList.add("current-select");
      
      // Scroll to element
      const parentLine = document.getElementById(`line-${targetNodeIndex}`);
      parentLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function navigateSearch(direction) {
  if (searchMatches.length === 0) return;
  
  currentMatchIndex += direction;
  
  if (currentMatchIndex >= searchMatches.length) {
    currentMatchIndex = 0;
  } else if (currentMatchIndex < 0) {
    currentMatchIndex = searchMatches.length - 1;
  }
  
  highlightCurrentMatch();
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Filter transcript by tag/topic click
function filterByTopic(topic) {
  // Highlights matches of this topic word in the search box
  searchInput.value = topic;
  const event = { target: searchInput };
  handleSearch(event);
}

// Process Spotify URL Pasted
function processSpotifyLink(action = "transcribe") {
  try {
    const url = spotifyUrlInput.value.trim();
    
    if (!url) {
      alert("Por favor, cole um link do Spotify!");
      return;
    }
    
    // Validação ampla para cobrir spotify.com, spotify.link, spoti.fi e URIs do desktop
    const isSpotify = url.includes("spotify.com") || 
                      url.includes("spotify.link") || 
                      url.includes("spoti.fi") || 
                      url.startsWith("spotify:");
                      
    if (!isSpotify) {
      alert("Por favor, cole um link válido do Spotify (ex: https://open.spotify.com/episode/... ou link compartilhado de celular)!");
      return;
    }

    // Verifica se coincide com algum episódio mockado para demonstração imediata
    let mockMatch = null;
    if (url.includes("3Ur84Kfs82Jh98saHD8D")) {
      mockMatch = "flow-artificial-intelligence";
    } else if (url.includes("5asf89HDF32hd82hd")) {
      mockMatch = "nerdcast-tecnologia-futuro";
    } else if (url.includes("2HFDJ82hdsaHDuh82")) {
      mockMatch = "podpah-tecnologia-favela";
    }
    
    if (mockMatch) {
      showLoader("Buscando dados no Spotify...", "Localizando metadados do episódio.", () => {
        try {
          loadMockEpisode(mockMatch);
          if (action === "download") {
            setTimeout(() => {
              downloadEpisodeAudio();
            }, 600);
          }
        } catch (e) {
          alert("Erro ao carregar dados do mock: " + e.message);
        }
      });
      return;
    }

    // Envia a requisição para o nosso backend Express
    const loaderTitle = action === "download" ? "Resolvendo Link do Áudio..." : "Conectando ao Backend...";
    const loaderDesc = action === "download" ? "O servidor está localizando o feed RSS e o arquivo de áudio para download..." : "O servidor está localizando o feed RSS e processando a transcrição real do áudio via IA...";

    showLoader(loaderTitle, loaderDesc, async () => {
      try {
        const response = await fetch(`${backendUrl}/api/transcribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: url, language: defaultLanguage, action: action })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Erro desconhecido no servidor.");
        }
        
        const data = await response.json();
        
        // Carrega o episódio real retornado do backend
        loadEpisodeData(data);

        // Se a ação for download, inicia o download imediatamente após carregar os dados
        if (action === "download") {
          setTimeout(() => {
            downloadEpisodeAudio();
          }, 600);
        }
      } catch (e) {
        console.error("Erro ao chamar o backend:", e);
        alert("Não foi possível processar usando o backend: " + e.message + 
              "\n\nCertifique-se de que o seu servidor backend está rodando em '" + backendUrl + "' ou ajuste o endereço nas Configurações (ícone de engrenagem no topo).");
      }
    });
  } catch (error) {
    console.error("Erro ao iniciar processamento do link:", error);
    alert("Falha ao iniciar processamento: " + error.message);
  }
}

function showLoader(title, desc, callback) {
  emptyState.style.display = "none";
  activeWorkspace.style.display = "none";
  loaderState.style.display = "flex";
  
  const statusTitle = document.getElementById("loader-status-title");
  const statusDesc = document.getElementById("loader-status-desc");
  const barFill = document.getElementById("loader-progress-bar-fill");
  const percentageText = document.getElementById("loader-percentage");
  
  statusTitle.textContent = title;
  statusDesc.textContent = desc;
  
  let progress = 0;
  barFill.style.width = "0%";
  percentageText.textContent = "0% concluído";
  
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        callback();
      }, 500);
    }
    barFill.style.width = `${progress}%`;
    percentageText.textContent = `${progress}% concluído`;
  }, 250);
}

// Gera dados simulados realistas adaptados para episódios, músicas ou shows do Spotify
function generateSimulatedEpisode(id, url, mediaType = "episode") {
  const titles = [
    "Scribe Cast - Empreendedorismo de Alta Performance",
    "Café com Tecnologia - O Futuro das Criptomoedas e Web3",
    "Dev Papo - Dicas de Programação para Iniciantes",
    "Design Cast - Design System e Experiência do Usuário"
  ];
  const shows = ["Scribe Devs", "Web3 Brasil", "Quebrando Código", "UX Hub"];
  const categories = ["Negócios", "Tecnologia", "Carreira", "Design"];
  
  const randomIndex = Math.floor(Math.random() * titles.length);
  let title = titles[randomIndex];
  let showName = shows[randomIndex];
  let category = categories[randomIndex];
  
  // Adaptações de rótulos com base no tipo de mídia
  if (mediaType === "track") {
    title = `Música: Sintonia Eletrônica (Track ID: ${id.substring(0,6)})`;
    showName = "Artista Convidado";
    category = "Música & Cultura";
  } else if (mediaType === "show") {
    title = `Show Completo: ${showName} - Temporada de Inverno`;
    category = "Podcast Show";
  } else if (mediaType === "playlist") {
    title = `Playlist Transcrita: As Melhores de ${category}`;
    showName = "Curadoria Scribe";
  }
  
  return {
    id: id,
    title: title,
    showName: showName,
    spotifyUrl: url,
    coverUrl: `https://images.unsplash.com/photo-${1614680376593 + randomIndex}?q=80&w=300&h=300&fit=crop`,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "04:10",
    durationSeconds: 250,
    dateAdded: new Date().toISOString().split("T")[0],
    category: category,
    aiInsights: {
      summary: `Resumo gerado automaticamente para o conteúdo '${title}' (${mediaType}) do canal/artista '${showName}'. O tema central discute as tendências de mercado, otimização de fluxos de trabalho e as estratégias mais eficazes para profissionais modernos se destacarem.`,
      keyTakeaways: [
        "A velocidade de iteração é o principal diferencial em mercados competitivos.",
        "Design systems facilitam a escalabilidade de interfaces em larga escala.",
        "Integração contínua e foco em qualidade do código evitam retrabalho de desenvolvimento."
      ],
      actionItems: [
        "Revisar o pipeline de deploy e otimizar integrações de IA.",
        "Padronizar os fluxos de UX para consistência de marca."
      ],
      topics: ["Inovação", "Planejamento", "Produtividade", category]
    },
    transcript: [
      { start: 0, speaker: "Locutor A", text: "Olá! Sejam bem-vindos a mais um conteúdo do nosso canal semanal." },
      { start: 15, speaker: "Locutor A", text: "Hoje vamos trazer dicas fundamentais para você impulsionar sua carreira e utilizar tecnologia a seu favor." },
      { start: 30, speaker: "Locutor B", text: "É um prazer estar aqui! Acredito que o principal ponto hoje em dia é aprender a automatizar processos simples para focar nas estratégias." },
      { start: 50, speaker: "Locutor A", text: "Concordo plenamente. Quem perde muito tempo fazendo tarefas manuais acaba sendo engolido pela concorrência." },
      { start: 70, speaker: "Locutor B", text: "Exato, e com ferramentas integradas de produtividade, podemos criar protótipos de alta qualidade em menos da metade do tempo anterior." },
      { start: 95, speaker: "Locutor A", text: "Excelente ponto! Vamos aprofundar nessa questão técnica logo após um rápido intervalo." }
    ]
  };
}

// File Drag & Drop Setup
function setupDragAndDrop() {
  const dropzone = document.getElementById("audio-dropzone");
  
  if (!dropzone) return;
  
  ["dragenter", "dragover"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    }, false);
  });
  
  ["dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    }, false);
  });
  
  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].type.startsWith("audio/")) {
      handleAudioFile(files[0]);
    } else {
      alert("Por favor, arraste apenas arquivos de áudio!");
    }
  });
}

function triggerFileInput() {
  document.getElementById("audio-file-input").click();
}

function handleAudioUpload(event) {
  const file = event.target.files[0];
  if (file) {
    handleAudioFile(file);
  }
}

function handleAudioFile(file) {
  const objectUrl = URL.createObjectURL(file);
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  
  // Check Size Limit
  if (file.size > 50 * 1024 * 1024) {
    alert("O tamanho do arquivo excede o limite de 50MB!");
    return;
  }
  
  showLoader("Importando Arquivo de Áudio...", `Lendo arquivo '${file.name}' (${sizeMb} MB) e inicializando transcrição local.`, () => {
    // If OpenAI Whisper Key is set, we could theoretically transcribe it.
    // In our app, we will run browser's Web Speech Recognition OR a high-quality simulation if mic isn't running.
    // Let's create an episode with the uploaded audio
    const newEpisode = {
      id: "audio_" + Date.now(),
      title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
      showName: "Arquivo Local",
      spotifyUrl: "https://open.spotify.com", // default placeholder since there is no spotify url yet
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&h=300&fit=crop",
      audioUrl: objectUrl,
      duration: "03:12",
      durationSeconds: 192,
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Arquivo Pessoal",
      aiInsights: {
        summary: `Transcrição gerada localmente para o arquivo '${file.name}'.`,
        keyTakeaways: [
          "Conteúdo extraído do arquivo de áudio carregado pelo usuário.",
          "Processado usando o motor de reconhecimento local integrado no navegador."
        ],
        actionItems: [
          "Rever as frases transcritas usando o modo edição."
        ],
        topics: ["Áudio Local", "Transcrição"]
      },
      transcript: []
    };
    
    // Attempt local speech recognition
    runLocalSpeechRecognition(file, newEpisode);
  });
}

// Transcrição de áudio local
function runLocalSpeechRecognition(file, episode) {
  // Transcrição automática via OpenAI Whisper desativada
  alert("A transcrição automática de arquivos locais foi desativada. Carregando demonstração funcional local.");
  loadDemoTranscript(episode);
}

// Carrega dados simulados funcionais para arquivos de áudio
function loadDemoTranscript(episode) {
  episode.transcript = [
    { start: 0, speaker: "Palestrante", text: "Olá! O arquivo de áudio local foi importado com sucesso para a interface de trabalho." },
    { start: 6, speaker: "Palestrante", text: "A transcrição automática de áudio local está desativada no momento." },
    { start: 17, speaker: "Palestrante", text: "Enquanto isso, você pode testar este player sincronizado: clique em qualquer palavra para pular o áudio, faça buscas ou clique em 'Modo Edição' para alterar o texto." }
  ];
  loadEpisodeData(episode);
}

// History & LocalStorage Persistence
function saveToHistory(episode) {
  try {
    let history = getHistory();
    
    // Atualiza se já existe, caso contrário insere no início
    const index = history.findIndex(item => item.id === episode.id);
    if (index !== -1) {
      history[index] = episode;
    } else {
      history.unshift(episode);
    }
    
    localStorage.setItem("scribe_history", JSON.stringify(history));
    renderHistory();
  } catch (e) {
    console.warn("Falha ao salvar no histórico do LocalStorage (ex: limite excedido ou modo privado):", e);
  }
}

function updateHistoryItem(episode) {
  try {
    let history = getHistory();
    const index = history.findIndex(item => item.id === episode.id);
    if (index !== -1) {
      history[index] = episode;
      localStorage.setItem("scribe_history", JSON.stringify(history));
      renderHistory();
    }
  } catch (e) {
    console.warn("Falha ao atualizar item no histórico:", e);
  }
}

function deleteHistoryItem(id, event) {
  try {
    if (event) event.stopPropagation();
    
    if (confirm("Deseja realmente remover esta transcrição da biblioteca?")) {
      let history = getHistory();
      history = history.filter(item => item.id !== id);
      localStorage.setItem("scribe_history", JSON.stringify(history));
      
      if (currentEpisode && currentEpisode.id === id) {
        showHome();
      } else {
        renderHistory();
      }
    }
  } catch (e) {
    console.warn("Falha ao remover item do histórico:", e);
  }
}

function getHistory() {
  const historyData = localStorage.getItem("scribe_history");
  return historyData ? JSON.parse(historyData) : [];
}

function renderHistory() {
  const history = getHistory();
  
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-library-msg" style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4;">
        Nenhuma transcrição salva ainda. Cole um link do Spotify para começar!
      </div>
    `;
    return;
  }
  
  historyList.innerHTML = history
    .map(ep => {
      const activeClass = (currentEpisode && currentEpisode.id === ep.id) ? "active" : "";
      return `
        <div class="episode-card-small ${activeClass}" data-id="${ep.id}" onclick="loadEpisodeDataFromHistory('${ep.id}')">
          <img src="${ep.coverUrl}" alt="Capa" class="card-img">
          <div class="card-info">
            <span class="card-title-small">${ep.title}</span>
            <span class="card-subtitle-small">${ep.showName} • ${ep.category}</span>
          </div>
          <button style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: auto; padding: 4px; z-index: 5;" onclick="deleteHistoryItem('${ep.id}', event)" title="Excluir">
            <i class="fa-solid fa-trash-can" style="font-size: 0.85rem;"></i>
          </button>
        </div>
      `;
    })
    .join("");
}

function loadEpisodeDataFromHistory(id) {
  const history = getHistory();
  const episode = history.find(item => item.id === id);
  if (episode) {
    loadEpisodeData(episode);
  }
}

// Export Transcript Functions (TXT, SRT)
function exportTranscript(format) {
  if (!currentEpisode || !currentEpisode.transcript) return;
  
  let content = "";
  let filename = `${currentEpisode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
  
  if (format === "txt") {
    content = currentEpisode.transcript
      .map(line => `[${formatTime(line.start)}] ${line.speaker}: ${line.text}`)
      .join("\r\n");
    filename += ".txt";
    triggerDownload(content, filename, "text/plain");
  } 
  else if (format === "srt") {
    content = currentEpisode.transcript
      .map((line, index) => {
        const startStr = formatSRTTime(line.start);
        // Estimate end time based on next sentence or + 5 seconds
        const nextStart = currentEpisode.transcript[index + 1] ? currentEpisode.transcript[index + 1].start : line.start + 5;
        const endStr = formatSRTTime(nextStart - 0.1); // end 100ms before next starts
        
        return `${index + 1}\r\n${startStr} --> ${endStr}\r\n[${line.speaker}] ${line.text}\r\n\r\n`;
      })
      .join("");
    filename += ".srt";
    triggerDownload(content, filename, "text/srt");
  }
}

function copyTranscriptToClipboard() {
  if (!currentEpisode || !currentEpisode.transcript) return;
  
  const text = currentEpisode.transcript
    .map(line => `[${formatTime(line.start)}] ${line.speaker}: ${line.text}`)
    .join("\r\n");
    
  navigator.clipboard.writeText(text)
    .then(() => {
      const btn = document.getElementById("btn-copy-transcript");
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Copiado!';
        btn.style.color = "#1db954";
        btn.style.borderColor = "#1db954";
        
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.color = "";
          btn.style.borderColor = "";
        }, 2000);
      }
    })
    .catch(err => {
      console.error("Erro ao copiar transcrição:", err);
      alert("Não foi possível copiar a transcrição para a área de transferência.");
    });
}

function downloadEpisodeAudio() {
  if (!currentEpisode || !currentEpisode.audioUrl) {
    alert("Nenhum áudio disponível para download.");
    return;
  }

  // Se for o áudio genérico de demonstração
  if (currentEpisode.audioUrl.includes("soundhelix.com")) {
    alert("Atenção: Este é o áudio genérico de demonstração. O feed RSS deste podcast não pôde ser resolvido para o download do arquivo original.");
  }

  const link = document.createElement("a");
  link.href = currentEpisode.audioUrl;
  link.target = "_blank";
  
  const filename = `${currentEpisode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function triggerDownload(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper Functions
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

function formatDateString(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
