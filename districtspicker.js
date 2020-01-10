! function($) {
    'use strict';
    if (typeof window.chinese_districts_data === 'undefined') {
        throw new Error('The file "districtspicker-data.js" must be included first!');
    }
    $.fn['districtspicker'] = function(method) {
        var methods = {
            init: function(option) {
                option = $.extend({},{
                    province:'',
                    city:'',
                    district:'',
                    change:function(){}
                },option)
                return this.each(function() {
                    var $element = $(this).clone(),
                        inputHeight = $element.height(),
                        $districtsPicker = $('<div class="districts-picker" style="height:'+inputHeight+'px;width:'+$element.width()+'px">'),
                        $selectItemsCol = $('<div class="select-items-col" style="line-height:'+inputHeight+'px;height:'+inputHeight+'px;">'),
                        $districtsPickerDropdown = $('<div class="districts-picker-dropdown" style="top:'+inputHeight+'px;">'),
                        $districtsTab = $('<div class="districts-tab"><a href="javascript:;" data-type="province" class="active">省份</a><a href="javascript:;" data-type="city">城市</a><a href="javascript:;" data-type="district">区/县名</a></div>'),
                        $districtsTabContent = $('<div class="districts-tab-content">'),
                        $tabContentProvince = $('<div class="province dtc" data-name="province">'),
                        $tabContentCity = $('<div class="city dtc" data-name="city">').hide(),
                        $tabContentDistrict = $('<div class="district dtc" data-name="district">').hide();

                    $districtsPicker.append($selectItemsCol).append($districtsPickerDropdown.append($districtsTab).append($districtsTabContent.append($tabContentProvince).append($tabContentCity).append($tabContentDistrict))).append($element);
                    var cd_data = window.chinese_districts_data
                    //加载区域-省
                    var activeProvinceCode = loadDistricts(cd_data['86'],$districtsTabContent,option.province,'province');
                    if(activeProvinceCode !== ''){
                        setSelctItem($districtsPicker,'province',activeProvinceCode,option.province)
                        //加载区域-市
                        var activeCityCode = loadDistricts(cd_data[activeProvinceCode],$districtsTabContent,option.city,'city');         
                        if(activeCityCode !== ''){
                            setSelctItem($districtsPicker,'city',activeCityCode,option.city);
                            //加载区域-区/县
                            var activeDCode = loadDistricts(cd_data[activeCityCode],$districtsTabContent,option.district,'district');
                            if(activeDCode !== ''){
                                setSelctItem($districtsPicker,'district',activeDCode,option.district);
                            }
                        }
                    }
                    
                    $element.val($selectItemsCol.text().replace(/\//g,''));
                    $(this).replaceWith($districtsPicker);
                    $districtsPicker.unbind();
                    $districtsTab.unbind();
                    $districtsTabContent.unbind();
                    $selectItemsCol.unbind();
                    $districtsPicker.on("contextmenu copy selectstart", function () {
                        return false;
                    });
                    $districtsPicker.on('click','.districts-picker-dropdown',function(e){
                        e.stopPropagation();
                    });
                    $districtsPicker.on('click',function(){
                        if($(this).hasClass('open')){
                            $(this).removeClass('open')
                        }else{
                            $(this).addClass('open')
                        }
                    });
                    $districtsTab.on('click','a',function(e,param){
                        e.stopPropagation();
                        $(this).addClass('active').siblings().removeClass('active');
                        var type = $(this).data('type');
                        var $nowel = $('.' + type);                      
                        $nowel.show().siblings().hide();
                        $nowel.nextAll().empty();
                        if(param !== undefined && param.isSelectItem){
                           return;
                        }
                        var typePrev = 'china';
                        if(type === 'district'){
                            typePrev = 'city'
                        }else if(type === 'city'){
                            typePrev = 'province'
                        }
                        var $selectItemPrev = $selectItemsCol.find('span[data-type="'+typePrev+'"]');

                        var $selectItem = $selectItemsCol.find('span[data-type="'+type+'"]');
                        var code = typePrev === 'china'? '86':$selectItemPrev.attr('data-code');
                        
                        loadDistricts(cd_data[code],$districtsTabContent,$selectItem.text(),type);
                    });
                    $districtsTabContent.on('click','span',function(e){
                        e.stopPropagation();
                        var code = $(this).data('code'),text = $(this).text(),
                        $nc = $(this).parents('.dtc'),
                        nowType = $nc.data('name');
                        if(typeof option.change === 'function'){
                            option.change({
                                type:nowType,
                                value:text
                            })
                        }
                        setSelctItem($districtsPicker,nowType,code,text);
                        $element.val($selectItemsCol.text().replace(/\//g,''));
                        $(this).parents('.dtc').find('span').removeClass('active');
                        $(this).addClass('active');
                        if(nowType === 'district'){
                            $districtsPicker.removeClass('open');
                            return;
                        }

                        var nextType = $nc.next().data('name');
                        loadDistricts(cd_data[code],$districtsTabContent,text,nextType);                        
                        $districtsTab.find('a[data-type="'+nextType+'"]').trigger('click',{
                            isSelectItem:true
                        });
                    });
                    $selectItemsCol.on('click','span.select-item',function(e){
                        e.stopPropagation();
                        var type = $(this).data('type');
                        if(!$districtsPicker.hasClass('open')){
                            $districtsPicker.addClass('open');
                        }
                        $districtsTab.find('a[data-type="'+type+'"]').trigger('click');
                    });
                    $(document).on('click',function(e){
                        var $target = $(e.target);
                        if(!($target.hasClass('districts-picker') 
                        || $target.hasClass('select-items-col')
                        || $target.hasClass('select-item')
                        || $target.hasClass('districts-picker-dropdown')
                        || $target.hasClass('districts-tab')
                        || $target.hasClass('districts-tab-content')
                        || $target.hasClass('dtc'))
                        ){
                            $districtsPicker.removeClass('open');
                        }
                    });
                })
            }
        }
        function setSelctItem($districtsPicker,type,code,text){
            var $selectItemsCol = $districtsPicker.find('.select-items-col'),$el = $selectItemsCol.find('span[data-type="'+type+'"]');
            if($el.length > 0){
                $el.text(text).attr('data-code',code);
                var $nextAll = $el.nextAll();
                if($nextAll.length > 0){
                    $nextAll.remove();
                }
                return;
            }
            if(type === 'district' || type === 'city'){
                $selectItemsCol.append($('<b style="color:#333;font-weight: 400;"></b>').text('/'));
            }
            $selectItemsCol.append($('<span class="select-item" data-type="'+type+'" data-code="'+code+'">').text(text));
        }
        function loadDistricts(jsonObj,$tabContent,activeValue,type){
            var $col = $tabContent.find('div[data-name="'+type+'"]');
            $col.empty();           
            let activeCode = ''
            let isArray = true;
            var $dd2 = $('<dd>')
            for (var item in jsonObj){
                var result = jsonObj[item];
                var $dd = $('<dd>')
                if(result instanceof Array){
                    for(var i=0,leng=result.length;i<leng;i++){
                        var ritem = result[i]
                        var cls = activeValue === ritem.address?'active':''
                        if(cls !== ''){
                            activeCode = ritem.code
                        }
                        $dd.append($('<span class="'+cls+'" data-code="'+ritem.code+'">'+ritem.address+'</span>'))
                    }
                }else{
                    isArray = false;
                    var cls = activeValue === result?'active':''
                    if(cls !== ''){
                        activeCode = item
                    }
                    $dd2.append($('<span class="'+cls+'" data-code="'+item+'">'+result+'</span>'))
                }
                if(isArray){
                    $col.append($('<dl>').append('<dt>'+item+'</dt>').append($dd));
                }
            }
            if(!isArray){
                $col.append($('<dl>').append($dd2));
            }
            return activeCode;
        }
        if (methods[method])
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method)
            return methods.init.apply(this, arguments);
        else
            $.error('Method ' + method + ' does not exist!');
    };
}(jQuery);