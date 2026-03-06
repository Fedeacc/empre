window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    
    // Le damos un pequeño delay extra para que no sea un "flash" muy rápido
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 1000); // 1 segundo de gracia
});

/* ===== ELEMENTOS GENERALES ===== */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const searchBtn = document.getElementById("searchIcon");
const searchBar = document.getElementById("searchBar");
const topBar = document.querySelector(".top-bar");

/* ===== MENÚ & BUSCADOR ===== */
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
        mobileMenu.style.display = (mobileMenu.style.display === "flex") ? "none" : "flex";
        if (searchBar) searchBar.style.display = "none";
    });
}

if (searchBtn && searchBar) {
    searchBtn.addEventListener("click", () => {
        searchBar.style.display = (searchBar.style.display === "block") ? "none" : "block";
        if (mobileMenu) mobileMenu.style.display = "none";
    });
}

/* ===== VISOR DE PRODUCTO ===== */
const products = document.querySelectorAll(".view-product");
const productView = document.getElementById("productView");
const viewImage = document.getElementById("viewImage");
const viewTitle = document.getElementById("viewTitle");
const viewPrice = document.getElementById("viewPrice");
const viewDescription = document.getElementById("viewDescription");
const closeView = document.getElementById("closeView");

products.forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        if (card && productView) {
            viewImage.src = card.dataset.image;
            viewTitle.textContent = card.dataset.name;
            viewPrice.textContent = card.dataset.price;
            viewDescription.textContent = card.dataset.description;
            productView.style.display = "flex";
        }
    });
});

if (closeView) {
    closeView.addEventListener("click", () => {
        productView.style.display = "none";
    });
}

/* ===== LÓGICA DEL CARRITO ===== */
let cart = [];
let montoSeleccionado = 0;
let tipoDePago = "";

const cartIcon = document.getElementById("cartIcon");
const cartView = document.getElementById("cartView");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartSenia = document.getElementById("cartSenia");
const addToCartBtn = document.getElementById("addToCart");

function updateCart() {
    if (!cartItems || !cartTotal || !cartSenia) return;

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item-row";
        div.style.borderBottom = "1px solid #eee";
        div.style.padding = "10px 0";

       // Dentro del forEach de updateCart, reemplazá la parte del div.innerHTML:
// Dentro del forEach de updateCart
div.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 1px 0; border-bottom: 1px solid #eee;">
        <span style="font-weight: 500; color: #000000; text-align: left;">${item.name}</span>
        
        <div style="display: flex; align-items: center; gap: 15px; margin-left: auto;">
            <span style="font-weight: bold; color: #000000;">$${item.price.toLocaleString('es-AR')}</span>
            <button onclick="eliminarProducto(${index})" style="background: none; border: none; color: #112a4a; cursor: pointer; font-size: 1.5rem; font-weight: bold; line-height: 1; padding: 0 5px;">
                ×
            </button>
        </div>
    </div>
`;
        cartItems.appendChild(div);
        total += item.price;
    });

    const senia = total / 2;
    cartTotal.textContent = total.toLocaleString('es-AR');
    cartSenia.textContent = senia.toLocaleString('es-AR');
    updateCartCounter();
}// <-- AQUÍ TERMINA LA FUNCIÓN updateCart

/* ===== EVENTOS DE APERTURA Y CIERRE (FUERA DE LA FUNCIÓN) ===== */

if (cartIcon && cartView) {
    cartIcon.onclick = function(e) {
        e.preventDefault(); 
        cartView.style.display = "flex"; 
        updateCart(); 
    };
}

if (closeCart) {
    closeCart.onclick = function() {
        cartView.style.display = "none"; 
        if (document.getElementById("transfer-step")) {
            cancelarPago(); 
        }
    };
}

/* ===== FLUJO DE PAGO Y TRANSFERENCIA ===== */
function copiarAlias() {
    const alias = document.getElementById("alias-text").textContent;
    navigator.clipboard.writeText(alias);
    showToast("¡Alias copiado! 📋");
}

function prepararTransferencia(tipo) {
    // Referencias a elementos
    const inputName = document.getElementById("cust-name");
    const inputWsp = document.getElementById("cust-wsp");
    const errorName = document.getElementById("error-name");
    const errorWsp = document.getElementById("error-wsp");

    const nombre = inputName.value.trim();
    const wsp = inputWsp.value.trim();
    const soloNumeros = /^\d+$/; // Regex para validar solo números

    let esValido = true;

    // Validación Nombre (mínimo 3)
    if (nombre.length < 3) {
        errorName.style.display = "block";
        inputName.style.borderColor = "red";
        esValido = false;
    } else {
        errorName.style.display = "none";
        inputName.style.borderColor = "#ccc";
    }

    // Validación Teléfono (exactamente 10 números)
    if (wsp.length !== 10 || !soloNumeros.test(wsp)) {
        errorWsp.style.display = "block";
        inputWsp.style.borderColor = "red";
        esValido = false;
    } else {
        errorWsp.style.display = "none";
        inputWsp.style.borderColor = "#ccc";
    }

    if (!esValido) {
        showToast("Revisá los datos marcados en rojo ✍️");
        return; // No deja pasar al Alias
    }

    // Si todo está ok, procedemos con los cálculos
    const totalRaw = document.getElementById("cartTotal").textContent.replace(/\./g, "");
    const total = parseFloat(totalRaw);

    tipoDePago = tipo === 'total' ? 'Total' : 'Seña 50%';
    montoSeleccionado = tipo === 'total' ? total : (total / 2);

    document.getElementById("display-monto-transfer").textContent = montoSeleccionado.toLocaleString('es-AR');
    
    document.getElementById("initial-cart-buttons").style.display = "none";
    document.getElementById("customer-data").style.display = "none";
    document.getElementById("transfer-step").style.display = "block";
}

function cancelarPago() {
    document.getElementById("initial-cart-buttons").style.display = "flex";
    document.getElementById("customer-data").style.display = "block"; // Volvemos a mostrar el formulario
    document.getElementById("transfer-step").style.display = "none";
    
    // Limpiamos los bordes rojos por si acaso
    document.getElementById("error-name").style.display = "none";
    document.getElementById("error-wsp").style.display = "none";
    document.getElementById("cust-name").style.borderColor = "#ccc";
    document.getElementById("cust-wsp").style.borderColor = "#ccc";
}

// Vincular botones de pago
document.getElementById("btn-select-full").onclick = () => prepararTransferencia('total');
document.getElementById("btn-select-senia").onclick = () => prepararTransferencia('senia');

document.getElementById("btn-confirm-wsp").onclick = function() {
    // 1. Capturamos los datos de los inputs
    const nombreCliente = document.getElementById("cust-name").value.trim();
    const wspCliente = document.getElementById("cust-wsp").value.trim();

    // 2. Armamos la lista de productos
    let listaProductos = "";
    cart.forEach(item => {
        listaProductos += `- ${item.name} ($${item.price.toLocaleString('es-AR')})%0A`;
    });

    // 3. Creamos el mensaje incluyendo los datos del cliente
    const mensajeWSP = `¡Hola VITAE! 👋%0A%0A` +
        `*Datos del Cliente:*%0A` +
        `- Nombre: ${nombreCliente}%0A` +
        `- Contacto: ${wspCliente}%0A%0A` +
        `*Detalle del pedido:*%0A${listaProductos}%0A` +
        `*Monto transferido (${tipoDePago}):* $${montoSeleccionado.toLocaleString('es-AR')}%0A%0A` +
        `Ya realicé la transferencia. Adjunto comprobante. 📸`;

    // 4. Abrimos WhatsApp
    window.open(`https://wa.me/2215111026?text=${mensajeWSP}`, "_blank");
};

/* ===== AGREGAR AL CARRITO ===== */
/* Volvé a ponerlo así */
if (addToCartBtn) {
    addToCartBtn.onclick = function() {
        const name = viewTitle.textContent;
        const priceClean = viewPrice.textContent.replace("$", "").replace(/\./g, "").trim();
        const price = parseFloat(priceClean);

        cart.push({ name: name, price: price }); // Sin qty ni unitPrice
        updateCart();
        updateCartCounter();
        saveCart();
        showToast("¡Agregado al carrito! ✨");
    };
}

/* ===== NAVEGACIÓN SECCIONES ===== */
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = e.target.closest(".nav-link").getAttribute("data-section");
        const homeContent = document.getElementById("home-content");
        
        document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");

        if (sectionId === "inicio") {
            homeContent.style.display = "block";
        } else {
            homeContent.style.display = "none";
            const targetSec = document.getElementById(`sec-${sectionId}`);
            if (targetSec) targetSec.style.display = "block";
        }
        mobileMenu.style.display = "none";
        window.scrollTo(0, 0);
    });
});

/* ===== UTILIDADES ===== */
function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
        position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "#112a4a", color: "#ffffff", padding: "12px 24px",
        borderRadius: "30px", zIndex: "9999", opacity: "0", transition: "all 0.4s ease"
    });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(-10px)"; }, 100);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 3000);
}

// Guardar carrito
function saveCart() {
    localStorage.setItem("vitae_cart", JSON.stringify(cart));
}

// Cargar carrito al iniciar la página
function loadCart() {
    const saved = localStorage.getItem("vitae_cart");
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
        updateCartCounter(); // Para el punto 3
    }
}

// Llama a loadCart() al final de tu archivo JS
loadCart();
updateCartCounter(); // Para mostrar el contador correcto al cargar la página

function eliminarProducto(index) {
    // 1. Quitamos el producto del array usando su posición (index)
    cart.splice(index, 1);
    
    // 2. Notificamos al usuario
    showToast("Producto eliminado");
    
    // 3. Sincronizamos todo
    updateCart();        // Refresca la lista visual
    updateCartCounter(); // Actualiza el numerito rojo del icono
    saveCart();          // Guarda el cambio en localStorage para que no vuelva al recargar
    
    // 4. Si el carrito quedó vacío, volvemos a mostrar los botones de pago iniciales
    if (cart.length === 0) {
        cancelarPago();
    }
}

function updateCartCounter() {
    const countElement = document.getElementById("cart-count");
    if (!countElement) return;
    
    if (cart.length > 0) {
        countElement.textContent = cart.length;
        countElement.style.display = "flex"; // Usamos flex para centrar el número
        countElement.style.alignItems = "center";
        countElement.style.justifyContent = "center";
    } else {
        countElement.style.display = "none";
    }
}

let currentQty = 1;

function changeQty(value) {
    currentQty += value;
    if (currentQty < 1) currentQty = 1; // Evitamos cantidades menores a 1
    document.getElementById("productQty").textContent = currentQty;
}

// Al abrir cualquier producto, resetear siempre a 1
products.forEach(button => {
    button.addEventListener("click", () => {
        currentQty = 1;
        document.getElementById("productQty").textContent = currentQty;
        // ... (resto de tu lógica para abrir el visor)
    });
});

function updateQtyInCart(index, change) {
    const item = cart[index];
    
    // Actualizamos la cantidad
    item.qty += change;
    
    // Si la cantidad llega a 0, mejor lo eliminamos
    if (item.qty < 1) {
        eliminarProducto(index);
        return;
    }

    // Recalculamos el precio total de esa línea (Cantidad * Precio Unitario)
    item.price = item.qty * item.unitPrice;

    // Sincronizamos todo
    saveCart();
    updateCart();
}