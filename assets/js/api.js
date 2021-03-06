import store from './store';
import socket from "./socket";

class TheServer {

  submit_register(data) {
    console.log(data)
    // data.wins = 0;
    // data.totalGames = 0;

    let newData = {
      name: data.name,
      email: data.email,
      password: data.password,
      wins: 0,
      totalGames: 0,
    };
    console.log(newData)
    console.log(data)
    $.ajax("/api/v1/users", {
      method: "post",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(newData),
      success: (resp) => {
        alert("User created successfully");
        store.dispatch({
          type: 'ADD_USER',
          users: resp.data,
        });
      // this.request_users();
      },
      error: function(e){
        alert("Username Taken! Please enter a different username");
      },
    });
  }

  submit_login(data) {
    $.ajax("/api/v1/token", {
      method: "post",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(data),
      success: (resp) => {
        store.dispatch({
          type: 'SET_TOKEN',
          token: resp,
        })

        localStorage.setItem("user_token", JSON.stringify(resp));
        console.log(resp)

      },
      error: function(e){
        alert("Invalid Login Details");
      },
    });
  }

  set_token(resp){
    store.dispatch({
      type: 'SET_TOKEN',
      token: resp,
    })
  }

  set_channel(channel)
  {
    store.dispatch({
      type: 'UPDATE_CHANNEL',
      channel: channel,
    })
  }

  findMatch(user_id, game_size)
 {
   let data = {
       user_id: user_id,
       game_size: parseInt(game_size),
       is_ranked: true
   }
   $.ajax("/api/v1/newgame/", {
     method: "post",
     dataType: "json",
     contentType: "application/json; charset=UTF-8",
     data: JSON.stringify(data),
     success: (resp) => {
         console.log(resp.channel_no);

          let gameData = {
            channel_no: resp.channel_no,
            game_size: data.game_size,
            is_ranked: data.is_ranked
          }

          store.dispatch({
              type: 'SET_GAME_TOKEN',
              game_token: gameData,
            })
       },
     error:(resp) => {
       alert("Please select a gameplay!")
     }
   });
 }

 findunrankedMatch(user_id, game_size)
{
  let data = {
      user_id: user_id,
      game_size: parseInt(game_size),
      is_ranked: false
  }
  $.ajax("/api/v1/unrankedgame/", {
    method: "post",
    dataType: "json",
    contentType: "application/json; charset=UTF-8",
    data: JSON.stringify(data),
    success: (resp) => {
        console.log(resp.channel_no);

         let gameData = {
           channel_no: resp.channel_no,
           game_size: data.game_size,
           is_ranked: data.is_ranked
         }

         store.dispatch({
             type: 'SET_GAME_TOKEN',
             game_token: gameData,
           })
      },
    error:(resp) => {
      alert("Please select a gameplay!")
    }
  });
}

}

export default new TheServer();
// Attribution - http://www.ccs.neu.edu/home/ntuck/courses/2018/01/cs4550/notes/20-redux/notes.html
