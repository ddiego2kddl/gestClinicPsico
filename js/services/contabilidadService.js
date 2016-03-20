'use strict';

app.service('contabilidadService', function($http,$q,utilsService,$modal,administrarService){
	this.getTarifasBD = function(){
        return $http.post('data/getTarifas.php');
    }

    this.setFacturaCitaBD = function(arrayFacturas){
    	return $http.post('data/contabilidad/setFacturaCita.php',arrayFacturas);
    }

    this.getCitasClienteTarifaBD = function(factura){
        return $http.post('data/contabilidad/getCitasClienteTarifa.php',factura);
    }

    this.getCitasFacturaBD = function(id_factura){
        return $http.post('data/contabilidad/getCitasFactura.php',id_factura);
    }

    this.getRangosFacturasBD = function(){
        return $http.post('data/contabilidad/getRangosFacturas.php');
    }
    
    this.getFacturasPorRangoBD = function(params){
        return $http.post('data/contabilidad/getFacturasPorRango.php',params);
    }

    this.getFacturasAllBD = function(){
        return $http.post('data/contabilidad/getFacturasAll.php');
    }

    this.getFacturaIdBD = function(id_factura){
        return $http.post('data/contabilidad/getFacturaID.php',id_factura);
    }

    this.getFacturaCobrosBD = function(id_factura){
        return $http.post('data/contabilidad/getFacutraCobros.php',id_factura);
    }

    this.getConceptoTarifaIdBD = function(id_factura){
        return $http.post('data/contabilidad/getConceptoTarifaId.php',id_factura);
    }

    this.updateFacturaBD = function(factura){
        return $http.post('data/contabilidad/updateFactura.php',factura);
    }

    this.anularFacturaBD = function(id_factura){
        return $http.post('data/contabilidad/anularFactura.php',id_factura);
    }

    this.cobrarFacturaBD = function(factura){
        return $http.post('data/contabilidad/cobrarFactura.php',factura);
    }

    this.deleteCobroBD = function(cobro){
        return $http.post('data/contabilidad/deleteCobro.php',cobro);
    }

    this.getCitasSinFacturarBD = function(fecha){
        return $http.post('data/contabilidad/getCitasSinFacturar.php',fecha);
    }

    this.getFacturasClienteBD = function(id_cliente){
        return $http.post('data/contabilidad/getFacturasCliente.php',id_cliente);
    }

    //abrir modal de ver factura
    this.showFactura = function(id_factura){
        var deferred = $q.defer();
        this.getFacturaIdBD(id_factura).then(function(data){
            var modalInstance = $modal.open({
                    templateUrl: 'partials/contabilidad/showFactura.html',
                    controller: 'showFacturaCtrl',
                    backdrop: false,
                    windowClass: 'transpModal', 
                    size: 'md',
                    resolve: {
                        facturaInfo: function(){
                            return data.data[0];
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem){
                    deferred.resolve(true);
                },function(){
                    deferred.resolve(false);
                });
            return deferred.promise;
        });
        return deferred.promise;
    }

    //para abrir modal de generar gacturar desde cualquier lado
    this.setFacturaCita = function(cita){
    	var deferred = $q.defer();
        var modalInstance = $modal.open({
                templateUrl: 'partials/contabilidad/generarFacturaCita.html',
                controller: 'generarFacturaCitaCtrl',
                backdrop: false,
                windowClass: 'transpModal', 
                size: 'md',
                resolve: {
                    citaInfo: function(){
                        return cita;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem){
                deferred.resolve(true);
            },function(){
                deferred.resolve(false);
            });
        return deferred.promise;
    }

    //devolver total conceptos con sus precios calculados
    this.makeFactura = function(citas,bonos,tarifas){
        //sort por id_tarifa
        citas.sort(function(a,b){return b.id_tarifa-a.id_tarifa});
        //agrupo en tarifasTotales las citas por tarifas, con el numero de repeticiones de las mismas
        var tarifasTotales = [];
        var auxTarifa = citas[0].id_tarifa;
        var mesCita = new Date(citas[0].fecha);
        var auxMes = mesCita.getMonth();
        var cont=0;

        for(var i = 0; i < citas.length; ++i) {
            mesCita = new Date(citas[i].fecha);
            //console.log(mesCita.getMonth());
            if(auxTarifa == citas[i].id_tarifa && auxMes == mesCita.getMonth()){
                cont++;
            }
            else{
                var aux={};
                aux.id_tarifa = auxTarifa;
                aux.cont = cont;
                tarifasTotales.push(aux);
                auxTarifa = citas[i].id_tarifa;
                auxMes = mesCita.getMonth();
                cont=1;
            }
        }

        var aux={};
        aux.id_tarifa = auxTarifa;
        aux.cont = cont;
        tarifasTotales.push(aux);

        //ver que tipo de tarifas tengo, y si tienen bono
        var conceptosArray = [];
        for (var i=0; i<tarifasTotales.length; i++){
            var auxConcepto = {};
            for (var j=0; j<tarifas.length; j++){
                if (tarifasTotales[i].id_tarifa == tarifas[j].id_tarifa){ //busco la tarifa que es
                    if (tarifas[j].id_bono != null){ ////COMPRUEBO SI TIENE BONO 
                        for (var k=0; k<bonos.length;k++){
                            if (bonos[k].id_bono == tarifas[j].id_bono){ 
                                if (bonos[k].cantidad > tarifasTotales[i].cont){
                                    ///  ¡¡¡ OJO AQUI VIENE LA MOVIDA HEAVY !!! ////
                                    conceptosArray.push(calcularPrecioBono(tarifasTotales[i].cont,bonos[k],bonos))
                                }
                                else{
                                    auxConcepto.descripcion = tarifas[j].descripcion;
                                    auxConcepto.precio = bonos[k].precio;
                                    auxConcepto.count = 1;
                                    auxConcepto.detalle = "Tarifa Bono completo: "+bonos[k].acronimo;
                                    conceptosArray.push(auxConcepto);
                                }
                                k=bonos.length+1;
                            }
                        }
                    }
                    else{ //si no tiene bono
                        auxConcepto.descripcion = tarifas[j].descripcion;
                        auxConcepto.precio = parseFloat(tarifas[j].precio)*parseFloat(tarifasTotales[i].cont);
                        auxConcepto.count = tarifasTotales[i].cont;
                        auxConcepto.detalle = "Tarifa Directa";
                        conceptosArray.push(auxConcepto);
                    }
                    j=tarifas.length+1;
                }
            }
        }

        var auxTotal=0;
        for (var i=0;i<conceptosArray.length;i++){
            auxTotal+=parseFloat(conceptosArray[i].precio);
        }

        //conceptosArray[0].importeTotal=auxTotal;

        //return conceptosArray;

        var auxFactura = {};
        auxFactura.conceptos=conceptosArray;
        auxFactura.importe = auxTotal;
        auxFactura.citas = citas;
        auxFactura.id_cliente = citas[0].id_cliente;
        auxFactura.fecha2 = utilsService.parseFecha(new Date(),0);

        return auxFactura;
    }

    //calcular precio del bono, por si se dan menos repeticiones de las minimas
    var calcularPrecioBono = function(numTotal,bonoSelected,bonos){
        var auxTotalCitas = 1;
        var contBonos=0;

        while (numTotal > bonos[contBonos].cantidad){
                contBonos++;
        }

        var auxConcepto = {};

        auxConcepto.descripcion = bonoSelected.descripcion;
        auxConcepto.precio = parseFloat(bonos[contBonos].precio) / parseFloat(bonos[contBonos].cantidad) * numTotal;
        auxConcepto.count = numTotal+"/"+bonoSelected.cantidad;
        auxConcepto.detalle = "Tarifa Bono parcial: "+bonoSelected.acronimo;

        return auxConcepto;
    }


    this.generarFacturas = function(){
        var deferred = $q.defer();

        var facturasArray=[];
        var citasBD = this.getCitasSinFacturarBD(utilsService.parseFecha(new Date(),0)),   //obtener las fechas sin facturar hasta el mes de la fecha actual
            bonosBD = administrarService.getTarifasBonosBD(),
            tarifasBD = this.getTarifasBD();

        var functionMakeFactura = this.makeFactura;

        //console.log("generarFactura2");

        $q.all([citasBD,bonosBD,tarifasBD]).then(function(dataArray){
            if (dataArray[0].data.length <= 0){

            }else{
            var citas = (dataArray[0].data);
            var auxCitasArray = [];
            var auxCliente = citas[0].id_cliente;
            citas[0].fecha2 = utilsService.parseFecha(citas[0].fecha,0);
            auxCitasArray.push(citas[0]);

            for (var i=1;i<citas.length; i++){
                citas[i].fecha2 = utilsService.parseFecha(citas[i].fecha,0);
                if (citas[i].id_cliente != auxCliente){
                    facturasArray.push(functionMakeFactura(auxCitasArray,dataArray[1].data,dataArray[2].data));
                    auxCliente=citas[i].id_cliente;
                    auxCitasArray=[];
                    auxCitasArray.push(citas[i]);
                }
                else{
                    auxCitasArray.push(citas[i]);
                }
            }
            facturasArray.push(functionMakeFactura(auxCitasArray,dataArray[1].data,dataArray[2].data));

            }
            deferred.resolve(facturasArray);
        });

        return deferred.promise;
    }


});


