import React, { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];


const AddCard = ({ setCards }) => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newCard = {
      column: "todo", 
      title: text.trim(),
      description: description.trim(),
      priority,
      id: Math.random().toString(),
    };

    setCards((prevCards) => [...prevCards, newCard]);
    setTitle("");
    setDescription("")
    setPriority("medium"); 
    setText(""); 
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            label="Title"
            fullWidth
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            margin="normal"
            required
          />
          <TextField
            variant="outlined"
            label="Description"
            fullWidth
            multiline
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            margin="normal"
            required
          />
          <TextField
            select
            variant="outlined"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            fullWidth
            margin="normal"
          >
            {priorityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <Button onClick={() => setAdding(false)} color="secondary">
              Close
            </Button>
            <Button type="submit" color="primary" startIcon={<AddIcon />}>
              Add
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setAdding(true)} color="primary" startIcon={<AddIcon />}>
          Add Task
        </Button>
      )}
    </>
  );
};

export default AddCard;
