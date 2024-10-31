import React, { useEffect, useState } from "react";
import Column from "./Column";
import styled from "styled-components";
import axios from "axios";

const BoardContainer = styled.div`
  display: flex;                  
  gap: 20px;                     
  padding: 12px;                 
  overflow-x: auto;
  justify-content: center;
  align-items: flex-start;              
`;

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json', 
        }
      });

      console.log("Fetched tasks:", response.data); 

      setTasks(response.data); 
    } catch (error) {
      setError('Error fetching tasks: ' + (error.response?.data?.message || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Group tasks by status for rendering
  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {});

  const tasksByColumn = {
    backlog: groupedTasks.backlog || [],
    todo: groupedTasks.todo || [],
    "in-progress": groupedTasks["in-progress"] || [],
    done: groupedTasks.done || [],
  }; 
  
  return (
    <BoardContainer>
      {loading ? <p>Loading tasks...</p> : (
        <>
          {error && <p>{error}</p>}
          <Column title="Backlog" column="backlog" headingColor="#9e9e9e" cards={groupedTasks.backlog || []} />
          <Column title="TODO" column="todo" headingColor="#ffeb3b" cards={groupedTasks.todo && []} />
          <Column title="In Progress" column="doing" headingColor="#03a9f4" cards={groupedTasks['in-progress'] || []} />
          <Column title="Complete" column="done" headingColor="#4caf50" cards={groupedTasks.done || []} />
        </>
      )}
    </BoardContainer>
  );
};

export default Board;
