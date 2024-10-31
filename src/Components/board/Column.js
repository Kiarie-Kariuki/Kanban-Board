import React, { useState } from "react";
import Card from "./Card";
import AddCard from "./AddCard";
import styled from "styled-components";

const ColumnContainer = styled.div`
  width: 300px;          
  flex-shrink: 0;       
  background-color: #2a2a2a; 
  border-radius: 8px;   
  padding: 10px; 
`;

const Column = ({ title, headingColor, cards, column, setCards }) => {
  console.log(`Column Title: ${title}, Heading Color: ${headingColor}`)
  const [active, setActive] = useState(false);

  const handleDelete = (cardId) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDrop = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    const draggedCard = cards.find((card) => card.id === cardId);
    
    if (draggedCard && draggedCard.column !== column) {
      const updatedCards = cards.map((card) =>
        card.id === cardId ? { ...card, column } : card
      );
      setCards(updatedCards);
    }
    setActive(false);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const updateCard = (id, newTitle, newDescription, newPriority) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, title: newTitle, description: newDescription, priority: newPriority } : card
      )
    );
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <ColumnContainer>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium`} style={{color: headingColor}}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">{filteredCards.length}</span>
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setActive(true);
        }}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"}`}
      >
        {filteredCards.map((c) => (
          <Card key={c.id} {...c} handleDragStart={handleDragStart} handleDelete={handleDelete} updateCard={updateCard} />
        ))}
        {column === "todo" && <AddCard setCards={setCards} />}
      </div>
    </ColumnContainer>
  );
};

export default Column;
