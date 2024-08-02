document.addEventListener('DOMContentLoaded', () => {
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');
    const entryDate = document.getElementById('entry-date');
    const entryMood = document.getElementById('mood');
    const entryTags = document.getElementById('entry-tags');
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
    const modalTags = document.getElementById('modal-tags');
    const closeModal = document.getElementsByClassName('close')[0];
    const wordCount = document.getElementById('word-count');
    const tagCloud = document.getElementById('tag-cloud');
    const backupBtn = document.getElementById('backup-btn');
    const restoreBtn = document.getElementById('restore-btn');

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
                <div class="tags">${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                <div class="entry-actions">
                    <button class="edit-button" onclick="editEntry(${index})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-button" onclick="deleteEntry(${index})"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.entry-actions')) {
                    showEntryDetails(entry);
                }
            });
            entriesList.appendChild(li);
        });
        updateTagCloud();
        updateMoodChart();
    }

    function saveEntry() {
        const title = entryTitle.value.trim();
        const content = entryContent.value.trim();
        const date = entryDate.value;
        const mood = entryMood.value;
        const tags = entryTags.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        if (title && content && date) {
            const entry = {
                title: title,
                content: content,
                date: new Date(date).toLocaleDateString(),
                mood: mood,
                tags: tags
            };
            journalEntries.unshift(entry);
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            resetForm();
            renderEntries();
        }
    }

    function resetForm() {
        entryTitle.value = '';
        entryContent.value = '';
        entryDate.value = '';
        entryMood.value = 'happy';
        entryTags.value = '';
        updateWordCount();
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
        entryTags.value = entry.tags.join(', ');
        journalEntries.splice(index, 1);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        renderEntries();
        updateWordCount();
    }

    function filterEntries(entries, searchTerm, moodFilter) {
        return entries.filter(entry => 
            (entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
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
        modalTags.textContent = `Tags: ${entry.tags.join(', ')}`;
        modal.style.display = 'block';
    }

    function updateWordCount() {
        const words = entryContent.value.trim().split(/\s+/).length;
        wordCount.textContent = `Words: ${words}`;
    }

    function updateTagCloud() {
        const allTags = journalEntries.flatMap(entry => entry.tags);
        const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        tagCloud.innerHTML = '';
        Object.entries(tagCounts).forEach(([tag, count]) => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag');
            tagElement.textContent = `${tag} (${count})`;
            tagElement.addEventListener('click', () => {
                searchInput.value = tag;
                renderEntries();
            });
            tagCloud.appendChild(tagElement);
        });
    }

    function updateMoodChart() {
        const moodCounts = journalEntries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

        const ctx = document.getElementById('mood-chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(moodCounts),
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Mood Distribution'
                }
            }
        });
    }

    function backupData() {
        const data = JSON.stringify(journalEntries);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'journal_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function restoreData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const restoredData = JSON.parse(e.target.result);
                    journalEntries = restoredData;
                    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
                    renderEntries();
                    alert('Data restored successfully!');
                } catch (error) {
                    alert('Error restoring data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    }

    saveEntryButton.addEventListener('click', saveEntry);
    searchInput.addEventListener('input', renderEntries);
    sortSelect.addEventListener('change', renderEntries);
    moodFilter.addEventListener('change', renderEntries);
    entryContent.addEventListener('input', updateWordCount);
    backupBtn.addEventListener('click', backupData);
    restoreBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = restoreData;
        input.click();
    });

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
    updateWordCount();
});