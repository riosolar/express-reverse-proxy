const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const AxiosParamsObject = require('./classes/AxiosParamsObject')

const { encryptString } = require('pluspagos-aes-encryption');

const sesionToken = 'https://sandboxpp.asjservicios.com.ar:8082/v1/sesion'
const tarjetaToken = 'https://sandboxpp.asjservicios.com.ar:8082/v1/tokens'
const tarjetaPago = 'https://sandboxpp.asjservicios.com.ar:8082/v1/payment'

app.use(cors({
    origin: '*'
}))

require('dotenv').config()


app.get('/status', function (req, res) {
    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/health'
    axios.get(endpoint, {
    }).then(response => {
        res.json(response.data)
        console.log(response.data)
    }).catch(error => {
        res.json(error)
        console.log(error)
    })
})

app.get('/all', function (req, res) {

    const totalOrden = req.query.total
    const iPuser = req.query.iPuser
    const anioVencimiento = req.query.anioVencimiento
    const mesVencimiento = req.query.mesVencimiento
    const codigoTarjeta = req.query.codigoTarjeta
    const dni = req.query.dni
    const email = req.query.email
    const fechaNac = req.query.fechaNac
    const tarjetaN = req.query.tarjetaN
    const tipoDoc = req.query.tipoDoc
    const titular = req.query.titular

    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const txID = String(randomIntFromInterval(1, 10000000))
    console.log(txID, "txid")

    // Send a POST request
    axios({
        method: 'post',
        url: sesionToken,
        data: {
            'guid': '022ac921-91f3-4540-b0c2-d7b989f16d55',
            'frase': 'sG6z60JSsMEeZnwTqT1M3fG9DQUKPvABsxKitqgDhac='
        }
    }).then(response => {
        //res.json(response.data)
        console.log(response.data.data) // AUTH TOKEN
        const tokenSesion = response.data.data
        axios({
            method: 'post',
            url: tarjetaToken,
            headers: {
                ContentType: 'application/json',
                Authorization: 'Bearer ' + tokenSesion
            },
            data: {
                Comercio: '022ac921-91f3-4540-b0c2-d7b989f16d55',
                SucursalComercio: null,
                Productos: '',
                TotalOperacion: totalOrden,
                TransaccionComercioId: txID,
                Ip: iPuser
            }
        }).then(response => {
            //res.json(response.data)
            console.log(response.data.data, 'token de pago') //TOKEN DE PAGO
            const tdepago = response.data.data
            axios({
                method: 'post',
                url: tarjetaPago,
                headers: {
                    'Content-type': 'application/json',
                    'X-Token': tdepago,
                    'Authorization': 'Bearer '+tokenSesion

                },
                data: {
                    'DatosTarjeta': {
                        'AñoVencimiento': anioVencimiento, //23
                        'MesVencimiento': mesVencimiento, // 08
                        'CodigoTarjeta': codigoTarjeta, // 123
                        'DocumentoTitular': dni, // 25123456
                        'Email': email, // test@test.com
                        'FechaNacimientoTitular': fechaNac, //12031993
                        'NumeroPuertaResumen': '20',
                        'NumeroTarjeta': tarjetaN, // 5299910010000015
                        'TipoDocumento': tipoDoc, //DNI
                        'TitularTarjeta': titular //Juan de los Palotes
                    },
                    'AceptaHabeasData': false,
                    'AceptTerminosyCondiciones': true,
                    'CantidadCuotas': 1,
                    'IPCliente': '186.122.108.170',
                    'MedioPagoId': 7
                }
            }).then(response => {
                //res.json(response.data)
                console.log(response.data)

            }).catch(error => {
                //res.json(error)
                console.log(error)
            })

        }).catch(error => {
            //res.json(error)
            console.log(error)
        })


    }).catch(error => {
        //res.json(error)
        console.log(error)
    })

})

app.get('/pay', function (req, res) {

    const endpoint = 'https://sandboxpp.asjservicios.com.ar'


    var secretKey = 'FONDODECREDITOSSAPEM_1bc7baea-27a7-437a-b91b-9878c4df3025';
    var callbackSucces = 'http://www.test.com.ar/success';
    var callbackCancel = 'http://www.test.com.ar/cancel';
    var sucursalComercio = '';

    var monto = '1500';

    callbackSucces = encryptString(callbackSucces, secretKey);
    callbackCancel = encryptString(callbackCancel, secretKey);
    sucursalComercio = encryptString(sucursalComercio, secretKey);
    monto = encryptString(monto, secretKey);

    axios({
        method: 'post',
        url: endpoint,
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NjQzMDMwNDYsImV4cCI6MTY2NDMxNzQ0NiwiaXNzIjoiaHR0cDovL0FTSlBBR09TU0IwMVA6ODA4Ni8iLCJhdWQiOiJodHRwOi8vQVNKUEFHT1NTQjAxUDo4MDgyLyIsIk5vbWJyZSI6IkZPTkRPIERFIENSRURJVE9TIFNBUEVNIiwiQ29tZXJjaW9JZCI6MTYyNzF9.XcdIFD381BJRQNx4KDzRFktcVgypVNCTf43su1jd2F4'

        },
        data: {
            callbackSucces,
            callbackCancel,
            sucursalComercio,
            monto
        }
    }).then(response => {
        res.json(response.data)
        console.log(response.data)
    }).catch(error => {
        res.json(error)
        console.log(error)
    })

})

app.get('/tarjetaToken', function (req, res) {
  

    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/tokens'

    const txId = req.query.nFactura
    const totalOrden = req.query.total
    const iPuser = req.query.iPuser
  
    axios({
        method: 'post',
        url: endpoint,
        headers: {
            ContentType: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NjQ0Njk5MzUsImV4cCI6MTY2NDQ4NDMzNSwiaXNzIjoiaHR0cDovL0FTSlBBR09TU0IwMVA6ODA4Ni8iLCJhdWQiOiJodHRwOi8vQVNKUEFHT1NTQjAxUDo4MDgyLyIsIk5vbWJyZSI6IkZPTkRPIERFIENSRURJVE9TIFNBUEVNIiwiQ29tZXJjaW9JZCI6MTYyNzF9.UjaxtfDWDZFNZumLT5oMVJaEmP8Vbi6F5LJHsyJUECw'
        },
        data: {
            Comercio: '022ac921-91f3-4540-b0c2-d7b989f16d55',
            SucursalComercio: null,
            Productos: '',
            TotalOperacion: totalOrden,
            TransaccionComercioId: txId,
            Ip: iPuser
        }
    }).then(response => {
        res.json(response.data)
        console.log(response.data)
    }).catch(error => {
        res.json(error)
        console.log(error)
    })



})

app.get('/tarjetaPago', function (req, res) {

    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/payment'

    axios({
        method: 'post',
        url: endpoint,
        headers: {
            'Content-type': 'application/json',
            'X-Token': '4fe1029d-acc7-4f5f-a6ff-c2708820777a',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NjQzMDMwNDYsImV4cCI6MTY2NDMxNzQ0NiwiaXNzIjoiaHR0cDovL0FTSlBBR09TU0IwMVA6ODA4Ni8iLCJhdWQiOiJodHRwOi8vQVNKUEFHT1NTQjAxUDo4MDgyLyIsIk5vbWJyZSI6IkZPTkRPIERFIENSRURJVE9TIFNBUEVNIiwiQ29tZXJjaW9JZCI6MTYyNzF9.XcdIFD381BJRQNx4KDzRFktcVgypVNCTf43su1jd2F4'

        },

        data: {
            'DatosTarjeta': {
                'AñoVencimiento': '23',
                'MesVencimiento': '08',
                'CodigoTarjeta': '123',
                'DocumentoTitular': '25123456',
                'Email': 'test@test.com',
                'FechaNacimientoTitular': '12031993',
                'NumeroPuertaResumen': '20',
                'NumeroTarjeta': '5299910010000015',
                'TipoDocumento': 'DNI',
                'TitularTarjeta': 'Juan de los Palotes'
            },
            'AceptaHabeasData': false,
            'AceptTerminosyCondiciones': true,
            'CantidadCuotas': 1,
            'IPCliente': '186.122.108.170',
            'MedioPagoId': 7
        }
    }).then(response => {
        //res.json(response.data)
        console.log(response.data)

    }).catch(error => {
        res.json(error)
        console.log(error)
    })

})


app.get('/auth', function (req, res) {
    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/sesion'

    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    const txID = String(randomIntFromInterval(1, 10000000))
    console.log(txID, "txid")

    // Send a POST request
    axios({
        method: 'post',
        url: endpoint,
        data: {
            'guid': '022ac921-91f3-4540-b0c2-d7b989f16d55',
            'frase': 'sG6z60JSsMEeZnwTqT1M3fG9DQUKPvABsxKitqgDhac='
        }
    }).then(response => {
        res.json(response.data)
        console.log(response.data.data) // AUTH TOKEN
    })

})


app.get('/makePayment', function (req, res) {

    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    const txID = String(randomIntFromInterval(1, 10000000))
    console.log(txID, "txid")

    // Send a POST request
    axios({
        method: 'post',
        url: sesionToken,
        data: {
            'guid': '022ac921-91f3-4540-b0c2-d7b989f16d55',
            'frase': 'sG6z60JSsMEeZnwTqT1M3fG9DQUKPvABsxKitqgDhac='
        }
    }).then(response => {
        //res.json(response.data)
        console.log(response.data.data) // AUTH TOKEN

        axios({
            method: 'post',
            url: tarjetaToken,
            headers: {
                ContentType: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NjQzMDMwNDYsImV4cCI6MTY2NDMxNzQ0NiwiaXNzIjoiaHR0cDovL0FTSlBBR09TU0IwMVA6ODA4Ni8iLCJhdWQiOiJodHRwOi8vQVNKUEFHT1NTQjAxUDo4MDgyLyIsIk5vbWJyZSI6IkZPTkRPIERFIENSRURJVE9TIFNBUEVNIiwiQ29tZXJjaW9JZCI6MTYyNzF9.XcdIFD381BJRQNx4KDzRFktcVgypVNCTf43su1jd2F4'
            },
            data: {
                Comercio: '022ac921-91f3-4540-b0c2-d7b989f16d55',
                SucursalComercio: null,
                Productos: '',
                TotalOperacion: '250000',
                TransaccionComercioId: txID,
                Ip: '186.122.108.170'
            }
        }).then(response => {
            //res.json(response.data)
            console.log(response.data)
            const tokenDePago = response.data.data
            axios({
                method: 'post',
                url: tarjetaPago,
                headers: {
                    'Content-type': 'application/json',
                    'X-Token': tokenDePago,
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NjQzMDMwNDYsImV4cCI6MTY2NDMxNzQ0NiwiaXNzIjoiaHR0cDovL0FTSlBBR09TU0IwMVA6ODA4Ni8iLCJhdWQiOiJodHRwOi8vQVNKUEFHT1NTQjAxUDo4MDgyLyIsIk5vbWJyZSI6IkZPTkRPIERFIENSRURJVE9TIFNBUEVNIiwiQ29tZXJjaW9JZCI6MTYyNzF9.XcdIFD381BJRQNx4KDzRFktcVgypVNCTf43su1jd2F4'

                },

                data: {
                    'DatosTarjeta': {
                        'AñoVencimiento': '23',
                        'MesVencimiento': '08',
                        'CodigoTarjeta': '123',
                        'DocumentoTitular': '25123456',
                        'Email': 'test@test.com',
                        'FechaNacimientoTitular': '12031993',
                        'NumeroPuertaResumen': '20',
                        'NumeroTarjeta': '5299910010000015',
                        'TipoDocumento': 'DNI',
                        'TitularTarjeta': 'Juan de los Palotes'
                    },
                    'AceptaHabeasData': false,
                    'AceptTerminosyCondiciones': true,
                    'CantidadCuotas': 1,
                    'IPCliente': '186.122.108.170',
                    'MedioPagoId': 7
                }
            }).then(response => {
                res.json(response.data)
                console.log(response.data)

            }).catch(error => {
                res.json(error)
                console.log(error)
            })
        }).catch(error => {
            res.json(error)
            console.log(error)
        })
    })

})


app.get('/txs', function (req, res) {
    // Send a POST request
    axios({
        method: 'post',
        url: 'https://sandboxpp.asjservicios.com.ar:8082/v1/transactions',
        params: {
            FechaDesde: '26/09/2022'
        }
    }).then(response => {
        res.json(response.data)
        console.log(response.data.data) // AUTH TOKEN
    })

})

app.get('/tx', function (req, res) {
    // Remove any trailing slash from base url
    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/transactions'
    //const endpoint = 'https://catfact.ninja/fact'

    // Send a POST request
    axios({
        method: 'get',
        url: endpoint,
        headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE2NjQzMDMwNDYsImV4cCI6MTY2NDMxNzQ0NiwiaXNzIjoiaHR0cDovL0FTSlBBR09TU0IwMVA6ODA4Ni8iLCJhdWQiOiJodHRwOi8vQVNKUEFHT1NTQjAxUDo4MDgyLyIsIk5vbWJyZSI6IkZPTkRPIERFIENSRURJVE9TIFNBUEVNIiwiQ29tZXJjaW9JZCI6MTYyNzF9.XcdIFD381BJRQNx4KDzRFktcVgypVNCTf43su1jd2F4'
        },
        /* data: {
             'guid': '022ac921-91f3-4540-b0c2-d7b989f16d55',
             'frase': 'sG6z60JSsMEeZnwTqT1M3fG9DQUKPvABsxKitqgDhac='
         }*/
        params: {
            FechaDesde: '26/09/2022'
        }
    }).then(response => {
        res.json(response.data)
        console.log(response.data.data) // AUTH TOKEN
    })

})
app.listen(3000)

module.exports = app;


