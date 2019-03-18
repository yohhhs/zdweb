
var URL = 'https://www.topasst.com/solicitWeb'
new Vue({
    el: '#app',
    data: {
        appId: 'wx862c127573da3930',
        secret: '819e0af7cf45dc5a1a0b9701788f84b8',
        // appId: 'wx69b650de9b396418',
        // secret: 'f29819794a1574af4c2057413215f567',
        memberId: '',
        showMessage: false,
        showSelect: false,
        currentGoods: null,
        selectList: [],
        inviteCode: '',
        questData: {
            inviteCode: '',
            goodsCount: 0,
            saleDistrict: '',
            department: '',
            name: '',
            mobile: ''
        },
        timer: null
    },
    watch: {
        ['questData.inviteCode']: function (val) {
            if (this.timer) {
                clearTimeout(this.timer)
                this.timer = setTimeout(this.getGoodsInfo, 1000)
            } else {
                this.timer = setTimeout(this.getGoodsInfo, 1000)
            }
        }
    },
    created: function () {
        var self = this
        if (this.GetQueryString('code')) {
            $.post('https://www.topasst.com/solicitWeb/wechat/registerByCode', {
                loginCode: self.GetQueryString('code')
            }, function (result) {
                if (result.statusCode === 200) {
                    self.memberId = result.data.memberId
                    self.getLastGoodsInfo()
                }
            })
        } else {
            window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?'
                + 'appid='+ this.appId +'&redirect_uri='
                + encodeURIComponent(window.location.href)
                + '&response_type=code'
                + '&scope=snsapi_base'
                + '&state=1#wechat_redirect'
        }
    },
    methods: {
        getLastGoodsInfo: function () {
            let vm = this
            $.post(URL + '/purchaseOrder/getPurchaseOrderDetail', {
                memberId: vm.memberId
            }, function (res) {
                if (res.statusCode === 200) {
                    for (var k in vm.questData) {
                        vm.questData[k] = res.data[k]
                    }
                    vm.selectList = res.data.solicitGoodsList
                    res.data.solicitGoodsList.forEach(function(item) {
                        if (item.solicitGoodsId === res.data.solicitGoodsId) {
                            vm.currentGoods = item
                        }
                    })
                }
            })
        },
        getGoodsInfo: function () {
            var vm = this
            $.post(URL + '/purchaseOrder/getSolicitGoodsByInviteCode', {
                inviteCode: vm.questData.inviteCode
            }, function (res) {
                if (res.statusCode === 200) {
                    let ary = []
                    res.data.forEach(item => {
                        if (item.solicitState === 2) {
                            ary.push(item)
                        }
                    }) 
                    vm.selectList = ary
                    if (vm.selectList && vm.selectList.length > 0 && !vm.currentGoods) {
                        vm.currentGoods = vm.selectList[0]
                    }
                }
            })
        },
        openSelect: function () {
            this.showSelect = true
        },
        chooseGoods: function (item) {
            this.currentGoods = JSON.parse(JSON.stringify(item))
        },
        closeSelect: function () {
            this.showSelect = false
        },
        delCount: function () {
            if (this.questData.goodsCount > 0) {
                this.questData.goodsCount--
            }
        },
        addCount: function () {
            this.questData.goodsCount++
        },
        addOrder: function () {
            var vm = this
            if (vm.questData.inviteCode === '') {
                return alert('请输入邀请码')
            }
            if (vm.questData.saleDistrict === '') {
                return alert('请输入营业区')
            }
            if (vm.questData.department === '') {
                return alert('请输入部门')
            }
            if (vm.questData.name === '') {
                return alert('请输入姓名')
            }
            if (vm.questData.mobile === '') {
                return alert('请输入电话')
            }
            $.post(URL + '/purchaseOrder/addPurchaseOrder', {
                memberId: vm.memberId,
                inviteCode: vm.questData.inviteCode,
                goodsCount: vm.questData.goodsCount,
                saleDistrict: vm.questData.saleDistrict,
                department: vm.questData.department,
                name: vm.questData.name,
                mobile: vm.questData.mobile,
                solicitGoodsId: vm.currentGoods.solicitGoodsId
            }, function (res) {
                if (res.statusCode === 200) {
                    vm.showMessage = true
                    setTimeout(function(){
                        vm.showMessage = false
                    }, 1500)
                }
            })
        },
        GetQueryString: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
            var r = window.location.search.substr(1).match(reg)
            if (r != null) {
                return r[2]
            } else {
                return null
            }
        }
    }
})