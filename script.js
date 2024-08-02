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

    function filterAndSortEntries(entries) {
        const searchQuery = searchInput.value.toLowerCase();
        const mood = moodFilter.value;
        const category = categoryFilter.value;
        const sortOrder = sortSelect.value;

        let filteredEntries = entries.filter(entry => {
            const matchesSearch = entry.title.toLowerCase().includes(searchQuery) || entry.content.toLowerCase().includes(searchQuery);
            const matchesMood = mood === 'all' || entry.mood === mood;
            const matchesCategory = category === 'all' || entry.category === category;
            return matchesSearch && matchesMood && matchesCategory;
        });

        if (sortOrder === 'newest') {
            filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        return filteredEntries;
    }

    function showModal(entryId) {
        const entry = journalEntries.find(e => e.id === entryId);
        if (entry) {
            modalTitle.textContent = entry.title;
            modalContent.innerHTML = DOMPurify.sanitize(marked(entry.content));
            modalDate.textContent = `Date: ${entry.date}`;
            modalMood.textContent = `Mood: ${entry.mood}`;
            modalCategory.textContent = `Category: ${entry.category}`;
            modalTags.textContent = `Tags: ${entry.tags.join(', ')}`;
            if (entry.image) {
                modalImage.innerHTML = `<img src="${entry.image}" alt="Entry Image">`;
            } else {
                modalImage.innerHTML = '';
            }
            if (entry.reminder) {
                modalReminder.textContent = `Reminder: ${new Date(entry.reminder).toLocaleString()}`;
            } else {
                modalReminder.textContent = '';
            }
            modal.style.display = 'block';
        }
    }

    function closeModalWindow() {
        modal.style.display = 'none';
    }

    function deleteEntry(entryId) {
        journalEntries = journalEntries.filter(entry => entry.id !== entryId);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        renderEntries(journalEntries);
    }

    function editEntry(entryId) {
        const entry = journalEntries.find(e => e.id === entryId);
        if (entry) {
            entryTitle.value = entry.title;
            entryContent.value = entry.content;
            entryDate.value = entry.date;
            moodSelect.value = entry.mood;
            categorySelect.value = entry.category;
            entryTags.value = entry.tags.join(', ');
            if (entry.image) {
                entryImage.value = ''; // Reset file input
            }
            reminderDate.value = entry.reminder;
            deleteEntry(entryId); // Delete old entry to replace it with the updated one
        }
    }

    function updateTagCloud(entries) {
        const tags = entries.flatMap(entry => entry.tags);
        const uniqueTags = [...new Set(tags)];
        tagCloud.innerHTML = '';
        uniqueTags.forEach(tag => {
            const span = document.createElement('span');
            span.classList.add('tag');
            span.textContent = tag;
            span.addEventListener('click', () => {
                searchInput.value = tag;
                renderEntries(journalEntries);
            });
            tagCloud.appendChild(span);
        });
    }

    function renderMoodChart(entries) {
        const moodCounts = entries.reduce((counts, entry) => {
            counts[entry.mood] = (counts[entry.mood] || 0) + 1;
            return counts;
        }, {});

        const moodLabels = Object.keys(moodCounts);
        const moodData = moodLabels.map(label => moodCounts[label]);

        new Chart(moodChartCtx, {
            type: 'doughnut',
            data: {
                labels: moodLabels,
                datasets: [{
                    data: moodData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function renderWordCountChart(entries) {
        const wordCounts = entries.map(entry => {
            const wordCount = entry.content.split(/\s+/).length;
            return { date: entry.date, wordCount };
        });

        const dates = wordCounts.map(entry => entry.date);
        const wordData = wordCounts.map(entry => entry.wordCount);

        new Chart(wordCountChartCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Word Count',
                    data: wordData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function exportToPdf() {
        const doc = new jsPDF();
        journalEntries.forEach((entry, index) => {
            doc.text(entry.title, 10, 10 + (index * 20));
            doc.text(entry.content, 10, 20 + (index * 20));
            doc.addPage();
        });
        doc.save('journal-entries.pdf');
    }

    saveButton.addEventListener('click', saveEntry);
    closeModal.addEventListener('click', closeModalWindow);
    window.addEventListener('click', event => {
        if (event.target === modal) {
            closeModalWindow();
        }
    });
    closeReminderModal.addEventListener('click', () => {
        reminderModal.style.display = 'none';
    });
    backupButton.addEventListener('click', () => {
        const backupData = JSON.stringify(journalEntries);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'journal-entries-backup.json';
        a.click();
    });
    restoreButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = event => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = e => {
                const restoredEntries = JSON.parse(e.target.result);
                journalEntries = restoredEntries;
                localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
                renderEntries(journalEntries);
            };
            reader.readAsText(file);
        };
        input.click();
    });
    exportPdfButton.addEventListener('click', exportToPdf);

    entryContent.addEventListener('input', () => {
        const wordCount = entryContent.value.split(/\s+/).filter(word => word.length > 0).length;
        wordCountDisplay.textContent = `Words: ${wordCount}`;
    });

    entriesList.addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('edit-button')) {
            const entryId = target.dataset.id;
            editEntry(entryId);
        } else if (target.classList.contains('delete-button')) {
            const entryId = target.dataset.id;
            deleteEntry(entryId);
        }
    });

    searchInput.addEventListener('input', () => renderEntries(journalEntries));
    sortSelect.addEventListener('change', () => renderEntries(journalEntries));
    moodFilter.addEventListener('change', () => renderEntries(journalEntries));
    categoryFilter.addEventListener('change', () => renderEntries(journalEntries));

    setInterval(() => {
        const now = new Date();
        journalEntries.forEach(entry => {
            if (entry.reminder && new Date(entry.reminder) <= now) {
                reminderMessage.textContent = `Reminder: ${entry.title} - ${entry.content}`;
                reminderModal.style.display = 'block';
                entry.reminder = ''; // Clear the reminder
                localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            }
        });
    }, 60000); 

    renderEntries(journalEntries);
});
