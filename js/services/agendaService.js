'use strict'

app.service('agendaService', function (utilsService,$http,$rootScope,$q,$modal) {
    var horas = ['8:00-9:00','9:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00','17:00-18:00','18:00-19:00','19:00-20:00','20:00-21:00'];
    var mesesAño = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    this.getHoras = function(){
        return horas;
    }
    //********* TARIFAS *********
    this.getTarifasBD = function(){
        return $http.post('data/getTarifas.php');
    }
    //********* CLIENTES *********
    this.getClientesBD = function(){
        return $http.post('data/clientes/getClientes.php');
    }
    //********* CITAS *********
    this.getCitasIntervaloBD= function(firstDay,lastDay){
        var fechas = [firstDay,lastDay];
        return $http.post('data/agenda/getCitas.php',fechas);
    }
    //********* TIPO VISTAS *********   //implementar que lo coja de la base de datos
    var tipoVistas=[{"desc":"Semana / Sala","id":"0"},{"desc":"Semana / Profesional","id":"1"},{"desc":"Mes / Sala","id":"2"},{"desc":"Mes / Profesional","id":"3"},{"desc":"Salas / Dia","id":"4"}];
    this.getTipoVistas=function(){
        return tipoVistas;
    }
    //********* PSICOLOGAS *********   //implementar que lo coja de la base de datos con restriccion a los campos
    var psicologasBD=[{"desc":"Laura","id":"0"},{"desc":"Sonia","id":"1"},{"desc":"Blanca","id":"2"},{"desc":"Clara","id":"3"}];
    this.getPsicologasBD=function(){
        return $http.post('data/agenda/getPersonalRestringido.php');
    }

    //psicologas incluyendo las de baja, para el listado de citas
    this.getPsicologasBD1=function(){
        return $http.post('data/agenda/getPersonalRestringidoIncluidoBajas.php');
    }
    //********* SALAS *********   //implementar que lo coja de la base de datos 
    this.getSalasBD=function(){
        return $http.post('data/getSalas.php');
    }
    //***** checkCitasBD --> devuelve un array de valores por si sala, psicologa o paciente estan ocupados
    this.checkCitaBD = function(arrayCitas){
        return $http.post('data/agenda/checkCita.php',arrayCitas);
    }

    this.setCitasBD = function(citasCorrectas){
        return $http.post('data/agenda/setCitas.php',citasCorrectas);
    }

    this.getRepeticionBD = function(id_repeticion){
        return $http.post('data/agenda/getRepeticion.php',id_repeticion);
    }

    this.getCitasRepeticionBD = function(id_repeticion){
        return $http.post('data/agenda/getCitasRepeticion.php',id_repeticion);
    }

    this.deleteCitasBD = function(citasToDelete){
        return $http.post('data/agenda/deleteCitas.php',citasToDelete);
    }

    this.deleteOneCitaBD = function(cita){
        return $http.post('data/agenda/deleteOneCita.php',cita);
    }

    this.updateCitaBD = function(cita){
        return $http.post('data/agenda/updateCita.php',cita);
    }

    this.updateCitasBD = function(arrayCitas){
        return $http.post('data/agenda/updateCitas.php',arrayCitas);
    }

    this.setFestivoBD = function(fecha,razon){
        var festivo = {"fecha":fecha,"razon":razon};
        return $http.post('data/agenda/setFestivo.php',festivo);
    }

    this.deleteFestivoBD = function(fecha){
        var festivo = {"fecha":fecha};
        return $http.post('data/agenda/deleteFestivo.php',festivo);
    }

    this.getFestivosIntervaloBD = function(fechaInicial,fechaFinal){
        var festivo = {"fechaInicial":fechaInicial,"fechaFinal":fechaFinal};
        return $http.post('data/agenda/getFestivosIntervalo.php',festivo);
    }

    this.updateFestivoBD = function(fecha,razon){
        var festivo = {"fecha":fecha,"razon":razon};
        return $http.post('data/agenda/updateFestivo.php',festivo);
    }

    this.updateColoresPersonalBD = function(arrayPsicologas){
        return $http.post('data/administracion/updateColorPersonal.php',arrayPsicologas);
    }

    this.setGrupoBD = function(arrayCitas){
        return $http.post('data/agenda/grupo/setGrupo.php',arrayCitas);
    }

    this.getCitasGrupoBD = function(masterCita){
        return $http.post('data/agenda/grupo/getCitasGrupo.php',masterCita);
    }

    this.deleteGrupoBD = function(cita){
        return $http.post('data/agenda/grupo/deleteGrupo.php',cita);
    }

    //***** ASUNTOS PERSONALES
    this.checkPersonalDisponibilidadBD = function(arrayAsuntos){
        return $http.post('data/agenda/asuntosPersonales/checkPersonalDisponibilidad.php',arrayAsuntos);
    }

    this.setAsuntosPersonalesBD = function(arrayAsuntos){
        return $http.post('data/agenda/asuntosPersonales/setAsuntosPersonales.php',arrayAsuntos);
    }

    this.getAsuntosPersonalesIntervaloBD = function(firstDay,lastDay){
        var fechas = [firstDay,lastDay];
        return $http.post('data/agenda/asuntosPersonales/getAsuntosPersonales.php',fechas);
    }

    this.getAsuntosPersonalesAgrupadosBD = function(asunto){
        return $http.post('data/agenda/asuntosPersonales/getAsuntosPersonalesDiaPsicologa.php',asunto);
    }

    this.deleteAsuntosPersonalesBD = function(asuntosDelete){
        return $http.post('data/agenda/asuntosPersonales/deleteAsuntosPersonales.php',asuntosDelete);
    }

    

    //************* MES -->  (this.getMes, this.makeArrayMes, this.makeCitas) ***************
    this.getMes = function(numMes){
        var mes = [];
        var fechaSelected = new Date();
        fechaSelected.setDate(1);

        if (numMes<0){ 
            for (numMes;numMes<0;numMes++){
                fechaSelected = utilsService.addDays2(fechaSelected,-1);
                fechaSelected.setDate(1);
            }
        }
        else if (numMes>0){
            for (numMes;numMes>0;numMes--){
                fechaSelected = utilsService.addDays2(fechaSelected,35);
                fechaSelected.setDate(1);
            }
        }
        if (fechaSelected.getDay() !=6)
            var firstDay = utilsService.addDays2(fechaSelected,-fechaSelected.getDay()+1);
        else 
            var firstDay = utilsService.addDays2(fechaSelected,2);

        var mesSelected = fechaSelected.getMonth();

        //se dan 3 casos; que esta por detras, que son iguales, o que es diciembre y enero, diferencia 11
        while (firstDay.getMonth() == mesSelected || mesSelected-firstDay.getMonth() == -11 || mesSelected-firstDay.getMonth() == 1){
            while (firstDay.getDay() > 0 && firstDay.getDay() < 6){
                mes.push(firstDay);
                firstDay = utilsService.addDays2(firstDay,1);
            }
            firstDay = utilsService.addDays2(firstDay,1);
        }
        return mes;
    }

    this.makeArrayMes = function(mes,citasBD,clientesBD,tarifasBD,op,id_extra,salas,psicologas,festivo,asuntosPersonales){
        //construyo los encabezados de los dias - los titulos de las cajas
        for (var i=0;i<mes.length;i++){
            mes[i].citas=[];
            mes[i].fecha=mes[i].getDate() + " - " + mesesAño[mes[i].getMonth()] + " - " + mes[i].getFullYear();
            mes[i].festivo=false;
        }


       for (var i=0;i<citasBD.length;i++){
            var j=0;
            if (parseInt(citasBD[i].hora)>0) //las que sean menor, son citas anuladas
            while (j < mes.length){
                //busco si coinciden - y parseo los campos raro // NOTA AÑADIR SALA MAS ADELANTE
                if ((op==3 && id_extra.id_personal == citasBD[i].id_personal) || (op==2 && id_extra.id_sala == citasBD[i].id_sala))
                if ((utilsService.parseFecha(mes[j],0) == citasBD[i].fecha)){    /// FESTIVOCHECK
                    mes[j].citas.push(makeCitas(citasBD[i],clientesBD,tarifasBD,op,salas,psicologas));
                    j= mes.length;
                }
                j++;
            }
        }

        //AÑADIR ASUNTOS PERSONALES
        //si es la opcion 3, entonces es la vista de psicologoMES
        if (op==3){
            //for recorrer todo el array de asuntospersonales
            for (var i=0; i<asuntosPersonales.length; i++){
                //solo compruebo los asuntos de la id del personal elegido
                if (id_extra.id_personal == asuntosPersonales[i].id_personal){
                    for (var j=0; j<mes.length; j++){
                        //si coinciden fecha.parseadas y la hora, entonces asignar
                        //console.log(utilsService.parseFecha(mes[j],0)+ "== "+ utilsService.parseFecha(asuntosPersonales[i].fecha,0));
                        if (mes[j]!=null)
                            if (utilsService.parseFecha(new Date(mes[j]),0) == utilsService.parseFecha(asuntosPersonales[i].fecha,0)){
                                var aux={};
                                aux = asuntosPersonales[i];
                                aux.motivo = asuntosPersonales[i].motivo;
                                aux.color="grey";
                                var horaSiguiente = parseInt(asuntosPersonales[i].hora)+1;
                                aux.extra=asuntosPersonales[i].hora+"h-"+horaSiguiente+"h - "+asuntosPersonales[i].motivo;
                                aux.asuntosPersonales=true;
                                aux.responsable = returnPsicologa(asuntosPersonales[i].id_personal, psicologas);
                                mes[j].citas.push(aux);
                                j=mes.length+1;
                            }
                    }
                }
            }
        }
        console.log(mes);

        //checkea festivos, y los anula
        for (var j=0;j<festivo.length;j++){
            for (var i=0;i<mes[i];i++)
            if (festivo[j].fecha == utilsService.parseFecha(mes[i],0)){
                mes[i].festivo=true;
                var citaFestiva = {"extra":"--------","color":"grey","festivo":true};
                mes[i].citas = [];
                mes[i].citas.push(angular.copy(citaFestiva));
                mes[i].citas.push(angular.copy(citaFestiva));
                citaFestiva = {"extra":festivo[j].razon,"color":"grey","festivo":true};
                mes[i].citas.push(angular.copy(citaFestiva));
                citaFestiva = {"extra":"--------","color":"grey","festivo":true};
                mes[i].citas.push(angular.copy(citaFestiva));
                mes[i].citas.push(angular.copy(citaFestiva));
                i=mes.length+1;
            }
        }

        for (var i=0; i<mes.length; i++){
            //ordenar las citas por horas
            mes[i].citas.sort(function(a,b){
                return parseInt(a.hora) > parseInt(b.hora);
            })/*
            //eliminar duplicados de grupo
            for (var j=0; j+1<mes[i].citas.length; j++){
                if (parseInt(mes[i].citas[j].hora) == parseInt(mes[i].citas[j+1].hora)){

                }
            }*/
        }
        
        return (mes);
    }

    var makeCitas = function (cita,clientesBD,tarifasBD,op,salas,psicologasBD){
            cita.extra = "";
            if (op==2 || op ==3)
                cita.extra = cita.hora + "h-" + (parseInt(cita.hora)+1) + "h ";
            if (op==1 || op==3){ //para añadir el acronimo de sala en caso de vista por personal
                for (var j=0;j<salas.length;j++){
                    if (cita.id_sala == salas[j].id_sala){
                        cita.extra += '(' + salas[j].acronimo+ ') ';
                    }
                }
            }
            if (cita.grupo=="no"){
                for (var j=0; j<tarifasBD.length;j++){ //para añadir acronimo de tarifa
                    if (cita.id_tarifa == tarifasBD[j].id_tarifa){
                        cita.tarifa = tarifasBD[j];
                        cita.extra += '(' + tarifasBD[j].acronimo+ ') ';
                        j = tarifasBD.length+1;
                    }
                }  
                for (var j=0; j<clientesBD.length;j++){//añadir nombre de cliente
                    if (cita.id_cliente == clientesBD[j].id_cliente){
                        cita.cliente = clientesBD[j];
                        cita.extra += clientesBD[j].nombrePaciente+ ' '+ clientesBD[j].apellidosPaciente;
                        j= clientesBD.length+1;
                    }
                }
            }
            else
                cita.extra+= "*GRUPO*";

            for (var j=0;j<psicologasBD.length;j++){
                if (cita.id_personal == psicologasBD[j].id_personal){
                    cita.color = psicologasBD[j].color;
                    j= psicologasBD.length+1;
                }
            }
        return cita;
    }

    function returnPsicologa(id_psicologa,psicologaArray){
        for (var i=0; i<psicologaArray.length; i++){
            if (id_psicologa == psicologaArray[i].id_personal)
                return psicologaArray[i];
        }
        return null;
    }

    //********* SEMANA *********
    this.getSemana=function(numSemana){
        var semana = utilsService.semanaActual(numSemana);
        var auxSemana = [];
        for (var i=0; i<5;i++){
            auxSemana[i]={};
            auxSemana[i].desc=(utilsService.parseFecha(semana[i],1));
            auxSemana[i].fecha=semana[i];
        }
        return auxSemana;
    }

    /***** make array Semana ****/
    this.makeArraySemana = function(semana,citasBD,clientesBD,tarifasBD,op,id_extra,salas,psicologas,festivos,asuntosPersonales){
        var citasMostradas =  horasSemana(semana);
        var arrayPosiciones=[];
        for (var i=0;i<citasBD.length;i++){
            var j=0;
            while (j < citasMostradas.length){
                //busco si coinciden - y parseo los campos raro // NOTA AÑADIR SALA MAS ADELANTE
                if (id_extra!=null && citasBD[i]!=null)//antinulls!!
                    if ((op==1 && id_extra.id_personal == citasBD[i].id_personal) || (op==0 && id_extra.id_sala == citasBD[i].id_sala))
                        if ((utilsService.parseFecha(citasMostradas[j].fecha,0) == citasBD[i].fecha) && (citasMostradas[j].hora == citasBD[i].hora)){ //FESTIVOCHECK
                            var id = citasMostradas[j].id;
                            utilsService.updateObject(citasMostradas[j],citasBD[i]);
                            citasMostradas[j].fecha= new Date(citasMostradas[j].fecha);
                            citasMostradas[j].id = parseInt(id);
                            citasMostradas[j].hora = parseInt(citasMostradas[j].hora);
                            arrayPosiciones.push(j);
                            j= citasMostradas.length;
                        }
                j++;
            }
        }

        //AÑADIR ASUNTOS PERSONALES
        //si es la opcion 1, entonces es la vista de psicologo
        if (op==1){
            //for recorrer todo el array de asuntospersonales
            for (var i=0; i<asuntosPersonales.length; i++){
                //solo compruebo los asuntos de la id del personal elegido
                if (id_extra.id_personal == asuntosPersonales[i].id_personal){
                    for (var j=0; j<citasMostradas.length; j++)
                        //si coinciden fecha.parseadas y la hora, entonces asignar
                        if (utilsService.parseFecha(citasMostradas[j].fecha,0) == utilsService.parseFecha(asuntosPersonales[i].fecha,0) && citasMostradas[j].hora == asuntosPersonales[i].hora){
                            citasMostradas[j].color="grey";
                            citasMostradas[j].motivo = asuntosPersonales[i].motivo;
                            citasMostradas[j].responsable = returnPsicologa(asuntosPersonales[i].id_personal, psicologas);
                            citasMostradas[j].extra=asuntosPersonales[i].motivo;
                            citasMostradas[j].asuntosPersonales=true;
                            j=citasMostradas.length+1;
                        }
                }
            }
        }
        

        var auxCitasDef = rejillaHorasSemana(citasMostradas,arrayPosiciones,clientesBD,tarifasBD,op,salas,psicologas);
        // DIAS FESTIVOS
        for (var i=0; i<festivos.length; i++){
            if (utilsService.parseFecha(auxCitasDef[0].lunes.fecha,0) == festivos[i].fecha){ //compruebo el lunes
                for (var j=0; j<auxCitasDef.length; j++){
                    auxCitasDef[j].lunes.extra = festivos[i].razon;
                    auxCitasDef[j].lunes.color = "grey";
                    auxCitasDef[j].lunes.festivo = true;
                }
            }
            else if (utilsService.parseFecha(auxCitasDef[0].martes.fecha,0) == festivos[i].fecha){ //compruebo el martes
                for (var j=0; j<auxCitasDef.length; j++){
                    auxCitasDef[j].martes.extra = festivos[i].razon;
                    auxCitasDef[j].martes.color = "grey";
                    auxCitasDef[j].martes.festivo = true;
                }
            }
            else if (utilsService.parseFecha(auxCitasDef[0].miercoles.fecha,0) == festivos[i].fecha){ //compruebo el miercoles
                for (var j=0; j<auxCitasDef.length; j++){
                    auxCitasDef[j].miercoles.extra = festivos[i].razon;
                    auxCitasDef[j].miercoles.color = "grey";
                    auxCitasDef[j].miercoles.festivo = true;
                }
            }                                               
            else if (utilsService.parseFecha(auxCitasDef[0].sabado.fecha,0) == festivos[i].fecha){ //compruebo el sabado que es jueves, error no se pq
                for (var j=0; j<auxCitasDef.length; j++){
                    auxCitasDef[j].sabado.extra = festivos[i].razon;
                    auxCitasDef[j].sabado.color = "grey";
                    auxCitasDef[j].sabado.festivo = true;
                }
            }
            else if (utilsService.parseFecha(auxCitasDef[0].viernes.fecha,0) == festivos[i].fecha){ //compruebo el viernes
                for (var j=0; j<auxCitasDef.length; j++){
                    auxCitasDef[j].viernes.extra = festivos[i].razon;
                    auxCitasDef[j].viernes.color = "grey";
                    auxCitasDef[j].viernes.festivo = true;
                }
            }
        }
        return auxCitasDef;
    }

    //creo el array base de objetos citas vacios, antes de meter intercambiar los que existen por los que encuentren en la BD
    var horasSemana = function (semana){
        var citasMostradas = [];
        //var auxId=0;
        for (var i=0; i<13; i++){
            var auxCita= {fecha:'',hora:0, id:0};
            auxCita.hora = i+8;

            for (var j=0;j<5;j++){
                auxCita.fecha = semana[j].fecha;
                //auxCita.id = auxId;
                citasMostradas.push(new Citas(auxCita,1));
                //auxId++;
            }
        }
        
        return citasMostradas;
    }

    //array de los objetos que muestro    *******ATENTO A ESTA FUNCION QUE SE PUEDE REUTILIZAR LA MITAD CREO********
    var rejillaHorasSemana = function (citasMostradas,arrayPosiciones,clientesBD,tarifasBD,op,salas,psicologasBD){
        for (var i=0; i<arrayPosiciones.length;i++){
            if (citasMostradas[arrayPosiciones[i]].grupo=='no'){
                if (op==1){ //para añadir el acronimo de sala en caso de vista por personal
                    for (var j=0;j<salas.length;j++){
                        if (citasMostradas[arrayPosiciones[i]].id_sala == salas[j].id_sala){
                            citasMostradas[arrayPosiciones[i]].extra = '(' + salas[j].acronimo+ ') ';
                        }
                    }
                }
                else
                    citasMostradas[arrayPosiciones[i]].extra = "";
                for (var j=0; j<tarifasBD.length;j++){ //para añadir acronimo de tarifa
                    if (citasMostradas[arrayPosiciones[i]].id_tarifa == tarifasBD[j].id_tarifa){
                        citasMostradas[arrayPosiciones[i]].tarifa = tarifasBD[j];
                        citasMostradas[arrayPosiciones[i]].extra += '(' + tarifasBD[j].acronimo+ ') ';
                        j= tarifasBD.length+1;
                    }
                }  
                for (var j=0; j<clientesBD.length;j++){//añadir nombre de cliente
                    if (citasMostradas[arrayPosiciones[i]].id_cliente == clientesBD[j].id_cliente){
                        citasMostradas[arrayPosiciones[i]].cliente = clientesBD[j];
                        citasMostradas[arrayPosiciones[i]].extra += clientesBD[j].nombrePaciente+ ' '+ clientesBD[j].apellidosPaciente;
                        j= clientesBD.length+1;
                    }
                }
            }
            else{
                citasMostradas[arrayPosiciones[i]].extra = "*GRUPO*";
            }

            for (var j=0;j<psicologasBD.length;j++){
                if (citasMostradas[arrayPosiciones[i]].id_personal == psicologasBD[j].id_personal){
                    citasMostradas[arrayPosiciones[i]].color = psicologasBD[j].color;
                    j= psicologasBD.length+1;
                }
            }
       }


        //crearme un array auxiliar donde meter todo estoo meterle nuevos atributos a citasMostradas
        var aux = [{extra:'8:00-9:00'},{extra:'9:00-10:00'},{extra:'10:00-11:00'},{extra:'11:00-12:00'},{extra:'12:00-13:00'},{extra:'13:00-14:00'}
                    ,{extra:'14:00-15:00'},{extra:'15:00-16:00'},{extra:'16:00-17:00'},{extra:'17:00-18:00'},{extra:'18:00-19:00'},{extra:'19:00-20:00'},{extra:'20:00-21:00'}];
        return [
            {hour:aux[0], lunes: citasMostradas[0], martes:citasMostradas[1], miercoles:citasMostradas[2], sabado:citasMostradas[3],viernes:citasMostradas[4],xhour2:aux[0]},
            {hour:aux[1], lunes: citasMostradas[5], martes:citasMostradas[6], miercoles:citasMostradas[7], sabado:citasMostradas[8],viernes:citasMostradas[9],xhour2:aux[1]},
            {hour:aux[2], lunes: citasMostradas[10], martes:citasMostradas[11], miercoles:citasMostradas[12], sabado:citasMostradas[13],viernes:citasMostradas[14],xhour2:aux[2]},
            {hour:aux[3], lunes: citasMostradas[15], martes:citasMostradas[16], miercoles:citasMostradas[17], sabado:citasMostradas[18],viernes:citasMostradas[19],xhour2:aux[3]},
            {hour:aux[4], lunes: citasMostradas[20], martes:citasMostradas[21], miercoles:citasMostradas[22], sabado:citasMostradas[23],viernes:citasMostradas[24],xhour2:aux[4]},
            {hour:aux[5], lunes: citasMostradas[25], martes:citasMostradas[26], miercoles:citasMostradas[27], sabado:citasMostradas[28],viernes:citasMostradas[29],xhour2:aux[5]},
            {hour:aux[6], lunes: citasMostradas[30], martes:citasMostradas[31], miercoles:citasMostradas[32], sabado:citasMostradas[33],viernes:citasMostradas[34],xhour2:aux[6]},
            {hour:aux[7], lunes: citasMostradas[35], martes:citasMostradas[36], miercoles:citasMostradas[37], sabado:citasMostradas[38],viernes:citasMostradas[39],xhour2:aux[7]},
            {hour:aux[8], lunes: citasMostradas[40], martes:citasMostradas[41], miercoles:citasMostradas[42], sabado:citasMostradas[43],viernes:citasMostradas[44],xhour2:aux[8]},
            {hour:aux[9], lunes: citasMostradas[45], martes:citasMostradas[46], miercoles:citasMostradas[47], sabado:citasMostradas[48],viernes:citasMostradas[49],xhour2:aux[9]},
            {hour:aux[10], lunes: citasMostradas[50], martes:citasMostradas[51], miercoles:citasMostradas[52], sabado:citasMostradas[53],viernes:citasMostradas[54],xhour2:aux[10]},
            {hour:aux[11], lunes: citasMostradas[55], martes:citasMostradas[56], miercoles:citasMostradas[57], sabado:citasMostradas[58],viernes:citasMostradas[59],xhour2:aux[11]},
            {hour:aux[12], lunes: citasMostradas[60], martes:citasMostradas[61], miercoles:citasMostradas[62], sabado:citasMostradas[63],viernes:citasMostradas[64],xhour2:aux[12]}
        ];
    }



    //constructor de citas
    var Citas =function (citaXHR , op){
        this.fecha = citaXHR.fecha;
        this.hora = citaXHR.hora;
        this.extra = '';
        if (op==4){ //desde vista Dia/Sala
            this.id_sala = citaXHR.id_sala;
            this.id_cliente = '';
            this.id_personal = '';
            this.observaciones = '';
            this.id_tarifa = '';
            this.id_repeticion = null;
            this.id_factura = null;
            this.grupo = 'no';
        }
        else if (op != 1){
            this.id_sala = citaXHR.id_sala;
            this.id_cliente = citaXHR.id_cliente;
            this.id_personal = citaXHR.id_personal;
            this.observaciones = citaXHR.observaciones;
            this.id_tarifa = citaXHR.id_tarifa;
            this.id_repeticion = citaXHR.id_repeticion;
            this.id_factura = citaXHR.id_factura;
            this.grupo = citaXHR.grupo;
        }
        else{
            this.id_sala = ''
            this.id_cliente = '';
            this.id_personal = '';
            this.observaciones = '';
            this.id_tarifa = '';
            this.id_repeticion = null;
            this.id_factura = null;
            this.grupo = 'no';
        }
    }




    ////////////////////////////////
    ///////////// DIA //////////////
    ////////////////////////////////
    this.makeArrayDia = function(fecha,citasBD,clientesBD,tarifasBD,salasBD,psicologas,festivos){
        var citasMostradas =  horasDia(fecha,salasBD);
        
        if (festivos.length>0){ //si es festivo no calculo nada
            var auxFestivo={};
            auxFestivo.festivo = true;
            auxFestivo.extra = festivos[0].razon;
            auxFestivo.color = "grey";
            for (var i=0; i<citasMostradas.length;i++)
                citasMostradas[i]=auxFestivo;
        }
        else{  //si es lectivo paso a hacerlo todo
            var arrayPosiciones=[];
            for (var i=0;i<citasBD.length;i++){
                var j=0;
                while (j < citasMostradas.length){
                    if ((citasMostradas[j].id_sala == citasBD[i].id_sala) && (citasMostradas[j].hora == citasBD[i].hora)){ //FESTIVOCHECK
                        utilsService.updateObject(citasMostradas[j],citasBD[i]);
                        citasMostradas[j].fecha= new Date(citasMostradas[j].fecha);
                        citasMostradas[j].hora = parseInt(citasMostradas[j].hora);
                        arrayPosiciones.push(j);
                        j= citasMostradas.length;
                    }
                    j++;
                }
            }
            citasMostradas = cruzarCitasDia(citasMostradas,arrayPosiciones,clientesBD,tarifasBD,psicologas);
        }

        return rejillaHorasDia(citasMostradas,salasBD);
    }

    //creo el array base de objetos citas vacios, antes de meter intercambiar los que existen por los que encuentren en la BD
    var horasDia = function (fecha,salasBD){
        var citasMostradas = [];
        for (var i=0; i<13; i++){
            var auxCita= {fecha:'',hora:0, id:0};
            auxCita.hora = i+8;
            auxCita.fecha = fecha;

            for (var j=0;j<salasBD.length;j++){
                auxCita.id_sala = salasBD[j].id_sala;
                citasMostradas.push(new Citas(auxCita,4));
            }
        }
        return citasMostradas;
    }

    var cruzarCitasDia = function(citasMostradas,arrayPosiciones,clientesBD,tarifasBD,psicologasBD){
        for (var i=0; i<arrayPosiciones.length;i++){
            if (citasMostradas[arrayPosiciones[i]].grupo=='no'){
                for (var j=0; j<tarifasBD.length;j++){ //para añadir acronimo de tarifa
                    if (citasMostradas[arrayPosiciones[i]].id_tarifa == tarifasBD[j].id_tarifa){
                        citasMostradas[arrayPosiciones[i]].tarifa = tarifasBD[j];
                        citasMostradas[arrayPosiciones[i]].extra = '(' + tarifasBD[j].acronimo+ ') ';
                        j= tarifasBD.length+1;
                    }
                }  
                for (var j=0; j<clientesBD.length;j++){//añadir nombre de cliente
                    if (citasMostradas[arrayPosiciones[i]].id_cliente == clientesBD[j].id_cliente){
                        citasMostradas[arrayPosiciones[i]].cliente = clientesBD[j];
                        citasMostradas[arrayPosiciones[i]].extra += clientesBD[j].nombrePaciente+ ' '+ clientesBD[j].apellidosPaciente;
                        j= clientesBD.length+1;
                    }
                }
            }
            else{
                citasMostradas[arrayPosiciones[i]].extra = '*GRUPO*';
            }

            for (var j=0;j<psicologasBD.length;j++){
                if (citasMostradas[arrayPosiciones[i]].id_personal == psicologasBD[j].id_personal){
                    citasMostradas[arrayPosiciones[i]].color = psicologasBD[j].color;
                    j= psicologasBD.length+1;
                }
            }
        }

        return citasMostradas;
    }

    //array de los objetos que muestro    *******ATENTO A ESTA FUNCION QUE SE PUEDE REUTILIZAR LA MITAD CREO********
    var rejillaHorasDia = function (citasMostradas,salas){
        var horas = [{extra:'8:00-9:00'},{extra:'9:00-10:00'},{extra:'10:00-11:00'},{extra:'11:00-12:00'},{extra:'12:00-13:00'},{extra:'13:00-14:00'}
                    ,{extra:'14:00-15:00'},{extra:'15:00-16:00'},{extra:'16:00-17:00'},{extra:'17:00-18:00'},{extra:'18:00-19:00'},{extra:'19:00-20:00'},{extra:'20:00-21:00'}];
   
        var returnArray = [];
        var objHora = {};
        var contAux=0;
       for (var i=0; i < horas.length; i++){
            objHora.citas = [];
            objHora.citas.push(horas[i]);
            for (var j=0; j<salas.length; j++){
                objHora.citas.push(citasMostradas[contAux]);
                contAux++;
            }
            objHora.citas.push(horas[i]);
            returnArray.push(angular.copy(objHora));
       }

       return (returnArray);
    }



    this.verGrupo = function(citaMaster){
        var deferred = $q.defer();
        citaMaster.fecha = utilsService.parseFecha(citaMaster.fecha,0);
        console.log(citaMaster);
        this.getCitasGrupoBD(citaMaster).then(function(data){
            var modalInstance = $modal.open({
                    templateUrl: 'partials/agenda/verGrupo.html',
                    controller: 'verGrupoCtrl',
                    backdrop: false,
                    windowClass: 'transpModal', 
                    size: 'md',
                    resolve: {
                        citasGrupoInfo: function(){
                            return data.data;
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

    this.getPosPersonal = function(personalArray,id_personal){
        for (var i=0; i<personalArray.length; i++){
            if (personalArray[i].id_personal == id_personal)
                return i;
        }
    }
});

