/* Versão 3: registro central e declarativo de ferramentas. */
const TOOL_REGISTRY = Object.freeze([
    {id:"arquivo", name:"Nome de arquivo", shortName:"Arquivos", icon:"ARQ", category:"Documentos", order:10, description:"Monte nomes padronizados com blocos configuráveis.", keywords:["arquivo","nome","padronização","blocos","modelos","documento","processo"], module:"arquivo"},
    {id:"inscricao", name:"Inscrição imobiliária", shortName:"Inscrições", icon:"IM", category:"Cadastros", order:20, description:"Normalize inscrições urbanas e rurais automaticamente.", keywords:["inscrição","imobiliária","urbana","iptu","itr","rural","cadastro"], module:"inscricao"},
    {id:"lote", name:"Número de lote", shortName:"Lotes", icon:"LOT", category:"Cadastros", order:30, description:"Gere sequências de lotes com setor e quadra.", keywords:["lote","setor","quadra","sequência","parcelamento"], module:"lote"},
    {id:"uvrm", name:"Calculadora UVRM", shortName:"UVRM", icon:"UVR", category:"Cálculos", order:40, description:"Organize lançamentos em reais e UVRM em uma única operação.", keywords:["uvrm","reais","conversão","cálculo","multa","taxa","valor","dias","quantidade"], module:"uvrm"},
    {id:"percentual", name:"Percentual", shortName:"Percentual", icon:"%", category:"Cálculos", order:50, description:"Calcule percentuais, reajustes, descontos e variações.", keywords:["percentual","porcentagem","desconto","reajuste","variação","multa","acréscimo"], module:"percentual"},
    {id:"configuracoes", name:"Configurações", shortName:"Configurações", icon:"CFG", category:"Sistema", order:90, description:"Gerencie interface, backup, dados e estatísticas.", keywords:["configurações","backup","dados","estatísticas","exportar","importar","compacto","tema"], module:"configuracoes"},
    {id:"sobre", name:"Sobre", shortName:"Sobre", icon:"INF", category:"Sistema", order:100, description:"Consulte a versão, as novidades e o histórico do aplicativo.", keywords:["sobre","versão","novidades","changelog","histórico","aplicativo"], module:"sobre"}
]);

const TOOL_CATEGORIES = Object.freeze([
    {id:"todos", name:"Todas"},
    {id:"Documentos", name:"Documentos"},
    {id:"Cadastros", name:"Cadastros"},
    {id:"Cálculos", name:"Cálculos"},
    {id:"Sistema", name:"Sistema"}
]);

function getRegisteredTools(options={}) {
    const includeSystem = options.includeSystem !== false;
    return TOOL_REGISTRY.filter(tool => includeSystem || tool.category !== "Sistema").sort((a,b)=>a.order-b.order);
}
function getRegisteredTool(id){ return TOOL_REGISTRY.find(tool=>tool.id===id) || null; }
function getToolsByCategory(category){ return category && category!=="todos" ? getRegisteredTools().filter(tool=>tool.category===category) : getRegisteredTools(); }
