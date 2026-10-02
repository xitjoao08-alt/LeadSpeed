/* =========================================
   LEADSPEED
   JAVASCRIPT — V1
========================================= */


/* =========================================
   ESTADO
========================================= */

let credits = 10;


/* =========================================
   DADOS DE DEMONSTRAÇÃO

   IMPORTANTE:
   Esses dados são apenas para testar a
   interface.

   Na próxima etapa vamos substituir por
   dados reais através de uma API.
========================================= */

const demoLeads = [

    {
        name: "Burger House",
        category: "Restaurante",
        location: "Jales, SP",
        score: 91,
        signal: "Site não identificado",
        initials: "BH"
    },

    {
        name: "Pizzaria Central",
        category: "Pizzaria",
        location: "Jales, SP",
        score: 87,
        signal: "Instagram encontrado",
        initials: "PC"
    },

    {
        name: "Pet Shop Central",
        category: "Pet Shop",
        location: "Jales, SP",
        score: 82,
        signal: "WhatsApp disponível",
        initials: "PS"
    },

    {
        name: "Restaurante Sabor",
        category: "Restaurante",
        location: "Jales, SP",
        score: 78,
        signal: "Site não identificado",
        initials: "RS"
    }

];


/* =========================================
   BUSCA
========================================= */

function searchLeads() {

    const category =
        document.getElementById("category").value;

    const location =
        document.getElementById("location").value.trim();


    /* VALIDAÇÃO */

    if (!category) {

        showNotification(
            "Selecione uma categoria."
        );

        return;
    }


    if (!location) {

        showNotification(
            "Digite uma localização."
        );

        return;
    }


    /* CRÉDITOS */

    if (credits < 3) {

        showNotification(
            "Você não possui créditos suficientes."
        );

        return;
    }


    /* DESCONTA */

    credits -= 3;

    updateCredits();


    /* BOTÃO */

    const button =
        document.getElementById("searchButton");


    button.disabled = true;

    button.innerHTML = `
        <span>⌛</span>
        Buscando...
    `;


    /*
        Simula o tempo de uma busca.
        Depois será substituído pela API.
    */

    setTimeout(() => {

        renderResults(
            category,
            location
        );


        button.disabled = false;

        button.innerHTML = `
            <span class="search-symbol">⌕</span>

            <span>
                Buscar oportunidades
            </span>

            <small>
                3 créditos
            </small>
        `;

    }, 700);

}


/* =========================================
   RESULTADOS
========================================= */

function renderResults(
    category,
    location
) {

    const container =
        document.getElementById("results");


    container.innerHTML = "";


    /*
        Filtra os dados de demonstração
        pela categoria escolhida.
    */

    let filtered =
        demoLeads.filter(
            lead => lead.category === category
        );


    /*
        Se não houver nenhum resultado
        específico, usamos alguns exemplos.
    */

    if (filtered.length === 0) {
        filtered = demoLeads;
    }


    filtered.forEach(
        (lead, index) => {

            const card =
                document.createElement("div");

            card.className =
                "lead-card";


            card.innerHTML = `

                <div class="lead-logo">
                    ${lead.initials}
                </div>


                <div class="lead-info">

                    <h3>
                        ${lead.name}
                    </h3>

                    <p>
                        📍 ${location} · ${lead.category}
                    </p>

                </div>


                <div class="lead-meta">

                    <div class="lead-score">
                        ${lead.score}
                    </div>

                    <span class="lead-score-label">
                        score de oportunidade
                    </span>

                    <div class="lead-signal">
                        ${lead.signal}
                    </div>

                </div>


                <div class="lead-action">

                    <button
                        onclick="viewOpportunity(${index})"
                    >
                        Ver oportunidade →
                    </button>

                </div>

            `;


            container.appendChild(card);

        }
    );

}


/* =========================================
   VER OPORTUNIDADE
========================================= */

function viewOpportunity(index) {

    const lead =
        demoLeads[index];


    showNotification(
        `${lead.name} — oportunidade ${lead.score}/100`
    );

}


/* =========================================
   CRÉDITOS
========================================= */

function updateCredits() {

    const element =
        document.getElementById(
            "creditCount"
        );


    element.textContent =
        credits;

}


/* =========================================
   PRO
========================================= */

function openPro() {

    const modal =
        document.getElementById(
            "proModal"
        );


    modal.classList.add("show");

}


function closePro() {

    const modal =
        document.getElementById(
            "proModal"
        );


    modal.classList.remove("show");

}


/* =========================================
   FECHAR MODAL CLICANDO FORA
========================================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "proModal"
            );


        if (
            event.target === modal
        ) {

            closePro();

        }

    }
);


/* =========================================
   NOTIFICAÇÃO
========================================= */

function showNotification(message) {

    let notification =
        document.getElementById(
            "notification"
        );


    if (!notification) {

        notification =
            document.createElement("div");

        notification.id =
            "notification";


        notification.style.position =
            "fixed";

        notification.style.bottom =
            "25px";

        notification.style.left =
            "50%";

        notification.style.transform =
            "translateX(-50%)";

        notification.style.padding =
            "12px 18px";

        notification.style.borderRadius =
            "10px";

        notification.style.background =
            "#a855f7";

        notification.style.color =
            "#fff";

        notification.style.fontSize =
            "10px";

        notification.style.fontWeight =
            "800";

        notification.style.boxShadow =
            "0 15px 40px rgba(0,0,0,.4)";

        notification.style.zIndex =
            "999";


        document.body.appendChild(
            notification
        );

    }


    notification.textContent =
        message;


    notification.style.opacity =
        "1";


    clearTimeout(
        window.notificationTimer
    );


    window.notificationTimer =
        setTimeout(
            () => {

                notification.style.opacity =
                    "0";

            },
            2500
        );

}
