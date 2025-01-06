document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        "today": "dzisiaj.css",
        "day-view": "dzienny.css",
        "week-view": "tygodniowy.css",
        "month-view": "miesieczny.css",
        "semester-view": "semestr.css"
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
    let currentWeekStartDate = getStartOfWeek(new Date(currentDate)); // Początek bieżącego tygodnia
    let currentWeekEndDate = getEndOfWeek(new Date(currentDate)); // Koniec bieżącego tygodnia

    const dateRangeElement = document.querySelector('.date-range'); // Element wyświetlający datę

    // Funkcja do formatowania daty w formacie Miesiąc Rok (np. Styczeń 2025)
    function formatDate(month, year) {
        const months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
        return `${months[month]} ${year}`;
    }

    // Funkcja do formatowania daty tygodnia (np. 01.01.2025 - 07.01.2025)
    function formatWeekDate(startDate, endDate) {
        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth() + 1;
        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        return `${startDay < 10 ? '0' + startDay : startDay}.${startMonth < 10 ? '0' + startMonth : startMonth}.${startDate.getFullYear()} - ${endDay < 10 ? '0' + endDay : endDay}.${endMonth < 10 ? '0' + endMonth : endMonth}.${endDate.getFullYear()}`;
    }

    // Funkcja do formatowania daty na "Dzień" (np. 05.01.2025)
    function formatDayDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
        const dayName = daysOfWeek[date.getDay()];
        return `${dayName}, ${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${date.getFullYear()}`;
    }

    // Funkcja do uzyskania daty początkowej tygodnia (poniedziałek)
    function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    // Funkcja do uzyskania daty końcowej tygodnia (niedziela)
    function getEndOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? 0 : 7);
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
        const startOfWeek = getStartOfWeek(new Date(currentDate));
        const endOfWeek = getEndOfWeek(new Date(currentDate));
        currentWeekStartDate = startOfWeek;
        currentWeekEndDate = endOfWeek;
        setCurrentDate();
    }

    // Funkcja do ustawienia widoku "Dzienny" lub "Dzisiaj"
    function setCurrentDay() {
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
                changeView("week-view");
            } else if (button.id === "day-view") {
                changeView("day-view");
            } else if (button.id === "today") {
                changeView("today");
            }
        });
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
            currentDate.setDate(currentDate.getDate() - 1);
            setCurrentDay();
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
            currentDate.setDate(currentDate.getDate() + 1);
            setCurrentDay();
        }
    });

    // Ustawiamy domyślny widok na „tygodniowy”
    linkElement.href = "tygodniowy.css";
    changeView("week-view");
    setCurrentWeek();
});
