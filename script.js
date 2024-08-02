document.addEventListener('DOMContentLoaded', () => {
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const entryDate = document.getElementById('entry-date');
    const entryMood = document.getElementById('mood');
    const saveEntryButton = document.getElementById('save-entry');
    const entriesList = document.getElementById('entries-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const moodFilter = document.getElementById('mood-filter');
    const modal = document.getElementById('entry-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalDate = document.getElementById('modal-date');
    const modalMood = document.getElementById('modal-mood');
    const closeModal = document.getElementsByClassName('close')[0];

    let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];

    function renderEntries() {
        const filteredEntries = filterEntries(journalEntries, searchInput.value, moodFilter.value);
        const sortedEntries = sortEntries(filteredEntries, sortSelect.value);
        entriesList.innerHTML = '';
        sortedEntries.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</p>
                <small>${entry.date} | Mood: ${entry.mood}</small>
                <div class="entry-actions">
                    <button class="edit-button" onclick="editEntry(${index})">Edit</button>
                    <button class="delete-button" onclick="deleteEntry(${index})">Delete</button>
                </div>
            `;
            li.addEventListener('click', () => showEntryDetails(entry));
            entriesList.appendChild(li);
        });
    }

    function saveEntry() {
        const title = entryTitle.value.trim();
        const content = entryContent.value.trim();
        const date = entryDate.value;
        const mood = entryMood.value;
        if (title && content && date) {
            const entry = {
                title: title,
                content: content,
                date: new Date(date).toLocaleDateString(),
                mood: mood
            };
            journalEntries.unshift(entry);
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            entryTitle.value = '';
            entryContent.value = '';
            entryDate.value = '';
            entryMood.value = 'happy';
            renderEntries();
        }
    }

    function deleteEntry(index) {
        journalEntries.splice(index, 1);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        renderEntries();
    }

    function editEntry(index) {
        const entry = journalEntries[index];
        entryTitle.value = entry.title;
        entryContent.value = entry.content;
        entryDate.value = new Date(entry.date).toISOString().split('T')[0];
        entryMood.value = entry.mood;
        journalEntries.splice(index, 1);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        renderEntries();
    }

    function filterEntries(entries, searchTerm, moodFilter) {
        return entries.filter(entry => 
            (entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (moodFilter === 'all' || entry.mood === moodFilter)
        );
    }

    function sortEntries(entries, sortOrder) {
        return entries.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }

    function showEntryDetails(entry) {
        modalTitle.textContent = entry.title;
        modalContent.textContent = entry.content;
        modalDate.textContent = `Date: ${entry.date}`;
        modalMood.textContent = `Mood: ${entry.mood}`;
        modal.style.display = 'block';
    }

    saveEntryButton.addEventListener('click', saveEntry);
    searchInput.addEventListener('input', renderEntries);
    sortSelect.addEventListener('change', renderEntries);
    moodFilter.addEventListener('change', renderEntries);

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    window.deleteEntry = deleteEntry;
    window.editEntry = editEntry;

    renderEntries();
});