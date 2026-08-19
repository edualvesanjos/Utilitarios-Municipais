/**
 * Módulo Sobre
 * Utilitários Municipais v4.3.4
 */

export const SobreModule = {
    id: 'sobre',
    title: 'Sobre',

    async init(container) {
        this.container = container;
        this.render();
    },

    render() {
        this.container.innerHTML = `
            <div class="sobre-container card p-4 shadow-sm">
                <h3 class="fw-bold mb-3">Sobre os Utilitários Municipais</h3>
                <p class="text-muted">
                    Plataforma desenvolvida para otimização e agilidade no atendimento e rotinas operacionais públicas.
                </p>
                <hr>
                <div class="mt-3">
                    <h5>Informações do Sistema</h5>
                    <p class="mb-1"><strong>Desenvolvimento:</strong> Divisão de Apoio ao Empreendedor</p>
                    <p class="mb-1"><strong>Status da Sincronização:</strong> Ativo / On-line</p>
                </div>
            </div>
        `;
    }
};
