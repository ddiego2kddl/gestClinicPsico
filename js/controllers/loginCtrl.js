'use strict';

app.controller('loginCtrl', function($scope,loginService){
	console.log("loginctrl");
	$scope.login=function(user){
		loginService.login(user); // call login service
	}
});