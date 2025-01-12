document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        "today": "styles/dzisiaj.css",
        "day-view": "styles/dzienny.css",
        "week-view": "styles/tygodniowy.css",
        "month-view": "styles/miesieczny.css",
        "semester-view": "styles/semestralny.css"
    };

    const viewButtons = document.querySelectorAll(".view-buttons button");
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.id = "dynamic-style";
    document.head.appendChild(linkElement);

    let currentView = "tygodniowy"; // Domyślny widok (tygodniowy)
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth(); // 0 - Styczeń, 11 - Grudzień
    let currentYear = currentDate.getFullYear();
    let currentWeekStartDate = getStartOfWeek(currentDate); // Początek bieżącego tygodnia
    let currentWeekEndDate = getEndOfWeek(currentDate); // Koniec bieżącego tygodnia

    const dateRangeElement = document.querySelector('.date-range'); // Element wyświetlający datę

    // Funkcja do formatowania daty w formacie Miesiąc Rok (np. Styczeń 2025)
    function formatDate(month, year) {
        const months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
        return `${months[month]} ${year}`;
    }

    // Funkcja do formatowania daty tygodnia (np. 01.01.2025 - 07.01.2025)
    function formatWeekDate(startDate, endDate) {
        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth() + 1; // Miesiąc + 1, ponieważ w JavaScript miesiące są indeksowane od 0
        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        return `${startDay < 10 ? '0' + startDay : startDay}.${startMonth < 10 ? '0' + startMonth : startMonth}.${startDate.getFullYear()} - ${endDay < 10 ? '0' + endDay : endDay}.${endMonth < 10 ? '0' + endMonth : endMonth}.${endDate.getFullYear()}`;
    }

    // Funkcja do formatowania daty na "Dzień" (np. 05.01.2025)
    function formatDayDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${date.getFullYear()}`;
    }

    // Funkcja do uzyskania daty początkowej tygodnia (poniedziałek)
    function getStartOfWeek(date) {
        const day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6 : 1); // Niedziela to dzień 0 w JavaScript, więc poniedziałek to 1
        return new Date(date.setDate(diff));
    }

    // Funkcja do uzyskania daty końcowej tygodnia (niedziela)
    function getEndOfWeek(date) {
        const day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? 0 : 7); // Niedziela to dzień 0 w JavaScript
        return new Date(date.setDate(diff));
    }

    // Funkcja do ustawienia daty w nagłówku w zależności od widoku
    function setCurrentDate() {
        if (currentView === "month-view") {
            dateRangeElement.textContent = formatDate(currentMonth, currentYear);
        } else if (currentView === "week-view") {
            dateRangeElement.textContent = formatWeekDate(currentWeekStartDate, currentWeekEndDate);
        } else if (currentView === "day-view" || currentView === "today") {
            dateRangeElement.textContent = formatDayDate(currentDate);
        }
    }

    // Funkcja do zmiany widoku i ustawienia odpowiedniej daty
    function changeView(view) {
        currentView = view;
        if (view === "month-view") {
            setCurrentMonth();
        } else if (view === "week-view") {
            setCurrentWeek();
        } else if (view === "day-view" || view === "today") {
            setCurrentDay();
        }
    }

    // Funkcja do ustawienia widoku miesięcznego
    function setCurrentMonth() {
        const month = new Date();
        currentMonth = month.getMonth();
        currentYear = month.getFullYear();
        setCurrentDate();
    }

    // Funkcja do ustawienia widoku tygodniowego
    function setCurrentWeek() {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = getEndOfWeek(currentDate);
        currentWeekStartDate = startOfWeek;
        currentWeekEndDate = endOfWeek;
        setCurrentDate();
    }

    // Funkcja do ustawienia widoku "Dzienny" lub "Dzisiaj"
    function setCurrentDay() {
        currentDate = getStartOfWeek(new Date()); // Ustawiamy datę na początek tygodnia (poniedziałek)
        setCurrentDate();
    }

    // Obsługuje kliknięcia w przyciski nawigacyjne
    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            const style = buttons[button.id];
            if (style) {
                linkElement.href = style;
            }

            if (button.id === "month-view") {
                changeView("month-view");
            } else if (button.id === "week-view") {
                // Ustawienie daty na początek bieżącego tygodnia, gdy klikniesz w "week-view"
                currentDate = new Date(); // Aktualizowanie daty na dzisiejszą
                currentWeekStartDate = getStartOfWeek(currentDate);
                currentWeekEndDate = getEndOfWeek(currentDate);
                linkElement.href = "tygodniowy.css";  // Ustawienie stylu na tygodniowy
                changeView("week-view");
            } else if (button.id === "day-view") {
                changeView("day-view");
            } else if (button.id === "today") {
                changeView("today"); // Ustawienie widoku na dzisiejszy, ale ustawienie daty na początek tygodnia
            }
        });
    });

    // Obsługuje kliknięcia w przycisk "Idź do daty"
    document.getElementById("go-to-date").addEventListener("click", () => {
        const datePicker = document.getElementById("date-picker");
        datePicker.style.display = "block";  // Pokaż kalendarz
    });

    // Obsługuje wybór daty z kalendarza
    document.getElementById("date-picker").addEventListener("change", (e) => {
        const selectedDate = new Date(e.target.value);
        currentDate = selectedDate;
        currentWeekStartDate = getStartOfWeek(selectedDate);
        currentWeekEndDate = getEndOfWeek(selectedDate);

        // Zmiana widoku na tygodniowy i przypisanie odpowiedniego stylu
        linkElement.href = "tygodniowy.css";  // Ustawienie widoku na tygodniowy
        changeView("week-view");

        setCurrentDate();
        document.getElementById("date-picker").style.display = "none"; // Ukryj kalendarz
    });

    // Obsługuje kliknięcia w strzałki do zmiany daty w nagłówku
    document.querySelector('.header button:first-of-type').addEventListener('click', () => {
        if (currentView === "month-view") {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            setCurrentDate();
        } else if (currentView === "week-view") {
            currentDate.setDate(currentDate.getDate() - 7);
            setCurrentWeek();
        } else if (currentView === "day-view" || currentView === "today") {
            currentDate.setDate(currentDate.getDate() - 1); // Zmiana daty na dzień poprzedni
            setCurrentDay(); // Odświeżenie widoku dziennego
        }
    });

    document.querySelector('.header button:last-of-type').addEventListener('click', () => {
        if (currentView === "month-view") {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            setCurrentDate();
        } else if (currentView === "week-view") {
            currentDate.setDate(currentDate.getDate() + 7);
            setCurrentWeek();
        } else if (currentView === "day-view" || currentView === "today") {
            currentDate.setDate(currentDate.getDate() + 1); // Zmiana daty na dzień następny
            setCurrentDay(); // Odświeżenie widoku dziennego
        }
    });

    // Funkcja do ustawienia widoku dziennego (zapewnia, że data jest odpowiednio aktualizowana)
    function setCurrentDay() {
        // Ustawienie daty na początek tygodnia (poniedziałek)
        dateRangeElement.textContent = formatDayDate(currentDate); // Aktualizujemy datę na początek tygodnia
    }

    // Ustawiamy domyślny widok na „tygodniowy”
    linkElement.href = "tygodniowy.css";
    changeView("week-view");
    setCurrentWeek(); // Inicjalizujemy widok tygodnia
});
