document.addEventListener('DOMContentLoaded', () => {
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const entryDate = document.getElementById('entry-date');
    const saveEntryButton = document.getElementById('save-entry');
    const entriesList = document.getElementById('entries-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];

    function renderEntries() {
        const filteredEntries = filterEntries(journalEntries, searchInput.value);
        const sortedEntries = sortEntries(filteredEntries, sortSelect.value);

        entriesList.innerHTML = '';
        sortedEntries.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <small>${entry.date}</small>
                <div class="entry-actions">
                    <button class="edit-button" onclick="editEntry(${index})">Edit</button>
                    <button class="delete-button" onclick="deleteEntry(${index})">Delete</button>
                </div>
            `;
            entriesList.appendChild(li);
        });
    }

    function saveEntry() {
        const title = entryTitle.value.trim();
        const content = entryContent.value.trim();
        const date = entryDate.value;

        if (title && content && date) {
            const entry = {
                title: title,
                content: content,
                date: new Date(date).toLocaleDateString()
            };

            journalEntries.unshift(entry);
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));

            entryTitle.value = '';
            entryContent.value = '';
            entryDate.value = '';

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

        journalEntries.splice(index, 1);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        renderEntries();
    }

    function filterEntries(entries, searchTerm) {
        return entries.filter(entry => 
            entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    function sortEntries(entries, sortOrder) {
        return entries.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }

    saveEntryButton.addEventListener('click', saveEntry);
    searchInput.addEventListener('input', renderEntries);
    sortSelect.addEventListener('change', renderEntries);

    window.deleteEntry = deleteEntry;
    window.editEntry = editEntry;

    renderEntries();
});