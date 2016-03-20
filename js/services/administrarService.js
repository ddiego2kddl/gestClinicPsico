'use strict';

app.service('administrarService', function($http,$q){
    ///////////////////////////////
	//********* TARIFAS *********//
    ///////////////////////////////
	this.getTarifasBD = function(){
        return $http.post('data/getTarifas.php');
    }
    //********* UPDATE TARIFA *********   //
    this.updateTarifaBD=function(tarifa){
        return $http.post('data/administracion/updateTarifa.php',tarifa);
    }
    //********* DELETE TARIFA *********   //
    this.deleteTarifaBD=function(tarifa){
        return $http.post('data/administracion/deleteTarifa.php',tarifa);
    }
    //********* SET TARIFA *********   //
    this.setTarifaBD=function(tarifa){
        return $http.post('data/administracion/setTarifa.php',tarifa);
    }



    ///////////////////////////////
    //*********  BONOS  *********//
    ///////////////////////////////
    this.getTarifasBonosBD = function(){
        return $http.post('data/administracion/getTarifasBonos.php');
    }
    //********* DELETE BONO *********   //
    this.deleteTarifaBonoBD=function(tarifa){
        return $http.post('data/administracion/deleteTarifaBono.php',tarifa);
    }
    //********* UPDATE BONO *********   //
    this.updateTarifaBonoBD=function(tarifa){
        return $http.post('data/administracion/updateTarifaBono.php',tarifa);
    }
    //********* SET BONO *********   //
    this.setTarifaBonoBD=function(tarifa){
        return $http.post('data/administracion/setTarifaBono.php',tarifa);
    }


    ///////////////////////////////
    //********* PERSONAL *********//
    ////////////////////////////////
    this.getPersonalBD=function(){
        return $http.post('data/administracion/getPersonal.php');
    }
    //********* UPDATE PERSONAL *********   //
    this.updatePersonalBD=function(personal){
        return $http.post('data/administracion/updatePersonal.php',personal);
    }
    //********* DELETE PERSONAL *********   //
    this.deletePersonalBD=function(personal){
        return $http.post('data/administracion/deletePersonal.php',personal);
    }
    //********* SET PERSONAL *********   //
    this.setPersonalBD=function(personal){
        return $http.post('data/administracion/setPersonal.php',personal);
    }



    ////////////////////////////////
    //********* SALAS *********   //
    ////////////////////////////////
    this.getSalasBD=function(){
        return $http.post('data/getSalas.php');
    }
    //********* UPDATE SALA *********   //
    this.updateSalaBD=function(sala){
        return $http.post('data/administracion/updateSala.php',sala);
    }
    //********* DELETE SALA *********   //
    this.deleteSalaBD=function(sala){
        return $http.post('data/administracion/deleteSala.php',sala);
    }
    //********* SET SALA *********   //
    this.setSalaBD=function(sala){
        return $http.post('data/administracion/setSala.php',sala);
    }


});