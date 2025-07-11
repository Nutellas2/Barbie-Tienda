// Variables globales
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const contenedorProductos = document.getElementById("contenedor-productos"); // Solo en index.html
const listaCarrito = document.getElementById("lista-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const totalCarrito = document.getElementById("total");
const carritoSeccion = document.getElementById("carrito");
const accesosRapidos = document.getElementById("accesos-rapidos");

// Mostrar productos en index.html (productos.json)
if (contenedorProductos) {
  fetch("productos.json")
    .then((res) => res.json())
    .then((productos) => {
      mostrarProductos(productos);
      // Guardar productos para referencia (index)
      sessionStorage.setItem("productos", JSON.stringify(productos));
    })
    .catch((error) => {
      console.error("Error al cargar productos:", error);
      contenedorProductos.innerHTML = "<p>No se pudieron cargar los productos. Intentá más tarde.</p>";
    });
}

// Función para mostrar productos (index)
function mostrarProductos(productos) {
  contenedorProductos.innerHTML = "";
  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.classList.add("producto");
    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <p>${producto.nombre}</p>
      <p>$${producto.precio}</p>
      <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(card);
  });
}

// Función para agregar producto al carrito (compatible con ambos formatos)
function agregarAlCarrito(id) {
  const productos = JSON.parse(sessionStorage.getItem("productos"));
  if (!productos) {
    alert("No se encuentran los productos para agregar al carrito.");
    return;
  }

  const producto = productos.find((p) => p.id === id);
  if (!producto) {
    alert("Producto no encontrado.");
    return;
  }

  // Normalizar producto: verificar si viene de productos.json (index) o DummyJSON (otros-productos.html)
  const productoFormateado = {
    id: producto.id,
    nombre: producto.nombre || producto.title || "Sin nombre",
    precio: producto.precio || producto.price || 0,
    imagen: producto.imagen || producto.thumbnail || "",
  };

  const existente = carrito.find((item) => item.id === id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...productoFormateado, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
  mostrarMensaje("Producto agregado al carrito");
}

// Mostrar u ocultar carrito
function mostrarCarrito() {
  carritoSeccion.classList.toggle("visible");
}

// Actualizar contenido del carrito y total
function actualizarCarrito() {
  if (!listaCarrito || !contadorCarrito || !totalCarrito) return;

  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;

    const li = document.createElement("li");

    li.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" style="width:50px; vertical-align:middle; margin-right:10px;">
      <strong>${item.nombre}</strong>
      <input type="number" min="1" value="${item.cantidad}" 
        style="width: 50px; margin-left: 10px;"
        onchange="cambiarCantidad(${item.id}, this.value)" />
      x $${(item.precio * item.cantidad).toFixed(2)}
      <button onclick="eliminarDelCarrito(${item.id})" aria-label="Eliminar ${item.nombre}">Eliminar</button>
    `;

    listaCarrito.appendChild(li);
  });

  contadorCarrito.textContent = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
  totalCarrito.textContent = `Total: $${total.toFixed(2)}`;
}

// Cambiar cantidad de producto en carrito
function cambiarCantidad(id, cantidadNueva) {
  cantidadNueva = parseInt(cantidadNueva);
  if (cantidadNueva < 1 || isNaN(cantidadNueva)) {
    alert("La cantidad debe ser un número válido y mayor a 0.");
    actualizarCarrito();
    return;
  }

  const item = carrito.find((prod) => prod.id === id);
  if (item) {
    item.cantidad = cantidadNueva;
    guardarCarrito();
    actualizarCarrito();
  }
}

// Eliminar producto del carrito por id
function eliminarDelCarrito(id) {
  carrito = carrito.filter((item) => item.id !== id);
  guardarCarrito();
  actualizarCarrito();
}

// Guardar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Mostrar mensaje flotante
function mostrarMensaje(texto) {
  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.style.position = "fixed";
  msg.style.bottom = "20px";
  msg.style.right = "20px";
  msg.style.background = "hotpink";
  msg.style.color = "white";
  msg.style.padding = "10px 20px";
  msg.style.borderRadius = "10px";
  msg.style.boxShadow = "0 0 10px #ff69b4";
  msg.style.zIndex = "1000";
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 2000);
}

// Función para finalizar compra
function finalizarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 🛒");
    return;
  }

  alert("¡Muchas gracias por tu compra! 🎉🛍️");

  carrito = [];
  guardarCarrito();
  actualizarCarrito();

  if (carritoSeccion) {
    carritoSeccion.classList.remove("visible");
  }
}

// Inicializar carrito al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();
});

// Función para mostrar secciones según hash (opcional, si lo usás)
function mostrarSeccionSegunHash() {
  const hash = window.location.hash;
  const secciones = ["inicio", "productos", "regalos", "contacto"];

  secciones.forEach((seccion) => {
    const elem = document.getElementById(seccion);
    if (!elem) return;

    if (!hash && seccion === "inicio") {
      elem.classList.remove("oculto");
    } else if ("#" + seccion === hash) {
      elem.classList.remove("oculto");
    } else {
      elem.classList.add("oculto");
    }
  });

  if (accesosRapidos) {
    if (!hash || hash === "#inicio") {
      accesosRapidos.classList.remove("oculto");
    } else {
      accesosRapidos.classList.add("oculto");
    }
  }
}

window.addEventListener("load", mostrarSeccionSegunHash);
window.addEventListener("hashchange", mostrarSeccionSegunHash);
