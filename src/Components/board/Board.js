import React, { useState } from "react";
import Column from "./Column";
import styled from "styled-components";
import AddCard from "./AddCard";

const BoardContainer = styled.div`
  display: flex;                  
  gap: 20px;                     
  padding: 12px;                 
  overflow-x: auto;
  justify-content: center;
  align-items: flex-start;              
`;

const DEFAULT_CARDS = [
  { title: "Look into render bug in dashboard", description: "Investigate the render issue in the dashboard.", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", description: "Complete the checklist for SOX compliance.", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", description: "Research the migration process to Azure.", id: "3", column: "backlog" },
  { title: "Document Notifications service", description: "Create documentation for the Notifications service.", id: "4", column: "backlog" },
  { title: "Research DB options for new microservice", description: "Evaluate database options for the new microservice.", id: "5", column: "todo" },
  { title: "Postmortem for outage", description: "Conduct a postmortem analysis of the recent outage.", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", description: "Align with the product team on the Q3 roadmap.", id: "7", column: "todo" },
  { title: "Refactor context providers to use Zustand", description: "Update context providers to utilize Zustand for state management.", id: "8", column: "doing" },
  { title: "Add logging to daily CRON", description: "Implement logging for the daily CRON jobs.", id: "9", column: "doing" },
  { title: "Set up DD dashboards for Lambda listener", description: "Create dashboards for monitoring the Lambda listener.", id: "10", column: "done" },
];


const Board = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);

  return (
    <BoardContainer>
      <Column title="Backlog" column="backlog" headingColor="#9e9e9e" cards={cards} setCards={setCards} />
      <Column title="TODO" column="todo" headingColor="#ffeb3b" cards={cards} setCards={setCards} />
      <Column title="In progress" column="doing" headingColor="#03a9f4" cards={cards} setCards={setCards} />
      <Column title="Complete" column="done" headingColor="#4caf50" cards={cards} setCards={setCards} />
    </BoardContainer>
  );
};

export default Board;
