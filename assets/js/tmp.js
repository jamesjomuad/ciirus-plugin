(function(){
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