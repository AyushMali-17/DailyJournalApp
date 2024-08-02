document.addEventListener('DOMContentLoaded', () => {
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const saveEntryButton = document.getElementById('save-entry');
    const entriesList = document.getElementById('entries-list');

    let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];

    function renderEntries() {
        entriesList.innerHTML = '';
        journalEntries.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <small>${entry.date}</small>
                <button onclick="deleteEntry(${index})">Delete</button>
            `;
            entriesList.appendChild(li);
        });
    }

    function saveEntry() {
        const title = entryTitle.value.trim();
        const content = entryContent.value.trim();

        if (title && content) {
            const entry = {
                title: title,
                content: content,
                date: new Date().toLocaleString()
            };

            journalEntries.unshift(entry);
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));

            entryTitle.value = '';
            entryContent.value = '';

            renderEntries();
        }
    }

    function deleteEntry(index) {
        journalEntries.splice(index, 1);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        renderEntries();
    }

    saveEntryButton.addEventListener('click', saveEntry);

    window.deleteEntry = deleteEntry;

    renderEntries();
});