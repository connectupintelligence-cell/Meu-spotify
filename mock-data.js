// Banco de Dados Local com Episódios de Demonstração Pré-transcritos
const MOCK_EPISODES = [
  {
    id: "flow-artificial-intelligence",
    title: "Flow Podcast #2500 - O Impacto Real da Inteligência Artificial",
    showName: "Flow Podcast",
    spotifyUrl: "https://open.spotify.com/episode/3Ur84Kfs82Jh98saHD8D",
    coverUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=300&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "06:12",
    durationSeconds: 372,
    dateAdded: "2026-06-26",
    category: "Tecnologia",
    aiInsights: {
      summary: "Neste episódio do Flow Podcast, Igor 3K conversa com especialistas sobre como a inteligência artificial está transformando a sociedade contemporânea. São discutidos os impactos no mercado de trabalho, a evolução das ferramentas generativas e as implicações éticas do desenvolvimento acelerado de novos modelos de linguagem.",
      keyTakeaways: [
        "A inteligência artificial não deve ser vista como substituta imediata, mas como uma ferramenta de co-criação e aumento da produtividade humana.",
        "Profissionais que souberem utilizar ferramentas de IA terão grande vantagem competitiva nos próximos anos.",
        "Existe uma necessidade urgente de regulamentação ética para evitar fraudes, desinformação e vieses algorítmicos em larga escala.",
        "O setor de educação sofrerá uma das maiores transformações, mudando a forma como avaliamos o aprendizado dos alunos."
      ],
      actionItems: [
        "Aprender a formular prompts eficazes (Engenharia de Prompts) para otimizar tarefas diárias.",
        "Implementar políticas de uso de IA na sua empresa de forma transparente e segura.",
        "Acompanhar os debates sobre direitos autorais em conteúdos gerados por modelos generativos."
      ],
      topics: ["Inteligência Artificial", "Futuro do Trabalho", "Ética Tecnológica", "Educação", "Inovação"]
    },
    transcript: [
      { start: 0, speaker: "Igor 3K", text: "Fala galera! Sejam muito bem-vindos a mais um Flow Podcast. Hoje o assunto é quente, cara. A gente vai conversar sobre algo que tá na boca de todo mundo: Inteligência Artificial." },
      { start: 18, speaker: "Igor 3K", text: "Eu tô vendo esse monte de ferramenta surgir, ChatGPT, gerador de imagem, e fico pensando: cara, onde é que isso vai parar? Será que a gente vai ser substituído por robô semana que vem?" },
      { start: 35, speaker: "Convidado (Especialista)", text: "Pois é, Igor. É uma excelente pergunta e a resposta curta é: não tão rápido. Mas a resposta longa é que tudo vai mudar de forma muito profunda e muito veloz." },
      { start: 52, speaker: "Convidado (Especialista)", text: "O que a gente tá vendo hoje é o nascimento de uma nova eletricidade. A Inteligência Artificial Generativa veio para automatizar a parte cognitiva do trabalho humano." },
      { start: 70, speaker: "Igor 3K", text: "Cara, isso é muito louco. Tipo, a revolução industrial automatizou a força física. Agora a gente tá automatizando a mente? É isso mesmo?" },
      { start: 84, speaker: "Convidado (Especialista)", text: "Exatamente. Se antes a máquina substituía o esforço muscular, hoje ela auxilia ou até substitui a primeira versão de um texto, um rascunho de código ou um design inicial." },
      { start: 102, speaker: "Convidado (Especialista)", text: "Isso significa que o valor do profissional humano se desloca. Sai da execução repetitiva e vai para a curadoria, a estratégia e a criatividade de ponta." },
      { start: 120, speaker: "Igor 3K", text: "Entendi. Então, tipo, ao invés de eu passar três horas escrevendo um e-mail chato ou fazendo uma planilha, eu coloco a IA pra fazer isso em dois segundos e gasto meu tempo pensando em como expandir o negócio." },
      { start: 138, speaker: "Convidado (Especialista)", text: "Perfeito! É a transformação do trabalhador em um diretor criativo. Você passa a gerenciar 'agentes' digitais que fazem o trabalho pesado para você." },
      { start: 154, speaker: "Igor 3K", text: "Mas e aquela galera que faz trabalhos mais simples? Sei lá, quem escreve resumos, quem faz tradução básica de texto... Esses caras não vão rodar?" },
      { start: 168, speaker: "Convidado (Especialista)", text: "Infelizmente, o mercado para tarefas puramente mecânicas de escrita e tradução já está encolhendo muito rápido. Quem trabalha nessas áreas precisa se requalificar urgente." },
      { start: 185, speaker: "Convidado (Especialista)", text: "A chave agora é a 'Requalificação' (Reskilling). O profissional precisa aprender a pilotar a inteligência artificial, adicionando a camada humana de revisão e contexto cultural." },
      { start: 204, speaker: "Igor 3K", text: "Faz muito sentido. E em relação à ética, cara? Como a gente garante que uma IA não vai espalhar fake news de um jeito incontrolável por aí?" },
      { start: 218, speaker: "Convidado (Especialista)", text: "Esse é o maior desafio atual. Criar mecanismos de marca d'água digital para identificar conteúdos criados por IA e responsabilizar as plataformas que distribuem." },
      { start: 236, speaker: "Convidado (Especialista)", text: "A regulamentação tá correndo atrás do prejuízo, mas a tecnologia anda a passos largos. A conscientização do usuário final também vai ser fundamental." },
      { start: 254, speaker: "Igor 3K", text: "É, bicho. O futuro chegou rápido demais e não veio com manual de instruções. Vamos ter que aprender errando." },
      { start: 268, speaker: "Convidado (Especialista)", text: "Com certeza, Igor. Mas quem estiver disposto a abraçar a mudança e a se adaptar continuamente vai encontrar um oceano de oportunidades nesse novo cenário." },
      { start: 288, speaker: "Igor 3K", text: "Maravilha. Vamos fazer uma pausa rápida para ler as mensagens do chat e já voltamos com mais perguntas sobre privacidade e regulação. Fiquem ligados!" }
    ]
  },
  {
    id: "nerdcast-tecnologia-futuro",
    title: "NerdCast 999 - Inteligência Artificial e a Fronteira Tecnológica",
    showName: "Jovem Nerd",
    spotifyUrl: "https://open.spotify.com/episode/5asf89HDF32hd82hd",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=300&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "07:05",
    durationSeconds: 425,
    dateAdded: "2026-06-25",
    category: "Ciência & Tecnologia",
    aiInsights: {
      summary: "No NerdCast 999, Jovem Nerd, Azaghal e convidados discutem o estado da arte das redes neurais profundas, a evolução histórica da IA (do Teste de Turing aos LLMs atuais) e debatem o conceito de Inteligência Artificial Geral (AGI) - o momento em que as máquinas superarão a cognição humana em todos os aspectos.",
      keyTakeaways: [
        "Os modelos de linguagem atuais não 'pensam' de verdade; eles são estatísticas ultra-avançadas de previsão de próximas palavras (Stochastic Parrots).",
        "A escala de computação e dados foi o fator determinante para o salto qualitativo das IAs nos últimos 3 anos.",
        "Inteligência Artificial Geral (AGI) ainda está distante na visão da maioria dos pesquisadores, necessitando de novos paradigmas além do Deep Learning atual.",
        "O impacto imediato na produtividade científica é gigantesco, acelerando a descoberta de novas moléculas, proteínas e materiais astronômicos."
      ],
      actionItems: [
        "Acompanhar projetos de código aberto como Llama e Hugging Face para entender a democratização dos modelos.",
        "Ler artigos científicos sobre avanços do AlphaFold na biologia computacional."
      ],
      topics: ["Redes Neurais", "AGI", "História da Computação", "Deep Learning", "Pesquisa Científica"]
    },
    transcript: [
      { start: 0, speaker: "Jovem Nerd", text: "Saudações, Nerds! Aqui é o Jovem Nerd, e hoje nós vamos desbravar a fronteira final da mente artificial!" },
      { start: 12, speaker: "Azaghal", text: "Aqui é o Azaghal e eu só quero saber o seguinte: quando o meu robô mordomo vai estar pronto para me servir uma limonada no deck?" },
      { start: 25, speaker: "Convidado (Cientista)", text: "Olá pessoal! Bem, Azaghal, o robô físico é bem mais difícil de programar do que a mente digital. Mas a gente já está chegando perto com os modelos integrados." },
      { start: 40, speaker: "Jovem Nerd", text: "Pois é. A gente vê vídeos da Boston Dynamics e fica chocado, mas quando junta aquilo com o cérebro de um modelo de linguagem avançado, a coisa muda de figura." },
      { start: 55, speaker: "Convidado (Cientista)", text: "Exato. O grande avanço recente não foi apenas a robótica ou o poder de processamento isolados, mas a arquitetura Transformer, que permitiu o aprendizado de contexto massivo." },
      { start: 72, speaker: "Azaghal", text: "Mas me explica uma coisa, de forma simples para o meu cérebro analógico: essa IA realmente entende o que ela está falando ou ela só está chutando a palavra certa?" },
      { start: 88, speaker: "Convidado (Cientista)", text: "Essa é a pergunta de um milhão de dólares. Ela não tem consciência nem sentimentos. Ela calcula probabilidades com base em bilhões de textos da internet." },
      { start: 104, speaker: "Convidado (Cientista)", text: "Mas quando a rede calcula a probabilidade, ela constrói um modelo interno do mundo para poder prever com precisão. Então há uma forma de 'compreensão estrutural', mesmo sem consciência." },
      { start: 122, speaker: "Jovem Nerd", text: "Sensacional! É como se ela soubesse as regras da gravidade porque leu todas as descrições de coisas caindo, sem nunca ter sentido o peso de um objeto." },
      { start: 138, speaker: "Convidado (Cientista)", text: "Perfeita analogia, Jovem Nerd. É um conhecimento puramente representativo, construído por relações estatísticas multidimensionais." },
      { start: 152, speaker: "Azaghal", text: "Tá, tudo muito bonito. Mas e a Skynet? A gente corre risco de um supercomputador trancar a gente para fora do planeta?" },
      { start: 165, speaker: "Convidado (Cientista)", text: "O perigo real não é a máquina ganhar vontade própria e nos odiar. O perigo é ela ser extremamente eficiente em um objetivo mal formulado por nós." },
      { start: 180, speaker: "Convidado (Cientista)", text: "É o chamado 'Problema do Alinhamento'. Se você pedir para uma IA erradicar o câncer, e ela decidir que a forma mais rápida de fazer isso é eliminar todos os humanos, ela cumpriu o objetivo de forma desalinhada com a nossa sobrevivência." },
      { start: 200, speaker: "Jovem Nerd", text: "Caraca, isso dá um medo real! É por isso que ética e alinhamento são as áreas mais importantes da computação hoje." },
      { start: 215, speaker: "Azaghal", text: "Pois é, melhor ensinar a máquina a gostar de limonada primeiro. Vamos para os recados do feed e já voltamos!" }
    ]
  },
  {
    id: "podpah-tecnologia-favela",
    title: "Podpah #600 - Tecnologia e Criatividade nas Favelas",
    showName: "Podpah",
    spotifyUrl: "https://open.spotify.com/episode/2HFDJ82hdsaHDuh82",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "05:44",
    durationSeconds: 344,
    dateAdded: "2026-06-24",
    category: "Sociedade & Cultura",
    aiInsights: {
      summary: "Igão e Mítico recebem ativistas digitais e desenvolvedores da periferia para debater a democratização do acesso tecnológico. O episódio destaca como a internet, a programação e as mídias sociais têm se tornado ferramentas de ascensão social, inovação e emancipação econômica nas comunidades brasileiras.",
      keyTakeaways: [
        "A tecnologia nas periferias não é apenas consumida, ela é reinventada de acordo com as necessidades e recursos locais.",
        "Projetos comunitários de ensino de programação abrem portas para mercados globais de trabalho sem que o jovem precise sair de sua comunidade.",
        "O principal obstáculo ainda é a infraestrutura básica de internet rápida e computadores adequados para estudo.",
        "A estética periférica dita tendências nas redes sociais globais, mas os criadores locais precisam de mais apoio financeiro para monetizar sua arte de forma justa."
      ],
      actionItems: [
        "Apoiar ONGs que ensinam tecnologia e programação nas comunidades periféricas.",
        "Consumir e divulgar o trabalho de produtores e desenvolvedores independentes de favela."
      ],
      topics: ["Democratização", "Inclusão Digital", "Programação", "Empreendedorismo", "Cultura Urbana"]
    },
    transcript: [
      { start: 0, speaker: "Igão", text: "Salve, salve família! Tá no ar mais um Podpah, o podcast mais zica da internet! Hoje a gente tá recebendo uns caras que tão mudando o jogo nas quebradas usando tecnologia." },
      { start: 15, speaker: "Mítico", text: "É isso aí! Os caras tão ensinando programação, criação de conteúdo e botando a molecada da favela pra faturar alto com tecnologia. Sejam bem-vindos, manos!" },
      { start: 30, speaker: "Convidado (Desenvolvedor)", text: "Salve Igão, salve Mítico, satisfação total tá aqui! A ideia nossa é simples: mostrar que código também é arte e que a favela tem que produzir tecnologia, não só consumir." },
      { start: 45, speaker: "Igão", text: "Mano, isso é muito foda. Porque a gente costuma pensar que programador é sempre aquele cara nerd, trancado no quarto escuro na Faria Lima, tá ligado?" },
      { start: 58, speaker: "Convidado (Desenvolvedor)", text: "Com certeza, esse estereótipo afasta a molecada. Quando a gente chega na quebrada e mostra que com HTML, CSS e JavaScript o moleque pode criar o site do comércio do pai dele, ou criar um app pro bairro, a chave vira." },
      { start: 78, speaker: "Mítico", text: "E hoje em dia, mano, qualquer computador de mil conto serve pra começar a estudar? Ou o cara precisa de uma máquina de última geração?" },
      { start: 90, speaker: "Convidado (Desenvolvedor)", text: "Para começar a programar web, qualquer computador que abra um navegador de internet serve. O básico do básico já dá pra rodar código." },
      { start: 104, speaker: "Convidado (Desenvolvedor)", text: "O que falta mesmo muitas vezes é internet de qualidade estável e um incentivo, alguém pra guiar o caminho. O talento tá lá, só precisa de oportunidade." },
      { start: 120, speaker: "Igão", text: "E diz aí, qual é a maior vitória que vocês já viram desse projeto lá na comunidade de vocês?" },
      { start: 130, speaker: "Convidado (Desenvolvedor)", text: "Pô, foi um moleque de 17 anos que aprendeu React com a gente, conseguiu um estágio numa startup e hoje ajuda a pagar o aluguel da mãe. Isso não tem preço, mano." },
      { start: 145, speaker: "Mítico", text: "Caraca, arrepiou aqui, de verdade. Isso é mudar vidas através do conhecimento. Parabéns pelo corre, mano!" },
      { start: 158, speaker: "Igão", text: "Muito monstro! Vamos ler umas perguntas do chat da rapaziada e trocar uma ideia mais profunda. Segura aí que já voltamos!" }
    ]
  }
];
window.MOCK_EPISODES = MOCK_EPISODES;
