'use strict';

app.service('opcionesPersonalService', function($http,$q){

    //********* GET INFO *********
    this.getPersonalByIdBD = function(id_personal){
        return $http.post('data/personalOptions/getPersonalById.php',id_personal);
    }

    //********* GET INFO *********
    this.updatePasswordBD = function(personal){
        return $http.post('data/personalOptions/updatePassword.php',personal);
    }

});