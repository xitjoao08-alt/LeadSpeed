/* =========================================================
   LEADSPEED
   Painel privado de prospecção
   ========================================================= */

const state = {
  market: "brazil",
  filters: [],
  saved: JSON.parse(localStorage.getItem("leadspeed_saved") || "[]"),
  history: JSON.parse(localStorage.getItem("leadspeed_history") || "[]"),
  currentResults: []
};


/* =========================================================
   ELEMENTOS
   ========================================================= */

const searchButton = document.getElementById("searchButton");
const categoryInput = document.getElementById("category");
const locationInput = document.getElementById("location");
const radiusInput = document.getElementById("radius");
const results = document.getElementById("results");
const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");
const filterButton = document.getElementById("filterButton");
const filterPanel = document.getElementById("filtersPanel");
const closeFilters = document.getElementById("closeFilters");
const filterCount = document.getElementById("filterCount");
const opportunityModal = document.getElementById("opportunityModal");
const opportunityContent = document.getElementById("opportunityContent");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {

  item.addEventListener("click", () => {

    navItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");

    const section = item.dataset.section;

    document.querySelectorAll(".section").forEach(el => {
      el.classList.remove("active");
    });

    const target = document.getElementById(section + "Section");

    if (target) {
      target.classList.add("active");
    }

    const titles = {
      search: "Buscar leads",
      saved: "Leads salvos",
      history: "Histórico",
      approaches: "Abordagens",
      settings: "Configurações"
    };

    document.getElementById("pageTitle").textContent =
      titles[section] || "LeadSpeed";

    if (section === "saved") {
      renderSaved();
    }

    if (section === "history") {
      renderHistory();
    }

  });

});


/* =========================================================
   MERCADO
   ========================================================= */

document.querySelectorAll(".market").forEach(button => {

  button.addEventListener("click", () => {

    document.querySelectorAll(".market").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    state.market = button.dataset.market;

    if (state.market === "brazil") {
      locationInput.placeholder = "Cidade ou estado";
    }

    if (state.market === "international") {
      locationInput.placeholder = "City, state or country";
    }

    if (state.market === "all") {
      locationInput.placeholder = "Cidade, estado ou país";
    }

  });

});


/* =========================================================
   FILTROS
   ========================================================= */

filterButton.addEventListener("click", () => {
  filterPanel.classList.toggle("open");
});

closeFilters.addEventListener("click", () => {
  filterPanel.classList.remove("open");
});


document.querySelectorAll(".check input").forEach(check => {

  check.addEventListener("change", () => {

    state.filters = [...document.querySelectorAll(".check input:checked")]
      .map(input => input.value);

    filterCount.textContent = state.filters.length;

  });

});


/* =========================================================
   BUSCA
   ========================================================= */

searchButton.addEventListener("click", performSearch);

categoryInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    performSearch();
  }

});

locationInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    performSearch();
  }

});


function performSearch() {

  const category = categoryInput.value.trim();
  const location = locationInput.value.trim();
  const radius = radiusInput.value;

  if (!category) {
    showToast("Informe o tipo de empresa que você procura.");
    categoryInput.focus();
    return;
  }

  if (!location) {
    showToast("Informe uma localização.");
    locationInput.focus();
    return;
  }

  /*
    IMPORTANTE:

    O frontend não inventa empresas.

    Quando uma API real de negócios for conectada,
    a resposta deverá ser enviada para renderResults().

    Por enquanto mostramos claramente que a fonte
    de dados precisa estar conectada.
  */

  resultsTitle.textContent = "Pesquisa configurada";
  resultsSubtitle.textContent =
    `${category} · ${location} · raio de ${radius} km`;

  results.innerHTML = `
    <div class="empty-state">

      <div class="empty-icon">✓</div>

      <h3>Busca pronta para receber dados</h3>

      <p>
        Os filtros foram configurados corretamente.
        Agora conecte uma fonte de dados de empresas
        para trazer resultados reais.
      </p>

      <div class="empty-features">
        <span>✓ ${escapeHTML(category)}</span>
        <span>✓ ${escapeHTML(location)}</span>
        <span>✓ ${radius} km</span>
        <span>✓ ${state.filters.length} filtros</span>
      </div>

    </div>
  `;

  saveHistory({
    category,
    location,
    radius,
    market: state.market,
    filters: [...state.filters],
    date: new Date().toISOString()
  });

}


/* =========================================================
   RENDER DE LEADS
   ========================================================= */

/*
  Use esta função quando conectar sua API.

  Exemplo esperado:

  renderResults([
    {
      id: "123",
      name: "Nome da empresa",
      category: "Restaurante",
      location: "São Paulo, SP",
      rating: 4.7,
      reviews: 320,
      website: null,
      instagram: "...",
      whatsapp: "...",
      email: "...",
      score: 88
    }
  ]);
*/

function renderResults(leads) {

  state.currentResults = leads || [];

  if (!leads.length) {

    results.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h3>Nenhuma empresa encontrada</h3>
        <p>
          Tente alterar a categoria, localização ou filtros.
        </p>
      </div>
    `;

    return;
  }

  results.innerHTML = leads.map(createLeadCard).join("");

}


function createLeadCard(lead) {

  const initials = getInitials(lead.name);

  const websiteSignal = lead.website
    ? "Site encontrado"
    : "Site não identificado";

  return `
    <article class="lead-card">

      <div class="lead-logo">
        ${escapeHTML(initials)}
      </div>

      <div class="lead-main">
        <strong>${escapeHTML(lead.name)}</strong>
        <span>${escapeHTML(lead.category || "Empresa")}</span>
      </div>

      <div class="lead-location">
        ${escapeHTML(lead.location || "Localização não informada")}
        <span>
          ${lead.rating ? `★ ${lead.rating}` : "Avaliação não informada"}
          ${lead.reviews ? ` · ${lead.reviews} avaliações` : ""}
        </span>
      </div>

      <div>
        <span class="signal">${websiteSignal}</span>
      </div>

      <div class="score">
        <strong>${lead.score ?? "--"}</strong>
        <span>OPORTUNIDADE</span>
      </div>

      <div class="lead-actions">

        <button
          class="action-small"
          title="Salvar"
          onclick="toggleSaved('${lead.id}')">
          ☆
        </button>

        <button
          class="action-small action-primary"
          title="Ver oportunidade"
          onclick="viewOpportunity('${lead.id}')">
          →
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   OPORTUNIDADE
   ========================================================= */

function viewOpportunity(id) {

  const lead = state.currentResults.find(item => String(item.id) === String(id));

  if (!lead) {

    const savedLead = state.saved.find(item => String(item.id) === String(id));

    if (savedLead) {
      openOpportunity(savedLead);
    }

    return;
  }

  openOpportunity(lead);
}


function openOpportunity(lead) {

  const reasons = [];

  if (!lead.website) {
    reasons.push("Site não identificado publicamente.");
  }

  if (lead.instagram) {
    reasons.push("Presença no Instagram disponível para análise.");
  }

  if (lead.whatsapp) {
    reasons.push("WhatsApp público disponível para contato.");
  }

  if (lead.rating) {
    reasons.push(`Empresa possui avaliação pública de ${lead.rating}.`);
  }

  if (!reasons.length) {
    reasons.push("Analise os dados públicos antes de iniciar o contato.");
  }

  const outreach = generateOutreach(lead);

  opportunityContent.innerHTML = `

    <div class="opportunity-top">

      <div class="opportunity-logo">
        ${escapeHTML(getInitials(lead.name))}
      </div>

      <div>
        <h2>${escapeHTML(lead.name)}</h2>
        <p>
          ${escapeHTML(lead.category || "Empresa")}
          ·
          ${escapeHTML(lead.location || "Localização não informada")}
        </p>
      </div>

      <div class="opportunity-score">
        <strong>${lead.score ?? "--"}</strong>
        <span>OPORTUNIDADE</span>
      </div>

    </div>


    <div class="opportunity-grid">

      <div class="info-box">
        <label>Avaliação</label>
        <strong>
          ${lead.rating ? `★ ${lead.rating}` : "Não informado"}
        </strong>
      </div>

      <div class="info-box">
        <label>Avaliações</label>
        <strong>
          ${lead.reviews ?? "Não informado"}
        </strong>
      </div>

      <div class="info-box">
        <label>Website</label>
        <strong>
          ${lead.website ? "Encontrado" : "Não identificado"}
        </strong>
      </div>

      <div class="info-box">
        <label>Contato</label>
        <strong>
          ${lead.whatsapp ? "WhatsApp" :
            lead.email ? "E-mail" :
            "Não identificado"}
        </strong>
      </div>

    </div>


    <div class="opportunity-block">

      <h3>Por que analisar este lead?</h3>

      <div class="reason-list">

        ${reasons.map(reason => `
          <div class="reason">
            ✓ ${escapeHTML(reason)}
          </div>
        `).join("")}

      </div>

    </div>


    <div class="opportunity-block">

      <h3>Abordagem sugerida</h3>

      <div class="outreach-box">
        ${escapeHTML(outreach)}
      </div>

    </div>


    <div class="modal-actions">

      <button onclick="copyText(${JSON.stringify(outreach)})">
        Copiar abordagem
      </button>

      ${
        lead.whatsapp
          ? `<button class="primary" onclick="openContact('${escapeAttribute(lead.whatsapp)}')">
               Abrir WhatsApp
             </button>`
          : ""
      }

      ${
        lead.website
          ? `<button onclick="openContact('${escapeAttribute(lead.website)}')">
               Abrir site
             </button>`
          : ""
      }

    </div>
  `;

  opportunityModal.classList.add("open");

}


function closeOpportunity() {
  opportunityModal.classList.remove("open");
}


opportunityModal.addEventListener("click", event => {

  if (event.target === opportunityModal) {
    closeOpportunity();
  }

});


/* =========================================================
   ABORDAGEM
   ========================================================= */

function generateOutreach(lead) {

  const name = lead.name || "empresa";

  return `Olá! Tudo bem?

Meu nome é João e trabalho com criação de materiais digitais para empresas.

Estava conhecendo a ${name} e percebi alguns pontos na apresentação digital que poderiam ficar ainda mais profissionais.

Eu trabalho com artes, materiais para redes sociais, thumbnails e também soluções visuais para negócios.

Se fizer sentido para vocês, posso preparar uma pequena prévia sem compromisso para vocês avaliarem.`;

}


function copyTemplate(type) {

  const templates = {

    first:
`Olá! Tudo bem?

Meu nome é João e trabalho com design para empresas.

Conheci o perfil de vocês e gostei bastante do negócio. Trabalho criando artes, materiais para redes sociais e outros materiais visuais para empresas.

Posso preparar uma pequena prévia específica para vocês, sem compromisso, para mostrarem como poderia ficar.

Posso enviar?`,

    preview:
`Olá! Conforme comentei, preparei uma prévia pensando especificamente na empresa de vocês.

A ideia é mostrar como podemos deixar a apresentação visual ainda mais profissional.

Se gostarem da proposta, podemos conversar sobre outros materiais também.`,

    followup:
`Olá! Tudo bem?

Passando apenas para saber se conseguiram ver minha mensagem anterior.

Caso tenham interesse, posso enviar uma prévia feita especificamente para a empresa de vocês, sem compromisso.`

  };

  copyText(templates[type]);

}


/* =========================================================
   SALVOS
   ========================================================= */

function toggleSaved(id) {

  const lead = state.currentResults.find(
    item => String(item.id) === String(id)
  );

  if (!lead) return;

  const exists = state.saved.some(
    item => String(item.id) === String(id)
  );

  if (exists) {

    state.saved = state.saved.filter(
      item => String(item.id) !== String(id)
    );

    showToast("Lead removido dos salvos.");

  } else {

    state.saved.push(lead);

    showToast("Lead salvo.");

  }

  localStorage.setItem(
    "leadspeed_saved",
    JSON.stringify(state.saved)
  );

}


function renderSaved() {

  const container = document.getElementById("savedResults");

  if (!state.saved.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">☆</div>
        <h3>Nenhum lead salvo</h3>
        <p>
          Quando encontrar uma empresa interessante,
          salve-a para acessar rapidamente depois.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = state.saved.map(createLeadCard).join("");

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function saveHistory(search) {

  state.history.unshift(search);

  state.history = state.history.slice(0, 50);

  localStorage.setItem(
    "leadspeed_history",
    JSON.stringify(state.history)
  );

}


function renderHistory() {

  const container = document.getElementById("historyResults");

  if (!state.history.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◷</div>
        <h3>Nenhuma pesquisa no histórico</h3>
        <p>
          Suas pesquisas aparecerão aqui automaticamente.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = state.history.map((item, index) => {

    const date = new Date(item.date);

    return `
      <div class="history-item">

        <div>
          <strong>
            ${escapeHTML(item.category)}
          </strong>

          <span>
            ${escapeHTML(item.location)}
            · ${item.radius} km
            · ${formatDate(date)}
          </span>
        </div>

        <button onclick="repeatSearch(${index})">
          Repetir busca
        </button>

      </div>
    `;

  }).join("");

}


function repeatSearch(index) {

  const item = state.history[index];

  if (!item) return;

  categoryInput.value = item.category;
  locationInput.value = item.location;
  radiusInput.value = item.radius;

  state.market = item.market || "brazil";

  document.querySelectorAll(".market").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.market === state.market
    );
  });

  showToast("Pesquisa carregada.");

  document.querySelector('[data-section="search"]').click();

}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function getInitials(name) {

  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();

}


function formatDate(date) {

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return String(value ?? "")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');

}


function openContact(url) {

  if (!url) return;

  let finalUrl = url;

  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    finalUrl = "https://" + url;
  }

  window.open(finalUrl, "_blank");

}


async function copyText(text) {

  try {

    await navigator.clipboard.writeText(text);

    showToast("Copiado para a área de transferência.");

  } catch {

    showToast("Não foi possível copiar automaticamente.");

  }

}


function showToast(message) {

  toastMessage.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimeout);

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);

}


function clearAllData() {

  const confirmation = confirm(
    "Tem certeza que deseja apagar seus leads salvos e histórico?"
  );

  if (!confirmation) return;

  state.saved = [];
  state.history = [];

  localStorage.removeItem("leadspeed_saved");
  localStorage.removeItem("leadspeed_history");

  renderSaved();
  renderHistory();

  showToast("Dados locais apagados.");

}


/* =========================================================
   ORDENAÇÃO
   ========================================================= */

document.getElementById("sortResults").addEventListener("change", event => {

  const type = event.target.value;

  const sorted = [...state.currentResults];

  if (type === "opportunity") {
    sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  if (type === "rating") {
    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  if (type === "reviews") {
    sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  }

  renderResults(sorted);

});
