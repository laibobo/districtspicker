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
                    var cd_data = window.chinese_districts_data,
                        $element = $(this).clone(),
                        inputHeight = $element.height(),
                        $districtsPicker = $('<div class="districts-picker" style="height:'+inputHeight+'px;width:'+$element.width()+'px">'),
                        $selectItemsCol = $('<div class="select-items-col" style="line-height:'+inputHeight+'px;height:'+inputHeight+'px;">'),
                        $districtsPickerDropdown = $('<div class="districts-picker-dropdown" style="top:'+inputHeight+'px;">'),
                        $districtsTab = $('<div class="districts-tab"><a href="javascript:;" data-type="province" class="active">省份</a><a href="javascript:;" data-type="city">城市</a><a href="javascript:;" data-type="district">区/县名</a></div>'),
                        $districtsTabContent = $('<div class="districts-tab-content">'),
                        $tabContentProvince = $('<div class="province dtc" data-name="province">'),
                        $tabContentCity = $('<div class="city dtc" data-name="city" style="display: none;">'),
                        $tabContentDistrict = $('<div class="district dtc" data-name="district" style="display: none;">');

                    $districtsPicker.append($selectItemsCol).append($districtsPickerDropdown.append($districtsTab).append($districtsTabContent.append($tabContentProvince).append($tabContentCity).append($tabContentDistrict))).append($element);
                    
                    var activeProvinceCode = loadDistricts(cd_data['86'],$districtsPicker,option.province,'province');
                    if(activeProvinceCode !== ''){
                        var activeCityCode = loadDistricts(cd_data[activeProvinceCode],$districtsPicker,option.city,'city');         
                        if(activeCityCode !== ''){
                            loadDistricts(cd_data[activeCityCode],$districtsPicker,option.district,'district');
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
                            $(this).removeClass('open');
                        }else{
                            $(this).addClass('open');
                            $districtsTab.find('a[data-type="province"]').trigger('click');
                        }
                    });
                    $districtsTab.on('click','a',function(e,param){
                        e.stopPropagation();
                        $(this).addClass('active').siblings().removeClass('active');
                        var type = $(this).data('type'),$nowel = $districtsTabContent.find('.'+type);                  
                        $nowel.show().siblings().hide();
                        $nowel.nextAll().empty();
                        if(param !== undefined && param.isLoadDistricts === false){ return; }
                        var typePrev = 'china';
                        if(type === 'district'){
                            typePrev = 'city'
                        }else if(type === 'city'){
                            typePrev = 'province'
                        }
                        var $selectItemPrev = $selectItemsCol.find('span[data-type="'+typePrev+'"]'),
                        $selectItem = $selectItemsCol.find('span[data-type="'+type+'"]'),
                        code = typePrev === 'china'? '86':$selectItemPrev.attr('data-code');
                        loadDistricts(cd_data[code],$districtsPicker,$selectItem.text(),type,{ isSelectItem:false });
                    });
                    $districtsTabContent.on('click','span',function(e){
                        e.stopPropagation();
                        var addrCode = $(this).data('code'),addrText = $(this).text(),$nc = $(this).parents('.dtc'),nowType = $nc.data('name');
                        if(typeof option.change === 'function'){
                            option.change({
                                type:nowType,
                                value:addrText
                            })
                        }
                        setSelctItem($districtsPicker,nowType,addrCode,addrText);
                        $element.val($selectItemsCol.text().replace(/\//g,''));
                        $(this).parents('.dtc').find('span').removeClass('active');
                        $(this).addClass('active');
                        if(nowType === 'district'){
                            $districtsPicker.removeClass('open');
                            return;
                        }
                        var nextType = $nc.next().data('name');
                        loadDistricts(cd_data[addrCode],$districtsPicker,addrText,nextType,{ isSelectItem:false });                        
                        $districtsTab.find('a[data-type="'+nextType+'"]').trigger('click',{ isLoadDistricts:false });
                    });
                    $selectItemsCol.on('click','span.select-item',function(e){
                        e.stopPropagation();
                        if(!$districtsPicker.hasClass('open')){
                            $districtsPicker.addClass('open');
                        }
                        $districtsTab.find('a[data-type="'+$(this).data('type')+'"]').trigger('click');
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
        function setSelctItem($districtsPicker,addrType,addrCode,addrText){
            var $selectItemsCol = $districtsPicker.find('.select-items-col'),$el = $selectItemsCol.find('span[data-type="'+addrType+'"]');
            if($el.length > 0){
                $el.text(addrText).attr('data-code',addrCode);
                var $nextAll = $el.nextAll();
                if($nextAll.length > 0){
                    $nextAll.remove();
                }
                return;
            }
            if(addrType === 'district' || addrType === 'city'){
                $selectItemsCol.append($('<b style="color:#333;font-weight: 400;"></b>').text('/'));
            }
            $selectItemsCol.append($('<span class="select-item" data-type="'+addrType+'" data-code="'+addrCode+'">').text(addrText));
        }
        function loadDistricts(jsonObj,$districtsPicker,activeAddr,addrType,param){
            var $col = $districtsPicker.find('div.dtc[data-name="'+addrType+'"]'),activeAddrCode = '',isArray = true,$dd2 = $('<dd>');
            $col.empty();  
            for (var item in jsonObj){
                var result = jsonObj[item],$dd = $('<dd>');
                if(result instanceof Array){
                    for(var i=0,leng=result.length;i<leng;i++){
                        var ritem = result[i],cls = activeAddr === ritem.address?'active':'';
                        if(cls !== ''){ activeAddrCode = ritem.code; }
                        $dd.append($('<span class="'+cls+'" data-code="'+ritem.code+'">'+ritem.address+'</span>'));
                    }
                }else{
                    if(isArray){ isArray = false; }
                    var cls = activeAddr === result?'active':'';
                    if(cls !== ''){ activeAddrCode = item; }
                    $dd2.append($('<span class="'+cls+'" data-code="'+item+'">'+result+'</span>'));
                }
                if(isArray){ $col.append($('<dl>').append('<dt>'+item+'</dt>').append($dd)); }
            }
            if(!isArray){ $col.append($('<dl>').append($dd2)); }
            if(param && param.isSelectItem === false){  return; }
            if(activeAddrCode){
                setSelctItem($districtsPicker,addrType,activeAddrCode,activeAddr);
            }
            return activeAddrCode;
        }
        if (methods[method])
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method)
            return methods.init.apply(this, arguments);
        else
            $.error('Method ' + method + ' does not exist!');
    };
}(jQuery);