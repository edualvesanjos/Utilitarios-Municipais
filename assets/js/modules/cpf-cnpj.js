/* Módulo CPF / CNPJ — v4.3.6 */
(function(){
const $=s=>document.querySelector(s), HISTORY_KEY=`${STORAGE_PREFIX}documentoFiscalHistory`, LIMIT=20;
const typeFields=[...document.querySelectorAll('input[name="documentoFiscalTipo"]')], input=$("#documentoFiscalEntrada"), autoCopy=$("#documentoFiscalAutoCopy"), noMask=$("#documentoFiscalSemMascara"),
detected=$("#documentoFiscalTipoDetectado"), status=$("#documentoFiscalStatus"), result=$("#documentoFiscalResultado"),
feedback=$("#documentoFiscalFeedback"), copyBtn=$("#copiarDocumentoFiscal"), clearBtn=$("#limparDocumentoFiscal"),
historyList=$("#documentoFiscalHistorico");
if(!typeFields.length||!input)return;
let current="", lastAuto="";
const digits=v=>String(v||"").replace(/\D/g,"");
function escapeDocumentHtml(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
const fmtCpf=v=>digits(v).slice(0,11).replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1-$2");
const fmtCnpj=v=>digits(v).slice(0,14).replace(/^(\d{2})(\d)/,"$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1/$2").replace(/(\d{4})(\d)/,"$1-$2");
const repeated=d=>/^(\d)\1+$/.test(d);
function validCpf(d){if(d.length!==11||repeated(d))return false;const calc=(b,f)=>{let s=0;for(let i=0;i<b.length;i++)s+=Number(b[i])*(f-i);let r=(s*10)%11;return r===10?0:r};return calc(d.slice(0,9),10)===Number(d[9])&&calc(d.slice(0,10),11)===Number(d[10])}
function validCnpj(d){if(d.length!==14||repeated(d))return false;const calc=(b,w)=>{const s=b.split("").reduce((a,n,i)=>a+Number(n)*w[i],0),r=s%11;return r<2?0:11-r};return calc(d.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2])===Number(d[12])&&calc(d.slice(0,13),[6,5,4,3,2,9,8,7,6,5,4,3,2])===Number(d[13])}
const selectedType=()=>typeFields.find(field=>field.checked)?.value||"auto";
const resolve=d=>selectedType()==="cpf"?"cpf":selectedType()==="cnpj"?"cnpj":d.length<=11?"cpf":"cnpj";
function msg(m="",t=""){feedback.textContent=m;feedback.className=`feedback-message${t?` ${t}`:""}`}
function historyTime(item){const raw=item?.occurred_at||item?.createdAt||item?.copiedAt||item?.timestamp||item?.savedAt||item?.finishedAt||item?.created_at||null;const time=raw?new Date(raw).getTime():0;return Number.isFinite(time)?time:0}
function stableHistoryId(item){return String(item?.id||item?.client_id||item?.normalized||"")}
function hist(){const v=getJson(HISTORY_KEY,[]),rows=Array.isArray(v)?v:[];return rows.map((item,index)=>({item,index})).sort((a,b)=>{const d=historyTime(b.item)-historyTime(a.item);if(d)return d;const id=stableHistoryId(a.item).localeCompare(stableHistoryId(b.item));return id||a.index-b.index}).map(x=>x.item)}
function render(){const h=hist();if(!h.length){historyList.innerHTML='<li class="empty-state">Nenhum documento normalizado recentemente.</li>';return}
historyList.innerHTML=h.map((x,index)=>`<li><span><strong>${escapeDocumentHtml(x.normalized)}</strong><small>${escapeDocumentHtml(x.type.toUpperCase())}</small></span><div class="history-item-actions"><button type="button" class="secondary mini-button" data-copy-document="${escapeDocumentHtml(x.normalized)}">Copiar</button><button type="button" class="danger-outline mini-button" data-delete-document-history="${index}">Excluir</button></div></li>`).join("");
historyList.querySelectorAll("[data-copy-document]").forEach(b=>b.addEventListener("click",()=>copyText(b.dataset.copyDocument)));
historyList.querySelectorAll("[data-delete-document-history]").forEach(button=>button.addEventListener("click",async()=>{
 const item=h[Number(button.dataset.deleteDocumentHistory)];
 if(!item)return;
 const ok=typeof confirmAction==="function"
  ?await confirmAction("Excluir este registro do histórico sincronizado? A exclusão será aplicada aos demais dispositivos após sincronizar.",{title:"Excluir registro",confirmText:"Excluir"})
  :confirm("Excluir este registro do histórico sincronizado?");
 if(!ok)return;
 const current=hist();
 const fingerprint=window.HistoryService?.fingerprintValue?.(item);
 const next=current.filter(entry=>{
  if(!fingerprint)return entry!==item;
  return window.HistoryService?.fingerprintValue?.(entry)!==fingerprint;
 });
 setJson(HISTORY_KEY,next.slice(0,LIMIT));
 window.HistoryService?.queueDeleteHistory?.("cpf-cnpj",item,{source:"cpf_cnpj_history"});
 render();
 window.renderProductivity33?.();
 showToast("Exclusão registrada para sincronização.");
}))}
function save(x){const h=hist().filter(e=>e.normalized!==x.normalized);h.unshift(x);setJson(HISTORY_KEY,h.slice(0,LIMIT));render();window.HistoryService?.notifyLocalChange?.();window.renderProductivity33?.()}
async function update(){const raw=digits(input.value), type=resolve(raw), max=type==="cpf"?11:14, d=raw.slice(0,max), formatted=type==="cpf"?fmtCpf(d):fmtCnpj(d);input.value=formatted;detected.textContent=type.toUpperCase();
const complete=d.length===max, valid=complete&&(type==="cpf"?validCpf(d):validCnpj(d));const output=noMask?.checked?d:formatted;
current=valid?output:"";result.textContent=output||"—";copyBtn.disabled=!valid;
if(!d.length){status.textContent="Aguardando";status.dataset.state="";msg();lastAuto="";return}
if(!complete){status.textContent="Incompleto";status.dataset.state="invalid";msg(`Informe ${max} dígitos para completar o ${type.toUpperCase()}.`,"warning");lastAuto="";return}
if(!valid){status.textContent="Inválido";status.dataset.state="invalid";msg(`${type.toUpperCase()} inválido. Verifique os dígitos informados.`,"error");lastAuto="";return}
status.textContent="Válido";status.dataset.state="valid";msg(`${type.toUpperCase()} válido e normalizado.`,"success");
save({id:typeof createUniqueId==="function"?createUniqueId():`${Date.now()}-${d}`,type,digits:d,normalized:formatted,createdAt:new Date().toISOString()});
if(autoCopy.checked&&output!==lastAuto){await copyText(output);lastAuto=output;showToast("Documento copiado automaticamente.")}}
function clearAll(){typeFields.forEach(field=>field.checked=field.value==="auto");input.value="";autoCopy.checked=false;if(noMask)noMask.checked=false;current="";lastAuto="";detected.textContent="—";status.textContent="Aguardando";status.dataset.state="";result.textContent="—";copyBtn.disabled=true;msg();input.focus()}
typeFields.forEach(field=>field.addEventListener("change",()=>{input.value=digits(input.value);lastAuto="";update()}));
input.addEventListener("input",update);input.addEventListener("paste",()=>setTimeout(update,0));
autoCopy.addEventListener("change",()=>{lastAuto="";if(autoCopy.checked)update()});
noMask?.addEventListener("change",()=>{lastAuto="";update()});
copyBtn.addEventListener("click",()=>{if(current)copyText(current)});
clearBtn.addEventListener("click",clearAll);
render();
window.renderDocumentoFiscalHistory=render;
})();
