/* Versão 4.0: contexto compartilhado e fluxos integrados. */
(() => {
    const KEY = `${APP_CONFIG.storagePrefix}workflowCurrent`;
    const HISTORY_KEY = `${APP_CONFIG.storagePrefix}workflowHistory`;
    const fields = ["Nome", "Processo", "Endereco", "Cnae", "Zoneamento", "Assunto", "Observacoes"];
    const el = suffix => document.getElementById(`workflow${suffix}`);
    const read = () => Object.fromEntries(fields.map(x => [x.toLowerCase(), el(x)?.value.trim() || ""]));
    const write = data => fields.forEach(x => { if (el(x)) el(x).value = data?.[x.toLowerCase()] || ""; });
    const save = (silent=false) => { const data={...read(),updatedAt:new Date().toISOString(),status:"andamento"}; setJson(KEY,data); render(); if(!silent) notify?.("Fluxo salvo.","success"); return data; };
    const steps = data => [
        ["Identificação", Boolean(data.nome || data.processo)],
        ["Dados do local", Boolean(data.endereco)],
        ["Análise", Boolean(data.cnae || data.zoneamento || data.observacoes)],
        ["Documento", false],
        ["Finalização", data.status === "finalizado"]
    ];
    function render(){
        const data=getJson(KEY,{}) || {};
        const host=el("Steps"); if(host) host.innerHTML=steps(data).map((x,i)=>`<li class="${x[1]?'done':''}"><span class="step-number">${x[1]?'✓':i+1}</span><span>${x[0]}</span></li>`).join("");
        const badge=el("StatusBadge"); if(badge) badge.textContent=data.status==="finalizado"?"Finalizado":"Em andamento";
        const history=getJson(HISTORY_KEY,[]) || []; const h=el("History");
        if(h) h.innerHTML=history.length?history.slice(0,10).map(x=>`<article><strong>${escapeHtml(x.nome||"Sem interessado")}</strong><span>${escapeHtml(x.processo||"Sem processo")} · ${new Date(x.finishedAt).toLocaleString("pt-BR")}</span></article>`).join(""):'<p class="empty-state">Nenhum fluxo arquivado.</p>';
    }
    function finish(){ const data=save(true); if(!data.nome && !data.processo){ notify?.("Informe ao menos o interessado ou o processo.","warning"); return; } data.status="finalizado"; data.finishedAt=new Date().toISOString(); const history=getJson(HISTORY_KEY,[])||[]; history.unshift(data); setJson(HISTORY_KEY,history.slice(0,100)); localStorage.removeItem(KEY); write({}); render(); notify?.("Fluxo finalizado e arquivado.","success"); }
    function clear(){ if(!confirm("Limpar o fluxo atual?")) return; localStorage.removeItem(KEY); write({}); render(); notify?.("Fluxo limpo.","success"); }
    function exportJson(){ const data=save(true); const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`fluxo-${(data.processo||"atendimento").replace(/[^a-z0-9-]/gi,"-")}.json`; a.click(); URL.revokeObjectURL(a.href); }
    function openTarget(target){ const data=save(true); activateTab(target); if(target==="arquivo"){ const n=document.getElementById("arquivoNome"), p=document.getElementById("arquivoProcesso"); if(n){n.value=data.nome;n.dispatchEvent(new Event("input",{bubbles:true}));} if(p){p.value=data.processo;p.dispatchEvent(new Event("input",{bubbles:true}));} }
        if(target==="central-documentos") setTimeout(()=>{ const map={nome:data.nome,processo:data.processo,endereco:data.endereco,cnae:data.cnae,zoneamento:data.zoneamento,assunto:data.assunto}; document.querySelectorAll("[data-document-variable]").forEach(input=>{ const k=input.dataset.documentVariable.toLowerCase(); if(map[k]){input.value=map[k];input.dispatchEvent(new Event("input",{bubbles:true}));} }); },0);
    }
    function init(){ if(!document.getElementById("fluxos")) return; write(getJson(KEY,{})); fields.forEach(x=>el(x)?.addEventListener("input",()=>save(true))); el("Save")?.addEventListener("click",()=>save()); el("Finish")?.addEventListener("click",finish); el("Clear")?.addEventListener("click",clear); el("Export")?.addEventListener("click",exportJson); document.querySelectorAll("[data-workflow-open]").forEach(b=>b.addEventListener("click",()=>openTarget(b.dataset.workflowOpen))); render(); }
    document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();