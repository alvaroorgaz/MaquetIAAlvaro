// main.js - Versión con sistema de presupuesto y factura por email

// ============================================
// CONFIGURACIÓN DE PRECIOS (PRECIOS REALES DE LUJO)
// ============================================
const preciosProductos = {
    cala: {
        roble: { S: 3250, M: 4250, L: 5450 },
        nogal: { S: 3950, M: 4950, L: 6450 },
        blanco: { S: 2850, M: 3850, L: 4850 },
        negro: { S: 2850, M: 3850, L: 4850 },
        laton: { S: 4250, M: 5450, L: 6950 }
    },
    costa: {
        acero: { S: 2850, M: 3850, L: 4850 },
        roble: { S: 3250, M: 4250, L: 5450 },
        nogal: { S: 3250, M: 4250, L: 5450 },
        blanco: { S: 2450, M: 3450, L: 4450 },
        negro: { S: 2450, M: 3450, L: 4450 }
    },
    horizonte: {
        laton: { S: 6200, M: 7900, L: 9800 },
        acero: { S: 5800, M: 7400, L: 9200 },
        negro: { S: 5200, M: 6800, L: 8600 },
        blanco: { S: 5200, M: 6800, L: 8600 },
        roble: { S: 5200, M: 6800, L: 8600 }
    },
    mar: {
        madera: { S: 5400, M: 6900, L: 8600 },
        combinado: { S: 4800, M: 6200, L: 7800 },
        negro: { S: 4200, M: 5600, L: 7200 },
        blanco: { S: 4200, M: 5600, L: 7200 }
    },
    puerto: {
        basico: { S: 2890, M: 3890, L: 4890 },
        nogal: { S: 3290, M: 4290, L: 5290 },
        acero: { S: 2990, M: 3990, L: 4990 },
        negro: { S: 2690, M: 3690, L: 4690 },
        blanco: { S: 2690, M: 3690, L: 4690 }
    },
    isla: {
        roble: { S: 3750, M: 4750, L: 5950 },
        nogal: { S: 4450, M: 5450, L: 6750 },
        negro: { S: 3250, M: 4250, L: 5350 },
        blanco: { S: 3250, M: 4250, L: 5350 }
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let presupuesto = [];
let productoActual = {
    id: '',
    nombre: '',
    material: '',
    talla: 'M',
    precio: 0
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarPresupuesto();
    actualizarContadorPresupuesto();
    iniciarNavbarScroll();
    cerrarMenuMovil();
    inicializarSelectorTallas();
    inicializarSelectorMateriales();
    inicializarBotonPresupuesto();
    inicializarBotonVerPresupuesto();
});

// ============================================
// FUNCIONES DEL PRESUPUESTO
// ============================================
function cargarPresupuesto() {
    const presupuestoGuardado = localStorage.getItem('origenPresupuesto');
    if (presupuestoGuardado) {
        presupuesto = JSON.parse(presupuestoGuardado);
    } else {
        presupuesto = [];
    }
}

function guardarPresupuesto() {
    localStorage.setItem('origenPresupuesto', JSON.stringify(presupuesto));
    actualizarContadorPresupuesto();
}

function actualizarContadorPresupuesto() {
    let presupuestoItem = document.querySelector('.nav-item.presupuesto-item');
    
    if (!presupuestoItem) {
        const navbar = document.querySelector('.navbar-nav');
        if (!navbar) return;
        
        presupuestoItem = document.createElement('li');
        presupuestoItem.className = 'nav-item presupuesto-item';
        
        const presupuestoLink = document.createElement('a');
        presupuestoLink.className = 'nav-link';
        presupuestoLink.href = '#';
        presupuestoLink.id = 'presupuestoLink';
        presupuestoLink.innerHTML = '<i class="fas fa-file-invoice"></i> <span class="presupuesto-contador">0</span>';
        
        presupuestoItem.appendChild(presupuestoLink);
        navbar.appendChild(presupuestoItem);
        
        presupuestoLink.addEventListener('click', mostrarPresupuesto);
    }
    
    const contador = document.querySelector('.presupuesto-contador');
    if (contador) {
        const totalItems = presupuesto.reduce((total, item) => total + item.cantidad, 0);
        contador.textContent = totalItems;
        
        if (totalItems === 0) {
            contador.style.display = 'none';
        } else {
            contador.style.display = 'flex';
        }
    }
}

function mostrarPresupuesto(e) {
    e.preventDefault();
    
    const modalHTML = `
        <div class="presupuesto-modal" id="presupuestoModal">
            <div class="presupuesto-modal-content">
                <div class="presupuesto-modal-header">
                    <h3>Mi presupuesto</h3>
                    <button class="presupuesto-close">&times;</button>
                </div>
                <div class="presupuesto-modal-body">
                    ${generarHTMLPresupuesto()}
                </div>
                <div class="presupuesto-modal-footer">
                    <div class="presupuesto-total">
                        <strong>Total estimado: ${calcularTotalPresupuesto()}€</strong>
                        <small class="d-block">*IVA no incluido</small>
                    </div>
                    <button class="btn btn-outline-dark" id="vaciarPresupuesto">Vaciar</button>
                    <button class="btn btn-primary" id="solicitarPresupuesto">Solicitar presupuesto</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.querySelector('.presupuesto-close').addEventListener('click', cerrarPresupuesto);
    document.getElementById('vaciarPresupuesto').addEventListener('click', vaciarPresupuesto);
    document.getElementById('solicitarPresupuesto').addEventListener('click', solicitarPresupuesto);
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('presupuesto-modal')) {
            cerrarPresupuesto();
        }
    });
}

function generarHTMLPresupuesto() {
    if (presupuesto.length === 0) {
        return '<p class="text-center">Tu lista de productos está vacía</p>';
    }
    
    let html = '';
    presupuesto.forEach((item, index) => {
        html += `
            <div class="presupuesto-item-detalle">
                <div class="presupuesto-item-info">
                    <h4>${item.nombre}</h4>
                    <p>Material: ${item.material} | Talla: ${item.talla}</p>
                    <p class="presupuesto-item-precio">${item.precio}€ x ${item.cantidad}</p>
                </div>
                <div class="presupuesto-item-acciones">
                    <button class="btn-eliminar-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    setTimeout(() => {
        document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                eliminarDelPresupuesto(index);
            });
        });
    }, 100);
    
    return html;
}

function calcularTotalPresupuesto() {
    return presupuesto.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
}

function añadirAlPresupuesto(producto) {
    const existente = presupuesto.find(item => 
        item.id === producto.id && 
        item.material === producto.material && 
        item.talla === producto.talla
    );
    
    if (existente) {
        existente.cantidad += 1;
    } else {
        presupuesto.push({
            ...producto,
            cantidad: 1
        });
    }
    
    guardarPresupuesto();
    mostrarNotificacion('Producto añadido a tu lista de presupuesto');
}

function eliminarDelPresupuesto(index) {
    presupuesto.splice(index, 1);
    guardarPresupuesto();
    
    const modalBody = document.querySelector('.presupuesto-modal-body');
    const modalFooter = document.querySelector('.presupuesto-modal-footer');
    if (modalBody && modalFooter) {
        modalBody.innerHTML = generarHTMLPresupuesto();
        modalFooter.querySelector('.presupuesto-total strong').textContent = `Total estimado: ${calcularTotalPresupuesto()}€`;
    }
}

function vaciarPresupuesto() {
    if (confirm('¿Estás seguro de vaciar tu lista de presupuesto?')) {
        presupuesto = [];
        guardarPresupuesto();
        cerrarPresupuesto();
        mostrarNotificacion('Lista vaciada');
    }
}

function solicitarPresupuesto() {
    if (presupuesto.length === 0) {
        alert('Tu lista de productos está vacía');
        return;
    }
    
    // Redirigir a la página de solicitud de presupuesto
    window.location.href = 'solicitar-presupuesto.html';
}

function cerrarPresupuesto() {
    const modal = document.getElementById('presupuestoModal');
    if (modal) {
        modal.remove();
    }
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-presupuesto';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 2000);
}

// ============================================
// FUNCIONES DE PRODUCTO
// ============================================
function inicializarSelectorTallas() {
    const tallaBtns = document.querySelectorAll('.size-btn');
    const precioElemento = document.getElementById('precio-actual');
    
    if (!tallaBtns.length || !precioElemento) return;
    
    productoActual.id = obtenerIdProducto();
    productoActual.nombre = obtenerNombreProducto();
    
    tallaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tallaBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            productoActual.talla = this.dataset.talla;
            actualizarPrecio();
        });
    });
}

function inicializarSelectorMateriales() {
    const materialBtns = document.querySelectorAll('.material-btn');
    const precioElemento = document.getElementById('precio-actual');
    
    if (!materialBtns.length || !precioElemento) return;
    
    materialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            materialBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            productoActual.material = this.dataset.material;
            actualizarPrecio();
            
            const materialText = document.getElementById('material-seleccionado');
            if (materialText) {
                materialText.textContent = this.title;
            }
        });
    });
    
    if (materialBtns.length > 0 && !productoActual.material) {
        materialBtns[0].classList.add('active');
        productoActual.material = materialBtns[0].dataset.material;
        
        const materialText = document.getElementById('material-seleccionado');
        if (materialText) {
            materialText.textContent = materialBtns[0].title;
        }
    }
}

function actualizarPrecio() {
    const precioElemento = document.getElementById('precio-actual');
    if (!precioElemento) return;
    
    const productoId = productoActual.id;
    const material = productoActual.material;
    const talla = productoActual.talla;
    
    const ledCheckbox = document.getElementById('iluminacion-led');
    const tieneLed = ledCheckbox ? ledCheckbox.checked : false;
    
    if (preciosProductos[productoId] && preciosProductos[productoId][material]) {
        let precio = preciosProductos[productoId][material][talla];
        
        if (tieneLed && productoId === 'puerto') {
            precio += 450;
        }
        
        productoActual.precio = precio;
        precioElemento.textContent = precio.toLocaleString('es-ES') + '€';
    }
}

function inicializarBotonPresupuesto() {
    const btnAñadir = document.getElementById('añadir-presupuesto');
    if (!btnAñadir) return;
    
    btnAñadir.addEventListener('click', function() {
        if (!productoActual.material) {
            alert('Por favor, selecciona un material');
            return;
        }
        
        if (!productoActual.talla) {
            alert('Por favor, selecciona una talla');
            return;
        }
        
        añadirAlPresupuesto({
            id: productoActual.id,
            nombre: productoActual.nombre,
            material: productoActual.material,
            talla: productoActual.talla,
            precio: productoActual.precio
        });
    });
    
    const ledCheckbox = document.getElementById('iluminacion-led');
    if (ledCheckbox) {
        ledCheckbox.addEventListener('change', function() {
            actualizarPrecio();
        });
    }
}

function inicializarBotonVerPresupuesto() {
    const btnVer = document.getElementById('ver-presupuesto');
    if (btnVer) {
        btnVer.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarPresupuesto(e);
        });
    }
}

function obtenerIdProducto() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '').replace('producto-', '');
    return filename;
}

function obtenerNombreProducto() {
    const h1 = document.querySelector('h1');
    return h1 ? h1.textContent.trim() : 'Producto';
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================
function iniciarNavbarScroll() {
    window.addEventListener("scroll", function() {
        let navbar = document.querySelector(".navbar");
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }
    });
}

function cerrarMenuMovil() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuCollapse = document.getElementById('menu');
    
    if (navLinks && menuCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (menuCollapse.classList.contains('show')) {
                    menuCollapse.classList.remove('show');
                }
            });
        });
    }
}