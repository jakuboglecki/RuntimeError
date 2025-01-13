document.addEventListener("DOMContentLoaded", () => {
    const activities = [
        {
            album: "77777",
            date: "2025-01-12",
            timeStart: "08:15",
            timeEnd: "09:45",
            subject: "Mathematics",
            room: "101"
        },
        {
            album: "77777",
            date: "2025-01-13",
            timeStart: "08:15",
            timeEnd: "09:45",
            subject: "Mathematics",
            room: "101"
        },
        {
            album: "77777",
            date: "2025-01-13",
            timeStart: "10:15",
            timeEnd: "11:45",
            subject: "Physics",
            room: "202"
        },
        {
            album: "77777",
            date: "2025-01-14",
            timeStart: "08:00",
            timeEnd: "09:30",
            subject: "Chemistry",
            room: "103"
        },
        {
            album: "77777",
            date: "2025-02-04",
            timeStart: "08:00",
            timeEnd: "09:30",
            subject: "Chemistry",
            room: "103"
        }
    ];

    const searchButton = document.querySelector(".filters .search");
    const resetButton = document.querySelector(".filters .reset");
    const albumInput = document.getElementById("album");
    const scheduleTable = document.querySelector(".day table tbody");

    let filteredActivities = [];
    let currentDate = new Date();

    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function clearActivities() {
        const rows = scheduleTable.querySelectorAll("tr");
        rows.forEach(row => {
            row.querySelectorAll(".activity-card").forEach(card => card.remove());
        });
    }

    function filterActivities(albumNumber) {
        if (albumNumber) {
            filteredActivities = activities.filter(activity => activity.album === albumNumber);
        } else {
            filteredActivities = activities;
        }
    }

    function displayActivitiesForDate(date) {
        clearActivities();

        const selectedDateString = formatDate(date);
        const activitiesForSelectedDate = filteredActivities.filter(activity => activity.date === selectedDateString);

        activitiesForSelectedDate.forEach(activity => {
            const startRow = Array.from(scheduleTable.rows).find(r => parseInt(r.cells[0].textContent) === parseInt(activity.timeStart.split(":")[0]));

            if (startRow) {
                const startCell = startRow.cells[1];

                const card = document.createElement("div");
                card.classList.add("activity-card");
                card.style.position = "relative";
                card.style.border = "1px solid #ddd";
                card.style.borderRadius = "5px";
                card.style.padding = "5px";
                card.style.backgroundColor = "#f9f9f9";
                card.style.textAlign = "center";
                card.style.boxSizing = "border-box";

                const startCellHeight = startCell.offsetHeight;
                const startMinutes = parseInt(activity.timeStart.split(":")[1]);
                const endHour = parseInt(activity.timeEnd.split(":")[0]);
                const endMinutes = parseInt(activity.timeEnd.split(":")[1]);
                const durationInCell = ((endHour - parseInt(activity.timeStart.split(":")[0])) * 60 + (endMinutes - startMinutes)) / 60 * startCellHeight;

                const startOffset = (startMinutes / 60) * startCellHeight;

                card.style.top = `${startOffset}px`;
                card.style.height = `${durationInCell}px`;
                card.style.width = "calc(100% - 4px)";
                card.style.left = "2px";

                card.innerHTML = `
                    <strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${activity.subject}</strong><br />
                    <span style="font-size: 12px;">${activity.timeStart} - ${activity.timeEnd}</span><br />
                    <span style="font-size: 12px;">Sala: ${activity.room}</span>
                `;

                startCell.style.position = "relative";
                startCell.appendChild(card);
            }
        });
    }

    searchButton.addEventListener("click", () => {
        const albumNumber = albumInput.value;
        filterActivities(albumNumber);
        displayActivitiesForDate(currentDate);
    });

    resetButton.addEventListener("click", () => {
        albumInput.value = "";
        clearActivities();
    });

    document.querySelector(".header button:last-of-type").addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 1);
        displayActivitiesForDate(currentDate);
    });

    // Przycisk zmiany daty (przewijanie do tyłu)
    document.querySelector(".header button:first-of-type").addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 1);
        displayActivitiesForDate(currentDate);
    });
});
