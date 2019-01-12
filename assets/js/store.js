/*
*   Web Storage Helper
*   Description: Keep values in the fields
*/
(function(w,$){
    var localStorage = w.localStorage;
    
    class Store{
        constructor(){
            var self = this;
            if (typeof(Storage) !== "undefined") {
                console.log('Web Storage Helper Initialize')
                $(document).on('ready',function(){
                    self.init();
                });
            } else {
                console.log('Sorry! No Web Storage support.')
            }
        }

        init(){

            // Triger listener to supply fields
            var self = this;
            if(this.get())
            $.each(this.get(),function(k,v){
                $(v.field).val(v.value);
                self.supply(v.field,k)
            });

            return this;
        }

        get(name){
            if(!name)
            return localStorage.getItem('$') ? JSON.parse(localStorage.getItem('$')) : {};

            var data = JSON.parse(localStorage.getItem('$') ? localStorage.getItem('$') : {});
            return data[name];
        }

        set(k,v){
            var data = localStorage.getItem('$') ? JSON.parse(localStorage.getItem('$')) : {};
            data[k] = v;
            w.localStorage.setItem('$', JSON.stringify(data));
            return this;
        }

        getObject(key){
            return JSON.parse(localStorage.getItem(key));
        }

        setObject(key, value){
            localStorage.setItem(key, JSON.stringify(value));
            return this;
        }

        clear(){
            localStorage.clear();
            return this;
        }

        supply(field,name){
            var self    = this;
            var $field  = $(field);
            var data    = self.getObject('supply');

            // Add listener
            $field.on('change',function(){
                self.set(name,{
                    field: field,
                    value: $(this).val()
                });
            });
            return this;
        }
    }

    w.store = new Store;

    $.fn.store = function(){
        var Uid = Math.random().toString(36).substring(7);
        $.each($(this).selector.split(','),function(x,v){
            w.store.supply(v,v);
        });
        
        return $(this);
    }
})(window,jQuery);