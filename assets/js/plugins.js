/*
*  v3.5
*  Description: Ciirus tools and utilities.
*  Tags: Quote, Calendar, Blog, Review, Paginations, Newsletter, Field store and etc
*/
(function(w,$){
    "use strict";
    var Properties;

    w.params = [
        "ad",
        "aircon",
        "aircon",
        "bathrooms",
        "bbq",
        "bedrooms",
        "cg",
        "clubhouse",
        "cv",
        "cwprov",
        "dd",
        "dock",
        "efp",
        "fc",
        "fireplace",
        "fishing",
        "gameroom",
        "garageax",
        "gasfree",
        "gc",
        "golf",
        "internet",
        "kitchen",
        "laundry",
        "lid",
        "linprov",
        "nearb",
        "nearb",
        "NearThemeParks",
        "nfp",
        "orderbyprice",
        "pets",
        "pf",
        "pool",
        "PoolHeat",
        "propertytype",
        "SeaOceanView",
        "sfp",
        "sleeps",
        "smoking",
        "spa",
        "starrating",
        "tenniscourts",
        "wc",
        "wfp",
        "wifi",
        "wv"
    ];

    w.getUrlParam = function(name){
        var url = new URL(w.location.href);
        return url.searchParams.get(name);
    }

    w.onPage = function(page,fn){
        var is = (window.location.href.indexOf(page) > -1);
        if(is && fn)
        fn();
        return is;
    }

    w.isPage = function(page){
        return (window.location.href.indexOf(page) > -1);
    }

    w.getProperties = (function(){
        Properties = null;
        var getProperties = function(){
            $.get('/JumpToProperty16001.aspx')
            .then(function(res){
                var start   = res.indexOf("= [ {")+1;
                var end     = res.indexOf("}];")+2;
                Properties  = eval(res.substring(start,end));
            });
            return Properties;
        }; getProperties();
        return getProperties;
    })()

    $.wait = function( callback, seconds){
        return window.setTimeout( callback, seconds * 1000 );
    }

    return w;
})(window,jQuery);


/*
*   Newsletter
*   Fields: [name="name"], [name="email"], #submit
*/
(function(w,$){
    function Newsletter(el){
        var self = this;
        var error = false;

        if(typeof self.frame != "undefined")
        return self;

        self.el = el;
        self.field = {
            name: self.el.find('[name="name"]'),
            email: self.el.find('[name="email"]'),
            button: self.el.find('button'),
        };

        self.frame = $('[src="/EmbedMailingList.aspx"]').length ? $('[src="/EmbedMailingList.aspx"]') : $('<iframe/>',{src: "/EmbedMailingList.aspx"});
        self.frame.hide();

        self.setError = function(el){
            el.css('border','1px solid red')
            .addClass('error');
        }

        self.clearError = function(el){
            el.css('border','')
            .removeClass('error');
            return self;
        }

        self.reset = function(el){
            el.val('');
            return self;
        }

        self.isValid = function(){
            if(self.field.name.length){
                if(self.field.name.val()){
                    self.clearError(self.field.name)
                    error = false;
                }else{
                    self.setError(self.field.name)
                    error = true;
                }
            }
            
            
            var pattern = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
            if($.trim(self.field.email.val()).match(pattern)){
                self.clearError(self.field.email)
                error = false;
            }else{
                self.setError(self.field.email)
                error = true;
            }

            if(!error){
                self.field.button.prop("disabled",false);
            }

            return !error;
        }

        self.submit = function(){
            // Click to submit
            if(self.isValid())
                self.frame.contents().find('#btnSumbit_B').click()
        }

        self.frame.on('load',function(){
            self.field.name.on('input',function(){
                self.isValid();
                // Set name
                self.frame.contents().find('#txtName_I').val(self.field.name.val());
            });
            self.field.email.on('input',function(){
                self.isValid();
                // Set email
                self.frame.contents().find('#txtEmail_I').val(self.field.email.val());
            });
            self.field.button.on('click',function(){
                self.el.trigger("before");
                self.submit();
            });
            
            if(self.frame.contents().find('body').text().indexOf("Thank you")>1){
                self.el.trigger("success");
                self.reset(self.field.name).reset(self.field.email);
                self.frame.remove();
            }
        });

        if(!$('[src="/EmbedMailingList.aspx"]').length){
            $('body').append(self.frame);
        }
        return this;
    }
    $.fn.newsletter = function(){
        var newsletter = new Newsletter($(this));
        $(this).data('newsletter',newsletter);
        return $(this);
    }
})(window,jQuery);


/*
*   Shake effect
*/
(function($){
    $.fn.shake = function (options) {
        // defaults
        var settings = {
            'shakes': 2,
            'distance': 10,
            'duration': 400
        };
        // merge options
        if (options) {
            $.extend(settings, options);
        }
        // make it so
        var pos;
        return this.each(function () {
            var $this = $(this);
            // position if necessary
            var pos = $this.css('position');
            if (!pos || pos === 'static') {
                $this.css('position', 'relative');
            }
            // shake it
            for (var x = 1; x <= settings.shakes; x++) {
                $this.animate({ left: settings.distance * -1 }, (settings.duration / settings.shakes) / 4)
                    .animate({ left: settings.distance }, (settings.duration / settings.shakes) / 2)
                    .animate({ left: 0 }, (settings.duration / settings.shakes) / 4);
            }
        });
    };
})(jQuery);


/* 
*   DOM Observer 
*/
(function($){
    var Observer = function(el,opt){
        this.element      = el;
        this._name        = "DOM Observer";
        this._description = "Base on the MutationObserver, an API made to efficiently detect loads of node operations. The MutationObserver interface provides the ability to watch for changes being made to the DOM tree. It is designed as a replacement for the older Mutation Events feature which was part of the DOM3 Events specification.";
        
        if(typeof opt=="function"){
            opt = { after: opt };
        }

        this.options = $.extend({
            before: function(){},
            after: function(){},
        }, opt );

        this.observe = function(){
            var self = this;
            var before = this.options.before;

            // Create an observer instance linked to the callback function
            var observer = new MutationObserver(function(mutationsList){
                // Lets call it onces
                if(typeof before == "function"){
                    before();
                    before = false;
                }

                if(mutationsList[0].removedNodes.length){
                    self.options.after(mutationsList[0].removedNodes);
                    before = self.options.before;
                }
            });

            // Start observing the target node for configured mutations
            observer.observe(this.element[0], { attributes: false, childList: true, subtree: false });
            return this;
        }
        

        return this.observe();
    }

    $.fn.observe = function(options){
        if(!$(this).length)
        return;
        var observe = new Observer($(this) ,options);
		$(this).data('observe', observe);
		return observe;
    }
})(jQuery);


/*
*   Pagination for Properties/Search page
*/    
(function($){
    $.fn.pager = function(options){
        var defualt     = {
            wrapper: '<li></li>',
            prevText: "<",
            nextText: ">",
            firstText: ">",
            lastText: "<",
            button: '<a href="#"/>'
        };

        // merge options
        if (options) {
            $.extend(defualt, options);
        }

        var self  = $(this);
        var list  = $();
        var pager = $('#content_propertylist1_grid1_DXPagerTop > *').not('.dxp-lead, :empty');
        var summary = $('#content_propertylist1_grid1_DXPagerTop .dxp-summary').text();

        $(this).empty();
        $(this).append($('<ul/>').addClass('pagination'))

        pager.each(function(){
            var cloned = $(this).clone();
            var li = $(defualt.wrapper).append(cloned);
            var text = li.text().replace('[','').replace(']','');

            if(cloned.is('.dxp-current')){
                li.addClass('active current');
                li.html('');
                li.append(
                    $(defualt.button).text(text)
                )
            }

            if(cloned.find('span').text()=='< Prev'){
                var btn = $(defualt.button);
                btn.attr('onclick',cloned.attr('onclick'))
                btn.text(defualt.prevText)
                li.html(btn);
            }

            if(cloned.find('span').text()=='Next >'){
                var btn = $(defualt.button);
                btn.attr('onclick',cloned.attr('onclick'))
                btn.text(defualt.nextText)
                li.html(btn);
            }

            if(cloned.is('.dxp-ellip')){
                li.html('');
                li.append($(defualt.button).text('...'))
            }

            if(cloned.is("[onclick*=PBF]")){
                var btn = $(defualt.button);
                btn.attr('onclick',cloned.attr('onclick'))
                btn.text('<<')
                li.html(btn);
            }

            if(cloned.is("[onclick*=PBL]")){
                var btn = $(defualt.button);
                btn.attr('onclick',cloned.attr('onclick'))
                btn.text('>>')
                li.html(btn);
            }

            li.find('img').remove();

            list.push(li);
        })

        list.each(function(){
            self.find('ul').append($(this))
        })

        self.find('a').attr('href','#').on('click',function(e){
            e.preventDefault()
        });

        $('<label>'+summary+'</label>').insertBefore(this);
    }
})(jQuery);


/* 
*   Details Page Calendar 
*/
;(function($,window,document,undefined){
    function Calendar(){
        var self = this;
        this.base = '#content_descriptions1_availability1_ASPxCalendar1 [style*="calIcons"]';
        this.bg = [];
        this.key = {};
        this.legends = {
            "744bb3be2ecd09d260b8be93b9a0ae86":'reserve',
            "9ca1c35177ccdc4842d525a88a14aec7":'arrive',
            "bf4fc138c750ddbe1c7f2c23b40e5268":'depart',
            "a381c9e57f6ff7052816ec489e3f4cc0":'departArrive'
        };

        $('#content_descriptions1_availability1_ASPxCalendar1_LP').parents('center').observe(function(){
            self.init();
        });
        
        this.init = function(){
            var self = this;
            this.setBg();
            this.analyse(function(d){
                self.setClasses();
            });
            return this;
        };
        this.analyse = function(fn){
            var self = this;
            var xhrs = [];
            $.each(this.bg,function(i,ii){
                var xhr = self.base64(ii,function(data){
                    // using md
                    self.key[ii] = self.legends[self.md5(data)] || 'empty';
                    xhrs.pop();
                    if(xhrs.length==0)
                    fn(self.key);
                });
                xhrs.push(xhr);
            });
        };
        this.setClasses = function(){
            var self = this;
            var target = $(this.base);
            target.each(function(){
                var klass = self.key[self.getBg($(this))];
                $(this).find('tbody>tr>td').removeAttr('class');
                $(this).find('tbody>tr>td').addClass(klass);
            });
        }
        this.setBg = function(){
            var self = this;
            // get all bg
            $(this.base).each(function(){
                self.bg.push($(this).css('background-image').replace(/^url\(['"]?/,'').replace(/['"]?\)$/,''));
            });
            this.bg = this.arrUniq(this.bg);
        };
        this.getBg = function(el){
            return el.css('background-image').replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
        };
        this.arrUniq = function(arr){
            return arr.filter(function(v, i, a){
                return a.indexOf(v) === i;
            });
        };
        this.base64 = function (url,fn) {
            var self = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send(); 
            xhr.onload = function () {
                var reader = new FileReader();
                reader.readAsDataURL(xhr.response);
                reader.onloadend = function(){
                    fn(reader.result);
                };
            };
            return xhr;
        }
        this.md5 = function(d){
            function M(d) {
                for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) _ = d.charCodeAt(r), f += m.charAt(_ >>>
                    4 & 15) + m.charAt(15 & _);
                return f
            }
    
            function X(d) {
                for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
                for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
                return _
            }
    
            function V(d) {
                for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
                return _
            }
    
            function Y(d, _) {
                d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
                for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
                    var h = m,
                        t = f,
                        g = r,
                        e = i;
                    f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f =
                                    md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f =
                                                md5_ff(f, r = md5_ff(r, i = md5_ff(i, m =
                                                            md5_ff(m, f, r, i, d[n + 0], 7, -
                                                                680876936), f, r, d[n + 1],
                                                            12, -389564586), m, f, d[n + 2],
                                                        17, 606105819), i, m, d[n + 3], 22, -
                                                    1044525330), r = md5_ff(r, i = md5_ff(i,
                                                        m = md5_ff(m, f, r, i, d[n + 4], 7, -
                                                            176418897), f, r, d[n + 5], 12,
                                                        1200080426), m, f, d[n + 6], 17, -
                                                    1473231341), i, m, d[n + 7], 22, -
                                                45705983), r = md5_ff(r, i = md5_ff(i, m =
                                                    md5_ff(m, f, r, i, d[n + 8], 7,
                                                        1770035416), f, r, d[n + 9], 12, -
                                                    1958414417), m, f, d[n + 10], 17, -
                                                42063), i, m, d[n + 11], 22, -1990404162), r =
                                            md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n +
                                                        12], 7, 1804603682), f, r, d[n + 13],
                                                    12, -40341101), m, f, d[n + 14], 17, -
                                                1502002290), i, m, d[n + 15], 22, 1236535329),
                                        r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n +
                                                1], 5, -165796510), f, r, d[n + 6], 9, -
                                            1069501632), m, f, d[n + 11], 14, 643717713), i, m,
                                        d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i,
                                            m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f,
                                            r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -
                                        660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r,
                                        i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438),
                                            f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -
                                        187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i =
                                        md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f,
                                            r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473),
                                    i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m =
                                    md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -
                                    2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -
                                35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1],
                                    4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7],
                                16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i =
                                md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0],
                                    11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23,
                            76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -
                                640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16,
                            530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(
                            m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[
                            n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i,
                                m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606),
                            m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(
                                i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m,
                            f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m =
                            md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n +
                            2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r =
                        safe_add(r, g), i = safe_add(i, e)
                }
                return Array(m, f, r, i)
            }
    
            function md5_cmn(d, _, m, f, r, i) {
                return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m)
            }
    
            function md5_ff(d, _, m, f, r, i, n) {
                return md5_cmn(_ & m | ~_ & f, d, _, r, i, n)
            }
    
            function md5_gg(d, _, m, f, r, i, n) {
                return md5_cmn(_ & f | m & ~f, d, _, r, i, n)
            }
    
            function md5_hh(d, _, m, f, r, i, n) {
                return md5_cmn(_ ^ m ^ f, d, _, r, i, n)
            }
    
            function md5_ii(d, _, m, f, r, i, n) {
                return md5_cmn(m ^ (_ | ~f), d, _, r, i, n)
            }
    
            function safe_add(d, _) {
                var m = (65535 & d) + (65535 & _);
                return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m
            }
    
            function bit_rol(d, _) {
                return d << _ | d >>> 32 - _
            }
            result = M(V(Y(X(d), 8 * d.length)));
            return result.toLowerCase()
        };
        return this.init();
    }
    window.Calendar = Calendar;
})(jQuery,window,document);


/*
*   Bootstrap Modalize
*/
(function(win,$){
    class Modal
    {
        constructor(element,options) {

            if(element instanceof jQuery){
                this.target  = element;
                this.id      = this.target.attr('id');
                this.title   = this.target.is('[data-title]') ? this.target.data('title') : '&nbsp;';
                this.content = '';
                this.options = {
                    title: "Title",
                    header: true,
                    footer: true,
                    callback: window[this.target.data('callback')]
                };
                $.extend(this.options, options);
                this.init();
            }
            
            return this;
        }

        init(){
            var self = this;
            this.content = $(this.component());
            this.content.addClass('modalize')
            this.compose();
            setTimeout(function() {
                self.options.callback();
            },500);
        }

        events(){
            var close = this.content.find('[data-dismiss="modal"]')
        }

        compose(){
            this.target.replaceWith(this.content);
        }

        header(){
            if(this.options.header)
            return ['<div class="modal-header">',
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">',
            '<span aria-hidden="true">&times;</span>',
            '</button>',
            '<h4 class="modal-title">'+this.title+'</h4>',
            '</div>'].join('')
        }

        body(){
            return [
                '<div class="modal-body">',
                this.target.html(),
                '</div>'
            ].join('')
        }

        footer(){
            if(this.options.footer==false)
            return '';
            
            return ['<div class="modal-footer">',
            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>',
            '</div>'].join('');
        }

        component(){
            return [
                '<div id="'+this.id+'" class="modal fade" tabindex="-1" role="dialog">',
                '<div class="modal-dialog" role="document">',
                '<div class="modal-content">',
                this.header(),
                this.body(),
                this.footer(),
                '</div>',
                '</div>',
                '</div>'
            ].join('');
        }

        dialog(content){
            
        }
    }

    $.fn.modalize = function(options){
        var modal = new Modal($(this) ,options);
        $(this).data('modal',modal);
        return modal;
    }

    win.modal = new Modal;

    $(document).on('ready',function(){
        if($('[data-provide="modalize"]').length)
        $('[data-provide="modalize"]').modalize();
    });
})(window,jQuery);


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


/*
*   Scrolly
*   Description: smooth scroll to anchor
*/
(function(w,$){
    $.fn.scrolly = function(){
        var hash = this.hash;

        if (hash !== "") {
            event.preventDefault();
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function () {
                window.location.hash = hash;
            });
        }
    }

})(window,jQuery);


/*
*   Booker/Qoute
*/
(function(w, $){

    function Booker(){
        var quoteUrl = "/EmbedQuoter.aspx?";
        var bookUrl = "/quote-book.aspx?";

        this._param = {
            pid   : null,
            from  : null,
            to    : null,
            ph    : null,
            name  : null,
            email : null
        };

        this._event = {
            "before"      : [],
            "done"        : [],
            "success"     : [],
            "error"       : [],
            "mail.before" : [],
            "mail.after"  : [],
            "mail.error"  : []
        }

        this.param = function(params){
            this._param = $.extend(this._param,params);
            this._param.pid = this._param.pid || this.getPropertyID();
            this._param.from = this.formatDate(params.from) || this.formatDate($("#DateFrom,.DateFrom,.to").first().val());
            this._param.to = this.formatDate(params.to) || this.formatDate($("#DateTo,.DateTo,.to").first().val());
            return this;
        };

        this.check = function(){
            var self = this;
            var decodedURL = this.jsonToURI({
                PropertyID: this._param.pid,
                ad: this._param.from,
                dd: this._param.to
            });

            /*
            *   Firing events
            */
            if(this.trigger('before')==false){return false;}

            var remote = $.get(quoteUrl + decodedURL);

            remote.done(function(res){
                var error1   = $(res).find('[color="Red"]');
                var error2  = $(res).find('.ratesControlQuoteResponse.hasQuotingError');
                if(error1.length){
                    self.trigger("error", error1.text());
                }else if(error2.length){
                    self.trigger("error", error2.text());
                }else{
                    self.trigger("success", $(res).find('#rates1_pnlQuoteResults_tbQuoteResults_C0 .ratesControlQuoteResponse>table'));
                }
                self.trigger("done",res);
            }).fail(function(jqXHR){
                self.trigger("error","Network Error!");
            });
            return remote;
        };

        this.mail = function(){
            var self = this;
            var uri = this.jsonToURI({
                PropertyID: this._param.pid,
                ad: this._param.from,
                dd: this._param.to,
                gnames: this._param.name,
                email: this._param.email
            });
            //Before send
            this.trigger('mail.before');
            var remote = $.get(quoteUrl + uri);
            //After send
            remote.done(function(res){
                if(res.indexOf('Thank You! - 1 Quotes have been sent via E-mail.')!=-1){
                    self.trigger('mail.after');
                }
            }).fail(function(xhr){
                self.trigger('mail.error',xhr);
            });
            return remote;
        };

        this.getPropertyID = function(){
            var url = new URL(w.location.href.toLocaleLowerCase());
            return url.searchParams.get("propertyid");
        };

        this.formatDate = function(dmy){
            if(dmy)
            return $.datepicker.formatDate('dd+M+yy', new Date(dmy));
            else
            return false;
        };

        this.book = function(){
            var url = this.jsonToURI({
                PID: this._param.pid,
                ad: this._param.from,
                dd: this._param.to,
                ph: this._param.ph
            });
            window.location = bookUrl + url;
            return this;
        };

        this.jsonToURI = function(json){
            var query = $.param(json);
            return decodeURIComponent(query);
        };

        this.on = function(eventName, fn){
            this._event[eventName].push(fn);
            return this;
        }

        this.trigger = function(e,param){
            var x;
            $(this._event[e]).each(function(i,fn){
                x = fn(param);
            });
            return x;
        };

        return this;
    }

    w.Booker = Booker;

    return w;
})(window, jQuery);


/* 
*   Review 
*   Review Function @Property Details
*   Must set a repeating html template with classes
*   Required classes: name, content, date, rating
*   Optional class: alias
*/
(function($){
    function ReviewPager(el,options){
        this.el = $(el);
        this.template = {
            wrapper: '<ul class="pagination">',
            childWrapper: '<li></li>',
            page: '<a class="page" href="#">1</a>',
            prev: '<a href="#" class="prev"><i class="fa fa-angle-left"></i></a>',
            next: '<a href="#" class="next"><i class="fa fa-angle-right"></i></a>',
        };
        
        this.init = function(){
            var self = this;

            if(this.getPaginator().length)
            this.build();

            $('#content_descriptions1_GuestReviews1_Reviews_CCell').observe({
                after:function(){
                    // Refreshes pagination when new content is loaded
                    self.build();
                }
            });
        };

        this.getPaginator = function(){
            return $('#content_descriptions1_GuestReviews1_Reviews_PGT .dxp-num');
        };

        this.getPrevNext = function(){
            return $('#content_descriptions1_GuestReviews1_Reviews_PGT [onclick*=PBP], #content_descriptions1_GuestReviews1_Reviews_PGT [onclick*=PBN]');
        };

        this.build = function(){
            var self     = this;
            var $wrapper = $(this.template.wrapper);
            var $prev    = $(self.template.prev);
            var $next    = $(self.template.next);

            // Clear wrapper
            this.el.html("");

            // Create pages btn
            this.getPaginator()
            .each(function(x){
                var $childWrapper = $(self.template.childWrapper);
                var $page         = $(self.template.page);
                var $clone        = $(this).clone();

                if($clone.is('.dxp-current')){
                    $page.text(x+1);
                    $wrapper.append($childWrapper.append($page.addClass('dxp-current')));
                    $childWrapper.addClass('active');
                }else{
                    $clone.removeAttr('class');
                    $clone.text($clone.text());
                    $clone.addClass($page.attr('class'));
                    $wrapper.append($childWrapper.append($clone));
                }
            });

            // Add Prev btn
            if(!$wrapper.find('.dxp-current').closest('li').is(':first-child')){
                $prev.attr('onclick',"aspxDVPagerClick('content_descriptions1_GuestReviews1_Reviews', 'PBP')");
                $wrapper.prepend($(self.template.childWrapper).append($prev));
            }

            // Add Next btn
            if(!$wrapper.find('.dxp-current').closest('li').is(':last-child')){
                $next.attr('onclick',"aspxDVPagerClick('content_descriptions1_GuestReviews1_Reviews', 'PBN')");
                $wrapper.append($(self.template.childWrapper).append($next));
            }

            this.el.append($wrapper);
            this.el.find('a').on('click',function(e){
                e.preventDefault();
            });
            return this;
        };

        return this.init();
    }

    function Review(el,opt){
        this.element      = el;
        this.contents     = [];
        this.$items       = "#content_descriptions1_GuestReviews1_Reviews_ICell .dxdvItem_DevEx";
        this.wrap         = null;
        this._name        = "Review Templater";
        this._description = "Helps rendering of reveiws into the defferent template.";
        this.options      = $.extend({
            pager: null,
            beforeLoad: function(){},
            afterLoad: function(){},
            onEachRender: function(el,data){}
        }, opt );

        this.init = function(){
            var self = this;

            if(this.element){
                this.wrap = $('<div>',{id:('review_'+this.hash()+this.hash().toLowerCase())})
                .insertBefore(this.element)
                .append(this.element);
                if(!this.isEmpty()){
                    this.build();
                }else{
                    var msg = $('#content_descriptions1_GuestReviews1_Reviews_CCell .dxdvEmptyData_DevEx').text();
                    var info = $('<div>').addClass("well text-info text-center").html($('<b>').text(msg));
                    this.element.html(info);
                }
            }

            /* Obeserver: DOM listener */
            $('#content_descriptions1_GuestReviews1_Reviews_CCell').observe({
                before:function(){
                    self.options.beforeLoad();
                },
                after:function(){
                    // Refreshes pagination when new content is loaded
                    self.build();
                    self.options.afterLoad();
                }
            });

            return this;
        };

        this.clear = function(){
            this.contents = [];
            this.element.nextAll().remove();
            return this;
        };

        this.getContents = function(){
            var self = this;
            this.contents = [];
            if(!this.isEmpty())
            {
                $(this.$items).clone().each(function(){
                    var content = {
                        name:   $.trim($($(this).find('table>tbody>tr').first().find('td>b')[0].nextSibling).text()),
                        date:   $.trim($($(this).find('table>tbody>tr').first().find('td>b')[1].nextSibling).text()),
                        rating: $($(this).find('table>tbody>tr').first().find('td>b').siblings('table').find('td')[1]).find('div'),
                        content:$(this).find('table>tbody>tr').eq(2).text()
                    };
                    content.rating.find('a').remove();
                    content.rating.removeAttr('id');
                    self.contents.push(content);
                });
            }
            return self.contents;
        };

        this.isEmpty = function(){
            return $('#content_descriptions1_GuestReviews1_Reviews_CCell .dxdvEmptyData_DevEx').length ? true : false;
        };

        this.build = function(){
            var self = this;
            var template = this.element;
            this.clear();
            $.each(this.getContents().reverse(),function(x,v){
                var clone = template.clone();
                clone.removeData();
                clone.find('.name').text(v.name);
                clone.find('.content').text(v.content);
                clone.find('.date').first().text(v.date);
                clone.find('.rating').html('').append(v.rating);
                clone.find('.alias').text(v.name[0]);
                clone.show();
                clone.removeAttr('style');
                clone.insertAfter(template);
                self.options.onEachRender(clone,v);
            });
            this.element.hide();
            return this;
        };

        this.hash = function(){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        };

        return this.init();
    }

    $.fn.reviewPager = function (options) {
		return new ReviewPager($(this) ,options);
    };

    $.fn.review = function (options) {
        var review = new Review($(this) ,options);
        review.wrap.data('review',review);
		return review;
    };
    
    $(document).ready(function(){
        $('[data-provide="review-pager"]').reviewPager();
        $('[data-provide="review"]').review();
    });
})(jQuery);


/*
*   Ref: https://sites.google.com/site/tomihasa/google-language-codes
*/
(function(w,$){
    "use strict";
    var self,settings;

    self = function(options){
        settings = $.extend({
            // default options.
            default:'en',
            lang: ['en','fr','de','es','pt-BR','zh-CN','no','da','sv'],
            languages: {
                'af': 'Afrikaans',
                'ak': 'Akan',
                'sq': 'Albanian',
                'am': 'Amharic',
                'ar': 'Arabic',
                'hy': 'Armenian',
                'az': 'Azerbaijani',
                'eu': 'Basque',
                'be': 'Belarusian',
                'bem': 'Bemba',
                'bn': 'Bengali',
                'bh': 'Bihari',
                'bs': 'Bosnian',
                'br': 'Breton',
                'bg': 'Bulgarian',
                'km': 'Cambodian',
                'ca': 'Catalan',
                'chr': 'Cherokee',
                'ny': 'Chichewa',
                'zh-CN': 'Chinese',
                // 'zh-TW': 'Chinese (Traditional)',
                'co': 'Corsican',
                'hr': 'Croatian',
                'cs': 'Czech',
                'da': 'Danish',
                'nl': 'Dutch',
                'en': 'English',
                'eo': 'Esperanto',
                'et': 'Estonian',
                'ee': 'Ewe',
                'fo': 'Faroese',
                'tl': 'Filipino',
                'fi': 'Finnish',
                'fr': 'French',
                'fy': 'Frisian',
                'gaa': 'Ga',
                'gl': 'Galician',
                'ka': 'Georgian',
                'de': 'German',
                'el': 'Greek',
                'gn': 'Guarani',
                'gu': 'Gujarati',
                'ht': 'Haitian Creole',
                'ha': 'Hausa',
                'haw': 'Hawaiian',
                'iw': 'Hebrew',
                'hi': 'Hindi',
                'hu': 'Hungarian',
                'is': 'Icelandic',
                'ig': 'Igbo',
                'id': 'Indonesian',
                'ia': 'Interlingua',
                'ga': 'Irish',
                'it': 'Italian',
                'ja': 'Japanese',
                'jw': 'Javanese',
                'kn': 'Kannada',
                'kk': 'Kazakh',
                'rw': 'Kinyarwanda',
                'rn': 'Kirundi',
                'kg': 'Kongo',
                'ko': 'Korean',
                'kri': 'Krio (Sierra Leone)',
                'ku': 'Kurdish',
                'ckb': 'Kurdish (Soranî)',
                'ky': 'Kyrgyz',
                'lo': 'Laothian',
                'la': 'Latin',
                'lv': 'Latvian',
                'ln': 'Lingala',
                'lt': 'Lithuanian',
                'loz': 'Lozi',
                'lg': 'Luganda',
                'ach': 'Luo',
                'mk': 'Macedonian',
                'mg': 'Malagasy',
                'ms': 'Malay',
                'ml': 'Malayalam',
                'mt': 'Maltese',
                'mi': 'Maori',
                'mr': 'Marathi',
                'mfe': 'Mauritian Creole',
                'mo': 'Moldavian',
                'mn': 'Mongolian',
                'ne': 'Nepali',
                'pcm': 'Nigerian Pidgin',
                'nso': 'Northern Sotho',
                'no': 'Norwegian',
                'nn': 'Norwegian (Nynorsk)',
                'oc': 'Occitan',
                'or': 'Oriya',
                'om': 'Oromo',
                'ps': 'Pashto',
                'fa': 'Persian',
                'pl': 'Polish',
                // 'pt-BR': 'Portuguese (Brazil)',
                'pt-PT': 'Portuguese',
                'pa': 'Punjabi',
                'qu': 'Quechua',
                'ro': 'Romanian',
                'rm': 'Romansh',
                'nyn': 'Runyakitara',
                'ru': 'Russian',
                'gd': 'Scots Gaelic',
                'sr': 'Serbian',
                'sh': 'Serbo-Croatian',
                'st': 'Sesotho',
                'tn': 'Setswana',
                'crs': 'Seychellois Creole',
                'sn': 'Shona',
                'sd': 'Sindhi',
                'si': 'Sinhalese',
                'sk': 'Slovak',
                'sl': 'Slovenian',
                'so': 'Somali',
                'es': 'Spanish',
                'es-419': 'Spanish (Latin American)',
                'su': 'Sundanese',
                'sw': 'Swahili',
                'sv': 'Swedish',
                'tg': 'Tajik',
                'ta': 'Tamil',
                'tt': 'Tatar',
                'te': 'Telugu',
                'th': 'Thai',
                'ti': 'Tigrinya',
                'to': 'Tonga',
                'lua': 'Tshiluba',
                'tum': 'Tumbuka',
                'tr': 'Turkish',
                'tk': 'Turkmen',
                'tw': 'Twi',
                'ug': 'Uighur',
                'uk': 'Ukrainian',
                'ur': 'Urdu',
                'uz': 'Uzbek',
                'vi': 'Vietnamese',
                'cy': 'Welsh',
                'wo': 'Wolof',
                'xh': 'Xhosa',
                'yi': 'Yiddish',
                'yo': 'Yoruba',
                'zu': 'Zulu'
            }
        }, options );

        self.init();
        $(this).after(self.build());
        $(this).remove();
        self.events();
        self.css();
        return self;
    };

    self.helper = {
        strRand: function(){
            return Math.random().toString(30).substring(7);
        },
        toTitleCase: function(str) {
            var lcStr = str.toLowerCase();
            return lcStr.replace(/(?:^|\s)\w/g, function(match) {
                return match.toUpperCase();
            });
        }
    };

    self.init = function(){
        if($('iframe.goog-te-menu-frame').length)
            console.log('Google translator already loaded!')
        else
        {
            self.wrapper = $('<div id="googleTranslator"></div>').hide();
            $("body").append(self.wrapper);
            w.gTransInit = function(){``
                new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'googleTranslator');
            }
            $.getScript('//translate.google.com/translate_a/element.js?cb=gTransInit')
        }

        $(window).load(function() {
            setTimeout(function() {
                self.updateLabel()
            }, 2000);
        });

        return this
    };

    self.events = function(){
        $(".translation-links a").click(function (){
            // var lang = $(this).data("lang");
            var lang = $(this).text();
            var n = $(".goog-te-menu-frame:first");
            setTimeout(function() {
                self.updateLabel()
            }, 800);
            return n.length ? (n.contents().find(".goog-te-menu2-item span.text:contains(" + lang + ")").get(0).click(), !1) : (alert("Error: Could not find Google translate frame."), !1)
        });
    }

    self.build = function(){
        var $htm = $(`<div class="dropdown lang-menu translation-links notranslate">
            <button class="dropdown-toggle btn btn-default btn-sm" type="button" id="googleTranslateDrop" data-toggle="dropdown" aria-haspopup="true"aria-expanded="true">EN<i class="icon ion-chevron-down"></i></button><ul class="dropdown-menu" aria-labelledby="googleTranslateDrop"></ul>
        </div>`);
        var $list = '<li><a href="#" data-lang="{{lang}}">{{label}}</a></li>';
        var $ul = $htm.find('ul');
        $ul.on('updatedList',function ( event, data ) {
            var list = $.map( data, function ( v ) {
                return $list.replace( /{{label}}/, v.label ).replace( /{{lang}}/, v.lang );
            });
            $ul.html(list);
        })
        $ul.trigger( "updatedList", [self.getLang()]);
        this.plugin = $htm;
        return $htm;
    }

    self.getLang = function(){
        var Lang = null;
        if(settings.lang.constructor===Array)
            Lang = $.map(settings.lang,function(v){
                return {
                    lang:v,
                    label:settings.languages[v]
                };
            })
        else if(settings.lang.constructor===Object)
            Lang = $.map(settings.lang,function(v,k){
                return {
                    lang: settings.languages[k],
                    label: v
                };
            })
        return Lang;
    }

    self.setLang = function(lang){
        lang = lang.toLowerCase();
        lang = settings.languages[lang];
        var n = $(".goog-te-menu-frame:first");
        var el = n.contents().find(".goog-te-menu2-item span.text:contains(" + lang + ")").get(0);
        if(typeof el !="undefined"){
            return n.length ? (el.click(), !1) : (alert("Error: Could not find Google translate frame."), !1);
        }
        console.log('Language not found!')
    }

    self.getCurrentLang = function(){
        var getKeyByValue = function (object, value) {
            return Object.keys(object).find(key => object[key] === value);
        }
        return getKeyByValue(settings.languages,$(".goog-te-menu-value span:first").text());
    }

    self.updateLabel = function(){
        if($(".goog-te-menu-value span:first").text()=="Select Language")
        return false;
        
        var label = settings.languages[self.getCurrentLang()];
        this.plugin.find(".dropdown-toggle").contents().first()[0].textContent = label;
        this.plugin.find('ul li').removeClass('active');
        this.plugin.find( "a:contains('"+label+"')" ).parents('li').addClass('active');
    }

    self.css = function(){
        $("body").append($(`
        <style id=`+self.helper.strRand()+`>
            .goog-te-banner-frame.skiptranslate {display: none !important;} 
            body {top: 0px !important;position: inherit!important;}
        </style>`));

        return this;
    }

    $.fn.googleTranslate = self;

    return this;
})(window,jQuery);


/*
*   Blog Helper
*/
(function($){"disabled",false
    /*
    *   Use this template: <nav class="pagination"> or create custom
    */
    var Paginate = function(el,opt){
        var self    = this;
        this.el     = el;
        this.options= $.extend({
            paginationTemplate: '<ul class="pagination"><li> <a href="#" class="first" onclick="aspxDVPagerClick(`content_Blog2`, `PBF`)"> <span>&laquo;</span> </a></li><li> <a href="#" class="prev" onclick="aspxDVPagerClick(`content_Blog2`, `PBP`)"> <span>&lt;</span> </a></li><li> <span class="label label-info">Page 2 of 3</span></li><li> <a href="#" class="next" onclick="aspxDVPagerClick(`content_Blog2`, `PBN`)"> <span>&gt;</span> </a></li><li> <a href="#" class="last" onclick="aspxDVPagerClick(`content_Blog2`, `PBL`)"> <span>&raquo;</span> </a></li></ul>'
        }, opt );

        $('#content_Blog2_CCell').observe({
            after:function(){
                self.build();
            }
        });

        this.build = function(){
            this.el.html("");
            this.process();
            return this;
        };

        this.process = function(){
            var btnBase  = this.base().find('[class*="dxpLite_"]').find('.dxp-button');
            var template = $(this.options.paginationTemplate);
            var firstP   = $(btnBase[0]);
            var prev     = $(btnBase[1]);
            var next     = $(btnBase[3]);
            var lastP    = $(btnBase[2]);

            if(firstP.is('.dxp-disabledButton'))
            template.find('.first').removeAttr('onclick').closest('li').addClass("disabled");
            if(prev.is('.dxp-disabledButton'))
            template.find('.prev').removeAttr('onclick').closest('li').addClass("disabled");
            if(next.is('.dxp-disabledButton'))
            template.find('.next').removeAttr('onclick').closest('li').addClass("disabled");
            if(lastP.is('.dxp-disabledButton'))
            template.find('.last').removeAttr('onclick').closest('li').addClass("disabled");

            // Set summary
            template.find('span.label').text(this.getSummary());
            template.on("click",function(e){e.preventDefault();});

            $(this.options.pagination).html("");

            if(this.getSummary()!="Page 1 of 1")
            return this.el.append(template);
        };

        this.base = function(){
            return $('[class*="dxdvPagerPanel_"]').first();
        };

        this.getSummary = function(){
            return this.base().find('.dxp-summary').first().text();
        };
        
    };
    $.fn.paginate = function(options){
        if(!$(this).length)
        return $(this);

        var paginate = new Paginate($(this),options);
        paginate.build();

		$(this).data('paginate', paginate);
		return paginate;
    };
    $(document).on('ready',function(){
        $('[data-provide="paginate"]').paginate();
    });

    /*
    *   Classes needed in the template:
    *   .title, .date, .category, .content, .url
    */
    var Blog = function(el,opt){
        this.el         = el;
        this.$base      = $('#content_Blog2_CCell');
        this.options    = $.extend({
            pagination: null,
            onContentRender: function(el){}
        }, opt );

        // Initilize pagination
        // this.paginate = new Paginate(this.options.pagination);
        this.el.hide();

        this.getContents = function(){
            var contents = [];
            $('#content_Blog2_ICell .bodyText').each(function(){
                $(this).find('[id*="blogMainContainer"] p').filter(function () { return $.trim(this.innerHTML) == "" }).remove();

                var content = $(this).find('[id*="blogMainContainer"] tr').not(':first-child').find('td').clone();
                content.find('a.blogLink').remove();

                contents.push({
                    title: $(this).find('a>h1').text(),
                    date: $(this).find('.dateAdded').text(),
                    category: $(this).find('.blogCatagoryID').text(),
                    content: content.contents(),
                    url: $(this).find('.blogLink').attr('href')
                });
            });
            return contents;
        };
        this.build = function(){
            var self = this;
            this.clear();
            // Build contents
            $.each(this.getContents().reverse(),function(x,v){
                var cloneTemplate = self.el.clone();
                cloneTemplate.find('.title').text(v.title);
                cloneTemplate.find('.date').text(v.date);
                cloneTemplate.find('.category').text(v.category);
                cloneTemplate.find('.content').html( v.content );
                cloneTemplate.find('.url').attr('href',v.url);
                cloneTemplate.removeAttr('style');
                cloneTemplate.insertAfter(self.el);
                self.options.onContentRender(cloneTemplate);

                if(cloneTemplate.find('.title').closest('a'))
                cloneTemplate.find('.title').closest('a').attr('href',v.url);
            });
            return this;
        };
        this.clear = function(){
            this.el.nextAll().remove();
            return this;
        };
        this.init = function(){
            var self = this;
            this.build();
            this.$base.observe({
                before:function(){
                    // console.log('before');
                },
                after:function(){
                    self.build();
                }
            });
            return this;
        };

        this.el.attr('data-provide','blog');
        return this.init();
    };
    $.fn.blog = function(options){
        if(!$(this).length)
        return $(this);
        var blog = new Blog($(this),options);
		$(this).data('blog', blog);
		return blog;
    };
    $(document).on('ready',function(){
        $('[data-provide="blog"]').blog();
    });

    /*
    *   Classes on the template:
    *   .name, .content, .email, .date, .alias
    */
    var Comments = function(el){
        this.template   = el;
        this.base       = $('#content_dvBlogComments_ICell .BlogCommentItem');
        this.data       = [];

        this.getContents = function(){
            var self = this;
            this.base.each(function(){
                self.data.push({
                    alias:   $(this).find('.CommentTitle').text()[0].toUpperCase(),
                    name:    $(this).find('.CommentTitle').text(),
                    email:   $(this).find('.CommentEmail').text(),
                    date:    $(this).find('.CommentAddedDate').text(),
                    content: $(this).find('.CommentText').text()
                });
            });
            return this.data;
        };

        this.build = function(){
            var self = this;
            $.each(self.getContents(),function(x,v){
                var comment = self.template.clone();
                comment.find('.alias').text(v.alias);
                comment.find('.name').text(v.name);
                comment.find('.content').text(v.content);
                comment.find('.email').text(v.email);
                comment.find('.date').text(v.date);
                comment.insertAfter(self.template);
            });
            this.template.hide();
            return this;
        };
        return this;
    };
    $.fn.comments = function(){
        var comments = new Comments($(this));
        comments.build();
		$(this).data('comments', comments);
		return comments;
    };
    $(document).on('ready',function(){
        $('[data-provide="comments"]').comments();
    });

    /*
    *   Category
    */
    var Category = function(el,options){
        if(!el.length)
        return this;

        this.target = el;
        this.wrap = el.parent('ul');
        this.settings = {
            tree: false,
            tmplt: $('<li> <a href="#">text</a> <span class="badge count">0</span> <button type="button" class="btn btn-xs btn-default"><i class="fa fa-plus"></i></button> </li>'),
            childTmplt: $('<li><a href="#">text</a></li>'),
            childWrap: $('<ul class="collapse in">')
        };
        if (options) {
            $.extend(this.settings, options);
        }

        this._event = {
            "collapse": [],
            "collapse.shown": [],
            "collapse.hide": [],
            "listing" : []
        };

        this.init = function(){
            var self    = this;
            var tmp     = [];
            this.tmplt  = this.settings.tmplt;
            this.create();
            this.target.remove();
    
            $('#content_ASPxTreeList1_U').on('DOMSubtreeModified',function(){
                /* prevents multiple call */
                tmp.push($(this).find('tbody').length);
                var l = tmp.length;
                if(tmp[l-1]==1 && tmp[l-2]==0){
                    tmp = [];
                    self.update();
                }
            });

            this.on('collapse.shown',function(el){
                el.prev().find('.fa').removeClass('fa-plus').addClass('fa-minus');
            }).on('collapse.hide',function(el){
                el.prev().find('.fa').removeClass('fa-minus').addClass('fa-plus');
            });
    
            return this;
        };
    
        this.update = function(){
            var self = this;
            var data = this.getData();
            var plist = this.wrap.find('>li');
      
            $.each(data,function($i, $item){
                if((plist.eq($i).find('ul').length==0) && ($item.child.length>0)){
                    var ulHtm = self.childHtm($item.child,plist.eq($i).find('button').data('target'));
                    var parentLi = plist.eq($i);
                    var btn = parentLi.find('button');
                    parentLi.append( ulHtm );
                    btn.prop('disabled',false);

                    self.trigger('collapse.shown',ulHtm);
                    ulHtm.on('shown.bs.collapse',function(){
                        self.trigger('collapse.shown',$(this));
                    }).on('hide.bs.collapse',function(){
                        self.trigger('collapse.hide',$(this));
                    });
                }
            });
            // return wrap;
        };
    
        this.create = function(){
            var self = this;
            var data = this.getData();
            self.wrap.html('');
    
            $.each(data,function($index, $item) {
                var hash    = self.hash();
                var li      = self.tmplt.clone();
                var parent  = $($item.parent);
                var count   = $item.parent.nextSibling.nodeValue.replace(/[()]/g, '').replace(/\s/g,'') ;
                var btnCollapse = li.find('button');
                li.find('a').attr('href',parent.attr('href'));
                li.find('a').contents()[0].nodeValue = parent.text();
                li.find('.count').text(count);
                btnCollapse.attr('data-toggle','collapse').attr('data-target',hash).attr('data-index',$index);
                btnCollapse.on('click',function(){
                    self.expand($(this));
                });
                li.removeAttr('style');
                if($item.child.length){
                    li.append(self.childHtm($item.child,hash));
                }

                self.wrap.append(li);
            });
        };
    
        this.childHtm = function($item,hash){
            var self = this;
            var wrap = this.settings.childWrap.clone();
            wrap.addClass('collapse').attr('id',hash);
            $.each($item,function($i, $item){
                var an = $($item);
                var li = self.settings.childTmplt.clone();
                li.find('a').attr('href',an.attr('href'));
                li.find('a').text(an.text());
                wrap.append(li);
            });
            return wrap;
        };
    
        this.expand = function($el){
            var self = this;
            this.trigger('collapse',$el);
            if($el.next().is('.collapse')){
                $('#'+$el.data('target')).collapse('toggle');
            }else{
                $($('#content_ASPxTreeList1_U img')[$el.data('index')]).click();
                $el.prop('disabled',true);
            }
            return this;
        };
    
        this.getData = function(){
            var isChild = function(el){ return el.is('tr[id*="content_ASPxTreeList1_R-B"]'); };
            var isParent = function(el){ return !isChild(el); };
            var target = $('#content_ASPxTreeList1_D tr[id*="content_ASPxTreeList1_R-"]');
            var list = [];
            target.each(function(){
                if( isParent($(this)) ){
                    list.push({
                        parent: $(this).find('a[href]').get(0),
                        child: [],
                        button: $(this).find('.dxtl__Expand')
                    });
                }else if( isChild($(this)) ){
                    
                    list[list.length-1].child.push($(this).find('a[href]').get(0));
                }
            });
            return list;
        };
    
        this.hash = function(){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        };

        this.on = function(eventName, fn){
            this._event[eventName].push(fn);
            return this;
        }

        this.trigger = function(e,param){
            var x;
            $(this._event[e]).each(function(i,fn){
                x = fn(param);
            });
            return x;
        };

        return this.init();
    }
    $.fn.category = function(opt){
        var el = $(this);
        var wrap = el.parent();
        var cat = new Category(el,opt);
        wrap.data('category',cat);
        return cat;
    };
    $(document).on('ready',function(){
        $('[data-provide="category"]').category();
    });


    /*
    *   Archive
    */
    var Archive = function(el){
        $('#content_ASPxRoundPanel2_RPC a').each(function(){
            var item = el.clone();
            item.find('a')
                .attr('href',$(this).attr('href'))
                .text($(this).text());
            item.insertAfter(el);
            item.show();
        });
        el.remove();
        return this;
    };
    $.fn.archive = function(){
        return new Archive($(this));
    };
    $(document).on('ready',function(){
        $('[data-provide="archive"]').archive();
    });
;})(jQuery);


/*
*   Contact Form
*   Description: A contact form plugin that is usable anywhere in the page
*   Initilization: 
        by data: <div data-provide="cf"></div>
        by function: $('#contact').contactForm();
*   Options:
        debug: false,
        redirect: true,
        beforeSubmit: function(data)
        afterSubmit: function(url)
*/
(function(w,$){

    function remote(boolRedirect){
        this.formUrl = "/contactus.aspx";
        this.path    = null;
        
        var self = this;

        if(onPage('contactus.aspx')){
            this.iframe = $('body').contents();
        }else{
            this.iframe = $('<iframe/>',{src: this.formUrl}).hide();
            this.iframe.on("load", function() {
                self.url = self.iframe.contents().get(0).location.href;
                if(boolRedirect)
                if(self.url.indexOf('/userpage.aspx')>0){
                    window.location.href = self.url;
                }
            });
            $('body').append(this.iframe);
        }

        this.el = function(target){
            if(target)
                return this.iframe.contents().find(target);
            else
                return this.iframe;
        };

        this.data = function(json){
            this.el('[name="ctl00$content$contact1$txtName"]').val(json.name);
            this.el('[name="ctl00$content$contact1$txtTelephone"]').val(json.phone);
            this.el('[name="ctl00$content$contact1$txtEmail"]').val(json.email);
            this.el('[name="ctl00$content$contact1$txtComments"]').val(json.message);
            return this;
        };

        this.send = function(){
            var self = this;
            this.el('#content_contact1_btnSubmit_B').click();

            return new Promise(function(resolve, reject) {
                self.iframe.on("load", function() {
                    if (self.url.indexOf('/userpage.aspx')>0) {
                        resolve(self.url);
                    }
                    else {
                        reject(Error("It broke"));
                    }
                });
            });
        };

        return this;
    }

    function contactForm(element,options){
        this.element = element;
        this.settings = {
            debug: false,
            redirect: true,
            beforeSubmit: function(){},
            afterSubmit: function(){}
        };
        this.remote = new remote(this.settings.redirect);

        if (options) {
            $.extend(this.settings, options);
        }

        this.init = function(){
            var self = this;

            if(this.isElementEmpty()){
                this.element.html($(this.template()));
            }

            this.$$('button').on('click',function(){
                self.onSubmit();
            });

            this.debug();
            return this;
        };

        this.debug = function(){
            if(!this.settings.debug)
            return;

            this.remote.iframe.show().css('width','100%');
            this.remote.iframe.contents().find('*').show();
        };

        this.onSubmit = function(){
            var self = this;
            self.data = {
                name    : self.$$('#name, .name, [name="name"]').val(),
                phone   : self.$$('#phone, .phone, [name="phone"]').val(),
                email   : self.$$('#email, .email, [name="email"]').val(),
                message : self.$$('#message, .message, [name="message"]').val()
            };
            self.send();
        };

        this.template = function(){
            return [
                '<div class="form-group">',
                '<div class="row">',
                '<div class="col-lg-6 col-md-6 col-sm-12 m0 col-xs-12">',
                '<span>Full Name</span>',
                '<input type="text" name="name" class="form-control" />',
                '</div>',
                '<div class="col-lg-6 col-md-6 col-sm-12 m0 col-xs-12">',
                '<span>Phone Number</span>',
                '<input type="text" name="phone" class="form-control" />',
                '</div>',
                '</div>',
                '</div>',
                '<div class="form-group">',
                '<div class="row">',
                '<div class="col-lg-12 col-md-12 col-sm-12 m0 col-xs-12">',
                '<span>Your Email</span>',
                '<input type="email" name="email" class="form-control" />',
                '</div>',
                '</div>',
                '</div>',
                '<div class="form-group">',
                '<div class="row">',
                '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
                '<span>Message</span>',
                '<textarea name="message" class="form-control" rows="6" name="message" type="textarea"></textarea>',
                '</div>',
                '</div>',
                '</div>',
                '<div class="form-group">',
                '<div class="row">',
                '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
                '<button class="btn btn-primary form-control" type="button">Submit Now</button>',
                '</div>',
                '</div>',
                '</div>'
            ].join('');
        };

        this.$$ = function(target){
            return this.element.find(target);
        };

        this.isElementEmpty = function(){
            return !$.trim(this.element.html());
        };

        this.validate = function(){
            var isMail = function(el){
                var reg = /\S+@\S+\.\S+/;
                var test = reg.test(el.val());
                if(!test){
                    el.css('border-color', 'red');
                }else{
                    el.css('border-color', '');
                }
                return test;
            };
            var isEmpty = function(el){
                var reg = /^(?!\s*$).+/;
                var test = reg.test(el.val());
                if(!test){
                    el.css('border-color', 'red');
                }else{
                    el.css('border-color', '');
                }
                return test;
            };

            var $name    = this.$$('#name,[name="name"]');
            var $phone   = this.$$('#phone,[name="phone"]');
            var $email   = this.$$('#email,[name="email"]');
            var $message = this.$$('#message,[name="message"]');

            var test_name    = isEmpty($name);
            var test_phone   = isEmpty($phone);
            var test_email   = isMail($email);
            var test_message = isEmpty($message);

            return ( test_name &&  test_phone && test_email && test_message );
        };

        this.send = function(){
            this.settings.beforeSubmit(this.data);

            if(this.validate()){
                this.$$('input,button,textarea').prop('disabled',true);
                this.remote
                .data(this.data)
                .send()
                .then(function(res){
                    this.settings.afterSubmit(res);
                });
            }
        };

        this.wait = function(bool){
            if(bool)
                this.$$('input,textarea,button').prop('disabled', true);
            else
            {
                this.$$('input,textarea,button').prop('disabled', false);
            }
        };

        return this.init();
    }

    $.fn.contactForm = function(options){
        if(typeof $(this).data('contactForm') !== 'undefined' || !$(this).length)
        return false;

        var $self = $(this);
        var hasField = function(target){
            return $self.find(target).length;
        };

        /* check important fields */
        if($.trim($self.html()) ? true : false ){
            if( !hasField('#name,.name,[name="name"]') ){
                console.log('"name" field class or ID not set!');
                return false;
            }
            if( !hasField('#phone,.phone,[name="phone"]') ){
                console.log('"phone" field class or ID not set!');
                return false;
            }
            if( !hasField('#email,.email,[name="email"]') ){
                console.log('"email" field class or ID not set!');
                return false;
            }
            if( !hasField('#message,.message,[name="message"]')  ){
                console.log('"message" field class or ID not set!');
                return false;
            }
        }
        

        var cf = new contactForm($(this),options);
        $(this).data('contactForm',cf);
        return $(this);
    };

    $(document).ready(function(){
        $('[data-provide="contactForm"],[data-provide="cf"]').contactForm();
    });

})(window,jQuery);