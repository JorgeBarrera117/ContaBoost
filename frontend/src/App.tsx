import './index.css'

function App() {
  return (
    <div className="glass-panel">
      <h1 className="gradient-text">ContaBoost</h1>
      <p className="subtitle">Tu Sistema Contable Inteligente (PWA)</p>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        El frontend está configurado con una estética premium, modo oscuro nativo y capacidades offline.
      </p>
      
      <button className="btn-primary">
        Conectar Base de Datos
      </button>
    </div>
  )
}

export default App
