var URL = 'https://www.topasst.com/solicitWeb'
new Vue({
    el: '#app',
    data: {
        showInfo: false,
        token: '',
        saleDptList: [],
        buyGift: 0,
        sendGift: 1,
        transferCount: 0,
        insideMemberName: '',
        agentMemberName: '所有区域',
        status: 3,
        orderList: [],
        addressCode: '',
        areaList: [],
        currentIndex: -1,
        isLoading: false,
        noMore: false,
        pageNo: 1,
        scroll: null,
        appId: 'wx69b650de9b396418',
        secret: 'f29819794a1574af4c2057413215f567',
        memberId: ''
    },
    created: function () {
        var self = this
        if (this.GetQueryString('code')) {
            $.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
                appid: self.appId,
                secret:  self.secret,
                code: self.GetQueryString('code'),
                grant_type: 'authorization_code'
            }, function (result) {
                $.post('https://www.topasst.com/solicitWeb/wechat/getMemberIdByOpenId', {
                    openId: JSON.parse(result).openid
                }, function (result) {
                    if (result.statusCode === 200) {
                        self.memberId = result.data.memberId
                        self.getOrderList()
                    }
                })
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
        GetQueryString: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
            var r = window.location.search.substr(1).match(reg)
            if (r != null) {
                return r[2]
            } else {
                return null
            }
        },
        getOrderList: function () {
            var vm = this
            $.post(URL + '/purchaseOrder/getPurchaseOrderList', {
                memberId: vm.memberId,
                orderState: 1,
                pageNo: vm.pageNo,
                pageSize: 10
            }, function (res) {
                console.log(res)
                if (res.statusCode === 200) {
                    vm.orderList = res.data.list
                    vm.pageNo++
                    if (res.data.list.length === 0) {
                        if (vm.scroll) {
                            vm.scroll.closePullUp()
                        }
                        return false;
                    }
                    if (!vm.scroll) {
                        let options = {
                            pullUpLoad: {
                                threshold: 50
                            }
                        }
                        vm.$nextTick(function () {
                            vm.scroll = new BScroll('.wrapper', options)
                            vm.scroll.on('pullingUp', function () {
                                vm.isLoading = true
                                vm.getMoreList()
                            })
                        })
                    }
                }
            })
        },
        getMoreList: function () {
            var vm = this
            $.post(URL + '/purchaseOrder/getPurchaseOrderList', {
                memberId: vm.memberId,
                orderState: 1,
                pageNo: vm.pageNo,
                pageSize: 10
            }, function (res) {
                vm.isLoading = false
                if (res.statusCode === 200) {
                    if (res.data.list.length < 10) {
                        vm.noMore = true
                        vm.scroll.closePullUp()
                        vm.scroll.refresh()
                    } else {
                        vm.orderList = vm.orderList.concat(res.data.list)
                        vm.pageNo++
                        vm.scroll.finishPullUp()
                        vm.scroll.refresh()
                    }
                }
            })
        },
        showUser: function () {
            this.showInfo = true
        },
        clickMask: function () {
            this.showInfo = false
        }
    }
})