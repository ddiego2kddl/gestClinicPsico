'use strict';
///////////////////////////////////////////
//******* Controller LA AGENDA *******/////
///////////////////////////////////////////
app.controller('agendaCtrl', ['$scope','agendaService','$modal','$q','utilsService', function($scope,agendaService,$modal,$q,utilsService){

	var firsTime =true;

	$scope.changeTipoActivo = function (){
		if ($scope.selectedVista.id ==1 || $scope.selectedVista.id ==0)
			initSemana();
		else if ($scope.selectedVista.id ==2 || $scope.selectedVista.id == 3)
			initMes();
		else if ($scope.selectedVista.id ==4)
			initDia();
	}

	//Select de tipo de vista, carga en el otro select el corespondiente e inicializa
	$scope.changeTipoVista = function (){
		if ($scope.selectedVista.id == 0){
			$scope.intervalo="Semana";
			$scope.tipoActivos=$scope.salas;
			$scope.selectedTipoActivo = $scope.tipoActivos[0];
			initSemana();
		}
		else if ($scope.selectedVista.id == 1){
			$scope.intervalo="Semana";
			$scope.tipoActivos=$scope.psicologas;
			$scope.selectedTipoActivo = $scope.tipoActivos[0];
			initSemana();
		}
		else if ($scope.selectedVista.id == 2){
			$scope.intervalo="Mes";
			$scope.tipoActivos=$scope.salas;
			$scope.selectedTipoActivo = $scope.tipoActivos[0];
			initMes();
		}
		else if ($scope.selectedVista.id == 3){
			$scope.intervalo="Mes";
			$scope.tipoActivos=$scope.psicologas;
			$scope.selectedTipoActivo = $scope.tipoActivos[0];
			initMes();
		}
		else if ($scope.selectedVista.id == 4){
			$scope.intervalo="Dia";
			$scope.tipoActivos=$scope.psicologas;
			$scope.selectedTipoActivo = $scope.tipoActivos[0];
			initDia();
		}
	}

	//evento de cambio de semana
	$scope.changeIntervalo = function(op){
		if ($scope.selectedVista.id ==1 || $scope.selectedVista.id ==0){
			if (op==-1)
				numSemana--;
			else if (op==0)
				numSemana=0;
			else if (op==1)
				numSemana++;
			initSemana();
		}
		else if ($scope.selectedVista.id ==2 || $scope.selectedVista.id == 3){
			if (op==-1)
				numMes--;
			else if (op==0)
				numMes=0;
			else if (op==1)
				numMes++;
			initMes();
		}
		else if ($scope.selectedVista.id ==4){
			if (op==-1)
				$scope.dt = utilsService.addDays2(new Date($scope.dt),-1);
			else if (op==0)
				$scope.dt = new Date();
			else if (op==1)
				$scope.dt = utilsService.addDays2(new Date($scope.dt),1);
			initDia();
		}
	}

	var festivosArray;
	/////////////////////////////////////////////
	////////////////// SEMANA ///////////////////
	/////////////////////////////////////////////
	var numSemana = 0;
	var initSemana = function(){
		//console.log("initSemana");
		$scope.semana = agendaService.getSemana(numSemana); //primero establezco el rango de la semana, y guardo en el scope la semana parseada
		var firstDay = utilsService.addDays2($scope.semana[0].fecha,-1);
		var lastDay = utilsService.addDays2($scope.semana[4].fecha,1);
		var festivos = agendaService.getFestivosIntervaloBD(firstDay,lastDay),
			asuntosPersonales = agendaService.getAsuntosPersonalesIntervaloBD(firstDay,lastDay),
			citas = agendaService.getCitasIntervaloBD(firstDay,lastDay);
		$q.all([festivos,citas,asuntosPersonales]).then(function(dataArray){
			festivosArray=dataArray[0].data;
			$scope.horas =  agendaService.makeArraySemana($scope.semana,dataArray[1].data,$scope.clientesBD,$scope.tarifas,$scope.selectedVista.id,$scope.selectedTipoActivo,$scope.salas,$scope.psicologas,dataArray[0].data,dataArray[2].data);
		});
	}

	/////////////////////////////////////////
	////////////////// DIA //////////////////
	/////////////////////////////////////////
	var initDia = function(){
		console.log("initDia1");
		$scope.dtParse = utilsService.parseFecha($scope.dt,1);
		var auxFecha = utilsService.parseFecha(new Date($scope.dt),0);
		var festivos = agendaService.getFestivosIntervaloBD(auxFecha,auxFecha),
			citas = agendaService.getCitasIntervaloBD(auxFecha,auxFecha);
		$q.all([festivos,citas]).then(function(dataArray){
			festivosArray=dataArray[0].data;
			$scope.horasDia =  agendaService.makeArrayDia(auxFecha,dataArray[1].data,$scope.clientesBD,$scope.tarifas,$scope.salas,$scope.psicologas,dataArray[0].data);
		});
	}

	//controller del datepicker
	$scope.today = function() {
		$scope.dt = new Date();
	};


	// Disable weekend selection
	$scope.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
	};

	$scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
    };

	$scope.$watch('dt',function(){
		//sino esta puesto esto, la primera vez que carga la vista semana/psicologa, los festivos al clickarlos no aparecen como tal
		if (!firsTime)
			initDia();
	});

	/////////////////////////////////////////
	////////////////// MES //////////////////
	/////////////////////////////////////////
	var numMes = 0;
	//llamada a las peticiones http para cargar recursos de vista MES
	var initMes = function(){
		//console.log("initMes");
		var mes = agendaService.getMes(numMes); //primero establezco el rango de la semana, y guardo en el scope la semana parseada
		$scope.mes = [];
		var firstDay = utilsService.parseFecha(mes[0],0);
		var lastDay = utilsService.parseFecha(mes[mes.length-1],0);

		var festivos = agendaService.getFestivosIntervaloBD(firstDay,lastDay),
			asuntosPersonales = agendaService.getAsuntosPersonalesIntervaloBD(firstDay,lastDay),
			citas = agendaService.getCitasIntervaloBD(firstDay,lastDay);
		$q.all([festivos,citas,asuntosPersonales]).then(function(dataArray){
			festivosArray=dataArray[0].data;
			mes =  agendaService.makeArrayMes(mes,dataArray[1].data,$scope.clientesBD,$scope.tarifas,$scope.selectedVista.id,$scope.selectedTipoActivo,$scope.salas,$scope.psicologas,dataArray[0].data,dataArray[2].data);
			//console.log(mes);
			for (var i=0; i< mes.length/5 ; i++){
				$scope.mes.push([mes[0+(i*5)],mes[1+(i*5)],mes[2+(i*5)],mes[3+(i*5)],mes[4+(i*5)]]);
			}
		});	
	}

	//añadir cita desde vistas de mes --> enlaza con $scope.go()
	$scope.addCitaMes = function (dia){
		if (!dia.festivo){
			var citaTemp = {};
			citaTemp.fecha = dia;
			if ($scope.tipoActivos[0].id_sala != null){
				citaTemp.id_sala=$scope.tipoActivos[0].id_sala;
			}
			else if ($scope.tipoActivos[0].id_personal != null){
				citaTemp.id_personal=$scope.tipoActivos[0].id_personal;
			}
	        citaTemp.id_cliente = '';
	        citaTemp.observaciones = '';
	        citaTemp.id_tarifa = '';
	        citaTemp.id_repeticion = null;
	        citaTemp.grupo="no";

			$scope.go(citaTemp);
		}
	}

	//funcion sobre click en nombre de psicologas en leyenda (de momento vacio)
	$scope.updateColores = function(){
		var psicologasCambio = [];
		for (var i=0; i<psicologasArrayBackup.length; i++){
			if (psicologasArrayBackup[i].color != $scope.psicologas[i].color){
				psicologasCambio.push($scope.psicologas[i]);
			}
		}

		agendaService.updateColoresPersonalBD(psicologasCambio).then(function(data){
			if (data.data == "false")
				console.log("error!");
			else
				init();
		});	
	}
	var psicologasArrayBackup = [];
	//en el INIT lo cargo una sola vez, para cargar los watchers sobre los cambio de color
	var watcherPsicologas = function (){
		for (var i = 0; i < $scope.psicologas.length; i++) {
            $scope.$watch('psicologas[' + i + '].color', function (newValue, oldValue) {
            	if (newValue != oldValue){
	                if (!$scope.guardarColores)
	                    $scope.guardarColores=true;
	            }
            }, true);
    	}
	}

    //evento de click, aqui sacar el MODAL
	$scope.go = function(cita) {
		if (cita!=null){   //comprueba que la cita no sea null
			if (!cita.festivo && !cita.asuntosPersonales){  //comprueba que no sea un festivo
				if (cita.grupo=="no"){
					$scope.cita=cita;
					$scope.cita.fecha = new Date($scope.cita.fecha);
			        var modalInstance = $modal.open({
			            templateUrl: 'partials/agenda/agendaCita.html',
			            controller: 'citaCtrl',
			            backdrop: false,
		            	windowClass: 'transpModal',
			            size: 'lg',
			            resolve: {
			                citaInfo: function(){
			                    return $scope.cita;
			                },
			                salasInfo: function(){
			                    return $scope.salas;
			                },
			                psicologasInfo: function(){
			                    return $scope.psicologas;
			                },
			                tarifasInfo: function(){
			                	return $scope.tarifas;
			            	},
			            	extraInfo: function(){
			            		return $scope.selectedTipoActivo;
			            	}
			            }
			        });
			        modalInstance.result.then(function(selectedItem){
			            init();
			        });
		    	}
		    	else{
		    		agendaService.verGrupo(cita).then(function(data){
		    			init();
		    		})
		    	}

	    	}else if (cita.asuntosPersonales){
	    		editAsuntoPropio(cita);
	    	}
		}
	};

	function editAsuntoPropio(cita){
	    var asuntoPropio=cita;
	    console.log(asuntoPropio);
        var modalInstance = $modal.open({
            templateUrl: 'partials/agenda/asuntosPersonalesEdit.html',
            controller: 'editAsuntosPersonalesCtrl',
            backdrop: false,
        	windowClass: 'transpModal',
            size: 'md',
            resolve: {
                asuntosPersonalesInfo: function(){
                    return asuntoPropio;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
	}



	$scope.setFestivo = function(numDia){ // 0-lunes, 1-martes .... 4-viernes
		var dia = {"fecha":utilsService.parseFecha($scope.semana[numDia].fecha,0),"festivo":false};
		for (var i=0;i<festivosArray.length;i++){
			if (festivosArray[i].fecha==dia.fecha){
				dia.festivo=true;
				dia.razon = festivosArray[i].razon;
			}
		}
		var modalInstance = $modal.open({
	        templateUrl: 'partials/agenda/editFestivo.html',
	        controller: 'festivoCtrl',
	        backdrop: false,
	    	windowClass: 'transpModal',
	        size: 'sm',
	        resolve: {
	            diaInfo: function(){
	                return dia;
	            }
	        }
	    });
	    modalInstance.result.then(function(selectedItem){
	        init();
	    });
	}

	//funcion de inicializar, carga psicologas, salas, clientes y tarifas y llama a initSemana.//////
	//$scope.selectedVista={};
	//$scope.selectedVista.id=0;
	//$scope.selectedTipoActivo=$scope.salas;

	var init = function(){
		var psicologas = agendaService.getPsicologasBD(),
			salas = agendaService.getSalasBD(),
			clientes = agendaService.getClientesBD(),
			tarifas = agendaService.getTarifasBD();
		$q.all([psicologas,salas,clientes,tarifas]).then(function(dataArray){
    			$scope.psicologas = dataArray[0].data;//ARRAY DE PSICOLOGAS
				psicologasArrayBackup = angular.copy(dataArray[0].data); //arrayBackup para psicologas, para comprobar colores cambiados
    			for (var i=0;i<$scope.psicologas.length;i++){
    				$scope.psicologas[i].desc=$scope.psicologas[i].nombre;
    			}
    			$scope.salas = dataArray[1].data;//ARRAY DE SALAS	
    			for (var i=0;i<$scope.salas.length;i++){
    				$scope.salas[i].desc=$scope.salas[i].descripcion;
    			}
    			$scope.clientesBD = dataArray[2].data;
    			$scope.tarifas = dataArray[3].data;

    			//DEPENDE DE SI ES GESTION O ADMIN/PERSONAL, ESTABLEZCO A UNA VISTA U OTRA
    			if (firsTime == true){
    				$scope.today();  //inicializar el dia de (Salas/dia) al dia de hoy, luego si se cambia se conserva
    				$scope.tipoVistas = agendaService.getTipoVistas(); //TIPO DE VISUALIZACIONES DISPONIBLES
    				if ($scope.rol == "Gestion"){ //ancira the best
						$scope.selectedVista = $scope.tipoVistas[4];//TIPO DE VISUALIZACION SEMANA/SALA
						$scope.changeTipoVista();
    				}
    				else{
						$scope.selectedVista = $scope.tipoVistas[1];//TIPO DE VISUALIZACION SEMANA/PROFESIONAL
						$scope.tipoActivos = $scope.psicologas;  // ESTABLEZCO EN EL SPINNER 2 PSICOLOGAS 
						$scope.selectedTipoActivo = $scope.tipoActivos[agendaService.getPosPersonal($scope.psicologas,$scope.rolID)];  //SELECCIONO A LA PSICOLOGA LOGEADA
    					$scope.intervalo="Semana";
    					$scope.changeTipoActivo();
    				}
    				watcherPsicologas();   //para activar solo una vez el watcher de psicologas
					firsTime = false;
				}
				else
    				$scope.changeTipoActivo();
    	});
		$scope.guardarColores=false;
	}

	init();
}]);



/////////////////////////////////////((((//////
//***** Controller de Modal de CITA ******/////
///////////////////////////////////////((((////
app.controller('citaCtrl', function(sessionService,$scope, $modalInstance, $modal, agendaService, utilsService, citaInfo, salasInfo, psicologasInfo, tarifasInfo, extraInfo, contabilidadService) {
    $scope.cita = citaInfo;
    $scope.salas = salasInfo;
    $scope.psicologas = psicologasInfo;
    $scope.horas = agendaService.getHoras();
    $scope.selectedHora = $scope.horas[$scope.cita.hora - 8];
    $scope.tarifas = tarifasInfo;
    $scope.cantHoras = [{"value":1,"desc":"1 Hora"},{"value":2,"desc":"2 Horas"}];
    $scope.selectedCantHora = $scope.cantHoras[0];
    $scope.esRepeticion = false;
    $scope.grupo = {};
    var existe = false;
    var citaInicial;

    var init = function (){
		$scope.rol = sessionService.get('rol');
    	if (citaInfo.id_cliente == ""){  //Cita vacia
    		$scope.encabezado = "Nueva Cita";
    		$scope.nuevaCita = true;
    		$scope.noEditar=false;
    		$scope.grupo.extra=false;
    		$scope.noPaciente="Buscar Paciente";
    		if (extraInfo.id_sala != "" && extraInfo.id_sala != null){  // vistas de Semana/Sala y Mes/Sala
		    	for (var i=0; i<$scope.salas.length; i++){
		    		if ($scope.salas[i].id_sala == extraInfo.id_sala){
		    			$scope.selectedSala = $scope.salas[i];
		    		}
		    	}
	    	}else if (citaInfo.id_sala != "" && citaInfo.id_sala != null){ // el caso de vista  Salas / Dia
	    		for (var i=0; i<$scope.salas.length; i++){
		    		if ($scope.salas[i].id_sala == citaInfo.id_sala){
		    			$scope.selectedSala = $scope.salas[i];
		    		}
		    	}
	    	}
	    	else if (extraInfo.id_personal != "" && extraInfo.id_personal != null){ //vistas de Semana/Profesional y Mes/Profesional
    			//console.log("cambiando sala");
    			//console.log(extraInfo);
		    	for (var i=0; i<$scope.psicologas.length; i++){
	    			if ($scope.psicologas[i].id_personal == extraInfo.id_personal){
	    				$scope.selectedPsicologa = $scope.psicologas[i];
	    			}
	    		}
    		}
    	}
    	else{  //Cita con informacion
    		existe = true;
    		if (citaInfo.grupo=="si")
    			$scope.grupo.extra=false;
    		else
    			$scope.grupo.extra="Crear Grupo";
    		$scope.noPaciente= $scope.cita.cliente.nombrePaciente+" "+$scope.cita.cliente.apellidosPaciente;
    		$scope.encabezado = $scope.cita.cliente.nombrePaciente+" "+$scope.cita.cliente.apellidosPaciente;
    		$scope.noEditar=true;
    		$scope.cita.fecha = new Date($scope.cita.fecha);
    		citaInicial=angular.copy($scope.cita);
    		if ($scope.cita.id_repeticion != null){
    			$scope.esRepeticion=true;
    			agendaService.getRepeticionBD($scope.cita.id_repeticion).then(function(response){
    				$scope.repeticionExistente = response.data[0];
    			});
    		}
    		for (var i=0; i<$scope.salas.length; i++){
	    		if ($scope.salas[i].id_sala == citaInfo.id_sala){
	    			$scope.selectedSala = $scope.salas[i];
	    		}
	    	}
    		for (var i=0; i<$scope.psicologas.length; i++){
    			if ($scope.psicologas[i].id_personal == citaInfo.id_personal){
    				$scope.selectedPsicologa = $scope.psicologas[i];
    			}
    		}
    		for (var i=0; i<$scope.tarifas.length; i++){
    			if ($scope.tarifas[i].id_tarifa == citaInfo.id_tarifa){
    				$scope.selectedTipoCita = $scope.tarifas[i];
    			}
    		}

    	}
    }

    init();

    $scope.cancel= function(){
    	$modalInstance.dismiss();
    }

    var tipoRepeticion = 0;
    $scope.repeticion = function(tipo){
    	switch(tipo){
    		case 0: $scope.repNinguna = true;
    				$scope.repSemanal = false;
    				$scope.repQuincenal = false;
    				tipoRepeticion = tipo;
    				break;
    		case 7: $scope.repNinguna = false;
    				$scope.repSemanal = true;
    				$scope.repQuincenal = false;
    				tipoRepeticion = tipo;
    				break;
    		case 14: $scope.repNinguna = false;
    				$scope.repSemanal = false;
    				$scope.repQuincenal = true;
    				tipoRepeticion = tipo;
    				break;
    	}

    }

    $scope.buscarPaciente = function(){
    	var modalInstance = $modal.open({
            templateUrl: "partials/agenda/searchCliente.html",
            controller: "searchClienteCtrl",
            backdrop: false,
            size: 'md' ,
            windowClass: 'transpModal modalSearchPaciente',
            resolve: {
                searchCliente: function(){
                    return $scope.cliente;
                }
	        }
        });
        modalInstance.result.then(function(selectedItem){
        	$scope.cita.cliente = selectedItem;
    		$scope.noPaciente= $scope.cita.cliente.nombrePaciente+" "+$scope.cita.cliente.apellidosPaciente;
        });
    }

    $scope.$watch('cita.fecha',function(){
    	if ((new Date($scope.cita.fecha)).getDay() == 0 || (new Date($scope.cita.fecha)).getDay() == 6){
    		utilsService.alertModal("I","Fallo en fechas...","No puedes elegir ni sabados ni domingos, vuelve a seleccionar fecha!!").then(function(response){
    						$scope.cita.fecha=null;
    		});
    	}
    });

    $scope.guardarCita=function(){
    	//console.log($scope.cita.id_factura);
    	if ($scope.cita.cliente == null){
    		utilsService.alertModal("I","Faltan datos...","Por favor elije un paciente!!").then(function(response){
			            if (response)
    						$scope.cita.fecha=null;
    		});
    	} else if (tipoRepeticion != 0 && $scope.fechaTopeRepeticion == null){
    		utilsService.alertModal("I","Fecha repeticion...","Por favor seleccione una fecha limite para la repeticion!").then(function(response){
			            if (response)
    						$scope.cita.fecha=null;
    		});
    	} else if ($scope.cita.id_factura!=null && $scope.cita.id_tarifa!=$scope.selectedTipoCita.id_tarifa){
	    	utilsService.alertModal("I","OPERACION NO PERMITIDA","IMPOSIBLE CAMBIAR 'tipo cita' porque esta facturada. Ver factura Nº "+$scope.cita.id_factura).then(function(response){
		    	console.log("Imposible editar citas facturadas - Firewall de errores temporal");
		    });
    	}
    	else{ //*****TODOS LOS CAMPOS CORRECTOS*********
	        if (existe){ //paso a actualizar el existente
	        	$scope.noEditar=!$scope.noEditar;
	        	utilsService.alertModal("C","Guardando Cambios...","¿Quieres guardar los cambios realizados en la cita?").then(function(response){
			            if (response){
			                $scope.actualizarCita();
			            }
			            else
			                console.log("cancelar");
				});
	        }
	        else{ //no existe, crear cita/s nueva
	        	var citaTemp= {};
	        	citaTemp.fecha = utilsService.parseFecha($scope.cita.fecha,0);
	        	var arrayHoras = $scope.selectedHora.split(":");
	        	citaTemp.hora = arrayHoras[0];
	        	citaTemp.id_sala = $scope.selectedSala.id_sala;
	        	citaTemp.id_personal = $scope.selectedPsicologa.id_personal;
	        	citaTemp.id_cliente = $scope.cita.cliente.id_cliente;
	        	citaTemp.observaciones = $scope.cita.observaciones;
	        	citaTemp.id_tarifa = $scope.selectedTipoCita.id_tarifa;
	        	citaTemp.grupo = citaInfo.grupo;

	        	var arrayCitas = [];
	        	//crear repeticiones

	        	var fechaCita = new Date(citaTemp.fecha);
	        	var fechaFin = null;
	        	if (tipoRepeticion != 0){ //si existe repeticion..
	        		fechaFin = new Date(utilsService.addDays2($scope.fechaTopeRepeticion,1));
		        	citaTemp.fechaFin = utilsService.parseFecha(fechaFin,0);  //si es repeticion me guardo la fecha tope
		        	citaTemp.dias = tipoRepeticion; // si es repeticion me guardo los dias de intervalo
		        	arrayCitas.push(citaTemp);
	        		while (fechaCita < fechaFin){
	        			var auxObject = angular.copy(citaTemp);
	        			fechaCita=utilsService.addDays2(fechaCita,tipoRepeticion);
	        			if (fechaCita < fechaFin){
	        				auxObject.fecha = utilsService.parseFecha(fechaCita,0);
	        				arrayCitas.push(auxObject);
	        			}
	        		}
	        	}
	        	else if ($scope.selectedCantHora.value == 2){
	        		arrayCitas.push(citaTemp);
	        		var auxObject = angular.copy(citaTemp);
	        		auxObject.hora = ""+(parseInt(auxObject.hora)+1);
	        		arrayCitas.push(auxObject);
	        	}
	        	else
	        		arrayCitas.push(citaTemp); //añado la cita simple


	        	agendaService.checkCitaBD(arrayCitas).then(function(response){
	        		// 0:noexiste , 1:sala-ocupada , 2:psicologa-ocupada, 4:cliente-ocupado     --> (la suma de ellos, combinacion)
	        		var citasStatus = response.data;
	        		//mostrar modal de confirmacion para meter la cita, o la repeticion
	        		if (citasStatus.length>0){
	        			var modalInstance = $modal.open({
				            templateUrl: "partials/agenda/confirmacionReservaCita.html",
				            controller: "confirmacionReservaCitaCtrl",
				            backdrop: false,
				            size: 'md' ,
				            windowClass: 'transpModal modalConfirmacionReservaCita',
				            resolve: {
				                arrayCitas: function(){
				                    return arrayCitas;
				                },
				                citasStatus: function(){
				                    return citasStatus;
				                },
				                mode: function(){
				                    return "new";
				                }
					        }
				        });
				        modalInstance.result.then(function(selectedItem){
				        	utilsService.alertModal("I","GUARDANDO CITA...","Cita guardada con exito!!").then(function(response){
					            if (response)
					                $modalInstance.close();
					            else
					                console.log("cancelar");
					        });
				        	
				        });
	        		}
	        	});
	        } //fin else no existe
	    }
    };//fin $scope.guardarCliente

    $scope.eliminarCita = function(){
    	if ($scope.cita.id_factura){
	    	utilsService.alertModal("I","OPERACION NO PERMITIDA","IMPOSIBLE ELIMINAR una cita que esta facturada. Ver factura Nº "+$scope.cita.id_factura).then(function(response){
		    	console.log("Imposible editar citas facturadas - Firewall de errores temporal");
		    });
		}
		else{
	    	utilsService.alertModal("W","Eliminando cita...","¿Quieres eliminar definitivamente la cita?").then(function(response){
		            if (response){
						$scope.cita.fecha2 = utilsService.parseFecha($scope.cita.fecha,0);
				    	agendaService.deleteOneCitaBD($scope.cita).then(function(response){
				    		if (response.data=="true"){
				    			utilsService.alertModal("I","Cita Eliminada","Cita eliminada con éxito!").then(function(response){
						            if (response)
				    					$modalInstance.close();
						        });
				    		}
				    	});
		            }
			});
		}	
    }

    $scope.cancelarCita = function(){
    	utilsService.alertModal("C","Cancelando cita","¿Realmente quieres cancelar esta cita?").then(function(response){
            if (response){
                var citaTemp = crearTempCita();
		    	citaTemp.horaFinal = parseInt(citaTemp.horaFinal) * -1;
		    	agendaService.updateCitaBD(citaTemp).then(function(response){
		    		if (response.data=="true"){
		    			utilsService.alertModal("I","Cancelando cita...","Cita cancelada con éxito!").then(function(response){
				            if (response)
		    					$modalInstance.close();
				        });
		    		}
		    		else
		    			utilsService.alertModal("I","Error!","POSIBLEMENTE YA HAY UNA CITA ANULADA EN ESTA HORA Y SALA").then(function(response){
						        console.log("solo una cita anulada por hora/fecha/sala");
			    		});
		    			
		    	});
            }
        });
    	
    }

    $scope.actualizarCita = function(){
    	// creo en citaTemp la cita que voy a tener como resultado, y recojo de citaInicial los valores para la busqueda sql del original
    	agendaService.updateCitaBD(crearTempCita()).then(function(response){
    		if (response.data=="true"){
    			utilsService.alertModal("I","Editando cita...","Cambios realizados con éxito!").then(function(response){
			            if (response){
    						$modalInstance.close();
			            }
			            else
			                console.log("cancelar");
				});
    		}else
				utilsService.alertModal("W","Error!","Conflicto con psicologa, sala o paciente. CONTINUAR para cambiar parametros, o CANCELAR para abandonar sin hacer cambios!").then(function(response){
					    if (response)
					       	$scope.noEditar=!$scope.noEditar;
					    else
					    	$modalInstance.close();
		    	});
    	});
    }

    $scope.facturarCita = function(cita){
    	contabilidadService.setFacturaCita(cita).then(function(rsp){
    		if (rsp){
    			utilsService.alertModal("I","FACTURACION TERMINADA","SE HA GENERADO LA FACTURA").then(function(response){
    				$modalInstance.close();
					console.log("solo una cita anulada por hora/fecha/sala");
			    });
    			
    		}
    		else
    			console.log("salio sin mas");
    	});
    }

    $scope.verFacturaCita = function(cita){
    	contabilidadService.showFactura(cita.id_factura).then(function(response){
    		if (response)
    			$modalInstance.close();
    		else
    			console.log("cerrado sin cambios");
    	})
    }

    var crearTempCita = function(){
    	var citaTemp= {};
    	citaTemp.fechaFinal = utilsService.parseFecha($scope.cita.fecha,0);
    	citaTemp.fechaInicial = utilsService.parseFecha(citaInicial.fecha,0);
    	var arrayHoras = $scope.selectedHora.split(":");
    	citaTemp.horaFinal = arrayHoras[0];
    	citaTemp.horaInicial = citaInicial.hora;
    	citaTemp.id_salaFinal = $scope.selectedSala.id_sala;
    	citaTemp.id_salaInicial = citaInicial.id_sala;
    	citaTemp.id_personal = $scope.selectedPsicologa.id_personal;
    	citaTemp.id_cliente = $scope.cita.cliente.id_cliente;
    	citaTemp.observaciones = $scope.cita.observaciones;
    	citaTemp.id_tarifa = $scope.selectedTipoCita.id_tarifa;
    	return citaTemp;
    }

    $scope.noEdicionCitasFacturadas = function(){
    	/*if ($scope.cita.id_factura){
	    	utilsService.alertModal("I","OPERACION NO PERMITIDA","IMPOSIBLE EDITAR una cita que esta facturada. Ver factura Nº "+$scope.cita.id_factura).then(function(response){
		    	console.log("Imposible editar citas facturadas - Firewall de errores temporal");
		    });
		}
	    else*/
	    	$scope.noEditar = !$scope.noEditar;
    }

    $scope.editarSerie = function(){
    	var modalInstance = $modal.open({
            templateUrl: "partials/agenda/editarSerie.html",
            controller: "editarSerieCtrl",
            backdrop: false,
            size: 'md' ,
            windowClass: 'transpModal modalConfirmacionReservaCita',
            resolve: {
                repeticionExistente: function(){
                    return $scope.repeticionExistente;
                },
                salas: function(){
                    return $scope.salas;
                },
                horas: function(){
                    return $scope.horas;
                },
                psicologas: function(){
                    return $scope.psicologas;
                },
                tarifas: function(){
                    return $scope.tarifas;
                },
                selectedHora: function(){
                    return $scope.selectedHora;
                },
                selectedSala: function(){
                    return $scope.selectedSala;
                },
                selectedTipoCita: function(){
                    return $scope.selectedTipoCita;
                },
                selectedPsicologa: function(){
                    return $scope.selectedPsicologa;
                }
	        }
        });
        modalInstance.result.then(function(selectedItem){
        	//init();
        	$modalInstance.close();
        });
    }

    $scope.crearGrupo = function(){
    	var modalInstance = $modal.open({
            templateUrl: "partials/agenda/crearGrupo.html",
            controller: "crearGrupoCtrl",
            backdrop: false,
            size: 'sm',
            windowClass: 'transpModal modalConfirmacionReservaCita',
            resolve: {
                citaInfo: function(){
                    return $scope.cita;
                }
	        }
        });
        modalInstance.result.then(function(selectedItem){
        	//init();
        	$modalInstance.close();
        });
    } 

    $scope.verGrupo = function(){
    	agendaService.verGrupo($scope.cita).then(function(data){
    		if (data.data){
    			$modalInstance.close();
    		}
    	})
    }

    $scope.asuntosPropios = function(){
    	var modalInstance = $modal.open({
            templateUrl: "partials/agenda/asuntosPersonales.html",
            controller: "asuntosPersonalesCtrl",
            backdrop: false,
            size: 'md',
            windowClass: 'transpModal modalConfirmacionReservaCita',
            resolve: {
            	horaSelectedInfo: function(){
                    return $scope.selectedHora;
                },
                fechaSelectedInfo: function(){
                    return $scope.cita.fecha;
                },
                horasArrayInfo: function(){
                    return $scope.horas;
                },
                psicologasInfo: function(){
                    return $scope.psicologas;
                },
                psicologaSelectedInfo: function(){
                    return $scope.selectedPsicologa;
                }
	        }
        });
        modalInstance.result.then(function(selectedItem){
        	//init();
        	$modalInstance.close();
        });
    }
});



////////////////////////////////////////////////////
///************ EDITAR SERIE ********************///
////////////////////////////////////////////////////
app.controller('editarSerieCtrl', function($scope, $modalInstance, $modal, agendaService, utilsService, repeticionExistente, salas, horas, psicologas, tarifas, selectedHora, selectedSala, selectedPsicologa, selectedTipoCita) {
	var auxFechaFin;
    var init = function (){
		$scope.salas=salas;
		$scope.tarifas=tarifas;
		$scope.psicologas=psicologas;
		$scope.horas=horas;
		$scope.selectedHora=selectedHora;
		$scope.selectedSala = selectedSala;
		$scope.selectedTipoCita = selectedTipoCita;
		$scope.selectedPsicologa = selectedPsicologa;
		$scope.modificarFecha = true;

    	agendaService.getCitasRepeticionBD(repeticionExistente.id_repeticion).then(function(citas){
    		$scope.fechaFin = new Date(repeticionExistente.fechaFin);
    		auxFechaFin = new Date(repeticionExistente.fechaFin);
    		$scope.citasRealizadas=[];
    		$scope.citasPendientes=[];
    		$scope.pendientes=false;
    		$scope.diasIntervalo = repeticionExistente.dias;
    		$scope.lastCita = citas.data[citas.data.length-1];
    		for (var i=0; i<citas.data.length;i++){
    			if (new Date(citas.data[i].fecha) < new Date())
    				$scope.citasRealizadas.push(citas.data[i]);
    			else
    				$scope.citasPendientes.push(citas.data[i]);
    		}
    		if ($scope.citasPendientes.length>0)
    			$scope.pendientes=true;
    	})
    }
	   
	init();

	$scope.guardarNuevaFecha = function(){
		if (auxFechaFin < $scope.fechaFin){ //**** ANADIR CITAS *****
			//console.log("mayor -- nuevasCitas");
			var fechaTemp = utilsService.addDays2(new Date($scope.lastCita.fecha),$scope.diasIntervalo);
			var nuevasCitas = [];
			//console.log(fechaTemp);
			//console.log($scope.fechaFin);
			while (fechaTemp < $scope.fechaFin){
				var auxCitaTemp = angular.copy($scope.lastCita);
				auxCitaTemp.fecha = utilsService.parseFecha(fechaTemp,0);
				nuevasCitas.push(auxCitaTemp);
				fechaTemp = utilsService.addDays2(fechaTemp,$scope.diasIntervalo);
			}
			if (nuevasCitas.length>0){
	        	agendaService.checkCitaBD(nuevasCitas).then(function(response){
	        		// 0:noexiste , 1:sala-ocupada , 2:psicologa-ocupada, 4:cliente-ocupado     --> (la suma de ellos, combinacion)
	        		var citasStatus = response.data;
	        		//mostrar modal de confirmacion para meter la cita, o la repeticion
	        		if (citasStatus.length>0){
	        			var todoCorrecto="";
	        			for (var i = 0; i < citasStatus.length; i++){
	        				if (citasStatus[i] != 0){
	        					todoCorrecto=("Conflicto en la Fecha: " + nuevasCitas[i].fecha + "  Hora: "+ nuevasCitas[i].hora);
	        					i=citasStatus.length+1;
	        				}
	        			}
	        			if (todoCorrecto != ""){
	        				utilsService.alertModal("I","Error!",todoCorrecto+ "\n Imposible ampliar Serie").then(function(response){
								       console.log("elige otra cosa!");
					    	});
	        			}
	        			else{
					        nuevasCitas[0].fechaFin = utilsService.parseFecha($scope.fechaFin,0);
	        				utilsService.alertModal("C","Actualizando serie","¿Realmente quieres Actualizar la serie hasta la fecha: "+nuevasCitas[0].fechaFin+"\n añadiendo "+citasStatus.length+" citas?").then(function(response){
					            if (response){
			        				agendaService.setCitasBD(nuevasCitas).then(function(response){
			        					utilsService.alertModal("I","Actualizando serie...","Serie Actualizada!").then(function(response){
								            if (response)
												$modalInstance.close();
								        });
									});
					            }
					        });
	        				
						}
	        		}
	        	});
			}

		}
		else if (auxFechaFin > $scope.fechaFin){ //**** ELIMINAR CITAS *****
			//console.log("menor -- sobrantes");
			var citasSobrantes=[];
			var citasFacturadas = 0;
			for (var i=0; i<$scope.citasPendientes.length; i++){
				if (new Date($scope.citasPendientes[i].fecha) > $scope.fechaFin){
					if ($scope.citasPendientes[i].id_factura==null){
						citasSobrantes.push($scope.citasPendientes[i]);
					}
					else{
						citasFacturadas++;
					}
				}
			}
			if (citasSobrantes.length > 0){
				//console.log(citasSobrantes[0]);
				if (!citasFacturadas)
					var texto = "¿Realmente quieres Actualizar la serie hasta la fecha: "+citasSobrantes[0].fecha+"\n eliminando "+citasSobrantes.length+" citas?";
				else
					var texto = "Conflicto en "+citasFacturadas+" citas por estar facturadas, quiere eliminar las "+citasSobrantes.length+" citas restantes hasta la fecha de "+citasSobrantes[0].fecha+"?";
				citasSobrantes[0].fechaFin = utilsService.parseFecha($scope.fechaFin,0);  //le paso la nueva fechaFin para actualizar la repeticion
				utilsService.alertModal("C","Actualizar serie",texto).then(function(response){
		            if (response){
        				agendaService.deleteCitasBD(citasSobrantes).then(function(response){
        					utilsService.alertModal("I","Actualizando serie...","Serie Actualizada!").then(function(response){
					            if (response)
									$modalInstance.close();
					        });
						});
		            }
		        });
			}
		}
	}

	$scope.guardarNuevosDatos = function(){
		var arrayCitas=$scope.citasPendientes;

    	//asigno los nuevos valores a la serie de citas
		for (var i=0; i<arrayCitas.length; i++){
	    	//hora inicial y sala inicial me hacen falta para buscar el original en la bDD y hacer el update
	    	arrayCitas[i].id_salaInicial=arrayCitas[i].id_sala;
	        arrayCitas[i].horaInicial=arrayCitas[i].hora;
	    	//guardo nuevo valor
			arrayCitas[i].id_sala = $scope.selectedSala.id_sala;
			arrayCitas[i].id_personal = $scope.selectedPsicologa.id_personal;
			arrayCitas[i].id_tarifa = $scope.selectedTipoCita.id_tarifa;
			var auxHora = $scope.selectedHora.split(":");
			arrayCitas[i].hora =  auxHora[0];
		}
		//console.log(arrayCitas);

		agendaService.checkCitaBD(arrayCitas).then(function(response){
    		// 0:noexiste , 1:sala-ocupada , 2:psicologa-ocupada, 4:cliente-ocupado     --> (la suma de ellos, combinacion)
    		var citasStatus = response.data;
    		for (var i=0; i<citasStatus.length; i++){
    			if ($scope.selectedHora == selectedHora){
    				citasStatus[i]=citasStatus[i]-4;
	    			if ($scope.selectedSala == selectedSala)
	    				citasStatus[i]=citasStatus[i]-1;
	    			if ($scope.selectedPsicologa == selectedPsicologa)
	    				citasStatus[i]=citasStatus[i]-2;
    			}
    			//checkeo en el array de las citas, si alguna esta facturada, y la pongo a estado -1, que indicare que no se puede cambiar
    			if (arrayCitas[i].id_factura!=null)
    				citasStatus[i]=-1;
    		}
    		//console.log(citasStatus);
    		//mostrar modal de confirmacion para meter la cita, o la repeticion
    		if (citasStatus.length>0){
    			var modalInstance = $modal.open({
		            templateUrl: "partials/agenda/confirmacionReservaCita.html",
		            controller: "confirmacionReservaCitaCtrl",
		            backdrop: false,
		            size: 'md' ,
		            windowClass: 'transpModal modalConfirmacionReservaCita',
		            resolve: {
		                arrayCitas: function(){
		                    return arrayCitas;
		                },
		                citasStatus: function(){
		                    return citasStatus;
		                },
		                mode: function(){
		                    return "update";
		                }
			        }
		        });
		        modalInstance.result.then(function(selectedItem){
		        	utilsService.alertModal("I","MODIFICACION DE SERIE...","Serie modificada con exito!!").then(function(response){
			            if (response)
			                $modalInstance.close();
			            else
			                console.log("cancelar");
			        });
		        	
		        });
    		}
	    });
	}

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }



    $scope.eliminarSerie = function(){
    	if ($scope.citasRealizadas.length > 0){
    		$scope.fechaFin = utilsService.addDays2(new Date($scope.citasRealizadas[$scope.citasRealizadas.length-1].fecha),1);
    	}
    	else
    		$scope.fechaFin = new Date();
    	$scope.guardarNuevaFecha();
    }
});



/////////////////////////////////////////////////////////////////
///************ CONFIRMACION RESERVA CITA ********************///
/////////////////////////////////////////////////////////////////
app.controller('confirmacionReservaCitaCtrl', function($scope, $modalInstance, agendaService, arrayCitas, citasStatus, mode) {
    var textoConflicto = function(opcion){
    	var texto="";
    	switch(opcion){
    		case -1: texto="CITA FACTURADA - Elimine primero la factura";
    				break;
    		case 1: texto="Sala ocupada!";
    				break;
    		case 2: texto="Profesional ocupado!";
    				break;
    		case 3: texto="Sala y Profesional ocupados!";
    				break;
    		case 4: texto="Cliente en otra cita!";
    				break;
    		case 5: texto="Sala ocupada y cliente en otra cita!";
    				break;
    		case 6: texto="Profesional ocupado y cliente en otra cita!";
    				break;
    		case 7: texto="Profesional y sala ocupados, cliente en otra cita!";
    				break;
    	}
    	return texto;
    }

    $scope.citas = arrayCitas;
    $scope.citasTotal = arrayCitas.length;
    $scope.citasConflicto = [];
    $scope.conflicto=false;
    $scope.citasCorrectas = [];

    var init = function (){
    	if (mode=="new")
    		$scope.titulo="Confirmacion de reserva de Cita/s";
    	else if (mode=="update")
    		$scope.titulo="Confirmacion de modificacion de serie";
    	var cont=0;
	    for (var i=0; i < citasStatus.length; i++){
	    	arrayCitas[i].hora2 = ""+(parseInt(arrayCitas[i].hora)+1);
	    	if (citasStatus[i] != 0){
	    		$scope.citasConflicto[cont]=arrayCitas[i];
	    		$scope.citasConflicto[cont].conflicto=textoConflicto(citasStatus[i]);
	    		cont++;
	    	}
	    	else
	    		$scope.citasCorrectas.push(arrayCitas[i]);
	    }
	    $scope.citasConflictoTotal=$scope.citasConflicto.length;
	    if ($scope.citasConflictoTotal>0){
			$scope.conflicto=true;
			$scope.aceptoConflicto=false;
	    }
		else
			$scope.aceptoConflicto=true;	
    }
	   
	init();

	$scope.confirmar = function(){
		if (mode=="new"){
			agendaService.setCitasBD($scope.citasCorrectas).then(function(response){
				console.log(response.data);
				$modalInstance.close();
			});
		} else if (mode=="update"){
			agendaService.updateCitasBD($scope.citasCorrectas).then(function(response){
				console.log(response.data);
				$modalInstance.close();
			})
		}
	}

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }
});



////////////////////////////////////////////////////////////
///***************** SEARCH PACIENTE ********************///
////////////////////////////////////////////////////////////
app.controller('searchClienteCtrl', function(clientesService, $scope, $modal, $window,$state,$filter,searchCliente,$modalInstance) {
    //llamo al servicio http que me devuelve los clientes de la base de datos
    var init = function(){ 
            clientesService.getClientesBD().then(function(data){
                $scope.data = data.data;
                initVariables();
            });    
    }
    init();

    //PAGINAR
    var initVariables = function(){
        $scope.currentPage = 0; 
        $("#prevPage").addClass("disabled");
        $("#nextPage").addClass("disabled");
        if ($scope.numberOfPages() > 1)
            $("#nextPage").removeClass("disabled");
    }

    //cada vez que se filtre, se rechekea el paginator
    $scope.$watch('search',function(){
        initVariables();
    })
    
    $scope.data = [];
    $scope.pageSize = 5;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.data,$scope.search);
        return Math.ceil(myFilteredData.length/$scope.pageSize);                
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $("#prevPage").removeClass("disabled");
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $("#nextPage").addClass("disabled");
            }
        }
        else{
            if ($scope.currentPage > 0){
                $("#nextPage").removeClass("disabled");
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $("#prevPage").addClass("disabled");
            }
        }
    }

    // PARA ORDENAR //
    $scope.predicate="nombrePaciente";
    $scope.reverse=false;
    $scope.orderby = function(fact){
        //console.log("fact");
        if ($scope.predicate == fact){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = fact;
            $scope.reverse = false;
        }
    }

    //*****mostrar formulario cliente nuevo******
    $scope.showModal=function(size){
    	//console.log("nuevo paciente");
        $scope.nuevoCliente={};
        var modalInstance = $modal.open({
            templateUrl: 'partials/clientes/clienteNew.html',
            controller: 'nuevoClienteCtrl',
            backdrop: false,
            windowClass: "transpModal",
            size: size,
            resolve: {
                nuevoCliente: function(){
                    return $scope.nuevoCliente;
                },
                responsablesBDInfo: function(){
                    return null;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
            $modalInstance.close(selectedItem);
        });
    };

    $scope.fichaCliente = function(cliente){
        searchCliente=cliente;
        $modalInstance.close(cliente);

    }

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }
});



//////////////////////////////////////////////////////////
///************ FESTIVO CONTROLLER ********************///
//////////////////////////////////////////////////////////
app.controller('festivoCtrl', function($scope, $modalInstance, agendaService, diaInfo) {
    
    var init = function (){
    	$scope.options = [{"desc":"si","value":true},{"desc":"no","value":false}];
    	if (diaInfo.festivo)
    		$scope.selectedOption = $scope.options[0];
    	else {
    		$scope.selectedOption = $scope.options[1];
    	}
    	$scope.dia = angular.copy(diaInfo);
    }
	   
	init();

	$scope.guardar = function(){
		if ($scope.selectedOption.value != diaInfo.festivo){
			if ($scope.selectedOption.value == true){
				insertFestivo();
			}
			else{
				deleteFestivo();
			}
		}
		else if ($scope.dia.razon != diaInfo.razon && $scope.selectedOption.value==true){
			updateFestivo();
		}
		else
			$modalInstance.dismiss('cancel');
	}

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }

	var deleteFestivo = function(){
		agendaService.deleteFestivoBD(diaInfo.fecha).then(function(data){
			if (data.data=="true"){
				console.log("borrado con exito");
				$modalInstance.close('exito');
			}
		});
	}

	var insertFestivo = function(){
		agendaService.setFestivoBD(diaInfo.fecha,$scope.dia.razon).then(function(data){
			if (data.data=="true"){
				$modalInstance.close('exito');
			}
		});
	}

	var updateFestivo = function(){
		agendaService.updateFestivoBD(diaInfo.fecha,$scope.dia.razon).then(function(data){
			if (data.data=="true"){
				$modalInstance.close('exito');
			}
			else
				console.log(data.data);
		});
	}
});


////////////////////////////////////////////////////////////////////
///************ CREAR GRUPO NUEVO CONTROLLER ********************///
////////////////////////////////////////////////////////////////////
app.controller('crearGrupoCtrl', function($scope, $modalInstance, agendaService, citaInfo,utilsService) {
    
    var init = function (){
    	//console.log(citaInfo);
    	if (citaInfo.id_repeticion != null){
    		$scope.repeticion=true;
    		//console.log("exite repeticion");
    	}
    	else{
    		$scope.tipoSimple=true;
    		$scope.tipoGrupo=false;
    		$scope.repeticion=false;
    		//console.log("cita individual");
    	}
    }
	   
	init();


    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }

	$scope.accept = function(){
		if ($scope.tipoSimple){
			//console.log("tipoSimple");
			var aux=[];
			aux.push(angular.copy(citaInfo));
			aux[0].fecha=utilsService.parseFecha(aux[0].fecha,0);
			/// PREGUNTAR ****************
			utilsService.alertModal("C","CREANDO GRUPO","¿Crear grupo de la cita seleccionada?").then(function(response){
		            if (response){
			    		agendaService.setGrupoBD(aux).then(function(rsp){
							if (rsp.data=="true"){
								utilsService.alertModal("I","Grupo Creado","Grupo creado con éxito!!").then(function(response){
									//console.log("ver grupo");
									$modalInstance.close();
									agendaService.verGrupo(aux[0]);
								});
		        
							}
						});
					}
				});
		}
		else{
			//console.log("tipoGrupo");
			agendaService.getCitasRepeticionBD(citaInfo.id_repeticion).then(function(citas){
	    		var citasPendientes=[];
	    		$scope.lastCita = citas.data[citas.data.length-1];
	    		for (var i=0; i<citas.data.length;i++){
	    			if (new Date(citas.data[i].fecha) >= new Date())
	    				citasPendientes.push(citas.data[i]);
	    		}

	    		//console.log(citasPendientes);
				/// PREGUNTAR ****************
				utilsService.alertModal("C","CREANDO GRUPO","¿Crear grupo de las "+citasPendientes.length+" citas restantes con fecha final: "+citasPendientes[citasPendientes.length-1].fecha+"?").then(function(response){
		            if (response){
			    		agendaService.setGrupoBD(citasPendientes).then(function(rsp){
							if (rsp.data=="true"){
								utilsService.alertModal("I","Grupo Creado","Grupo creado con éxito!!").then(function(response){
									//console.log("ver grupo");
									$modalInstance.close();
									agendaService.verGrupo(citasPendientes[0]);
								});
		        
							}
						});
					}
				});

			});
		}
	}
});



/////////////////////////////////////////////////////////////
///************ VER GRUPO  CONTROLLER ********************///
/////////////////////////////////////////////////////////////
app.controller('verGrupoCtrl', function($scope, $modalInstance, agendaService, citasGrupoInfo, utilsService, $q, $modal) {
    var clientes,psicologas,tarifas,salas;
	var initCitas = function(){
        var clientesPromise = agendaService.getClientesBD(),
        	psicologasPromise = agendaService.getPsicologasBD(),
            tarifasPromise = agendaService.getTarifasBD(),
            salasPromise = agendaService.getSalasBD();

        $q.all([clientesPromise,psicologasPromise,tarifasPromise,salasPromise]).then(function(dataArray){
            clientes = dataArray[0].data;
            psicologas = dataArray[1].data;
            tarifas = dataArray[2].data;
            salas = dataArray[3].data;
            //construir citas
            for (var i=0; i<$scope.citas.length; i++){
            	for (var j=0; j<clientes.length; j++){
            		if (clientes[j].id_cliente == $scope.citas[i].id_cliente){
            			$scope.citas[i].cliente=clientes[j];
            			j=1+clientes.length;
            		}
            	}
            	for (var j=0; j<psicologas.length; j++){
            		if (psicologas[j].id_personal == $scope.citas[i].id_personal){
            			$scope.citas[i].personal=psicologas[j];
            			j=1+psicologas.length;
            		}
            	}
            	for (var j=0; j<tarifas.length; j++){
            		if (tarifas[j].id_tarifa == $scope.citas[i].id_tarifa){
            			$scope.citas[i].tarifa=tarifas[j];
            			j=1+tarifas.length;
            		}
            	}
            }
        }); 
    }
    
    var init = function (){
    	//console.log(citasGrupoInfo);
    	$scope.citas=citasGrupoInfo;
    	$scope.grupo = citasGrupoInfo[0];
    	if (citasGrupoInfo.length==1)
    		$scope.last=false;
    	else
    		$scope.last=true;
    	initCitas();
    }
	   
	init();


    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }

	$scope.addPaciente = function(){
		//console.log("añadirPaciente");
		var auxCita = angular.copy(citasGrupoInfo[0]);
		auxCita.id_cliente = "";
		auxCita.id_tarifa = "";
		auxCita.id_personal = "";
		auxCita.fecha = new Date(auxCita.fecha);
		auxCita.grupo = "si";
		$scope.goCita(auxCita);
	}

	$scope.deshacerGrupo = function(){
		utilsService.alertModal("C","Deshacer Grupo","Deshacer el grupo convertira esta cita y las siguientes de la repeticion (si existe) en citas normales ¿Quieres Continuar?").then(function(response){
		    if (response){
				var auxCita = angular.copy(citasGrupoInfo[0]);
				auxCita.fecha = utilsService.parseFecha(auxCita.fecha,0);
				agendaService.deleteGrupoBD(auxCita).then(function(data){
					if (data.data == "true"){
						utilsService.alertModal("I","Grupo Eliminado","Grupo eliminado con éxito!!").then(function(response){
							$modalInstance.close();
						});
					}
				});
			}
		});

	}

	$scope.goCita = function(cita) {
        var extraInfo=1; //dummi
        var modalInstance = $modal.open({
            templateUrl: 'partials/agenda/agendaCita.html',
            controller: 'citaCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'lg',
            resolve: {
                citaInfo: function(){
                    return cita;
                },
                salasInfo: function(){
                    return salas;
                },
                psicologasInfo: function(){
                    return psicologas;
                },
                tarifasInfo: function(){
                    return tarifas;
                },
                extraInfo: function(){
                    return extraInfo;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            $modalInstance.close('');
            agendaService.verGrupo(cita);
        });
    };
});




/////////////////////////////////////////////////////////////
///************ ASUNTO PERSONALES  CONTROLLER ************///
/////////////////////////////////////////////////////////////
app.controller('asuntosPersonalesCtrl', function($scope, $modalInstance, agendaService, utilsService, $q, $modal, psicologasInfo, psicologaSelectedInfo, horaSelectedInfo, fechaSelectedInfo, horasArrayInfo) {
    
    $scope.horas = horasArrayInfo;
    $scope.psicologas=psicologasInfo;

    function calcularHorasDisponibles(){
    	for (var i=0; i<horasArrayInfo.length; i++){
    		if (horasArrayInfo[i] == $scope.asuntosPersonales.hora)
    			return horasArrayInfo.length-i;
    	}
    }

    $scope.changeHora = function(){
    	var totalHorasDisponibles = calcularHorasDisponibles();
    	$scope.cantHoras = [{"value":1,"desc":"1 Hora"}];
    	for (var i=0; i<totalHorasDisponibles; i++){
			$scope.cantHoras[i]={};
			var horasAux = i+1;
			$scope.cantHoras[i].value=horasAux;
			$scope.cantHoras[i].desc= horasAux+" Horas";
		}
    	$scope.asuntosPersonales.duracion = $scope.cantHoras[0];
    }

    var init = function (){
    	$scope.asuntosPersonales = {};
    	$scope.asuntosPersonales.psicologa = psicologaSelectedInfo;
    	$scope.asuntosPersonales.hora = angular.copy(horaSelectedInfo);
    	$scope.asuntosPersonales.fecha = angular.copy(fechaSelectedInfo);
    	$scope.asuntosPersonales.motivo = "";
    	$scope.changeHora();
    }
	   
	init();

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }

    $scope.accept = function(){
    	
    	var arrayAsuntos = [];
    	for (var i=0; i<$scope.asuntosPersonales.duracion.value; i++){
    		arrayAsuntos[i]={};
    		var hora = $scope.asuntosPersonales.hora.split(":");
    		arrayAsuntos[i].hora = parseInt(hora[0])+i;
    		arrayAsuntos[i].fecha = utilsService.parseFecha($scope.asuntosPersonales.fecha,0);
    		arrayAsuntos[i].motivo = $scope.asuntosPersonales.motivo;
    		arrayAsuntos[i].id_personal = $scope.asuntosPersonales.psicologa.id_personal;
    	}
    	console.log(arrayAsuntos);

    	agendaService.checkPersonalDisponibilidadBD(arrayAsuntos).then(function(response){
        		// 0:disponible , 1:psiciloga con cita , 2:psicologa con asuntoPersonal ya
        		var horasPersonalStatus = response.data;
        		console.log(horasPersonalStatus);
        		if (horasPersonalStatus.length>0){
        			var modalInstance = $modal.open({
			            templateUrl: "partials/agenda/asuntosPersonalesConfirmacion.html",
			            controller: "asuntosPersonalesConfirmacionCtrl",
			            backdrop: false,
			            size: 'md' ,
			            windowClass: 'transpModal modalConfirmacionReservaCita',
			            resolve: {
			                arrayAsuntosInfo: function(){
			                    return arrayAsuntos;
			                },
			                horasPersonalStatusInfo: function(){
			                    return horasPersonalStatus;
			                }
				        }
			        });
			        modalInstance.result.then(function(selectedItem){
			        	utilsService.alertModal("I","ASUNTOS PERSONALES...","Horas reservadas para asuntos personales con exito!!").then(function(response){
				            if (response)
				                $modalInstance.close();
				            else
				                console.log("cancelar");
				        });
			        	
			        });
        		}
        	});
    }

});



////////////////////////////////////////////////////////////////////////////////
///************ CONFIRMACION RESERVA HORAS ASUNTOS PERSONALES ***************///
////////////////////////////////////////////////////////////////////////////////
app.controller('asuntosPersonalesConfirmacionCtrl', function($scope, $modalInstance, agendaService, arrayAsuntosInfo, horasPersonalStatusInfo) {
    var textoConflicto = function(opcion){
    	var texto="";
    	switch(opcion){
    		case 1: texto="Profesional asignada a una cita, cancele o cambie de fecha la cita primero";
    				break;
    		case 2: texto="Ya hay una hora de asuntos personales reservada para esta Profesional";
    				break;
    	}
    	return texto;
    }

    $scope.asuntosPersonales = arrayAsuntosInfo;
    $scope.asuntosPersonalesTotal = arrayAsuntosInfo.length;
    $scope.asuntosPersonalesConflicto = [];
    $scope.conflicto=false;
    $scope.asuntosPersonalesCorrectas = [];

    var init = function (){
    	$scope.titulo="Confirmación de reserva de horas para Asuntos Personales";
    	var cont=0;
	    for (var i=0; i < horasPersonalStatusInfo.length; i++){
	    	arrayAsuntosInfo[i].hora2 = ""+(parseInt(arrayAsuntosInfo[i].hora)+1);
	    	if (horasPersonalStatusInfo[i] != 0){
	    		$scope.asuntosPersonalesConflicto[cont]=arrayAsuntosInfo[i];
	    		$scope.asuntosPersonalesConflicto[cont].conflicto=textoConflicto(horasPersonalStatusInfo[i]);
	    		cont++;
	    	}
	    	else
	    		$scope.asuntosPersonalesCorrectas.push(arrayAsuntosInfo[i]);
	    }
	    $scope.asuntosPersonalesConflictoTotal=$scope.asuntosPersonalesConflicto.length;
	    if ($scope.asuntosPersonalesConflictoTotal>0){
			$scope.conflicto=true;
			$scope.aceptoConflicto=false;
	    }
		else
			$scope.aceptoConflicto=true;	
    }
	   
	init();

	$scope.confirmar = function(){
		console.log("wii");
		agendaService.setAsuntosPersonalesBD($scope.asuntosPersonalesCorrectas).then(function(response){
			console.log(response.data);
			$modalInstance.close();
		});
	}

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }
});




////////////////////////////////////////////////////////////////////////////////
///************ EDIT/DELETE  RESERVA HORAS ASUNTOS PERSONALES ***************///
////////////////////////////////////////////////////////////////////////////////
app.controller('editAsuntosPersonalesCtrl', function($scope, $modalInstance, agendaService, asuntosPersonalesInfo, utilsService) {

    var init = function (){
    	console.log(asuntosPersonalesInfo);
    	$scope.asunto = asuntosPersonalesInfo;
    	$scope.asunto.fechaParseada = utilsService.parseFecha($scope.asunto.fecha,0);
    	$scope.asuntoSeleccionado = false;
    	agendaService.getAsuntosPersonalesAgrupadosBD($scope.asunto).then(function(response){
			$scope.asuntosPersonales = response.data;
		});
    }
	   
	init();

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    }


    $scope.delete = function(){
    	var asuntosDelete = {
    							horas : "",
    							fecha : $scope.asunto.fechaParseada,
    							id_personal : $scope.asunto.responsable.id_personal
    						};
    	asuntosDelete.horas="(0";
    	var numeroEliminadas = 0;
    	for (var i=0; i<$scope.asuntosPersonales.length;i++){
    		if ($scope.asuntosPersonales[i].check){
    			//asuntosDelete.horas.push($scope.asuntosPersonales[i].hora);
    			asuntosDelete.horas+=","+$scope.asuntosPersonales[i].hora;
    			numeroEliminadas++;
    		}
    	}
    	asuntosDelete.horas+=")";

		utilsService.alertModal("C","Eliminar asuntos personales...","Va a eliminar "+numeroEliminadas+" cita/s. ¿Desea continuar?").then(function(response){
		    if (response){
				agendaService.deleteAsuntosPersonalesBD(asuntosDelete).then(function(data){
					if (data.data){
						utilsService.alertModal("I","Asuntos propios eliminados","Asuntos propios eliminados con exito!!").then(function(response){
							$modalInstance.close();
						});
					}else
						alert("no se pudo borrar");
				});
			}
		});
    }

    $scope.check = function(asuntoPersonal){
    	$scope.asuntoSeleccionado = false;
    	for (var i=0; i<$scope.asuntosPersonales.length;i++){
    		if ($scope.asuntosPersonales[i].check)
    			$scope.asuntoSeleccionado=true;
    	}
    }
});