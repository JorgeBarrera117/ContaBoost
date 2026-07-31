-- ==============================================================================
-- SEED DE PERMISOS Y ROLES BASE (RBAC)
-- Inserta el catálogo base de permisos y plantillas de roles por negocio.
-- ==============================================================================

-- 1. INSERTAR PERMISOS DEL SISTEMA
INSERT INTO permisos (codigo, descripcion) VALUES
('dashboard.ver', 'Permite ver el panel de control'),
('ventas.crear', 'Permite registrar nuevas ventas o facturas'),
('ventas.ver_propias', 'Permite ver solo el historial de ventas del usuario'),
('ventas.ver_todas', 'Permite ver el historial global de ventas del negocio'),
('ventas.anular', 'Permite anular facturas emitidas'),
('ventas.consultar_precio', 'Consultar precio sin generar factura'),
('caja.abrir', 'Abrir turno de caja (cash_sessions)'),
('caja.cerrar', 'Cerrar turno de caja'),
('caja.arqueo_parcial', 'Realizar arqueo parcial de caja'),
('caja.ver_estado', 'Ver estado y saldo de caja'),
('inventario.ver', 'Permite ver el catálogo de productos y su stock actual'),
('inventario.editar', 'Permite crear o modificar productos y precios'),
('inventario.ajustar_stock', 'Permite hacer ajustes manuales en el Kardex'),
('compras.crear', 'Permite registrar ingresos o compras de proveedores'),
('compras.ver', 'Permite ver el historial de compras'),
('contactos.ver', 'Ver contactos (clientes/proveedores)'),
('contactos.gestionar', 'Crear/editar contactos'),
('usuarios.gestionar', 'Permite invitar usuarios, asignar roles y dar de baja'),
('reportes.ver', 'Permite visualizar balances, estado de resultados y KPI'),
('libro_diario.ver', 'Ver journal_entries y journal_lines'),
('cuentas.gestionar', 'Gestionar el plan de cuentas (accounts)'),
('configuracion.editar', 'Permite editar la info del SRI, facturación y catálogos'),
('sistema.vista_previa_roles', 'Previsualizar otras vistas de rol (solo admin)')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);


-- A manera de demostración (Plantillas predefinidas)
-- Al crear un negocio nuevo en la aplicación, se deberían inyectar estos roles.
-- Aquí creamos 3 negocios ficticios para demostrar los 3 tamaños.

-- =========================================
-- NEGOCIO 1: PEQUEÑO (Tipo "pequeno")
-- =========================================
INSERT INTO negocios (nombre, tipo_negocio) VALUES ('Mi Tiendita', 'pequeno');
SET @neg_pequeno_id = LAST_INSERT_ID();

-- Roles: Admin y Vendedor
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_pequeno_id, 'Administrador');
SET @rol_peq_admin = LAST_INSERT_ID();
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_pequeno_id, 'Vendedor');
SET @rol_peq_vendedor = LAST_INSERT_ID();

-- Permisos Admin Pequeño (Todos)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_peq_admin, id FROM permisos;

-- Permisos Vendedor Pequeño
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_peq_vendedor, id FROM permisos WHERE codigo IN ('dashboard.ver', 'ventas.crear', 'ventas.consultar_precio', 'caja.arqueo_parcial', 'caja.cerrar', 'ventas.ver_propias', 'contactos.ver');


-- =========================================
-- NEGOCIO 2: MEDIANO (Tipo "mediano")
-- =========================================
INSERT INTO negocios (nombre, tipo_negocio) VALUES ('Distribuidora Central', 'mediano');
SET @neg_mediano_id = LAST_INSERT_ID();

-- Roles: Admin, Vendedor, Bodeguero
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_mediano_id, 'Administrador');
SET @rol_med_admin = LAST_INSERT_ID();
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_mediano_id, 'Vendedor');
SET @rol_med_vendedor = LAST_INSERT_ID();
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_mediano_id, 'Bodeguero');
SET @rol_med_bodeguero = LAST_INSERT_ID();

-- Permisos Admin Mediano (Todos)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_med_admin, id FROM permisos;

-- Permisos Vendedor Mediano
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_med_vendedor, id FROM permisos WHERE codigo IN ('dashboard.ver', 'ventas.crear', 'ventas.consultar_precio', 'caja.arqueo_parcial', 'caja.cerrar', 'ventas.ver_propias', 'contactos.ver');

-- Permisos Bodeguero Mediano
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_med_bodeguero, id FROM permisos WHERE codigo IN ('dashboard.ver', 'ventas.consultar_precio', 'inventario.ver', 'inventario.editar', 'compras.crear', 'compras.ver');


-- =========================================
-- NEGOCIO 3: SUCURSALES (Tipo "sucursales")
-- =========================================
INSERT INTO negocios (nombre, tipo_negocio) VALUES ('Franquicia Mega', 'sucursales');
SET @neg_suc_id = LAST_INSERT_ID();

-- Roles: Super Admin, Gerente, Vendedor, Bodeguero
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_suc_id, 'Super Administrador');
SET @rol_suc_super = LAST_INSERT_ID();
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_suc_id, 'Gerente');
SET @rol_suc_gerente = LAST_INSERT_ID();
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_suc_id, 'Vendedor');
SET @rol_suc_vendedor = LAST_INSERT_ID();
INSERT INTO roles (negocio_id, nombre) VALUES (@neg_suc_id, 'Bodeguero');
SET @rol_suc_bodeguero = LAST_INSERT_ID();

-- Permisos Super Admin Sucursales (Todos)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_suc_super, id FROM permisos;

-- Permisos Gerente Sucursales (Todos menos configurar sistema)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_suc_gerente, id FROM permisos WHERE codigo != 'configuracion.editar';

-- Permisos Vendedor Sucursales
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_suc_vendedor, id FROM permisos WHERE codigo IN ('dashboard.ver', 'ventas.crear', 'ventas.consultar_precio', 'caja.arqueo_parcial', 'caja.cerrar', 'ventas.ver_propias', 'contactos.ver');

-- Permisos Bodeguero Sucursales
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT @rol_suc_bodeguero, id FROM permisos WHERE codigo IN ('dashboard.ver', 'ventas.consultar_precio', 'inventario.ver', 'inventario.editar', 'compras.crear', 'compras.ver');
