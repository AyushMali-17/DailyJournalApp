document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-entry');
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const entryDate = document.getElementById('entry-date');
    const moodSelect = document.getElementById('mood');
    const categorySelect = document.getElementById('category');
    const entryTags = document.getElementById('entry-tags');
    const entryImage = document.getElementById('entry-image');
    const reminderDate = document.getElementById('reminder-date');
    const entriesList = document.getElementById('entries-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const moodFilter = document.getElementById('mood-filter');
    const categoryFilter = document.getElementById('category-filter');
    const tagCloud = document.getElementById('tag-cloud');
    const wordCountDisplay = document.getElementById('word-count');
    const modal = document.getElementById('entry-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalDate = document.getElementById('modal-date');
    const modalMood = document.getElementById('modal-mood');
    const modalCategory = document.getElementById('modal-category');
    const modalTags = document.getElementById('modal-tags');
    const modalImage = document.getElementById('modal-image');
    const modalReminder = document.getElementById('modal-reminder');
    const closeModal = document.querySelector('.close');
    const reminderModal = document.getElementById('reminder-modal');
    const reminderMessage = document.getElementById('reminder-message');
    const closeReminderModal = document.querySelector('#reminder-modal .close');
    const moodChartCtx = document.getElementById('mood-chart').getContext('2d');
    const wordCountChartCtx = document.getElementById('word-count-chart').getContext('2d');
    const backupButton = document.getElementById('backup-btn');
    const restoreButton = document.getElementById('restore-btn');
    const exportPdfButton = document.getElementById('export-pdf-btn');
    
    let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];

    function saveEntry() {
        const title = entryTitle.value;
        const content = entryContent.value;
        const date = entryDate.value;
        const mood = moodSelect.value;
        const category = categorySelect.value;
        const tags = entryTags.value.split(',').map(tag => tag.trim());
        const reminder = reminderDate.value;
        const image = entryImage.files[0] ? URL.createObjectURL(entryImage.files[0]) : '';

        if (title && content && date) {
            const entry = {
                id: Date.now(),
                title,
                content,
                date,
                mood,
                category,
                tags,
                image,
                reminder
            };
            journalEntries.push(entry);
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            renderEntries(journalEntries);
            resetForm();
        } else {
            alert('Please fill out all required fields.');
        }
    }

    function resetForm() {
        entryTitle.value = '';
        entryContent.value = '';
        entryDate.value = '';
        moodSelect.value = 'happy';
        categorySelect.value = 'personal';
        entryTags.value = '';
        entryImage.value = '';
        reminderDate.value = '';
        wordCountDisplay.textContent = 'Words: 0';
    }

    function renderEntries(entries) {
        entriesList.innerHTML = '';
        const filteredEntries = filterAndSortEntries(entries);
        filteredEntries.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content.substring(0, 100)}...</p>
                <small>${entry.date} | Mood: ${entry.mood} | Category: ${entry.category}</small>
                <div class="entry-actions">
                    <button class="edit-button" data-id="${entry.id}">Edit</button>
                    <button class="delete-button" data-id="${entry.id}">Delete</button>
                </div>
            `;
            li.addEventListener('click', () => showModal(entry.id));
            entriesList.appendChild(li);
        });
        updateTagCloud(entries);
        renderMoodChart(entries);
        renderWordCountChart(entries);
    }


});
