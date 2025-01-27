document.addEventListener("DOMContentLoaded", () => {
    const activities = [
        {
            album: "77777",
            date: "2025-01-12",
            timeStart: "08:15",
            timeEnd: "09:45",
            subject: "Mathematics",
            room: "101",
            type: "Wykład"
        },
        {
            album: "77777",
            date: "2025-01-13",
            timeStart: "08:15",
            timeEnd: "09:45",
            subject: "Mathematics",
            room: "101",
            type: "Laboratoria"
        },
        {
            album: "77777",
            date: "2025-01-13",
            timeStart: "10:15",
            timeEnd: "11:45",
            subject: "Physics",
            room: "202",
            type: "Audytoria"
        },
        {
            album: "77777",
            date: "2025-01-14",
            timeStart: "08:00",
            timeEnd: "09:30",
            subject: "Chemistry",
            room: "103",
            type: "Wykład"
        },
        {
            album: "77777",
            date: "2025-02-04",
            timeStart: "08:00",
            timeEnd: "09:30",
            subject: "Chemistry",
            room: "103",
            type: "Laboratoria"
        },
        {
            album: "77778",
            date: "2025-01-13",
            timeStart: "08:15",
            timeEnd: "09:45",
            subject: "Biologia",
            room: "101",
            type: "Wykład"
        },
        {
            album: "77779",
            date: "2025-01-13",
            timeStart: "08:15",
            timeEnd: "09:45",
            subject: "Mathematics",
            room: "101",
            type: "Laboratoria"
        },
        {
            album: "77779",
            date: "2025-01-13",
            timeStart: "10:15",
            timeEnd: "11:45",
            subject: "Mathematics",
            room: "101",
            type: "Wykład"
        },
    ];

    const searchButton = document.querySelector(".filters .search");
    const albumInput = document.getElementById("album");
    const scheduleTable = document.querySelector(".schedule table tbody");
    const resetButton = document.querySelector(".filters .reset");

    let filteredActivities = [];
    let currentStartOfWeekDate = new Date();

    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getDayOfWeek(date) {
        return (new Date(date).getDay() + 6) % 7;
    }

    function clearActivities() {
        const rows = scheduleTable.querySelectorAll("tr");
        rows.forEach(row => {
            row.querySelectorAll(".activity-card").forEach(card => card.remove());
        });
    }

    function openColorPicker(card) {
        let modal = document.createElement("div");
        modal.classList.add("color-modal");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        modal.style.zIndex = "1000";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";

        let colorPalette = document.createElement("div");
        colorPalette.style.display = "grid";
        colorPalette.style.gridTemplateColumns = "repeat(5, 1fr)"; // 5 columns for 25 colors
        colorPalette.style.gap = "15px";
        colorPalette.style.padding = "30px";
        colorPalette.style.backgroundColor = "white";
        colorPalette.style.borderRadius = "10px";
        colorPalette.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

        // 25 kolorów w odpowiedniej kolejności
        const colors = [
            "#FF6347", "#FF4500", "#DC143C", "#FF1493", "#FF8C00",
            "#FFD700", "#FFFF00", "#ADFF2F", "#00FF00", "#32CD32",
            "#3CB371", "#2E8B57", "#008000", "#4682B4", "#1E90FF",
            "#4169E1", "#0000FF", "#8A2BE2", "#800080", "#9370DB",
            "#D2691E", "#CD5C5C", "#A52A2A", "#B8860B", "#8B0000"
        ];

        colors.forEach(color => {
            const colorBlock = document.createElement("div");
            colorBlock.style.backgroundColor = color;
            colorBlock.style.width = "80px";
            colorBlock.style.height = "80px";
            colorBlock.style.cursor = "pointer";
            colorBlock.style.borderRadius = "5px";
            colorBlock.style.transition = "transform 0.2s";
            colorBlock.addEventListener("mouseenter", () => {
                colorBlock.style.transform = "scale(1.1)";
            });
            colorBlock.addEventListener("mouseleave", () => {
                colorBlock.style.transform = "scale(1)";
            });

            colorBlock.addEventListener("click", () => {
                card.style.backgroundColor = color;
                localStorage.setItem(card.id, color);
                modal.style.display = "none";
            });

            colorPalette.appendChild(colorBlock);
        });

        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset Color";
        resetButton.style.padding = "10px 20px";
        resetButton.style.backgroundColor = "#ccc";
        resetButton.style.border = "none";
        resetButton.style.borderRadius = "5px";
        resetButton.style.cursor = "pointer";
        resetButton.addEventListener("click", () => {
            card.style.backgroundColor = "#f9f9f9";
            localStorage.removeItem(card.id);
            modal.style.display = "none";
        });

        colorPalette.appendChild(resetButton);

        modal.appendChild(colorPalette);
        document.body.appendChild(modal);

        modal.addEventListener("click", function(event) {
            if (!colorPalette.contains(event.target)) {
                modal.style.display = "none";
            }
        });
    }

    function loadColorForCard(card) {
        const savedColor = localStorage.getItem(card.id);
        if (savedColor) {
            card.style.backgroundColor = savedColor;
        }
    }

    function filterAndDisplayActivities(albumNumber) {
        clearActivities();

        filteredActivities = activities.filter(activity => activity.album === albumNumber);

        const dateRangeString = document.querySelector('.date-range').textContent.trim();
        const [startDate, endDate] = dateRangeString.split(' - ').map(date => {
            const [day, month, year] = date.split('.');
            return new Date(`${year}-${month}-${day}`);
        });

        if (filteredActivities.length > 0) {
            filteredActivities.forEach(activity => {
                const activityDate = new Date(activity.date);
                const activityDateString = formatDate(activityDate);

                if (activityDate >= startDate && activityDate <= endDate) {
                    const dayOfWeek = getDayOfWeek(activityDate);
                    const startRow = Array.from(scheduleTable.rows).find(r => parseInt(r.cells[0].textContent) === parseInt(activity.timeStart.split(":")[0]));

                    if (startRow) {
                        const startCell = startRow.cells[dayOfWeek + 1];

                        const card = document.createElement("div");
                        card.classList.add("activity-card");
                        card.style.position = "absolute";
                        card.style.border = "1px solid #ddd";
                        card.style.borderRadius = "5px";
                        card.style.padding = "5px";
                        card.style.backgroundColor = "#f9f9f9";
                        card.style.textAlign = "center";
                        card.style.overflow = "hidden";
                        card.style.boxSizing = "border-box";

                        // Dynamiczne dopasowanie wysokości kafelka do komórki
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
                        card.id = `card-${activity.album}-${activity.date}-${activity.timeStart}`;

                        card.innerHTML = `
                        <strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${activity.subject}</strong><br />
                        <span style="font-size: 12px;">${activity.timeStart} - ${activity.timeEnd}</span><br />
                        <span style="font-size: 12px;">Sala: ${activity.room}</span><br />
                          
                    `;

                        card.addEventListener("click", function() {
                            openColorPicker(card);
                        });

                        loadColorForCard(card);

                        startCell.style.position = "relative";
                        startCell.appendChild(card);
                    }
                }
            });
        }
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

    searchButton.addEventListener("click", () => {
        const albumNumber = albumInput.value;
        if (albumNumber) {
            filterAndDisplayActivities(albumNumber);
        } else {
            filterAndDisplayActivities("");
        }
    });

    resetButton.addEventListener("click", () => {
        albumInput.value = "";
        clearActivities();
    });

    document.querySelector(".header button:last-of-type").addEventListener("click", () => {
        currentStartOfWeekDate.setDate(currentStartOfWeekDate.getDate() + 7);
        filterAndDisplayActivities(albumInput.value);
    });

    document.querySelector(".header button:first-of-type").addEventListener("click", () => {
        currentStartOfWeekDate.setDate(currentStartOfWeekDate.getDate() - 7);
        filterAndDisplayActivities(albumInput.value);
    });
});
