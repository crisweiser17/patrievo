// Evolução Patrimonial - JavaScript Application

// Estado global da aplicação
let estado = {
    mesAno: new Date().toISOString().slice(0, 7), // Formato YYYY-MM
    cotacaoDolar: 5.0,
    receitas: [],
    custos: [],
    investimentos: [],
    ativos: [],
    passivos: [],
    mesBaseGlobal: null
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
            const mesAno = data.toISOString().slice(0, 7);
            
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

// Funções para copiar dados do mês anterior
async function copiarReceitasMesAnterior() {
    const mesAnterior = calcularMesAnterior(estado.mesAno);
    try {
        const receitasAnterior = await apiRequestSemMesAno(`receitas?mesAno=${mesAnterior}`, 'GET');
        if (receitasAnterior.length === 0) {
            alert('Não há receitas no mês anterior para copiar.');
            return;
        }
        
        for (const receita of receitasAnterior) {
            const novaReceita = {
                ...receita,
                mes_ano: estado.mesAno
            };
            delete novaReceita.id;
            
            try {
                await apiRequest('receitas', 'POST', novaReceita);
            } catch (_) {
                novaReceita.id = Date.now();
                estado.receitas.push(novaReceita);
                salvarDadosLocais('receitas', estado.receitas);
            }
        }
        
        await carregarDadosMes();
        alert(`${receitasAnterior.length} receita(s) copiada(s) do mês anterior com sucesso!`);
    } catch (error) {
        console.error('Erro ao copiar receitas:', error);
        alert('Erro ao copiar receitas do mês anterior.');
    }
}

async function copiarCustosMesAnterior() {
    const mesAnterior = calcularMesAnterior(estado.mesAno);
    try {
        const custosAnterior = await apiRequestSemMesAno(`custos?mesAno=${mesAnterior}`, 'GET');
        if (custosAnterior.length === 0) {
            alert('Não há custos no mês anterior para copiar.');
            return;
        }
        
        for (const custo of custosAnterior) {
            const novoCusto = {
                ...custo,
                mes_ano: estado.mesAno
            };
            delete novoCusto.id;
            
            try {
                await apiRequest('custos', 'POST', novoCusto);
            } catch (_) {
                novoCusto.id = Date.now();
                estado.custos.push(novoCusto);
                salvarDadosLocais('custos', estado.custos);
            }
        }
        
        await carregarDadosMes();
        alert(`${custosAnterior.length} custo(s) copiado(s) do mês anterior com sucesso!`);
    } catch (error) {
        console.error('Erro ao copiar custos:', error);
        alert('Erro ao copiar custos do mês anterior.');
    }
}

async function copiarInvestimentosMesAnterior() {
    const mesAnterior = calcularMesAnterior(estado.mesAno);
    try {
        const investimentosAnterior = await apiRequestSemMesAno(`investimentos?mesAno=${mesAnterior}`, 'GET');
        if (investimentosAnterior.length === 0) {
            alert('Não há investimentos no mês anterior para copiar.');
            return;
        }
        
        for (const investimento of investimentosAnterior) {
            const novoInvestimento = {
                ...investimento,
                mes_ano: estado.mesAno
            };
            delete novoInvestimento.id;
            
            try {
                await apiRequest('investimentos', 'POST', novoInvestimento);
            } catch (_) {
                novoInvestimento.id = Date.now();
                estado.investimentos.push(novoInvestimento);
                salvarDadosLocais('investimentos', estado.investimentos);
            }
        }
        
        await carregarDadosMes();
        alert(`${investimentosAnterior.length} investimento(s) copiado(s) do mês anterior com sucesso!`);
    } catch (error) {
        console.error('Erro ao copiar investimentos:', error);
        alert('Erro ao copiar investimentos do mês anterior.');
    }
}

async function copiarAtivosMesAnterior() {
    const mesAnterior = calcularMesAnterior(estado.mesAno);
    try {
        const ativosAnterior = await apiRequestSemMesAno(`ativos?mesAno=${mesAnterior}`, 'GET');
        if (ativosAnterior.length === 0) {
            alert('Não há ativos no mês anterior para copiar.');
            return;
        }
        
        for (const ativo of ativosAnterior) {
            const novoAtivo = {
                ...ativo,
                mes_ano: estado.mesAno
            };
            delete novoAtivo.id;
            
            try {
                await apiRequest('ativos', 'POST', novoAtivo);
            } catch (_) {
                novoAtivo.id = Date.now();
                estado.ativos.push(novoAtivo);
                salvarDadosLocais('ativos', estado.ativos);
            }
        }
        
        await carregarDadosMes();
        alert(`${ativosAnterior.length} ativo(s) copiado(s) do mês anterior com sucesso!`);
    } catch (error) {
        console.error('Erro ao copiar ativos:', error);
        alert('Erro ao copiar ativos do mês anterior.');
    }
}

async function copiarPassivosMesAnterior() {
    const mesAnterior = calcularMesAnterior(estado.mesAno);
    try {
        const passivosAnterior = await apiRequestSemMesAno(`passivos?mesAno=${mesAnterior}`, 'GET');
        if (passivosAnterior.length === 0) {
            alert('Não há passivos no mês anterior para copiar.');
            return;
        }
        
        for (const passivo of passivosAnterior) {
            const novoPassivo = {
                ...passivo,
                mes_ano: estado.mesAno
            };
            delete novoPassivo.id;
            
            try {
                await apiRequest('passivos', 'POST', novoPassivo);
            } catch (_) {
                novoPassivo.id = Date.now();
                estado.passivos.push(novoPassivo);
                salvarDadosLocais('passivos', estado.passivos);
            }
        }
        
        await carregarDadosMes();
        alert(`${passivosAnterior.length} passivo(s) copiado(s) do mês anterior com sucesso!`);
    } catch (error) {
        console.error('Erro ao copiar passivos:', error);
        alert('Erro ao copiar passivos do mês anterior.');
    }
}

function calcularMesAnterior(mesAnoAtual) {
    const [ano, mes] = mesAnoAtual.split('-').map(Number);
    let mesAnterior = mes - 1;
    let anoAnterior = ano;
    
    if (mesAnterior === 0) {
        mesAnterior = 12;
        anoAnterior = ano - 1;
    }
    
    return `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}`;
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
    
    const form = document.getElementById('formEditarReceita');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('edit_rec_nome').value,
                categoria: document.getElementById('edit_rec_categoria').value,
                valor: parseFloat(document.getElementById('edit_rec_valor').value || '0'),
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
    
    const form = document.getElementById('formEditarCusto');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('edit_cus_nome').value,
                valor: parseFloat(document.getElementById('edit_cus_valor').value || '0'),
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
    
    if (saldoInput) {
        saldoInput.addEventListener('input', function(e) {
            const valor = parseValorBrasileiro(e.target.value);
            e.target.value = formatarValorInput(valor);
        });
        
        saldoInput.addEventListener('blur', function(e) {
            const valor = parseValorBrasileiro(e.target.value);
            e.target.value = formatarValorInput(valor);
        });
    }
    
    if (rendimentoInput) {
        rendimentoInput.addEventListener('input', function(e) {
            const valor = parseFloat(e.target.value.replace(',', '.')) || 0;
            e.target.value = formatarPercentualInput(valor);
        });
        
        rendimentoInput.addEventListener('blur', function(e) {
            const valor = parseFloat(e.target.value.replace(',', '.')) || 0;
            e.target.value = formatarPercentualInput(valor);
        });
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
            }
        }, 100); // Pequeno delay para garantir que o canvas esteja visível
    }
}

// Funções para gerenciar persistência de abas via hash
function carregarAbaDoHash() {
    const hash = window.location.hash.substring(1); // Remove o #
    const abasValidas = ['receitas', 'custos', 'investimentos', 'ativos-passivos'];
    
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
        // Anexar mes_ano apenas em requisições GET
        const url = method === 'GET'
            // Usar 'mesAno' para compatibilidade com o roteador index.php
            ? `api/${endpoint}?mesAno=${estado.mesAno}`
            : `api/${endpoint}`;
        
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
                        <div class="text-xs text-gray-500 mt-1">Mês de referência: ${formatarMesAno(receita.mes_ano || estado.mesAno)}</div>
                        ${receita.notas ? `<p class="text-sm text-gray-500 mt-1">${receita.notas}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold">${formatarMoeda(valorConvertido, 'BRL')}</div>
                        ${receita.moeda === 'USD' ? `<div class="text-xs text-gray-400">${formatarMoeda(receita.valor, 'USD')}</div>` : ''}
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
                        <div class="text-xs text-gray-500 mt-1">Mês de referência: ${formatarMesAno(custo.mes_ano || estado.mesAno)}</div>
                        ${custo.notas ? `<p class="text-sm text-gray-500 mt-1">${custo.notas}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="font-semibold text-red-600">${formatarMoeda(valorConvertido, 'BRL')}</div>
                        ${custo.moeda === 'USD' ? `<div class="text-xs text-gray-400">${formatarMoeda(custo.valor, 'USD')}</div>` : ''}
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
                <td class="px-4 py-3">
                    <div>${investimento.instituicao}</div>
                    <div class="text-xs text-gray-500 mt-1">Mês de referência: ${formatarMesAno(investimento.mes_ano || estado.mesAno)}</div>
                </td>
                <td class="px-4 py-3 text-right">
                    ${formatarMoeda(saldoBRL, 'BRL')}
                    ${investimento.moeda === 'USD' ? '<div class="text-xs text-gray-400">(convertido)</div>' : ''}
                </td>
                <td class="px-4 py-3 text-right">
                    ${formatarMoeda(saldoUSD, 'USD')}
                    ${investimento.moeda === 'USD' ? '<div class="text-xs text-gray-400">(original)</div>' : '<div class="text-xs text-gray-400">(convertido)</div>'}
                </td>
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
                        <div class="text-xs text-gray-500 mt-1">Mês de referência: ${formatarMesAno(ativo.mes_ano || estado.mesAno)}</div>
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
                        <div class="text-xs text-gray-500 mt-1">Mês de referência: ${formatarMesAno(passivo.mes_ano || estado.mesAno)}</div>
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
    
    const numero = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.')) : valor;
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
        .replace(/[^\d,-]/g, '') // Remove tudo exceto dígitos, vírgula e hífen
        .replace(/\.(?=\d{3})/g, '') // Remove pontos de milhares
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

// Detecta dinamicamente o último mês com dados em qualquer categoria
async function obterMesBaseGlobal() {
    if (estado.mesBaseGlobal) return estado.mesBaseGlobal;

    const hoje = new Date();
    const endpoints = ['receitas', 'custos', 'investimentos', 'ativos', 'passivos'];

    // Procura do mês atual para trás até 24 meses
    for (let i = 0; i < 24; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toISOString().slice(0, 7);
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
        const mesAno = data.toISOString().slice(0, 7);
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
    const escalaMaxima = 4000;

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
                            stepSize: 1000,
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
    const form = document.getElementById('formReceita');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('rec_nome').value,
                categoria: document.getElementById('rec_categoria').value,
                valor: parseFloat(document.getElementById('rec_valor').value || '0'),
                moeda: document.getElementById('rec_moeda').value,
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
    
    if (saldoInput) {
        saldoInput.addEventListener('input', function(e) {
            const valor = parseValorBrasileiro(e.target.value);
            e.target.value = formatarValorInput(valor);
        });
        
        saldoInput.addEventListener('blur', function(e) {
            const valor = parseValorBrasileiro(e.target.value);
            e.target.value = formatarValorInput(valor);
        });
    }
    
    if (rendimentoInput) {
        rendimentoInput.addEventListener('input', function(e) {
            const valor = parseFloat(e.target.value.replace(',', '.')) || 0;
            e.target.value = formatarPercentualInput(valor);
        });
        
        rendimentoInput.addEventListener('blur', function(e) {
            const valor = parseFloat(e.target.value.replace(',', '.')) || 0;
            e.target.value = formatarPercentualInput(valor);
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
        <div id="listaCentros" class="space-y-2 mb-4">
            ${centros.map(centro => `
            <div class="flex items-center justify-between p-2 border rounded">
                <span class="font-medium">${centro}</span>
                <div class="space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="handleEditarCentro('${centro}')">Editar</button>
                    <button class="text-red-600 hover:text-red-800 text-sm" onclick="handleApagarCentro('${centro}')">Apagar</button>
                </div>
            </div>`).join('')}
        </div>
        <form id="formAddCentro" class="space-y-3">
            <div>
                <label class="form-label">Novo Centro de Custo</label>
                <input type="text" id="novoCentro" class="form-input" placeholder="Ex.: administrativo, operação" required>
            </div>
            <div class="flex justify-end gap-2">
                <button type="button" class="btn bg-gray-200" onclick="fecharModal()">Fechar</button>
                <button type="submit" class="btn bg-blue-600 text-white">Adicionar</button>
            </div>
        </form>
        <div id="areaConfirmacaoCentro" class="mt-4 hidden"></div>
    `);

    const formAddCentro = document.getElementById('formAddCentro');
    if (formAddCentro) {
        formAddCentro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('novoCentro').value.trim();
            if (!nome) return;
            const lista = getCentrosCusto();
            if (!lista.includes(nome)) {
                lista.push(nome);
                setCentrosCusto(lista);
            }
            abrirModalCentrosCusto();
        });
    }
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
    const afetados = (estado.custos || []).filter(c => c.centro === centro);
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