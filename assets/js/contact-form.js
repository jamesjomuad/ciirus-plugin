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