import { createStore, combineReducers } from 'redux';
import deepFreeze from 'deep-freeze';


let empty_login = {
  name: "",
  pass: "",
};

let empty_reg = {
  email: "",
  name: "",
  password: "",
}

let empty_game = {
  team1: [],
  team2: [],
  buildings: [],
  channel_no: "",
  team_size: "",
}

function game(state = empty_game, action){
  switch(action.type){
    case 'UPDATE_GAME_STATE':
      return Object.assign({},state,action.data);
    default:
      return state;
  }
}

function register(state = empty_reg, action){
  switch(action.type){
    case 'UPDATE_REGISTER_FORM':
      return Object.assign({},state, action.data);
    case 'ADD_USER':
      return [action.task, ...state];
    default:
      return state;
  }
}

function token(state = null, action) {
  switch (action.type) {
    case 'SET_TOKEN':
      return action.token;
    case 'CLEAR_TOKEN':
      return "";
    default:
      return state;
  }
}

function gameToken(state=null, action){
  switch (action.type) {
    case 'SET_GAME_TOKEN':
      return action.game_token;
    case 'CLEAR_GAME_TOKEN':
      return null;
    default:
      return state;
  }
}

function login(state = empty_login, action) {
  switch (action.type) {
    case 'UPDATE_LOGIN_FORM':
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}

function game(state = empty_game, action)
{
  switch(action.type)
  {
    case 'UPDATE_GAME_STATE':
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}
//
// function channel(state = null, action)
// {
//   switch(action.type)
//   {
//     case 'UPDATE_CHANNEL':
//       return action.channel;
//     default:
//       return state;
//   }
// }

function root_reducer(state0, action) {
  // {posts, users, form} is ES6 shorthand for
  // {posts: posts, users: users, form: form}
  let reducer = combineReducers({game, token, login, register, gameToken});
  let state1 = reducer(state0, action);
  console.log("state", state1);
  return (state1);
};

let store = createStore(root_reducer);
export default store;
// Attribution - http://www.ccs.neu.edu/home/ntuck/courses/2018/01/cs4550/notes/20-redux/notes.html
