// Engineering Notes Hub - Home Page Script

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const subjectCards = document.querySelectorAll('.subject-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            subjectCards.forEach(card => {
                // Check the title of the subject
                const title = card.querySelector('h2').textContent.toLowerCase();
                const semester = card.querySelector('.semester-tag') ? card.querySelector('.semester-tag').textContent.toLowerCase() : '';

                // Show or hide based on the search input
                if (title.includes(searchTerm) || semester.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});