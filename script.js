document.addEventListener('DOMContentLoaded', function() {
    // Set the default subject to 'math'
    const defaultSubject = 'math';
    let currentSubject = defaultSubject;
    
    loadNotes(currentSubject);

    // Handle note form submission
    document.getElementById('noteForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const imageInput = document.getElementById('imageInput').files[0];

        const note = {
            id: Date.now(),
            title: title,
            content: content,
            image: '',
            imageSize: 50, // Default size 50%
            textAlign: 'left',
            fontSize: 20,
            lineSpacing: 2
        };

        if (imageInput) {
            const reader = new FileReader();
            reader.onload = function(e) {
                note.image = e.target.result;
                saveNoteToStorage(note, currentSubject);
                appendNoteToDOM(note);
            };
            reader.readAsDataURL(imageInput);
        } else {
            saveNoteToStorage(note, currentSubject);
            appendNoteToDOM(note);
        }

        document.getElementById('noteForm').reset();
    });

    // Handle navigation clicks
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            currentSubject = this.getAttribute('data-subject');
            loadNotes(currentSubject);
        });
    });

    function loadNotes(subject) {
        const notes = JSON.parse(localStorage.getItem(subject)) || [];
        const notesContainer = document.getElementById('notesContainer');
        notesContainer.innerHTML = ''; // Clear existing notes
        notes.forEach(note => appendNoteToDOM(note));
    }

    function saveNoteToStorage(note, subject) {
        const notes = JSON.parse(localStorage.getItem(subject)) || [];
        const existingNoteIndex = notes.findIndex(n => n.id === note.id);

        if (existingNoteIndex !== -1) {
            notes[existingNoteIndex] = note;
        } else {
            notes.push(note);
        }

        localStorage.setItem(subject, JSON.stringify(notes));
    }

    function deleteNoteFromStorage(noteId, subject) {
        let notes = JSON.parse(localStorage.getItem(subject)) || [];
        notes = notes.filter(note => note.id !== noteId);
        localStorage.setItem(subject, JSON.stringify(notes));
    }

    function appendNoteToDOM(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.setAttribute('data-id', note.id);
        noteElement.style.textAlign = note.textAlign;
        noteElement.style.fontSize = note.fontSize + 'px';
        noteElement.style.lineHeight = note.lineSpacing;

        const noteTitle = document.createElement('h2');
        noteTitle.textContent = note.title;
        noteElement.appendChild(noteTitle);

        const noteContent = document.createElement('p');
        noteContent.innerHTML = note.content;
        noteElement.appendChild(noteContent);

        if (note.image) {
            const noteImage = document.createElement('img');
            noteImage.src = note.image;
            noteImage.style.width = note.imageSize + '%';
            noteElement.appendChild(noteImage);
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', function() {
            showPasswordModal(note, 'edit');
        });
        buttonContainer.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function() {
            showPasswordModal(note, 'delete');
        });
        buttonContainer.appendChild(deleteButton);

        noteElement.appendChild(buttonContainer);

        document.getElementById('notesContainer').appendChild(noteElement);
    }

    function showPasswordModal(note, action) {
        const modal = document.getElementById('passwordModal');
        const passwordInput = document.getElementById('passwordInput');
        const passwordSubmit = document.getElementById('passwordSubmit');

        modal.style.display = 'block';

        passwordSubmit.onclick = function() {
            if (passwordInput.value === 'qwertyuiop') {
                modal.style.display = 'none';
                if (action === 'edit') {
                    openEditModal(note);
                } else if (action === 'delete') {
                    deleteNoteFromStorage(note.id, currentSubject);
                    document.querySelector(`.note[data-id='${note.id}']`).remove();
                }
            } else {
                alert('Incorrect password');
            }
        };

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    function openEditModal(note) {
        const modal = document.getElementById('editModal');
        const closeBtn = modal.querySelector('.close');
        const saveBtn = modal.querySelector('#saveEdit');
        const deleteImageBtn = modal.querySelector('#deleteImage');
        const imgSizeInput = modal.querySelector('#imgSize');
        const highlightButton = modal.querySelector('#highlightButton');
        const alignLeftBtn = modal.querySelector('#alignLeft');
        const alignCenterBtn = modal.querySelector('#alignCenter');
        const alignRightBtn = modal.querySelector('#alignRight');
        const fontSizeInput = modal.querySelector('#fontSize');
        const lineSpacingInput = modal.querySelector('#lineSpacing');
        const boldButton = modal.querySelector('#boldButton');

        modal.style.display = 'block';
        document.getElementById('editTitle').value = note.title;
        document.getElementById('editContent').value = note.content;
        imgSizeInput.value = note.imageSize;
        fontSizeInput.value = note.fontSize;
        lineSpacingInput.value = note.lineSpacing;

        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };

        saveBtn.onclick = function() {
            note.title = document.getElementById('editTitle').value;
            note.content = document.getElementById('editContent').value;
            note.imageSize = imgSizeInput.value;
            note.textAlign = document.getElementById('editContent').style.textAlign;
            note.fontSize = fontSizeInput.value;
            note.lineSpacing = lineSpacingInput.value;

            const editImageInput = document.getElementById('editImageInput').files[0];
            if (editImageInput) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    note.image = e.target.result;
                    updateNoteInDOM(note);
                    saveNoteToStorage(note, currentSubject);
                    modal.style.display = 'none';
                };
                reader.readAsDataURL(editImageInput);
            } else {
                updateNoteInDOM(note);
                saveNoteToStorage(note, currentSubject);
                modal.style.display = 'none';
            }
        };

        deleteImageBtn.onclick = function() {
            note.image = '';
            note.imageSize = 100;
            updateNoteInDOM(note);
            saveNoteToStorage(note, currentSubject);
            modal.style.display = 'none';
        };

        imgSizeInput.oninput = function() {
            const noteImage = document.querySelector(`.note[data-id='${note.id}'] img`);
            if (noteImage) {
                noteImage.style.width = imgSizeInput.value + '%';
            }
        };

        highlightButton.onclick = function() {
            const highlightColor = document.getElementById('highlightColor').value;
            const editContent = document.getElementById('editContent');
            if (editContent.selectionStart !== editContent.selectionEnd) {
                const selectedText = editContent.value.substring(editContent.selectionStart, editContent.selectionEnd);
                const newText = `<span style="background-color: ${highlightColor}">${selectedText}</span>`;
                editContent.setRangeText(newText, editContent.selectionStart, editContent.selectionEnd, 'end');
            }
        };

        boldButton.onclick = function() {
            const editContent = document.getElementById('editContent');
            if (editContent.selectionStart !== editContent.selectionEnd) {
                const selectedText = editContent.value.substring(editContent.selectionStart, editContent.selectionEnd);
                const newText = `<strong>${selectedText}</strong>`;
                editContent.setRangeText(newText, editContent.selectionStart, editContent.selectionEnd, 'end');
            }
        };

        alignLeftBtn.onclick = function() {
            document.getElementById('editContent').style.textAlign = 'left';
        };

        alignCenterBtn.onclick = function() {
            document.getElementById('editContent').style.textAlign = 'center';
        };

        alignRightBtn.onclick = function() {
            document.getElementById('editContent').style.textAlign = 'right';
        };
    }

    function updateNoteInDOM(note) {
        const noteElement = document.querySelector(`.note[data-id='${note.id}']`);
        noteElement.querySelector('h2').textContent = note.title;
        noteElement.querySelector('p').innerHTML = note.content;
        noteElement.style.textAlign = note.textAlign;
        noteElement.style.fontSize = note.fontSize + 'px';
        noteElement.style.lineHeight = note.lineSpacing;

        if (note.image) {
            let noteImage = noteElement.querySelector('img');
            if (!noteImage) {
                noteImage = document.createElement('img');
                noteElement.appendChild(noteImage);
            }
            noteImage.src = note.image;
            noteImage.style.width = note.imageSize + '%';
        } else {
            const noteImage = noteElement.querySelector('img');
            if (noteImage) {
                noteImage.remove();
            }
        }
    }
});
