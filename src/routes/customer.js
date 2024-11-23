const express=require('express');
const router=express.Router();

const customerController=require('../controllers/customerController');
router.get('/',customerController.list)
router.post('/add',customerController.save)
router.get('/delete/:id',customerController.delete)//recibe parametro de la vista
router.get('/update/:id',customerController.edit)//recibe parametro para actualizar
router.post('/update/:id',customerController.update)//recibe parametro para actualizar
router.get('/api/customers/:id',customerController.updateUser)


module.exports=router;
