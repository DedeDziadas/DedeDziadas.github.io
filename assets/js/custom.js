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
