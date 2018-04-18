import React from 'react';
import { connect } from 'react-redux';
import { Button, Form, FormGroup, NavItem, Label, Input } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../api';
import CamMap from './map-campus';
import socket from '../socket';
import store from '../store';


let joined = false;
let channel;
let currPos;
let attacking = false;

function GamePage(props) {
  let attackPercentage = 0;

  console.log(props)
  let btn_panel = <div>
     <button className="btn btn-danger" onClick={() => attack()}>Attack!</button>
     <button className="btn btn-info" onClick={() => defend()} id="defendBtn">Defend</button>
     <Link to="/" onClick={() => leaveGame()}><button className="btn btn-default">Leave Game</button></Link></div>;

// for when ko is added to state
  // if (props.ko){
  //   btn_panel = <div><button className="btn">Revive</button></div>
  // }
  // channel = socket.channel("games:"+props.gameToken, {"user_id":props.user.user_id});

  function defend() {
    console.log("DEFENDING")
    let currLoc = {}
    navigator.geolocation.getCurrentPosition(function(pos) {
      currLoc.lat = pos.coords.latitude;
      currLoc.lng = pos.coords.longitude;

      let buildingList = props.game.buildings;
      let enemyTeam = props.game.team2;

      var locationDisList = _.filter(buildingList, function(x){
        const nearby = distanceInKmBetweenEarthCoordinates(pos.coords.latitude, pos.coords.longitude, x.lat, x.lng) < 90;
        let underAttack = false;
        if(x.underAttack) {
          //im too tired to think of shorthand for this
          let pId = x.attacker;
          for(p in enemyTeam) {
            if(enemyTeam[p]['user_id'] === pId) {
              underAttack = true;
            }
          }
        }
        return nearby && underAttack;
      });

      var locationFin;
      var buildingIndex;
      var defendable = false;
      //i'd be surprised if this were ever the case
      if (locationDisList.length > 1){
        var nearest = 1000;
        _.map(locationDisList, function(x){
          var distanceOfThisBuilding = distanceInKmBetweenEarthCoordinates(pos.coords.latitude, pos.coords.longitude, x.lat, x.lng);
          if (distanceOfThisBuilding < nearest){
            nearest = distanceOfThisBuilding;
            locationFin = x;
          }
        });
        defendable = true;
      } else if (locationDisList.length == 1){
        locationFin = locationDisList[0];
        defendable = true;
      } else {
        alert("There are no nearby buildings to defend!");
      }

      if(defendable) {
        //set building.attacker to none, attackEnds to "", underAttack to false, and userId.ko to TRUE, but first save the attacker's id
        attackerId = locationFin.attacker
        buildingIndex = buildingList.indexOf(locationFin)
        locationFin.underAttack = false;
        locationFin.attackEnds = "";
        locationFin.attacker = undefined;
        //then set the user to ko'd
        var enemyPlayer = _.filter(enemyTeam, function(x){
          return x['user_id'] == attackerId;
        })[0];
        playerIndex = enemyTeam.indexOf(enemyPlayer);
        enemyPlayer.ko = true

        buildingList[buildingIndex] = locationFin;
        enemyTeam[playerIndex] = enemyPlayer;

        let data = {};
        data["buildings"] = buildingList;
        data["team2"] = enemyTeam;
        updateGameState(data);

        //channel.push("defend", {buildings: buildingList, game: props.game})
      }
    })
  }

  function attack(){
    console.log("ATTACK")
    let currLoc = {};
    navigator.geolocation.getCurrentPosition(function(pos){
      currLoc.lat = pos.coords.latitude;
      currLoc.lng = pos.coords.longitude;

    let buildingList = props.game.buildings;

      var locationDisList = _.filter(buildingList, function(x){
        console.log(x.name)
        return distanceInKmBetweenEarthCoordinates(pos.coords.latitude, pos.coords.longitude, x.lat, x.lng) < 90;
      });

      var locationFin;
      var buildingIndex;
      var attackable = false;
      if (locationDisList.length > 1){
        var nearest = 1000;
        _.map(locationDisList, function(x){
          var distanceOfThisBuilding = distanceInKmBetweenEarthCoordinates(pos.coords.latitude, pos.coords.longitude, x.lat, x.lng);
          if (distanceOfThisBuilding < nearest){
            nearest = distanceOfThisBuilding;
            locationFin = x;
          }
        });
        attackable = true;
      } else if (locationDisList.length == 1){
        locationFin = locationDisList[0];
        attackable = true;
      } else {
        alert("You are not close enough to any building to attack it!");
      }

      if(attackable){
        var currTime = new Date();
        currTime.setMinutes(currTime.getMinutes()+1);

        buildingIndex = buildingList.indexOf(locationFin)
        locationFin.underAttack = true;
        locationFin.attackEnds = currTime;
        locationFin.attacker = props.user.user_id;
        buildingList[buildingIndex] = locationFin;

        let data = {};
        data["buildings"] = buildingList;
        updateGameState(data);

        activateAttackTimer(currTime);

        channel.push("attack", {buildings: buildingList, game: props.game})


        console.log(buildingIndex)
        console.log(locationFin)
        attacking = true;

      }
    })
  }
  var attackTimer = 0;
  var atkInterval;

  function activateAttackTimer(d){
      var t = d.getTime() - (new Date()).getTime();
      console.log("TIMER")
      console.log(t)
      var tPercent = t/100;
      console.log(tPercent)
      var tSec = tPercent/100;
      attackTimer = 0;
      atkInterval = setInterval(timerHelper, tPercent);
      // attackTimer = 0;
      // attackPercentage = 0;
      // attacking = false;
  }

  function timerHelper() {
      attackTimer = attackTimer + 1;
      if (attackTimer == 100){
        console.log("CLEAR")
        clearInterval(atkInterval);
        attackTimer = 0;
      } else {
        $("#attackBar").css("width",attackTimer+"%");
        $("#attackBar").html(attackTimer+"%");
        // console.log(attackPercentage)
      }
  }


  function updateGameState(data){
    props.dispatch({
      type: 'UPDATE_GAME_STATE',
      data: data,
    })
  }

  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
    var earthRadiusMeters = earthRadiusKm * 1000;

    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthRadiusMeters * c;
  }

  function joinChannel(){
    localStorage.setItem("channelNo", props.gameToken.channel_no); //caching the channel no for reconnection.
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp)})
      .receive("error", resp => { console.log("Unable to join", resp) });
      joined=true;
  }

  function leaveGame()
  {
    channel.push("deleteUser", {user_id: props.user.user_id, game_size: props.gameToken.game_size, game: props.game})
  }

  let game = <div></div>;
  if (props.gameToken) {

    // let attackProgress = <div></div>;
    // if(attacking){

    // let atkPC = Math.round(parseInt($("#attackBar").css("width").substring(0, $("#attackBar").css("width").length - 2)));
    console.log("ATK PC")
    console.log(attackPercentage)
      let attackProgress = <div class="progress attack-bar">
      <div id="attackBar" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
        {attackPercentage}%
      </div>
    </div>;
    // }


    if(!joined){
      channel = socket.channel("games:"+props.gameToken.channel_no,
      {user_id:props.user.user_id, game_size: props.gameToken.game_size})
      joinChannel(props);
    }

    function gotView(view){
      props.dispatch({
        type: 'UPDATE_GAME_STATE',
        data: view.game,
      })
    }

    channel.on("state_update", game => {
        channel.push("update_state", game)
          .receive("ok", gotView.bind(this))
      });

      console.log(props)

    return <div>
      <div className="googleMaps">
        <CamMap buildings={props.game.buildings}/>
      </div>
      <div className="attackProgressBar">
        {attackProgress}
      </div>
      <div className="buttonPanel">
        { btn_panel }
      </div>
      <div className="chatPanel">
        <div id="chatPage"></div>
        <div className="chatInput">
          <form className="form-inline">
            <div className="form-group" id="chatBox">
              <input type="text" className="form-control" id="chatText" placeholder="Your message"></input>
              <button id="chatSend" className="btn btn-success btn-sm">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>;

  } else {

    return <div>Loading Game</div>;

  }

  // return game;

}

function state2props(state) {
  console.log("rerender", state);
  return { game: state.game };
}

// Export the result of a curried function call.
export default connect(state2props)(GamePage);
// Attribution - http://www.ccs.neu.edu/home/ntuck/courses/2018/01/cs4550/notes/20-redux/notes.html
