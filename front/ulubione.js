document.addEventListener("DOMContentLoaded", function() {

    function updateHeartButton(favoriteFilters) {
        const heartButton = document.querySelector("#favorite i");
        const favoritesSelect = document.querySelector("#favorites");

        if (favoriteFilters.length > 0) {
            heartButton.classList.remove("fa-regular", "fa-heart");
            heartButton.classList.add("fa-solid", "fa-heart");

            favoritesSelect.innerHTML = '';
            favoriteFilters.forEach(function(filter) {
                const option = document.createElement('option');
                option.value = filter;
                option.textContent = filter;
                favoritesSelect.appendChild(option);
            });

            favoritesSelect.selectedIndex = 0;
            loadFilterToForm(favoriteFilters[0]);
            activateFilterOnCalendar();
        } else {
            heartButton.classList.remove("fa-solid", "fa-heart");
            heartButton.classList.add("fa-regular", "fa-heart");
            favoritesSelect.innerHTML = '';
        }
    }

    function toggleFavorite(filter) {
        const index = favoriteFilters.indexOf(filter);
        if (index === -1) {
            favoriteFilters.push(filter);
        } else {
            favoriteFilters.splice(index, 1);
        }
        updateHeartButton(favoriteFilters);
    }

    function loadFilterToForm(filter) {
        const [lecturer, room, subject, group, album, type] = filter.split('-');

        document.querySelector("#lecturer").value = lecturer;
        document.querySelector("#room").value = room;
        document.querySelector("#subject").value = subject;
        document.querySelector("#group").value = group;
        document.querySelector("#album").value = album;
        document.querySelector("#type").value = type;
    }

    function activateFilterOnCalendar() {
        const lecturer = document.querySelector("#lecturer").value;
        const room = document.querySelector("#room").value;
        const subject = document.querySelector("#subject").value;
        const group = document.querySelector("#group").value;
        const album = document.querySelector("#album").value;
        const type = document.querySelector("#type").value;
        console.log("Aktywacja filtra w kalendarzu:", {
            lecturer, room, subject, group, album, type
        });

    }

    function removeFilterFromFavorites(filter) {
        const index = favoriteFilters.indexOf(filter);
        if (index !== -1) {
            favoriteFilters.splice(index, 1);
            updateHeartButton(favoriteFilters);
        }
    }

    const heartButton = document.querySelector("#favorite");
    heartButton.addEventListener("click", function() {
        const lecturer = document.querySelector("#lecturer").value;
        const room = document.querySelector("#room").value;
        const subject = document.querySelector("#subject").value;
        const group = document.querySelector("#group").value;
        const album = document.querySelector("#album").value;
        const type = document.querySelector("#type").value;

        const filter = `${lecturer}-${room}-${subject}-${group}-${album}-${type}`;
        toggleFavorite(filter);
    });

    let favoriteFilters = [];

    const favoritesSelect = document.querySelector("#favorites");
    favoritesSelect.addEventListener("change", function(event) {
        const selectedFilter = event.target.value;
        loadFilterToForm(selectedFilter);
        activateFilterOnCalendar();
    });

    favoritesSelect.addEventListener("dblclick", function(event) {
        const selectedFilter = event.target.value;
        removeFilterFromFavorites(selectedFilter);
    });

    updateHeartButton(favoriteFilters);
});
