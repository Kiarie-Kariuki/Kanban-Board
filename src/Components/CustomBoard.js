import React from "react";
import Board from "./board/Board"; 
import styled from "styled-components";

const Container = styled.div`
  height: auto;
  width: 100%;
  background-color: #1a1a1a; 
  color: #ffffff; 
  
`;

const CustomBoard = () => {
  return (
    <Container>
      <Board />
    </Container>
  );
};

export default CustomBoard;