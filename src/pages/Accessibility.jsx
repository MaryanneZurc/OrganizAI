export default function Accessibility() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">♿ Acessibilidade</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">🔤 Tamanho da Fonte</h3>
          <p className="text-gray-400 mb-3">Ajuste o tamanho do texto para melhor leitura.</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-700 rounded-lg text-white text-sm">Pequeno</button>
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-white">Médio</button>
            <button className="px-4 py-2 bg-gray-700 rounded-lg text-white text-lg">Grande</button>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">🎨 Alto Contraste</h3>
          <p className="text-gray-400 mb-3">Ative o modo de alto contraste para melhor visibilidade.</p>
          <button className="px-4 py-2 bg-gray-700 rounded-lg text-white">Ativar Modo Escuro</button>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">🔊 Leitor de Tela</h3>
          <p className="text-gray-400">Compatível com TalkBack e NVDA para leitura de telas.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">⌨️ Navegação por Teclado</h3>
          <p className="text-gray-400">Todas as funcionalidades acessíveis via teclado (Tab, Enter, Esc).</p>
        </div>
      </div>
    </div>
  )
}