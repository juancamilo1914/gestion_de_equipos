const express = require('express')

const respuesta = require('../../red/respuestas')
const controlador = require('./index')

const router = express.Router()

router.get('/', async function(req,res,next){
    try{
        const lista = await controlador.listar()
        respuesta.succes(req, res, lista, 200)
    }catch(err){
        next(err)
    }
})

router.post('/', async function(req,res,next){
    try{
        const data = req.body
        const result = await controlador.agregar(data)
        respuesta.succes(req, res, result, 201)
    }catch(err){
        next(err)
    }
})

router.put('/:id', async function(req,res,next){
    try{
        const id = req.params.id
        const data = req.body
        const result = await controlador.actualizar(id, data)
        respuesta.succes(req, res, result, 200)
    }catch(err){
        next(err)
    }
})

router.patch('/:id/realizado', async function(req,res,next){
    try{
        const id = req.params.id
        const realizado = req.body.realizado !== undefined ? req.body.realizado : 1
        const result = await controlador.actualizar(id, { realizado })
        respuesta.succes(req, res, result, 200)
    }catch(err){
        next(err)
    }
})

router.delete('/:id', async function(req,res,next){
    try{
        const id = req.params.id
        const result = await controlador.eliminar(id)
        respuesta.succes(req, res, result, 200)
    }catch(err){
        next(err)
    }
})

module.exports = router
