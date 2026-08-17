// Engineering Notes Hub - Home Page Script

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const subjectCards = document.querySelectorAll('.subject-card');
    const noResultsMessage = document.getElementById('noResultsMessage');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            let visibleCount = 0;

            subjectCards.forEach(card => {
                const subjectId = card.getAttribute('data-subject');
                const title = card.querySelector('h2').textContent.toLowerCase();
                const semester = card.querySelector('.semester-tag') ? card.querySelector('.semester-tag').textContent.toLowerCase() : '';

                // Check topics from subjectsData if available
                let topicsMatch = false;
                if (typeof subjectsData !== 'undefined' && subjectsData[subjectId]) {
                    const sData = subjectsData[subjectId];
                    if (sData.chapters) {
                        topicsMatch = sData.chapters.some(ch => 
                            (ch.title && ch.title.toLowerCase().includes(searchTerm)) ||
                            (ch.name && ch.name.toLowerCase().includes(searchTerm))
                        );
                    }
                    if (!topicsMatch && sData.questionBanks) {
                        topicsMatch = sData.questionBanks.some(qb => 
                            (qb.title && qb.title.toLowerCase().includes(searchTerm)) ||
                            (qb.name && qb.name.toLowerCase().includes(searchTerm))
                        );
                    }
                }

                // Show or hide based on title, semester, or topic matches
                if (title.includes(searchTerm) || semester.includes(searchTerm) || topicsMatch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show or hide empty search state
            if (noResultsMessage) {
                if (visibleCount === 0) {
                    noResultsMessage.style.display = 'block';
                } else {
                    noResultsMessage.style.display = 'none';
                }
            }
        });
    }
});