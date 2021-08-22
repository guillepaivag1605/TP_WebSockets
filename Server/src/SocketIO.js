const SocketIO = require('socket.io')
const { app, server } = require('./app')
const {
    ver_estado,
    crear_cama,
    eliminar_cama,
    ocupar_cama,
    desocupar_cama,
    listaHospitales,
    listaCamasPorHospital,
    datosCamaUTI
} = require('./functions/webSocket')
const ResponseServer = require('./model/ResponseServer')

// WebSockets
const io = SocketIO(server, {
    cors: {
        origin: ["http://localhost:8080", 'http://localhost:1605', 'https://websocketscamasuti.web.app'],
        methods: ["GET", "POST"],
        credentials: true
    }
})

// Comienza la conexión con socket.io y con un mensaje de bienvenida
io.on('connection', async function (socket) {
    console.log(`Nuevo cliente conectado: ${socket.id}`)
    socket.emit('bienvenido', {
        bienvenido: '¡Bienvenido al mejor server del planeta! <3'
    })

    // Operaciones solicitadas

    socket.on('operacion', async ( data ) => {
        
        const { tipo_operacion, datos } = data
            
        if ( datos ) {
            var { uidHospital, uidCamaUTI } = datos
            uidHospital = String(uidHospital)
        }
        
        try {
            let response
            socket.emit('bienvenido', {
                bienvenido: `Bienvenido ${data.id}`
            })

            switch ( tipo_operacion ) {
                case 1:
                    response = await ver_estado()
                    socket.emit('responseServer_verEstado', response)
                    break;

                case 2:
                    response = await crear_cama( uidHospital )
                    socket.emit('responseServer_camaCreada', response)
                    break;

                case 3:
                    response = await eliminar_cama( uidHospital, uidCamaUTI )
                    socket.emit('responseServer_camaEliminada', response)
                    break;

                case 4:
                    response = await ocupar_cama( uidHospital, uidCamaUTI )
                    socket.emit('responseServer_camaOcupada', response)
                    break;

                case 5:
                    response = await desocupar_cama( uidHospital, uidCamaUTI )
                    socket.emit('responseServer_camaDesocupada', response)
                    break;

                case 6: 
                    response = await listaHospitales()
                    socket.emit('responseServer_listaHospitales', response)
                    break;

                case 7: 
                    response = await listaCamasPorHospital ( uidHospital )
                    socket.emit('responseServer_listaCamas', response)
                    break;

                case 8: 
                    response = await datosCamaUTI ( uidHospital, uidCamaUTI )
                    socket.emit('responseServer_datosCama', response)
                    break;

                default:
                    response = new ResponseServer({
                        estado: -1,
                        mensaje: 'No existe esta operación',
                        tipo_operacion,
                        respuesta: null
                    }).getResponseServer()
                    console.log('responseServer_problemSystem', response)
                    socket.emit('responseServer_problemSystem', response)
                    
                    break;
            }

        } catch (error) {
            let response = new ResponseServer({
                estado: 777,
                mensaje: 'Hubo un problema, no se puede realizar la transacción.',
                tipo_operacion,
                respuesta: error
            }).getResponseServer()
            console.log('responseServer_problemSystem', response)
            socket.emit('responseServer_problemSystem', response)
        }

    })

    // Desconeccion del cliente

    socket.on('disconnect', (socket) => {
        console.log(`Cliente desconectado..`)
    })

})