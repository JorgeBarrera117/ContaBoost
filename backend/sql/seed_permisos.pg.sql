-- ==============================================================================
-- SEED DE PERMISOS Y ROLES BASE (RBAC) - POSTGRESQL
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
ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion;


-- =========================================
-- NEGOCIO 1: PEQUEÑO (Tipo "pequeno")
-- =========================================
DO $$
DECLARE
  v_neg_pequeno_id INT;
  v_rol_peq_admin INT;
  v_rol_peq_vendedor INT;
BEGIN
  INSERT INTO negocios (nombre, tipo_negocio) VALUES ('Mi Tiendita', 'pequeno') RETURNING id INTO v_neg_pequeno_id;

  INSERT INTO roles (negocio_id, nombre) VALUES (v_neg_pequeno_id, 'Administrador') RETURNING id INTO v_rol_peq_admin;
  INSERT INTO roles (negocio_id, nombre) VALUES (v_neg_pequeno_id, 'Vendedor') RETURNING id INTO v_rol_peq_vendedor;

  -- Permisos Admin Pequeño (Todos)
  INSERT INTO rol_permisos (rol_id, permiso_id)
  SELECT v_rol_peq_admin, id FROM permisos;

  -- Permisos Vendedor Pequeño
  INSERT INTO rol_permisos (rol_id, permiso_id)
  SELECT v_rol_peq_vendedor, id FROM permisos 
  WHERE codigo IN (
    'dashboard.ver', 'ventas.crear', 'ventas.ver_propias', 
    'caja.abrir', 'caja.cerrar', 'inventario.ver'
  );

  -- Crear Usuarios
  INSERT INTO usuarios (negocio_id, nombre, email, password_hash) VALUES 
  (v_neg_pequeno_id, 'Admin Prueba', 'admin@ejemplo.com', '$2b$10$wT2I1H5QZ3x9x3/rW9kO/e7P.Cj/N2E9a0oH0M3X9gW8iY.z0v4tC');
  
  INSERT INTO usuario_roles (usuario_id, rol_id) 
  VALUES (lastval(), v_rol_peq_admin);

  INSERT INTO usuarios (negocio_id, nombre, email, password_hash) VALUES 
  (v_neg_pequeno_id, 'Vendedor Prueba', 'vendedor@ejemplo.com', '$2b$10$wT2I1H5QZ3x9x3/rW9kO/e7P.Cj/N2E9a0oH0M3X9gW8iY.z0v4tC');

  INSERT INTO usuario_roles (usuario_id, rol_id) 
  VALUES (lastval(), v_rol_peq_vendedor);

END $$;
