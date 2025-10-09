// Evolução Patrimonial - JavaScript Application

// Estado global da aplicação
let estado = {
    mesAno: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    cotacaoDolar: 5.0,
    receitas: [],
    custos: [],
    investimentos: [],
    ativos: [],
    passivos: [],
    mesBaseGlobal: null,
    sort: {
        receitas: { key: null, dir: 'asc' },
        custos: { key: null, dir: 'asc' },
        investimentos: { key: null, dir: 'asc' },
        ativos: { key: null, dir: 'asc' },
        passivos: { key: null, dir: 'asc' },
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

// Função para criar dados de exemplo se não houver dados reais
async function criarDadosExemplo() {
    const receitasExistentes = await carregarDadosMesEspecifico('receitas', estado.mesAno);
    
    if (receitasExistentes.length === 0) {
        console.log('Criando dados de exemplo para receitas...');
        
        const dadosExemplo = [
            {
                nome: 'Salário Principal',
                categoria: 'salário/emprego',
                valor: 5000,
                moeda: 'BRL',
                frequencia: 'mensal',
                confiabilidade: 'alta',
                notas: 'Receita principal',
                mes_ano: estado.mesAno
            },
            {
                nome: 'Freelance',
                categoria: 'freelancer',
                valor: 1500,
                moeda: 'BRL',
                frequencia: 'mensal',
                confiabilidade: 'baixa',
                notas: 'Trabalhos extras',
                mes_ano: estado.mesAno
            },
            {
                nome: 'Investimentos',
                categoria: 'investimentos',
                valor: 300,
                moeda: 'BRL',
                frequencia: 'mensal',
                confiabilidade: 'alta',
                notas: 'Rendimentos de investimentos',
                mes_ano: estado.mesAno
            }
        ];
        
        // Adicionar dados de exemplo para vários meses
        const hoje = new Date();
        for (let i = 0; i < 12; i++) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            
            for (const exemplo of dadosExemplo) {
                const dadoMes = { ...exemplo, mes_ano: mesAno };
                
                try {
                    await apiRequest('receitas', 'POST', dadoMes);
                } catch (error) {
                    // Se a API falhar, salvar localmente
                    estado.receitas.push(dadoMes);
                }
            }
        }
        
        // Salvar no localStorage
        salvarDadosLocais('receitas', estado.receitas);
        console.log('Dados de exemplo criados com sucesso!');
    }
}

async function inicializarApp() {
    // Configurar eventos
    configurarEventos();
    
    // Normalizar centros de custo para remover duplicatas case-insensitive
    normalizarCentrosCusto();
    
    // Inicializar campo hidden de mês/ano com o valor atual
    const mesAnoElement = document.getElementById('mesAno');
    if (mesAnoElement) {
        mesAnoElement.value = estado.mesAno;
    }

    // Inicializar controles de mês/ano em português
    inicializarControlesMesAno();
    
    // Carregar cotação do dólar
    await carregarCotacaoDolar();
    
    // Carregar dados do mês atual
    await carregarDadosMes();
    
    // Carregar aba baseada no hash da URL
    carregarAbaDoHash();
    
    // Garantir que o gráfico de receitas seja atualizado
    setTimeout(async () => {
        await atualizarGraficoReceitas();
        await atualizarGraficoCustos();
        await atualizarGrafico();
        await atualizarGraficoAtivosPassivos();
    }, 1000);
}

function configurarEventos() {
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                abrirTab(tabId);
            });
        });
    }
    
    // Eventos dos novos selects de mês/ano são configurados em inicializarControlesMesAno()
    
    // Navegação de meses
    const mesAnteriorElement = document.getElementById('mesAnterior');
    if (mesAnteriorElement) {
        mesAnteriorElement.addEventListener('click', function() {
            navegarMes(-1);
        });
    }
    
    const mesSeguinteElement = document.getElementById('mesSeguinte');
    if (mesSeguinteElement) {
        mesSeguinteElement.addEventListener('click', function() {
            navegarMes(1);
        });
    }

    // Fechar modal apenas com tecla ESC (botão X já está configurado na função abrirModal)
    const modalOverlayElement = document.getElementById('modalOverlay');
    if (modalOverlayElement) {
        // Fechar modal com tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modalOverlayElement.classList.contains('hidden')) {
                fecharModal();
            }
        });
    }

    // Link para Evolução Financeira
    const linkEvolucao = document.getElementById('linkEvolucaoFinanceira');
    if (linkEvolucao) {
        linkEvolucao.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModalEvolucaoFinanceira();
        });
    }
}

async function carregarTemplatesPassivo() {
    try {
        const response = await fetch('api/templates.php?type=passivos');
        const templates = await response.json();
        
        const selectTemplate = document.getElementById('psv_template');
        if (selectTemplate) {
            // Limpar opções existentes (exceto a primeira)
            selectTemplate.innerHTML = '<option value="">Selecione um template ou preencha manualmente</option>';
            
            if (templates.length > 0) {
                templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.nome;
                    selectTemplate.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.log('Erro ao carregar templates de passivos:', error);
    }
}

// ===== SISTEMA DE TEMPLATES DE CONFIGURAÇÃO =====

// Gerenciamento de sub-abas de configuração
document.addEventListener('DOMContentLoaded', function() {
    const configTabButtons = document.querySelectorAll('.config-tab-button');
    if (configTabButtons.length > 0) {
        configTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const configTabId = this.getAttribute('data-config-tab');
                abrirConfigTab(configTabId);
            });
        });
    }
});

function abrirConfigTab(configTabId) {
    // Remover classe active de todas as sub-abas
    document.querySelectorAll('.config-tab-button').forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'text-blue-600', 'shadow');
        btn.classList.add('text-gray-600');
    });
    
    document.querySelectorAll('.config-tab-content').forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    // Adicionar classe active à sub-aba selecionada
    const configTabButton = document.querySelector(`[data-config-tab="${configTabId}"]`);
    const configTabContent = document.getElementById(`config-${configTabId}`);
    
    if (configTabButton && configTabContent) {
        configTabButton.classList.add('active', 'bg-white', 'text-blue-600', 'shadow');
        configTabButton.classList.remove('text-gray-600');
        
        configTabContent.classList.add('active');
        configTabContent.classList.remove('hidden');
        
        // Carregar templates da aba selecionada
        carregarTemplates(configTabId);
    }
}

// Carregar templates quando a aba de configurações for aberta

// Funções para carregar templates
async function carregarTemplates(tipo) {
    try {
        const response = await fetch(`api/templates.php?type=${tipo}`);
        const templates = await response.json();
        
        if (response.ok) {
            renderizarTemplates(tipo, templates);
        } else {
            console.error('Erro ao carregar templates:', templates.error);
        }
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
    }
}

function renderizarTemplates(tipo, templates) {
    const container = document.getElementById(`listaTemplates${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    if (!container) return;
    
    if (templates.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p>Nenhum template cadastrado ainda.</p>
                <p class="text-sm">Clique em "Novo Template" para começar.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = criarTabelaTemplates(tipo, templates);
}

// Flags de rendimento
// Lista de investimentos (persistida em localStorage)
const INVEST_LIST_FLAG_STORAGE_KEY = 'evoPatri_flag_rendimento_invest_list';
function getInvestListFlag() {
    const v = localStorage.getItem(INVEST_LIST_FLAG_STORAGE_KEY);
    const num = parseFloat(v);
    return isNaN(num) ? 1 : num; // padrão 1%
}
function setInvestListFlag(val) {
    const num = parseFloat(val);
    if (!isNaN(num)) localStorage.setItem(INVEST_LIST_FLAG_STORAGE_KEY, String(num));
}
window.updateInvestFlag = function(val) {
    setInvestListFlag(val);
    atualizarInvestimentos();
};

function criarTabelaTemplates(tipo, templates) {
    // Define cabeçalhos e mapeamento de colunas por tipo
    let headers = [];
    let rowsHtml = '';
    const safe = (v) => (v === null || v === undefined) ? '' : String(v);
    const fmtPct = (v) => {
        const num = (typeof v === 'number') ? v : parseFloat(String(v).replace(',', '.'));
        if (isNaN(num)) return '0,00%';
        return `${num.toFixed(2).replace('.', ',')}%`;
    };
    
    switch (tipo) {
        case 'receitas':
            headers = ['Nome', 'Categoria', 'Valor', 'Frequência', 'Moeda', 'Confiabilidade', 'Notas', 'Ações'];
            rowsHtml = templates.map(t => `
                <tr class="border-b">
                    <td class="px-3 py-2 font-medium">${safe(t.nome)}</td>
                    <td class="px-3 py-2">${safe(t.categoria)}</td>
                    <td class="px-3 py-2">${formatarMoeda(Number(t.valor ?? 0), t.moeda || 'BRL')}</td>
                    <td class="px-3 py-2">${safe(t.frequencia || 'mensal')}</td>
                    <td class="px-3 py-2">${safe(t.moeda || 'BRL')}</td>
                    <td class="px-3 py-2">${safe(t.confiabilidade || 'alta')}</td>
                    <td class="px-3 py-2 text-gray-600">${safe(t.notas)}</td>
                    <td class="px-3 py-2 text-right">
                        <button class="text-blue-600 hover:underline mr-3" onclick="editarTemplate('receitas', ${t.id})">Editar</button>
                        <button class="text-red-600 hover:underline" onclick="excluirTemplate('receitas', ${t.id})">Excluir</button>
                    </td>
                </tr>
            `).join('');
            break;
        case 'custos':
            headers = ['Nome', 'Centro de Custo', 'Valor', 'Moeda', 'Notas', 'Ações'];
            rowsHtml = templates.map(t => `
                <tr class="border-b">
                    <td class="px-3 py-2 font-medium">${safe(t.nome)}</td>
                    <td class="px-3 py-2">${safe(t.centro_custo) || 'Centro não definido'}</td>
                    <td class="px-3 py-2">${formatarMoeda(Number(t.valor ?? 0), t.moeda || 'BRL')}</td>
                    <td class="px-3 py-2">${safe(t.moeda || 'BRL')}</td>
                    <td class="px-3 py-2 text-gray-600">${safe(t.notas)}</td>
                    <td class="px-3 py-2 text-right">
                        <button class="text-blue-600 hover:underline mr-3" onclick="editarTemplate('custos', ${t.id})">Editar</button>
                        <button class="text-red-600 hover:underline" onclick="excluirTemplate('custos', ${t.id})">Excluir</button>
                    </td>
                </tr>
            `).join('');
            break;
        case 'investimentos':
            headers = ['Instituição', 'Valor', 'Moeda', 'Rendimento (%)', 'Liquidez', 'Notas', 'Ações'];
            rowsHtml = templates.map(t => {
                const pct = (t.rendimento_percentual !== undefined) ? t.rendimento_percentual : (t.rendimento || 0);
                return `
                <tr class="border-b">
                    <td class="px-3 py-2 font-medium">${safe(t.instituicao)}</td>
                    <td class="px-3 py-2">${formatarMoeda(Number(t.valor ?? 0), t.moeda || 'BRL')}</td>
                    <td class="px-3 py-2">${safe(t.moeda || 'BRL')}</td>
                    <td class="px-3 py-2">${fmtPct(pct)}</td>
                    <td class="px-3 py-2">${safe(t.liquidez || 'líquido')}</td>
                    <td class="px-3 py-2 text-gray-600">${safe(t.notas)}</td>
                    <td class="px-3 py-2 text-right">
                        <button class="text-blue-600 hover:underline mr-3" onclick="editarTemplate('investimentos', ${t.id})">Editar</button>
                        <button class="text-red-600 hover:underline" onclick="excluirTemplate('investimentos', ${t.id})">Excluir</button>
                    </td>
                </tr>
                `;
            }).join('');
            break;
        case 'ativos':
            headers = ['Nome', 'Valor', 'Valorização', 'Notas', 'Ações'];
            rowsHtml = templates.map(t => `
                <tr class="border-b">
                    <td class="px-3 py-2 font-medium">${safe(t.nome)}</td>
                    <td class="px-3 py-2">${formatarMoeda(Number(t.valor ?? 0), 'BRL')}</td>
                    <td class="px-3 py-2">${safe(t.valorizacao || 'aprecia')}</td>
                    <td class="px-3 py-2 text-gray-600">${safe(t.notas)}</td>
                    <td class="px-3 py-2 text-right">
                        <button class="text-blue-600 hover:underline mr-3" onclick="editarTemplate('ativos', ${t.id})">Editar</button>
                        <button class="text-red-600 hover:underline" onclick="excluirTemplate('ativos', ${t.id})">Excluir</button>
                    </td>
                </tr>
            `).join('');
            break;
        case 'passivos':
            headers = ['Nome', 'Valor', 'Notas', 'Ações'];
            rowsHtml = templates.map(t => `
                <tr class="border-b">
                    <td class="px-3 py-2 font-medium">${safe(t.nome)}</td>
                    <td class="px-3 py-2">${formatarMoeda(Number(t.valor ?? 0), 'BRL')}</td>
                    <td class="px-3 py-2 text-gray-600">${safe(t.notas)}</td>
                    <td class="px-3 py-2 text-right">
                        <button class="text-blue-600 hover:underline mr-3" onclick="editarTemplate('passivos', ${t.id})">Editar</button>
                        <button class="text-red-600 hover:underline" onclick="excluirTemplate('passivos', ${t.id})">Excluir</button>
                    </td>
                </tr>
            `).join('');
            break;
        default:
            headers = ['Nome', 'Notas', 'Ações'];
            rowsHtml = templates.map(t => `
                <tr class="border-b">
                    <td class="px-3 py-2 font-medium">${safe(t.nome || t.instituicao || '-')}</td>
                    <td class="px-3 py-2 text-gray-600">${safe(t.notas)}</td>
                    <td class="px-3 py-2 text-right">
                        <button class="text-blue-600 hover:underline mr-3" onclick="editarTemplate('${tipo}', ${t.id})">Editar</button>
                        <button class="text-red-600 hover:underline" onclick="excluirTemplate('${tipo}', ${t.id})">Excluir</button>
                    </td>
                </tr>
            `).join('');
    }
    
    const thead = `
        <thead class="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
                ${headers.map(h => `<th class=\"px-3 py-2 text-left\">${h}</th>`).join('')}
            </tr>
        </thead>
    `;
    const tbody = `<tbody class="text-sm bg-white">${rowsHtml}</tbody>`;
    return `
        <div class="overflow-x-auto border rounded-md">
            <table class="min-w-full table-auto">
                ${thead}
                ${tbody}
            </table>
        </div>
    `;
}

function criarCardTemplate(tipo, template) {
    let detalhes = '';
    
    switch (tipo) {
        case 'receitas':
            detalhes = `
                <div class="text-sm text-gray-600">
                    <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">${template.categoria}</span>
                    <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2">${template.frequencia}</span>
                    <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">${template.confiabilidade}</span>
                </div>
            `;
            break;
        case 'custos':
            {
                const centro = template.centro_custo || '';
                detalhes = `
                    <div class="text-sm text-gray-600">
                        ${centro 
                            ? `<span class="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">${centro}</span>` 
                            : `<span class="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Centro não definido</span>`}
                    </div>
                `;
            }
            break;
        case 'investimentos':
            const rendimentoPct = (typeof template.rendimento === 'number')
                ? `${formatarPercentualInput(template.rendimento)}%`
                : (template.rendimento ? `${template.rendimento}%` : '0,00%');
            detalhes = `
                <div class="text-sm text-gray-600">
                    <span class="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-2">${template.liquidez || ''}</span>
                    <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">${rendimentoPct}</span>
                    <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${template.moeda || 'BRL'}</span>
                </div>
            `;
            break;
        case 'ativos':
            {
                const raw = template.valorizacao;
                const numVal = (raw !== null && raw !== undefined) ? parseFloat(raw) : NaN;
                const isNumericLike = !isNaN(numVal);
                const dir = isNumericLike
                    ? (numVal < 0 ? 'deprecia' : 'aprecia')
                    : (raw === 'aprecia' ? 'aprecia' : 'deprecia');
                const badgeClass = dir === 'aprecia' ? 'badge-aprecia' : 'badge-deprecia';
                detalhes = `
                    <div class="text-sm text-gray-600">
                        <span class="${badgeClass} inline-block text-xs px-2 py-1 rounded">
                            ${dir === 'aprecia' ? '📈 Aprecia' : '📉 Deprecia'}
                        </span>
                    </div>
                `;
            }
            break;
        case 'passivos':
            detalhes = '';
            break;
    }
    
    const nome = tipo === 'investimentos' ? template.instituicao : template.nome;
    
    // Mostrar valor somente se preenchido (> 0)
    const rawValor = template && template.valor !== undefined ? template.valor : null;
    const numValor = rawValor !== null && rawValor !== '' ? parseFloat(rawValor) : NaN;
    const temValor = !isNaN(numValor) && numValor > 0;
    const moeda = template && template.moeda ? template.moeda : 'BRL';
    const valorInlineHTML = temValor ? `<span class="ml-1 text-sm font-normal text-gray-700">- ${formatarMoeda(numValor, moeda)}</span>` : '';
    
    return `
        <div class="template-card">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${nome} ${valorInlineHTML}</h4>
                    ${detalhes}
                    ${template.notas ? `<p class="text-sm text-gray-500 mt-2">${template.notas}</p>` : ''}
                </div>
                <div class="template-actions flex space-x-2 ml-4">
                    <button onclick="editarTemplate('${tipo}', ${template.id})" 
                            class="text-blue-600 hover:text-blue-800 text-sm">
                        ✏️ Editar
                    </button>
                    <button onclick="excluirTemplate('${tipo}', ${template.id})" 
                            class="text-red-600 hover:text-red-800 text-sm">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Funções para abrir modais de templates
async function abrirModalTemplateReceita(templateId = null) {
    const titulo = templateId ? 'Editar Template de Receita' : 'Novo Template de Receita';
    const conteudo = `
        <h2 class="text-xl font-semibold mb-4">${titulo}</h2>
        <form id="formTemplateReceita">
            <input type="hidden" id="template_id" value="${templateId || ''}">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Receita</label>
                    <input type="text" id="tr_nome" class="w-full border border-gray-300 rounded px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input type="text" id="tr_valor" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select id="tr_categoria" class="w-full border border-gray-300 rounded px-3 py-2" required>
                        <option value="">Selecione uma categoria</option>
                        <option value="salário/emprego">Salário/Emprego</option>
                        <option value="negócios">Negócios</option>
                        <option value="investimentos">Investimentos</option>
                        <option value="aluguel/locação">Aluguel/Locação</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="factoring">Factoring</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                    <select id="tr_frequencia" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="mensal">Mensal</option>
                        <option value="bimestral">Bimestral</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
                    <select id="tr_moeda" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="BRL">BRL (Real)</option>
                        <option value="USD">USD (Dólar)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Confiabilidade</label>
                    <select id="tr_confiabilidade" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="alta">Alta</option>
                        <option value="baixa">Baixa</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea id="tr_notas" class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="fecharModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    ${templateId ? 'Atualizar' : 'Criar'} Template
                </button>
            </div>
        </form>
    `;
    
    abrirModal(conteudo);
    // Popular categorias dinamicamente no modal de template
    const selectCatTpl = document.getElementById('tr_categoria');
    if (selectCatTpl) {
        const categorias = getCategoriasReceita();
        selectCatTpl.innerHTML = `<option value="">Selecione uma categoria</option>` +
            (categorias || ['salário/emprego','negócios','investimentos','aluguel/locação','freelancer','factoring','outros'])
                .map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // Configurar máscara monetária
    const valorTpl = document.getElementById('tr_valor');
    if (valorTpl) configurarMascaraMonetaria(valorTpl);
    
    // Se for edição, carregar e preencher dados do template
    if (templateId) {
        try {
            const tpl = await carregarDadosTemplate('receitas', templateId);
            if (tpl) {
                preencherFormularioTemplate('receitas', tpl);
            }
        } catch (e) {
            console.error('Falha ao preencher template de receita:', e);
        }
    }
    
    // Configurar evento de submit
    const form = document.getElementById('formTemplateReceita');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await salvarTemplateReceita();
        });
    }
}

async function salvarTemplateReceita() {
    const templateId = document.getElementById('template_id').value;
    const isEdit = templateId !== '';
    
    const payload = {
        nome: document.getElementById('tr_nome').value,
        valor: parseValorBrasileiro(document.getElementById('tr_valor').value),
        categoria: document.getElementById('tr_categoria').value,
        frequencia: document.getElementById('tr_frequencia').value,
        moeda: document.getElementById('tr_moeda').value,
        confiabilidade: document.getElementById('tr_confiabilidade').value,
        notas: document.getElementById('tr_notas').value
    };
    
    if (isEdit) {
        payload.id = parseInt(templateId);
    }
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(`api/templates.php?type=receitas`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            fecharModal();
            carregarTemplates('receitas');
            alert(isEdit ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template');
    }
}

async function salvarTemplatePassivo() {
    const templateId = document.getElementById('tp_template_id').value;
    const isEdit = templateId !== '';
    
    const payload = {
        nome: document.getElementById('tp_nome').value,
        valor: parseValorBrasileiro(document.getElementById('tp_valor').value),
        notas: document.getElementById('tp_notas').value
    };
    
    if (isEdit) {
        payload.id = parseInt(templateId);
    }
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(`api/templates.php?type=passivos`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            fecharModal();
            carregarTemplates('passivos');
            alert(isEdit ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template');
    }
}

// Função para carregar dados do template para edição
async function carregarDadosTemplate(tipo, templateId) {
    try {
        const response = await fetch(`api/templates.php?type=${tipo}&id=${templateId}`);
        const template = await response.json();
        
        if (response.ok) {
            return template;
        } else {
            console.error('Erro ao carregar template:', template.error);
            return null;
        }
    } catch (error) {
        console.error('Erro ao carregar template:', error);
        return null;
    }
}

function preencherFormularioTemplate(tipo, template) {
    switch (tipo) {
        case 'receitas':
            document.getElementById('tr_nome').value = template.nome || '';
            document.getElementById('tr_valor').value = formatarValorInput(template.valor || 0);
            {
                const catSelect = document.getElementById('tr_categoria');
                if (catSelect) {
                    const desired = template.categoria || '';
                    catSelect.value = desired;
                    if (desired && catSelect.value !== desired) {
                        const opt = document.createElement('option');
                        opt.value = desired;
                        opt.textContent = desired;
                        catSelect.appendChild(opt);
                        catSelect.value = desired;
                    }
                }
            }
            document.getElementById('tr_frequencia').value = template.frequencia || 'mensal';
            document.getElementById('tr_moeda').value = template.moeda || 'BRL';
            document.getElementById('tr_confiabilidade').value = template.confiabilidade || 'alta';
            document.getElementById('tr_notas').value = template.notas || '';
            break;
        case 'custos':
            document.getElementById('tc_nome').value = template.nome || '';
            document.getElementById('tc_valor').value = formatarValorInput(template.valor || 0);
            {
                const centroSelect = document.getElementById('tc_centro_custo');
                if (centroSelect) {
                    const desired = template.centro_custo || '';
                    centroSelect.value = desired;
                    if (desired && centroSelect.value !== desired) {
                        const opt = document.createElement('option');
                        opt.value = desired;
                        opt.textContent = desired;
                        centroSelect.appendChild(opt);
                        centroSelect.value = desired;
                    }
                }
            }
            document.getElementById('tc_frequencia').value = template.frequencia || 'mensal';
            document.getElementById('tc_moeda').value = template.moeda || 'BRL';
            document.getElementById('tc_notas').value = template.notas || '';
            break;
        case 'investimentos':
            document.getElementById('ti_instituicao').value = template.instituicao || '';
            document.getElementById('ti_valor').value = formatarValorInput(template.valor || 0);
            document.getElementById('ti_moeda').value = template.moeda || 'BRL';
            document.getElementById('ti_rendimento').value = formatarPercentualInput(template.rendimento || 0);
            document.getElementById('ti_liquidez').value = template.liquidez || 'líquido';
            document.getElementById('ti_notas').value = template.notas || '';
            break;
        case 'ativos':
            document.getElementById('ta_nome').value = template.nome || '';
            document.getElementById('ta_valor').value = formatarValorInput(template.valor || 0);
            {
                const val = template.valorizacao;
                const numVal = (val !== null && val !== undefined) ? parseFloat(val) : NaN;
                const isNumericLike = !isNaN(numVal);
                const comportamento = isNumericLike
                    ? (numVal < 0 ? 'deprecia' : 'aprecia')
                    : (val === 'deprecia' ? 'deprecia' : 'aprecia');
                const absVal = isNumericLike ? Math.abs(numVal) : null;
                const percInput = document.getElementById('ta_valorizacao');
                if (percInput) percInput.value = (absVal !== null) ? formatarPercentualInput(absVal || 0) : '';
                const sel = document.getElementById('ta_comportamento');
                if (sel) sel.value = comportamento;
                // Padroniza como numérico para evitar envio de strings
                const form = document.getElementById('formTemplateAtivo');
                if (form) form.dataset.valorizacaoType = 'number';
            }
            document.getElementById('ta_notas').value = template.notas || '';
            break;
        case 'passivos':
            document.getElementById('tp_nome').value = template.nome || '';
            document.getElementById('tp_valor').value = formatarValorInput(template.valor || 0);
            // Campo removido do modal de Template de Passivo; proteger acesso
            const mesRefEl = document.getElementById('tp_mes_referencia');
            if (mesRefEl) mesRefEl.value = template.mes_referencia || '';
            document.getElementById('tp_notas').value = template.notas || '';
            break;
    }
}

// Funções para editar e excluir templates
async function editarTemplate(tipo, templateId) {
    switch (tipo) {
        case 'receitas':
            abrirModalTemplateReceita(templateId);
            break;
        case 'custos':
            abrirModalTemplateCusto(templateId);
            break;
        case 'investimentos':
            abrirModalTemplateInvestimento(templateId);
            break;
        case 'ativos':
            abrirModalTemplateAtivo(templateId);
            break;
        case 'passivos':
            abrirModalTemplatePassivo(templateId);
            break;
    }
}

async function excluirTemplate(tipo, templateId) {
    if (!confirm('Tem certeza que deseja excluir este template?')) {
        return;
    }
    
    try {
        const response = await fetch(`api/templates.php?type=${tipo}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: templateId })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            carregarTemplates(tipo);
            alert('Template excluído com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao excluir template:', error);
        alert('Erro ao excluir template');
    }
}

// Funções placeholder para outros tipos de templates
async function abrirModalTemplateCusto(templateId = null) {
    const titulo = templateId ? 'Editar Template de Custo' : 'Novo Template de Custo';
    
    const conteudo = `
        <h2 class="text-xl font-semibold mb-4">${titulo}</h2>
        <form id="formTemplateCusto">
            <input type="hidden" id="tc_template_id" value="${templateId || ''}">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Custo</label>
                    <input type="text" id="tc_nome" class="w-full border border-gray-300 rounded px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input type="text" id="tc_valor" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Centro de Custo</label>
                    <select id="tc_centro_custo" class="w-full border border-gray-300 rounded px-3 py-2" required>
                        <option value="">Selecione um centro de custo</option>
                        ${getCentrosCusto().map(centro => `<option value="${centro}">${centro}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                    <select id="tc_frequencia" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="mensal">Mensal</option>
                        <option value="bimestral">Bimestral</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                        <option value="eventual">Eventual</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
                    <select id="tc_moeda" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="BRL">BRL (Real)</option>
                        <option value="USD">USD (Dólar)</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea id="tc_notas" class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="fecharModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    ${templateId ? 'Atualizar' : 'Criar'} Template
                </button>
            </div>
        </form>
    `;
    
    abrirModal(conteudo);
    // Configurar máscara monetária
    const valorTpl = document.getElementById('tc_valor');
    if (valorTpl) configurarMascaraMonetaria(valorTpl);
    
    // Se for edição, carregar e preencher dados do template
    if (templateId) {
        try {
            const tpl = await carregarDadosTemplate('custos', templateId);
            if (tpl) {
                preencherFormularioTemplate('custos', tpl);
            }
        } catch (e) {
            console.error('Falha ao preencher template de custo:', e);
        }
    }
    
    // Configurar evento de submit
    const form = document.getElementById('formTemplateCusto');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await salvarTemplateCusto();
        });
    }
}

async function salvarTemplateCusto() {
    const templateId = document.getElementById('tc_template_id').value;
    const isEdit = templateId !== '';
    
    const payload = {
        nome: document.getElementById('tc_nome').value,
        valor: parseValorBrasileiro(document.getElementById('tc_valor').value),
        centro_custo: document.getElementById('tc_centro_custo').value,
        frequencia: document.getElementById('tc_frequencia').value,
        moeda: document.getElementById('tc_moeda').value,
        notas: document.getElementById('tc_notas').value
    };
    
    if (isEdit) {
        payload.id = parseInt(templateId);
    }
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(`api/templates.php?type=custos`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            fecharModal();
            carregarTemplates('custos');
            alert(isEdit ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template');
    }
}

async function abrirModalTemplateInvestimento(templateId = null) {
    const titulo = templateId ? 'Editar Template de Investimento' : 'Novo Template de Investimento';
    
    const conteudo = `
        <h2 class="text-xl font-semibold mb-4">${titulo}</h2>
        <form id="formTemplateInvestimento">
            <input type="hidden" id="ti_template_id" value="${templateId || ''}">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Instituição</label>
                    <input type="text" id="ti_instituicao" class="w-full border border-gray-300 rounded px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input type="text" id="ti_valor" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
                    <select id="ti_moeda" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="BRL">BRL (Real)</option>
                        <option value="USD">USD (Dólar)</option>
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Rendimento (%)</label>
                    <input type="text" id="ti_rendimento" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Liquidez</label>
                    <select id="ti_liquidez" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="líquido">Líquido</option>
                        <option value="conversível">Conversível</option>
                        <option value="ilíquido">Ilíquido</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea id="ti_notas" class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="fecharModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    ${templateId ? 'Atualizar' : 'Criar'} Template
                </button>
            </div>
        </form>
    `;
    
    abrirModal(conteudo);
    // Configurar máscaras monetária e percentual
    const valorTpl = document.getElementById('ti_valor');
    if (valorTpl) configurarMascaraMonetaria(valorTpl);
    const rendTpl = document.getElementById('ti_rendimento');
    if (rendTpl) configurarMascaraPercentual(rendTpl);
    
    // Se for edição, carregar e preencher dados do template
    if (templateId) {
        try {
            const tpl = await carregarDadosTemplate('investimentos', templateId);
            if (tpl) {
                preencherFormularioTemplate('investimentos', tpl);
            }
        } catch (e) {
            console.error('Falha ao preencher template de investimento:', e);
        }
    }
    
    // Configurar evento de submit
    const form = document.getElementById('formTemplateInvestimento');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await salvarTemplateInvestimento();
        });
    }
}

async function salvarTemplateInvestimento() {
    const templateId = document.getElementById('ti_template_id').value;
    const isEdit = templateId !== '';
    
    const payload = {
        instituicao: document.getElementById('ti_instituicao').value,
        valor: parseValorBrasileiro(document.getElementById('ti_valor').value),
        moeda: document.getElementById('ti_moeda').value,
        rendimento: parseFloat(document.getElementById('ti_rendimento').value.replace(',', '.')) || 0,
        liquidez: document.getElementById('ti_liquidez').value,
        notas: document.getElementById('ti_notas').value
    };
    
    if (isEdit) {
        payload.id = parseInt(templateId);
    }
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(`api/templates.php?type=investimentos`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            fecharModal();
            carregarTemplates('investimentos');
            alert(isEdit ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template');
    }
}

async function abrirModalTemplateAtivo(templateId = null) {
    const titulo = templateId ? 'Editar Template de Ativo' : 'Novo Template de Ativo';
    
    const conteudo = `
        <h2 class="text-xl font-semibold mb-4">${titulo}</h2>
        <form id="formTemplateAtivo">
            <input type="hidden" id="ta_template_id" value="${templateId || ''}">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Ativo</label>
                    <input type="text" id="ta_nome" class="w-full border border-gray-300 rounded px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input type="text" id="ta_valor" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valorização (%)</label>
                    <input type="text" id="ta_valorizacao" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Comportamento</label>
                    <select id="ta_comportamento" class="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="aprecia">Aprecia</option>
                        <option value="deprecia">Deprecia</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea id="ta_notas" class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="fecharModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    ${templateId ? 'Atualizar' : 'Criar'} Template
                </button>
            </div>
        </form>
    `;
    
    abrirModal(conteudo);
    // Configurar máscaras monetária e percentual
    const valorTpl = document.getElementById('ta_valor');
    if (valorTpl) configurarMascaraMonetaria(valorTpl);
    const valTpl = document.getElementById('ta_valorizacao');
    if (valTpl) configurarMascaraPercentual(valTpl);
    
    // Se for edição, carregar e preencher dados do template
    if (templateId) {
        try {
            const tpl = await carregarDadosTemplate('ativos', templateId);
            if (tpl) {
                preencherFormularioTemplate('ativos', tpl);
            }
        } catch (e) {
            console.error('Falha ao preencher template de ativo:', e);
        }
    }
    
    // Configurar evento de submit
    const form = document.getElementById('formTemplateAtivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await salvarTemplateAtivo();
        });
    }
}

async function salvarTemplateAtivo() {
    const templateId = document.getElementById('ta_template_id').value;
    const isEdit = templateId !== '';
    
    const comportamento = document.getElementById('ta_comportamento')?.value || 'aprecia';
    let perc = parseFloat((document.getElementById('ta_valorizacao').value || '').replace(',', '.'));
    if (isNaN(perc)) perc = 0;
    const percAbs = Math.abs(perc);
    const valorizacaoDecimal = comportamento === 'deprecia' ? -percAbs : percAbs;
    const payload = {
        nome: document.getElementById('ta_nome').value,
        valor: parseValorBrasileiro(document.getElementById('ta_valor').value),
        valorizacao: valorizacaoDecimal,
        notas: document.getElementById('ta_notas').value
    };
    
    if (isEdit) {
        payload.id = parseInt(templateId);
    }
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(`api/templates.php?type=ativos`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            fecharModal();
            carregarTemplates('ativos');
            alert(isEdit ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao salvar template:', error);
        alert('Erro ao salvar template');
    }
}

async function abrirModalTemplatePassivo(templateId = null) {
    const titulo = templateId ? 'Editar Template de Passivo' : 'Novo Template de Passivo';
    
    const conteudo = `
        <h2 class="text-xl font-semibold mb-4">${titulo}</h2>
        <form id="formTemplatePassivo">
            <input type="hidden" id="tp_template_id" value="${templateId || ''}">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Passivo</label>
                    <input type="text" id="tp_nome" class="w-full border border-gray-300 rounded px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input type="text" id="tp_valor" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="0,00">
                </div>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea id="tp_notas" class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button type="button" onclick="fecharModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    ${templateId ? 'Atualizar' : 'Criar'} Template
                </button>
            </div>
        </form>
    `;
    
    abrirModal(conteudo);
    // Configurar máscara monetária
    const valorTpl = document.getElementById('tp_valor');
    if (valorTpl) configurarMascaraMonetaria(valorTpl);
    
    // Se for edição, carregar e preencher dados do template
    if (templateId) {
        try {
            const tpl = await carregarDadosTemplate('passivos', templateId);
            if (tpl) {
                preencherFormularioTemplate('passivos', tpl);
            }
        } catch (e) {
            console.error('Falha ao preencher template de passivo:', e);
        }
    }
    
    // Configurar evento de submit
    const form = document.getElementById('formTemplatePassivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await salvarTemplatePassivo();
        });
    }
}













// Funções de editar e excluir para Receitas
function editarReceita(index) {
    const receita = estado.receitas[index];
    if (!receita) return;
    
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Editar Receita</h3>
        <form id="formEditarReceita" class="space-y-3">
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="edit_rec_nome" class="form-input" value="${receita.nome || ''}" required>
            </div>
            <div>
                <label class="form-label">Categoria</label>
                <select id="edit_rec_categoria" class="form-input" required>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="number" step="0.01" id="edit_rec_valor" class="form-input" value="${receita.valor || 0}" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="edit_rec_moeda" class="form-input">
                        <option value="BRL" ${receita.moeda === 'BRL' ? 'selected' : ''}>BRL</option>
                        <option value="USD" ${receita.moeda === 'USD' ? 'selected' : ''}>USD</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="edit_rec_mes" class="form-input" value="${receita.mes_ano || estado.mesAno}" required>
            </div>
            <div>
                <label class="form-label">Confiabilidade</label>
                <select id="edit_rec_conf" class="form-input">
                    <option value="alta" ${receita.confiabilidade === 'alta' ? 'selected' : ''}>alta</option>
                    <option value="media" ${receita.confiabilidade === 'media' ? 'selected' : ''}>média</option>
                    <option value="baixa" ${receita.confiabilidade === 'baixa' ? 'selected' : ''}>baixa</option>
                </select>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="edit_rec_notas" class="form-input">${receita.notas || ''}</textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Popular categorias dinamicamente
    const selectCategoria = document.getElementById('edit_rec_categoria');
    if (selectCategoria) {
        const categorias = getCategoriasReceita();
        selectCategoria.innerHTML = (categorias || ['salario','freelance','investimentos','outros'])
            .map(c => `<option value="${c}" ${receita.categoria === c ? 'selected' : ''}>${c}</option>`).join('');
    }
    
    // Aplicar máscara monetária ao campo valor
    const valorInput = document.getElementById('edit_rec_valor');
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    const form = document.getElementById('formEditarReceita');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('edit_rec_nome').value,
                categoria: document.getElementById('edit_rec_categoria').value,
                valor: parseValorBrasileiro(document.getElementById('edit_rec_valor').value || '0'),
                moeda: document.getElementById('edit_rec_moeda').value,
                // Mantém a frequência existente no registro, sem campo na UI
                frequencia: receita.frequencia,
                confiabilidade: document.getElementById('edit_rec_conf').value,
                notas: document.getElementById('edit_rec_notas').value || '',
                mes_ano: document.getElementById('edit_rec_mes').value
            };
            
            try {
                await apiRequest(`receitas.php?id=${receita.id}`, 'PUT', payload);
            } catch (_) {
                estado.receitas[index] = { ...receita, ...payload };
                salvarDadosLocais('receitas', estado.receitas);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

function excluirReceita(index) {
    const receita = estado.receitas[index];
    if (!receita) return;
    
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
        try {
            apiRequest(`receitas.php?id=${receita.id}`, 'DELETE');
        } catch (_) {
            estado.receitas.splice(index, 1);
            salvarDadosLocais('receitas', estado.receitas);
        }
        carregarDadosMes();
    }
}

// Funções de editar e excluir para Custos
function editarCusto(index) {
    const custo = estado.custos[index];
    if (!custo) return;
    
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Editar Custo</h3>
        <form id="formEditarCusto" class="space-y-3">
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="edit_cus_nome" class="form-input" value="${custo.nome || ''}" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="number" step="0.01" id="edit_cus_valor" class="form-input" value="${custo.valor || 0}" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="edit_cus_moeda" class="form-input">
                        <option value="BRL" ${custo.moeda === 'BRL' ? 'selected' : ''}>BRL</option>
                        <option value="USD" ${custo.moeda === 'USD' ? 'selected' : ''}>USD</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Centro de Custo</label>
                <select id="edit_cus_centro" class="form-input" required>
                </select>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="edit_cus_mes" class="form-input" value="${custo.mes_ano || estado.mesAno}" required>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="edit_cus_notas" class="form-input">${custo.notas || ''}</textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Popular centros de custo dinamicamente
    const selectCentro = document.getElementById('edit_cus_centro');
    if (selectCentro) {
        const centros = getCentrosCusto();
        selectCentro.innerHTML = (centros || ['operacional','administrativo','vendas','marketing','outros'])
            .map(c => `<option value="${c}" ${(custo.centro_custo || custo.centroCusto) === c ? 'selected' : ''}>${c}</option>`).join('');
    }
    
    // Aplicar máscara monetária ao campo valor
    const valorInput = document.getElementById('edit_cus_valor');
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    const form = document.getElementById('formEditarCusto');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('edit_cus_nome').value,
                valor: parseValorBrasileiro(document.getElementById('edit_cus_valor').value || '0'),
                moeda: document.getElementById('edit_cus_moeda').value,
                centro_custo: document.getElementById('edit_cus_centro').value,
                centroCusto: document.getElementById('edit_cus_centro').value,
                notas: document.getElementById('edit_cus_notas').value || '',
                mes_ano: document.getElementById('edit_cus_mes').value
            };
            
            try {
                await apiRequest(`custos.php?id=${custo.id}`, 'PUT', payload);
            } catch (_) {
                estado.custos[index] = { ...custo, ...payload };
                salvarDadosLocais('custos', estado.custos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

function excluirCusto(index) {
    const custo = estado.custos[index];
    if (!custo) return;
    
    if (confirm('Tem certeza que deseja excluir este custo?')) {
        try {
            apiRequest(`custos.php?id=${custo.id}`, 'DELETE');
        } catch (_) {
            estado.custos.splice(index, 1);
            salvarDadosLocais('custos', estado.custos);
        }
        carregarDadosMes();
    }
}

// Funções de editar e excluir para Investimentos
function editarInvestimento(index) {
    const investimento = estado.investimentos[index];
    if (!investimento) return;
    
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Editar Investimento</h3>
        <form id="formEditarInvestimento" class="space-y-3">
            <div>
                <label class="form-label">Instituição</label>
                <input type="text" id="edit_inv_instituicao" class="form-input" value="${investimento.instituicao || ''}" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Saldo</label>
                    <input type="text" id="edit_inv_saldo" class="form-input" value="${formatarValorInput(investimento.saldo || investimento.valor || 0)}" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="edit_inv_moeda" class="form-input">
                        <option value="BRL" ${(investimento.moeda || 'BRL') === 'BRL' ? 'selected' : ''}>BRL</option>
                        <option value="USD" ${investimento.moeda === 'USD' ? 'selected' : ''}>USD</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Rendimento (%)</label>
                    <input type="text" id="edit_inv_rendimento" class="form-input" value="${formatarPercentualInput(investimento.rendimento_percentual || investimento.rendimentoPercentual || 0)}">
                </div>
                <div>
                    <label class="form-label">Liquidez</label>
                    <select id="edit_inv_liquidez" class="form-input">
                        <option value="líquido" ${(investimento.liquidez || 'líquido') === 'líquido' ? 'selected' : ''}>líquido</option>
                        <option value="conversível" ${investimento.liquidez === 'conversível' ? 'selected' : ''}>conversível</option>
                        <option value="ilíquido" ${investimento.liquidez === 'ilíquido' ? 'selected' : ''}>ilíquido</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Mês de referência</label>
                <input type="month" id="edit_inv_mes" class="form-input" value="${investimento.mes_ano || estado.mesAno}" required>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="edit_inv_notas" class="form-input">${investimento.notas || ''}</textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Adicionar event listeners para formatação em tempo real
    const saldoInput = document.getElementById('edit_inv_saldo');
    const rendimentoInput = document.getElementById('edit_inv_rendimento');
    
    // Configura máscara monetária para o campo saldo
    if (saldoInput) {
        configurarMascaraMonetaria(saldoInput);
    }
    
    if (rendimentoInput) {
        configurarMascaraPercentual(rendimentoInput);
    }
    
    const form = document.getElementById('formEditarInvestimento');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                instituicao: document.getElementById('edit_inv_instituicao').value,
                saldo: parseValorBrasileiro(document.getElementById('edit_inv_saldo').value),
                moeda: document.getElementById('edit_inv_moeda').value,
                // Enviar ambos formatos para compatibilidade
                rendimento_percentual: parseFloat(document.getElementById('edit_inv_rendimento').value.replace(',', '.')) || 0,
                rendimentoPercentual: parseFloat(document.getElementById('edit_inv_rendimento').value.replace(',', '.')) || 0,
                liquidez: document.getElementById('edit_inv_liquidez').value,
                notas: document.getElementById('edit_inv_notas').value || '',
                mes_ano: document.getElementById('edit_inv_mes').value
            };
            
            try {
                await apiRequest(`investimentos.php?id=${investimento.id}`, 'PUT', payload);
            } catch (_) {
                estado.investimentos[index] = { ...investimento, ...payload };
                salvarDadosLocais('investimentos', estado.investimentos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

function excluirInvestimento(index) {
    const investimento = estado.investimentos[index];
    if (!investimento) return;
    
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
        try {
            apiRequest(`investimentos.php?id=${investimento.id}`, 'DELETE');
        } catch (_) {
            estado.investimentos.splice(index, 1);
            salvarDadosLocais('investimentos', estado.investimentos);
        }
        carregarDadosMes();
    }
}

// Funções de editar e excluir para Ativos
function editarAtivo(index) {
    const ativo = estado.ativos[index];
    if (!ativo) return;
    
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Editar Ativo</h3>
        <form id="formEditarAtivo" class="space-y-3">
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="edit_atv_nome" class="form-input" value="${ativo.nome || ''}" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="text" id="edit_atv_valor" class="form-input" value="${formatarValorInput(ativo.valor || 0)}" required>
                </div>
                <div>
                    <label class="form-label">Valorização (%)</label>
                    <input type="number" step="0.01" id="edit_atv_valorizacao" class="form-input" value="${ativo.valorizacao || 0}">
                </div>
            </div>
            <div>
                <label class="form-label">Mês de referência</label>
                <input type="month" id="edit_atv_mes" class="form-input" value="${ativo.mes_ano || estado.mesAno}" required>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="edit_atv_notas" class="form-input">${ativo.notas || ''}</textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Adicionar event listeners para formatação em tempo real
    const valorInput = document.getElementById('edit_atv_valor');
    
    // Configura máscara monetária para o campo valor
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    // Carregar templates de ativos
    carregarTemplatesAtivo();
    
    // Event listener para seleção de template
    const templateSelect = document.getElementById('atv_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                preencherFormularioComTemplate('ativos', this.value);
            }
        });
    }
    
    const form = document.getElementById('formEditarAtivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('edit_atv_nome').value,
                valor: parseValorBrasileiro(document.getElementById('edit_atv_valor').value),
                valorizacao: parseFloat(document.getElementById('edit_atv_valorizacao').value || '0'),
                notas: document.getElementById('edit_atv_notas').value || '',
                mes_ano: document.getElementById('edit_atv_mes').value
            };
            
            try {
                await apiRequest(`ativos.php?id=${ativo.id}`, 'PUT', payload);
            } catch (_) {
                estado.ativos[index] = { ...ativo, ...payload };
                salvarDadosLocais('ativos', estado.ativos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

function excluirAtivo(index) {
    const ativo = estado.ativos[index];
    if (!ativo) return;
    
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
        try {
            apiRequest(`ativos.php?id=${ativo.id}`, 'DELETE');
        } catch (_) {
            estado.ativos.splice(index, 1);
            salvarDadosLocais('ativos', estado.ativos);
        }
        carregarDadosMes();
    }
}

// Funções de editar e excluir para Passivos
function editarPassivo(index) {
    const passivo = estado.passivos[index];
    if (!passivo) return;
    
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Editar Passivo</h3>
        <form id="formEditarPassivo" class="space-y-3">
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="edit_psv_nome" class="form-input" value="${passivo.nome || ''}" required>
            </div>
            <div>
                <label class="form-label">Valor</label>
                <input type="text" id="edit_psv_valor" class="form-input" value="${formatarValorInput(passivo.valor || 0)}" required>
            </div>
            <div>
                <label class="form-label">Mês de referência</label>
                <input type="month" id="edit_psv_mes" class="form-input" value="${passivo.mes_ano || estado.mesAno}" required>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="edit_psv_notas" class="form-input">${passivo.notas || ''}</textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Adicionar event listeners para formatação em tempo real
    const valorInput = document.getElementById('edit_psv_valor');
    
    // Configura máscara monetária para o campo valor
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    const form = document.getElementById('formEditarPassivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('edit_psv_nome').value,
                valor: parseValorBrasileiro(document.getElementById('edit_psv_valor').value),
                notas: document.getElementById('edit_psv_notas').value || '',
                mes_ano: document.getElementById('edit_psv_mes').value
            };
            
            try {
                await apiRequest(`passivos.php?id=${passivo.id}`, 'PUT', payload);
            } catch (_) {
                estado.passivos[index] = { ...passivo, ...payload };
                salvarDadosLocais('passivos', estado.passivos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

function excluirPassivo(index) {
    const passivo = estado.passivos[index];
    if (!passivo) return;
    
    if (confirm('Tem certeza que deseja excluir este passivo?')) {
        try {
            apiRequest(`passivos.php?id=${passivo.id}`, 'DELETE');
        } catch (_) {
            estado.passivos.splice(index, 1);
            salvarDadosLocais('passivos', estado.passivos);
        }
        carregarDadosMes();
    }
}

function abrirTab(tabId, updateHash = true) {
    // Remover classe active de todas as tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('text-blue-600', 'border-blue-600');
        btn.classList.add('text-gray-500', 'border-transparent');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    // Adicionar classe active à tab selecionada
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    const tabContent = document.getElementById(tabId);
    
    if (tabButton && tabContent) {
        tabButton.classList.add('active');
        tabButton.classList.remove('text-gray-500', 'border-transparent');
        tabButton.classList.add('text-blue-600', 'border-blue-600');
        
        tabContent.classList.add('active');
        tabContent.classList.remove('hidden');
        
        // Atualizar hash na URL se solicitado
        if (updateHash) {
            window.location.hash = tabId;
        }
        
        // Atualizar gráfico específico da aba
        setTimeout(async () => {
            switch(tabId) {
                case 'receitas':
                    await atualizarGraficoReceitas();
                    break;
                case 'custos':
                    await atualizarGraficoCustos();
                    break;
                case 'investimentos':
                    await atualizarGrafico(); // Gráfico patrimonial
                    break;
                case 'ativos-passivos':
                    await atualizarGraficoAtivosPassivos();
                    break;
                case 'configuracoes':
                    // Carregar templates da primeira sub-aba (receitas) e ativar a primeira sub-aba
                    abrirConfigTab('receitas');
                    break;
            }
        }, 100); // Pequeno delay para garantir que o canvas esteja visível
    }
}

// Funções para gerenciar persistência de abas via hash
function carregarAbaDoHash() {
    const hash = window.location.hash.substring(1); // Remove o #
    const abasValidas = ['receitas', 'custos', 'investimentos', 'ativos-passivos', 'configuracoes'];
    
    if (hash && abasValidas.includes(hash)) {
        abrirTab(hash, false); // false para não atualizar o hash novamente
    } else {
        abrirTab('receitas', false); // Aba padrão
    }
}

// Event listener para mudanças no hash
window.addEventListener('hashchange', function() {
    carregarAbaDoHash();
});

// Navegação entre meses
function navegarMes(direcao) {
    const [ano, mes] = estado.mesAno.split('-').map(Number);
    let novoMes = mes + direcao;
    let novoAno = ano;
    
    if (novoMes > 12) {
        novoMes = 1;
        novoAno++;
    } else if (novoMes < 1) {
        novoMes = 12;
        novoAno--;
    }
    
    estado.mesAno = `${novoAno}-${novoMes.toString().padStart(2, '0')}`;

    
    const mesAnoHidden = document.getElementById('mesAno');
    if (mesAnoHidden) mesAnoHidden.value = estado.mesAno;
    // Atualizar range dinâmico de anos
    atualizarOpcoesAno(novoAno);
    // Atualizar selects de mês/ano
    const mesSelect = document.getElementById('mesSelect');
    const anoSelect = document.getElementById('anoSelect');
    if (mesSelect) mesSelect.value = novoMes.toString().padStart(2, '0');
    if (anoSelect) anoSelect.value = novoAno.toString();
    carregarDadosMes();
}

// API - Simulação de backend
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        // Sempre anexar mesAno quando usando endpoints sem .php (roteador index.php)
        const isPhpEndpoint = endpoint.includes('.php');
        const base = `api/${endpoint}`;
        const url = isPhpEndpoint
            ? base
            : `${base}${base.includes('?') ? '&' : '?'}mesAno=${estado.mesAno}`;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : null
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        
        const result = await response.json();
        console.log(`🔍 DEBUG: Resultado da API ${endpoint} para ${estado.mesAno}:`, result);
        return result;
    } catch (error) {
        console.error('Erro na API:', error);
        console.log(`🔍 DEBUG: Fazendo fallback para localStorage para ${endpoint} e ${estado.mesAno}`);
        const dadosLocais = carregarDadosLocais(endpoint);
        console.log(`🔍 DEBUG: Dados locais encontrados:`, dadosLocais);
        return dadosLocais;
    }
}

function carregarDadosLocais(endpoint) {
    const dadosLocais = localStorage.getItem(`evoPatri_${endpoint}_${estado.mesAno}`);
    return dadosLocais ? JSON.parse(dadosLocais) : [];
}

function salvarDadosLocais(endpoint, dados) {
    localStorage.setItem(`evoPatri_${endpoint}_${estado.mesAno}`, JSON.stringify(dados));
}



async function apiRequestSemMesAno(endpoint, method = 'GET', data = null) {
    try {
        const url = `api/${endpoint}`;
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : null
        });
        
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        return [];
    }
}

async function carregarDadosMesEspecifico(endpoint, mesAno) {
    try {
        // Priorizar dados da API para o mês explicitado
        const response = await apiRequestSemMesAno(`${endpoint}.php?mes_ano=${mesAno}`);
        if (Array.isArray(response) && response.length > 0) {
            return response;
        }

        // Fallback para dados locais se API não retornar nada
        const dadosLocais = carregarDadosLocais(endpoint) || [];
        return dadosLocais.filter(item => item.mes_ano === mesAno);
    } catch (error) {
        console.error(`Erro ao carregar dados de ${endpoint} para ${mesAno}:`, error);
        const dadosLocais = carregarDadosLocais(endpoint) || [];
        return dadosLocais.filter(item => item.mes_ano === mesAno);
    }
}

// Cotação do Dólar
async function carregarCotacaoDolar() {
    try {
        // Simulação da API do Google Finance
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        estado.cotacaoDolar = data.rates.BRL;
    } catch (error) {
        console.error('Erro ao carregar cotação:', error);
        // Fallback
        estado.cotacaoDolar = 5.0;
    }
    
    document.getElementById('cotacaoDolar').textContent = `R$ ${estado.cotacaoDolar.toFixed(2)}`;
}

// Carregar dados do mês
async function carregarDadosMes() {
    // CORREÇÃO: Limpar explicitamente todos os arrays do estado antes de carregar novos dados
    // Isso garante que dados de outros meses não persistam na interface
    console.log(`🔄 DEBUG: Carregando dados para ${estado.mesAno} - Limpando estado`);
    estado.receitas = [];
    estado.custos = [];
    estado.investimentos = [];
    estado.ativos = [];
    estado.passivos = [];
    
    // Carregar receitas e converter valores para números
    const receitasApi = await apiRequest('receitas');
    console.log(`📊 DEBUG: Receitas carregadas para ${estado.mesAno}:`, receitasApi);
    estado.receitas = (receitasApi || []).map((receita) => ({
        ...receita,
        valor: parseFloat(receita.valor) || 0
    }));

    
    // Mapear custos snake_case -> camelCase quando necessário
    const custosApi = await apiRequest('custos');
    estado.custos = (custosApi || []).map((row) => {
        if ('centroCusto' in row) return row;
        return {
            id: row.id,
            nome: row.nome,
            valor: parseFloat(row.valor || 0),
            moeda: row.moeda,
            centroCusto: row.centro_custo || '',
            notas: row.notas || '',
            mes_ano: row.mes_ano
        };
    });

    
    // Mapear investimentos snake_case -> camelCase quando necessário
    const invApi = await apiRequest('investimentos');
    estado.investimentos = (invApi || []).map((row) => {
        if ('rendimentoPercentual' in row) return row;
        return {
            id: row.id,
            instituicao: row.instituicao,
            saldo: parseFloat(row.saldo || 0),
            moeda: row.moeda,
            rendimentoPercentual: parseFloat(row.rendimento_percentual || 0),
            liquidez: row.liquidez,
            notas: row.notas || '',
            mes_ano: row.mes_ano
        };
    });

    
    estado.ativos = await apiRequest('ativos');
    console.log(`📊 DEBUG: Ativos carregados para ${estado.mesAno}:`, estado.ativos);
    estado.passivos = await apiRequest('passivos');
    console.log(`📊 DEBUG: Passivos carregados para ${estado.mesAno}:`, estado.passivos);
    
    atualizarInterface();
    // Atualizar todos os gráficos ao trocar de mês/ano
    await atualizarGraficoReceitas();
    await atualizarGraficoCustos();
    await atualizarGraficoAtivosPassivos();
    await atualizarGrafico();
}

// Atualizar interface
function atualizarInterface() {
    atualizarTitulosAbas();
    atualizarReceitas();
    atualizarCustos();
    atualizarInvestimentos();
    atualizarAtivosPassivos();
    atualizarResumoPatrimonial();
}

// Atualizar títulos das abas com o mês selecionado
function atualizarTitulosAbas() {
    const mesFormatado = formatarMesAno(estado.mesAno);
    
    const tituloReceitas = document.querySelector('#receitas h2');
    if (tituloReceitas) tituloReceitas.textContent = `Receitas ${mesFormatado}`;
    
    const tituloCustos = document.querySelector('#custos h2');
    if (tituloCustos) tituloCustos.textContent = `Custos ${mesFormatado}`;
    
    const tituloInvestimentos = document.querySelector('#investimentos h2');
    if (tituloInvestimentos) tituloInvestimentos.textContent = `Investimentos ${mesFormatado}`;
    
    const tituloAtivosPassivos = document.querySelector('#ativos-passivos h2');
    if (tituloAtivosPassivos) tituloAtivosPassivos.textContent = `Ativos & Passivos ${mesFormatado}`;
}

// Ordenação de tabelas
function ordenarTabela(tipo, chave) {
    const cfg = estado.sort[tipo];
    if (!cfg) return;
    if (cfg.key === chave) {
        cfg.dir = cfg.dir === 'asc' ? 'desc' : 'asc';
    } else {
        cfg.key = chave;
        cfg.dir = 'asc';
    }
    if (tipo === 'receitas') atualizarReceitas();
    else if (tipo === 'custos') atualizarCustos();
    else if (tipo === 'investimentos') atualizarInvestimentos();
    else if (tipo === 'ativos') atualizarAtivos();
    else if (tipo === 'passivos') atualizarPassivos();
}

function getSortIndicator(tipo, chave) {
    const cfg = estado.sort[tipo];
    if (!cfg || cfg.key !== chave) return '';
    return cfg.dir === 'asc' ? ' ▲' : ' ▼';
}

function sortDados(tipo, dados) {
    const cfg = estado.sort[tipo];
    if (!cfg || !cfg.key) return dados;
    const key = cfg.key;
    const dir = cfg.dir;
    return [...dados].sort((a, b) => comparar(tipo, a, b, key, dir));
}

function comparar(tipo, a, b, key, dir) {
    const va = valorOrdenacao(tipo, a, key);
    const vb = valorOrdenacao(tipo, b, key);
    let res;
    if (typeof va === 'string' || typeof vb === 'string') {
        res = String(va).localeCompare(String(vb), 'pt-BR', { numeric: true, sensitivity: 'base' });
    } else {
        res = (va || 0) - (vb || 0);
    }
    return dir === 'asc' ? res : -res;
}

function valorOrdenacao(tipo, item, key) {
    switch (tipo) {
        case 'receitas': {
            const valorBRL = item.moeda === 'USD' ? item.valor * estado.cotacaoDolar : item.valor;
            const valorUSD = item.moeda === 'USD' ? item.valor : 0;
            const mapa = {
                nome: item.nome?.toLowerCase() || '',
                categoria: item.categoria?.toLowerCase() || '',
                frequencia: item.frequencia?.toLowerCase() || '',
                confiabilidade: item.confiabilidade?.toLowerCase() || '',
                moeda: item.moeda || '',
                valorBRL,
                valorUSD,
            };
            return mapa[key];
        }
        case 'custos': {
            const valorBRL = item.moeda === 'USD' ? item.valor * estado.cotacaoDolar : item.valor;
            const valorUSD = item.moeda === 'USD' ? item.valor : 0;
            const mapa = {
                nome: item.nome?.toLowerCase() || '',
                centroCusto: (item.centroCusto && item.centroCusto.trim()) ? item.centroCusto.toLowerCase() : 'centro não definido',
                moeda: item.moeda || '',
                valorBRL,
                valorUSD,
            };
            return mapa[key];
        }
        case 'investimentos': {
            const saldoBRL = item.moeda === 'BRL' ? item.saldo : item.saldo * estado.cotacaoDolar;
            const saldoUSD = item.moeda === 'USD' ? item.saldo : item.saldo / estado.cotacaoDolar;
            const rendimentoValor = saldoBRL * (item.rendimentoPercentual / 100);
            const mapa = {
                instituicao: item.instituicao?.toLowerCase() || '',
                liquidez: item.liquidez?.toLowerCase() || '',
                saldoBRL,
                saldoUSD,
                rendimentoPercentual: item.rendimentoPercentual || 0,
                rendimentoValor,
            };
            return mapa[key];
        }
        case 'ativos': {
            const mapa = {
                nome: item.nome?.toLowerCase() || '',
                valorizacao: item.valorizacao?.toLowerCase() || '',
                valorBRL: item.valor || 0,
            };
            return mapa[key];
        }
        case 'passivos': {
            const mapa = {
                nome: item.nome?.toLowerCase() || '',
                valorBRL: item.valor || 0,
            };
            return mapa[key];
        }
    }
    return 0;
}

// Receitas
function atualizarReceitas() {
    const container = document.getElementById('listaReceitas');
    
    if (estado.receitas.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma receita cadastrada</p>';
        return;
    }
    
    let total = 0;
    let linhas = '';
    const dados = sortDados('receitas', estado.receitas);
    let totalBRL = 0;
    let totalUSD = 0;
    
    dados.forEach((receita, index) => {
        const valorConvertido = receita.moeda === 'USD' ? receita.valor * estado.cotacaoDolar : receita.valor;
        total += valorConvertido;
        totalBRL += valorConvertido;
        if (receita.moeda === 'USD') totalUSD += receita.valor;
        const valorUSDCol = receita.moeda === 'USD' ? formatarMoeda(receita.valor, 'USD') : '-';
        const confiabBadgeClass = receita.confiabilidade === 'alta' ? 'badge-alta' : 'badge-baixa';
        linhas += `
            <tr class="border-b">
                <td class="px-3 py-2 font-medium">${receita.nome}</td>
                <td class="px-3 py-2">${receita.categoria}</td>
                <td class="px-3 py-2">${receita.frequencia}</td>
                <td class="px-3 py-2"><span class="${confiabBadgeClass} text-xs px-2 py-1 rounded">${receita.confiabilidade}</span></td>
                <td class="px-3 py-2">${receita.moeda}</td>
                <td class="px-3 py-2 text-right font-semibold text-gray-800">${formatarMoeda(valorConvertido, 'BRL')}</td>
                <td class="px-3 py-2 text-right text-gray-500">${valorUSDCol}</td>
                <td class="px-3 py-2 text-gray-600">${receita.notas ? receita.notas : ''}</td>
                <td class="px-3 py-2 text-right">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarReceita(${index})">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm ml-2" onclick="excluirReceita(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
    // Totais na última linha
    linhas += `
        <tr class="bg-gray-50 font-semibold">
            <td class="px-3 py-2">Totais</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2 text-right">${formatarMoeda(totalBRL, 'BRL')}</td>
            <td class="px-3 py-2 text-right">${formatarMoeda(totalUSD, 'USD')}</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
        </tr>
    `;
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left bg-gray-50 border-b">
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('receitas','nome')">Nome${getSortIndicator('receitas','nome')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('receitas','categoria')">Categoria${getSortIndicator('receitas','categoria')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('receitas','frequencia')">Frequência${getSortIndicator('receitas','frequencia')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('receitas','confiabilidade')">Confiabilidade${getSortIndicator('receitas','confiabilidade')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('receitas','moeda')">Moeda${getSortIndicator('receitas','moeda')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('receitas','valorBRL')">Valor (BRL)${getSortIndicator('receitas','valorBRL')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('receitas','valorUSD')">Valor (USD)${getSortIndicator('receitas','valorUSD')}</th>
                        <th class="px-3 py-2">Notas</th>
                        <th class="px-3 py-2 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    `;
    // Total agora consta na última linha da tabela
}

// Custos
function atualizarCustos() {
    const container = document.getElementById('listaCustos');
    
    if (estado.custos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum custo cadastrado</p>';
        return;
    }
    
    let total = 0;
    let linhas = '';
    const dados = sortDados('custos', estado.custos);
    let totalBRL = 0;
    let totalUSD = 0;
    
    dados.forEach((custo, index) => {
        const valorConvertido = custo.moeda === 'USD' ? custo.valor * estado.cotacaoDolar : custo.valor;
        total += valorConvertido;
        totalBRL += valorConvertido;
        if (custo.moeda === 'USD') totalUSD += custo.valor;
        const valorUSDCol = custo.moeda === 'USD' ? formatarMoeda(custo.valor, 'USD') : '-';
        const centro = (custo.centroCusto && custo.centroCusto.trim()) ? custo.centroCusto : 'Centro não definido';
        linhas += `
            <tr class="border-b">
                <td class="px-3 py-2 font-medium">${custo.nome}</td>
                <td class="px-3 py-2"><span class="badge-deprecia text-xs px-2 py-1 rounded">${centro}</span></td>
                <td class="px-3 py-2">${custo.moeda}</td>
                <td class="px-3 py-2 text-right font-semibold text-red-600">${formatarMoeda(valorConvertido, 'BRL')}</td>
                <td class="px-3 py-2 text-right text-gray-500">${valorUSDCol}</td>
                <td class="px-3 py-2 text-gray-600">${custo.notas ? custo.notas : ''}</td>
                <td class="px-3 py-2 text-right">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarCusto(${index})">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm ml-2" onclick="excluirCusto(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
    // Totais na última linha
    linhas += `
        <tr class="bg-gray-50 font-semibold">
            <td class="px-3 py-2">Totais</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2 text-right">${formatarMoeda(totalBRL, 'BRL')}</td>
            <td class="px-3 py-2 text-right">${formatarMoeda(totalUSD, 'USD')}</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
        </tr>
    `;
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left bg-gray-50 border-b">
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('custos','nome')">Nome${getSortIndicator('custos','nome')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('custos','centroCusto')">Centro de Custo${getSortIndicator('custos','centroCusto')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('custos','moeda')">Moeda${getSortIndicator('custos','moeda')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('custos','valorBRL')">Valor (BRL)${getSortIndicator('custos','valorBRL')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('custos','valorUSD')">Valor (USD)${getSortIndicator('custos','valorUSD')}</th>
                        <th class="px-3 py-2">Notas</th>
                        <th class="px-3 py-2 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    `;
    // Total agora consta na última linha da tabela
}

// Investimentos
function atualizarInvestimentos() {
    const container = document.getElementById('listaInvestimentos');
    
    if (estado.investimentos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum investimento cadastrado</p>';
        return;
    }
    
    let linhas = '';
    const threshold = getInvestListFlag();
    const dados = sortDados('investimentos', estado.investimentos);
    let somaSaldosBRL = 0;
    let somaSaldosUSD = 0;
    let somaRendimentos = 0;
    let somaPercentuais = 0;
    dados.forEach((investimento, index) => {
        const saldoBRL = investimento.moeda === 'BRL' ? investimento.saldo : investimento.saldo * estado.cotacaoDolar;
        const saldoUSD = investimento.moeda === 'USD' ? investimento.saldo : investimento.saldo / estado.cotacaoDolar;
        const rendimentoValor = saldoBRL * (investimento.rendimentoPercentual / 100);
        somaSaldosBRL += saldoBRL;
        somaSaldosUSD += saldoUSD;
        somaRendimentos += rendimentoValor;
        somaPercentuais += investimento.rendimentoPercentual;
        const pct = parseFloat(investimento.rendimentoPercentual || 0) || 0;
        const rowClass = (pct === 0) ? 'bg-red-50' : (pct < threshold ? 'bg-orange-50' : '');
        linhas += `
            <tr class="border-b ${rowClass}">
                <td class="px-3 py-2 font-medium">${investimento.instituicao}</td>
                <td class="px-3 py-2"><span class="badge-${investimento.liquidez} text-xs px-2 py-1 rounded">${investimento.liquidez}</span></td>
                <td class="px-3 py-2 text-right text-green-600 font-semibold">${formatarMoeda(saldoBRL, 'BRL')}</td>
                <td class="px-3 py-2 text-right text-gray-600">${formatarMoeda(saldoUSD, 'USD')}</td>
                <td class="px-3 py-2">${pct.toFixed(2)}%</td>
                <td class="px-3 py-2 text-right text-purple-600 font-semibold">${formatarMoeda(rendimentoValor, 'BRL')}</td>
                <td class="px-3 py-2 text-right">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarInvestimento(${index})">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm ml-2" onclick="excluirInvestimento(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
    const mediaRendimentos = dados.length > 0 ? (somaPercentuais / dados.length) : 0;
    // Totais/Médias na última linha
    linhas += `
        <tr class="bg-gray-50 font-semibold">
            <td class="px-3 py-2">Totais/Médias</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2 text-right">${formatarMoeda(somaSaldosBRL, 'BRL')}</td>
            <td class="px-3 py-2 text-right">${formatarMoeda(somaSaldosUSD, 'USD')}</td>
            <td class="px-3 py-2">${mediaRendimentos.toFixed(2)}%</td>
            <td class="px-3 py-2 text-right">${formatarMoeda(somaRendimentos, 'BRL')}</td>
            <td class="px-3 py-2"></td>
        </tr>
    `;
    
    const toolbarHtml = `
        <div class="flex items-center justify-end p-2">
            <label class="text-sm text-gray-700 mr-2">Flag</label>
            <input id="inv_list_flag_threshold" type="number" step="0.01" min="0" class="w-20 border border-gray-300 rounded px-2 py-1" value="${getInvestListFlag()}" oninput="window.updateInvestFlag(this.value)">
            <span class="ml-1 text-sm text-gray-500">%</span>
        </div>
    `;
    container.innerHTML = `
        <div class="overflow-x-auto border rounded-md">
            ${toolbarHtml}
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left bg-gray-50 border-b">
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('investimentos','instituicao')">Instituição${getSortIndicator('investimentos','instituicao')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('investimentos','liquidez')">Liquidez${getSortIndicator('investimentos','liquidez')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('investimentos','saldoBRL')">Saldo (BRL)${getSortIndicator('investimentos','saldoBRL')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('investimentos','saldoUSD')">Saldo (USD)${getSortIndicator('investimentos','saldoUSD')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('investimentos','rendimentoPercentual')">Rendimento (%)${getSortIndicator('investimentos','rendimentoPercentual')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('investimentos','rendimentoValor')">Rendimento (R$)${getSortIndicator('investimentos','rendimentoValor')}</th>
                        <th class="px-3 py-2 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    `;
    // Totais/Médias agora constam na última linha da tabela
}

function atualizarTotaisInvestimentos() {
    let somaSaldosBRL = 0;
    let somaSaldosUSD = 0;
    let somaRendimentos = 0;
    let somaPercentuais = 0;
    
    estado.investimentos.forEach(investimento => {
        const saldoBRL = investimento.moeda === 'BRL' ? investimento.saldo : investimento.saldo * estado.cotacaoDolar;
        const saldoUSD = investimento.moeda === 'USD' ? investimento.saldo : investimento.saldo / estado.cotacaoDolar;
        const rendimentoValor = saldoBRL * (investimento.rendimentoPercentual / 100);
        
        somaSaldosBRL += saldoBRL;
        somaSaldosUSD += saldoUSD;
        somaRendimentos += rendimentoValor;
        somaPercentuais += investimento.rendimentoPercentual;
    });
    
    const mediaRendimentos = estado.investimentos.length > 0 ? somaPercentuais / estado.investimentos.length : 0;
    
    document.getElementById('somaSaldosBRL').textContent = formatarMoeda(somaSaldosBRL, 'BRL');
    document.getElementById('somaSaldosUSD').textContent = formatarMoeda(somaSaldosUSD, 'USD');
    document.getElementById('somaTotal').textContent = formatarMoeda(somaSaldosBRL, 'BRL');
    document.getElementById('somaRendimentos').textContent = formatarMoeda(somaRendimentos, 'BRL');
    document.getElementById('mediaRendimentos').textContent = `${mediaRendimentos.toFixed(2)}%`;
}

// Ativos e Passivos
function atualizarAtivosPassivos() {
    atualizarAtivos();
    atualizarPassivos();
}

function atualizarAtivos() {
    const container = document.getElementById('listaAtivos');
    
    if (estado.ativos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum ativo cadastrado</p>';
        return;
    }
    
    let total = 0;
    let linhas = '';
    const dados = sortDados('ativos', estado.ativos);
    let totalBRL = 0;
    
    dados.forEach((ativo, index) => {
        total += ativo.valor;
        totalBRL += ativo.valor;
        linhas += `
            <tr class="border-b">
                <td class="px-3 py-2 font-medium">${ativo.nome}</td>
                <td class="px-3 py-2"><span class="badge-${ativo.valorizacao} text-xs px-2 py-1 rounded">${ativo.valorizacao}</span></td>
                <td class="px-3 py-2 text-right text-green-600 font-semibold">${formatarMoeda(ativo.valor, 'BRL')}</td>
                <td class="px-3 py-2 text-gray-600">${ativo.notas ? ativo.notas : ''}</td>
                <td class="px-3 py-2 text-right">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarAtivo(${index})">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm ml-2" onclick="excluirAtivo(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
    // Totais na última linha
    linhas += `
        <tr class="bg-gray-50 font-semibold">
            <td class="px-3 py-2">Totais</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2 text-right">${formatarMoeda(totalBRL, 'BRL')}</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
        </tr>
    `;
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left bg-gray-50 border-b">
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('ativos','nome')">Nome${getSortIndicator('ativos','nome')}</th>
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('ativos','valorizacao')">Valorização${getSortIndicator('ativos','valorizacao')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('ativos','valorBRL')">Valor (BRL)${getSortIndicator('ativos','valorBRL')}</th>
                        <th class="px-3 py-2">Notas</th>
                        <th class="px-3 py-2 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    `;
    // Total agora consta na última linha da tabela
}

function atualizarPassivos() {
    const container = document.getElementById('listaPassivos');
    
    if (estado.passivos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum passivo cadastrado</p>';
        return;
    }
    
    let total = 0;
    let linhas = '';
    const dados = sortDados('passivos', estado.passivos);
    let totalBRL = 0;
    
    dados.forEach((passivo, index) => {
        total += passivo.valor;
        totalBRL += passivo.valor;
        const valorClass = passivo.valor < 0 ? 'text-green-600' : 'text-red-600';
        linhas += `
            <tr class="border-b">
                <td class="px-3 py-2 font-medium">${passivo.nome}</td>
                <td class="px-3 py-2 text-right ${valorClass} font-semibold">${formatarMoeda(passivo.valor, 'BRL')}</td>
                <td class="px-3 py-2 text-gray-600">${passivo.notas ? passivo.notas : ''}</td>
                <td class="px-3 py-2 text-right">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarPassivo(${index})">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm ml-2" onclick="excluirPassivo(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
    // Totais na última linha
    linhas += `
        <tr class="bg-gray-50 font-semibold">
            <td class="px-3 py-2">Totais</td>
            <td class="px-3 py-2 text-right">${formatarMoeda(totalBRL, 'BRL')}</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2"></td>
        </tr>
    `;
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left bg-gray-50 border-b">
                        <th class="px-3 py-2 cursor-pointer" onclick="ordenarTabela('passivos','nome')">Nome${getSortIndicator('passivos','nome')}</th>
                        <th class="px-3 py-2 text-right cursor-pointer" onclick="ordenarTabela('passivos','valorBRL')">Valor (BRL)${getSortIndicator('passivos','valorBRL')}</th>
                        <th class="px-3 py-2">Notas</th>
                        <th class="px-3 py-2 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    `;
    // Total agora consta na última linha da tabela
}

// Resumo Patrimonial
async function atualizarResumoPatrimonial() {
    try {
        const response = await fetch(`api/dashboard.php?mes_ano=${estado.mesAno}`);
        const data = await response.json();
        
        if (data.indicadores) {
            atualizarCardResumo(data.indicadores);
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        // Fallback: calcular indicadores localmente
        const indicadores = calcularIndicadoresLocal();
        atualizarCardResumo(indicadores);
    }
}

function calcularIndicadoresLocal() {
    const indicadores = {};
    
    // Rendas
    let rendaTotal = 0;
    let rendaAltaConfiabilidade = 0;
    let rendaBaixaConfiabilidade = 0;
    let rendaSalario = 0;
    
    estado.receitas.forEach(receita => {
        const valor = receita.moeda === 'USD' ? receita.valor * estado.cotacaoDolar : receita.valor;
        rendaTotal += valor;
        
        if (receita.confiabilidade === 'alta') {
            rendaAltaConfiabilidade += valor;
        } else {
            rendaBaixaConfiabilidade += valor;
        }
        
        if (receita.categoria === 'salário/emprego') {
            rendaSalario += valor;
        }
    });
    
    indicadores.renda_total = rendaTotal;
    indicadores.renda_alta_confiabilidade = rendaAltaConfiabilidade;
    indicadores.renda_baixa_confiabilidade = rendaBaixaConfiabilidade;
    indicadores.renda_independente = rendaTotal - rendaSalario;
    
    // Custos
    let custoTotal = 0;
    const custosPorCentro = {};
    
    estado.custos.forEach(custo => {
        const valor = custo.moeda === 'USD' ? custo.valor * estado.cotacaoDolar : custo.valor;
        custoTotal += valor;
        
        const centro = custo.centroCusto;
        if (!custosPorCentro[centro]) {
            custosPorCentro[centro] = 0;
        }
        custosPorCentro[centro] += valor;
    });
    
    indicadores.custo_total = custoTotal;
    indicadores.custos_por_centro = custosPorCentro;
    
    // Investimentos
    let rendimentoTotal = 0;
    estado.investimentos.forEach(investimento => {
        const saldoBRL = investimento.moeda === 'BRL' ? investimento.saldo : investimento.saldo * estado.cotacaoDolar;
        rendimentoTotal += saldoBRL * (investimento.rendimentoPercentual / 100);
    });
    
    indicadores.rendimento_total = rendimentoTotal;
    
    // Ativos e Passivos
    let ativoTotal = 0;
    let passivoTotal = 0;
    
    estado.ativos.forEach(ativo => {
        ativoTotal += ativo.valor;
    });
    
    estado.passivos.forEach(passivo => {
        passivoTotal += passivo.valor;
    });
    
    indicadores.ativo_total = ativoTotal;
    indicadores.passivo_total = passivoTotal;
    
    // Indicadores finais
    indicadores.renda_disponivel = rendaTotal - custoTotal;
    
    if (custoTotal > 0) {
        indicadores.fator_independencia = rendaTotal / custoTotal;
        indicadores.percentual_independencia = Math.min(100, (rendaTotal / custoTotal) * 100);
        indicadores.falta_independencia = Math.max(0, custoTotal - rendaTotal);
    } else {
        indicadores.fator_independencia = rendaTotal > 0 ? Number.MAX_SAFE_INTEGER : 0;
        indicadores.percentual_independencia = 100;
        indicadores.falta_independencia = 0;
    }
    
    return indicadores;
}

function atualizarCardResumo(indicadores) {
    // Rendas
    const rendaTotalEl = document.getElementById('rendaTotal');
    if (rendaTotalEl) rendaTotalEl.textContent = formatarMoeda(indicadores.renda_total, 'BRL');

    const insightsRendaTotalEl = document.getElementById('insightsRendaTotal');
    if (insightsRendaTotalEl) insightsRendaTotalEl.textContent = formatarMoeda(indicadores.renda_total, 'BRL');

    const rendaAltaEl = document.getElementById('rendaAltaConf');
    if (rendaAltaEl) rendaAltaEl.textContent = formatarMoeda(indicadores.renda_alta_confiabilidade, 'BRL');

    const rendaBaixaEl = document.getElementById('rendaBaixaConf');
    if (rendaBaixaEl) rendaBaixaEl.textContent = formatarMoeda(indicadores.renda_baixa_confiabilidade, 'BRL');

    const rendaIndEl = document.getElementById('rendaIndependente');
    if (rendaIndEl) rendaIndEl.textContent = formatarMoeda(indicadores.renda_independente, 'BRL');

    const rendaSemEmpregoEl = document.getElementById('rendaSemEmprego');
    if (rendaSemEmpregoEl) rendaSemEmpregoEl.textContent = formatarMoeda(indicadores.renda_independente, 'BRL');

    const rendaInvestEl = document.getElementById('rendaInvestimentos');
    if (rendaInvestEl) rendaInvestEl.textContent = formatarMoeda(indicadores.rendimento_total, 'BRL');

    // Custos
    const custosTotaisEl = document.getElementById('custosTotais');
    if (custosTotaisEl) custosTotaisEl.textContent = formatarMoeda(indicadores.custo_total, 'BRL');

    const insightsCustosTotaisEl = document.getElementById('insightsCustosTotais');
    if (insightsCustosTotaisEl) insightsCustosTotaisEl.textContent = formatarMoeda(indicadores.custo_total, 'BRL');

    // Breakdown de custos - Exibir apenas os 3 maiores centros de custo
    const breakdownEl = document.getElementById('breakdownCustos');
    if (breakdownEl) {
        // Ordenar centros de custo por valor decrescente e pegar os 3 maiores
        const custosOrdenados = Object.entries(indicadores.custos_por_centro || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        let custosHtml = '';
        for (const [centro, valor] of custosOrdenados) {
            custosHtml += `<div class="flex justify-between text-sm"><span>${centro}</span><span>${formatarMoeda(valor, 'BRL')}</span></div>`;
        }
        breakdownEl.innerHTML = custosHtml;
    }

    // Patrimônio
    const investimentoTotalEl = document.getElementById('investimentosTotal');
    const investimentoTotalValor = indicadores.investimento_total || calcularTotalInvestimentos();
    if (investimentoTotalEl) investimentoTotalEl.textContent = formatarMoeda(investimentoTotalValor, 'BRL');

    // Atualizar Ativos Total
    const ativosTotalEl = document.getElementById('ativosTotal');
    if (ativosTotalEl) ativosTotalEl.textContent = formatarMoeda(indicadores.ativo_total || 0, 'BRL');

    // Atualizar Passivos Total
    const passivosTotalEl = document.getElementById('passivosTotal');
    if (passivosTotalEl) passivosTotalEl.textContent = formatarMoeda(indicadores.passivo_total || 0, 'BRL');

    const patrimonioTotalEl = document.getElementById('patrimonioTotal');
    const patrimonioValor = (indicadores.ativo_total || 0) + investimentoTotalValor - (indicadores.passivo_total || 0);
    if (patrimonioTotalEl) patrimonioTotalEl.textContent = formatarMoeda(patrimonioValor, 'BRL');

    const rendaDispEl = document.getElementById('rendaDisponivel');
    if (rendaDispEl) rendaDispEl.textContent = formatarMoeda(indicadores.renda_disponivel, 'BRL');

    const insightsRendaDispEl = document.getElementById('insightsRendaDisponivel');
    if (insightsRendaDispEl) insightsRendaDispEl.textContent = formatarMoeda(indicadores.renda_disponivel, 'BRL');

    // Indicador de Independência (se existir no DOM)
    const indicadorElement = document.getElementById('indicadorIndependencia');
    const detalhesElement = document.getElementById('detalhesIndependencia');
    if (indicadorElement && detalhesElement) {
        const fatorIndependencia = indicadores.fator_independencia;
        const percentualIndependencia = indicadores.percentual_independencia;
        const faltaIndependencia = indicadores.falta_independencia;

        if (fatorIndependencia >= 1) {
            indicadorElement.innerHTML = `<span class="text-green-600 font-bold">✓ Financeiramente Independente</span>`;
            detalhesElement.innerHTML = `
                <div class="text-sm text-green-600">Fator: ${fatorIndependencia.toFixed(2)}</div>
                <div class="text-sm text-green-600">${percentualIndependencia.toFixed(1)}% da independência</div>
            `;
        } else {
            indicadorElement.innerHTML = `<span class="text-orange-600 font-bold">● Em busca da independência</span>`;
            detalhesElement.innerHTML = `
                <div class="text-sm text-orange-600">Fator: ${fatorIndependencia.toFixed(2)}</div>
                <div class="text-sm text-orange-600">${percentualIndependencia.toFixed(1)}% da independência</div>
                <div class="text-sm text-orange-600">Falta: ${formatarMoeda(faltaIndependencia, 'BRL')}</div>
            `;
        }
    }
}

function calcularTotalInvestimentos() {
    let total = 0;
    estado.investimentos.forEach(investimento => {
        const saldoBRL = investimento.moeda === 'BRL' ? investimento.saldo : investimento.saldo * estado.cotacaoDolar;
        total += saldoBRL;
    });
    return total;
}

// Função para formatar mês e ano (ex: '2025-10' -> 'Outubro 2025')
function formatarMesAno(mesAno) {
    const [ano, mes] = mesAno.split('-');
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
}

// Funções utilitárias
function formatarMoeda(valor, moeda = 'BRL') {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    
    const opcoes = {
        style: 'currency',
        currency: moeda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };
    
    try {
        return new Intl.NumberFormat('pt-BR', opcoes).format(valor);
    } catch (error) {
        // Fallback para formatação básica
        return moeda === 'USD' ? `$${valor.toFixed(2)}` : `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }
}

// Função para formatar valor monetário sem símbolo da moeda (para inputs)
function formatarValorInput(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    
    // Se for string, limpa e converte para número
    let numero;
    if (typeof valor === 'string') {
        // Remove tudo exceto dígitos, vírgula, ponto e hífen
        const valorLimpo = valor.replace(/[^\d,.-]/g, '');
        // Se tem vírgula, trata como decimal brasileiro
        if (valorLimpo.includes(',')) {
            numero = parseFloat(valorLimpo.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
        } else {
            numero = parseFloat(valorLimpo);
        }
    } else {
        numero = valor;
    }
    
    if (isNaN(numero)) return '';
    
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

// Função para converter valor formatado brasileiro para número
function parseValorBrasileiro(valorFormatado) {
    if (!valorFormatado) return 0;
    
    // Remove pontos de milhares e substitui vírgula por ponto
    const valorLimpo = valorFormatado.toString()
        .replace(/[^\d,.-]/g, '') // Remove tudo exceto dígitos, vírgula, ponto e hífen
        .replace(/\.(?=\d{3}(\D|$))/g, '') // Remove pontos de milhares (seguidos por 3 dígitos)
        .replace(',', '.'); // Substitui vírgula decimal por ponto
    
    return parseFloat(valorLimpo) || 0;
}

// Função para formatar percentual no formato brasileiro
function formatarPercentualInput(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    
    const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    if (isNaN(numero)) return '';
    
    return numero.toFixed(2).replace('.', ',');
}

// Função auxiliar para configurar máscara percentual em inputs
function configurarMascaraPercentual(input) {
    if (!input) return;
    
    // Remove event listeners anteriores para evitar duplicação
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Permite apenas números, vírgula, ponto e teclas de controle
    newInput.addEventListener('keydown', function(e) {
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];
        
        const isCtrlCmd = e.ctrlKey || e.metaKey;
        const isNumber = (e.key >= '0' && e.key <= '9');
        const isCommaOrDot = (e.key === ',' || e.key === '.');
        
        if (allowedKeys.includes(e.key) || isCtrlCmd || isNumber || isCommaOrDot) {
            return;
        }
        
        e.preventDefault();
    });
    
    // Formatar apenas no blur para não interferir na digitação
    newInput.addEventListener('blur', function(e) {
        if (e.target.value.trim() === '') return;
        
        const valor = parseFloat(e.target.value.replace(',', '.')) || 0;
        e.target.value = formatarPercentualInput(valor);
    });
    
    return newInput;
}

// Função auxiliar para configurar máscara monetária em inputs
function configurarMascaraMonetaria(input) {
    if (!input) return;
    
    // Remove event listeners anteriores para evitar duplicação
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Permite apenas números e teclas de controle
    newInput.addEventListener('keydown', function(e) {
        // Permite: backspace, delete, tab, escape, enter, setas
        if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
            (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1) ||
            // Permite: home, end
            (e.keyCode >= 35 && e.keyCode <= 36)) {
            return;
        }
        
        // Permite apenas números (0-9)
        const isNumber = (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
        
        if (!isNumber) {
            e.preventDefault();
        }
    });
    
    newInput.addEventListener('input', function(e) {
        let valor = e.target.value;
        
        // Remove tudo que não é número
        valor = valor.replace(/\D/g, '');
        
        // Se não há valor, limpa o campo
        if (!valor) {
            e.target.value = '';
            return;
        }
        
        // Converte para número e divide por 100 para ter centavos
        const numero = parseInt(valor) / 100;
        
        // Formata no padrão brasileiro
        const valorFormatado = numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        e.target.value = valorFormatado;
    });
    
    newInput.addEventListener('blur', function(e) {
        // Garante que sempre termine com ,00 se não tiver decimais
        let valor = e.target.value;
        if (valor && !valor.includes(',')) {
            valor += ',00';
            e.target.value = valor;
        }
    });
    
    // Retorna a nova referência do input
    return newInput;
}

// Função para formatar o mês em português
// Inicializa selects de mês/ano em português e sincroniza com estado.mesAno
function inicializarControlesMesAno() {
    const mesSelect = document.getElementById('mesSelect');
    const anoSelect = document.getElementById('anoSelect');
    const hiddenMesAno = document.getElementById('mesAno');

    if (!mesSelect || !anoSelect) return;

    const meses = [
        { valor: '01', nome: 'Janeiro' },
        { valor: '02', nome: 'Fevereiro' },
        { valor: '03', nome: 'Março' },
        { valor: '04', nome: 'Abril' },
        { valor: '05', nome: 'Maio' },
        { valor: '06', nome: 'Junho' },
        { valor: '07', nome: 'Julho' },
        { valor: '08', nome: 'Agosto' },
        { valor: '09', nome: 'Setembro' },
        { valor: '10', nome: 'Outubro' },
        { valor: '11', nome: 'Novembro' },
        { valor: '12', nome: 'Dezembro' }
    ];

    // Popular meses se estiver vazio
    if (mesSelect.options.length === 0) {
        meses.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.valor;
            opt.textContent = m.nome;
            mesSelect.appendChild(opt);
        });
    }

    // Popular anos dinamicamente em torno do ano selecionado (±10)
    const [anoInicial] = estado.mesAno.split('-');
    atualizarOpcoesAno(parseInt(anoInicial, 10));

    // Selecionar valor atual
    const [ano, mes] = estado.mesAno.split('-');
    mesSelect.value = mes;
    anoSelect.value = ano;

    const atualizarMesAno = () => {
        const novoMesAno = `${anoSelect.value}-${mesSelect.value}`;
        console.log(`🔍 DEBUG: atualizarMesAno() - Mudando de ${estado.mesAno} para ${novoMesAno}`);
        estado.mesAno = novoMesAno;
        if (hiddenMesAno) hiddenMesAno.value = novoMesAno;
        // Atualizar range de anos para manter ±10 em relação ao selecionado
        atualizarOpcoesAno(parseInt(anoSelect.value, 10));
        carregarDadosMes();
    };

    mesSelect.addEventListener('change', atualizarMesAno);
    anoSelect.addEventListener('change', atualizarMesAno);
}

// Atualiza dinamicamente as opções de ano mantendo ±10 em relação ao ano base
function atualizarOpcoesAno(baseAno) {
    const anoSelect = document.getElementById('anoSelect');
    if (!anoSelect) return;

    const valorSelecionado = baseAno.toString();
    // Reconstruir opções para cobrir baseAno-10 até baseAno+10
    anoSelect.innerHTML = '';
    for (let a = baseAno - 10; a <= baseAno + 10; a++) {
        const opt = document.createElement('option');
        opt.value = a.toString();
        opt.textContent = a.toString();
        anoSelect.appendChild(opt);
    }
    anoSelect.value = valorSelecionado;
}

// Gráficos
let graficoPatrimonio = null;
let graficoReceitas = null;
let graficoCustos = null;
let graficoAtivosPassivos = null;
let graficoEvolucaoFinanceira = null;

// Detecta dinamicamente o último mês com dados em qualquer categoria
async function obterMesBaseGlobal() {
    if (estado.mesBaseGlobal) return estado.mesBaseGlobal;

    const hoje = new Date();
    const endpoints = ['receitas', 'custos', 'investimentos', 'ativos', 'passivos'];

    // Procura do mês atual para trás até 24 meses
    for (let i = 0; i < 24; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        try {
            let temDados = false;
            for (const ep of endpoints) {
                const itens = await carregarDadosMesEspecifico(ep, mesAno);
                if (Array.isArray(itens) && itens.length > 0) {
                    temDados = true;
                    break;
                }
            }
            if (temDados) {
                estado.mesBaseGlobal = mesAno;
                return mesAno;
            }
        } catch (e) {
            console.warn('Falha ao verificar mês', mesAno, e);
        }
    }

    // Fallback: usa o mês selecionado na UI
    estado.mesBaseGlobal = estado.mesAno;
    return estado.mesAno;
}

// Encontra o último mês com dados para um ou mais endpoints (preferindo um mês específico se houver)
async function obterUltimoMesComDados(endpoints, preferMesAno = null) {
    const hoje = new Date();
    const eps = Array.isArray(endpoints) ? endpoints : [endpoints];

    // Preferência explícita
    if (preferMesAno) {
        for (const ep of eps) {
            const itens = await carregarDadosMesEspecifico(ep, preferMesAno);
            if (Array.isArray(itens) && itens.length > 0) {
                return preferMesAno;
            }
        }
    }

    // Busca do mês atual para trás (24 meses)
    for (let i = 0; i < 24; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        for (const ep of eps) {
            const itens = await carregarDadosMesEspecifico(ep, mesAno);
            if (Array.isArray(itens) && itens.length > 0) {
                return mesAno;
            }
        }
    }
    return estado.mesAno;
}

async function atualizarGrafico() {
    const canvas = document.getElementById('graficoEvolucao');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Gerar dados dos últimos 12 meses; apenas o mês com dados terá valor
    const labels = [];
    const serie = [];
    const [baseAnoStr, baseMesStr] = estado.mesAno.split('-');
    const base = new Date(parseInt(baseAnoStr, 10), parseInt(baseMesStr, 10) - 1, 1);
    const mesBase = estado.mesAno;
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        if (mesAno === mesBase) {
            const totalInvestimentos = (estado.investimentos || []).reduce((sum, inv) => {
                const saldo = parseFloat(inv.saldo ?? inv.valor) || 0;
                const valorConvertido = inv.moeda === 'USD' ? saldo * estado.cotacaoDolar : saldo;
                return sum + valorConvertido;
            }, 0);
            serie.push(totalInvestimentos);
        } else {
            serie.push(0);
        }
    }

    // Define escala dinâmica baseada no valor presente
    const valores = serie.filter(v => typeof v === 'number' && !isNaN(v));
    const maxValor = valores.length ? Math.max(...valores) : 0;
    const escalaMaxima = maxValor > 0 ? Math.ceil(maxValor / 100000) * 100000 : 800000;

    // Criar/atualizar gráfico
    if (!graficoPatrimonio) {
        graficoPatrimonio = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Patrimônio (R$)',
                    data: serie,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Patrimônio: ${formatarMoeda(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: escalaMaxima,
                        ticks: {
                            callback: function(value) { return formatarMoeda(value); },
                            stepSize: 50000,
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    } else {
        graficoPatrimonio.data.labels = labels;
        graficoPatrimonio.data.datasets[0].data = serie;
        graficoPatrimonio.options.scales.y.max = escalaMaxima;
        graficoPatrimonio.options.scales.y.ticks.stepSize = 50000;
        graficoPatrimonio.update();
    }
}

// Gráfico de Receitas
async function atualizarGraficoReceitas() {
    const canvas = document.getElementById('graficoReceitas');
    if (!canvas) {
        console.error('Canvas graficoReceitas não encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Contexto 2D não disponível');
        return;
    }
    
    // Destruir gráfico existente se houver
    if (graficoReceitas) {
        graficoReceitas.destroy();
        graficoReceitas = null;
    }
    
    // Gerar dados dos últimos 12 meses; apenas o mês com dados terá valor
    const labels = [];
    const dados = [];
    const [baseAnoStr, baseMesStr] = estado.mesAno.split('-');
    const base = new Date(parseInt(baseAnoStr, 10), parseInt(baseMesStr, 10) - 1, 1);
    // Usar o mês selecionado como base
    const mesBase = estado.mesAno;
    
    console.log('Gerando dados para gráfico de receitas...');
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        const labelMes = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        labels.push(labelMes);

        if (mesAno === mesBase) {
            const total = (estado.receitas || []).reduce((sum, r) => {
                const base = parseFloat(r.valor) || 0;
                const valorConvertido = r.moeda === 'USD' ? base * estado.cotacaoDolar : base;
                return sum + valorConvertido;
            }, 0);
            dados.push(total);
            console.log(`${mesAno}: R$ ${total.toFixed(2)} (${estado.receitas.length} receitas)`);
        } else {
            dados.push(0);
        }
    }
    
    console.log('Labels:', labels);
    console.log('Dados:', dados);
    
    // Garantir que temos dados válidos (null para meses sem dados)
    const dadosValidos = dados.map(d => (typeof d === 'number' && !isNaN(d)) ? d : null);
    
    // Calcular valor máximo para a escala
    const valores = dadosValidos.filter(v => typeof v === 'number' && !isNaN(v));
    const valorMaximo = valores.length ? Math.max(...valores) : 0;
    const escalaMaxima = valorMaximo > 0 ? Math.ceil(valorMaximo / 10000) * 10000 : 60000;
    
    console.log(`Valor máximo dos dados: R$ ${valorMaximo.toFixed(2)}`);
    console.log(`Escala máxima do gráfico: R$ ${escalaMaxima.toFixed(2)}`);
    
    // Criar novo gráfico
    graficoReceitas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receitas (R$)',
                data: dadosValidos,
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    max: escalaMaxima,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        },
                        stepSize: 10000, // Incrementos de R$ 10.000
                        maxTicksLimit: 8 // Máximo de 8 marcações no eixo Y
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            return 'Receitas: ' + formatarMoeda(context.parsed.y);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    console.log('Gráfico de receitas criado com sucesso:', graficoReceitas);
}

// Gráfico de Custos
async function atualizarGraficoCustos() {
    const canvas = document.getElementById('graficoCustos');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Destruir gráfico existente para garantir opções atualizadas
    if (graficoCustos) {
        graficoCustos.destroy();
        graficoCustos = null;
    }
    
    // Gerar dados dos últimos 12 meses; apenas o mês com dados terá valor
    const labels = [];
    const dados = [];
    const [baseAnoStr, baseMesStr] = estado.mesAno.split('-');
    const base = new Date(parseInt(baseAnoStr, 10), parseInt(baseMesStr, 10) - 1, 1);
    const mesBase = estado.mesAno;
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));

        if (mesAno === mesBase) {
            const total = (estado.custos || []).reduce((sum, c) => {
                const base = parseFloat(c.valor) || 0;
                const valorConvertido = c.moeda === 'USD' ? base * estado.cotacaoDolar : base;
                return sum + valorConvertido;
            }, 0);
            dados.push(total);
        } else {
            dados.push(0);
        }
    }
    
    const valores = dados.filter(v => typeof v === 'number' && !isNaN(v));
    const maxValor = valores.length ? Math.max(...valores) : 0;
    // Define escala dinâmica "agradável" com margem pequena e fatores 1/2/2.5/5/10
    function calcularEscalaY(valorMaximo) {
        if (!valorMaximo || valorMaximo <= 0) {
            return { max: 1000, step: 200 };
        }
        const factors = [1, 2, 2.5, 5, 10];
        const alvo = valorMaximo * 1.10; // margem de 10% para ficar "um pouco acima"
        const pow = Math.pow(10, Math.floor(Math.log10(alvo)));
        const unidades = alvo / pow;
        const fatorMax = factors.find(f => unidades <= f) || 10;
        const max = fatorMax * pow;

        // Objetivar ~5-6 ticks com step também "agradável"
        const desiredTicks = 5;
        const stepRaw = max / desiredTicks;
        const stepPow = Math.pow(10, Math.floor(Math.log10(stepRaw)));
        const stepUnits = stepRaw / stepPow;
        const fatorStep = factors.find(f => stepUnits <= f) || 10;
        const step = Math.max(50, fatorStep * stepPow);

        return { max, step };
    }
    const { max: escalaMaxima, step: escalaStep } = calcularEscalaY(maxValor);

    if (!graficoCustos) {
        graficoCustos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Custos (R$)',
                    data: dados,
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: escalaMaxima,
                        ticks: {
                            callback: function(value) { return formatarMoeda(value); },
                            stepSize: escalaStep,
                            maxTicksLimit: 6
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Custos: ' + formatarMoeda(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    } else {
        graficoCustos.data.labels = labels;
        graficoCustos.data.datasets[0].data = dados;
        graficoCustos.options.scales.y.max = escalaMaxima;
        graficoCustos.options.scales.y.ticks.stepSize = escalaStep;
        graficoCustos.update();
    }
}

// Gráfico de Ativos e Passivos
async function atualizarGraficoAtivosPassivos() {
    const canvas = document.getElementById('graficoAtivosPassivos');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Destruir gráfico existente para garantir opções atualizadas
    if (graficoAtivosPassivos) {
        graficoAtivosPassivos.destroy();
        graficoAtivosPassivos = null;
    }
    
    // Gerar dados dos últimos 12 meses; apenas o mês com dados terá valor
    const labels = [];
    const dadosAtivos = [];
    const dadosPassivos = [];
    const [baseAnoStr, baseMesStr] = estado.mesAno.split('-');
    const base = new Date(parseInt(baseAnoStr, 10), parseInt(baseMesStr, 10) - 1, 1);
    const mesBase = estado.mesAno;
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        if (mesAno === mesBase) {
            const totalAtivos = (estado.ativos || []).reduce((sum, a) => {
                const valorConvertido = a.moeda === 'USD' ? (parseFloat(a.valor) || 0) * estado.cotacaoDolar : (parseFloat(a.valor) || 0);
                return sum + valorConvertido;
            }, 0);
            const totalPassivos = (estado.passivos || []).reduce((sum, p) => {
                const valorConvertido = p.moeda === 'USD' ? (parseFloat(p.valor) || 0) * estado.cotacaoDolar : (parseFloat(p.valor) || 0);
                return sum + valorConvertido;
            }, 0);
            dadosAtivos.push(totalAtivos);
            dadosPassivos.push(totalPassivos);
        } else {
            dadosAtivos.push(0);
            dadosPassivos.push(0);
        }
    }
    
    const valores = [...dadosAtivos, ...dadosPassivos].filter(v => typeof v === 'number' && !isNaN(v));
    const maxValor = valores.length ? Math.max(...valores) : 0;
    const escalaMaxima = maxValor > 0 ? Math.ceil(maxValor / 50000) * 50000 : 500000;

    if (!graficoAtivosPassivos) {
        graficoAtivosPassivos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ativos (R$)',
                    data: dadosAtivos,
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }, {
                    label: 'Passivos (R$)',
                    data: dadosPassivos,
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: escalaMaxima,
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            },
                            stepSize: 50000,
                            maxTicksLimit: 10
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatarMoeda(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    } else {
        graficoAtivosPassivos.data.labels = labels;
        graficoAtivosPassivos.data.datasets[0].data = dadosAtivos;
        graficoAtivosPassivos.data.datasets[1].data = dadosPassivos;
        graficoAtivosPassivos.options.scales.y.max = escalaMaxima;
        graficoAtivosPassivos.update();
    }
}

// Função para atualizar apenas o gráfico da aba ativa
async function atualizarGraficoAtivo() {
    const tabAtiva = document.querySelector('.tab-button.active');
    if (!tabAtiva) return;
    
    const tabId = tabAtiva.getAttribute('onclick').match(/'([^']+)'/)[1];
    
    switch(tabId) {
        case 'receitas':
            await atualizarGraficoReceitas();
            break;
        case 'custos':
            await atualizarGraficoCustos();
            break;
        case 'investimentos':
            await atualizarGrafico(); // Gráfico patrimonial
            break;
        case 'ativos-passivos':
            await atualizarGraficoAtivosPassivos();
            break;
    }
}

// Utilitário de Modal
function abrirModal(conteudoHTML) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;
    
    overlay.classList.remove('hidden');
    
    // Adiciona botão X no canto superior direito
    const modalComBotaoFechar = `
        <div class="relative">
            <button type="button" onclick="fecharModal()" class="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-500 hover:bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold z-10 transition-colors">
                ×
            </button>
            ${conteudoHTML}
        </div>
    `;
    
    content.innerHTML = modalComBotaoFechar;
    
    // Remove event listeners anteriores para evitar acúmulo
    const newContent = content.cloneNode(true);
    content.parentNode.replaceChild(newContent, content);
    
    // Previne fechamento ao clicar no conteúdo do modal
    newContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Foca no primeiro input do modal se existir
    setTimeout(() => {
        const firstInput = newContent.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function fecharModal() {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;
    overlay.classList.add('hidden');
    content.innerHTML = '';
}

// Modal: Evolução Financeira
async function abrirModalEvolucaoFinanceira() {
    const baseMes = estado.mesAno; // usar o mês selecionado na UI
    console.log('🗓️ Base do histórico (Evolução Financeira):', baseMes);
    const mesesMax = 36;
    const historico = await carregarIndicadoresHistoricos(mesesMax, baseMes);

    const conteudo = `
        <div class="evo-modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h2 class="text-xl font-semibold">Evolução Financeira</h2>
            <button class="text-gray-500 hover:text-gray-700" onclick="fecharModal()">✖️</button>
        </div>
        <div class="evo-controls" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <label class="text-sm text-gray-700">Métrica:</label>
                <select id="metricSelect" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="renda_total">💰 Renda Total</option>
                    <option value="custo_total">💸 Custos Totais</option>
                    <option value="renda_disponivel">🟢 Renda Disponível</option>
                    <option value="investimento_total">📊 Investimentos Totais</option>
                    <option value="rendimento_total">📈 Renda de Investimentos</option>
                    <option value="renda_independente">🏖️ Renda Sem Emprego</option>
                </select>
            </div>
            <div class="period" style="display:flex;align-items:center;gap:8px;">
                <span class="text-sm text-gray-700">Período:</span>
                ${[3,6,12,24,36].map(n => `<button class="px-2 py-1 text-sm rounded border" onclick="setPeriodoEvolucaoFinanceira(${n})">${n}m</button>`).join('')}
            </div>
        </div>
        <div class="evo-grid" style="display:grid;grid-template-columns:1fr;gap:12px;">
            <div class="evo-chart" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px;height:320px;">
                <canvas id="graficoEvolucaoFinanceiraCanvas" style="width:100%;height:100%;"></canvas>
            </div>
            <div class="evo-table" style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px;max-height:320px;overflow:auto;">
                <h3 id="labelPeriodoTabela" class="text-sm font-semibold mb-2">Últimos 12 meses</h3>
                <div id="tabelaEvolucaoFinanceira" class="overflow-x-auto"></div>
            </div>
        </div>
        <style>
            @media (min-width: 768px) {
                .evo-grid { grid-template-columns: 1fr 1fr; }
            }
        </style>
    `;
    abrirModal(conteudo);

    // Limitar altura do modal e habilitar rolagem
    const contentEl = document.getElementById('modalContent');
    if (contentEl) {
        contentEl.style.maxHeight = '80vh';
        contentEl.style.overflow = 'auto';
        contentEl.style.width = '90vw';
        contentEl.style.maxWidth = '1200px';
    }

    // Renderizar gráfico e tabela
    window.__historicoIndicadores__ = historico; // cache no escopo global
    window.__periodoEvolucao__ = 12;
    window.__metricEvolucao__ = 'renda_total';

    inicializarGraficoEvolucaoFinanceira();
    atualizarGraficoEvolucaoFinanceira();
    const periodoInicial = window.__periodoEvolucao__ || 12;
    montarTabelaEvolucaoFinanceira(historico.slice(0, periodoInicial), periodoInicial);

    // Eventos
    const metricSelect = document.getElementById('metricSelect');
    if (metricSelect) {
        metricSelect.addEventListener('change', function() {
            window.__metricEvolucao__ = this.value;
            atualizarGraficoEvolucaoFinanceira();
        });
    }
}

function inicializarGraficoEvolucaoFinanceira() {
    const ctx = document.getElementById('graficoEvolucaoFinanceiraCanvas');
    if (!ctx) return;
    if (graficoEvolucaoFinanceira) {
        graficoEvolucaoFinanceira.destroy();
    }
    graficoEvolucaoFinanceira = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Evolução',
                data: [],
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                tension: 0.3,
                fill: true,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatarMoeda(ctx.parsed.y)
                    }
                }
            },
            scales: {
                x: { title: { display: false } },
                y: { title: { display: false }, beginAtZero: true }
            },
            animation: {
                duration: 600,
                easing: 'easeInOutQuart'
            }
        }
    });
}

window.setPeriodoEvolucaoFinanceira = function(n) {
    window.__periodoEvolucao__ = n;
    atualizarGraficoEvolucaoFinanceira();
    const historico = window.__historicoIndicadores__ || [];
    montarTabelaEvolucaoFinanceira(historico.slice(0, n), n);
};

function atualizarGraficoEvolucaoFinanceira() {
    const historico = window.__historicoIndicadores__ || [];
    const periodo = window.__periodoEvolucao__ || 12;
    const metric = window.__metricEvolucao__ || 'renda_total';

    const slice = historico.slice(0, periodo).reverse(); // mais antigos -> recentes
    if (slice.length && slice[slice.length - 1]) {
        console.log('📅 Último mês do período atual (deve ser o selecionado):', slice[slice.length - 1].mesAno);
    }
    const labels = slice.map(item => formatarMesAno(item.mesAno));
    const dados = slice.map(item => (item.indicadores?.[metric]) || 0);

    const nomeMetric = {
        renda_total: '💰 Renda Total',
        custo_total: '💸 Custos Totais',
        renda_disponivel: '🟢 Renda Disponível',
        investimento_total: '📊 Investimentos Totais',
        rendimento_total: '📈 Renda de Investimentos',
        renda_independente: '🏖️ Renda Sem Emprego'
    }[metric] || 'Evolução';

    if (graficoEvolucaoFinanceira) {
        graficoEvolucaoFinanceira.data.labels = labels;
        graficoEvolucaoFinanceira.data.datasets[0].data = dados;
        graficoEvolucaoFinanceira.data.datasets[0].label = nomeMetric;
        // Apenas custos em vermelho; demais permanecem azuis
        const isCusto = metric === 'custo_total';
        graficoEvolucaoFinanceira.data.datasets[0].borderColor = isCusto ? '#DC3545' : '#2563EB';
        graficoEvolucaoFinanceira.data.datasets[0].backgroundColor = isCusto ? 'rgba(220, 53, 69, 0.15)' : 'rgba(37, 99, 235, 0.15)';
        graficoEvolucaoFinanceira.update();
    }
}

function montarTabelaEvolucaoFinanceira(historicoPeriodo, periodo) {
    const container = document.getElementById('tabelaEvolucaoFinanceira');
    if (!container) return;
    // Ordenar do mais recente para o mais antigo
    const ordenado = [...historicoPeriodo].sort((a, b) => (a.mesAno < b.mesAno ? 1 : -1));
    const linhas = ordenado.map(item => {
        const ind = item.indicadores || {};
        const isAtual = item.mesAno === estado.mesAno;
        return `<tr>
            <td class="px-2 py-1 text-sm text-gray-600 ${isAtual ? 'font-semibold text-blue-700' : ''}">
                ${formatarMesAno(item.mesAno)} ${isAtual ? '<span class="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">Atual</span>' : ''}
            </td>
            <td class="px-2 py-1 text-right">${formatarMoeda(ind.renda_total || 0)}</td>
            <td class="px-2 py-1 text-right">${formatarMoeda(ind.custo_total || 0)}</td>
            <td class="px-2 py-1 text-right">${formatarMoeda(ind.renda_disponivel || 0)}</td>
            <td class="px-2 py-1 text-right">${formatarMoeda(ind.investimento_total || 0)}</td>
            <td class="px-2 py-1 text-right">${formatarMoeda(ind.rendimento_total || 0)}</td>
            <td class="px-2 py-1 text-right">${formatarMoeda(ind.renda_independente || 0)}</td>
        </tr>`;
    }).join('');
    const label = document.getElementById('labelPeriodoTabela');
    if (label) label.textContent = `Últimos ${periodo} meses (inclui mês atual)`;
    container.innerHTML = `
        <table class="min-w-full bg-white border" style="width:100%;border-collapse:collapse;">
            <thead style="position:sticky;top:0;background:#f9fafb;z-index:1;">
                <tr class="bg-gray-50 text-left text-sm">
                    <th class="px-2 py-1">Mês</th>
                    <th class="px-2 py-1">💰 Renda Total</th>
                    <th class="px-2 py-1">💸 Custos Totais</th>
                    <th class="px-2 py-1">🟢 Renda Disponível</th>
                    <th class="px-2 py-1">📊 Investimentos Totais</th>
                    <th class="px-2 py-1">📈 Renda de Investimentos</th>
                    <th class="px-2 py-1">🏖️ Renda Sem Emprego</th>
                </tr>
            </thead>
            <tbody>
                ${linhas}
            </tbody>
        </table>
    `;
}

async function carregarIndicadoresHistoricos(maxMeses = 12, baseMesAno = null) {
    // Construir data base no fuso local a partir de ano/mês, evitando parsing UTC
    const hoje = (() => {
        if (!baseMesAno) return new Date();
        const [anoStr, mesStr] = baseMesAno.split('-');
        const ano = parseInt(anoStr, 10);
        const mes = parseInt(mesStr, 10) - 1; // 0-based
        return new Date(ano, mes, 1);
    })();
    const historico = [];
    for (let i = 0; i < maxMeses; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        try {
            const resp = await fetch(`api/dashboard.php?mes_ano=${mesAno}`);
            const json = await resp.json();
            const ind = json && json.indicadores ? json.indicadores : {};
            // Normalizar para números (evita strings vindas do PHP/JSON)
            const normalizados = {
                renda_total: parseFloat(ind.renda_total) || 0,
                custo_total: parseFloat(ind.custo_total) || 0,
                renda_disponivel: parseFloat(ind.renda_disponivel) || 0,
                investimento_total: parseFloat(ind.investimento_total) || 0,
                rendimento_total: parseFloat(ind.rendimento_total) || 0,
                renda_independente: parseFloat(ind.renda_independente) || 0
            };
            historico.push({ mesAno, indicadores: normalizados });
            console.log('🔎 Evolução -', mesAno, normalizados);
        } catch (e) {
            console.warn('Falha ao obter indicadores de', mesAno, e);
            historico.push({ mesAno, indicadores: {} });
        }
    }
    return historico;
}

// Modais de criação
function abrirModalReceita() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Nova Receita</h3>
        <form id="formReceita" class="space-y-3">
            <div>
                <label class="form-label">Template (opcional)</label>
                <select id="rec_template" class="form-input">
                    <option value="">Selecione um template ou preencha manualmente</option>
                </select>
            </div>
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="rec_nome" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Categoria</label>
                <select id="rec_categoria" class="form-input"></select>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="text" id="rec_valor" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="rec_moeda" class="form-input">
                        <option>BRL</option>
                        <option>USD</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Confiabilidade</label>
                <select id="rec_conf" class="form-input">
                    <option>alta</option>
                    <option>baixa</option>
                </select>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="rec_notas" class="form-input"></textarea>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="rec_mes_referencia" class="form-input" value="${estado.mesAno}" required>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    // Popular categorias dinamicamente
    const selectCat = document.getElementById('rec_categoria');
    if (selectCat) {
        const categorias = getCategoriasReceita();
        selectCat.innerHTML = (categorias || ['salário/emprego','aluguel/locação','freelancer','outros'])
            .map(c => `<option>${c}</option>`).join('');
    }
    
    // Configurar máscara monetária para o campo valor
    const valorInput = document.getElementById('rec_valor');
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    // Carregar templates de receitas
    carregarTemplatesReceita();
    
    // Configurar evento de seleção de template
    const templateSelect = document.getElementById('rec_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                preencherFormularioComTemplate('receitas', this.value);
            }
        });
    }
    
    const form = document.getElementById('formReceita');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('rec_nome').value,
                categoria: document.getElementById('rec_categoria').value,
                valor: parseValorBrasileiro(document.getElementById('rec_valor').value || '0'),
                moeda: document.getElementById('rec_moeda').value,
                // Frequência fixa por enquanto
                frequencia: 'mensal',
                confiabilidade: document.getElementById('rec_conf').value,
                notas: document.getElementById('rec_notas').value || '',
                mes_ano: document.getElementById('rec_mes_referencia').value
            };
            try {
                await apiRequest('receitas', 'POST', payload);
            } catch (_) {
                estado.receitas.push(payload);
                salvarDadosLocais('receitas', estado.receitas);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

// Funções auxiliares para templates em modais
async function carregarTemplatesReceita() {
    try {
        const response = await fetch('api/templates.php?type=receitas');
        const templates = await response.json();
        
        const selectTemplate = document.getElementById('rec_template');
        if (selectTemplate) {
            selectTemplate.innerHTML = '<option value="">Selecione um template ou preencha manualmente</option>';
            if (response.ok && templates.length > 0) {
                templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.nome;
                    selectTemplate.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar templates de receitas:', error);
    }
}

async function preencherFormularioComTemplate(tipo, templateId) {
    try {
        const template = await carregarDadosTemplate(tipo, templateId);
        if (template) {
            // Preencher campos do formulário de receita
            if (tipo === 'receitas') {
                document.getElementById('rec_nome').value = template.nome || '';
                document.getElementById('rec_categoria').value = template.categoria || '';
                document.getElementById('rec_valor').value = formatarValorInput(template.valor || 0);
                document.getElementById('rec_moeda').value = template.moeda || 'BRL';
                document.getElementById('rec_conf').value = template.confiabilidade || 'alta';
                document.getElementById('rec_notas').value = template.notas || '';
            }
            // Preencher campos do formulário de custo
            else if (tipo === 'custos') {
                document.getElementById('cus_nome').value = template.nome || '';
                document.getElementById('cus_valor').value = formatarValorInput(template.valor || 0);
                document.getElementById('cus_moeda').value = template.moeda || 'BRL';
                document.getElementById('cus_centro').value = template.centro_custo || '';
                document.getElementById('cus_notas').value = template.notas || '';
            }
            // Preencher campos do formulário de investimento
            else if (tipo === 'investimentos') {
                document.getElementById('inv_inst').value = template.instituicao || '';
                // Preencher saldo a partir de "valor" do template, quando disponível
                const saldoEl = document.getElementById('inv_saldo');
                if (saldoEl) {
                    saldoEl.value = formatarValorInput(template.valor || 0);
                }
                document.getElementById('inv_moeda').value = template.moeda || 'BRL';
                // Suportar ambos os nomes: "rendimento" e "rendimento_percentual"
                const rendimentoBruto = (template.rendimento !== undefined && template.rendimento !== null)
                    ? template.rendimento
                    : template.rendimento_percentual;
                document.getElementById('inv_rend').value = formatarPercentualInput(rendimentoBruto || 0);
                document.getElementById('inv_liq').value = template.liquidez || 'líquido';
                document.getElementById('inv_notas').value = template.notas || '';
            }
            // Preencher campos do formulário de ativo
            else if (tipo === 'ativos') {
                document.getElementById('atv_nome').value = template.nome || '';
                document.getElementById('atv_valor').value = formatarValorInput(template.valor || 0);
                // Não há campo de avaliação/percentual no formulário de Ativos.
                // O select existente é 'atv_val' (aprecia/deprecia), que não mapeia
                // diretamente a um percentual de valorização do template.
                document.getElementById('atv_notas').value = template.notas || '';
            }
            // Preencher campos do formulário de passivo
            else if (tipo === 'passivos') {
                document.getElementById('psv_nome').value = template.nome || '';
                document.getElementById('psv_valor').value = formatarValorInput(template.valor || 0);
                document.getElementById('psv_notas').value = template.notas || '';
                const mesEl = document.getElementById('psv_mes_referencia');
                if (mesEl && template.mes_referencia) {
                    mesEl.value = template.mes_referencia;
                }
            }
        }
    } catch (error) {
        console.log('Erro ao carregar dados do template:', error);
    }
}

function abrirModalCusto() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Custo</h3>
        <form id="formCusto" class="space-y-3">
            <div>
                <label class="form-label">Template (opcional)</label>
                <select id="cus_template" class="form-input">
                    <option value="">Selecione um template ou preencha manualmente</option>
                </select>
            </div>
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="cus_nome" class="form-input" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="text" id="cus_valor" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="cus_moeda" class="form-input">
                        <option>BRL</option>
                        <option>USD</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Centro de Custo</label>
                <select id="cus_centro" class="form-input" required>
                </select>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="cus_notas" class="form-input"></textarea>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="cus_mes_referencia" class="form-input" value="${estado.mesAno}" required>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Popular centros de custo dinamicamente
    const selectCentro = document.getElementById('cus_centro');
    if (selectCentro) {
        const centros = getCentrosCusto();
        selectCentro.innerHTML = (centros || ['operacional','administrativo','vendas','marketing','outros'])
            .map(c => `<option>${c}</option>`).join('');
    }
    
    // Configurar máscara monetária para o campo valor
    const valorInput = document.getElementById('cus_valor');
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    // Carregar templates de custos
    carregarTemplatesCusto();
    
    // Configurar evento de seleção de template
    const templateSelect = document.getElementById('cus_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                preencherFormularioComTemplate('custos', this.value);
            }
        });
    }
    
    const form = document.getElementById('formCusto');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('cus_nome').value,
                valor: parseValorBrasileiro(document.getElementById('cus_valor').value || '0'),
                moeda: document.getElementById('cus_moeda').value,
                // Enviar ambos formatos para compatibilidade com diferentes endpoints
                centro_custo: document.getElementById('cus_centro').value,
                centroCusto: document.getElementById('cus_centro').value,
                notas: document.getElementById('cus_notas').value || '',
                mes_ano: document.getElementById('cus_mes_referencia').value
            };
            try {
                await apiRequest('custos', 'POST', payload);
            } catch (_) {
                estado.custos.push({
                    nome: payload.nome,
                    valor: payload.valor,
                    moeda: payload.moeda,
                    centroCusto: payload.centro_custo || payload.centroCusto,
                    notas: payload.notas
                });
                salvarDadosLocais('custos', estado.custos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

async function carregarTemplatesCusto() {
    try {
        const response = await fetch('api/templates.php?type=custos');
        const templates = await response.json();
        const selectTemplate = document.getElementById('cus_template');
        if (selectTemplate) {
            selectTemplate.innerHTML = '<option value="">Selecione um template ou preencha manualmente</option>';
            if (templates.length > 0) {
                templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.nome;
                    selectTemplate.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.log('Erro ao carregar templates de custos:', error);
    }
}

function abrirModalInvestimento() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Investimento</h3>
        <form id="formInv" class="space-y-3">
            <div>
                <label class="form-label">Template</label>
                <select id="inv_template" class="form-input">
                    <option value="">Selecione um template ou preencha manualmente</option>
                </select>
            </div>
            <div>
                <label class="form-label">Instituição</label>
                <input type="text" id="inv_inst" class="form-input" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Saldo</label>
                    <input type="text" id="inv_saldo" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="inv_moeda" class="form-input">
                        <option>BRL</option>
                        <option>USD</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Rendimento (%)</label>
                    <input type="text" id="inv_rend" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Liquidez</label>
                    <select id="inv_liq" class="form-input">
                        <option value="líquido">líquido</option>
                        <option value="conversível">conversível</option>
                        <option value="ilíquido">ilíquido</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="inv_notas" class="form-input"></textarea>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="inv_mes_referencia" class="form-input" value="${estado.mesAno}" required>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Adicionar event listeners para formatação em tempo real
    const saldoInput = document.getElementById('inv_saldo');
    const rendimentoInput = document.getElementById('inv_rend');
    
    // Configura máscara monetária para o campo saldo
    configurarMascaraMonetaria(saldoInput);
    
    if (rendimentoInput) {
        configurarMascaraPercentual(rendimentoInput);
    }
    
    // Carregar templates de investimentos
    carregarTemplatesInvestimento();
    
    // Event listener para seleção de template
    const templateSelect = document.getElementById('inv_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                preencherFormularioComTemplate('investimentos', this.value);
            }
        });
    }
    
    const form = document.getElementById('formInv');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                instituicao: document.getElementById('inv_inst').value,
                saldo: parseValorBrasileiro(document.getElementById('inv_saldo').value),
                moeda: document.getElementById('inv_moeda').value,
                // Enviar ambos formatos para compatibilidade
                rendimento_percentual: parseFloat(document.getElementById('inv_rend').value.replace(',', '.')) || 0,
                rendimentoPercentual: parseFloat(document.getElementById('inv_rend').value.replace(',', '.')) || 0,
                liquidez: document.getElementById('inv_liq').value,
                notas: document.getElementById('inv_notas').value || '',
                mes_ano: document.getElementById('inv_mes_referencia').value
            };
            try {
                await apiRequest('investimentos', 'POST', payload);
            } catch (_) {
                estado.investimentos.push({
                    instituicao: payload.instituicao,
                    saldo: payload.saldo,
                    moeda: payload.moeda,
                    rendimentoPercentual: payload.rendimento_percentual || payload.rendimentoPercentual,
                    liquidez: payload.liquidez,
                    notas: payload.notas
                });
                salvarDadosLocais('investimentos', estado.investimentos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

// ===== Gestão de Categorias de Receita =====}

async function carregarTemplatesInvestimento() {
    try {
        const response = await fetch('api/templates.php?type=investimentos');
        const templates = await response.json();
        
        const selectTemplate = document.getElementById('inv_template');
        if (selectTemplate) {
            // Limpar opções existentes
            selectTemplate.innerHTML = '<option value="">Selecione um template ou preencha manualmente</option>';
            
            if (templates.length > 0) {
                templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.instituicao;
                    selectTemplate.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.log('Erro ao carregar templates de investimentos:', error);
    }
}

const CATEGORIA_STORAGE_KEY = 'evoPatri_categorias_receita';
function getCategoriasReceita() {
    try {
        const raw = localStorage.getItem(CATEGORIA_STORAGE_KEY);
        let cats = raw ? JSON.parse(raw) : null;
        if (!cats || !Array.isArray(cats) || cats.length === 0) {
            const derivadas = Array.from(new Set((estado.receitas || []).map(r => r.categoria).filter(Boolean)));
            cats = derivadas.length ? derivadas : ['salário/emprego','aluguel/locação','freelancer','outros'];
            localStorage.setItem(CATEGORIA_STORAGE_KEY, JSON.stringify(cats));
        }
        return cats;
    } catch (_) {
        return ['salário/emprego','aluguel/locação','freelancer','outros'];
    }
}

function setCategoriasReceita(cats) {
    localStorage.setItem(CATEGORIA_STORAGE_KEY, JSON.stringify(cats));
}

async function renomearCategoriaReceita(antiga, nova) {
    const afetadas = (estado.receitas || []).filter(r => r.categoria === antiga);
    for (const r of afetadas) {
        const payload = {
            id: r.id,
            nome: r.nome,
            categoria: nova,
            valor: r.valor,
            frequencia: r.frequencia,
            moeda: r.moeda,
            confiabilidade: r.confiabilidade,
            notas: r.notas || '',
            mes_ano: estado.mesAno
        };
        try {
            await apiRequest('receitas', 'PUT', payload);
        } catch (_) {
            // Fallback local
            const lista = carregarDadosLocais('receitas');
            const idx = lista.findIndex(x => x.id === r.id || (x.nome === r.nome && x.valor === r.valor));
            if (idx >= 0) {
                lista[idx].categoria = nova;
                salvarDadosLocais('receitas', lista);
            }
        }
    }
    await carregarDadosMes();
}

async function apagarCategoriaReceita(categoria, destino) {
    if (destino && destino !== categoria) {
        await renomearCategoriaReceita(categoria, destino);
    }
    const cats = getCategoriasReceita().filter(c => c !== categoria);
    setCategoriasReceita(cats);
}

function abrirModalCategoriasReceita() {
    const categorias = getCategoriasReceita();
    abrirModal(`
        <div class="h-[70vh] overflow-y-auto">
            <h3 class="text-base font-semibold mb-3">Gerir Categorias de Receita</h3>
            <div id="listaCategorias" class="grid grid-cols-2 gap-2 mb-3">
                ${categorias.map(c => `
                <div class="flex items-center justify-between p-2 border rounded">
                    <span class="font-medium text-sm">${c}</span>
                    <div class="space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 text-sm" data-cat="${c}" onclick="handleEditarCategoria('${c}')">Editar</button>
                        <button class="text-red-600 hover:text-red-800 text-sm" data-cat="${c}" onclick="handleApagarCategoria('${c}')">Apagar</button>
                    </div>
                </div>`).join('')}
            </div>
            <form id="formAddCat" class="space-y-2">
                <div>
                    <label class="form-label">Nova categoria</label>
                    <input type="text" id="novaCategoria" class="form-input" placeholder="Ex.: salário/emprego" required>
                </div>
                <div class="sticky bottom-0 bg-white pt-2 mt-2 border-t flex justify-end gap-2">
                    <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Fechar</button>
                    <button type="submit" class="btn bg-blue-600 text-white">Adicionar</button>
                </div>
            </form>
            <div id="areaConfirmacao" class="mt-2 hidden"></div>
        </div>
    `);

    const formAdd = document.getElementById('formAddCat');
    if (formAdd) {
        formAdd.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('novaCategoria').value.trim();
            if (!nome) return;
            const cats = getCategoriasReceita();
            if (!cats.includes(nome)) {
                cats.push(nome);
                setCategoriasReceita(cats);
            }
            abrirModalCategoriasReceita(); // re-render
        });
    }
}

window.handleEditarCategoria = async function(cat) {
    const novo = prompt('Renomear categoria', cat);
    if (!novo || novo === cat) return;
    const cats = getCategoriasReceita().map(c => c === cat ? novo : c);
    setCategoriasReceita(cats);
    await renomearCategoriaReceita(cat, novo);
    abrirModalCategoriasReceita();
};

window.handleApagarCategoria = function(cat) {
    const afetadas = (estado.receitas || []).filter(r => r.categoria === cat);
    const area = document.getElementById('areaConfirmacao');
    if (!area) return;
    const outras = getCategoriasReceita().filter(c => c !== cat);
    area.classList.remove('hidden');
    area.innerHTML = `
        <div class="p-3 border rounded">
            <p class="mb-2">${afetadas.length} receitas usam a categoria "${cat}".</p>
            <label class="form-label">Escolha para qual categoria mudar:</label>
            <select id="destinoCat" class="form-input mb-2">
                ${outras.map(o => `<option>${o}</option>`).join('')}
            </select>
            <div class="flex justify-end gap-2">
                <button class="btn bg-gray-200" onclick="document.getElementById('areaConfirmacao').classList.add('hidden')">Cancelar</button>
                <button class="btn bg-red-600 text-white" onclick="confirmarApagarCategoria('${cat}')">Confirmar</button>
            </div>
        </div>
    `;
};

window.confirmarApagarCategoria = async function(cat) {
    const destino = document.getElementById('destinoCat')?.value;
    await apagarCategoriaReceita(cat, destino);
    abrirModalCategoriasReceita();
};

// ===== Gestão de Centros de Custo =====
const CENTRO_CUSTO_STORAGE_KEY = 'evoPatri_centros_custo';

function getCentrosCusto() {
    try {
        const stored = localStorage.getItem(CENTRO_CUSTO_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : ['operacional','administrativo','vendas','marketing','outros'];
        }
    } catch (e) {
        console.warn('Erro ao carregar centros de custo:', e);
    }
    return ['operacional','administrativo','vendas','marketing','outros'];
}

function setCentrosCusto(centros) {
    localStorage.setItem(CENTRO_CUSTO_STORAGE_KEY, JSON.stringify(centros));
}

// Função para normalizar centros de custo e remover duplicatas case-insensitive
function normalizarCentrosCusto() {
    const centros = getCentrosCusto();
    const centrosNormalizados = [];
    const centrosLowerCase = new Set();
    
    // Manter apenas o primeiro centro de cada grupo case-insensitive
    centros.forEach(centro => {
        const centroLower = centro.toLowerCase();
        if (!centrosLowerCase.has(centroLower)) {
            centrosLowerCase.add(centroLower);
            centrosNormalizados.push(centro);
        }
    });
    
    // Se houve mudanças, atualizar o localStorage
    if (centrosNormalizados.length !== centros.length) {
        setCentrosCusto(centrosNormalizados);
        console.log(`Centros de custo normalizados: ${centros.length} → ${centrosNormalizados.length}`);
        return true; // Indica que houve mudanças
    }
    
    return false; // Não houve mudanças
}

async function renomearCentroCusto(antigo, novo) {
    // Atualizar custos existentes
    if (estado.custos && estado.custos.length > 0) {
        estado.custos.forEach(custo => {
            if (custo.centroCusto === antigo || custo.centro_custo === antigo) {
                custo.centroCusto = novo;
                custo.centro_custo = novo;
            }
        });
        salvarDadosLocais('custos', estado.custos);
        
        // Tentar atualizar no servidor também
        try {
            for (const custo of estado.custos) {
                if (custo.centroCusto === novo || custo.centro_custo === novo) {
                    const payload = {
                        nome: custo.nome,
                        valor: custo.valor,
                        moeda: custo.moeda,
                        centro_custo: novo,
                        notas: custo.notas || '',
                        mes_ano: custo.mes_ano || estado.mesAno
                    };
                    await apiRequest(`custos.php?id=${custo.id}`, 'PUT', payload);
                }
            }
        } catch (e) {
            console.warn('Erro ao atualizar custos no servidor:', e);
        }
    }
    
    // Atualizar lista de centros
    const centros = getCentrosCusto();
    const index = centros.indexOf(antigo);
    if (index !== -1) {
        centros[index] = novo;
        setCentrosCusto(centros);
    }
}

async function apagarCentroCusto(centro, destino) {
    // Reatribuir custos existentes para o centro de destino
    if (estado.custos && estado.custos.length > 0) {
        estado.custos.forEach(custo => {
            if (custo.centroCusto === centro || custo.centro_custo === centro) {
                custo.centroCusto = destino;
                custo.centro_custo = destino;
            }
        });
        salvarDadosLocais('custos', estado.custos);

        // Persistir atualização no servidor
        try {
            for (const custo of estado.custos) {
                if (custo.centroCusto === destino || custo.centro_custo === destino) {
                    const payload = {
                        nome: custo.nome,
                        valor: custo.valor,
                        moeda: custo.moeda,
                        centro_custo: destino,
                        notas: custo.notas || '',
                        mes_ano: custo.mes_ano || estado.mesAno
                    };
                    await apiRequest(`custos.php?id=${custo.id}`, 'PUT', payload);
                }
            }
        } catch (e) {
            console.warn('Erro ao persistir migração de centro no servidor:', e);
        }
    }
}

function abrirModalCentrosCusto() {
    const centros = getCentrosCusto();
    abrirModal(`
        <div class="h-[70vh] overflow-y-auto">
            <h3 class="text-base font-semibold mb-3">Gerir Centros de Custo</h3>
            <div id="listaCentros" class="grid grid-cols-2 gap-2 mb-3">
                ${centros.map(centro => `
                <div class="flex items-center justify-between p-2 border rounded">
                    <span class="font-medium text-sm">${centro}</span>
                    <div class="space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="handleEditarCentro('${centro}')">Editar</button>
                        <button class="text-red-600 hover:text-red-800 text-sm" onclick="handleApagarCentro('${centro}')">Apagar</button>
                    </div>
                </div>`).join('')}
            </div>
            <form id="formAddCentro" class="space-y-2">
                <div>
                    <label class="form-label">Novo Centro de Custo</label>
                    <input type="text" id="novoCentro" class="form-input" placeholder="Ex.: administrativo, operação" required>
                </div>
                <div class="sticky bottom-0 bg-white pt-2 mt-2 border-t flex justify-end gap-2">
                    <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Fechar</button>
                    <button type="submit" class="btn bg-blue-600 text-white">Adicionar</button>
                </div>
            </form>
            <div id="areaConfirmacaoCentro" class="mt-2 hidden"></div>
        </div>
    `);

    const formAddCentro = document.getElementById('formAddCentro');
    if (formAddCentro) {
        formAddCentro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('novoCentro').value.trim();
            if (!nome) return;
            const lista = getCentrosCusto();
            // Verificação case-insensitive para evitar duplicatas
            const nomeExiste = lista.some(centro => centro.toLowerCase() === nome.toLowerCase());
            if (!nomeExiste) {
                lista.push(nome);
                setCentrosCusto(lista);
                abrirModalCentrosCusto();
            } else {
                alert('Este centro de custo já existe (não diferencia maiúsculas/minúsculas)!');
            }
        });
    }
}

window.adicionarCentro = function() {
    const input = document.getElementById('novoCentro');
    const nome = input.value.trim();
    if (nome) {
        const centros = getCentrosCusto();
        // Verificação case-insensitive para evitar duplicatas
        const nomeExiste = centros.some(centro => centro.toLowerCase() === nome.toLowerCase());
        if (!nomeExiste) {
            centros.push(nome);
            setCentrosCusto(centros);
            abrirModalCentrosCusto(); // Reabrir para atualizar a lista
        } else {
            alert('Este centro de custo já existe (não diferencia maiúsculas/minúsculas)!');
        }
    }
};

window.handleEditarCentro = async function(centro) {
    const novo = prompt('Novo nome para o centro de custo:', centro);
    if (novo && novo.trim() && novo !== centro) {
        await renomearCentroCusto(centro, novo.trim());
        await carregarDadosMes();
        abrirModalCentrosCusto();
    }
};

window.handleApagarCentro = function(centro) {
    const centros = getCentrosCusto();
    if (centros.length <= 1) {
        alert('Deve existir pelo menos um centro de custo!');
        return;
    }
    const afetados = (estado.custos || []).filter(c => (c.centroCusto || c.centro_custo) === centro);
    const area = document.getElementById('areaConfirmacaoCentro');
    if (!area) return;
    const outros = centros.filter(c => c !== centro);
    area.classList.remove('hidden');
    area.innerHTML = `
        <div class="p-3 border rounded">
            <p class="mb-2">${afetados.length} custos usam o centro "${centro}".</p>
            <label class="form-label">Escolha para qual centro mudar:</label>
            <select id="centroDestino" class="form-input mb-2">
                ${outros.map(o => `<option>${o}</option>`).join('')}
            </select>
            <div class="flex justify-end gap-2">
                <button class="btn bg-gray-200" onclick="document.getElementById('areaConfirmacaoCentro').classList.add('hidden')">Cancelar</button>
                <button class="btn bg-red-600 text-white" onclick="confirmarApagarCentro('${centro}')">Confirmar</button>
            </div>
        </div>
    `;
};

window.confirmarApagarCentro = async function(centro, destino = null) {
    const centros = getCentrosCusto();
    if (!destino) destino = document.getElementById('centroDestino')?.value || centros.filter(c => c !== centro)[0];
    await apagarCentroCusto(centro, destino);
    const novosCentros = centros.filter(c => c !== centro);
    setCentrosCusto(novosCentros);
    await carregarDadosMes();
    abrirModalCentrosCusto();
};

function abrirModalAtivo() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Ativo</h3>
        <form id="formAtivo" class="space-y-3">
            <div>
                <label class="form-label">Template</label>
                <select id="atv_template" class="form-input">
                    <option value="">Selecione um template ou preencha manualmente</option>
                </select>
            </div>
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="atv_nome" class="form-input" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="text" id="atv_valor" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Valorização</label>
                    <select id="atv_val" class="form-input">
                        <option value="aprecia">aprecia</option>
                        <option value="deprecia">deprecia</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="atv_notas" class="form-input"></textarea>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="atv_mes_referencia" class="form-input" value="${estado.mesAno}" required>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-green-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Adicionar event listeners para formatação em tempo real
    const valorInput = document.getElementById('atv_valor');
    
    // Configura máscara monetária para o campo valor
    if (valorInput) {
        configurarMascaraMonetaria(valorInput);
    }
    
    // Carregar templates de ativos
    carregarTemplatesAtivo();
    
    // Event listener para seleção de template
    const templateSelect = document.getElementById('atv_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                preencherFormularioComTemplate('ativos', this.value);
            }
        });
    }
    
    const form = document.getElementById('formAtivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('atv_nome').value,
                valor: parseValorBrasileiro(document.getElementById('atv_valor').value),
                valorizacao: document.getElementById('atv_val').value,
                notas: document.getElementById('atv_notas').value || '',
                mes_ano: document.getElementById('atv_mes_referencia').value
            };
            try {
                await apiRequest('ativos', 'POST', payload);
            } catch (_) {
                estado.ativos.push(payload);
                salvarDadosLocais('ativos', estado.ativos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}

async function carregarTemplatesAtivo() {
    try {
        const response = await fetch('api/templates.php?type=ativos');
        const templates = await response.json();
        
        const selectTemplate = document.getElementById('atv_template');
        if (selectTemplate) {
            // Limpar opções existentes
            selectTemplate.innerHTML = '<option value="">Selecione um template ou preencha manualmente</option>';
            
            if (templates.length > 0) {
                templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.nome;
                    selectTemplate.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.log('Erro ao carregar templates de ativos:', error);
    }
}

function abrirModalPassivo() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Passivo</h3>
        <form id="formPassivo" class="space-y-3">
            <div>
                <label class="form-label">Template (opcional)</label>
                <select id="psv_template" class="form-input">
                    <option value="">Selecione um template ou preencha manualmente</option>
                </select>
            </div>
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="psv_nome" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Valor</label>
                <input type="text" id="psv_valor" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="psv_notas" class="form-input"></textarea>
            </div>
            <div>
                <label class="form-label">Mês de Referência</label>
                <input type="month" id="psv_mes_referencia" class="form-input" value="${estado.mesAno}" required>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-red-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    
    // Carregar templates de passivos
    carregarTemplatesPassivo();
    
    // Event listener para seleção de template
    const templateSelect = document.getElementById('psv_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            if (this.value) {
                preencherFormularioComTemplate('passivos', this.value);
            }
        });
    }
    
    // Adicionar event listeners para formatação em tempo real
    const valorInput = document.getElementById('psv_valor');
    
    if (valorInput) {
        valorInput.addEventListener('input', function(e) {
            const valor = parseValorBrasileiro(e.target.value);
            e.target.value = formatarValorInput(valor);
        });
        
        valorInput.addEventListener('blur', function(e) {
            const valor = parseValorBrasileiro(e.target.value);
            e.target.value = formatarValorInput(valor);
        });
    }
    
    const form = document.getElementById('formPassivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('psv_nome').value,
                valor: parseValorBrasileiro(document.getElementById('psv_valor').value),
                notas: document.getElementById('psv_notas').value || '',
                mes_ano: document.getElementById('psv_mes_referencia').value
            };
            try {
                await apiRequest('passivos', 'POST', payload);
            } catch (_) {
                estado.passivos.push(payload);
                salvarDadosLocais('passivos', estado.passivos);
            }
            await carregarDadosMes();
            fecharModal();
        });
    }
}