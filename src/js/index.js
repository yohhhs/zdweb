var appId = 'wx862c127573da3930'
var secret = '819e0af7cf45dc5a1a0b9701788f84b8'
// var appId = 'wx69b650de9b396418'
// var secret = 'f29819794a1574af4c2057413215f567'
var url = window.location.href
var CODE = GetQueryString('code')
var memberId = ''
if (!CODE) {
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?'
        + 'appid='+ appId +'&redirect_uri='
        + url
        + '&response_type=code'
        + '&scope=snsapi_base'
        + '&state=1#wechat_redirect'
} else {



}
var timer = null
$('#code').on('input', function () {
    if (timer) {
        clearTimeout(timer)
        timer = setTimeout(getGoodsName, 1000)
    } else {
        timer = setTimeout(getGoodsName, 1000)
    }
})
function getGoodsName () {
    $.post('https://www.topasst.com/solicitWeb/purchaseOrder/getSolicitGoodsByInviteCode', {
        inviteCode: $('#code').val()
    }, function (result) {
        if (result.statusCode === 200) {
            $('#goodsName').val(result.data.name)
        } else {
            $('#goodsName').val('未找到相关产品')
        }
    })
}
function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) {
        return r[2]
    } else {
        return null
    }
}
$('#loginBtn').click(function() {
    if (!memberId) {
        $.post('https://www.topasst.com/solicitWeb/wechat/registerByCode', {
            loginCode: CODE
        }, function (result) {
            if (result.statusCode === 200) {
                console.log(result.data.memberId)
                memberId = result.data.memberId
                addInfo(memberId)
            }
        })
    } else {
        addInfo(memberId)
    }

})
function addInfo (memberId) {
    let code = $('#code').val().trim();
    let number = $('#number').val().trim();
    let area = $('#area').val().trim();
    let tel = $('#tel').val().trim();
    let name = $('#name').val().trim();
    if (code === '') {
        layer.open({
            content: '请输入邀请码',
            btn: '我知道了'
        });
        return
    }
    if (name === '') {
        layer.open({
            content: '请输入姓名',
            btn: '我知道了'
        });
        return
    }
    if (tel === '') {
        layer.open({
            content: '请输入电话',
            btn: '我知道了'
        });
        return
    }
    if (number === '') {
        layer.open({
            content: '请输入产品数量',
            btn: '我知道了'
        });
        return
    }
    if (area === '') {
        layer.open({
            content: '请输入所属区域',
            btn: '我知道了'
        });
        return
    }
    $.post('https://www.topasst.com/solicitWeb/purchaseOrder/addPurchaseOrder', {
        memberId: memberId,
        inviteCode: code,
        goodsCount: number,
        addressDetail: area,
        name: name,
        mobile:  tel
    }, function (result) {
        if (result.statusCode === 200) {
            $('#code').val('')
            $('#number').val('')
            $('#goodsName').val('')
            $('#area').val('')
            $('#tel').val('')
            $('#name').val('')
            layer.open({
                content: '征订订单提交成功，您可在”订单管理”查询及修改',
                btn: '确定'
            });
        } else {
            layer.open({
                content: result.msg,
                btn: '我知道了'
            });
        }
    })
}