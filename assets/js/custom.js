document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    const output = document.getElementById("form-output");
    const popup = document.getElementById("success-popup");
    const submitBtn = form.querySelector(".submit-btn");

    const fields = {
        fname: { el: document.getElementById("fname"), validator: v => /^[A-Za-zÀ-ž\s]+$/.test(v.trim()), errorText: "Vardas turi būti tik iš raidžių." },
        lname: { el: document.getElementById("lname"), validator: v => /^[A-Za-zÀ-ž\s]+$/.test(v.trim()), errorText: "Pavardė turi būti tik iš raidžių." },
        email: { el: document.getElementById("email"), validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), errorText: "Neteisingas el. pašto formatas." },
        address: { el: document.getElementById("address"), validator: v => v.trim().length > 3, errorText: "Įveskite adresą." },
        phone: { el: document.getElementById("phone"), validator: v => /^\+370 \d{3} \d{5}$/.test(v.trim()), errorText: "Įveskite LT numerį: +370 xxx xxxxx" }
    };

    Object.values(fields).forEach(f => {
        f.el.addEventListener("input", () => {
            validateField(f);
            updateSubmitState();
        });
    });

    fields.phone.el.addEventListener("input", e => {
        let value = e.target.value.replace(/\D/g,"");

        if (!value.startsWith("370")) value = "370" + value;

        value = value.substring(0,12);

        let formatted = "+370";

       if (value.length > 3 && value.length <= 6) {
            formatted += " " + value.substring(3);
        } else if (value.length > 6) {
            formatted += " " + value.substring(3,6);
            formatted += " " + value.substring(6);
    }

        e.target.value = formatted;

        validateField(fields.phone);
        updateSubmitState();
    });

    function validateField(f) {
        const val = f.el.value.trim();
        const errEl = f.el.nextElementSibling;
        if (val === "") return setError(f, "Laukas negali būti tuščias.");
        if (!f.validator(val)) return setError(f, f.errorText);
        clearError(f);
        return true;
    }

    function setError(f, text) {
        f.el.classList.add("error");
        f.el.style.borderColor = "#ff0000";
        if (f.el.nextElementSibling) f.el.nextElementSibling.textContent = text;
        return false;
    }

    function clearError(f) {
        f.el.classList.remove("error");
        f.el.style.borderColor = "#9c0000";
        if (f.el.nextElementSibling) f.el.nextElementSibling.textContent = "";
    }

    function updateSubmitState() {
        const allValid = Object.values(fields).every(f => validateField(f));
        submitBtn.disabled = !allValid;
    }

    form.addEventListener("submit", function(e){
        e.preventDefault();

        const formData = {
            vardas: fields.fname.el.value,
            pavarde: fields.lname.el.value,
            email: fields.email.el.value,
            telefonas: fields.phone.el.value,
            adresas: fields.address.el.value,
            klausimas1: Number(document.getElementById("q1").value),
            klausimas2: Number(document.getElementById("q2").value),
            klausimas3: Number(document.getElementById("q3").value)
        };

        const avg = (formData.klausimas1 + formData.klausimas2 + formData.klausimas3)/3;
        const avgRounded = avg.toFixed(1);

        output.innerHTML = `
          <h4>Įvesti duomenys:</h4>
          <p><strong>Vardas:</strong> ${formData.vardas}</p>
          <p><strong>Pavardė:</strong> ${formData.pavarde}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Telefonas:</strong> ${formData.telefonas}</p>
          <p><strong>Adresas:</strong> ${formData.adresas}</p>
          <p><strong>Klausimas 1:</strong> ${formData.klausimas1}</p>
          <p><strong>Klausimas 2:</strong> ${formData.klausimas2}</p>
          <p><strong>Klausimas 3:</strong> ${formData.klausimas3}</p>
          <p><strong>${formData.vardas} ${formData.pavarde} — vidurkis:</strong> ${avgRounded}</p>
        `;

        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"),3000);

        output.style.display="block";
        setTimeout(()=>output.style.opacity="1",10);
    });
});





const icons = [
    "assets/img/cards/aceofspades.png",
    "assets/img/cards/aceofhearts.png",
    "assets/img/cards/aceofdiamonds.png",
    "assets/img/cards/aceofidk.png",
    "assets/img/cards/trolekas.png",
    "assets/img/cards/kazkoksdede.png",
    "assets/img/cards/dede.png",
    "assets/img/cards/saddede.png",
    "assets/img/cards/saulius.png",
    "assets/img/cards/katinasmiega.png",
    "assets/img/cards/phasmophobia.png",
    "assets/img/cards/gargamelis.png",
];

icons.forEach(src => {
    const img = new Image();
    img.src = src;
});

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let totalPairs = 6;

let timer = 0;
let timerInterval = null;

const timerEl = document.getElementById("timer");
const bestEasyEl = document.getElementById("bestEasy");
const bestHardEl = document.getElementById("bestHard");

const board = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const winMessage = document.getElementById("winMessage");

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateBoard(size) {
    board.innerHTML = "";
    winMessage.textContent = "";

    let fullSet = [...icons.slice(0, size)].flatMap(i => [i, i]);
    fullSet = shuffle(fullSet);

    board.style.gridTemplateColumns = size === 6 ? "repeat(4, 80px)" : "repeat(6, 80px)";
    totalPairs = size;

    fullSet.forEach(imgSrc => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.icon = imgSrc;

        card.innerHTML = `<img src="${imgSrc}" class="card-img">`;

        card.addEventListener("click", flipCard);
        board.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this.classList.contains("flip") || this.classList.contains("matched")) return;

    this.classList.add("flip");

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        moves++;
        movesEl.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    if (firstCard.dataset.icon === secondCard.dataset.icon) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matches++;
        matchesEl.textContent = matches;

        resetTurn();

        if (matches === totalPairs) {
            stopTimer();

            const difficulty = document.getElementById("difficulty").value;
            const key = difficulty === "easy" ? "best_easy" : "best_hard";
            const best = localStorage.getItem(key);

            if (!best || moves < Number(best)) {
                localStorage.setItem(key, moves);
                loadBestScores();
            }

            winMessage.textContent = `🎉 Laimėjote per ${moves} ėjimus ir ${timer.toFixed(1)} s!`;
        }

    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove("flip");
            secondCard.classList.remove("flip");
            resetTurn();
        }, 700);
    }
}

function resetTurn() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function startGame() {
    const difficulty = document.getElementById("difficulty").value;

    moves = 0;
    matches = 0;
    movesEl.textContent = 0;
    matchesEl.textContent = 0;
    winMessage.textContent = "";

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    stopTimer();
    startTimer();

    if (difficulty === "easy") generateBoard(6);
    else generateBoard(12);
}

function resetGame() {
    const difficulty = document.getElementById("difficulty").value;

    moves = 0;
    matches = 0;
    movesEl.textContent = 0;
    matchesEl.textContent = 0;
    winMessage.textContent = "";

    stopTimer();
    timerEl.textContent = "0.0";

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    if (difficulty === "easy") generateBoard(6);
    else generateBoard(12);
}

document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("resetGame").addEventListener("click", resetGame);

function loadBestScores() {
    const easy = localStorage.getItem("best_easy");
    const hard = localStorage.getItem("best_hard");

    bestEasyEl.textContent = easy ? easy : "—";
    bestHardEl.textContent = hard ? hard : "—";
}

loadBestScores();

function startTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timerEl.textContent = "0.0";

    timerInterval = setInterval(() => {
        timer += 0.1;
        timerEl.textContent = timer.toFixed(1);
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}
