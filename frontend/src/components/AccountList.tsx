import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '../api/accounts';
import './AccountList.css';

export function AccountList() {
  const { data: accounts, isLoading, isError } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  if (isLoading) return <div className="loading-state">Cargando cuentas...</div>;
  if (isError) return <div className="error-state">Error al cargar el catálogo de cuentas.</div>;
  if (!accounts || accounts.length === 0) return <div className="empty-state">No hay cuentas registradas aún.</div>;

  return (
    <div className="glass-panel">
      <div className="table-header">
        <div className="col">Código</div>
        <div className="col">Nombre</div>
        <div className="col">Tipo</div>
      </div>
      <div className="table-body">
        {accounts.map((account) => (
          <div key={account.id} className="table-row">
            <div className="col code">{account.code}</div>
            <div className="col name">{account.name}</div>
            <div className="col type">
              <span className={`badge badge-${account.type.toLowerCase()}`}>
                {account.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
