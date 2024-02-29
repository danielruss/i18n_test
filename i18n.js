export class i18n{
    
    #currentMap=null;
    #defaultMap=null;
    #langMap=null;

    async load_messages(url){
        let msg_obj = await (await fetch(url)).json()
        this.#langMap = new Map()
        Object.entries(msg_obj).forEach( ([key, value]) => {
            console.log(`... working on language ${key}`)
            let currMap = new Map();
            currMap.set("_lang",key)
            Object.entries(value).forEach( ([key2,value2]) =>{
                currMap.set(key2,value2)
            })
            this.#langMap.set(key,currMap)
        });
        // set the default current map.
        // if it is not defined, use the browser defaultss...
        await this.set_locale(navigator.languages)
        // use the first in the json file...
        if (!this.#currentMap){
            this.#currentMap =  this.#langMap.values().next().value;
        }
        this.#defaultMap = this.#currentMap
        console.log(msg_obj)
        console.log(this.#langMap)
    }

    async set_locale(locales){
        // force the locales into an array
        if (!Array.isArray(locales)){
            locales = [ locales ]
        }
        
        // check the locale (warning: it may be something like "en-us" or "es-mx")
        console.log(locales)
        for( let locale of locales){
            if (this.#langMap.has(locale)){
                this.#currentMap = this.#langMap.get(locale)
                console.log(locale)
                return
            }
            // convert the locale (en-us) to a lang_code (en) and if it
            // is not in the list, use the lang_code.  If it is in the
            // list 
            let lang_code = locale.split("-")[0];
            if ( !locales.includes(lang_code)){
                if (this.#langMap.has(lang_code)){
                    this.#currentMap = this.#langMap.get(lang_code)
                    console.log(lang_code)
                    return
                }
            }
        }
    }

    get_message(key,...args){
        let msg = this.#currentMap.get(key)
        if (msg?.type=="function"){
            let dynamic_function=new Function(msg.arguments,msg.body)
            return dynamic_function(args)
        }
        return msg
    }

    set language(locale){
        this.set_locale(locale)
    }
    get language(){
        return this.#currentMap.get("_lang")
    }

    get languages(){
        return [...this.#langMap.keys()]
    }
}