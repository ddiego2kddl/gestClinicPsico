'use strict';

app.controller('menuCtrl', ['$scope','loginService','sessionService', function($scope,loginService,sessionService){
	$scope.txt="Menu";

	$scope.rol = sessionService.get('rol');
	$scope.rolID = sessionService.get('id');

	$scope.logout=function(){
		loginService.logout();
	};

}]);