var imagenAnimal, nombreAnimal, colorFondo, colorTexto;        
var numerosRepetidos = [], animalesCargados = [], promesas = [];
var $objetivo = document.querySelector("#capture");
var $contenedorCanvas = document.querySelector("#contenedorCanvas");
const opciones = {
    allowTaint: true,
    backgroundColor: '#EDF2D4',
    removeContainer: false,
    useCORS:true
};
//const originalURL = location.href;
const originalURL = 'https://adrian-gg.github.io/ac_bingo';

$(document).ready(()=>{

    $('#boton-crear').click(()=>{
        $('#contenedorCanvas').empty();

        //cambiar apariencia boton
        $('.tablaCeldas').empty().append('<div class="celda-central"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div><div class="celda"></div>');
        $('.boton').toggleClass('boton--pulsado');  

        //limpiar listas
        animalesCargados = [];
        numerosRepetidos = [];
        promesas = [];

        //generar id de los animales
        for(i = 0; i < 24; i++){ cargarAnimal(); }

        //descarrgar datos de los animales
        for(i = 0; i < animalesCargados.length; i++){
            descargarAnimal(animalesCargados[i][0], animalesCargados[i][1]);
        }

        //imprimir datos una vez descargados todos
        Promise.all(promesas).then(values => {
            for(i = 0; i < animalesCargados.length; i++){
                imprimirAnimal(values[i][0], values[i][1], values[i][2], values[i][3], values[i][4], values[i][5]);
            }
            setTimeout(()=>{ $('.boton').toggleClass('boton--pulsado'); }, 2000);
        });

        //imprimir URL con codigo
        generarURL(animalesCargados.join('-'));

        //generar canvas
        //crearCanvas();                
            
    });

    $('body').on('click', '.celda', function(){
        $('#contenedorCanvas').empty();
        //obtener datos de la celda
        var $este = $(this);
        var idAnimal = $este.data("idanimal");
        var indexAnimal;

        //cambair estado celda
        $este.toggleClass('celda--marcada');
        
        //buscar en lista por id del animal
        for(i = 0; i < animalesCargados.length; i++){
            if(animalesCargados[i][0] == idAnimal){
                indexAnimal = animalesCargados[i];
                indexAnimal = animalesCargados.indexOf(indexAnimal);
            }
        }
        
        if($este.hasClass('celda--marcada')){
            animalesCargados[indexAnimal][1] = 1;
        }else{
            animalesCargados[indexAnimal][1] = 0;
        }

        generarURL(animalesCargados.join('-'));

        //generar canvas
        //crearCanvas();
    });

    leerURL();

    const download = document.getElementById('boton-descargar');

    $('#boton-descargar').click(()=>{
        $('.boton').toggleClass('boton--pulsado');
        setTimeout(()=>{ $('.boton').toggleClass('boton--pulsado'); },3100);
        let seed = generarSeed(animalesCargados.join('-'), 'encode');
        
        crearCanvas();
        setTimeout(()=>{
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'AC_Bingo_'+seed+'.png');
            var $canvas = $('#contenedorCanvas>canvas')[0];
            let dataURL = $canvas.toDataURL('image/png');
            let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
            downloadLink.setAttribute('href', url);
            downloadLink.click();  
        },3100);              
        
    })

});

function crearCanvas(){
    setTimeout(()=>{                    
        html2canvas($objetivo, opciones).then(function(canvas) {
            $contenedorCanvas.appendChild(canvas);
            setTimeout(()=>{ $('.html2canvas-container').remove(); }, 2000);
        });
        
    },1000);
}


function cargarAnimal(){
    var numeroObtenido = obtenerNumeroAleatorio(1, 392);

    if(comprobarRepetidos(numeroObtenido)){
        cargarAnimal();

    }else{
        animalesCargados.push([numeroObtenido, 0]);

    }
    
};

function comprobarRepetidos(numeroObtenido){            
    for(j = 0; j < numerosRepetidos.length; j++){
        if(numeroObtenido == numerosRepetidos[j]){
            return true;                    
        }

    }
    if(j == numerosRepetidos.length){
        numerosRepetidos.push(numeroObtenido);
        return false;                
    }
    
};

function obtenerNumeroAleatorio(min, max){
    return Math.floor(Math.random() * (max - min)) + min;

};


function generarURL(cadenaURL){
        linkFinal = originalURL + '?cL=' + generarSeed(cadenaURL, 'encode');
        window.history.replaceState('', '', linkFinal);
        //location.href = linkFinal;
};

function generarSeed(cadena, type){
    const cipher = salt => {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

        return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
    }
        
    const decipher = salt => {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
        return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
    }

    // To create a cipher
    const myCipher = cipher('GC');

    if(type == "encode"){
        //Then cipher any text:
        codigoFinal = myCipher(cadena);

    }else if(type == "decode"){
        //To decipher, you need to create a decipher and use it:
        const myDecipher = decipher('GC');
        codigoFinal = myDecipher(cadena);
    }

    return codigoFinal;

};


function descargarAnimal(idAnimal, estadoMarcado){
    promesas.push( new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: 'https://acnhapi.com/v1/villagers/'+idAnimal,
                dataType: 'json',
                success: (data) => {
                    //console.log(data);
                    imagenAnimal = data['image_uri'];
                    nombreAnimal = data['name']['name-EUes'];
                    colorFondo = data['bubble-color'];
                    colorTexto = data['text-color'];

                    resolve([imagenAnimal, nombreAnimal, colorFondo, colorTexto, idAnimal, estadoMarcado]);
                }
            });
        })
    );
};

function imprimirAnimal(imagenAnimal, nombreAnimal, colorFondo, colorTexto, idAnimal, estadoMarcado){         
    $('.tablaCeldas .celda:last').remove();
    $('.tablaCeldas').prepend('<div class="celda" data-idAnimal="'+idAnimal+'">'+
        '<div class="marcadorCelda" style="transform: translate(0.'+obtenerNumeroAleatorio(1, 11)+'rem, -0.'+obtenerNumeroAleatorio(6, 11)+'rem) rotate('+obtenerNumeroAleatorio(-32, 33)+'deg);"></div>'+
        '<img src="'+imagenAnimal+'" alt="'+nombreAnimal+'">'+
        '<div class="etiquetaNombreAnimal">'+
            '<p class="nombreAnimal" style="background-color: '+colorFondo+'; color: '+colorTexto+';">'+nombreAnimal+'</p>'+
        '</div>'+
    '</div>');
    if(estadoMarcado == 1){$('.tablaCeldas .celda:first').addClass('celda--marcada');}
    
};

function leerURL(){
    var urlActual = location.href;

    if(urlActual != originalURL){
        $('.boton').toggleClass('boton--pulsado');
        animalesCargados = [];
        promesas = [];

        var codigoURL = urlActual.replace(originalURL + '?cL=', '');        
        var codigoFinal = generarSeed(codigoURL, 'decode');
        codigoFinal = '['+codigoFinal.replace(/-/g, ']-[')+']';             

        animalesCargados = '['+codigoFinal.split('-').toString()+']';
        animalesCargados = JSON.parse(animalesCargados);

        //descargar datos de los animales
        for(i = 0; i < animalesCargados.length; i++){
            descargarAnimal(animalesCargados[i][0], animalesCargados[i][1]);
        }

        //imprimir datos una vez descargados todos
        Promise.all(promesas).then(values => {
            for(i = 0; i < animalesCargados.length; i++){
                imprimirAnimal(values[i][0], values[i][1], values[i][2], values[i][3], values[i][4], values[i][5]);
            }
            setTimeout(()=>{ $('.boton').toggleClass('boton--pulsado'); }, 1000);
        });

        
        //setTimeout(()=>{ crearCanvas(); },1000);
    }
    
}
