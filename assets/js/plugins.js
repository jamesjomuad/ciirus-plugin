/*
    v3.5
    Description: Ciirus tools and utilities.
    Tags: Quote, Calendar, Blog, Review, Paginations, Newsletter, Field store and etc
*/
(function(w,$){
    "use strict";

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
        if(is)
        fn();
        return is;
    }

    w.isPage = function(page){
        return (window.location.href.indexOf(page) > -1);
    }

    return w;
})(window,jQuery);


/*
    Newsletter
*/
(function(w,$){
    $.fn.newsletter = function(){
        function Newsletter(){}
        var self = Newsletter.prototype;
        var error = false;

        if(typeof self.frame != "undefined")
        return self;

        self.el = $(this);
        self.field = {
            name: self.el.find('[name="name"]'),
            email: self.el.find('[name="email"]'),
            button: self.el.find('#submit'),
        };

        self.frame = $('<iframe/>',{src: "/EmbedMailingList.aspx"});
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
            if(self.field.name.val()){
                self.clearError(self.field.name)
                error = false;
            }else{
                self.setError(self.field.name)
                error = true;
            }
            
            var pattern = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
            if($.trim(self.field.email.val()).match(pattern)){
                self.clearError(self.field.email)
                error = false;
            }else{
                self.setError(self.field.email)
                error = true;
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
                self.submit();
            });
            
            if(self.frame.contents().find('body').text().indexOf("Thank you")>1){
                self.el.trigger( "success");
                self.reset(self.field.name).reset(self.field.email);
                self.frame.remove();
            }
        });

        $('body').append(self.frame);
        return self.el;
    }
})(window,jQuery);


/*
*   Quote
*/
(function(w,$){

    class Quote{
        constructor(){
            this.from       = $('#DateFrom');
            this.to         = $('#DateTo');
            this.quoteUrl   = "/EmbedQuoter.aspx?";
        }

        check(){
            var id = this.getPropertyID();
            var query = $.param({
                PropertyID: id,
                ad: '10+nov+2018',
                dd: '17+nov+2018'
            });
            var decodedURL = decodeURIComponent(this.quoteUrl + query);
            return $.get(decodedURL);
        }

        month(num){
            return (["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"])[Number(num)-1];
        }

        getArrival(){
            var date = this.from.val().split('/');
            return [
                date[1],
                '+',
                this.month(date[0]),
                '+',
                date[2]
            ].join('');
        }

        getDeparture(){
            var date = this.to.val().split('/');
        }

        getPropertyID(){
            var url = new URL(w.location.href);
            return url.searchParams.get("PropertyID");
        }

        getDates(){
            var month   = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
            var from    = new Date(self.from.val());
            var to      = new Date(self.to.val());
            var arriveD = function(){
                return [from.getDate(),'+',month[from.getMonth()],'+',from.getFullYear()];
            };
            var departD = function(){
                return [to.getDate(),'+',month[to.getMonth()],'+',to.getFullYear()];
            };
            return [
                {
                    name:'ad',
                    value: arriveD().join('')
                },
                {
                    name:'dd',
                    value: departD().join('')
                }
            ];
        };
    }

    w.Quote = new Quote;

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
        this._name        = "DOM Observer"
        this._description = "Base on the MutationObserver, an API made to efficiently detect loads of node operations. The MutationObserver interface provides the ability to watch for changes being made to the DOM tree. It is designed as a replacement for the older Mutation Events feature which was part of the DOM3 Events specification.";
        
        if(typeof opt=="function"){
            opt = { after: opt }
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
*   Review Helper 
*/
(function($){
    /*
    *   Review Function @Property Details
    *   Must set a repeating html template with classes
    *   Required classes: name, content, date, rating
    */
    var Paginator = function(el,options){
        this.el = $(el);
        this.template = {
            wrapper: '<ul class="pagination">',
            childWrapper: '<li></li>',
            page: '<a class="page" href="#">1</a>',
            prev: '<a href="#" class="prev"><i class="fa fa-angle-left"></i></a>',
            next: '<a href="#" class="next"><i class="fa fa-angle-right"></i></a>',
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
                var $clone        = $(this).clone()

                if($clone.is('.dxp-current')){
                    $page.text(x+1)
                    $wrapper.append($childWrapper.append($page.addClass('dxp-current')))
                }else{
                    $clone.removeAttr('class');
                    $clone.text($clone.text());
                    $clone.addClass($page.attr('class'))
                    $wrapper.append($childWrapper.append($clone))
                }
            });

            // Add Prev btn
            if(!$wrapper.find('.dxp-current').closest('li').is(':first-child')){
                $prev.attr('onclick',"aspxDVPagerClick('content_descriptions1_GuestReviews1_Reviews', 'PBP')");
                $wrapper.prepend($(self.template.childWrapper).append($prev))
            }

            // Add Next btn
            if(!$wrapper.find('.dxp-current').closest('li').is(':last-child')){
                $next.attr('onclick',"aspxDVPagerClick('content_descriptions1_GuestReviews1_Reviews', 'PBN')");
                $wrapper.append($(self.template.childWrapper).append($next));
            }

            this.el.append($wrapper);
            this.el.find('a').on('click',function(e){
                e.preventDefault()
            })
            return this;
        };
        this.init = function(){
            if(this.getPaginator().length)
            this.build();
        };

        return this.init();
    }; 

    var Review = function(el,opt){
        this.element      = el;
        this.contents     = [];
        this._name        = "Review Templater";
        this._description = "Helps rendering of reveiws into the defferent template.";
        this.options      = $.extend( {
            pagination: null,
            beforeLoad: function(){},
            afterLoad: function(){},
            onEachRender: function(el,data){},
            whenEmpty: function(){},
        }, opt );

        this.paginator = new Paginator(this.options.pagination);
        this.clear = function(){
            this.contents = [];
            this.element.nextAll().remove();
            return this;
        };
        this.getContents = function(){
            var self = this;
            this.contents = [];
            if(!this.isEmpty())
            $('#content_descriptions1_GuestReviews1_Reviews_ICell .dxdvItem_DevEx')
            .each(function(){
                var content = {
                    name:   $.trim($($(this).find('table>tbody>tr').first().find('td>b')[0].nextSibling).text()),
                    date:   $.trim($($(this).find('table>tbody>tr').first().find('td>b')[1].nextSibling).text()),
                    rating: $($(this).find('table>tbody>tr').first().find('td>b').siblings('table').find('td')[1]).find('div'),
                    content:$(this).find('table>tbody>tr').eq(2).text()
                }
                self.contents.push(content)
            });
            return self.contents;
        };
        this.isEmpty = function(){
            return $('#content_descriptions1_GuestReviews1_Reviews_CCell .dxdvEmptyData_DevEx').length ? true : false;
        };
        this.build = function(){
            var self = this;
            var template = this.element
            this.clear();
            $.each(this.getContents().reverse(),function(x,v){
                var clone = template.clone();
                clone.removeData();
                clone.addClass(v.name.toLowerCase())
                clone.find('.name').text(v.name);
                clone.find('.content').text(v.content);
                clone.find('.date').first().text(v.date);
                clone.find('.rating').append(v.rating);
                clone.show();
                clone.removeAttr('style');
                clone.insertAfter(template);
                self.options.onEachRender(clone,v)
            });
            this.element.hide();
            return this;
        };
        this.init = function(){
            var self = this;
            if(this.element){
                if(!this.isEmpty()){
                    this.build()
                }else{
                    this.options.whenEmpty()
                }
            }

            /* 
            *   Obeserver: DOM listener 
            *   This is where some magics happen 
            */
            $('#content_descriptions1_GuestReviews1_Reviews_CCell').observe({
                before:function(){
                    self.options.beforeLoad()
                },
                after:function(){
                    // Refreshes pagination when new content is loaded
                    self.build()
                    self.paginator.build()
                    self.options.afterLoad()
                }
            });
            
            return this;
        };
        return this.init();
    }

    $.fn.review = function (options) {
		var review = new Review($(this) ,options);
		$(this).data('review', review);
		return review;
	}
})(jQuery);


/*
*   Blog Helper
*/
(function($){
    /*
    *   Use this template: <nav class="pagination"> or create custom
    */
    var Paginate = function(el,opt){
        var self        = this;
        this.el         = el;
        this.$base      = $('.dxdvPagerPanel_Office2003Olive').first();
        this.options    = $.extend({
            paginationTemplate: '<ul class="pagination"><li> <a href="#" class="first" onclick="aspxDVPagerClick(`content_Blog2`, `PBF`)"> <span>&laquo;</span> </a></li><li> <a href="#" class="prev" onclick="aspxDVPagerClick(`content_Blog2`, `PBP`)"> <span>&lt;</span> </a></li><li> <span class="label label-info">Page 2 of 3</span></li><li> <a href="#" class="next" onclick="aspxDVPagerClick(`content_Blog2`, `PBN`)"> <span>&gt;</span> </a></li><li> <a href="#" class="last" onclick="aspxDVPagerClick(`content_Blog2`, `PBL`)"> <span>&raquo;</span> </a></li></ul>'
        }, opt );

        this.process = function(){
            var btnBase  = this.$base.find('.dxpLite_PlasticBlue').first().find('.dxp-button');
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
            template.on("click",function(e){e.preventDefault()});

            $(this.options.pagination).html("");

            if(this.getSummary()!="Page 1 of 1")
            return this.el.append(template);
        }
        this.getSummary = function(){
            return this.$base.find('.dxp-summary').first().text();
        }
        this.build = function(){
            this.el.html("");
            this.process();
        }
    }

    $.fn.paginate = function(options){
        if(!$(this).length)
        return $(this);
        var paginate = new Paginate($(this),options);
        paginate.build();

		$(this).data('paginate', paginate);
		return paginate;
    }

    /*
    *   Classes needed in the template:
    *   .title, .date, .category, .content, .url
    */
    var Blogs = function(el,opt){
        this.el         = el;
        this.$base      = $('#content_Blog2_CCell');
        this.options    = $.extend({
            pagination: null,
            onContentRender: function(el){}
        }, opt );

        // Initilize pagination
        this.paginate = new Paginate(this.options.pagination);
        this.el.hide();

        this.getContents = function(){
            var contents = [];
            $('#content_Blog2_ICell .bodyText').each(function(){
                $(this).find('[id*="blogMainContainer"] p').filter(function () { return $.trim(this.innerHTML) == "" }).remove();
                var content = $(this).find('[id*="blogMainContainer"] tr').not(':first-child').text();

                contents.push({
                    title: $(this).find('a>h1').text(),
                    date: $(this).find('.dateAdded').text(),
                    category: $(this).find('.blogCatagoryID').text(),
                    content: content,
                    url: $(this).find('.blogLink').attr('href')
                })
            })
            return contents;
        }
        this.build = function(){
            var self = this;
            this.clear();
            // Build contents
            $.each(this.getContents().reverse(),function(x,v){
                var cloneTemplate = self.el.clone();
                cloneTemplate.find('.title').text(v.title)
                cloneTemplate.find('.date').text(v.date)
                cloneTemplate.find('.category').text(v.category)
                cloneTemplate.find('.content').html($('<p>').text(v.content))
                cloneTemplate.find('.url').attr('href',v.url)
                cloneTemplate.removeAttr('style')
                cloneTemplate.insertAfter(self.el);
                self.options.onContentRender(cloneTemplate);

                if(cloneTemplate.find('.title').closest('a'))
                cloneTemplate.find('.title').closest('a').attr('href',v.url);
            });
            return this;
        }
        this.clear = function(){
            this.el.nextAll().remove();
            return this;
        };
        this.init = function(){
            var self = this;
            this.build();
            this.$base.observe({
                before:function(){
                    console.log('before')
                },
                after:function(){
                    self.build();
                }
            });
            return this;
        }

        this.el.attr('data-provide','blog')
        return this.init();
    };

    $.fn.blogs = function(options){
        if(!$(this).length)
        return $(this);
        var blogs = new Blogs($(this),options);
		$(this).data('blogs', blogs);
		return blogs;
    }

    /*
    *   Required classes on the template:
    *   .name, .content, .email, .date
    */
    var Comments = function(el){
        this.template   = el;
        this.base       = $('#content_dvBlogComments_ICell .BlogCommentItem');
        this.data       = [];

        this.getContents = function(){
            var self = this;
            this.base.each(function(){
                self.data.push({
                    name:    $(this).find('.CommentTitle').text(),
                    email:   $(this).find('.CommentEmail').text(),
                    date:    $(this).find('.CommentAddedDate').text(),
                    content: $(this).find('.CommentText').text()
                })
            });
            return this.data;
        }

        this.build = function(){
            var self = this;
            $.each(self.getContents(),function(x,v){
                var comment = self.template.clone();
                comment.find('.name').text(v.name);
                comment.find('.content').text(v.content);
                comment.find('.email').text(v.email);
                comment.find('.date').text(v.date);
                comment.insertAfter(self.template);
            });
            this.template.hide();
            return this;
        }
        return this;
    }

    $.fn.comments = function(){
        var comments = new Comments($(this));
        comments.build();
		$(this).data('comments', comments);
		return comments;
    }

    /*
    *   Category
    */
    var Category = function(el,option){
        var $list = $($('#content_ASPxTreeList1_D a[href*="/blog/category"]').get().reverse());
        $list.each(function(){
            var cat = el.clone();
            var href = $(this).attr('href');
            var text = $(this).text();
            var count = $(this)[0].nextSibling.nodeValue.replace(/[()]/g, '').replace(/\s/g,'') ;
            cat.find('a').attr('href',href);
            cat.find('a').contents()[0].nodeValue = text;
            cat.find('a .badge').text(count);
            cat.attr('data-provide','category')
            cat.insertAfter(el);
        });
        el.remove();
        return this;
    }

    $.fn.category = function(){
        return new Category($(this));
    }

    /*
    *   Archive
    */
    var Archive = function(el){
        $('#content_ASPxRoundPanel2_RPC a').each(function(){
            var item = el.clone();
            item.find('a')
                .attr('href',$(this).attr('href'))
                .text($(this).text())
            item.insertAfter(el);
        });
        el.remove();
        return this;
    }

    $.fn.archive = function(){
        return new Archive($(this));
    }
})(jQuery);


/* 
*   Details Page Calendar 
*/
(function ( $, window, document, undefined ) {

    // Constructor
    function Calendar() {
        this.name = "Calendar";
        this.version = "3.0.0";
        if(jQuery.isEmptyObject(Calendar.prototype.tmp)){
            $(document).on('click','#content_descriptions1_availability1_ASPxCalendar1 [onclick*="aspxCalShiftMonth"]',function(){
                setTimeout(function(){
                    Calendar.prototype.addClass();
                }, 800);
            });
            Calendar.prototype.addClass();
        }
        return Calendar.prototype;
    };
    Calendar.prototype = {
        constructor: Calendar,
        data: {},
        tmp: {},
        md5: function(d){
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
        },
        getData: function(){
            var self = this;
            $('#content_descriptions1_availability1_ASPxCalendar1 > tbody > tr > td > table > tbody')
            .each(function(){
                var title   = $(this).find('tr').eq(1).find('span').text().toLowerCase();
                var YYYY    = title.split(' ')[1];
                var MM      = moment().month(title.split(' ')[0]).format("MM");
                var getDays = function(el){
                    el.find('tr')
                    .eq(2)
                    .find('td>table>tbody>tr')
                    .not('tr:first-child')
                    .find('td>table>tbody>tr>td')
                    .each(function(){
                        if($(this).closest('.dxeCalendarDay_PlasticBlue').is('.dxeCalendarOtherMonth_PlasticBlue'))
                        return;
                        
                        var key = moment(YYYY+"-"+MM+"-"+$(this).text()).format('YYYY-MM-DD');
                        if(self.inObject(key,self.data)==false)
                        self.data[key] = {
                            year:   YYYY,
                            month:  MM,
                            day:    $(this).text(),
                            bg:     $(this).parents('table').first().css('background-image').replace('url(','').replace(')','').replace(/\"/gi, "")
                        }
                    });
                };
                getDays($(this));
            });
            return this.data;
        },
        inObject: function(term,obj){
            if(typeof obj[term]==='object')
                return obj[term];
            return false;
        },
        base64: function (url, callback) {
            var self    = this;
            var url     = url.split('?')[0];
            if(typeof self.tmp[url]!='undefined'){
                callback(self.tmp[url]);
            }else{
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send(); 
                xhr.onload = function () {
                    var reader = new FileReader();
                    reader.readAsDataURL(xhr.response);
                    reader.onloadend = function () {
                        self.tmp[''+url] = reader.result;
                        callback(reader.result);
                    }
                };
            }
        },
        identify: function(imgUrl,callback){
            var self = this;
            this.base64(imgUrl,function(image){
                callback(self.getKeyByCode(self.md5(image)))
            })
        },
        setLegend: function(el,bg){
            this.identify(bg,function(cssClass){
                if(cssClass)
                el.addClass(cssClass);
            });
        },
        addClass: function(){
            var self = this;
            $('#content_descriptions1_availability1_ASPxCalendar1 [style*="calIcons"]')
            .each(function(){
                try {
                    var bg = $(this).css('background-image').replace('url(','').replace(')','').replace(/\"/gi, "");
                    self.setLegend($(this).find('tr td'),bg)
                } catch (error) {
                    console.log(error)
                }
            });
            return this;
        },
        getKeyByCode: function(encode){
            var legends = {
                "744bb3be2ecd09d260b8be93b9a0ae86": 'reserve',
                "9ca1c35177ccdc4842d525a88a14aec7": 'arrive',
                "bf4fc138c750ddbe1c7f2c23b40e5268": 'depart',
                "a381c9e57f6ff7052816ec489e3f4cc0": 'departArrive'
            };
            return legends[encode.slice(-300)];
        }
    }

    window.Calendar = Calendar;
})( jQuery, window, document );


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
                    footer: true
                };
                $.extend(this.options, options);
                this.init();
            }
            
            return this;
        }

        init(){
            this.content = $(this.component());
            this.content.addClass('modalize')
            this.compose();
        }

        events(){
            var close = this.content.find('[data-dismiss="modal"]')
        }

        compose(){
            this.target.replaceWith(this.content);
        }

        header(){
            console.log(this)
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

    } /* end class */

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
    Contact Form
    Description: A contact form plugin that is usable anywhere in the page
    Initilization: 
        by data: <div data-provide="cf"></div>
        by function: $('#contact').contactForm();
    Options:
        debug: false,
        redirect: true,
        beforeSubmit: function(data)
        afterSubmit: function(url)
*/
(function(w,$){

    class remote {
        constructor(boolRedirect){
            this.formUrl = "/contactus.aspx";
            this.path    = null;
            
            var self = this;

            this.iframe = $('<iframe/>',{src: this.formUrl}).hide();

            this.iframe.on("load", function() {
                self.url = self.iframe.contents().get(0).location.href;
                if(boolRedirect)
                if(self.url.indexOf('/userpage.aspx')>0){
                    window.location.href = self.url;
                }
            });

            $('body').append(this.iframe);
            return this;
        }

        el(target){
            if(target)
                return this.iframe.contents().find(target);
            else
                return this.iframe;
        }

        data(json){
            this.el('[name="ctl00$content$contact1$txtName"]').val(json.name);
            this.el('[name="ctl00$content$contact1$txtTelephone"]').val(json.phone);
            this.el('[name="ctl00$content$contact1$txtEmail"]').val(json.email);
            this.el('[name="ctl00$content$contact1$txtComments"]').val(json.message);
            return this;
        }

        send(){
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
        }

    }

    class contactForm {
        constructor(element,options){
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

            this.init();
        }

        init(){
            var self = this;

            if(this.isElementEmpty()){
                this.element.html($(this.template()));
            }

            this.$$('button').on('click',function(){
                self.onSubmit();
            });

            this.debug();
        }

        debug(){
            if(!this.settings.debug)
            return;

            this.remote.iframe.show().css('width','100%');
            this.remote.iframe.contents().find('*').show();
        }

        onSubmit(){
            var self = this;
            self.data = {
                name    : self.$$('#name, .name, [name="name"]').val(),
                phone   : self.$$('#phone, .phone, [name="phone"]').val(),
                email   : self.$$('#email, .email, [name="email"]').val(),
                message : self.$$('#message, .message, [name="message"]').val()
            };
            self.send();
        }

        template(){
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
        }

        $$(target){
            return this.element.find(target);
        }

        isElementEmpty(){
            return !$.trim(this.element.html());
        }

        validate(){
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
        }

        send(){
            this.settings.beforeSubmit(this.data);

            if(this.validate()){
                this.$$('input,button,textarea').prop('disabled',true)
                this.remote
                .data(this.data)
                .send()
                .then(function(res){
                    this.settings.afterSubmit(res);
                });
            }
        }

        wait(bool){
            if(bool)
                this.$$('input,textarea,button').prop('disabled', true);
            else
            {
                this.$$('input,textarea,button').prop('disabled', false);
            }
        }
    }

    $.fn.contactForm = function(options){
        if(typeof $(this).data('contactForm') !== 'undefined' || !$(this).length)
        return false;

        var $self = $(this);
        var hasField = function(target){
            return $self.find(target).length;
        }

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
    }

    $(document).ready(function(){
        $('[data-provide="contactForm"],[data-provide="cf"]').contactForm();
    });

})(window,jQuery)