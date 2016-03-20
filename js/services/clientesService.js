'use strict';

app.service('clientesService', function($http,$q){
	
	// GET
	this.getClientesBD = function(){
    	//var id = {"id":sessionService.get("id"),"token":sessionService.get("token")};
    	var id=1;
		return $http.post('data/clientes/getClientes.php',id);
	}

	// SET
	this.setClienteBD = function(newCliente){
		return $http.post('data/clientes/setCliente.php',newCliente);
	}

	// UPDATE
	this.updateClienteBD = function(newCliente){
		return $http.post('data/clientes/updateCliente.php',newCliente);
	}

	this.getClienteIdBD = function(id_cliente){
		return $http.post('data/clientes/getClienteId.php',id_cliente);
	}

	// OBTENER LOS MESES AGRUPADOS POR AÑOS DE LAS CITAS EXISTENTES DE UN CLIENTE
	this.getCitasClienteYearsMonthsBD = function(params){
		return $http.post('data/agenda/getCitasClienteYearsMonths.php',params);
	}

	// OBTENER LAS CITAS DE UN MES DETERMINADO DE UN CLIENTE
	this.getCitasClienteBD = function(params){
		return $http.post('data/agenda/getCitasCliente.php',params);
	}

	// OBTENER LISTADO DE DOCUMENTOS DE UN CLIENTE
	this.getListadoDocumentosBD = function(id_cliente){
		return $http.post('data/clientes/getListadoDocumentos.php',id_cliente);
	}

	// BORRAR UN ARCHIVO, HACIENDO UNA COPIA DEL MISMO EN LA CARPETA IDEATRESOURCES/DELETEFILE
	this.deleteFileBD = function(file){
		return $http.post('data/clientes/apiFileDelete.php',file);
	}

	this.downloadFileBD = function(url_file,titulo,extension){
		return $http.get('data/clientes/apiFileDownload.php?url_file='+url_file+'&titulo='+titulo+'&extension='+extension);
	}

	this.getAdminsBD = function(){
		return $http.get('data/clientes/getAdmins.php');
	}

	//ACTUALIZAR FICHERO Y GUARDAR BACKUP
	this.updateFileBD = function(file,paramsFile){
		var fd = new FormData();
	    fd.append("fileToUpload", file);
	    fd.append("id_historial", paramsFile.id_historial);
	    fd.append("url_file",paramsFile.url_file);
	    fd.append("fecha_modificacion",paramsFile.fecha_modificacion);
	    return $http.post('data/clientes/apiFileUpdate.php', fd, {
	        withCredentials: false,
	        headers: {'Content-Type': undefined },
	        transformRequest: angular.identity
	    });
	}

	this.uploadFileBD = function(file, paramsFile){
		var fd = new FormData();
	    fd.append("fileToUpload", file);
	    fd.append("titulo",paramsFile.titulo);
	    fd.append("descripcion",paramsFile.descripcion);
	    fd.append("tipoDocumento",paramsFile.tipoDocumento);
	    fd.append("tipoCoordinacion",paramsFile.tipoCoordinacion);
	    fd.append("id_cliente",paramsFile.id_cliente);
	    return $http.post('data/clientes/apiFileUpload.php', fd, {
	        withCredentials: false,
	        headers: {'Content-Type': undefined },
	        transformRequest: angular.identity
	    });
	}


	

});

