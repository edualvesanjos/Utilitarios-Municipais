/* Versão 3: serviço centralizado de persistência, histórico e migração. */
const StorageService = Object.freeze({
    prefix: APP_CONFIG.storagePrefix,
    key(name){ return `${this.prefix}${name}`; },
    has(name){ return localStorage.getItem(this.key(name)) !== null; },
    getText(name, fallback=""){
        const value=localStorage.getItem(this.key(name));
        return value===null ? fallback : value;
    },
    setText(name, value){ localStorage.setItem(this.key(name), String(value ?? "")); return value; },
    get(name, fallback=null){
        try { const value=localStorage.getItem(this.key(name)); return value===null ? fallback : JSON.parse(value); }
        catch(error){ console.warn(`StorageService: valor inválido em ${name}.`, error); return fallback; }
    },
    set(name, value){ localStorage.setItem(this.key(name), JSON.stringify(value)); return value; },
    remove(name){ localStorage.removeItem(this.key(name)); },
    update(name, fallback, updater){ const current=this.get(name,fallback); const next=updater(current); this.set(name,next); return next; },
    history(name){
        return {
            list:()=>{ const value=this.get(name,[]); return Array.isArray(value)?value:[]; },
            add:(entry,limit=100)=>this.update(name,[],items=>[entry,...(Array.isArray(items)?items:[])].slice(0,limit)),
            replace:(items)=>this.set(name,Array.isArray(items)?items:[]),
            clear:()=>this.remove(name)
        };
    },
    exportAll(){
        const data={application:APP_CONFIG.name,version:APP_CONFIG.version,schemaVersion:APP_CONFIG.schemaVersion,exportedAt:new Date().toISOString(),storage:{}};
        for(let index=0; index<localStorage.length; index+=1){ const key=localStorage.key(index); if(key?.startsWith(this.prefix)) data.storage[key]=localStorage.getItem(key); }
        return data;
    },
    importAll(data){
        if(!data || typeof data!=="object" || !data.storage) throw new Error("Backup inválido.");
        Object.entries(data.storage).forEach(([key,value])=>{ if(key.startsWith(this.prefix)) localStorage.setItem(key,String(value)); });
        this.setText("schemaVersion",APP_CONFIG.schemaVersion);
    },
    migrate(){
        const current=Number(this.getText("schemaVersion","2")) || 2;
        if(current < 3){
            // A V3 mantém o mesmo prefixo, portanto os dados da V2 são reaproveitados diretamente.
            this.setText("schemaVersion",APP_CONFIG.schemaVersion);
            this.set("migration:last",{from:current,to:3,at:new Date().toISOString()});
        }
    }
});
