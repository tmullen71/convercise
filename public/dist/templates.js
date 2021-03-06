angular.module('mean').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/assets/modules/core/views/header.client.view.html',
    "<div class=\"container\" data-ng-controller=\"HeaderController\"><div class=\"navbar-header\"><button class=\"navbar-toggle\" type=\"button\" data-ng-click=\"toggleCollapsibleMenu()\"><span class=\"sr-only\">Toggle navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button> <a href=\"/#!/\" class=\"navbar-brand\">Convercise</a></div><nav class=\"collapse navbar-collapse\" collapse=\"!isCollapsed\" role=\"navigation\"><ul class=\"nav navbar-nav\" data-ng-if=\"menu.shouldRender(authentication.user);\"><li data-ng-repeat=\"item in menu.items | orderBy: 'position'\" data-ng-if=\"item.shouldRender(authentication.user);\" ng-switch=\"item.menuItemType\" ui-route=\"{{item.uiRoute}}\" class=\"{{item.menuItemClass}}\" ng-class=\"{active: ($uiRoute)}\" dropdown=\"item.menuItemType === 'dropdown'\"><a ng-switch-when=\"dropdown\" class=\"dropdown-toggle\"><span data-ng-bind=\"item.title\"></span> <b class=\"caret\"></b></a><ul ng-switch-when=\"dropdown\" class=\"dropdown-menu\"><li data-ng-repeat=\"subitem in item.items | orderBy: 'position'\" data-ng-if=\"subitem.shouldRender(authentication.user);\" ui-route=\"{{subitem.uiRoute}}\" ng-class=\"{active: $uiRoute}\"><a href=\"/#!/{{subitem.link}}\" data-ng-bind=\"subitem.title\"></a></li></ul><a ng-switch-default href=\"/#!/{{item.link}}\" data-ng-bind=\"item.title\"></a></li></ul><ul class=\"nav navbar-nav navbar-right\" data-ng-hide=\"authentication.user\"><li ui-route=\"/signup\" ng-class=\"{active: $uiRoute}\"><a href=\"/#!/signup\">Sign Up</a></li><li class=\"divider-vertical\"></li><li ui-route=\"/signin\" ng-class=\"{active: $uiRoute}\"><a href=\"/#!/signin\">Sign In</a></li></ul><ul class=\"nav navbar-nav navbar-right\" data-ng-show=\"authentication.user\"><li class=\"dropdown\" dropdown><a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" dropdown-toggle><span data-ng-bind=\"authentication.user.displayName\"></span> <b class=\"caret\"></b></a><ul class=\"dropdown-menu\"><li><a href=\"/#!/settings/profile\">Edit Profile</a></li><li><a href=\"/#!/settings/accounts\">Manage Social Accounts</a></li><li data-ng-show=\"authentication.user.provider === 'local'\"><a href=\"/#!/settings/password\">Change Password</a></li><li class=\"divider\"></li><li><a href=\"/auth/signout\">Signout</a></li></ul></li></ul></nav></div>"
  );


  $templateCache.put('/assets/modules/core/views/home.client.view.html',
    "<section data-ng-controller=\"HomeController\"><div class=\"jumbotron text-center\"><div data-ng-hide=\"authentication.user\" class=\"row\"><div class=\"col-md-6 col-md-offset-3 col-sm-6 col-sm-offset-3 col-xs-12\"><img alt=\"Convercise\" src=\"modules/core/img/brand/yinyang60.png\"></div></div><br><div data-ng-hide=\"authentication.user\" class=\"row\"><p class=\"lead\">Get started!</p></div><div id=\"topPageBtns\" data-ng-show=\"authentication.user\"><div class=\"row btnsRow\"><p class=\"topPageBtnsContainer\"><a class=\"top-btn btn btn-primary btn-lg\" ng-click=\"startExch()\" target=\"_blank\">Start exchange</a> <a class=\"top-btn btn btn-primary btn-lg\" href=\"#/schedule\" target=\"_blank\">Set schedule</a></p></div></div><div class=\"listBody\"><h4>Completed Exchanges</h4><div stretchdown class=\"exchangesContainer\"><div><accordion close-others=\"true\"><accordion-group ng-repeat=\"exchange in exchanges\"><accordion-heading><div class=\"accHeader\"><span class=\"glyphicon glyphicon-star\"></span> {{exchange.created | date:'medium'}}<div ng-if=\"true\" class=\"reptNotice\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span></div></div></accordion-heading><sync-player class=\"audioPlayer\"><div class=\"playerIcons\"><button class=\"glyphicon glyphicon-play\" ng-click=\"play()\" ng-class=\"{'active': !playing}\"></button> <button class=\"glyphicon glyphicon-pause\" ng-click=\"pause()\" ng-class=\"{'active': playing}\"></button> <button class=\"glyphicon glyphicon-stop\" ng-click=\"stop()\" ng-class=\"{'active': playing}\"></button></div><audio ng-src=\"{{exchange.recordings.invitee}}\"></audio><audio ng-src=\"{{exchange.recordings.inviter}}\"></audio></sync-player><div class=\"panel panel-default\" ng-repeat=\"dt in exchange.doneTasks\"><div class=\"panel-body taskPanel\"><table><col width=\"100\"><tr><td class=\"taskDisplay\"><div class=\"taskImg\"><img ng-src=\"{{taskpath}}/{{dt.task.ind}}/thumb.jpg\" height=\"100\" width=\"100\"></div></td><td><div class=\"taskInfo\"><div>Task carried out in {{dt.language|langs}}</div><div>Partner: {{authentication.user.displayName == dt.learner.displayName | iif: dt.nativeSpeaker.displayName : dt.learner.displayName}}</div><div>Duration: {{dt.duration| dur}}</div><div>Your answer was:</div><div class=\"answerArea\">{{dt.answer}}</div></div></td></tr></table></div></div><accordion class=\"reportArea\" close-others=\"false\"><accordion-group><accordion-heading>Report</accordion-heading>A report.</accordion-group></accordion></accordion-group></accordion></div></div></div></div></section>"
  );


  $templateCache.put('/assets/modules/core/views/t_or_s.client.view.html',
    "<div data-ng-controller=\"HeaderController\"><div data-ng-if=\"authentication.user.roles[0] == 'user'\" data-ng-include=\"'/modules/core/views/home.client.view.html'\"></div><div data-ng-if=\"authentication.user.roles[0] == 'teacher'\" data-ng-include=\"'/modules/core/views/teacher.client.view.html'\"></div>"
  );


  $templateCache.put('/assets/modules/core/views/teacher.client.view.html',
    "<section data-ng-controller=\"ClassroomController\"><h4>Your classroom</h4><accordion class=\"requests\" ng-if=\"classroom.requests.length > 0\"><accordion-group><accordion-heading><button class=\"btn-acceptReq btn btn-success btn-xs\">Accept all</button><div class=\"reqHead\"><span>New class join requests</span><span class=\"badge\">{{classroom.requests.length}}</span></div></accordion-heading><table class=\"table-reqs table table-striped table-bordered\"><tr ng-repeat=\"req in classroom.requests\"><td>{{req.displayName}}</td><td>{{req.email}}</td><td><div class=\"btn-group btn-group-xs\"><button class=\"btn btn-success\">Accept</button> <button class=\"btn btn-danger\">Reject</button></div></td></tr></table></accordion-group></accordion><div class=\"classroom\"><div class=\"classBtns\"><div class=\"addStudent\"><input type=\"email\" class=\"form-control addStudentEmail\" placeholder=\"Enter email of student to add\"> <button class=\"btn btn-primary btn-small\">Add student</button></div><button class=\"btn btn-primary btn-small\">Email student(s)</button> <button class=\"btn btn-primary btn-small\">Remove student(s)</button> <button class=\"btn btn-primary btn-small\">Export to file</button></div><table class=\"table-classroom table table-striped table-bordered\"><tr><td></td><td></td><td>Name</td><td>Email</td><td>Section</td><td>Completed</td><td>Time Spent</td><td>L1:L2</td><td>Alerts</td></tr><tr><tbody ng-repeat=\"section in classroom.sections\"><tr ng-repeat=\"student in section.members\"><td ng-if=\"$index == 0\" rowspan=\"{{section.members.length}}\">{{section.name}}</td><td><input type=\"checkbox\"></td><td>{{student.displayName}}</td><td>{{student.email}}</td><td><div class=\"btn-group\" dropdown><button type=\"button\" class=\"btn btn-primary btn-xs dropdown-toggle\" dropdown-toggle>A <span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"><li>B</li><li>C</li></ul></div></td><td>{{student.completed}}5 exchanges</td><td>{{student.timespent}}37 mins</td><td>{{student.l1_l2}}6:4</td><td>{{student.alerts}}<span class=\"label label-success\">No</span></td></tr></tbody></tr></table></div></section>"
  );


  $templateCache.put('/assets/modules/doexch/views/doexch.client.view.html',
    "<section data-ng-controller=\"DoExchController\"><div data-ng-show=\"doneTasks[ct_task].state < 5 && doneTasks[ct_task].task.type == 'ftd-img'\" data-ng-include=\"'/modules/doexch/views/partials/ftd-img.html'\"></div><div data-ng-show=\"doneTasks[ct_task].state < 5 && doneTasks[ct_task].task.type == 'loc-inst'\" data-ng-include=\"'/modules/doexch/views/partials/loc-inst.html'\"></div><div data-ng-show=\"doneTasks[ct_task].state === 5\" data-ng-include=\"'/modules/doexch/views/partials/debrief.html'\"></div></section>"
  );


  $templateCache.put('/assets/modules/doexch/views/partials/debrief.html',
    "<style>slider {\r" +
    "\n" +
    "  display: inline-block;\r" +
    "\n" +
    "  position: relative;\r" +
    "\n" +
    "  height: 7px;\r" +
    "\n" +
    "  width: 100%;\r" +
    "\n" +
    "  margin: 50px 5px 5px 5px;\r" +
    "\n" +
    "  vertical-align: middle;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span {\r" +
    "\n" +
    "  white-space: normal!important;\r" +
    "\n" +
    "  width: 200px;\r" +
    "\n" +
    "  text-align: center;\r" +
    "\n" +
    "  position: absolute;\r" +
    "\n" +
    "  display: inline-block;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.base {\r" +
    "\n" +
    "  width: 100%;\r" +
    "\n" +
    "  height: 100%;\r" +
    "\n" +
    "  padding: 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.bar {\r" +
    "\n" +
    "  width: 100%;\r" +
    "\n" +
    "  height: 100%;\r" +
    "\n" +
    "  z-index: 0;\r" +
    "\n" +
    "  -webkit-border-radius: 1em/1em;\r" +
    "\n" +
    "  border-radius: 1em/1em;\r" +
    "\n" +
    "  background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #c0c0c0), color-stop(1, #8d8d8d));\r" +
    "\n" +
    "  background: -webkit-linear-gradient(top, #c0c0c0 0, #8d8d8d 100%);\r" +
    "\n" +
    "  background: -moz-linear-gradient(top, #c0c0c0 0, #8d8d8d 100%);\r" +
    "\n" +
    "  background: -o-linear-gradient(top, #c0c0c0 0, #8d8d8d 100%);\r" +
    "\n" +
    "  background: -ms-linear-gradient(top, #c0c0c0 0, #8d8d8d 100%);\r" +
    "\n" +
    "  background: linear-gradient(top, #c0c0c0 0, #8d8d8d 100%);\r" +
    "\n" +
    "  -webkit-box-shadow: inset 2px 2px 5px;\r" +
    "\n" +
    "  box-shadow: inset 2px 2px 5px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.bar.selection {\r" +
    "\n" +
    "  width: 0%;\r" +
    "\n" +
    "  z-index: 1;\r" +
    "\n" +
    "  background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #13b6ff), color-stop(1, #00a8f3));\r" +
    "\n" +
    "  background: -webkit-linear-gradient(top, #13b6ff 0, #00a8f3 100%);\r" +
    "\n" +
    "  background: -moz-linear-gradient(top, #13b6ff 0, #00a8f3 100%);\r" +
    "\n" +
    "  background: -o-linear-gradient(top, #13b6ff 0, #00a8f3 100%);\r" +
    "\n" +
    "  background: -ms-linear-gradient(top, #13b6ff 0, #00a8f3 100%);\r" +
    "\n" +
    "  background: linear-gradient(top, #13b6ff 0, #00a8f3 100%);\r" +
    "\n" +
    "  -webkit-box-shadow: none;\r" +
    "\n" +
    "  box-shadow: none;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.pointer {\r" +
    "\n" +
    "  cursor: pointer;\r" +
    "\n" +
    "  width: 30px;\r" +
    "\n" +
    "  height: 30px;\r" +
    "\n" +
    "  top: -12px;\r" +
    "\n" +
    "  background-color: #fff;\r" +
    "\n" +
    "  border: 1px solid #000;\r" +
    "\n" +
    "  z-index: 2;\r" +
    "\n" +
    "  -webkit-border-radius: 1em/1em;\r" +
    "\n" +
    "  border-radius: 1em/1em;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.pointer:after {\r" +
    "\n" +
    "  content: '';\r" +
    "\n" +
    "  background-color: #808080;\r" +
    "\n" +
    "  width: 16px;\r" +
    "\n" +
    "  height: 16px;\r" +
    "\n" +
    "  position: absolute;\r" +
    "\n" +
    "  top: 6px;\r" +
    "\n" +
    "  left: 5.5px;\r" +
    "\n" +
    "  -webkit-border-radius: 1em/1em;\r" +
    "\n" +
    "  border-radius: 1em/1em;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.pointer:hover:after {\r" +
    "\n" +
    "  background-color: #000;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.pointer.active:after {\r" +
    "\n" +
    "  background-color: #f00;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.bubble {\r" +
    "\n" +
    "  cursor: default;\r" +
    "\n" +
    "  top: -45px;\r" +
    "\n" +
    "  padding: 1px 3px 1px 3px;\r" +
    "\n" +
    "  font-size: 1em;\r" +
    "\n" +
    "  font-family: sans-serif;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.bubble.selection {\r" +
    "\n" +
    "  top: 15px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "slider span.bubble.limit {\r" +
    "\n" +
    "  color: #808080;\r" +
    "\n" +
    "}</style><div class=\"panel panel-default\" ng-cloak><div class=\"panel-heading\"><h3 class=\"panel-title\">Please answer these questions and click 'Submit' to complete the exchange</h3></div><div class=\"panel-body\"><div ng-show=\"reportRequired\" ng-class=\"{'reportUndonePanel': report.length < reportMinChars}\" class=\"panel panel-default debriefItemPanel\"><div class=\"panel-body\"><div class=\"reportLabel\"><label for=\"report\">Your class requires a report of at least {{reportMinChars}} characters:</label><button ng-show=\"report.length < reportMinChars\" type=\"button\" class=\"report-do-later-btn btn btn-danger btn-xs\" ng-click=\"reportRequired = false\">Do this later</button></div><textarea ng-model=\"report\" class=\"debriefTextArea form-control\" rows=\"10\" id=\"report\" resize=\"none\"></textarea></div></div><div class=\"panel panel-default debriefItemPanel\"><div class=\"panel-body\"><label for=\"ratePartnerSlider\">Please rate your partner's participation during this exchange.</label><div id=\"ratePartnerSlider\"><slider floor=\"{{ratePartnerSlider.floor}}\" ceiling=\"{{ratePartnerSlider.ceil}}\" step=\"{{ratePartnerSlider.step}}\" translate-fn=\"ratePartnerTrans\" ng-model=\"ratePartner\"></slider></div></div></div><div class=\"panel panel-default debriefItemPanel\"><div class=\"panel-body\"><label for=\"rateADiffSlider\">Please rate the difficulty of the first puzzle.</label><div id=\"rateADiffSlider\"><slider floor=\"{{rateADiffSlider.floor}}\" ceiling=\"{{rateADiffSlider.ceil}}\" step=\"{{rateADiffSlider.step}}\" translate-fn=\"rateDiffTrans\" ng-model=\"rateADiff\"></slider></div></div></div><div class=\"panel panel-default debriefItemPanel\"><div class=\"panel-body\"><label for=\"rateBDiffSlider\">Please rate the difficulty of the second puzzle.</label><div id=\"rateBDiffSlider\"><slider floor=\"{{rateBDiffSlider.floor}}\" ceiling=\"{{rateBDiffSlider.ceil}}\" step=\"{{rateBDiffSlider.step}}\" translate-fn=\"rateDiffTrans\" ng-model=\"rateBDiff\"></slider></div></div></div><div class=\"panel panel-default debriefItemPanel\"><div class=\"panel-body\"><label for=\"comment\">Any further thoughts or comments:</label><textarea class=\"debriefTextArea form-control\" rows=\"10\" id=\"comment\" resize=\"none\"></textarea></div></div><a class=\"btn btn-primary btn-lg\" ng-click=\"submitDebrief()\" ng-disabled=\"!streamSaved\" target=\"_blank\"><span ng-hide=\"streamSaved\">Waiting for audio upload ...</span> <span ng-show=\"streamSaved\">Submit</span></a></div><div></div></div>"
  );


  $templateCache.put('/assets/modules/doexch/views/partials/ftd-img.html',
    "<style>div#v-streams {display: inline-block}\r" +
    "\n" +
    "  img.puzzle_img {float:left; width: 400px}\r" +
    "\n" +
    "  div.twentyTwentyContainer{float:left; width: 400px}\r" +
    "\n" +
    "  div.vstream {width: 150px; height: 100px; border: 2px solid}</style><div ng-hide=\"$root.streamStarted\" class=\"panel panel-default\" ng-cloak>You need to permit Convercise to access your camera and mic.</div><div ng-show=\"$root.streamStarted\" class=\"panel panel-default\" ng-cloak><div class=\"panel-heading\"><h2 class=\"panel-title\">Do this puzzle in {{doneTasks[ct_task].langfull}}</h2></div><div class=\"panel-body\"><div class=\"top-part\"><div ng-if=\"doneTasks[ct_task].state == 1\" class=\"img_div\"><img class=\"puzzle_img\" src=\"{{taskpath}}/{{doneTasks[ct_task].ind}}/{{doneTasks[ct_task].img}}\"></div><div class=\"twentyTwentyContainer\" data-ng-show=\"doneTasks[ct_task].state > 1\"><div twenty-twenty=\"true\" id=\"compareImgs\" ng-if=\"doneTasks[ct_task].state > 1\" class=\"img_div\"><img class=\"puzzle_img\" src=\"{{taskpath}}/{{doneTasks[ct_task].ind}}/{{doneTasks[ct_task].task.img1}}\"> <img class=\"puzzle_img\" src=\"{{taskpath}}/{{doneTasks[ct_task].ind}}/{{doneTasks[ct_task].task.img2}}\"></div></div><video-chat killpeer=\"killPeer\"></video-chat></div><div ng-if=\"doneTasks[ct_task].state == 1\" class=\"instructions\">Talk to your partner to find the difference between the pictures you see.</div><div ng-if=\"doneTasks[ct_task].state == 2\" class=\"instructions\">Was your answer correct?</div><div ng-if=\"doneTasks[ct_task].state == 3\" class=\"instructions\">Enter the correct answer.</div><div class=\"bottom-part\"><div class=\"bottom-div\"><div class=\"answerText\" id=\"text\"><textarea ng-if=\"doneTasks[ct_task].state == 1 || doneTasks[ct_task].state == 3\" data-ng-hide=\"doneTasks[ct_task].native\" id=\"textinput\" class=\"answerTextInput\" data-ng-model=\"doneTasks[ct_task].answer\" placeholder=\"Enter Your Answer Here\"></textarea><span ng-if=\"doneTasks[ct_task].state == 2\" data-ng-hide=\"doneTasks[ct_task].native\">{{doneTasks[ct_task].answer}}</span> <span data-ng-show=\"doneTasks[ct_task].native\">{{doneTasks[ct_task].answer}}</span></div><a ng-if=\"doneTasks[ct_task].state == 1\" data-ng-show=\"doneTasks[ct_task].native\" class=\"accceptAnswBtn btn btn-primary btn-lg\" ng-click=\"acceptAnswer()\" target=\"_blank\" ng-disabled=\"doneTasks[ct_task].answer.length < 4\">Accept your partner's answer</a><div ng-if=\"doneTasks[ct_task].state == 1\" data-ng-hide=\"doneTasks[ct_task].native\" class=\"learnerInst\">With your partner's help, compose an answer and write it in the field to the left.</div><div ng-if=\"doneTasks[ct_task].state == 2\" class=\"accceptAnswBtnsDiv\"><a class=\"yesOrNoBtn btn btn-primary btn-lg\" ng-click=\"rightAnswer()\" target=\"_blank\">Yes</a> <a class=\"yesOrNoBtn btn btn-warning btn-lg\" ng-click=\"wrongAnswer()\" target=\"_blank\">No</a></div><a ng-if=\"doneTasks[ct_task].state == 3\" data-ng-show=\"doneTasks[ct_task].native\" class=\"accceptAnswBtn btn btn-primary btn-lg\" ng-click=\"acceptFinalAnswer()\" target=\"_blank\">Accept the final answer</a></div></div></div></div>"
  );


  $templateCache.put('/assets/modules/doexch/views/partials/loc-inst.html',
    "<style>div#v-streams {display: inline-block}\r" +
    "\n" +
    "img.puzzle_img {float:left; width: 400px}\r" +
    "\n" +
    "div.twentyTwentyContainer{float:left; width: 400px}\r" +
    "\n" +
    "div.vstream {width: 150px; height: 100px; border: 2px solid}</style><div class=\"panel panel-default\" ng-cloak><div class=\"panel-heading\"><h3 class=\"panel-title\">Do this puzzle in {{tasks[ct_task].langs}}</h3></div><div class=\"panel-body\"><ng-i f=\"tasks[ct_task].state == 1\">{{taskpath}}/{{tasks[ct_task].ind}}/{{tasks[ct_task].sktch}}<canvas loc-inst-processing=\"sketch\" ng-click=\"move($sketch)\"></canvas><div><div><div></div></div></div></ng-i></div></div>"
  );


  $templateCache.put('/assets/modules/users/views/authentication/signin.client.view.html',
    "<section class=\"row\" data-ng-controller=\"AuthenticationController\"><h3 class=\"col-md-12 text-center\">Sign in using your social accounts</h3><div class=\"col-md-12 text-center\"><a href=\"/auth/facebook\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/facebook.png\"></a> <a href=\"/auth/twitter\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/twitter.png\"></a> <a href=\"/auth/google\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/google.png\"></a> <a href=\"/auth/linkedin\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/linkedin.png\"></a> <a href=\"/auth/github\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/github.png\"></a></div><h3 class=\"col-md-12 text-center\">Or with your account</h3><div class=\"col-xs-offset-2 col-xs-8 col-md-offset-5 col-md-2\"><form data-ng-submit=\"signin()\" class=\"signin form-horizontal\" autocomplete=\"off\"><fieldset><div class=\"form-group\"><label for=\"username\">Username</label><input type=\"text\" id=\"username\" name=\"username\" class=\"form-control\" data-ng-model=\"credentials.username\" placeholder=\"Username\"></div><div class=\"form-group\"><label for=\"password\">Password</label><input type=\"password\" id=\"password\" name=\"password\" class=\"form-control\" data-ng-model=\"credentials.password\" placeholder=\"Password\"></div><div class=\"text-center form-group\"><button type=\"submit\" class=\"btn btn-primary\">Sign in</button>&nbsp; or&nbsp; <a href=\"/#!/signup\">Sign up</a></div><div class=\"forgot-password\"><a href=\"/#!/password/forgot\">Forgot your password?</a></div><div data-ng-show=\"error\" class=\"text-center text-danger\"><strong data-ng-bind=\"error\"></strong></div></fieldset></form></div></section>"
  );


  $templateCache.put('/assets/modules/users/views/authentication/signup.client.view.html',
    "<section class=\"row\" data-ng-controller=\"AuthenticationController\"><h3 class=\"col-md-12 text-center\">Sign up now!</h3><div class=\"col-xs-offset-2 col-xs-8 col-md-offset-5 col-md-2\"><form name=\"userForm\" data-ng-submit=\"signup()\" class=\"signin form-horizontal\" novalidate autocomplete=\"off\"><fieldset><div class=\"form-group\"><label for=\"firstName\">First Name</label><input type=\"text\" required id=\"firstName\" name=\"firstName\" class=\"form-control\" data-ng-model=\"credentials.firstName\" placeholder=\"First Name\"></div><div class=\"form-group\"><label for=\"lastName\">Last Name</label><input type=\"text\" id=\"lastName\" name=\"lastName\" class=\"form-control\" data-ng-model=\"credentials.lastName\" placeholder=\"Last Name\"></div><div class=\"form-group\"><label for=\"email\">Email</label><input type=\"email\" id=\"email\" name=\"email\" class=\"form-control\" data-ng-model=\"credentials.email\" placeholder=\"Email\"></div><div class=\"form-group\"><label for=\"username\">Username</label><input type=\"text\" id=\"username\" name=\"username\" class=\"form-control\" data-ng-model=\"credentials.username\" placeholder=\"Username\"></div><div class=\"form-group\"><label for=\"l1\">First language</label><select class=\"form-control\" data-ng-model=\"credentials.l1\" ng-options=\"lang.short as lang.name for lang in langs\"></select></div><div class=\"form-group\"><label for=\"l2\">Learning language</label><select class=\"form-control\" data-ng-model=\"credentials.l2\" ng-options=\"lang.short as lang.name for lang in langs\"></select></div><div class=\"form-group\"><label for=\"password\">Password</label><input type=\"password\" id=\"password\" name=\"password\" class=\"form-control\" data-ng-model=\"credentials.password\" placeholder=\"Password\"></div><div class=\"text-center form-group\"><button type=\"submit\" class=\"btn btn-large btn-primary\">Sign up</button>&nbsp; or&nbsp; <a href=\"/#!/signin\" class=\"show-signup\">Sign in</a></div><div data-ng-show=\"error\" class=\"text-center text-danger\"><strong data-ng-bind=\"error\"></strong></div></fieldset></form></div></section>"
  );


  $templateCache.put('/assets/modules/users/views/password/forgot-password.client.view.html',
    "<section class=\"row\" data-ng-controller=\"PasswordController\"><h3 class=\"col-md-12 text-center\">Restore your password</h3><p class=\"small text-center\">Enter your account username.</p><div class=\"col-xs-offset-2 col-xs-8 col-md-offset-5 col-md-2\"><form data-ng-submit=\"askForPasswordReset()\" class=\"signin form-horizontal\" autocomplete=\"off\"><fieldset><div class=\"form-group\"><input type=\"text\" id=\"username\" name=\"username\" class=\"form-control\" data-ng-model=\"credentials.username\" placeholder=\"Username\"></div><div class=\"text-center form-group\"><button type=\"submit\" class=\"btn btn-primary\">Submit</button></div><div data-ng-show=\"error\" class=\"text-center text-danger\"><strong>{{error}}</strong></div><div data-ng-show=\"success\" class=\"text-center text-success\"><strong>{{success}}</strong></div></fieldset></form></div></section>"
  );


  $templateCache.put('/assets/modules/users/views/password/reset-password-invalid.client.view.html',
    "<section class=\"row text-center\"><h3 class=\"col-md-12\">Password reset is invalid</h3><a href=\"/#!/password/forgot\" class=\"col-md-12\">Ask for a new password reset</a></section>"
  );


  $templateCache.put('/assets/modules/users/views/password/reset-password-success.client.view.html',
    "<section class=\"row text-center\"><h3 class=\"col-md-12\">Password successfully reset</h3><a href=\"/#!/\" class=\"col-md-12\">Continue to home page</a></section>"
  );


  $templateCache.put('/assets/modules/users/views/password/reset-password.client.view.html',
    "<section class=\"row\" data-ng-controller=\"PasswordController\"><h3 class=\"col-md-12 text-center\">Reset your password</h3><div class=\"col-xs-offset-2 col-xs-8 col-md-offset-5 col-md-2\"><form data-ng-submit=\"resetUserPassword()\" class=\"signin form-horizontal\" autocomplete=\"off\"><fieldset><div class=\"form-group\"><label for=\"newPassword\">New Password</label><input type=\"password\" id=\"newPassword\" name=\"newPassword\" class=\"form-control\" data-ng-model=\"passwordDetails.newPassword\" placeholder=\"New Password\"></div><div class=\"form-group\"><label for=\"verifyPassword\">Verify Password</label><input type=\"password\" id=\"verifyPassword\" name=\"verifyPassword\" class=\"form-control\" data-ng-model=\"passwordDetails.verifyPassword\" placeholder=\"Verify Password\"></div><div class=\"text-center form-group\"><button type=\"submit\" class=\"btn btn-large btn-primary\">Update Password</button></div><div data-ng-show=\"error\" class=\"text-center text-danger\"><strong>{{error}}</strong></div><div data-ng-show=\"success\" class=\"text-center text-success\"><strong>{{success}}</strong></div></fieldset></form></div></section>"
  );


  $templateCache.put('/assets/modules/users/views/settings/change-password.client.view.html',
    "<section class=\"row\" data-ng-controller=\"SettingsController\"><h3 class=\"col-md-12 text-center\">Change your password</h3><div class=\"col-xs-offset-2 col-xs-8 col-md-offset-5 col-md-2\"><form data-ng-submit=\"changeUserPassword()\" class=\"signin form-horizontal\" autocomplete=\"off\"><fieldset><div class=\"form-group\"><label for=\"currentPassword\">Current Password</label><input type=\"password\" id=\"currentPassword\" name=\"currentPassword\" class=\"form-control\" data-ng-model=\"passwordDetails.currentPassword\" placeholder=\"Current Password\"></div><div class=\"form-group\"><label for=\"newPassword\">New Password</label><input type=\"password\" id=\"newPassword\" name=\"newPassword\" class=\"form-control\" data-ng-model=\"passwordDetails.newPassword\" placeholder=\"New Password\"></div><div class=\"form-group\"><label for=\"verifyPassword\">Verify Password</label><input type=\"password\" id=\"verifyPassword\" name=\"verifyPassword\" class=\"form-control\" data-ng-model=\"passwordDetails.verifyPassword\" placeholder=\"Verify Password\"></div><div class=\"text-center form-group\"><button type=\"submit\" class=\"btn btn-large btn-primary\">Save Password</button></div><div data-ng-show=\"success\" class=\"text-center text-success\"><strong>Password Changed Successfully</strong></div><div data-ng-show=\"error\" class=\"text-center text-danger\"><strong data-ng-bind=\"error\"></strong></div></fieldset></form></div></section>"
  );


  $templateCache.put('/assets/modules/users/views/settings/edit-profile.client.view.html',
    "<section class=\"row\" data-ng-controller=\"SettingsController\"><h3 class=\"col-md-12 text-center\">Edit your profile</h3><div class=\"col-xs-offset-2 col-xs-8 col-md-offset-5 col-md-2\"><form name=\"userForm\" data-ng-submit=\"updateUserProfile(userForm.$valid)\" class=\"signin form-horizontal\" autocomplete=\"off\"><fieldset><div class=\"form-group\"><label for=\"firstName\">First Name</label><input type=\"text\" id=\"firstName\" name=\"firstName\" class=\"form-control\" data-ng-model=\"user.firstName\" placeholder=\"First Name\"></div><div class=\"form-group\"><label for=\"lastName\">Last Name</label><input type=\"text\" id=\"lastName\" name=\"lastName\" class=\"form-control\" data-ng-model=\"user.lastName\" placeholder=\"Last Name\"></div><div class=\"form-group\"><label for=\"email\">Email</label><input type=\"email\" id=\"email\" name=\"email\" class=\"form-control\" data-ng-model=\"user.email\" placeholder=\"Email\"></div><div class=\"form-group\"><label for=\"username\">Username</label><input type=\"text\" id=\"username\" name=\"username\" class=\"form-control\" data-ng-model=\"user.username\" placeholder=\"Username\"></div><div class=\"text-center form-group\"><button type=\"submit\" class=\"btn btn-large btn-primary\">Save Profile</button></div><div data-ng-show=\"success\" class=\"text-center text-success\"><strong>Profile Saved Successfully</strong></div><div data-ng-show=\"error\" class=\"text-center text-danger\"><strong data-ng-bind=\"error\"></strong></div></fieldset></form></div></section>"
  );


  $templateCache.put('/assets/modules/users/views/settings/social-accounts.client.view.html',
    "<section class=\"row\" data-ng-controller=\"SettingsController\"><h3 class=\"col-md-12 text-center\" data-ng-show=\"hasConnectedAdditionalSocialAccounts()\">Connected social accounts:</h3><div class=\"col-md-12 text-center\"><div data-ng-repeat=\"(providerName, providerData) in user.additionalProvidersData\" class=\"remove-account-container\"><img ng-src=\"/modules/users/img/buttons/{{providerName}}.png\"> <a class=\"btn btn-danger btn-remove-account\" data-ng-click=\"removeUserSocialAccount(providerName)\"><i class=\"glyphicon glyphicon-trash\"></i></a></div></div><h3 class=\"col-md-12 text-center\">Connect other social accounts:</h3><div class=\"col-md-12 text-center\"><a href=\"/auth/facebook\" data-ng-hide=\"isConnectedSocialAccount('facebook')\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/facebook.png\"></a> <a href=\"/auth/twitter\" data-ng-hide=\"isConnectedSocialAccount('twitter')\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/twitter.png\"></a> <a href=\"/auth/google\" data-ng-hide=\"isConnectedSocialAccount('google')\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/google.png\"></a> <a href=\"/auth/linkedin\" data-ng-hide=\"isConnectedSocialAccount('linkedin')\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/linkedin.png\"></a> <a href=\"/auth/github\" data-ng-hide=\"isConnectedSocialAccount('github')\" class=\"undecorated-link\"><img src=\"/modules/users/img/buttons/github.png\"></a></div></section>"
  );

}]);
