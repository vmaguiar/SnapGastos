import { Router } from "express";
import { authenticateJWT } from "../middlewares/authenticate";
import { deleteGasto, getAllMonthlyGastos, getGastosPorCategoria, postAddGasto, updateGasto } from "../controllers/GastosController";

const router = Router();

router.use(authenticateJWT);

// POST
router.post('/', postAddGasto);

// GET
router.get('/', getAllMonthlyGastos);
router.get('/analise/por-categoria', getGastosPorCategoria);
// router.get('/:id', getGasto);

// UPDATE
router.put('/:id', updateGasto);

// DELETE
router.delete('/:id', deleteGasto);

export default router;