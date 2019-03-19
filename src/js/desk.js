var URL = 'https://www.topasst.com/solicitWeb'
Vue.component('count-time', {
    props: ['endTime'],
    data: function () {
        return {
            timer: null,
            countDown: [0, 0, 0, 0]
        }
    },
    template: '<div class="time-wrapper small"><span class="time-number">{{countDown[0]}}</span>天'+
    '<span class="time-number">{{countDown[1]}}</span>时'+
    '<span class="time-number">{{countDown[2]}}</span>分'+
    '<span class="time-number">{{countDown[3]}}</span>秒</div>',
    created: function () {
        console.log(this.endTime)
        this.setTime()
    },
    methods: {
        setTime: function () {
            var vm = this
            var nowTime = new Date().getTime()
            var endTime = new Date(vm.endTime).getTime()
            var distance = endTime - nowTime
            if (distance <= 0) {
                vm.countDown = [0, 0, 0, 0]
            } else {
                var day = parseInt(distance / (60 * 60 * 24 * 1000))
                var hour = parseInt((distance / (60 * 60 * 1000)) % 24)
                var minu = parseInt((distance / (60 * 1000)) % 60)
                var sec = parseInt((distance / 1000) % 60)
                vm.countDown = [day, vm.dealTimeStr(hour), vm.dealTimeStr(minu), vm.dealTimeStr(sec)]
                vm.timer = setTimeout(vm.setTime, 1000)
            }
        },
        dealTimeStr: function (time) {
            var time = time + ''
            if (time.length === 1) {
                return '0' + time
            } else {
                return time
            }
        }
    },
    destroyed: function () {
        clearTimeout(this.timer)
        this.timer = null
    }
})
new Vue({
    el: '#app',
    data: {
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
        timer: null,
        orderList: [],
        addressCode: '',
        areaList: [],
        currentIndex: -1,
        isLoading: false,
        noMore: false,
        pageNo: 1,
        scroll: null,
        appId: 'wx862c127573da3930',
        secret: '819e0af7cf45dc5a1a0b9701788f84b8',
        memberId: '',
        currentDetail: null,
        isWrite: false,
        editMessage: false,
        cancelMessage: false,
        countDown: [0, 0, 0, 0],
        countTimer: null,
        isOpenWrite: false
    },
    watch: {
        ['questData.inviteCode']: function (val, oldVal) {
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
                    self.getOrderList()
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
        setTime: function () {
            var vm = this
            var nowTime = new Date().getTime()
            var endTime = new Date(vm.currentGoods.endTime).getTime()
            var distance = endTime - nowTime
            if (distance <= 0) {
                vm.countDown = [0, 0, 0, 0]
            } else {
                var day = parseInt(distance / (60 * 60 * 24 * 1000))
                var hour = parseInt((distance / (60 * 60 * 1000)) % 24)
                var minu = parseInt((distance / (60 * 1000)) % 60)
                var sec = parseInt((distance / 1000) % 60)
                vm.countDown = [day, vm.dealTimeStr(hour), vm.dealTimeStr(minu), vm.dealTimeStr(sec)]
                vm.countTimer = setTimeout(vm.setTime, 1000)
            }
        },
        dealTimeStr: function (time) {
            var time = time + ''
            if (time.length === 1) {
                return '0' + time
            } else {
                return time
            }
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
                    if (vm.selectList && vm.selectList.length > 0) {
                        vm.selectList.forEach(function(item){
                            if (item.solicitGoodsId === vm.currentDetail.solicitGoodsId) {
                                vm.currentGoods = item
                            }
                        })
                        if (!vm.currentGoods) {
                            vm.currentGoods = vm.selectList[0]
                        }
                        if (vm.countTimer) {
                            clearTimeout(vm.countTimer)
                            vm.countTimer = null
                        }
                        vm.setTime()
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
                    vm.editMessage = true
                    vm.pageNo = 1
                    vm.getOrderList()
                    setTimeout(function(){
                        vm.editMessage = false
                        vm.isWrite = false
                        clearTimeout(this.countTimer)
                        this.countTimer = null
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
        },
        getOrderList: function () {
            var vm = this
            $.post(URL + '/purchaseOrder/getPurchaseOrderList', {
                memberId: vm.memberId,
                pageNo: vm.pageNo,
                pageSize: 10
            }, function (res) {
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
                            },
                            click: true
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
        closeEdit: function () {
            this.isWrite = false
            clearTimeout(this.countTimer)
            this.countTimer = null
        },
        changeOrder: function (index) {
            this.currentDetail = JSON.parse(JSON.stringify(this.orderList[index]))
            this.currentIndex = index
            this.getLastGoodsInfo()
            this.isWrite = true
        },
        getLastGoodsInfo: function () {
            let vm = this
            $.post(URL + '/purchaseOrder/getPurchaseOrderDetail', {
                memberId: vm.memberId,
                purchaseOrderId: this.currentDetail.purchaseOrderId
            }, function (res) {
                if (res.statusCode === 200) {
                    vm.currentDetail.solicitGoodsId = res.data.solicitGoodsId
                    for (var k in vm.questData) {
                        vm.questData[k] = res.data[k]
                    }
                    let ary = []
                    res.data.solicitGoodsList.forEach(item => {
                        if (item.solicitState === 2) {
                            ary.push(item)
                        }
                    })
                    vm.selectList = ary
                    if (vm.selectList && vm.selectList.length > 0) {
                        vm.selectList.forEach(function(item){
                            if (item.solicitGoodsId === vm.currentDetail.solicitGoodsId) {
                                vm.currentGoods = item
                            }
                        })
                        if (!vm.currentGoods) {
                            vm.currentGoods = vm.selectList[0]
                        }
                        vm.setTime()
                    }
                }
            })
        },
        updateConfirm: function () {
            var vm = this
            if (vm.currentDetail.name === '') {
                layer.open({
                    content: '请输入姓名',
                    btn: '我知道了'
                });
                return
            }
            if (vm.currentDetail.mobile === '') {
                layer.open({
                    content: '请输入电话',
                    btn: '我知道了'
                });
                return
            }
            if (vm.currentDetail.goodsCount === '') {
                layer.open({
                    content: '请输入产品数量',
                    btn: '我知道了'
                });
                return
            }
            if (vm.currentDetail.addressDetail === '') {
                layer.open({
                    content: '请输入所属区域',
                    btn: '我知道了'
                });
                return
            }
            $.post('https://www.topasst.com/solicitWeb/purchaseOrder/updatePurchaseOrder', {
                memberId: vm.memberId,
                purchaseOrderId: vm.currentDetail.purchaseOrderId,
                goodsCount: vm.currentDetail.goodsCount,
                addressDetail: vm.currentDetail.addressDetail,
                name: vm.currentDetail.name,
                mobile:  vm.currentDetail.mobile
            }, function (result) {
                if (result.statusCode === 200) {
                    console.log(vm.orderList[vm.currentIndex])
                    console.log(vm.currentDetail)
                    vm.orderList[vm.currentIndex].goodsCount = vm.currentDetail.goodsCount
                    vm.orderList[vm.currentIndex].addressDetail = vm.currentDetail.addressDetail
                    vm.orderList[vm.currentIndex].name = vm.currentDetail.name
                    vm.orderList[vm.currentIndex].mobile = vm.currentDetail.mobile
                    vm.$nextTick(function () {
                        layer.open({
                            content: '修改成功',
                            btn: '确定'
                        });
                        this.isWrite = false
                    })

                } else {
                    layer.open({
                        content: result.msg,
                        btn: '我知道了'
                    });
                }
            })
        },
        pageBack: function () {
            this.isWrite = false
            clearTimeout(this.countTimer)
            this.countTimer = null
        },
        cancelOrder: function () {
            var vm = this
            $.post('https://www.topasst.com/solicitWeb/purchaseOrder/cancelPurchaseOrder', {
                memberId: vm.memberId,
                purchaseOrderId: vm.currentDetail.purchaseOrderId
            }, function (result) {
                if (result.statusCode === 200) {
                    vm.orderList.splice(vm.currentIndex, 1)
                    vm.cancelMessage = true
                    vm.pageNo = 1
                    vm.getOrderList()
                    setTimeout(function(){
                        vm.cancelMessage = false
                        vm.isWrite = false
                        clearTimeout(this.countTimer)
                        this.countTimer = null
                    }, 1500)
                } else {
                    layer.open({
                        content: result.msg,
                        btn: '我知道了'
                    });
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
