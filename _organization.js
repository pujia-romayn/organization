
var Organization = function (element, options) {

    this.element = $(element);
    this.options = $.extend(true, {}, this.options, options);
    this.init();

}
Organization.prototype = {
    options: {
        mode: "vertical", //方向
        width: null,     //容器宽度
        height: null,
        levelHeight: 80,   //每层默认高度
        top: 10
    },
    init: function () {
        var me = this,
            el = me.element,
            opts = me.options,
            level = 0;

        opts.width = el.width();
        opts.height = el.height();

        if (!opts.data || opts.data.length == 0) throw new Error("数据不存在或未空");
        else {
            opts.dataMode = me.changeDataMode(opts.data);
        }
        me.createEL();
        $(window).resize(function () {
            me.resize();
        });
    },
    resize: function () {
        var me = this,
            el = me.element,
            opts = me.options,
            level = 0;

        el.empty();

        opts.width = el.width();
        opts.height = el.height();
        me.createEL();
    },
    changeDataMode: function (data) {
        var dataMode = {};
        var level = 0;

        function loop(data, level) {

            data.forEach(function (item, i) {

                if (!dataMode[level]) { dataMode[level] = [] }
                item.level = level;
                dataMode[level].push(item);

                if (item.children) {
                    level++
                    loop(item.children, level);
                    level--;
                }
            })
        }
        loop(data, level);

        return dataMode;
    },

    createEL: function () {
        var me = this,
            el = me.element,
            opts = me.options,
            data = opts.data,
            html = '';

        function loop(arr, ptop, pleft, pheight, pwidth) {

            arr.forEach(function (item, i) {
                var itemInfo = me.createItem(item, i, ptop, pleft, pheight, pwidth);
                html += itemInfo.html;
                if (item.children) {
                    loop(item.children, itemInfo.top, itemInfo.left, itemInfo.height, itemInfo.width);
                }
            })
        }

        loop(data);

        el.html($(el).html() + html);
    },
    createItem: function (item, _index, ptop, pleft, pheight, pwidth) {
        var me = this;
        var thisLevelHeight = 0;

        ptop = ptop || 0;
        pleft = pleft || 0;
        pheight = pheight || 0;
        pwidth = pwidth || 0;

        var me = this,
            el = me.element,
            opts = me.options,
            dataMode = opts.dataMode;

        var mode = item.mode || opts.mode;

        var s = '';

        var box = document.createElement("div");
        box.id = item.id;
        box.className += mode + " node default ";

        if (item.cls) {
            box.className += item.cls;
        }

        var node = document.createElement("a");
        node.className = "node-text";
        node.innerText = item.name;

        box.appendChild(node);

        $(el)[0].appendChild(box);

        var width = $(box).width(), height = $(box).height();
        thisLevelHeight = Math.max(thisLevelHeight, height);

        //设置位置
        if (item.level == 0) {
            var top = opts.top + ptop + pheight;

        }
        else {
            var top = ptop + pheight + opts.levelHeight;

        }
        var levelLength = dataMode[item.level].length;
        var unitWidth = opts.width / (levelLength + 1);
        var index = dataMode[item.level].indexOf(item);

        //不能按照平分规则
        var left = unitWidth * (index + 1) - width / 2;


        box.style.top = top + "px";
        box.style.left = left + "px";

        //创建自身线条
        if (ptop && pleft) {
            //定义相连上下部分线高 levelHeight决定
            const plineheight = me.options.levelHeight / 2;
            const clineheight = me.options.levelHeight / 2;

            var midLeft = pleft < left ? pleft + pwidth / 2 : left + width / 2;
            var midWidth = (Math.abs((left + width / 2) - (pleft + pwidth / 2)));

            s += '<div class="connector" style="top:' + (ptop + pheight) + 'px;left:' + (pleft + pwidth / 2) + 'px;height:' + plineheight + 'px"></div>' //父线高度固定
            s += '<div class="connector" style="top:' + (ptop + pheight + plineheight) + 'px;left:' + midLeft + 'px;width:' + midWidth + 'px"></div>'
            s += '<div class="connector" style="top:' + (top - clineheight) + 'px;left:' + (left + width / 2) + 'px;height:' + clineheight + 'px"></div>' //子线高度固定



        }
        return { html: s, top: top, left: left, width: width, height: height };
    },


};

$.fn.organization = function (options) {

    var isSTR = typeof options == "string",
        args, ret;

    if (isSTR) {
        args = $.makeArray(arguments)
        args.splice(0, 1);
    }

    var name = "organization",
        type = Organization;

    var jq = this.each(function () {
        var ui = $.data(this, name);

        if (!ui) {
            ui = new type(this, options);
            $.data(this, name, ui);
        }
        if (isSTR) {
            ret = ui[options].apply(ui, args);
        }
    });

    return isSTR ? ret : jq;
};

