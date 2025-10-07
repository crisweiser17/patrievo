// Evolução Patrimonial - JavaScript Application

// Estado global da aplicação
let estado = {
    mesAno: new Date().toISOString().slice(0, 7),
    cotacaoDolar: 5.0,
    receitas: [],
    custos: [],
    investimentos: [],
    ativos: [],
    passivos: []
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

async function inicializarApp() {
    // Configurar eventos
    configurarEventos();
    
    // Carregar cotação do dólar
    await carregarCotacaoDolar();
    
    // Carregar dados do mês atual
    await carregarDadosMes();
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
    
    // Controle de mês/ano
    const mesAnoElement = document.getElementById('mesAno');
    if (mesAnoElement) {
        mesAnoElement.addEventListener('change', function() {
            estado.mesAno = this.value;
            carregarDadosMes();
        });
    }
    
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
    
    // Fechar modal
    const modalOverlayElement = document.getElementById('modalOverlay');
    if (modalOverlayElement) {
        modalOverlayElement.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModal();
            }
        });
    }
}

function abrirTab(tabId) {
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
    
    tabButton.classList.add('active');
    tabButton.classList.remove('text-gray-500', 'border-transparent');
    tabButton.classList.add('text-blue-600', 'border-blue-600');
    
    tabContent.classList.add('active');
    tabContent.classList.remove('hidden');
    
    // Atualizar gráfico específico da aba
    setTimeout(() => {
        switch(tabId) {
            case 'receitas':
                atualizarGraficoReceitas();
                break;
            case 'custos':
                atualizarGraficoCustos();
                break;
            case 'investimentos':
                atualizarGrafico(); // Gráfico patrimonial
                break;
            case 'ativos-passivos':
                atualizarGraficoAtivosPassivos();
                break;
        }
    }, 100); // Pequeno delay para garantir que o canvas esteja visível
}

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
    document.getElementById('mesAno').value = estado.mesAno;
    carregarDadosMes();
}

// API - Simulação de backend
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `api/${endpoint}?mes_ano=${estado.mesAno}`;
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
        // Fallback para dados locais
        return carregarDadosLocais(endpoint);
    }
}

function carregarDadosLocais(endpoint) {
    const dadosLocais = localStorage.getItem(`evoPatri_${endpoint}_${estado.mesAno}`);
    return dadosLocais ? JSON.parse(dadosLocais) : [];
}

function salvarDadosLocais(endpoint, dados) {
    localStorage.setItem(`evoPatri_${endpoint}_${estado.mesAno}`, JSON.stringify(dados));
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
    // Receitas vêm já em nomes compatíveis; manter como está
    estado.receitas = await apiRequest('receitas');
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
    estado.passivos = await apiRequest('passivos');
    
    atualizarInterface();
    // Atualizar gráfico uma única vez após carregar todos os dados
    atualizarGrafico();
}

// Atualizar interface
function atualizarInterface() {
    atualizarReceitas();
    atualizarCustos();
    atualizarInvestimentos();
    atualizarAtivosPassivos();
    atualizarResumoPatrimonial();
}

// Receitas
function atualizarReceitas() {
    const container = document.getElementById('listaReceitas');
    const totalElement = document.getElementById('totalReceitas');
    
    if (estado.receitas.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma receita cadastrada</p>';
        totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    estado.receitas.forEach((receita, index) => {
        const valorConvertido = receita.moeda === 'USD' ? receita.valor * estado.cotacaoDolar : receita.valor;
        total += valorConvertido;
        
        html += `
            <div class="item-card fade-in">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${receita.nome}</h4>
                        <div class="text-sm text-gray-600">
                            ${receita.categoria} • ${receita.frequencia}
                            <span class="badge-${receita.confiabilidade === 'alta' ? 'alta' : 'baixa'} text-xs px-2 py-1 rounded ml-2">
                                ${receita.confiabilidade}
                            </span>
                        </div>
                        ${receita.notas ? `<p class="text-sm text-gray-500 mt-1">${receita.notas}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold">${formatarMoeda(valorConvertido, 'BRL')}</div>
                        <div class="text-sm text-gray-500">${receita.moeda}</div>
                        <div class="mt-2 space-x-2">
                            <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarReceita(${index})">Editar</button>
                            <button class="text-red-600 hover:text-red-800 text-sm" onclick="excluirReceita(${index})">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalElement.textContent = formatarMoeda(total, 'BRL');
}

// Custos
function atualizarCustos() {
    const container = document.getElementById('listaCustos');
    const totalElement = document.getElementById('totalCustos');
    
    if (estado.custos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum custo cadastrado</p>';
        totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    estado.custos.forEach((custo, index) => {
        const valorConvertido = custo.moeda === 'USD' ? custo.valor * estado.cotacaoDolar : custo.valor;
        total += valorConvertido;
        
        html += `
            <div class="item-card fade-in">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${custo.nome}</h4>
                        <div class="text-sm text-gray-600">
                            Centro de custo: ${custo.centroCusto}
                        </div>
                        ${custo.notas ? `<p class="text-sm text-gray-500 mt-1">${custo.notas}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-red-600">${formatarMoeda(valorConvertido, 'BRL')}</div>
                        <div class="text-sm text-gray-500">${custo.moeda}</div>
                        <div class="mt-2 space-x-2">
                            <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarCusto(${index})">Editar</button>
                            <button class="text-red-600 hover:text-red-800 text-sm" onclick="excluirCusto(${index})">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalElement.textContent = formatarMoeda(total, 'BRL');
}

// Investimentos
function atualizarInvestimentos() {
    const container = document.getElementById('listaInvestimentos');
    
    if (estado.investimentos.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">Nenhum investimento cadastrado</td></tr>';
        atualizarTotaisInvestimentos();
        return;
    }
    
    let html = '';
    estado.investimentos.forEach((investimento, index) => {
        const saldoBRL = investimento.moeda === 'BRL' ? investimento.saldo : investimento.saldo * estado.cotacaoDolar;
        const saldoUSD = investimento.moeda === 'USD' ? investimento.saldo : investimento.saldo / estado.cotacaoDolar;
        const rendimentoValor = saldoBRL * (investimento.rendimentoPercentual / 100);
        
        html += `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${investimento.instituicao}</td>
                <td class="px-4 py-3 text-right">${formatarMoeda(saldoBRL, 'BRL')}</td>
                <td class="px-4 py-3 text-right">${formatarMoeda(saldoUSD, 'USD')}</td>
                <td class="px-4 py-3 text-right">${investimento.rendimentoPercentual.toFixed(2)}%</td>
                <td class="px-4 py-3 text-right">${formatarMoeda(rendimentoValor, 'BRL')}</td>
                <td class="px-4 py-3">
                    <span class="badge-${investimento.liquidez} text-xs px-2 py-1 rounded">
                        ${investimento.liquidez}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarInvestimento(${index})">Editar</button>
                        <button class="text-red-600 hover:text-red-800 text-sm" onclick="excluirInvestimento(${index})">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
    atualizarTotaisInvestimentos();
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
    const totalElement = document.getElementById('totalAtivos');
    
    if (estado.ativos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum ativo cadastrado</p>';
        totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    estado.ativos.forEach((ativo, index) => {
        total += ativo.valor;
        
        html += `
            <div class="item-card fade-in">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${ativo.nome}</h4>
                        <div class="text-sm text-gray-600">
                            <span class="badge-${ativo.valorizacao} text-xs px-2 py-1 rounded">
                                ${ativo.valorizacao}
                            </span>
                        </div>
                        ${ativo.notas ? `<p class="text-sm text-gray-500 mt-1">${ativo.notas}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-green-600">${formatarMoeda(ativo.valor, 'BRL')}</div>
                        <div class="mt-2 space-x-2">
                            <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarAtivo(${index})">Editar</button>
                            <button class="text-red-600 hover:text-red-800 text-sm" onclick="excluirAtivo(${index})">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalElement.textContent = formatarMoeda(total, 'BRL');
}

function atualizarPassivos() {
    const container = document.getElementById('listaPassivos');
    const totalElement = document.getElementById('totalPassivos');
    
    if (estado.passivos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum passivo cadastrado</p>';
        totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    estado.passivos.forEach((passivo, index) => {
        total += passivo.valor;
        
        html += `
            <div class="item-card fade-in">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${passivo.nome}</h4>
                        ${passivo.notas ? `<p class="text-sm text-gray-500 mt-1">${passivo.notas}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold ${passivo.valor < 0 ? 'text-green-600' : 'text-red-600'}">${formatarMoeda(passivo.valor, 'BRL')}</div>
                        <div class="mt-2 space-x-2">
                            <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarPassivo(${index})">Editar</button>
                            <button class="text-red-600 hover:text-red-800 text-sm" onclick="excluirPassivo(${index})">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalElement.textContent = formatarMoeda(total, 'BRL');
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

    const rendaAltaEl = document.getElementById('rendaAltaConf');
    if (rendaAltaEl) rendaAltaEl.textContent = formatarMoeda(indicadores.renda_alta_confiabilidade, 'BRL');

    const rendaBaixaEl = document.getElementById('rendaBaixaConf');
    if (rendaBaixaEl) rendaBaixaEl.textContent = formatarMoeda(indicadores.renda_baixa_confiabilidade, 'BRL');

    const rendaIndEl = document.getElementById('rendaIndependente');
    if (rendaIndEl) rendaIndEl.textContent = formatarMoeda(indicadores.renda_independente, 'BRL');

    const rendaInvestEl = document.getElementById('rendaInvestimentos');
    if (rendaInvestEl) rendaInvestEl.textContent = formatarMoeda(indicadores.rendimento_total, 'BRL');

    // Custos
    const custosTotaisEl = document.getElementById('custosTotais');
    if (custosTotaisEl) custosTotaisEl.textContent = formatarMoeda(indicadores.custo_total, 'BRL');

    // Breakdown de custos
    const breakdownEl = document.getElementById('breakdownCustos');
    if (breakdownEl) {
        let custosHtml = '';
        for (const [centro, valor] of Object.entries(indicadores.custos_por_centro || {})) {
            custosHtml += `<div class="flex justify-between text-sm"><span>${centro}</span><span>${formatarMoeda(valor, 'BRL')}</span></div>`;
        }
        breakdownEl.innerHTML = custosHtml;
    }

    // Patrimônio
    const investimentoTotalEl = document.getElementById('investimentosTotal');
    const investimentoTotalValor = indicadores.investimento_total || calcularTotalInvestimentos();
    if (investimentoTotalEl) investimentoTotalEl.textContent = formatarMoeda(investimentoTotalValor, 'BRL');

    const patrimonioTotalEl = document.getElementById('patrimonioTotal');
    const patrimonioValor = (indicadores.ativo_total || 0) + investimentoTotalValor - (indicadores.passivo_total || 0);
    if (patrimonioTotalEl) patrimonioTotalEl.textContent = formatarMoeda(patrimonioValor, 'BRL');

    const rendaDispEl = document.getElementById('rendaDisponivel');
    if (rendaDispEl) rendaDispEl.textContent = formatarMoeda(indicadores.renda_disponivel, 'BRL');

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

// Gráficos
let graficoPatrimonio = null;
let graficoReceitas = null;
let graficoCustos = null;
let graficoAtivosPassivos = null;

function atualizarGrafico() {
    const canvas = document.getElementById('graficoEvolucao');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Calcular patrimônio atual
    const indicadores = calcularIndicadoresLocal();
    const patrimonioAtual = (indicadores.ativo_total || 0) + (calcularTotalInvestimentos() || 0) - (indicadores.passivo_total || 0);
    
    // Simular dados históricos (em uma implementação real, isso viria do banco de dados)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = meses.map((mes, index) => {
        // Simular crescimento patrimonial progressivo
        const base = patrimonioAtual * 0.7; // Começar com 70% do valor atual
        const crescimento = (patrimonioAtual - base) / meses.length;
        return {
            mes: mes,
            patrimonio: Math.round(base + (crescimento * index))
        };
    });
    
    const labels = dados.map(d => d.mes);
    const serie = dados.map(d => d.patrimonio);

    if (!graficoPatrimonio) {
        // Criar gráfico uma única vez
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
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Patrimônio: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });
    } else {
        // Atualizar dados e rótulos sem recriar o gráfico
        graficoPatrimonio.data.labels = labels;
        graficoPatrimonio.data.datasets[0].data = serie;
        graficoPatrimonio.update();
    }
}

// Gráfico de Receitas
function atualizarGraficoReceitas() {
    const canvas = document.getElementById('graficoReceitas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Gerar dados dos últimos 12 meses
    const labels = [];
    const dados = [];
    const hoje = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toISOString().slice(0, 7);
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        
        // Calcular total de receitas para este mês
        const receitasMes = carregarDadosLocais(`receitas/${mesAno}`) || [];
        const total = receitasMes.reduce((sum, r) => sum + (r.valor || 0), 0);
        dados.push(total);
    }
    
    if (!graficoReceitas) {
        graficoReceitas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Receitas (R$)',
                    data: dados,
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Receitas: ' + formatarMoeda(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    } else {
        graficoReceitas.data.labels = labels;
        graficoReceitas.data.datasets[0].data = dados;
        graficoReceitas.update();
    }
}

// Gráfico de Custos
function atualizarGraficoCustos() {
    const canvas = document.getElementById('graficoCustos');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Gerar dados dos últimos 12 meses
    const labels = [];
    const dados = [];
    const hoje = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toISOString().slice(0, 7);
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        
        // Calcular total de custos para este mês
        const custosMes = carregarDadosLocais(`custos/${mesAno}`) || [];
        const total = custosMes.reduce((sum, c) => sum + (c.valor || 0), 0);
        dados.push(total);
    }
    
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
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
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
        graficoCustos.update();
    }
}

// Gráfico de Ativos e Passivos
function atualizarGraficoAtivosPassivos() {
    const canvas = document.getElementById('graficoAtivosPassivos');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    // Gerar dados dos últimos 12 meses
    const labels = [];
    const dadosAtivos = [];
    const dadosPassivos = [];
    const hoje = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toISOString().slice(0, 7);
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        
        // Calcular totais para este mês
        const ativosMes = carregarDadosLocais(`ativos/${mesAno}`) || [];
        const passivosMes = carregarDadosLocais(`passivos/${mesAno}`) || [];
        
        const totalAtivos = ativosMes.reduce((sum, a) => sum + (a.valor || 0), 0);
        const totalPassivos = passivosMes.reduce((sum, p) => sum + (p.valor || 0), 0);
        
        dadosAtivos.push(totalAtivos);
        dadosPassivos.push(totalPassivos);
    }
    
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
                    borderWidth: 1
                }, {
                    label: 'Passivos (R$)',
                    data: dadosPassivos,
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
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
        graficoAtivosPassivos.update();
    }
}

// Função para atualizar apenas o gráfico da aba ativa
function atualizarGraficoAtivo() {
    const tabAtiva = document.querySelector('.tab-button.active');
    if (!tabAtiva) return;
    
    const tabId = tabAtiva.getAttribute('onclick').match(/'([^']+)'/)[1];
    
    switch(tabId) {
        case 'receitas':
            atualizarGraficoReceitas();
            break;
        case 'custos':
            atualizarGraficoCustos();
            break;
        case 'investimentos':
            atualizarGrafico(); // Gráfico patrimonial
            break;
        case 'ativos-passivos':
            atualizarGraficoAtivosPassivos();
            break;
    }
}

// Utilitário de Modal
function abrirModal(conteudoHTML) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;
    overlay.classList.remove('hidden');
    content.innerHTML = conteudoHTML;
}

function fecharModal() {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;
    overlay.classList.add('hidden');
    content.innerHTML = '';
}

// Modais de criação
function abrirModalReceita() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Nova Receita</h3>
        <form id="formReceita" class="space-y-3">
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
                    <input type="number" step="0.01" id="rec_valor" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Moeda</label>
                    <select id="rec_moeda" class="form-input">
                        <option>BRL</option>
                        <option>USD</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Frequência</label>
                    <select id="rec_freq" class="form-input">
                        <option>mensal</option>
                        <option>bimestral</option>
                        <option>trimestral</option>
                        <option>semestral</option>
                        <option>anual</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">Confiabilidade</label>
                    <select id="rec_conf" class="form-input">
                        <option>alta</option>
                        <option>baixa</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="rec_notas" class="form-input"></textarea>
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
    const form = document.getElementById('formReceita');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('rec_nome').value,
                categoria: document.getElementById('rec_categoria').value,
                valor: parseFloat(document.getElementById('rec_valor').value || '0'),
                frequencia: document.getElementById('rec_freq').value,
                moeda: document.getElementById('rec_moeda').value,
                confiabilidade: document.getElementById('rec_conf').value,
                notas: document.getElementById('rec_notas').value || '',
                mes_ano: estado.mesAno
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

function abrirModalCusto() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Custo</h3>
        <form id="formCusto" class="space-y-3">
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="cus_nome" class="form-input" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="number" step="0.01" id="cus_valor" class="form-input" required>
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
    
    const form = document.getElementById('formCusto');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('cus_nome').value,
                valor: parseFloat(document.getElementById('cus_valor').value || '0'),
                moeda: document.getElementById('cus_moeda').value,
                // Enviar ambos formatos para compatibilidade com diferentes endpoints
                centro_custo: document.getElementById('cus_centro').value,
                centroCusto: document.getElementById('cus_centro').value,
                notas: document.getElementById('cus_notas').value || '',
                mes_ano: estado.mesAno
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

function abrirModalInvestimento() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Investimento</h3>
        <form id="formInv" class="space-y-3">
            <div>
                <label class="form-label">Instituição</label>
                <input type="text" id="inv_inst" class="form-input" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Saldo</label>
                    <input type="number" step="0.01" id="inv_saldo" class="form-input" required>
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
                    <input type="number" step="0.01" id="inv_rend" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Liquidez</label>
                    <select id="inv_liq" class="form-input">
                        <option value="liquido">líquido</option>
                        <option value="conversivel">conversível</option>
                        <option value="iliquido">ilíquido</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="inv_notas" class="form-input"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    const form = document.getElementById('formInv');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                instituicao: document.getElementById('inv_inst').value,
                saldo: parseFloat(document.getElementById('inv_saldo').value || '0'),
                moeda: document.getElementById('inv_moeda').value,
                // Enviar ambos formatos para compatibilidade
                rendimento_percentual: parseFloat(document.getElementById('inv_rend').value || '0'),
                rendimentoPercentual: parseFloat(document.getElementById('inv_rend').value || '0'),
                liquidez: document.getElementById('inv_liq').value,
                notas: document.getElementById('inv_notas').value || '',
                mes_ano: estado.mesAno
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

// ===== Gestão de Categorias de Receita =====
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
        <h3 class="text-lg font-semibold mb-4">Gerir Categorias de Receita</h3>
        <div id="listaCategorias" class="space-y-2 mb-4">
            ${categorias.map(c => `
            <div class="flex items-center justify-between p-2 border rounded">
                <span class="font-medium">${c}</span>
                <div class="space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" data-cat="${c}" onclick="handleEditarCategoria('${c}')">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm" data-cat="${c}" onclick="handleApagarCategoria('${c}')">Apagar</button>
                </div>
            </div>`).join('')}
        </div>
        <form id="formAddCat" class="space-y-3">
            <div>
                <label class="form-label">Nova categoria</label>
                <input type="text" id="novaCategoria" class="form-input" placeholder="Ex.: salário/emprego" required>
            </div>
            <div class="flex justify-end gap-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Fechar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Adicionar</button>
            </div>
        </form>
        <div id="areaConfirmacao" class="mt-4 hidden"></div>
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
                    await apiRequest(`custos/${custo.id}`, 'PUT', custo);
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
    }
}

function abrirModalCentrosCusto() {
    const centros = getCentrosCusto();
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Gerir Centros de Custo</h3>
        <div class="space-y-4">
            <div>
                <label class="form-label">Novo Centro de Custo</label>
                <div class="flex gap-2">
                    <input type="text" id="novoCentro" class="form-input flex-1" placeholder="Nome do centro de custo">
                    <button type="button" class="btn bg-green-600 text-white" onclick="adicionarCentro()">Adicionar</button>
                </div>
            </div>
            <div>
                <label class="form-label">Centros Existentes</label>
                <div id="listaCentros" class="space-y-2 max-h-60 overflow-y-auto">
                    ${centros.map(centro => `
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>${centro}</span>
                            <div class="flex gap-1">
                                <button type="button" class="btn-sm bg-blue-500 text-white" onclick="handleEditarCentro('${centro}')">Editar</button>
                                <button type="button" class="btn-sm bg-red-500 text-white" onclick="handleApagarCentro('${centro}')">Apagar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Fechar</button>
            </div>
        </div>
    `);
}

window.adicionarCentro = function() {
    const input = document.getElementById('novoCentro');
    const nome = input.value.trim();
    if (nome) {
        const centros = getCentrosCusto();
        if (!centros.includes(nome)) {
            centros.push(nome);
            setCentrosCusto(centros);
            abrirModalCentrosCusto(); // Reabrir para atualizar a lista
        } else {
            alert('Este centro de custo já existe!');
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
    
    const outrosCentros = centros.filter(c => c !== centro);
    const select = `<select id="centroDestino">${outrosCentros.map(c => `<option value="${c}">${c}</option>`).join('')}</select>`;
    
    if (confirm(`Tem certeza que deseja apagar "${centro}"? Todos os custos deste centro serão transferidos para outro centro.`)) {
        const destino = outrosCentros[0]; // Usar o primeiro como padrão
        confirmarApagarCentro(centro, destino);
    }
};

window.confirmarApagarCentro = async function(centro, destino = null) {
    const centros = getCentrosCusto();
    if (!destino) destino = centros.filter(c => c !== centro)[0];
    
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
                <label class="form-label">Nome</label>
                <input type="text" id="atv_nome" class="form-input" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="form-label">Valor</label>
                    <input type="number" step="0.01" id="atv_valor" class="form-input" required>
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
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-green-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    const form = document.getElementById('formAtivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('atv_nome').value,
                valor: parseFloat(document.getElementById('atv_valor').value || '0'),
                valorizacao: document.getElementById('atv_val').value,
                notas: document.getElementById('atv_notas').value || '',
                mes_ano: estado.mesAno
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

function abrirModalPassivo() {
    abrirModal(`
        <h3 class="text-lg font-semibold mb-4">Novo Passivo</h3>
        <form id="formPassivo" class="space-y-3">
            <div>
                <label class="form-label">Nome</label>
                <input type="text" id="psv_nome" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Valor</label>
                <input type="number" step="0.01" id="psv_valor" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Notas</label>
                <textarea id="psv_notas" class="form-input"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="btn bg-red-600 text-white">Salvar</button>
            </div>
        </form>
    `);
    const form = document.getElementById('formPassivo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('psv_nome').value,
                valor: parseFloat(document.getElementById('psv_valor').value || '0'),
                notas: document.getElementById('psv_notas').value || '',
                mes_ano: estado.mesAno
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