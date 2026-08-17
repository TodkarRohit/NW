// Engineering Notes Hub - Home Page Script

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const subjectCards = document.querySelectorAll('.subject-card');

    // Search Bar Filtering across Subject Names and Semesters
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            subjectCards.forEach(card => {
                const title = card.querySelector('h2').textContent.toLowerCase();
                const semester = card.querySelector('.semester-tag') ? card.querySelector('.semester-tag').textContent.toLowerCase() : '';

                // Matches subject title or semester
                if (title.includes(searchTerm) || semester.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});