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

    let currentView = "tygodniowy";
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let currentWeekStartDate = getStartOfWeek(currentDate);
    let currentWeekEndDate = getEndOfWeek(currentDate);

    const dateRangeElement = document.querySelector('.date-range');

    function formatDate(month, year) {
        const months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
        return `${months[month]} ${year}`;
    }

    function formatWeekDate(startDate, endDate) {
        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth() + 1;
        const endDay = endDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        return `${startDay < 10 ? '0' + startDay : startDay}.${startMonth < 10 ? '0' + startMonth : startMonth}.${startDate.getFullYear()} - ${endDay < 10 ? '0' + endDay : endDay}.${endMonth < 10 ? '0' + endMonth : endMonth}.${endDate.getFullYear()}`;
    }

    function formatDayDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${date.getFullYear()}`;
    }

    function getStartOfWeek(date) {
        const day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    function getEndOfWeek(date) {
        const day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? 0 : 7);
        return new Date(date.setDate(diff));
    }

    function setCurrentDate() {
        if (currentView === "month-view") {
            dateRangeElement.textContent = formatDate(currentMonth, currentYear);
        } else if (currentView === "week-view") {
            dateRangeElement.textContent = formatWeekDate(currentWeekStartDate, currentWeekEndDate);
        } else if (currentView === "day-view" || currentView === "today") {
            dateRangeElement.textContent = formatDayDate(currentDate);
        }
    }

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

    function setCurrentMonth() {
        const month = new Date();
        currentMonth = month.getMonth();
        currentYear = month.getFullYear();
        setCurrentDate();
    }

    function setCurrentWeek() {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = getEndOfWeek(currentDate);
        currentWeekStartDate = startOfWeek;
        currentWeekEndDate = endOfWeek;
        setCurrentDate();
    }

    function setCurrentDay() {
        currentDate = getStartOfWeek(new Date());
        setCurrentDate();
    }

    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            const style = buttons[button.id];
            if (style) {
                linkElement.href = style;
            }

            if (button.id === "month-view") {
                changeView("month-view");
            } else if (button.id === "week-view") {
                currentDate = new Date();
                currentWeekStartDate = getStartOfWeek(currentDate);
                currentWeekEndDate = getEndOfWeek(currentDate);
                linkElement.href = "tygodniowy.css";
                changeView("week-view");
            } else if (button.id === "day-view") {
                changeView("day-view");
            } else if (button.id === "today") {
                changeView("today");
            }
        });
    });

    document.getElementById("go-to-date").addEventListener("click", () => {
        const datePicker = document.getElementById("date-picker");
        datePicker.style.display = "block";
    });

    document.getElementById("date-picker").addEventListener("change", (e) => {
        const selectedDate = new Date(e.target.value);
        currentDate = selectedDate;
        currentWeekStartDate = getStartOfWeek(selectedDate);
        currentWeekEndDate = getEndOfWeek(selectedDate);

        linkElement.href = "tygodniowy.css";
        changeView("week-view");

        setCurrentDate();
        document.getElementById("date-picker").style.display = "none";
    });

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

    function setCurrentDay() {
        dateRangeElement.textContent = formatDayDate(currentDate);
    }

    linkElement.href = "tygodniowy.css";
    changeView("week-view");
    setCurrentWeek();
});
