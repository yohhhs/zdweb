var appId = 'wx69b650de9b396418'
var secret = 'f29819794a1574af4c2057413215f567'
var url = window.location.href
var CODE = GetQueryString('code')
var memberId = ''
if (!CODE) {
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?'
        + 'appid='+ appId +'&redirect_uri='
        + encodeURIComponent(url)
        + '&response_type=code'
        + '&scope=snsapi_base'
        + '&state=1#wechat_redirect'
} else {



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
        $.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
            appid: appId,
            secret:  secret,
            code: CODE,
            grant_type: 'authorization_code'
        }, function (result) {
            $.post('https://www.topasst.com/solicitWeb/wechat/getMemberIdByOpenId', {
                openId: JSON.parse(result).openid
            }, function (result) {
                if (result.statusCode === 200) {
                    memberId = result.data.memberId
                    addInfo(memberId)
                }
            })
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
    if (tel === '') {
        layer.open({
            content: '请输入电话',
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
    console.log(1111)
    $.post('https://www.topasst.com/solicitWeb/purchaseOrder/addPurchaseOrder', {
        memberId: memberId,
        inviteCode: code,
        goodsCount: number,
        addressDetail: area,
        name: name,
        mobile:  tel
    }, function (result) {
        console.log(result)
        if (result.statusCode === 200) {
        } else {
            layer.open({
                content: result.msg,
                btn: '我知道了'
            });
        }
    })
}