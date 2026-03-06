/* ===== ELEMENTOS GENERALES ===== */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const searchBtn = document.getElementById("searchIcon");
const searchBar = document.getElementById("searchBar");
const topBar = document.querySelector(".top-bar");

/* ===== MENÚ & BUSCADOR (Corregido) ===== */
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

/* ===== SCROLL TOP BAR ===== */
let lastScrollY = window.scrollY;
if (topBar) {
    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            topBar.classList.add("hide");
        } else {
            topBar.classList.remove("hide");
        }
        lastScrollY = currentScrollY;
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

/* ===== CARRITO (Re-vinculado) ===== */
let cart = [];
const cartIcon = document.getElementById("cartIcon");
const cartView = document.getElementById("cartView");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const addToCartBtn = document.getElementById("addToCart");
const payButton = document.getElementById("payButton");

function updateCart() {
    if (!cartItems || !cartTotal) return;
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `
            <span>${item.name}</span>
            <span>$${item.price.toLocaleString('es-AR')}</span>
        `;
        cartItems.appendChild(div);
        total += item.price;
    });
    cartTotal.textContent = total.toLocaleString('es-AR');
}

if (addToCartBtn) {
    addToCartBtn.onclick = function() {
        const name = viewTitle.textContent;
        const priceClean = viewPrice.textContent.replace("$", "").replace(/\./g, "").trim();
        const price = parseFloat(priceClean);

        cart.push({ name: name, price: price });
        updateCart();
        alert("Agregado al carrito");
    };
}

if (cartIcon && cartView) {
    cartIcon.onclick = function() {
        cartView.style.display = "flex";
    };
}

if (closeCart) {
    closeCart.onclick = function() {
        cartView.style.display = "none";
    };
}

if (payButton) {
    payButton.onclick = function() {
        const total = parseFloat(cartTotal.textContent.replace(/\./g, ""));
        if (total > 0) {
            alert("La seña a pagar (50%) es: $" + (total / 2).toLocaleString('es-AR'));
        } else {
            alert("El carrito está vacío");
        }
    };
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = e.target.getAttribute("data-section");
        const homeContent = document.getElementById("home-content");
        
        // 1. Ocultamos TODAS las secciones dinámicas
        document.querySelectorAll(".content-section").forEach(sec => {
            sec.style.display = "none";
        });

        // 2. Lógica de visualización
        if (sectionId === "inicio") {
            homeContent.style.display = "block";
        } else {
            homeContent.style.display = "none";
            const targetSec = document.getElementById(`sec-${sectionId}`);
            if (targetSec) targetSec.style.display = "block";
        }

        // Cerramos el menú
        document.getElementById("mobileMenu").style.display = "none";
        // Scroll al inicio para que no quede la pantalla a mitad de página
        window.scrollTo(0, 0);
    });
});