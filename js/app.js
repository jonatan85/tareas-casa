let DB;

// Selectores.
const nombreInput = document.querySelector('#nombre');
const tareaInput = document.querySelector('#tarea');
const fechaInput = document.querySelector('#fecha');
const descripcionInput = document.querySelector('#descripcion');

const formulario = document.querySelector('#formulario-tareas');
const formularioInput = document.querySelector('#formulario-tareas input[type="submit"]');

const contenedorTareas = document.querySelector('#tareas');

const botonEditar = document.querySelector('.btn-editar')

let editando = false;

window.onload = () => {
    eventListeners();
    crearDB();
}
// Eventos.
function eventListeners() {
    nombreInput.addEventListener('change', datosTareas);
    tareaInput.addEventListener('change', datosTareas);
    fechaInput.addEventListener('change', datosTareas);
    descripcionInput.addEventListener('change', datosTareas);
    
    formulario.addEventListener('submit', submitTarea);
}

const tareasObj = {
    id: generarID(),
    nombre: '',
    tarea: '',
    fecha: '',
    descripcion: '',
}

// Clases.
class Notificacion {
    constructor({texto, tipo}) {
        this.texto = texto;
        this.tipo = tipo;

        this.mostrar();
    }

    mostrar() {
        const alerta = document.createElement('div');
        alerta.classList.add('text-center', 'w-full', 'p-3', 'text-white', 'my-5', 'alert', 'uppercase', 'font-bold', 'text-sm')
        
        this.tipo === 'error' ? alerta.classList.add('bg-red-500') : alerta.classList.add('bg-green-500');

        const alertaPrevia = document.querySelector('.alert');
        alertaPrevia?.remove();

        alerta.textContent = this.texto;

        formulario.parentElement.insertBefore(alerta, formulario);

        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

class AdminTareas {
    constructor()  {
        this.tareas = [];
    }

    agregar(tarea) {
        const transaction = DB.transaction(['tareas'], 'readwrite');
        const objectStore = transaction.objectStore('tareas');
        objectStore.add(tarea)

        transaction.oncomplete = () => {
            console.log('Tarea agregada');
            this.mostrar();
        }

        transaction.onerror = (e) => {
            console.log('Error al agregar tarea', e.target.error);
        }
        // this.tareas = [...this.tareas, tarea];
        // this.mostrar();
    }

    editar(tareaActualizada) {
        const transaction = DB.transaction(['tareas'], 'readwrite');
        const objectStore = transaction.objectStore('tareas');
        objectStore.put(tareaActualizada)

        transaction.oncomplete = () => {
            console.log('Tarea actualizada');
            this.mostrar();
        }

        transaction.onerror = (e) => {
            console.log('Error al actualizar tarea', e.target.error);
        }
    }

    eliminar(id) {
        console.log(id);
        
        const transaction = DB.transaction(['tareas'], 'readwrite');
        const objectStore = transaction.objectStore('tareas');
        objectStore.delete(id);
        
        transaction.oncomplete = () => {
            console.log(`Tarea ${id} eliminada`);
            this.mostrar();
        };

        transaction.onerror = (e) => {
            console.log('Error al eliminar tarea', e.target.error);
        };
    }

    mostrar() {

        if (!DB) {
            return;    
        }

        while(contenedorTareas.firstChild) {
            contenedorTareas.removeChild(contenedorTareas.firstChild);
        }

        const objectStore = DB.transaction('tareas').objectStore('tareas');
        const total = objectStore.count();
       
        

        if(total === 0) {
            contenedorTareas.innerHTML = `<p class="text-xl mt-5 mb-10 text-center">No Hay Citas</p>`
            return;
        }

        const request = objectStore.openCursor();

        request.onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
                const {id, nombre, tarea, fecha, descripcion } = cursor.value;
                    
                const divTarea = document.createElement('div');
                divTarea.classList.add('mx-5', 'my-10', 'bg-white', 'shadow-md', 'px-5', 'py-10' ,'rounded-xl', 'p-3');
            
                const nombreForm = document.createElement('p');
                nombreForm.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                nombreForm.innerHTML = `<span class="font-bold uppercase">Paciente: </span> ${nombre}`;
            
                const tareaForm = document.createElement('p');
                tareaForm.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                tareaForm.innerHTML = `<span class="font-bold uppercase">Propietario: </span> ${tarea}`;
                    
                const fechaForm = document.createElement('p');
                fechaForm.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                fechaForm.innerHTML = `<span class="font-bold uppercase">Fecha: </span> ${fecha}`;
            
                const descripcionFrom = document.createElement('p');
                descripcionFrom.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case')
                descripcionFrom.innerHTML = `<span class="font-bold uppercase">Síntomas: </span> ${descripcion}`;
    
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('py-2', 'px-10', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2', 'btn-editar');
                btnEditar.innerHTML = 'Editar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'
                const comodin = {...cursor.value};
                btnEditar.onclick = () => {
                    cargarEdicion(comodin);
                }
                
                
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('py-2', 'px-10', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2');
                btnEliminar.innerHTML = 'Eliminar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'

                btnEliminar.onclick =() => eliminarForm(id);
                
    
                const contenedorBotones = document.createElement('DIV');
                contenedorBotones.classList.add('flex', 'justify-between', 'mt-10');
    
                contenedorBotones.appendChild(btnEditar);
                contenedorBotones.appendChild(btnEliminar);
    
                divTarea.appendChild(nombreForm);
                divTarea.appendChild(tareaForm);
                divTarea.appendChild(fechaForm);
                divTarea.appendChild(descripcionFrom);
                divTarea.appendChild(contenedorBotones);
    
                contenedorTareas.appendChild(divTarea);

                cursor.continue();
            }
        };

        request.onerror = function(e) {
            console.log('Error al abrir el cursor', e.target.error);            
        }

    }
}

function eliminarForm(id) {
    tareas.eliminar(id);
}


function datosTareas(e) {
    tareasObj[e.target.name] = e.target.value;
}

const tareas = new AdminTareas();

function submitTarea(e) {
    e.preventDefault();

    if(Object.values(tareasObj).some(valor => valor.trim() === '') ) {
        new Notificacion({
            texto: 'Todos los campos son obligatorios',
            tipo: 'error'
        })
        return;
    }

    if(editando) {
        tareas.editar({...tareasObj});
        new Notificacion({
            texto: 'Guardado Correctamente',
            tipo: 'exito'
        })
    } else {
        tareas.agregar({...tareasObj});
        new Notificacion({
            texto: 'Tarea Registrada',
            tipo: 'exito'
        })
    }

    formulario.reset();
    reiniciarObjetoTarea();
    formularioInput.value = 'Registrar Tarea';
    editando = false;
}

function reiniciarObjetoTarea() {
    Object.assign(tareasObj, {
        id: generarID(),
        nombre: '',
        tarea: '',
        fecha: '',
        descripcion: '',
    })
}

function generarID() {
    return Math.random().toString(36).substring(2) + Date.now();
}

function cargarEdicion(tarea) {
    Object.assign(tareasObj, tarea);
    
    nombreInput.value = tarea.nombre;
    tareaInput.value = tarea.tarea;
    fechaInput.value = tarea.fecha;
    descripcionInput.value = tarea.descripcion;

    editando = true;

    formularioInput.value = 'Editar Tarea';
}

function crearDB() {
    // Crea la base de datos 1.0.
    const crearDB = window.indexedDB.open('tareas', 1);

    // Si hay un error.
    crearDB.onerror = function() {
        console.log('Hubo un error');
    }

    // Si todo esta bien.
    crearDB.onsuccess = function() {
        console.log('DB Creada');
        
        DB = crearDB.result;

        tareas.mostrar();
    }

    // Definir el schema.
    crearDB.onupgradeneeded = function(e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore('tareas', {
            keyPath: 'id',
            autoIncrement: true,
        });

        objectStore.createIndex('nombre', 'nombre', {unique:false});
        objectStore.createIndex('tarea', 'tarea', {unique:false});
        objectStore.createIndex('fecha', 'fecha', {unique:false});
        objectStore.createIndex('descripcion', 'descripcion', {unique:false});
        objectStore.createIndex('id', 'id', {unique:true} );
        
        console.log('DB Creada y lista');
        
    }
}

