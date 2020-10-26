

export default class SmartLocation {
    constructor(app) {
      // Bindings
      this.init = this.init.bind(this);
      this.storage = app.util.storage;
      this.helpers = app.helpers
      this.regionlist = app.util.regionlist;
      this.adapter = app.adapter;
      this.proxy = app.proxy;
      this.userRules = null;
      this.checkSmartLocation = null;
      this.currentTabUrl = '';
      this.setCurrentDomain = this.setCurrentDomain.bind(this);
      this.visibleSize = this.visibleSize.bind(this);
      this.getSmartLocationRules = this.getSmartLocationRules.bind(this);
    }

    init(){
        //init of smart rules array and check smart boolean
        if(!this.storage.getItem('smartLocationRules')){
            this.storage.setItem("smartLocationRules", JSON.stringify([]));
            this.storage.setItem("checkSmartLocation",false)
        }
        this.userRules = JSON.parse(this.storage.getItem('smartLocationRules'));
        this.checkSmartLocation =  this.storage.getItem('checkSmartLocation');
    }

    visibleSize() {
        return this.getSmartLocationRules('smartLocationRules').length;
    }

    setCurrentDomain(tabInfo){
        //set domain for user input
        if(tabInfo){
            const url = this.helpers.UrlParser.parse(tabInfo.url) ? this.helpers.UrlParser.parse(tabInfo.url) : '';
            this.currentTabUrl = (!tabInfo.url.startsWith('chrome://')) ? url.domain : null;
        }
    }
    
    addSmartLocation(userRules,userSelect){
        //add smart location
        let usersRules = JSON.parse(this.storage.getItem('smartLocationRules')) ? JSON.parse(this.storage.getItem('smartLocationRules')) : [];
        const smartRule = {userRules,userSelect,proxy: Object.values(this.regionlist.normalRegions).filter(v=> v.id == userSelect)[0]};
        if(smartRule.proxy){
            usersRules.push(smartRule);
            this.storage.setItem("smartLocationRules", JSON.stringify(usersRules));
        }
    }

    removeSmartLocation(rule){
        //remove smart location
        let usersRules = this.getSmartLocationRules('smartLocationRules') ? this.getSmartLocationRules('smartLocationRules') : [];
        usersRules = usersRules.filter(v=>v.userRules != rule.userRules );
        this.saveToStorage("smartLocationRules", usersRules,true);
    }

    editSmartLocation(rule){
        //edit smart location
        const userRules = this.getSmartLocationRules('smartLocationRules');
        rule.proxy =  Object.values(this.regionlist.normalRegions).filter(v=> v.id == rule.userSelect)[0];
        if(rule.proxy){
            userRules.splice(rule.indexEdit, 1, rule);
            delete rule.indexEdit;
            this.saveToStorage("smartLocationRules", userRules,true);
        }
    }

    getSmartLocationRules(value){
        const userRules = JSON.parse(this.storage.getItem(value));
        return userRules;
    }

    saveToStorage(key,value,bridged){
        
        if (!bridged) {
            this.adapter.sendMessage('smartLocation', { settingID:key, value: value });
          }
        return this.storage.setItem(key, JSON.stringify(value));
    }

    
 
}