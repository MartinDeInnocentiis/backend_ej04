import express from "express";
import { engine } from "express-handlebars";
import { __filename, __dirname } from "./utils.js";
import { createServer } from "http";
import { Server } from "socket.io";
import productRouter from "./routes/views.router.js";
import realtimeRouter from "./routes/views.realTime.router.js";
import { guardarProducto } from "./services/productUtils.js";
import {  deleteProduct } from "./services/productUtils.js";


const app = express();
const httpServer = createServer(app);
const PORT = 8080;

//SE CONFIGURA EL MIDDLEWARE PARA SOLICITUDES JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//SE CONFIGURA EL DIRECTORIO ESTATICO PARA ARCHIVOS PUBLICOS
app.use(express.static("public"));


//SE CONFIGURA EL MOTOR DE PLANTILLAS HANDLEBARS
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", `${__dirname}/views`);


//SE CONFIGURAN LAS RUTAS PARA LAS VISTAS
app.use("/", productRouter);
app.use("/realtime", realtimeRouter);

//SE INICIA EL SERVIDOR HTTP
httpServer.listen(PORT, () => {
  console.log("SERVER RUNNING AT PORT: " + PORT);
});

httpServer.on("error", (err) => {
  console.log("SERVER ERROR: " + err);
});

//CONFIGURACION DEL LADO DEL SERVIDOR
const io = new Server (httpServer);

//SE INICIA LA CONEXION
io.on("connection", (socket) => {
  console.log("NEW CLIENT ON");

  //SE MANEJAN LOS EVENTOS
  socket.on("message", (data) => {
      console.log("MESSAGE RECIEVED: ", data);

      //SE ENVÍA RESPUESTA AL CLIENTE
      socket.emit ("respuesta", "MESSAGE RECIEVED OK")
      });


  socket.on ("agregarProducto", (newProduct) => {
    console.log ("PRODUCT ADDED: ", newProduct);
    guardarProducto(newProduct);

    //AGREGAR EL NUEVO PRODUCTO A LA LISTA
    io.emit ("nuevoProductoAgregado", newProduct);
  });

  socket.on("delete-product", productId => {
    const {id} = productId
    deleteProduct(id) // FUNCION DE PRODUCTUTILS QUE BORRA EL PRODUCTO
    socket.emit('delete-product', id)
});
    
  socket.on ("disconnect", () => {
    console.log ("CLIENT OFFLINE");
  });
}) 