layui.define(["jquery", "element", "request", "form", "layer", "laydate"], function (exports) {
    var element = layui.element,
        request = layui.request,
        form = layui.form,
        layer = layui.layer,
        laydate = layui.laydate;

    function init(type, filter) {
        //读取配置
        var ELEM = '.layui-form',
            elemForm = $(ELEM + function () {
                return filter ? ('[lay-filter="' + filter + '"]') : '';
            }()),
            items = {
                hsSelect: function () {
                    //select通过url形式
                    //默认配置
                    // 参数说明
                    // type        类型
                    // value       返回数据取值value的key
                    // text        返回数据取值text的key
                    // data        数据格式的位置
                    // url         地址
                    // selected    默认选中项的id
                    // name        input的name

                    var eles = elemForm.find('input[hs-type=hsSelect]');
                    eles.each(function (index, item) {
                        var ele = $(item);

                        var config = {
                            value: 'id',
                            text: 'name',
                            data: 'result.data',
                        };

                        var opt = $.extend({}, config, {
                            type: ele.attr('hs-type'),
                            value: ele.attr('hs-value'),
                            text: ele.attr('hs-text'),
                            data: ele.attr('hs-data'),
                            name: ele.attr('hs-name'),
                            url: ele.attr('hs-url'),
                            selected: ele.attr('hs-selected'),
                        });
                        opt.options = [];
                        request.get(opt.url, function (e) {
                            // console.log(e);
                            if (e.status === 200) {
                                layui.get(e, opt.data).forEach(function (item) {
                                    opt.options.push({
                                        text: layui.get(item, opt.text),
                                        value: layui.get(item, opt.value)
                                    })
                                });
                                //拼装
                                var formSelect = $('<select></select>').attr('name', opt.name);
                                formSelect.append($('<option></option>'));
                                opt.options.forEach(function (item) {
                                    var optItem = $('<option></option>').text(item.text).attr('value', item.value);
                                    if (opt.selected && opt.selected == item.value) {
                                        optItem.attr('selected', true);
                                    }
                                    formSelect.append(optItem);
                                });
                                ele.after(formSelect).remove();
                                form.render();
                            }
                        });
                    })
                },
                hsSelectTree: function () {
                    //selectTree
                    //默认配置
                    // 参数说明
                    // type        类型
                    // idKey       ID的Key
                    // pIdKey      pId的Key
                    // nameKey     name的Key
                    // data        数据格式的位置
                    // url         地址
                    // selected    默认选中项的id
                    // name        input的name

                    var eles = elemForm.find('input[hs-type=hsSelectTree]');

                    eles.each(function (index, item) {
                        var ele = $(item);
                        var config = {
                            idKey: 'id',
                            pIdKey: 'parentId',
                            nameKey: 'name',
                            data: 'result.data',
                        };

                        var opt = $.extend({}, config, {
                            type: ele.attr('hs-type'),
                            idKey: ele.attr('hs-idKey'),
                            pIdKey: ele.attr('hs-pIdKey'),
                            nameKey: ele.attr('hs-nameKey'),
                            data: ele.attr('hs-data'),
                            name: ele.attr('hs-name'),
                            url: ele.attr('hs-url'),
                            selected: ele.attr('hs-selected'),
                        });
                        opt.options = [];
                        request.get(opt.url, function (e) {
                            if (e.status === 200) {
                                layui.get(e, opt.data).forEach(function (item) {
                                    opt.options.push({
                                        id: layui.get(item, opt.idKey),
                                        name: layui.get(item, opt.nameKey),
                                        pId: layui.get(item, opt.pIdKey),
                                    })
                                });
                                //拼装
                                var treeId = Date.now().toString(32);
                                var treeSelect = $('<div class="hs-tree-select"></div>');
                                var tree = $('<ul class="ztree layui-anim layui-anim-upbit"></ul>').attr('id', treeId).on('click', function () {
                                    return false;
                                });
                                var input = $('<input type="text" placeholder="请选择" readonly class="layui-input">');
                                var inputHide = $('<input type="text" readonly class="input-hidden" style="display: none;">').attr('name', opt.name);
                                var title = $('<div class="hs-select-title"></div>').append(input).append(inputHide).append($('<i class="layui-edge"></i>'));
                                treeSelect.append(title);
                                treeSelect.append(tree);

                                ele.after(treeSelect).remove();

                                title.on('click', function (e) {
                                    if (treeSelect.hasClass('expanded')) {
                                        hideDown();
                                    } else {
                                        showDown();
                                        return false
                                    }
                                });

                                function hideDown() {
                                    treeSelect.removeClass('expanded');
                                }

                                function showDown() {
                                    $('.hs-tree-select').removeClass('expanded');
                                    $('.layui-form-selected').removeClass('layui-form-selected');
                                    treeSelect.addClass('expanded');
                                }

                                $(document).off('click', hideDown).on('click', hideDown);

                                //ztree
                                var setting = {
                                    view: {
                                        selectedMulti: false,
                                        dblClickExpand: false
                                    },
                                    data: {
                                        simpleData: {
                                            enable: true
                                        }
                                    },
                                    callback: {
                                        onClick: zTreeOnClick
                                    }
                                };

                                var treeObj = $.fn.zTree.init(tree, setting, opt.options);

                                treeObj.expandAll(true);

                                function zTreeOnClick(event, treeId, treeNode) {
                                    console.log(treeId);
                                    var title = $('#' + treeId).siblings('.hs-select-title');
                                    title.find('.layui-input').val(treeNode.name);
                                    title.find('.input-hidden').val(treeNode.id);
                                    title.parent().removeClass('expanded');
                                };

                            }
                        });
                    });
                }
            };

        type ? (
            items[type] ? items[type]() : console.log('不支持的' + type + '表单渲染')
        ) : layui.each(items, function (index, item) {
            item();
        });
    }

    //格式化数据
    function hsFormat(data) {
        var fd = {};
        for (x in data) {
            var d = x.indexOf('.');
            var i = x.indexOf('[');
            var sk = x.substring(0, d); // .前面的key
            var lk = x.substring(d + 1, x.length); // .后面的key

            if (d > 0) {
                if (!fd[sk]) {
                    fd[sk] = {};
                }
                fd[sk][lk] = data[x];

                if (lk.indexOf('.') > 0 || lk.indexOf('[') > 0) {
                    fd[sk] = hsFormat(fd[sk]);
                }

            } else if (d < 0 && i > 0) {
                if (fd[x.substring(0, i)]) {
                    fd[x.substring(0, i)] += ',' + x.substring(i + 1, x.length - 1)
                } else {
                    fd[x.substring(0, i)] = x.substring(i + 1, x.length - 1)
                }
            } else {
                fd[x] = data[x]
            }
        }
        return fd;
    }

    function openForm(config) {
        var template = config.template,
            callback = config.onSubmit,
            onOpen = config.onOpen;

        var formId = "f" + new Date().getTime();
        var html = [
            "<form id='" + formId + "' class='layui-form layui-form-pane' onsubmit='return false' action=''>",
            "<div class='layui-row'>",
            template.html,
            "</div>",
            "<div style='width: 200px;margin: auto'>",
            "<button class='layui-btn' lay-submit lay-filter='" + formId + "'>提交</button>",
            "<button type='reset' class='layui-btn layui-btn-danger' lay-reset>重置</button>",
            "</div>",
            "</form>"
        ];
        var index = layer.open({
            type: 1,
            title: "选项卡配置",
            // skin: 'layui-layer-rim', //加上边框
            area: ['50%', '80%'], //宽高
            // btn: "确定",
            content: html.join(""),
            yes: function () {
                return true;
            }
        });
        if (config.data) {
            backfillForm($("#" + formId), config.data);
        }
        form.render();
        element.render();
        $("#" + formId + " .date-picker").each(function () {
            $(this).removeClass(".date-picker")
                .removeAttr("lay-key");
            var fmt = $(this).attr("format");
            fmt = fmt || 'yyyy-MM-dd';
            layui.laydate.render({
                elem: this,
                format: fmt
            });
        });
        form.on('submit(' + formId + ')', function (data) {
            try {
                if (callback && callback(data.field)) {
                    layer.close(index);
                    $("#formId").remove();
                }
            } catch (e) {
                console.error(e);
            }
            return false;
        });

        if (onOpen) {
            onOpen($("#" + formId));
        }
    }

    //回填数据
    function backfillForm(formEle, data) {
        var items = {
            normal: function () {
                var ele = $(formEle).find('textarea[name],input[name][type!=checkbox],select[name]');
                ele.each(function (index, item) {
                    var itemName = $(item).attr('name');
                    var itemValue = layui.get(data, itemName);
                    $(item).attr('type') == 'radio'
                        ? $('input[name=' + itemName + '][value=' + itemValue + ']').attr('checked', true)
                        : $(item).val(itemValue);
                })
            },
            checkbox: function () {
                var ele = $(formEle).find('input[name][type=checkbox]');
                ele.each(function (index, item) {
                    var itemName = $(item).attr('name');
                    var i = itemName.indexOf('[');
                    var itemValue = layui.get(data, itemName.substring(0, i));
                    itemValue.split(',').forEach(function (value) {
                        if (value == itemName.substring(i + 1, itemName.length - 1)) {
                            $(item).attr('checked', true);
                        }
                    })
                })
            }
        };

        layui.each(items, function (index, item) {
            item();
        });
    }


    var e = {
        init: init,
        format: hsFormat,
        openForm: openForm,
        backfill: backfillForm,
    };

    exports("hsForm", e);
});