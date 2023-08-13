<?php

class ControladorCategorias{

/*=====================================
CREAR CATEGORIA
======================================*/

static public function ctrCrearCategoria(){

	if (isset($_POST["nuevaCategoria"])){

		if (preg_match('/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]+$/', $_POST['nuevaCategoria'])) {

			$tabla = "categorias";

			$datos = $_POST["nuevaCategoria"];

			$respuesta = ModeloCategorias::mdlIngresarCategoria($tabla, $datos);

			if($respuesta == "ok"){

				echo'<script>
				swal({
					type: "success",
					title: "La categoria ha sido guardada correctamente",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
					closeOnConfirm: false
					}).then((result)=>{
						if (result.value){

							window.location = "categorias";
						}
						})
						</script>';
			}
			}else{

				echo'<script>
				swal({
					type: "error",
					title: "La categoria no puede estar vacia o llevar caracteres especiales",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
					closeOnConfirm: false
					}).then((result)=>{
						if (result.value){

							window.location = "categorias";
						}
						})
						</script>';
			}



		}
	}

	/*=====================================
	MOSTRAR CATEGORIA
	======================================*/

	static public function ctrMostrarCategorias($item, $valor){

		$tabla = "categorias";

		$respuesta = ModeloCategorias::MdlMostrarCategorias($tabla, $item, $valor);

		return $respuesta;
	}

	/*=====================================
	EDITAR CATEGORIA
	======================================*/

static public function ctrEditarCategoria(){	

	if (isset($_POST["editarCategoria"])){

		if (preg_match('/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]+$/', $_POST['editarCategoria'])) {

			$tabla = "categorias";

			$datos = array("categoria"=>$_POST["editarCategoria"],
							"id"=>$_POST["idCategoria"]);

			$respuesta = ModeloCategorias::mdlEditarCategoria($tabla, $datos);

			if($respuesta == "ok"){

				echo'<script>
				swal({
					type: "success",
					title: "La categoria ha sido cambiada correctamente",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
					closeOnConfirm: false
					}).then((result)=>{
						if (result.value){

							window.location = "categorias";
						}
						})
						</script>';
			}
			}else{

				echo'<script>
				swal({
					type: "error",
					title: "La categoria no puede estar vacia o llevar caracteres especiales",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
					closeOnConfirm: false
					}).then((result)=>{
						if (result.value){

							window.location = "categorias";
						}
						})
						</script>';
			}



		}
	}
	/*=====================================
	BORRAR CATEGORIA
	======================================*/

	static public function ctrBorrarCategoria(){

		if(isset($_GET["idCategoria"])){

			$tabla = "Categorias";
			$datos = $_GET["idCategoria"];

			$respuesta = ModeloCategorias::mdlBorrarCategoria($tabla, $datos);

			if ($respuesta == "ok"){

				echo'<script>

				swal({

					type: "success",
					title: "La categoria ha sido borrada correctamente",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
					closeOnConfirm: false
					}).then((result) => {

						if (result.value){

							window.location = "categorias";
						}

			})

			</script>'; 

		}
	}
}
}