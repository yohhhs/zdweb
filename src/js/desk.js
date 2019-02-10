var URL = 'https://www.topasst.com/web'
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
        countData: {
            haveBuyMemberCount: 0,
            toMonthSaleMoney: 0,
            toWeekSaleMoney: 0,
            toYearSaleMoney: 0
        }
    },
    created: function () {
        this.token = window.sessionStorage.getItem('token')
        if (!this.token) {
            window.location.href = "./index.html"
        } else {
            this.getOrderList()
            this.getAreaList()
            this.getCount()
        }
    },
    methods: {
        changeArea: function (index) {
            if (this.scroll) {
                this.scroll.openPullUp()
                this.scroll.scrollTo(0, 0)
            }
            if (this.addressCode === this.areaList[index].addressCode) {
                this.currentIndex = -1;
                this.addressCode = '';
                this.agentMemberName = '所有区域';
            } else {
                this.currentIndex = index;
                this.addressCode = this.areaList[index].addressCode;
                this.agentMemberName = this.areaList[index].addressName;
            }
            this.pageNo = 1;
            this.isLoading = false;
            this.noMore = false;
            this.getOrderList();
            this.clickMask()
        },
        getCount: function () {
            var vm = this
            $.post(URL + '/managerMember/getManagerMemberData', {
                managerMemberId: vm.token
            }, function (res) {
                if (res.statusCode === 200) {
                    vm.countData = res.data
                }
            })
        },
        getAreaList: function () {
            var vm = this
            $.post(URL + '/managerMember/getManagerMemberAreaList', {
                managerMemberId: vm.token
            }, function (res) {
                if (res.statusCode === 200) {
                    vm.areaList = res.data
                }
            })
        },
        getOrderList: function () {
            var vm = this
            $.post(URL + '/managerMember/getManagerMemberOrderList', {
                managerMemberId: vm.token,
                addressCode: vm.addressCode,
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
            $.post(URL + '/managerMember/getManagerMemberOrderList', {
                managerMemberId: vm.token,
                addressCode: vm.addressCode,
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
        },
        loginOut: function () {
            window.sessionStorage.clear()
            window.location.href = "./index.html"
        },
        changeStatus: function (n) {
            this.agentMemberName = '请选择所属区域'
            this.status = n
            this.getOrderList()
        }
    }
})