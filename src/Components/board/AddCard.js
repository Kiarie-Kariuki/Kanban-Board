import React, { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const AddCard = ({ setTasks }) => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
  
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "todo", 
    };
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Update the tasks state to include the new task
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        if (!newTasks[newTask.status]) {
          newTasks[newTask.status] = [];
        }
        newTasks[newTask.status].push(response.data);
        return newTasks;
      });
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      // Reset form states as needed
      setTitle("");
      setDescription("");
      setPriority("medium");
    }

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
          {error && <p style={{ color: 'red' }}>{error}</p>} 
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
