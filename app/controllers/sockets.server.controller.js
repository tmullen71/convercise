'use strict';

var async = require('async');
var uuid = require('uuid');
var fs = require('fs');

var activeUsers = require('../../lib/active-users');
var exchanges = require('../../app/controllers/exchanges.server.controller');


module.exports = function(io, socket, server) {

  activeUsers.setSocketId(socket.request.user, socket.id);
  console.log(socket.id);

  socket.on('disconnect', function() {
    //console.log('Socket on disconnect!');
    activeUsers.remove_inviter(socket.id, function(empty_langclass) {
      if (empty_langclass) {
        console.log('No more inviters for' + empty_langclass);
      }
    });
  });

  socket.on('findPtnr', function(waitModal) {
    activeUsers.setBusy(socket.request.user, true);

    //server sets up partners request and creates an exchange
    var langs = socket.request.user.l2 + '_' + socket.request.user.l1;
    var active = activeUsers.get();

    //  if(active[langs] && active[langs].ord[0]){
    if (activeUsers.someNonBusy(langs)) {
      //Create an exchange and send out invitation to all possible invitees
      exchanges.createExchange(server, socket, langs);
    } else {
      activeUsers.remove_inviter(socket.id);
      activeUsers.setBusy(socket.request.user, false);
      socket.emit('noPtnr');
    }
  });

  socket.on('cancelInvitation', function() {
    activeUsers.remove_inviter(socket.id, function(disInvitees) {
      if (disInvitees.length > 0) {
        for (var d = 0; d < disInvitees.length; d++) {
          socket.broadcast.to(disInvitees[d]).emit('/#disinvite', true);
        }
      }
    });
    activeUsers.setBusy(socket.request.user, false);
  });

  socket.on('/#acceptInvite', function() {
    var revlangs = socket.request.user.l1 + '_' + socket.request.user.l2;
    var inviter = activeUsers.get_inviter(revlangs, function(disInvitees) {
      if (disInvitees.length > 0) {
        //console.log('Canceling invite No more inviters for ');
        for (var d = 0; d < disInvitees.length; d++) {
          //console.log(disInvitees[d]);
          socket.broadcast.to(disInvitees[d]).emit('/#disinvite', true);
        }
      }
    });
    activeUsers.removeInvitee(revlangs, socket.request.user.id, function(remainingInviteesCt) {
      //activeUsers.incInvitees(revlangs, -1, function(remainingInviteesCt){
      console.log(remainingInviteesCt);
      if (remainingInviteesCt < 1) {
        activeUsers.getInvitersForLanglcass(revlangs, function(inviters) {
          for (var inv = 0; inv < inviters.length; inv++) {
            socket.broadcast.to(inviters[inv].socketId).emit('noPtnr');
          }
        });
      }
    });
    console.log('Line 72 setting to busy ' + socket.request.user.id);
    activeUsers.setBusy(socket.request.user, true);
    exchanges.acceptInvite(socket, inviter);
  });

  socket.on('/#decrementInvitees', function() {
    var revlangs = socket.request.user.l1 + '_' + socket.request.user.l2;
    //activeUsers.incInvitees(revlangs, -1);
    activeUsers.removeInvitee(revlangs, socket.request.user.id);
  });

  socket.on('/#rejectInvite', function() {
    var revlangs = socket.request.user.l1 + '_' + socket.request.user.l2;
    //return all non-busy online users of revlangs if it's zero
    //send noPtnr message to all inviters
    activeUsers.removeInvitee(revlangs, socket.request.user.id, function(remainingInviteesCt) {
      //activeUsers.incInvitees(revlangs, -1, function(remainingInviteesCt){
      console.log(remainingInviteesCt);
      if (remainingInviteesCt < 1) {
        activeUsers.getInvitersForLanglcass(revlangs, function(inviters) {
          for (var inv = 0; inv < inviters.length; inv++) {
            socket.broadcast.to(inviters[inv].socketId).emit('noPtnr');
          }
        });
      }
    });
    activeUsers.setBusy(socket.request.user, false);
  });

  socket.on('setReadyOrGo', function(exchangeid) {
    exchanges.setReadyOrGo(exchangeid, socket);
  });

  socket.on('/#setNotBusyAndRemoveInviter', function() {
    activeUsers.setBusy(socket.request.user, false);
    activeUsers.remove_inviter(socket.id);
  });

  socket.on('/#exchParams', function(ptnrSocket, exch_task_inds, exch_langs) {
    exchanges.exchParams(ptnrSocket, exch_task_inds, exch_langs, socket);
  });

  socket.on('answerChange', function(answer, partnersocket) {
    socket.broadcast.to(partnersocket).emit('answerChange', answer);
  });

  socket.on('goToDebrief', function(partnersocket) {
    socket.broadcast.to(partnersocket).emit('goToDebrief');
  });

  socket.on('acceptAnswer', function(partnersocket) {
    socket.broadcast.to(partnersocket).emit('acceptAnswer');
  });

  socket.on('wrongAnswer', function(partnersocket) {
    socket.broadcast.to(partnersocket).emit('wrongAnswer');
  });

  socket.on('finishTask', function(partnersocket) {
    socket.broadcast.to(partnersocket).emit('finishTask');
  });

  socket.on('audioData', function(data) {
    var fileName = uuid.v4() + '.wav';
    var dataURL = data.dataURL;
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './public/uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileBuffer;

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFile(filePath, fileBuffer, function(err) {
      if (err) throw err;

      console.log('Saved file ' + fileName + '. FilePath: ' + filePath);
      socket.emit('recordingSaved', '/uploads/' + filename);
    });
  });
};
