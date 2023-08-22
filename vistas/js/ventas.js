/*=============================================
CARGAR LA TABLA DINÁMICA DE VENTAS
=============================================*/

// $.ajax({

// 	url: "ajax/datatable-ventas.ajax.php",
// 	success:function(respuesta){
		
// 		console.log("respuesta", respuesta);

// 	}

// })

$('.tablaVentas').DataTable( {
    "ajax": "ajax/datatable-ventas.ajax.php",
    "deferRender": true,
	"retrieve": true,
	"processing": true,
	 "language": {

			"sProcessing":     "Procesando...",
			"sLengthMenu":     "Mostrar _MENU_ registros",
			"sZeroRecords":    "No se encontraron resultados",
			"sEmptyTable":     "Ningún dato disponible en esta tabla",
			"sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_",
			"sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0",
			"sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
			"sInfoPostFix":    "",
			"sSearch":         "Buscar:",
			"sUrl":            "",
			"sInfoThousands":  ",",
			"sLoadingRecords": "Cargando...",
			"oPaginate": {
			"sFirst":    "Primero",
			"sLast":     "Último",
			"sNext":     "Siguiente",
			"sPrevious": "Anterior"
			},
			"oAria": {
				"sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
				"sSortDescending": ": Activar para ordenar la columna de manera descendente"
			}

	}

} );

/*=============================================
AGREGANDO PRODUCTOS A LA VENTA DESDE LA TABLA
=============================================*/

$(".tablaVentas tbody").on("click", "button.agregarProducto", function(){//al dar click en agregar

	var idProducto = $(this).attr("idProducto"); //trae el id del producto

	$(this).removeClass("btn-primary agregarProducto");

	$(this).addClass("btn-default"); //Desactiva el boton de agregar cuabdo el producto con el id seleccionado ya no se vuelva a agregar

	var datos = new FormData(); //variable para tener el formato del formulario en ajax
    datos.append("idProducto", idProducto); //agrega los datos

     $.ajax({

     	url:"ajax/productos.ajax.php",
      	method: "POST",
      	data: datos,
      	cache: false,
      	contentType: false,
      	processData: false,
      	dataType:"json",
      	success:function(respuesta){

      	    var descripcion = respuesta["descripcion"];
          	var stock = respuesta["stock"];
          	var precio = respuesta["precio_venta"];

          	/*=============================================
          	EVITAR AGREGAR PRODUTO CUANDO EL STOCK ESTÁ EN CERO
          	=============================================*/

          	if(stock == 0){ //Si el producto seleccionado tiene un stock de cero, no debe permitir agragar mas a una venta

      			swal({
			      title: "No hay stock disponible",
			      type: "error",
			      confirmButtonText: "¡Cerrar!"
			    });

			    $("button[idProducto='"+idProducto+"']").addClass("btn-primary agregarProducto"); //activa la clase para acceder al swall siempre qwue sea cero

			    return;

          	}
                //Se debe concatenar entre comillas simples para evitar errores en el foramato de los valores
          	$(".nuevoProducto").append( //Esturcutra HTML para los campos de agreear productos a uan venta

          	'<div class="row" style="padding:5px 15px">'+

			  '<!-- Descripción del producto -->'+
	          
	          '<div class="col-xs-6" style="padding-right:0px">'+
	          
	            '<div class="input-group">'+
	              
	              '<span class="input-group-addon"><button type="button" class="btn btn-danger btn-xs quitarProducto" idProducto="'+idProducto+'"><i class="fa fa-times"></i></button></span>'+

	              '<input type="text" class="form-control nuevaDescripcionProducto" idProducto="'+idProducto+'" name="agregarProducto" value="'+descripcion+'" readonly required>'+

	            '</div>'+

	          '</div>'+

	          '<!-- Cantidad del producto -->'+

	          '<div class="col-xs-3">'+
	            
	             '<input type="number" class="form-control nuevaCantidadProducto" name="nuevaCantidadProducto" min="1" value="1" stock="'+stock+'" nuevoStock="'+Number(stock-1)+'" required>'+

	          '</div>' +

	          '<!-- Precio del producto -->'+

	          '<div class="col-xs-3 ingresoPrecio" style="padding-left:0px">'+

	            '<div class="input-group">'+

	              '<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+
	                 
	              '<input type="text" class="form-control nuevoPrecioProducto" precioReal="'+precio+'" name="nuevoPrecioProducto" value="'+precio+'" readonly required>'+
	 
	            '</div>'+
	             
	          '</div>'+

	        '</div>') 

	        // SUMAR TOTAL DE PRECIOS

	        sumarTotalPrecios()

	        // AGREGAR IMPUESTO

	        agregarImpuesto()

	        // AGRUPAR PRODUCTOS EN FORMATO JSON

	        listarProductos()

	        // PONER FORMATO AL PRECIO DE LOS PRODUCTOS -DOS DECIMALES

	        $(".nuevoPrecioProducto").number(true, 2);

      	}

     })

});

/*=============================================
CUANDO CARGUE LA TABLA CADA VEZ QUE NAVEGUE EN ELLA
=============================================*/

$(".tablaVentas").on("draw.dt", function(){ //Recomendacion cada vez que se navegue eb la tabla segun data-table

	if(localStorage.getItem("quitarProducto") != null){ //si esxiste la variable en localstorage

		var listaIdProductos = JSON.parse(localStorage.getItem("quitarProducto")); //de tipo JSON para hgacer el recorrido

		for(var i = 0; i < listaIdProductos.length; i++){ //ir agregabdo la id que se recupera del localstorage y que se agregueen boton activado

			$("button.recuperarBoton[idProducto='"+listaIdProductos[i]["idProducto"]+"']").removeClass('btn-default');
			$("button.recuperarBoton[idProducto='"+listaIdProductos[i]["idProducto"]+"']").addClass('btn-primary agregarProducto');

		}


	}


})


/*=============================================
QUITAR PRODUCTOS DE LA VENTA Y RECUPERAR BOTÓN
=============================================*/

var idQuitarProducto = []; //Va almacenando productos que seran removidos

localStorage.removeItem("quitarProducto"); //Remover el id del localstorage cada vez que se actualize la pagina

$(".formularioVenta").on("click", "button.quitarProducto", function(){

	$(this).parent().parent().parent().parent().remove(); //remover parienets es lo mismo a borrar los elementos (etiquetas) que estan inmersos en las columnas

	var idProducto = $(this).attr("idProducto");

	/*=============================================
	ALMACENAR EN EL LOCALSTORAGE EL ID DEL PRODUCTO A QUITAR
	=============================================

	if(localStorage.getItem("quitarProducto") == null){ //captura variable 

		idQuitarProducto = []; //array para almacenar los productos
	
	}else{

		idQuitarProducto.concat(localStorage.getItem("quitarProducto")) //concatena del localstorage para poner el array en datos json

	}

	idQuitarProducto.push({"idProducto":idProducto}); //Poner el valor que se capturo een idproducto

	localStorage.setItem("quitarProducto", JSON.stringify(idQuitarProducto));//POne el item quitar item*/

	$("button.recuperarBoton[idProducto='"+idProducto+"']").removeClass('btn-default'); //recupera el id del producto para desactivar el boton

	$("button.recuperarBoton[idProducto='"+idProducto+"']").addClass('btn-primary agregarProducto');//recupera el id del producto para activar el boton en la tabla

	if($(".nuevoProducto").children().length == 0){ //Al momento de navegar por la tabla se ´pueda recuperar el boton activado/desactivado

		$("#nuevoImpuestoVenta").val(0);
		$("#nuevoTotalVenta").val(0);
		$("#totalVenta").val(0);
		$("#nuevoTotalVenta").attr("total",0);

	}else{

		// SUMAR TOTAL DE PRECIOS

    	sumarTotalPrecios()

    	// AGREGAR IMPUESTO
	        
        agregarImpuesto()

        // AGRUPAR PRODUCTOS EN FORMATO JSON

        listarProductos()

	}

})

/*=============================================
AGREGANDO PRODUCTOS DESDE EL BOTÓN PARA DISPOSITIVOS    moviles/tablets
=============================================*/

var numProducto = 0;

$(".btnAgregarProducto").click(function(){

	numProducto ++;

	var datos = new FormData();
	datos.append("traerProductos", "ok"); //Traer todos los productos

	$.ajax({

		url:"ajax/productos.ajax.php",
      	method: "POST",
      	data: datos,
      	cache: false,
      	contentType: false,
      	processData: false,
      	dataType:"json",
      	success:function(respuesta){
      	    
      	    	$(".nuevoProducto").append(

          	'<div class="row" style="padding:5px 15px">'+

			  '<!-- Descripción del producto -->'+
	          
	          '<div class="col-xs-6" style="padding-right:0px">'+
	          
	            '<div class="input-group">'+
	              
	              '<span class="input-group-addon"><button type="button" class="btn btn-danger btn-xs quitarProducto" idProducto><i class="fa fa-times"></i></button></span>'+

	              '<select class="form-control nuevaDescripcionProducto"  idProducto name="nuevaDescripcionProducto" required>'+

	              '<option>Seleccione el producto</option>'+

	              '</select>'+  

	            '</div>'+

	          '</div>'+

	          '<!-- Cantidad del producto -->'+

	          '<div class="col-xs-3 ingresoCantidad">'+
	            
	             '<input type="number" class="form-control nuevaCantidadProducto" name="nuevaCantidadProducto" min="1" value="1" stock nuevoStock required>'+

	          '</div>' +

	          '<!-- Precio del producto -->'+

	          '<div class="col-xs-3 ingresoPrecio" style="padding-left:0px">'+

	            '<div class="input-group">'+

	              '<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+
	                 
	              '<input type="text" class="form-control nuevoPrecioProducto" precioReal="" name="nuevoPrecioProducto" readonly required>'+
	 
	            '</div>'+
	             
	          '</div>'+

	        '</div>');


	        // AGREGAR LOS PRODUCTOS AL SELECT 

	         respuesta.forEach(funcionForEach);

	         function funcionForEach(item, index){

	         	if(item.stock != 0){ //si nohay unidades en el stock no poner el producto en el select

		         	$("#producto"+numProducto).append(

						'<option idProducto="'+item.id+'" value="'+item.descripcion+'">'+item.descripcion+'</option>' //se obtiene una lista en un item del select
		         	)

		         }

	         }

	         // SUMAR TOTAL DE PRECIOS

    		sumarTotalPrecios()

    		// AGREGAR IMPUESTO
	        
	        agregarImpuesto()
            

	        // PONER FORMATO AL PRECIO DE LOS PRODUCTOS

	        $(".nuevoPrecioProducto").number(true, 2);


      	}


	})

})

/*=============================================
SELECCIONAR PRODUCTO
=============================================*/

$(".formularioVenta").on("change", "select.nuevaDescripcionProducto", function(){ //funcion aopenas canbie el valor del select

	var nombreProducto = $(this).val(); //trae la respuesta del producto

	var nuevaDescripcionProducto = $(this).parent().parent().parent().children().children().children(".nuevaDescripcionProducto");

	var nuevoPrecioProducto = $(this).parent().parent().parent().children(".ingresoPrecio").children().children(".nuevoPrecioProducto");

	var nuevaCantidadProducto = $(this).parent().parent().parent().children(".ingresoCantidad").children(".nuevaCantidadProducto");

	var datos = new FormData();
    datos.append("nombreProducto", nombreProducto); //busca el nombre atraves del ajax con el nombre del producto


	  $.ajax({

     	url:"ajax/productos.ajax.php",
      	method: "POST",
      	data: datos,
      	cache: false,
      	contentType: false,
      	processData: false,
      	dataType:"json",
      	success:function(respuesta){
      	    
      	     $(nuevaDescripcionProducto).attr("idProducto", respuesta["id"]);
      	    $(nuevaCantidadProducto).attr("stock", respuesta["stock"]);
      	    $(nuevaCantidadProducto).attr("nuevoStock", Number(respuesta["stock"])-1);
      	    $(nuevoPrecioProducto).val(respuesta["precio_venta"]);
      	    $(nuevoPrecioProducto).attr("precioReal", respuesta["precio_venta"]); //precio inicial del producto

  	      // AGRUPAR PRODUCTOS EN FORMATO JSON

	        listarProductos()

      	}

      })
})

/*=============================================
MODIFICAR LA CANTIDAD
=============================================*/

$(".formularioVenta").on("change", "input.nuevaCantidadProducto", function(){ //modificar el input de la cantidad productos

	var precio = $(this).parent().parent().children(".ingresoPrecio").children().children(".nuevoPrecioProducto"); //salir al hijo del ingreso del precio para poder manipular el precio

	var precioFinal = $(this).val() * precio.attr("precioReal"); //multiplicar la nueva cantidad por el precio inicial traido desde producto
	
	precio.val(precioFinal);

	var nuevoStock = Number($(this).attr("stock")) - $(this).val(); //actualiza el stock al momento de vender un producto (se resta el stock)

	$(this).attr("nuevoStock", nuevoStock);

	if(Number($(this).val()) > Number($(this).attr("stock"))){

		/*=============================================
		SI LA CANTIDAD ES SUPERIOR AL STOCK REGRESAR VALORES INICIALES
		=============================================*/

		$(this).val(1); // se devuelve la cantidad de 1 si supera el stock

		var precioFinal = $(this).val() * precio.attr("precioReal"); //precio real siempre es el valor traido desde el producto para evitar que se acumule la suma de los precios segun  la cantidad

		precio.val(precioFinal);

		sumarTotalPrecios(); //si se tiene mchos productos, se volvera ejecutar LA SUMA inical

		swal({
	      title: "La cantidad supera el Stock",
	      text: "¡Sólo hay "+$(this).attr("stock")+" unidades!", //muestra la cantidad disponble del producto de dicho id en caso de querer agregar mas de lo que hay
	      type: "error",
	      confirmButtonText: "¡Cerrar!"
	    });

	    return;

	}

	// SUMAR TOTAL DE PRECIOS

	sumarTotalPrecios()

	// AGREGAR IMPUESTO
	        
    agregarImpuesto()

    // AGRUPAR PRODUCTOS EN FORMATO JSON

    listarProductos()

})

/*=============================================
SUMAR TODOS LOS PRECIOS
=============================================*/

function sumarTotalPrecios(){

	var precioItem = $(".nuevoPrecioProducto"); 
	var arraySumaPrecio = [];  //alacena cada item de precios hay

	for(var i = 0; i < precioItem.length; i++){

		 arraySumaPrecio.push(Number($(precioItem[i]).val())); //captura con el idice de las clases cada valor y se convierte como numeros
		 
	}

	function sumaArrayPrecios(total, numero){

		return total + numero;

	}

	var sumaTotalPrecio = arraySumaPrecio.reduce(sumaArrayPrecios);
	
	$("#nuevoTotalVenta").val(sumaTotalPrecio); //se aplica la suma total al input
	$("#totalVenta").val(sumaTotalPrecio);
	$("#nuevoTotalVenta").attr("total",sumaTotalPrecio); //Pone el precio total en el input del impuesto


}

/*=============================================
FUNCIÓN AGREGAR IMPUESTO
=============================================*/

function agregarImpuesto(){

	var impuesto = $("#nuevoImpuestoVenta").val(); //captura el valor del impuesto
	var precioTotal = $("#nuevoTotalVenta").attr("total");

	var precioImpuesto = Number(precioTotal * impuesto/100);

	var totalConImpuesto = Number(precioImpuesto) + Number(precioTotal); //se aplica el impuesto al valor total
	
	$("#nuevoTotalVenta").val(totalConImpuesto); 

	$("#totalVenta").val(totalConImpuesto);

	$("#nuevoPrecioImpuesto").val(precioImpuesto);

	$("#nuevoPrecioNeto").val(precioTotal);

}

/*=============================================
CUANDO CAMBIA EL IMPUESTO
=============================================*/

$("#nuevoImpuestoVenta").change(function(){ //Cuando cambie el impuesto se llama a agragarImpuesto

	agregarImpuesto();

});

/*=============================================
FORMATO AL PRECIO FINAL
=============================================*/

$("#nuevoTotalVenta").number(true, 2);

/*=============================================
SELECCIONAR MÉTODO DE PAGO
=============================================*/

$("#nuevoMetodoPago").change(function(){ //Al cambiar el metodo de pago

	var metodo = $(this).val(); //captura el valor

	if(metodo == "Efectivo"){

		$(this).parent().parent().removeClass("col-xs-6"); //Reduce el tamaño de la columna

		$(this).parent().parent().addClass("col-xs-4"); //sale hasta el hijo que seria la clase cajasMetodospago

		$(this).parent().parent().parent().children(".cajasMetodoPago").html(

			 '<div class="col-xs-4">'+ 

			 	'<div class="input-group">'+ 

			 		'<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+ 

			 		'<input type="text" class="form-control" id="nuevoValorEfectivo" placeholder="000000" required>'+

			 	'</div>'+

			 '</div>'+

			 '<div class="col-xs-4" id="capturarCambioEfectivo" style="padding-left:0px">'+ //calcular la diferencia de cambio

			 	'<div class="input-group">'+

			 		'<span class="input-group-addon"><i class="ion ion-social-usd"></i></span>'+

			 		'<input type="text" class="form-control" id="nuevoCambioEfectivo" placeholder="000000" readonly required>'+

			 	'</div>'+

			 '</div>'

		 )

		// Agregar formato al precio

		$('#nuevoValorEfectivo').number( true, 2);
      	$('#nuevoCambioEfectivo').number( true, 2);


      	// Listar método en la entrada
      	listarMetodos()

	}else{ //Ambos casos para tarejaeta de credito o debito

		$(this).parent().parent().removeClass('col-xs-4');

		$(this).parent().parent().addClass('col-xs-6');

		 $(this).parent().parent().parent().children('.cajasMetodoPago').html(

		 	'<div class="col-xs-6" style="padding-left:0px">'+
                        
                '<div class="input-group">'+
                     
                  '<input type="number" min="0" class="form-control" id="nuevoCodigoTransaccion" placeholder="Código transacción"  required>'+
                       
                  '<span class="input-group-addon"><i class="fa fa-lock"></i></span>'+
                  
                '</div>'+

              '</div>')

	}

})

/*=============================================
CAMBIO EN EFECTIVO
=============================================*/
$(".formularioVenta").on("change", "input#nuevoValorEfectivo", function(){ //Si cambia el valor del efectivo

	var efectivo = $(this).val(); //obtiene el valor

	var cambio =  Number(efectivo) - Number($('#nuevoTotalVenta').val()); //diferencia

	var nuevoCambioEfectivo = $(this).parent().parent().parent().children('#capturarCambioEfectivo').children().children('#nuevoCambioEfectivo'); //sale al ultimoinput hijo y pone el valor del cambio

	nuevoCambioEfectivo.val(cambio); //ponemos el cambio en su value

})

/*=============================================
CAMBIO TRANSACCIÓN
=============================================*/
$(".formularioVenta").on("change", "input#nuevoCodigoTransaccion", function(){

	// Listar método en la entrada
     listarMetodos()


})


/*=============================================
LISTAR TODOS LOS PRODUCTOS
=============================================*/

function listarProductos(){

	var listaProductos = [];

	var descripcion = $(".nuevaDescripcionProducto");

	var cantidad = $(".nuevaCantidadProducto");

	var precio = $(".nuevoPrecioProducto");

	for(var i = 0; i < descripcion.length; i++){

		listaProductos.push({ "id" : $(descripcion[i]).attr("idProducto"), 
							  "descripcion" : $(descripcion[i]).val(),
							  "cantidad" : $(cantidad[i]).val(),
							  "stock" : $(cantidad[i]).attr("nuevoStock"),
							  "precio" : $(precio[i]).attr("precioReal"),
							  "total" : $(precio[i]).val()})

	}

	$("#listaProductos").val(JSON.stringify(listaProductos)); //Adquiere el valor de la lista de productos ya de forma de texto tipo json
    //console.log("Listar productos", listaProductos);
}

/*=============================================
LISTAR MÉTODO DE PAGO
=============================================*/

function listarMetodos(){

	var listaMetodos = "";

	if($("#nuevoMetodoPago").val() == "Efectivo"){

		$("#listaMetodoPago").val("Efectivo");

	}else{

		$("#listaMetodoPago").val($("#nuevoMetodoPago").val()+"-"+$("#nuevoCodigoTransaccion").val()); //trae las nuevas opciones mas lo que venga en el valor del cxampo con elid

	}

}

/*=============================================
BOTON EDITAR VENTA --clase del boton de editar
=============================================*/
$(".tablas").on("click", ".btnEditarVenta", function(){ //al dar click captura la variable idVenta

	var idVenta = $(this).attr("idVenta"); //trae atributo

	window.location = "index.php?ruta=editar-venta&idVenta="+idVenta; //Aparece la ruta cion su parametro idVenta


})

/*=============================================
FUNCIÓN PARA DESACTIVAR LOS BOTONES AGREGAR CUANDO EL PRODUCTO YA HABÍA SIDO SELECCIONADO EN LA CARPETA
=============================================*/

function quitarAgregarProducto(){

	//Capturamos todos los id de productos que fueron elegidos en la venta
	var idProductos = $(".quitarProducto");

	//Capturamos todos los botones de agregar que aparecen en la tabla
	var botonesTabla = $(".tablaVentas tbody button.agregarProducto");

	//Recorremos en un ciclo para obtener los diferentes idProductos que fueron agregados a la venta
	for(var i = 0; i < idProductos.length; i++){

		//Capturamos los Id de los productos agregados a la venta
		var boton = $(idProductos[i]).attr("idProducto");
		
		//Hacemos un recorrido por la tabla que aparece para desactivar los botones de agregar
		for(var j = 0; j < botonesTabla.length; j ++){

			if($(botonesTabla[j]).attr("idProducto") == boton){

				$(botonesTabla[j]).removeClass("btn-primary agregarProducto");
				$(botonesTabla[j]).addClass("btn-default");

			}
		}

	}
	
}

/*=============================================
CADA VEZ QUE CARGUE LA TABLA CUANDO NAVEGAMOS EN ELLA EJECUTAR LA FUNCIÓN:
=============================================*/

$('.tablaVentas').on( 'draw.dt', function(){

	quitarAgregarProducto();

})



/*=============================================
BORRAR VENTA
=============================================*/
$(".tablas").on("click", ".btnEliminarVenta", function(){ //al dar click

  var idVenta = $(this).attr("idVenta"); //con el id de la venta para activar el swal de eliminar

  swal({
        title: '¿Está seguro de borrar la venta?',
        text: "¡Si no lo está puede cancelar la accíón!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar venta!'
      }).then(function(result){
        if (result.value) {
          
            window.location = "index.php?ruta=ventas&idVenta="+idVenta; //redicrecciona a la ruta de ventas
        }

  })

})

/*=============================================
IMPRIMIR FACTURA
=============================================*/

// $(".tablas").on("click", ".btnImprimirFactura", function(){

// 	var codigoVenta = $(this).attr("codigoVenta"); //traer e codigo de la venta a imprimir
// 	//Nueva ventana con la extension del pdf y busca el archivo
// 	window.open("extensiones/tcpdf/pdf/pdf.php", "_blank"); //pagina nueva

// })