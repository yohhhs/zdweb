var appId = ''
var url = window.location.href
var CODE = GetQueryString('code')
if (!CODE) {
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?'
        + 'appid=wx69b650de9b396418&redirect_uri='
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
$('input[type="text"]').on('focus', function () {
    var target = this;
    setTimeout(function(){
        target.scrollIntoViewIfNeeded();
    },200);
});
$('#loginBtn').click(function() {
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
    $.post('https://www.topasst.com/web/managerMember/login', {
        mobile: account,
        password:  hex_md5(pass)
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
})