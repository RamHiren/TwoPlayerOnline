import { useEffect, useState } from "react";
import "./App.css";
import Square from "./Square/Square";
import { io } from 'socket.io-client';
import Swal  from 'sweetalert2';


const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

function App() {

  const  [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("O");
  const [winner, setWinner] = useState(false);
  const [highlightArray, setHighlightArray] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [PlayerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () =>{
    //row
    for(let i=0; i<3; i++){
      if(gameState[i][0] === gameState[i][1] && gameState[i][1] === gameState[i][2]){
        if(gameState[i][0] !== null){
          // setWinner(true);
          setHighlightArray([i*3 +0,i*3 +1,i*3+2])
          return gameState[i][0];
        }
      }
    }
    //column
    for(let i=0; i<3; i++){
      if(gameState[0][i] === gameState[1][i] && gameState[1][i] === gameState[2][i]){
        if(gameState[0][i] !== null){
          // setWinner(true);
          setHighlightArray([0*3 +i,1*3 +i,2*3+i])
          return gameState[0][i];
        }
      }
    }
    //diagonal
    if(gameState[0][0] === gameState[1][1] && gameState[1][1] === gameState[2][2]){
      if(gameState[0][0] !== null){
        // setWinner(true);
        setHighlightArray([0,4,8]);
        return gameState[0][0];
      }
    }
    if(gameState[0][2] === gameState[1][1] && gameState[1][1] === gameState[2][0]){
      if(gameState[0][2] !== null){
        // setWinner(true);
        setHighlightArray([2,4,6]);
        return gameState[0][2];
      }
    }

    //draw condition
    const isDraw = gameState.flat().every ((e)=>{
      if( e==='O' || e === 'X'){
        return true;
      }
    });

    if(isDraw){
      // setWinner('draw');
      return 'draw';
    }

    
    return null
  }

  useEffect(() =>{
    const winner  = checkWinner();
    if(winner){
      setWinner(winner);
      
    }
 
  },[gameState, setGameState]);

 /*  useEffect(() =>{
    if(socket && socket.connected){
      setPlayOnline(true);
    }
  },[socket,setSocket]) */

  const takePlayerName = async() =>{
    const result = await Swal.fire({
      title: "Enter Your Name",
      input: "text",
      // inputLabel: "Enter Your Name",
      // inputValue,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      }
    });

    return result;
  }

  socket?.on("opponentLeftMatch",()=>{
    setWinner('opponentLeftMatch');
    
  })

  socket?.on("playerMoveFromServer",(data)=>{
    const id = data.state.id;
    setGameState((prevState)=>{
      const newState = [...prevState];
        const rowIndex = Math.floor(id/3);
        const colIndex = id%3;
        newState[rowIndex][colIndex] = data.state.sign;
        return newState;
    });

    setCurrentPlayer(data.state.sign=== 'O' ? 'X' : 'O');
  })

  socket?.on('connect',()=>{
    setPlayOnline(true);
  });

  socket?.on('OpponentNotFound',()=>{
    setOpponentName(false);
  });

  socket?.on('OpponentFound',(data)=>{
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });


  const handleOnlineClick = async() =>{

    const result=await takePlayerName();
    if(!result.isConfirmed){
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io('https://twoplayeronline-backend.onrender.com', {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play",{
      playerName : username,
    });

    setSocket(newSocket);
  }

  if(!playOnline){
    return <div className="flex items-center justify-center h-screen px-4">
    <button onClick={handleOnlineClick} className="text-3xl sm:text-5xl md:text-7xl px-6 sm:px-8 py-3 sm:py-4 back-color rounded-md shadow-md hover:bg-blue-600 cursor-pointer">
      Play Online
    </button>
  </div>
  }

  if(playOnline && !opponentName){
    return <div className="flex items-center justify-center h-screen">
      <div className="text-4xl font-medium">Waiting for an opponent...</div>
    </div>
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center ">
        <div>
          <div className="move-detection flex justify-between items-center w-full sm:w-96 mt-4 sm:mt-10 px-2 sm:px-4">
            <div className={`left text-sm sm:text-lg font-medium py-1 sm:py-1 h-8 sm:h-6 flex items-center justify-center ${currentPlayer === playingAs ?'current-move-'+currentPlayer :'' }`}>{PlayerName}</div>
            <div className={`right text-sm sm:text-lg font-medium py-1 sm:py-1 h-8 sm:h-6 flex items-center justify-center ${currentPlayer !== playingAs ?'current-move-'+currentPlayer :'' }`}>{opponentName}</div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold water-background px-4 sm:px-6 py-2 sm:py-3 mt-6 sm:mt-9 rounded-md text-center">
          Tic Tac Toe
        </h1>
        <div className="square-wrapper grid grid-cols-3 gap-2 sm:gap-4 p-4">
          {renderFrom.map((arr,rowIndex)=>
          arr.map((e,colIndex)=>{
            return <Square 
            setGameState={setGameState} 
            key={(rowIndex*3) + colIndex} id={(rowIndex*3) + colIndex} 
            currentPlayer={currentPlayer}
            setCurrentPlayer={setCurrentPlayer}
            winner={winner}
            highlightArray={highlightArray}
            socket={socket}
            gameState={gameState}
            currentElement={e}
            playingAs={playingAs}
            />;
          }))}
        </div>

          {winner && winner !=="opponentLeftMatch" && winner !== 'draw' && (
            <div className="mt-4 sm:mt-8 text-xl sm:text-3xl font-medium text-center"> {winner=== playingAs ?"You" :winner} Won The Game </div>
          )}

           {winner && winner !=="opponentLeftMatch" && winner === 'draw' && (
            <div className="mt-4 sm:mt-8 text-xl sm:text-3xl font-medium text-center">It's Draw Game </div>
          )}
      </div>  
           {!winner && opponentName &&  (
            <div className="mt-4 sm:mt-8 text-xl sm:text-3xl font-medium text-center">You are Playing against {opponentName}</div>
          )}

           {winner && winner ==="opponentLeftMatch" &&   (
            <div className="mt-4 sm:mt-8 text-xl sm:text-3xl font-medium text-center">You won the match, Opponent Left the match</div>
          )}
      
    </>
  );
}

export default App;
