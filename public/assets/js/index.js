document.addEventListener("DOMContentLoaded", () => {
  noteForm = document.querySelector(".note-form");
  noteTitle = document.querySelector(".note-title");
  noteText = document.querySelector(".note-textarea");
  saveNoteBtn = document.querySelector(".save-note");
  newNoteBtn = document.querySelector(".new-note");
  clearBtn = document.querySelector(".clear-btn");
  noteList = document.querySelector(".list-container .list-group");

  newNoteBtn.addEventListener("click", handleNewNoteView);
  saveNoteBtn.addEventListener("click", handleNoteSave);
  clearBtn.addEventListener("click", clearForm);
  noteTitle.addEventListener('input', handleNoteInputChange);
  noteText.addEventListener('input', handleNoteInputChange);

  // Ensure the "New Note" button is visible upon page load
  show(newNoteBtn);

  // Hide "Save Note" and "Clear Form" buttons as they should only be visible when editing/creating a note
  hide(saveNoteBtn);
  hide(clearBtn);

  getAndRenderNotes();
});

let noteForm, noteTitle, noteText, saveNoteBtn, newNoteBtn, clearBtn, noteList;
let activeNote = {};

function show(elem) { elem.style.display = "inline"; }
function hide(elem) { elem.style.display = "none"; }

function getNotes() {
  return fetch("/api/notes", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
  }).then(response => response.json());
}

function saveNote(note) {
  return fetch(`/api/notes${activeNote.id ? '/' + activeNote.id : ''}`, {
      method: activeNote.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
  }).then(response => response.json());
}

function deleteNote(id) {
  return fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
  });
}

function handleNoteSave() {
  const noteToSave = { title: noteTitle.value, text: noteText.value };

  saveNote(noteToSave).then(() => {
      clearForm();
      getAndRenderNotes();
  });
}

const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.closest(".list-group-item").dataset.note);

  noteTitle.value = activeNote.title;
  noteText.value = activeNote.text;
  noteTitle.removeAttribute("readonly");
  noteText.removeAttribute("readonly");

  hide(clearBtn); // Hide "Clear Form" when viewing an existing note
  show(saveNoteBtn); // Ensure "Save Note" is visible
  show(newNoteBtn); // Ensure "New Note" is visible
};

const handleNewNoteView = () => {
  activeNote = {}; // Clear activeNote to signify creating a new note
  noteTitle.value = ''; // Clear the note title input field
  noteText.value = ''; // Clear the note text textarea
  noteTitle.removeAttribute("readonly"); // Make the title input editable
  noteText.removeAttribute("readonly"); // Make the text textarea editable

  hide(newNoteBtn); // Hide "New Note" as you're already creating a new note
  show(saveNoteBtn); // Show "Save Note" for the new note
  show(clearBtn); // Show "Clear Form" for the new note
};

function clearForm() {
  noteTitle.value = '';
  noteText.value = '';
  noteTitle.removeAttribute("readonly");
  noteText.removeAttribute("readonly");
  hide(saveNoteBtn);
  hide(clearBtn);
  show(newNoteBtn);
}

function handleNoteInputChange() {
  const hasInput = noteTitle.value.trim() || noteText.value.trim();
  hasInput ? hide(newNoteBtn) : show(newNoteBtn);
  hasInput ? show(saveNoteBtn) : hide(saveNoteBtn);
  hasInput ? show(clearBtn) : hide(clearBtn);
}

function renderNoteList(notes) {
  noteList.innerHTML = "";

  notes.forEach(note => {
      const li = document.createElement("li");
      li.classList.add("list-group-item");
      li.dataset.note = JSON.stringify(note);

      const spanEl = document.createElement("span");
      spanEl.classList.add("list-item-title");
      spanEl.innerText = note.title;
      spanEl.addEventListener("click", handleNoteView);

      const delBtnEl = document.createElement("i");
      delBtnEl.classList.add("fas", "fa-trash-alt", "float-right", "text-danger", "delete-note");
      delBtnEl.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteNote(note.id).then(() => getAndRenderNotes());
      });

      li.append(spanEl, delBtnEl);
      noteList.appendChild(li);
  });
}

function getAndRenderNotes() {
  getNotes().then(renderNoteList);
}

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});