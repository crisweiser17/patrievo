# PatriEvo - Sistema de Evolução Patrimonial

## 📊 Descrição
Sistema web completo para gestão e acompanhamento da evolução patrimonial pessoal, desenvolvido em PHP, JavaScript e MySQL.

## 🚀 Funcionalidades

### 📈 Gráficos Inteligentes
- **Evolução Patrimonial**: Gráfico de linha mostrando a evolução do patrimônio líquido (aba Investimentos)
- **Evolução de Receitas**: Gráfico de barras dos últimos 12 meses (aba Receitas)
- **Evolução de Custos**: Gráfico de barras dos últimos 12 meses (aba Custos)
- **Ativos e Passivos**: Gráfico de barras duplas comparando ativos vs passivos (aba Ativos e Passivos)

### 💰 Gestão Financeira
- **Receitas**: Cadastro e categorização de receitas
- **Custos**: Gestão de custos por centro de custo
- **Investimentos**: Controle de investimentos e rentabilidade
- **Ativos e Passivos**: Gestão completa do balanço patrimonial

### ⚙️ Funcionalidades Avançadas
- **Categorias de Receita**: Sistema de gerenciamento de categorias personalizáveis
- **Centros de Custo**: Organização de custos por departamentos/categorias
- **Interface Responsiva**: Design moderno e adaptável
- **Carregamento Inteligente**: Gráficos carregam apenas quando necessário

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Banco de Dados**: MySQL 5.7+
- **Gráficos**: Chart.js
- **Estilo**: CSS Grid, Flexbox, Design Responsivo

## 📁 Estrutura do Projeto

```
patrievo/
├── api/                    # Endpoints da API REST
│   ├── ativos.php         # Gestão de ativos
│   ├── custos.php         # Gestão de custos
│   ├── dashboard.php      # Dashboard principal
│   ├── investimentos.php  # Gestão de investimentos
│   ├── passivos.php       # Gestão de passivos
│   └── receitas.php       # Gestão de receitas
├── config/
│   └── database.php       # Configuração do banco
├── database/
│   ├── schema.sql         # Estrutura do banco
│   ├── setup.php          # Script de instalação
│   └── dump_*.sql         # Dumps com dados de exemplo
├── index.html             # Interface principal
├── script.js              # Lógica da aplicação
└── styles.css             # Estilos da aplicação
```

## 🚀 Como Executar

### Pré-requisitos
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Servidor web (Apache/Nginx) ou PHP built-in server

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/crisweiser17/patrievo.git
   cd patrievo
   ```

2. **Configure o banco de dados**
   - Crie um banco MySQL chamado `evo_patri`
   - Execute o script `database/schema.sql`
   - Ou use o setup automático: `php database/setup.php`

3. **Configure a conexão**
   - Edite `config/database.php` com suas credenciais

4. **Execute o servidor**
   ```bash
   php -S localhost:8080
   ```

5. **Acesse a aplicação**
   - Abra `http://localhost:8080` no navegador

## 📊 Dados de Exemplo

O projeto inclui dumps com dados de exemplo para demonstração:
- Receitas mensais variadas
- Custos organizados por centro de custo
- Investimentos com diferentes rentabilidades
- Ativos e passivos balanceados

## 🎨 Interface

- **Design Moderno**: Interface limpa e intuitiva
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Gráficos Interativos**: Visualizações dinâmicas com Chart.js
- **Navegação por Abas**: Organização clara das funcionalidades

## 🔧 API REST

Endpoints disponíveis:
- `GET/POST /api/receitas.php` - Gestão de receitas
- `GET/POST /api/custos.php` - Gestão de custos
- `GET/POST /api/investimentos.php` - Gestão de investimentos
- `GET/POST /api/ativos.php` - Gestão de ativos
- `GET/POST /api/passivos.php` - Gestão de passivos
- `GET /api/dashboard.php` - Dados do dashboard

## 📈 Funcionalidades dos Gráficos

### Evolução Patrimonial
- Cálculo automático do patrimônio líquido
- Histórico de 12 meses
- Formatação em moeda brasileira

### Gráficos de Receitas e Custos
- Agregação mensal automática
- Cores diferenciadas (verde para receitas, vermelho para custos)
- Tooltips informativos

### Gráfico de Ativos e Passivos
- Comparação lado a lado
- Cálculo de saldo líquido
- Visualização clara da situação patrimonial

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Cris Weiser** - [crisweiser17](https://github.com/crisweiser17)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!