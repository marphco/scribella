let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;
let clearBtn;

if (window.location.pathname.includes("/notes")) {
  noteForm = document.querySelector(".note-form");
  noteTitle = document.querySelector(".note-title");
  noteText = document.querySelector(".note-textarea");
  saveNoteBtn = document.querySelector(".save-note");
  newNoteBtn = document.querySelector(".new-note");
  clearBtn = document.querySelector(".clear-btn");
  noteList = document.querySelector(".list-container .list-group");
}

// Function to show an element
const show = (elem) => {
  elem.style.display = "inline";
};

// Function to hide an element
const hide = (elem) => {
  elem.style.display = "none";
};

let activeNote = {};

const getNotes = () =>
  fetch("/api/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });

const saveNote = (note) =>
  fetch("http://localhost:3001/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

const deleteNote = (id) =>
fetch(`http://localhost:3001/api/notes/${id}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  }
}).then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
});

const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute("readonly", true);
    noteText.setAttribute("readonly", true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute("readonly");
    noteText.removeAttribute("readonly");
    noteTitle.value = "";
    noteText.value = "";
    show(clearBtn);
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote)
    .then(() => {
      getAndRenderNotes();
      renderActiveNote();
    })
    .catch((error) => console.error("Failed to save note:", error));
};

const handleNoteDelete = (e) => {
  e.stopPropagation();

  const noteItem = e.target.closest(".list-group-item");
  const noteId = noteItem.dataset.noteId;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId)
    .then(() => {
      getAndRenderNotes();
      renderActiveNote();
    })
    .catch((error) => console.error("Failed to delete note:", error));
};

const handleNoteView = (e) => {
  e.preventDefault();
  const noteData = e.target.closest(".list-group-item").dataset.note;
  activeNote = JSON.parse(noteData);
  renderActiveNote();
};

const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderBtns = () => {
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(saveNoteBtn);
    hide(clearBtn);
  } else {
    show(saveNoteBtn);
    show(clearBtn);
  }
};

const renderNoteList = (notes) => {
  noteList.innerHTML = "";

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.dataset.noteId = note.id; // Use the note's unique ID here

    const spanEl = document.createElement("span");
    spanEl.classList.add("list-item-title");
    spanEl.innerText = note.title;
    spanEl.addEventListener("click", handleNoteView);

    const delBtnEl = document.createElement("i");
    delBtnEl.classList.add("fas", "fa-trash-alt", "float-right", "text-danger", "delete-note");
    delBtnEl.addEventListener("click", handleNoteDelete);

    li.appendChild(spanEl);
    li.appendChild(delBtnEl);

    noteList.appendChild(li);
  });

  if (notes.length === 0) {
    noteList.innerHTML = '<li class="list-group-item">No saved notes</li>';
  }
};

const getAndRenderNotes = () => {
  getNotes()
    .then(renderNoteList)
    .catch((error) => console.error("Failed to get notes:", error));
};

if (window.location.pathname.includes("/notes")) {
  saveNoteBtn.addEventListener("click", handleNoteSave);
  newNoteBtn.addEventListener("click", handleNewNoteView);
  clearBtn.addEventListener("click", handleNewNoteView); // This should clear the form, not handleNewNoteView
  noteForm.addEventListener("input", handleRenderBtns);
  document.addEventListener("DOMContentLoaded", getAndRenderNotes); // Ensure notes are rendered when the DOM is fully loaded
}
