const { createServer} =require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: "https://twoplayeronline-frontend.onrender.com/",
});

const allUsers = {};
const allRooms= [];

io.on("connection", (socket) => {


    // allusers.push({socket: socket ,online:true});
    allUsers[socket.id] = {
        socket: socket,
        online: true,
    }

    socket.on("request_to_play",(data)=>{
        const currentUser = allUsers[socket.id];
        currentUser.playerName = data.playerName;
        // console.log(currentUser);

        let opponentPlayer;

        for(const userId in allUsers){
            const user = allUsers[userId];
            if(user.online && user.socket.id !== socket.id && !user.playing){
                opponentPlayer = user;
                break;
            }
        }

        if(opponentPlayer){

            allRooms.push({
                player1: opponentPlayer,
                player2: currentUser
            })

           opponentPlayer.socket.emit("OpponentFound",{
                opponentName: currentUser.playerName,
                playingAs:"O"
           });
           currentUser.socket.emit("OpponentFound",{
                opponentName: opponentPlayer.playerName,
                playingAs:"X"
           });

           
           currentUser.socket.on("playerMoveFromClient",(data)=>{
                opponentPlayer.socket.emit("playerMoveFromServer",{
                    ...data, 
                });
            });
            opponentPlayer.socket.on("playerMoveFromClient",(data)=>{
                currentUser.socket.emit("playerMoveFromServer",{
                   ...data,  
                });
            });

        }else{
           currentUser.socket.emit("OpponentNotFound");

        }



    })
    socket.on("disconnect",()=>{
        const currentUser = allUsers[socket.id];
        currentUser.online = false;
        currentUser.playing= false;

        for(let i = 0; i < allRooms.length; i++) {
            const { player1, player2}=allRooms[i];

            if(player1.socket.id === socket.id ){
                player2.socket.emit("opponentLeftMatch")
                break;
            }
            if(player2.socket.id === socket.id ){
                player1.socket.emit("opponentLeftMatch")
                break;
            }
        }

    });
});

httpServer.listen(3000,()=>{
    console.log('server is running on port 3000');
});