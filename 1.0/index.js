/**
 * @fileoverview 将数字转换为大写的金额
 * @author bofang.zxj<bofang.zxj@taobao.com>
 * @module cn-money
 **/
KISSY.add(function(S){

    var re = {};

    // ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
    var ARR_CHINESE_NUMBER = ['\u96F6', '\u58F9', '\u8D30', '\u53C1', '\u8086', '\u4F0D', '\u9646', '\u67D2', '\u634C', '\u7396'];
    //["元", "拾", "佰", "仟", "万", "拾", "佰","仟", "亿", "拾", "佰", "仟", "万", "拾", "佰", "仟"];
    var ARR_CHINESE_UNIT = ['\u5143','\u62FE','\u4F70','\u4EDF','\u4E07','\u62FE','\u4F70','\u4EDF','\u4EBF','\u62FE','\u4F70','\u4EDF','\u4E07','\u62FE','\u4F70','\u4EDF'];
    //["角", "分", "厘" ,"毫","丝","忽"];
    var ARR_CHINESE_DEC = ['\u89D2','\u5206','\u5398','\u6BEB','\u4E1D','\u5FFD'];

    // 最大的处理位数，级别:千万亿
    var NUM_MAX_INTEGERS = 16;
    // 默认两位小数
    var NUM_DEFAULT_DEC = 2;
    // 最多处理5位小数
    var NUM_MAX_DEC = 6;
    // 用于检测传入的number
    var REG_NUMBER = /^\d+(.\d+)?$/;

    S.mix(re,{
        /**
         * 转换成大写的数字金额
         * @param  {Number || String} number 需要转换的数字，可以是number和string
         * @param  {Number} decimalsSize 保留几位小数，默认为2
         * @return {String || Boolean}        正确返回处理的字符串，错误返回false
         */
        convert:function(number,decimalsSize){
            if( !(S.isNumber(number) || S.isString(number)) || ! REG_NUMBER.test(number)){
                S.log('Error type !');
                return false;
            }
            this.decimalsSize = parseInt(decimalsSize) || 2;
            var oParsedParam = this.parseParam(number+'');
            if (oParsedParam.i.length > NUM_MAX_INTEGERS) {
              S.log("Too large !");
              return false;
            }
            return this.trimValue(oParsedParam);
        },
        /**
         * 整数和小数部分分别转换完成之后，再做相关的处理，去除0之类的
         * @param  {Object} oParsedParam 
         * @return {String} 最终处理结果
         */
        trimValue:function(oParsedParam){
            var isNeedWan = this.isNeedTenThousand(oParsedParam.i) ;
            var strParsedInt = this._convertInteger(oParsedParam.i, isNeedWan);
            var strPasedDecimal = this._convertDecimal(oParsedParam.d);
            if(oParsedParam.i === '0'){
                if(oParsedParam.d === ''){
                    return '零元';
                }
                return strPasedDecimal.replace(/^\u96F6{1,}/,'');
            }
            return strParsedInt + strPasedDecimal;
        },
        /**
         * 将数字分割成整数和小数
         * @param  {String} strNumber 数字
         * @return {Object}           {i:,d:}
         */
        parseParam:function(strNumber){
            var strInt;
            var strDec;
            var numIndexKey = strNumber.indexOf(".");
            if (numIndexKey > 0) {
              strInt = strNumber.substring(0, numIndexKey);
              strDec = strNumber.substring(numIndexKey + 1);
            } else if (numIndexKey == 0) {
              strInt = "";
              strDec = strNumber.substring(1);
            } else {
              strInt = strNumber;
              strDec = "";
            }
            // strInt去掉首0，不必去掉strDec的尾0(超出部分舍去)
            if (!strInt ==="" ) {
              strInt = parseInt(strInt,10);
              if (strInt.equals("0")) {
                strInt = "";
              }
            }
            return {
                i:strInt,
                d:strDec
            }
        },
        /**
         * 小数点前的转换
         * @param  {String}  integers  数字
         * @param  {Boolean} isNeedWan 是否需要万
         * @return {[type]}           
         */
        _convertInteger:function(integers,isNeedWan){
            var arrInteger = [];
            var length = integers.length;
            for (var i = 0; i < length; i++) {
              // 0出现在关键位置：
              // 1234(万)1234(亿)1234(万)1234(元)
              var key = '';
              var swithVal = length - i;
              if (integers[i] == 0) {
                if ((swithVal) == 13){ // 万(亿) *
                    key = ARR_CHINESE_UNIT[4];
                }else if ((swithVal) == 9){// 亿 * 
                 key = ARR_CHINESE_UNIT[8];
                }else if ((swithVal) == 5 && isNeedWan ){// 万
                    key = ARR_CHINESE_UNIT[4];
                }else if ((swithVal) == 1){// 元 * 
                  key = ARR_CHINESE_UNIT[0];
                }
                // 0遇非0时补零，不包含最后一位
                if ((swithVal) > 1 && integers[i + 1] != 0){
                    key += ARR_CHINESE_NUMBER[0];
                }
              }
              arrInteger.push(integers[i] == 0 ? 
                key : (ARR_CHINESE_NUMBER[integers[i]] + ARR_CHINESE_UNIT[swithVal - 1]));
            }
            return arrInteger.join('');

        },
        /**
         * 转换小数点后面的数字
         * @param  {String} decimals 
         * @return {String}          
         */
        _convertDecimal:function(decimals){
            var chineseDecimal = [];
            for (var i = 0 ,len = decimals.length; i < len ; i++) {
              // 最多能够处理的小数位
              if (i === NUM_MAX_DEC || i === this.decimalsSize){
                break;
              }
              chineseDecimal.push(decimals[i] == 0 ? "\u96F6"
                  : (ARR_CHINESE_NUMBER[decimals[i]] + ARR_CHINESE_DEC[i]));
            }
            return chineseDecimal.join('').replace(/\u96F6{2,}/g,'\u96F6').replace(/\u96F6{1,}$/,'');
        },
        /**
         * 5-8位没有数字，就不需要万了
         * @param  {String}  strInt 小数点前的数字 
         * @return {Boolean}     
         */
        isNeedTenThousand:function(strInt){
            var length = strInt.length;
            var subInteger = '';
            if (length > 4) {
              if (length > 8) {
                subInteger = strInt.substring(length - 8, length - 4);
              } else {
                subInteger = strInt.substring(0, length - 4);
              }
              return parseInt(subInteger,10) > 0;
            } 
            return false;
        }
    });
    return re;
});



