// Referencias generales al DOM
const displayUsername = document.getElementById('display-username');
const userAvatar = document.getElementById('user-avatar');

const btnNotifications = document.getElementById('btn-notifications');
const alertsPopover = document.getElementById('alerts-popover');
const btnMinimizeAlerts = document.getElementById('btn-minimize-alerts');

const btnLogout = document.getElementById('btn-logout');

// Navegación Sidebar
const navItems = document.querySelectorAll('.nav-item');
const viewTag = document.getElementById('view-tag');
const viewTitle = document.getElementById('view-title');
const viewDesc = document.getElementById('view-desc');
const viewContainerInicio = document.getElementById('view-container-inicio');
const viewContainerGeneric = document.getElementById('view-container-generic');
const tableTitle = document.getElementById('table-title');
const recordCount = document.getElementById('record-count');
const tableHeadRow = document.getElementById('table-head-row');
const tableBody = document.getElementById('table-body');

// Modal & Formulario
const btnOpenModal = document.getElementById('btn-open-modal');
const modalOverlay = document.getElementById('modal-overlay');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const movementForm = document.getElementById('movement-form');
const typeBtns = document.querySelectorAll('.type-btn');

// Secciones dinámicas del modal
const formFieldsCliente = document.getElementById('form-fields-cliente');
const formFieldsProveedor = document.getElementById('form-fields-proveedor');
const formFieldsProducto = document.getElementById('form-fields-producto');
const formFieldsGenerico = document.getElementById('form-fields-generico');
const lblGenerico = document.getElementById('lbl-generico');

let currentSection = 'inicio';
let selectedMovementType = 'Cliente';

// Configuración de Secciones del Sidebar
const sectionConfig = {
  inicio: { tag: 'Panel comercial', title: 'Inicio', desc: 'Consulta el rendimiento de tu negocio en tiempo real.' },
  clientes: { tag: 'Panel comercial', title: 'Panel de clientes', desc: 'Administra la información y actividad de tus clientes.' },
  proveedores: { tag: 'Panel comercial', title: 'Panel de proveedores', desc: 'Gestiona la lista de proveedores y contactos de insumos.' },
  productos: { tag: 'Panel comercial', title: 'Productos', desc: 'Controla el inventario, códigos SKU y precios por unidad.' },
  compras: { tag: 'Panel comercial', title: 'Compras', desc: 'Registra los egresos y adquisiciones de mercancía.' },
  ventas: { tag: 'Panel comercial', title: 'Ventas', desc: 'Monitorea las ventas realizadas y sus estados.' },
  movimientos: { tag: 'Panel comercial', title: 'Base General de Movimientos', desc: 'Historial unificado de todos los registros y operaciones del sistema.' },
  reportes: { tag: 'Panel comercial', title: 'Reportes', desc: 'Analiza los informes detallados del negocio.' }
};

// Cargar usuario autenticado
document.addEventListener('DOMContentLoaded', () => {
  const loggedUserRaw = localStorage.getItem('sigecom_logged_user');
  if (!loggedUserRaw) {
    window.location.href = 'index.html';
    return;
  }

  const loggedUser = JSON.parse(loggedUserRaw);
  const username = loggedUser.username || 'Usuario';

  displayUsername.textContent = username;
  userAvatar.textContent = username.substring(0, 2).toUpperCase();
});

// NAVEGACIÓN ENTRE SECCIONES (SPA)
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    currentSection = item.getAttribute('data-section');
    const config = sectionConfig[currentSection];

    viewTag.textContent = config.tag;
    viewTitle.textContent = config.title;
    viewDesc.textContent = config.desc;

    if (currentSection === 'inicio') {
      viewContainerInicio.style.display = 'block';
      viewContainerGeneric.style.display = 'none';
    } else {
      viewContainerInicio.style.display = 'none';
      viewContainerGeneric.style.display = 'block';
      renderSectionTable(currentSection);
    }
  });
});

// MOSTRAR TABLA SEGÚN LA SECCIÓN SELECCIONADA
function renderSectionTable(section) {
  tableHeadRow.innerHTML = '';
  tableBody.innerHTML = '';

  if (section === 'movimientos') {
    // VISTA GENERAL UNIFICADA
    const allMovements = JSON.parse(localStorage.getItem('sigecom_movimientos_general')) || [];
    tableTitle.textContent = `Lista de Todos los Movimientos`;
    recordCount.textContent = `${allMovements.length} registros en total`;

    tableHeadRow.innerHTML = `<th>Fecha</th><th>Tipo</th><th>Detalle / Nombre</th><th>Monto Total</th>`;

    if (allMovements.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No hay movimientos registrados en el sistema.</td></tr>`;
      return;
    }

    allMovements.forEach(m => {
      const tr = document.createElement('tr');
      const badgeClass = `badge-${m.tipo.toLowerCase()}`;
      tr.innerHTML = `
        <td>${m.fecha}</td>
        <td><span class="badge-type ${badgeClass}">${m.tipo}</span></td>
        <td><strong>${m.detalle}</strong></td>
        <td>${m.monto ? '$ ' + parseFloat(m.monto).toLocaleString('es-AR') : '-'}</td>
      `;
      tableBody.appendChild(tr);
    });

  } else {
    // VISTAS ESPECÍFICAS
    const records = JSON.parse(localStorage.getItem(`sigecom_${section}`)) || [];
    tableTitle.textContent = `Lista de ${sectionConfig[section].title}`;
    recordCount.textContent = `${records.length} registros guardados`;

    if (section === 'clientes') {
      tableHeadRow.innerHTML = `<th>Nombre</th><th>Tipo</th><th>Teléfono</th><th>Dirección</th>`;
    } else if (section === 'proveedores') {
      tableHeadRow.innerHTML = `<th>Razón Social</th><th>Rubro</th><th>Teléfono</th>`;
    } else if (section === 'productos') {
      tableHeadRow.innerHTML = `
        <th>SKU</th>
        <th>Producto</th>
        <th>Categoría</th>
        <th>Stock</th>
        <th>Stock Mín.</th>
        <th>P. Compra Total</th>
        <th>P. Compra Un.</th>
        <th>P. Venta Un.</th>
        <th>Tipo Mov.</th>
        <th>Vencimiento</th>
      `;
    } else {
      tableHeadRow.innerHTML = `<th>Fecha</th><th>Detalle</th><th>Monto</th>`;
    }

    if (records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="no-data">No hay registros cargados aún en esta sección.</td></tr>`;
      return;
    }

    records.forEach(rec => {
      const tr = document.createElement('tr');
      if (section === 'clientes') {
        tr.innerHTML = `<td><strong>${rec.nombre}</strong></td><td>${rec.tipo}</td><td>${rec.telefono || '-'}</td><td>${rec.direccion || '-'}</td>`;
      } else if (section === 'proveedores') {
        tr.innerHTML = `<td><strong>${rec.nombre}</strong></td><td>${rec.rubro || '-'}</td><td>${rec.telefono || '-'}</td>`;
      } else if (section === 'productos') {
        tr.innerHTML = `
          <td><code>${rec.sku}</code></td>
          <td><strong>${rec.nombre}</strong></td>
          <td>${rec.categoria || '-'}</td>
          <td><strong>${rec.stock} u.</strong></td>
          <td>${rec.stockMinimo} u.</td>
          <td>$ ${rec.precioCompraTotal ? parseFloat(rec.precioCompraTotal).toLocaleString('es-AR') : '-'}</td>
          <td>$ ${rec.precioCompraUnidad ? parseFloat(rec.precioCompraUnidad).toLocaleString('es-AR') : '-'}</td>
          <td>$ ${rec.precioVentaUnidad ? parseFloat(rec.precioVentaUnidad).toLocaleString('es-AR') : '-'}</td>
          <td>${rec.movimiento || 'Nuevo ingreso'}</td>
          <td>${rec.vencimiento || '-'}</td>
        `;
      } else {
        tr.innerHTML = `<td>${rec.date}</td><td><strong>${rec.detail}</strong></td><td>${rec.amount ? '$ ' + parseFloat(rec.amount).toLocaleString('es-AR') : '-'}</td>`;
      }
      tableBody.appendChild(tr);
    });
  }
}

// CAMBIO DE PESTAÑAS EN EL MODAL (Asegura la activación de validaciones únicamente visibles)
typeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    typeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    selectedMovementType = btn.getAttribute('data-type');

    // Ocultar todas las secciones
    formFieldsCliente.style.display = 'none';
    formFieldsProveedor.style.display = 'none';
    formFieldsProducto.style.display = 'none';
    formFieldsGenerico.style.display = 'none';

    // Remover atributo 'required' de TODOS los campos para evitar bloqueos invisibles
    document.querySelectorAll('.modal-input').forEach(inp => inp.removeAttribute('required'));

    // Mostrar sección activa y aplicar 'required' sólo a los campos visibles correspondientes
    if (selectedMovementType === 'Cliente') {
      formFieldsCliente.style.display = 'block';
      document.getElementById('cli-nombre').setAttribute('required', 'true');
      document.getElementById('cli-tipo').setAttribute('required', 'true');
    } else if (selectedMovementType === 'Proveedor') {
      formFieldsProveedor.style.display = 'block';
      document.getElementById('prov-nombre').setAttribute('required', 'true');
    } else if (selectedMovementType === 'Producto') {
      formFieldsProducto.style.display = 'block';
      document.getElementById('prod-nombre').setAttribute('required', 'true');
      document.getElementById('prod-sku').setAttribute('required', 'true');
    } else {
      formFieldsGenerico.style.display = 'block';
      lblGenerico.textContent = `Descripción de ${selectedMovementType}`;
      document.getElementById('input-generico-detalle').setAttribute('required', 'true');
    }
  });
});

// ABRIR Y CERRAR MODAL
btnOpenModal.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
  const activeBtn = document.querySelector('.type-btn.active');
  if (activeBtn) activeBtn.click();
});

const closeModal = () => {
  modalOverlay.style.display = 'none';
  movementForm.reset();
};

btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);

// GUARDAR REGISTROS
movementForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fechaActual = new Date().toLocaleDateString('es-AR');
  let generalDetail = '';
  let generalAmount = null;

  if (selectedMovementType === 'Cliente') {
    const newClient = {
      nombre: document.getElementById('cli-nombre').value.trim(),
      tipo: document.getElementById('cli-tipo').value,
      telefono: document.getElementById('cli-telefono').value.trim(),
      direccion: document.getElementById('cli-direccion').value.trim()
    };
    saveRecord('sigecom_clientes', newClient);
    generalDetail = `Nuevo cliente: ${newClient.nombre} (${newClient.tipo})`;

  } else if (selectedMovementType === 'Proveedor') {
    const newProv = {
      nombre: document.getElementById('prov-nombre').value.trim(),
      rubro: document.getElementById('prov-rubro').value.trim(),
      telefono: document.getElementById('prov-telefono').value.trim()
    };
    saveRecord('sigecom_proveedores', newProv);
    generalDetail = `Nuevo proveedor: ${newProv.nombre}`;

  } else if (selectedMovementType === 'Producto') {
    const newProd = {
      nombre: document.getElementById('prod-nombre').value.trim(),
      sku: document.getElementById('prod-sku').value.trim(),
      categoria: document.getElementById('prod-categoria').value.trim(),
      vencimiento: document.getElementById('prod-vencimiento').value,
      movimiento: document.getElementById('prod-movimiento').value,
      precioCompraTotal: document.getElementById('prod-precio-compra-total').value,
      precioCompraUnidad: document.getElementById('prod-precio-compra-unidad').value,
      precioVentaUnidad: document.getElementById('prod-precio-venta-unidad').value,
      stock: document.getElementById('prod-stock').value || 0,
      stockMinimo: document.getElementById('prod-stock-minimo').value || 0
    };
    saveRecord('sigecom_productos', newProd);
    generalDetail = `Producto: ${newProd.nombre} (SKU: ${newProd.sku})`;
    generalAmount = newProd.precioCompraTotal;

  } else {
    const keyMap = { Compra: 'sigecom_compras', Venta: 'sigecom_ventas', Reporte: 'sigecom_reportes' };
    const genericData = {
      date: fechaActual,
      detail: document.getElementById('input-generico-detalle').value.trim(),
      amount: document.getElementById('input-generico-monto').value
    };
    saveRecord(keyMap[selectedMovementType], genericData);
    generalDetail = genericData.detail;
    generalAmount = genericData.amount;
  }

  // TRASLADAR REGISTRO A LA BASE GENERAL DE MOVIMIENTOS
  const generalMovement = {
    fecha: fechaActual,
    tipo: selectedMovementType,
    detalle: generalDetail,
    monto: generalAmount
  };
  saveRecord('sigecom_movimientos_general', generalMovement);

  alert(`¡${selectedMovementType} guardado con éxito!`);
  closeModal();

  // Refrescar vista actual en tiempo real
  if (currentSection !== 'inicio') {
    renderSectionTable(currentSection);
  }
});

function saveRecord(key, data) {
  const records = JSON.parse(localStorage.getItem(key)) || [];
  records.push(data);
  localStorage.setItem(key, JSON.stringify(records));
}

// POPUP DE NOTIFICACIONES
btnNotifications.addEventListener('click', (e) => {
  e.stopPropagation();
  const isVisible = alertsPopover.style.display === 'block';
  alertsPopover.style.display = isVisible ? 'none' : 'block';
});

btnMinimizeAlerts.addEventListener('click', (e) => {
  e.stopPropagation();
  alertsPopover.style.display = 'none';
});

document.addEventListener('click', (e) => {
  if (!alertsPopover.contains(e.target) && e.target !== btnNotifications) {
    alertsPopover.style.display = 'none';
  }
});

// LOGOUT
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('sigecom_logged_user');
  window.location.href = 'index.html';
});