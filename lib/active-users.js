//this keeps track of users in an object as follows:
//active{
//  en_ja:{
//    on:{
//      userid: index of ord array
//     ord:[[userid, timestamp, socketid, busy]]}} //ordered newest first
//
//after an interval following the last request, it removes users
//from the array and object.
//
//this is only used for finding partners, so it's not a problem if
//it times out during an exchange. User will be put back on when they
//make a request to the server.
//the inviters object looks like this:
//en_ja:[
//        {
//            socketId,
//            userId,
//            exchId,
//            doneTaskIds,
//        }
//      ],
//
//invitees_hash:
//en_ja:{
//         userId:true,
//      }

'use strict';

var activeUsers = {};
var inviters = {};
var inviter_hash = {};
var inviteesCounts = {};
var invitee_hash = {};
var user_timeouts = {};

exports.add = function(user, now){
  var lang_class = user.l1 + "_" + user.l2;
  var useridstring = user._id.toString();
  var pop = false;
  if(!activeUsers[lang_class]){ activeUsers[lang_class]={ on:{} , ord:[]} }
    if(activeUsers[lang_class].on[useridstring] == null){
      activeUsers[lang_class].ord.unshift([useridstring, now, '', false]);
    }else{
      var busy = activeUsers[lang_class].ord[activeUsers[lang_class].on[useridstring]][3];
      var sock = activeUsers[lang_class].ord[activeUsers[lang_class].on[useridstring]][2]
      activeUsers[lang_class].ord.splice(activeUsers[lang_class].on[useridstring], 1);
      delete activeUsers[lang_class].on[useridstring];
      activeUsers[lang_class].ord.unshift([useridstring, now, sock, busy]);
    }

    for(var i = 0; i < activeUsers[lang_class].ord.length; i++){
      activeUsers[lang_class].on[activeUsers[lang_class].ord[i][0]] = i;
    }

    clearInterval(user_timeouts[useridstring]);
    user_timeouts[useridstring]= setInterval(function(){
      remove(lang_class, useridstring)
    }, 600000);
  };

  exports.setBusy = function(user, bool){
    if(user){
      var langclass = user.l1 + "_" + user.l2;
      if(activeUsers[langclass].ord[activeUsers[langclass].on[user.id]]){
        activeUsers[langclass].ord[activeUsers[langclass].on[user.id]][3] = bool;
        console.log('setting '+ user.id + ' to '+ bool);
      }else{
        console.log('Trying to set busy but no user ' + user.id);
      }
    }
  }

  exports.get = function(){
    return activeUsers;
  }
/*
  exports.getNonBusyForLangclass = function(langclass, callback){
    var nonbusy = [];
    if( activeUsers[langclass].ord.length === 0){
      callback(nonbusy);
    }else{
      for(var i = 0; i < activeUsers[langclass].ord.length; i++){
        if(activeUsers[langclass].ord[i][3] === false){
            nonbusy.push(activeUsers[langclass].ord[i]);
        }
      }
      callback(nonbusy);
    }
  }
*/
/*
  exports.incInvitees = function(langs, increment, callback){
    console.log(langs);
    if(!inviteesCounts[langs]){
      inviteesCounts[langs] = 0;
    }
    console.log('incrementing invitees '+ increment);
    inviteesCounts[langs] = inviteesCounts[langs] + increment;
    if(callback){
      callback(inviteesCounts[langs]);
    }
  }
*/
  exports.addInvitee = function(langs,userid){
    if(!invitee_hash[langs]){
      invitee_hash[langs] = {};
    }
    invitee_hash[langs][userid] = true;
  }
  exports.removeInvitee = function(langs,userid,cb){
    if(invitee_hash[langs] && invitee_hash[langs][userid]){
      delete invitee_hash[langs][userid];
    }
    if(cb){
      cb(Object.keys(invitee_hash[langs]).length);
    }
  }
  exports.isInvitee = function(langs, userid){
    return invitee_hash[langs] && invitee_hash[langs][userid];
  }
  /*
  exports.getInviteesCount = function(langs,cb){
    cb(Object.keys(invitee_hash[langs]).length);
  }
*/

  exports.setSocketId = function(user, socketid){
    var langclass = user.l1+'_'+user.l2;
    if(activeUsers[langclass]){
      var ind = activeUsers[langclass].on[user._id];
      activeUsers[langclass].ord[ind][2] = socketid;
    }
  }

  exports.add_inviter = function(langs, inviter, sendInvites){
    if(!inviters[langs]){
      inviters[langs] = [];
    }
    if(!inviter_hash[inviter.socketId]){
      inviters[langs].push(inviter);
      inviter_hash[inviter.socketId] = langs;
      sendInvites()
    }
//    if(inviters[langs].length == 1){
//      sendInvites();
//    }
    //else{
      //console.log('not adding inviter ')
      //console.log(inviter_hash);
    //}
  }

  exports.remove_inviter = function(socketid, callback){
//    if (inviters[inviter_hash[socketid]] && inviters[inviter_hash[socketid]].length) {
    if (inviters[inviter_hash[socketid]]){
      for (var i = 0, len = inviters[inviter_hash[socketid]].length; i < len; i++) {
        if(inviters[inviter_hash[socketid]][i]['socketId'] === socketid){
          inviters[inviter_hash[socketid]].splice(i,1);
          if(callback){
            var disInvitees = [];
            //stop invitations
            //we can just emit a cease-invitations to everybody who's not busy?
            if(inviters[inviter_hash[socketid]].length < 1){
              for(var j = 0; j < activeUsers[inviter_hash[socketid]].ord.length; j++){
                if(!activeUsers[inviter_hash[socketid]].ord[j][3]){
                  disInvitees.push(activeUsers[inviter_hash[socketid]].ord[j][2]);
                }
              }
            }
            callback(disInvitees);
            delete inviter_hash[socketid];
            break;
          }else{
            delete inviter_hash[socketid];
            break;
          }
        }
      }
    }
  }

  exports.get_inviter = function(revlangs, callback){
    var inviter = inviters[revlangs].shift();
    var disInvitees = [];
    if(inviters[revlangs].length < 1){
      for(var j = 0; j < activeUsers[revlangs].ord.length; j++){
        if(!activeUsers[revlangs].ord[j][3]){
          disInvitees.push(activeUsers[revlangs].ord[j][2]);
        }
      }
    }
    callback(disInvitees);
    return inviter;
  }

  exports.someNonBusy = function(langclass){
    console.log(activeUsers);
    if(!activeUsers[langclass]){
      console.log('noactive uers at all');
      return false;
    }else{
      for(var i = 0; i < activeUsers[langclass].ord.length; i++){
        if(!activeUsers[langclass].ord[i][3]){
          return true;
          break;
        }
      }
      return false;
    }
  }

  exports.getInvitersForLanglcass = function(langclass, callback){
    callback(inviters[langclass]);
  }

  var remove = function(langclass, useridstring){
    delete activeUsers[langclass].on[useridstring];
    removeFromArray(useridstring, activeUsers[langclass].ord)

    clearInterval(user_timeouts[useridstring]);
    console.log('removing '+useridstring+' after 600 seconds');
  };

  var removeFromArray = function(el, arr){
    for(var i in arr){
      if(arr[i][0] === el){
        arr.splice(i,1);
        break;
      }
    }
  }
