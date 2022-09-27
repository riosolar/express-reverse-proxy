const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const AxiosParamsObject = require('./classes/AxiosParamsObject')

const {encryptString} = require('pluspagos-aes-encryption');


app.use(cors({
    origin: '*'
}))

require('dotenv').config()


app.get('/status', function (req, res) {
    // Remove any trailing slash from base url
    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/health'
    //const endpoint = 'https://catfact.ninja/fact'

    const paramsObj = new AxiosParamsObject()
    //paramsObj.setApiKey(process.env.API_KEY_PARAM_NAME, process.env.API_KEY)
    paramsObj.addParamsFromRequest(req)

    axios.get(endpoint, {
        params: paramsObj.getParams(req)
    }).then(response => {
        res.json(response.data)
        console.log(response.data)
    }).catch(error => {
        res.json(error)
        console.log(error)
    })
})

app.get('/auth', function (req, res) {
    // Remove any trailing slash from base url
    const endpoint = 'https://sandboxpp.asjservicios.com.ar:8082/v1/sesion'
    //const endpoint = 'https://catfact.ninja/fact'

    //const paramsObj = new AxiosParamsObject()
    //paramsObj.setApiKey(process.env.API_KEY_PARAM_NAME, process.env.API_KEY)
    //paramsObj.addParamsFromRequest(req)

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
        console.log(response.data)
    }).catch(error => {
        res.json(error)
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
    
    callbackSucces = encryptString (callbackSucces, secretKey);
    callbackCancel = encryptString (callbackCancel, secretKey);
    sucursalComercio = encryptString (sucursalComercio, secretKey);
    monto = encryptString (monto, secretKey);

    axios({
        method: 'post',
        url: endpoint,
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



app.listen(3000)