import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete"; 
import { motion } from "framer-motion";
import { TextField, Button } from "@mui/material";

const Card = ({ title, description, id, column, handleDragStart, handleDelete, updateCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedPriority, setEditedPriority] = useState("Low");

  const handleSave = () => {
    updateCard(id, editedTitle, editedDescription, editedPriority);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      layoutId={id}
      draggable="true"
      onDragStart={(e) => handleDragStart(e, { title, id, column })}
      className="cursor-grab rounded-lg border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing mb-3"
      style={{
        border: '1px solid #3b3b3b', 
        borderRadius: '10px',
        marginBottom: '12px',
      }}
    >
      {isEditing ? (
        <div>
          <TextField
            variant="outlined"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            fullWidth
            placeholder="Task Title"
          />
          <TextField
            variant="outlined"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            fullWidth
            placeholder="Task Description"
            multiline
            rows={2}
          />
          <TextField
            variant="outlined"
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value)}
            fullWidth
            placeholder="Task Priority"
          />
          <div className="mt-1.5 flex items-center justify-end gap-3">
            <Button 
              onClick={() => setIsEditing(false)} 
              color="secondary" 
              variant="outlined"
              style={{ marginTop: '5px', marginBottom: '8px', marginLeft: '10px'}}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              color="primary" 
              variant="contained"
              style={{ marginTop: '5px', marginLeft: '100px', marginBottom: '8px' }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-lg text-white font-semibold" style={{textAlign: 'center'}}>{title}</h4>
          <p className="text-xs text-neutral-400" style={{textAlign: 'center', fontStyle: 'italic' }}>{description}</p>
          <p className="text-xs text-yellow-400 font-bold" style={{textAlign: 'center'}}>Priority: {editedPriority}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <Button 
              onClick={() => setIsEditing(true)} 
              className="text-blue-500 hover:underline" 
              variant="outlined"
              style={{ marginLeft: '11px' ,marginBottom: '5px' }}
            >
              Edit
            </Button>
            <Button 
              onClick={() => handleDelete(id)} 
              color="error" 
              variant="outlined" 
              startIcon={<DeleteIcon />}
              style={{ marginLeft: '100px', marginBottom: '5px' }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Card;
