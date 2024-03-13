const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // This is for generating unique IDs for each note

const app = express();
const PORT = 3001;

// Body parser middleware to handle JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for GET requests to fetch all notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error reading notes' });
        }
        res.json(JSON.parse(data));
    });
});

// API endpoint for POST requests to add a new note
app.post('/api/notes', (req, res) => {
    const newNote = { id: uuidv4(), ...req.body };

    // Read the existing notes
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error reading notes' });
        }

        const notes = JSON.parse(data);
        notes.push(newNote);

        // Write the updated notes back to the file
        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error writing new note' });
            }
            res.json(newNote); // Send the new note back in the response
        });
    });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
  
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error reading notes' });
      }
  
      let notes = JSON.parse(data);
      notes = notes.filter(note => note.id !== noteId);
  
      fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error saving notes' });
        }
        res.json({ message: `Note ${noteId} has been deleted` });
      });
    });
  });

  app.put('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const updatedNote = req.body;
  
    // Read the existing notes from db.json
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error reading notes' });
      }
  
      let notes = JSON.parse(data);
      // Find the index of the note with the matching ID
      const noteIndex = notes.findIndex(note => note.id === noteId);
  
      if (noteIndex !== -1) {
        // Update the note at the found index
        notes[noteIndex] = { ...notes[noteIndex], ...updatedNote };
  
        // Write the updated notes array back to the db.json file
        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), 'utf8', (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error writing updated note' });
          }
          res.json(notes[noteIndex]); // Respond with the updated note
        });
      } else {
        res.status(404).json({ message: 'Note not found' });
      }
    });
  });