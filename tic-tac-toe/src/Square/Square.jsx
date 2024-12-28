import React, { useState } from 'react'
import './Square.css'

const Square = ({id,setGameState,currentPlayer,setCurrentPlayer,winner,highlightArray,socket,gameState,currentElement,playingAs}) => {

  const [ox, setOx] = useState(null);

  const handleOnClickSquare = () => {

    if(playingAs !== currentPlayer){
      return;
    }

    if(winner){
      return;
    }

    if(!ox){
      if(currentPlayer=== 'O'){
        setOx('O');
      }else{
        setOx('X');
      }
      const nowCurrentPlayer = currentPlayer;
      socket.emit("playerMoveFromClient",{state: 
        {
          id,
          sign: nowCurrentPlayer,
        },
      });

      setCurrentPlayer(currentPlayer=== 'O' ? 'X' : 'O');

      setGameState(prevState=>{
        const newState = [...prevState];
        const rowIndex = Math.floor(id/3);
        const colIndex = id%3;
        newState[rowIndex][colIndex] = nowCurrentPlayer;
        
        
        return newState;
      })

    }
  };

  return (
    <>
     <div onClick={handleOnClickSquare}
      className={`w-24 h-24 water-background-square border border-black rounded-md cursor-pointer
       ${winner ? 'pointer-events-none' : ''} ${currentPlayer !== playingAs ? 'pointer-events-none' : ''}
       ${highlightArray.includes(id) ? winner+'-won':''} 
       `}>
      {currentElement === 'O' ? 'O' : currentElement==='X' ? 'X' : ox}
     </div>
    </>
  )
}

export default Square
