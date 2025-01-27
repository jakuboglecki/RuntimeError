document.addEventListener("DOMContentLoaded", () => {
    const personalizeButton = document.getElementById('personalizeButton');
    const personalizeWindow = document.getElementById('personalizeWindow');
    const closePersonalizeWindow = document.getElementById('closePersonalizeWindow');
    const increaseFontSizeButton = document.getElementById('increaseFontSize');
    const decreaseFontSizeButton = document.getElementById('decreaseFontSize');
    const toggleNightModeButton = document.getElementById('toggleNightMode');
    const modeIcon = document.getElementById('modeIcon');

    let currentFontSize = 14;

    personalizeButton.addEventListener('click', () => {
        personalizeWindow.style.display = 'block';
    });

    closePersonalizeWindow.addEventListener('click', () => {
        personalizeWindow.style.display = 'none';
    });

    increaseFontSizeButton.addEventListener('click', () => {
        if (currentFontSize === 14) {
            currentFontSize = 18;
        } else if (currentFontSize === 18) {
            currentFontSize = 24;
        }
        document.body.style.fontSize = `${currentFontSize}px`;
        adjustCardLayout();
    });

    decreaseFontSizeButton.addEventListener('click', () => {
        if (currentFontSize === 24) {
            currentFontSize = 18;
        } else if (currentFontSize === 18) {
            currentFontSize = 14;
        }
        document.body.style.fontSize = `${currentFontSize}px`;
        adjustCardLayout();
    });

    function adjustCardLayout() {
        const activityCards = document.querySelectorAll('.activity-card');
        activityCards.forEach(card => {
            card.style.height = '150%';
            card.style.width = '100%';
        });
    }

    modeIcon.addEventListener('click', function() {
        document.body.classList.toggle("night-mode");

        if (document.body.classList.contains("night-mode")) {
            modeIcon.classList.remove('fa-sun');
            modeIcon.classList.add('fa-moon');
        } else {
            modeIcon.classList.remove('fa-moon');
            modeIcon.classList.add('fa-sun');
        }
    });
});
