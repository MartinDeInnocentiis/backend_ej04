import { Router } from "express";

import { __filename, __dirname } from "../utils.js";
import {
  obtenerListaDeProductos,
  guardarProducto,
} from "../services/productUtils.js";

const realtimeRouter = Router();

realtimeRouter.get("/", (req, res) => {
  const products = obtenerListaDeProductos();

  res.render("realtimeproducts", { products });
});

export default realtimeRouter;