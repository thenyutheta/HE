(function () {
    'use strict';
    const mapdiv = document.getElementById('map-area-id');
    const gridcfg = document.getElementById('grid-id');
    const hexcfg = document.getElementById('hex-id');
    const terrainid = document.getElementById('terrain_select');
    const valid = document.getElementById('terrain_val_select');
    const save_area = document.getElementById('save-area-id');
    const preview = document.getElementById('preview-id');
    const syringe_btn = document.getElementById('syringe-btn-id');
    const copy_btn = document.getElementById('select-copy-btn');
    const move_btn = document.getElementById('select-move-btn');
    const select_fill_btn = document.getElementById('select-fill-btn');
    const select_btn = document.getElementById('select-mass-btn');
    const sn_btn = document.getElementById('SN-btn-id');
    const header_btn = document.getElementById('header-btn-id');
    const replacebtn = document.getElementById('replace-btn-id');
    const tempElm = document.getElementById('temporary');

    var flag_drag = false;
    var flag_smart = false;
    var flag_grid = true;
    var flag_hex = true;
    var flag_sn = true;
    var flag_header = true;
    var flag_select = true;
    var flag_syringe = true;
    var flag_replace = true;
    var flag_scr = true;
    var flag_copy = true;
    var flag_move = true;

    var hex_n_fl = 0;
    var hex_wid = 0;

    var imgx;
    var imgy;
    var elm;

    var clk_mode = 'edit';
    var user_select;
    var img_back = [];
    var drag_back = [];

    var sel_ref = [];
    var edit_back = [];
    var edit_next = [];
    var select_id = [];

    var isTouchDevice = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    var eventType = (isTouchDevice) ? 'touchend' : 'click';

    var urlopti = new Object;
    var pair = location.search.substring(1).split('&');
    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        urlopti[kv[0]] = decodeURIComponent(kv[1]);
    }

    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
        var bodyStyle, p2rfixStyle;

        document.getElementsByTagName('html')[0].style.height = '100%';

        bodyStyle = document.getElementsByTagName('body')[0].style;
        bodyStyle.height = '100%';
        bodyStyle.overflowY = 'hidden';

        p2rfixStyle = document.getElementById('p2rfix').style;
        p2rfixStyle.height = '100%';
        p2rfixStyle.overflow = 'auto';
    }

    const divcsswid = document.querySelector('body');
    divcsswid.style.setProperty('--width-pos', imgsize * line + 'px');

    mapdiv.style.width = imgsize * line;
    mapdiv.oncontextmenu = () => { return false; }
    /*
    preview.onclick = () => {
        if (confirm('開発中の機能を有効にしますか？動作が不安定になる可能性があります。')) {
            document.getElementById('beta-id').style = '';
        }
    }
    */
    terrainid.onchange = drawpreview;
    valid.onchange = drawpreview;
    $('#' + gridcfg.id).on(eventType, grid_f);
    $('#' + hexcfg.id).on(eventType, hex_f);
    $('#' + sn_btn.id).on(eventType, sn_fun);
    $('#' + header_btn.id).on(eventType, header_fun);
    $('#' + copy_btn.id).on(eventType, select_copy_fun);
    $('#' + move_btn.id).on(eventType, select_move_fun);
    $('#' + select_fill_btn.id).on(eventType, select_fill_fun);
    $('#' + select_btn.id).on(eventType, sel_mass_fun);
    $('#load-btn-id').on(eventType, load_fun);
    $('#sp-toright').on(eventType, () => { window.scrollTo(document.getElementById('toolbox-area-id').getBoundingClientRect().left, 0); });
    $('#sp-toleft').on(eventType, () => { window.scrollTo(0, 0); });
    $('#copy-save-id').on(eventType, () => {
        if (save_area.value.length === 0) { return; }
        var copyFrom = document.createElement('textarea');
        copyFrom.textContent = save_area.value;
        var bodyElm = document.getElementsByTagName('body')[0];
        bodyElm.appendChild(copyFrom);

        copyFrom.select();
        var retVal = document.execCommand('copy');
        bodyElm.removeChild(copyFrom);
        return retVal;
    });
    $('#clear-text-id').on(eventType, () => {
        save_area.value = '';
    });

    $('#maptoimage-id').on(eventType, () => {
        html2canvas(mapdiv).then(canvas => {
            window.open('about:blank').document.write("リロードをすると消えます。ドラッグや右クリックで保存出来ます。<br>" + "<img src='" + canvas.toDataURL() + "'/>");
        });
    });

    $('#flip-select-btn').on(eventType, () => {
        if (flag_select) { return; }
        sel_ref.push(select_id[0]);
        if (sel_ref[0] && sel_ref[1]) {
            get_select_f(sel_ref[0].split('/=/')[0]);
        }
        var map_tile = document.getElementsByName('map-tile');
        for (var temp of map_tile) {
            if (sel_ref[0] && sel_ref[1] && sel_ref[0].split('/=/')[0] === temp.id) {
                continue;
            }
            get_select_f(temp.id);
        }
        if (sel_ref.length === 2) { sel_ref.shift(); }
    });
    $('#all-select-btn').on(eventType, () => {
        if (flag_select) { return; }
        select_id.length = 0;
        var map_tile = document.getElementsByName('map-tile');
        for (var temp of map_tile) {
            get_select_f(temp.id);
        }
    });
    $('#all-cancel-btn').on(eventType, () => {
        if (flag_select) { return; }
        select_id.length = 0;
        var map_tile = document.getElementsByName('map-tile');
        for (var temp of map_tile) {
            creategrid(temp, select_style[0]);
        }
    });

    $('#save-cookie-id').on(eventType, () => {
        if (save_area.value.length === 0) { return; }
        Cookies.set('password', save_area.value, { path: '/', expires: 365 });
    });
    $('#load-cookie-id').on(eventType, () => {
        if (Cookies.get('password')) {
            save_area.value = Cookies.get('password');
        }
    });
    $('#passTourl-id').on(eventType, () => {
        if (save_area.value.length === 0) { alert('パスワードを生成してください。'); return; }
        var local = window.location;
        var url = local.origin;
        var result = url + getDir(local) + 'index.html?pass=' + encodeURIComponent(save_area.value);
        if (Object.keys(urlopti).length) {
            for (var key in urlopti) {
                if (key !== 'pass') {
                    result += '&amp;' + key + '=' + encodeURIComponent(urlopti[key]);
                }
            }
        }
        window.open('about:blanck').document.write('リロードすると消えます。<br><a href=' + result + ' target=_blank style="font-size: 10px">' + result + '</a>');
    });
    function getDir(place, n) {
        return place.pathname.replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((n || 0) + 1) + "}$"), "/");
    }

    if (urlopti['line']) {
        line = parseInt(urlopti['line']);
    }
    if (urlopti['size']) {
        imgsize = parseInt(urlopti['size']);
    }
    if (urlopti['log']) {
        back_max = parseInt(urlopti['log']);
    }
    if (urlopti['theme']) {
        var temp = urlopti['theme'].split(',');
        if (temp[0] && temp[0].length !== 0) { document.body.style.backgroundColor = temp[0].replace('$', '#'); };
        if (temp[1] && temp[1].length !== 0) { document.getElementById('toolbox-area-id').style.backgroundColor = temp[1].replace('$', '#'); };
        if (temp[2] && temp[2].length !== 0) { mapdiv.style.backgroundColor = temp[2].replace('$', '#'); };
    }
    if (urlopti['add_data']) {
        var temp = urlopti['add_data'].split('${a}');
        for (var i of temp) {
            i = i.split(',');
            tempElm.src = i[0].replace('${n}', '@1');
            i[0] = '##add##' + tempElm.src.replace('@1', '#N#');
            terrain_data.push(i)
        }
    }
    if (urlopti['add_press']) {
        var temp = urlopti['add_press'].split('${a}');
        for (var i of temp) {
            i = i.split(',')
            pattern_press.push([i[0], i[1]]);
        }
    }
    if (urlopti['map_img']) {
        mapdiv.style.backgroundImage = 'url(' + urlopti["map_img"] + ')';
    }
    //if (urlopti['']) {}
    for (var dox of $('.select-sub button[value="sub"]')) {
        dox.style.display = "none";
    }
    var i = 0;
    for (var imgdaAr of terrain_data) {
        var creopti = document.createElement('option');
        creopti.value = imgdaAr[0] + '${n}' + i;
        if (imgdaAr[0].indexOf('##add##') > -1) {
            creopti.style.color = '#EE2211';
        }
        creopti.textContent = imgdaAr[1];
        terrainid.appendChild(creopti);
        i++;
    }

    set_values(valid, 1, 99);
    function set_values(elm, min, max) {
        for (var i = min; i <= max; i++) {
            var creopti = document.createElement('option');
            creopti.value = i;
            creopti.textContent = i;
            elm.appendChild(creopti);
        }
    }

    preview.width = imgsize;
    preview.height = imgsize;
    getuser_select();
    preview.src = check_src(user_select);

    //Set map tiles
    var crediv = document.createElement('div');
    crediv.id = 'headerdiv';
    for (var i = 0; i <= line * 2; i++) {
        var creimg = document.createElement('img');
        creimg.src = imgp + 'sys/space.png';
        creimg.alt = 'E.';
        if (i === line * 2) {
            creimg.style.display = 'none';
        }
        creimg.style.display = 'none';
        creimg.id = 'header-' + i;
        creimg.name = 'header-tile';
        creimg.width = imgsize / 2;
        creimg.height = imgsize;
        crediv.appendChild(creimg);
    }
    mapdiv.appendChild(crediv);
    imgx = -1;
    imgy = 0;
    var child_div = document.createElement('div');
    cre_chdiv();
    for (var imgedit = 0; imgedit < line * line; imgedit++) {
        imgx++;
        if (imgedit && imgedit % line === 0) {
            cre_hex_img();
            imgy++;
            imgx = 0;
            var child_div = document.createElement('div');
            cre_chdiv();
        }
        var child_img = document.createElement('img');
        child_img.src = check_src(terrain_data[default_tile][0].replace("#N#", "@" + default_val));
        child_img.alt = 'E.';
        child_img.id = imgx + ' - ' + imgy;
        child_img.name = 'map-tile';
        child_img.title = '( ' + (imgx) + ',' + (imgy) + ' ) ' + img_mess;
        child_img.width = imgsize;
        child_img.height = imgsize;

        child_img.onclick = img_clk_sta;
        child_div.appendChild(child_img);
    }
    cre_hex_img();
    function cre_chdiv() {
        child_div.id = 'line-' + imgy;
        child_div.className = 'child-div-class';
        mapdiv.appendChild(child_div);
    }
    function cre_hex_img() {
        var hex_img = document.createElement('img');
        hex_img.src = imgp + 'sys/space.png';
        hex_img.alt = 'E.';
        hex_img.style.display = 'none';
        hex_img.width = imgsize / 2;
        hex_img.height = imgsize;
        hex_img.id = 'hex-' + imgy;
        if (imgy % 2 === 0) {
            document.getElementById('line-' + imgy).insertBefore(hex_img, document.getElementById('0 - ' + imgy));
        } else {
            document.getElementById('line-' + imgy).appendChild(hex_img);
        }
    }

    if (urlopti['mode']) {
        var temp = urlopti['mode'].split(',');
        for (var i in temp) {
            if (temp[i].length === 0) { continue; }
            default_mode[i] = parseInt(temp[i]);
        }
    }
    if (default_mode[0]) { grid_f(); }
    if (default_mode[1]) { hex_f(); }
    if (default_mode[2]) { sn_fun(); }
    if (default_mode[3]) { header_fun(); }
    if (urlopti['pass']) {
        save_area.value = urlopti['pass'];
        load_fun();
    }
    if (!canset_mode[0]) { gridcfg.style.display = "none" }
    if (!canset_mode[1]) { hexcfg.style.display = "none" }
    if (!canset_mode[2]) { sn_btn.style.display = "none" }
    if (!canset_mode[3]) { header_btn.style.display = "none" }

    const u_a = navigator.userAgent.toUpperCase();
    if (!/Macintosh/i.test(u_a) && !/Windows/i.test(u_a) && (!/X11.+Linux/i.test(u_a))) {
        flag_smart = true;
        document.getElementById('spmess').style.display = '';
        document.getElementById('spmess').style.top = (imgsize + 1) * (line + 1) + 15 + 'px';
    }

    function img_clk_sta() {
        switch (clk_mode) {
            case 'edit':
                edit_f(this.id);
                break;
            case 'syringe':
                syringe_get_fun(this.id);
                break;
            case 'replace':
                var getimgs = document.getElementById(this.id).src
                getuser_select();
                tempElm.src = check_src(user_select);
                img_back.length = 0;
                var map_tile = document.getElementsByName('map-tile');
                for (var temp of map_tile) {
                    if (temp.src === getimgs && temp.src !== tempElm.src) {
                        img_back.push([temp.id, temp.src, check_src(user_select)]);
                        temp.src = check_src(user_select);
                    }
                }
                set_backups();
                replace_b_def();
                break;
            case 'select':
                get_select_f(this.id);
                break;
            case 'copy':
                img_back.length = 0;
                draw_object_f(this.id);
                break;
            case 'move':
                img_back.length = 0;
                try_fill_fun();
                draw_object_f(this.id);
                select_move_fun();
                break;
        }
    }

    $(window).on('beforeunload', function () { return ''; });

    document.onselectstart = () => { return false; };
    document.ondragstart = () => { flag_drag = true; return false; };
    document.ontouchstart = () => { flag_drag = true; return false; };
    document.onmousemove = (e) => {
        if (e.which === 1 && e.clientX * e.clientY > 0) {
            elm = document.elementFromPoint(e.clientX, e.clientY);
            move_f();
        }
    }
    document.ontouchmove = (e) => {
        if (e.changedTouches[0].pageX * e.changedTouches[0].pageY > 0) {
            elm = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
            move_f();
        }
    }
    document.ontouchend = move_end;
    document.onmouseup = move_end;
    function move_f() {
        if (flag_drag) {
            try {
                if (/map-tile/g.test(elm.name)) {
                    if (flag_smart && flag_scr) {
                        $('body').css({ 'position': 'fixed' });
                    }
                    flag_scr = false;
                    document.getElementById(elm.id).onclick();
                }
            }
            catch (e) {
            }
        }
    };
    function move_end() {
        flag_drag = false;
        if (drag_back.length !== 0) {
            var drag_back_clone = $.extend(true, [], drag_back);
            var appendarr = [];
            for (var dbc_arr of drag_back_clone) {
                for (var arr of dbc_arr) {
                    appendarr.push(arr);
                }
            }

            if (!flag_copy) {
                var temp = [];
                for (var arr of appendarr) {
                    var arrnum = temp.findIndex(function (elm) { return elm.indexOf(arr[0]) >= 0; });
                    if (arrnum >= 0) {
                        temp[arrnum][2] = arr[2];
                    } else {
                        temp.push(arr);
                    }
                }
                appendarr = $.extend(true, [], temp)
            }

            edit_back.push($.extend(true, [], appendarr));
            edit_next.length = 0;
            if (edit_back.length > back_max) {
                edit_back.shift();
            }
        }
        drag_back.length = 0;
        if (flag_smart) {
            $('body').css({ 'position': 'absolute', 'left': '-8px', 'top': '-8px' });
        }
        flag_scr = true;
    }

    function sn_fun() {
        if (flag_sn) {
            sn_btn.textContent = '座標マスを無効にする';
            for (var i = 0; i <= sn_max; i++) {
                if (document.getElementById('hex-' + i)) {
                    document.getElementById('hex-' + i).src = imgp + 'sys/space' + i + '.png';
                }
            }
            var n = 0;
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (n > sn_max) {
                    break;
                }
                if (i % 2 === 1) {
                    document.getElementById('header-' + i).src = imgp + 'sys/space' + n + '.png';
                    n++;
                }
            }
        } else {
            sn_btn.textContent = '座標マスを有効にする';
            for (var i = 0; i <= sn_max; i++) {
                if (document.getElementById('hex-' + i)) {
                    document.getElementById('hex-' + i).src = imgp + 'sys/space.png';
                }
            }
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (n > sn_max) {
                    break;
                }
                if (i % 2 === 1) {
                    document.getElementById('header-' + i).src = imgp + 'sys/space.png';
                }
            }
        }
        flag_sn = !flag_sn;
    }

    function header_fun() {
        if (flag_header) {
            header_btn.textContent = 'ヘッダーを無効にする';
            var header_tile = document.getElementsByName('header-tile');
            for (var temp of header_tile) {
                temp.style.display = '';
            }
            if (!hex_n_fl) { document.getElementById('header-' + line * 2).style.display = 'none'; }
        } else {
            header_btn.textContent = 'ヘッダーを有効にする';
            var header_tile = document.getElementsByName('header-tile');
            for (var temp of header_tile) {
                temp.style.display = 'none';
            }
        }
        flag_header = !flag_header;
    }

    function check_src(src) {
        if (src.indexOf('##add##') === -1) {
            return imgp + src + imgext;
        } else {
            return src.replace('##add##', '');
        }
    }

    function drawpreview() {
        getuser_select();
        preview.src = check_src(user_select);
    }

    function edit_f(id) {
        getuser_select();
        img_back.length = 0;
        imgx = id.split(' - ')[0];
        imgy = id.split(' - ')[1];
        var img_corner;
        var draw_num = 1;
        var pen_size;
        if (hex_n_fl) {
            //hex
            pen_size = parseInt(document.getElementById('hex_pen_size_select').value);
        } else {
            //normal
            pen_size = parseInt(document.getElementById('pen_size_select').value);
            img_corner = (pen_size - 1) / 2;
        }
        if (pen_size === 1) {
            if (imgsrc_judge(imgx + ' - ' + imgy)) {
                img_back.push([id, document.getElementById(id).src, check_src(user_select)]);
                document.getElementById(id).src = check_src(user_select);
            }
        } else if (!hex_n_fl) {
            imgx -= img_corner;
            imgy -= img_corner;
            for (var i = 1; i <= pen_size * pen_size; i++) {
                if ((imgx >= 0 && imgy >= 0) && (imgx < line && imgy < line)) {
                    if (imgsrc_judge(imgx + ' - ' + imgy)) {
                        img_back.push([(imgx + ' - ' + imgy), document.getElementById(imgx + ' - ' + imgy).src, check_src(user_select)]);
                        document.getElementById(imgx + ' - ' + imgy).src = check_src(user_select);
                    }
                }
                if (draw_num + 1 > pen_size) {
                    draw_num = 1;
                    imgx -= (pen_size - 1);
                    imgy++;
                } else {
                    draw_num++;
                    imgx++;
                }
            }
        } else {
            var hexline = pen_size;
            var xcount = 1;
            var flag_up = true;
            var hex_type;
            if (id.split(' - ')[1] % 2 === 0) {
                hex_type = 1;
            } else {
                hex_type = 0;
            }
            imgx = imgx - Math.floor((pen_size - hex_type) / 2);
            imgy = imgy - (pen_size - 1);
            for (var i = 1; i <= allhex_f(pen_size); i++) {
                if ((imgx >= 0 && imgy >= 0) && (imgx < line && imgy < line)) {
                    if (imgsrc_judge(imgx + ' - ' + imgy)) {
                        img_back.push([(imgx + ' - ' + imgy), document.getElementById(imgx + ' - ' + imgy).src, check_src(user_select)]);
                        document.getElementById(imgx + ' - ' + imgy).src = check_src(user_select);
                    }
                }
                if (draw_num + 1 > hexline) {
                    if (hexline < pen_size * 2 - 1 && flag_up) {
                        hexline++;
                        imgx = (parseInt(id.split(' - ')[0]) - xcount) - Math.floor((pen_size - hex_type - xcount) / 2);
                        xcount++;
                        if (xcount === pen_size) {
                            xcount = pen_size - 2;
                        }
                    } else {
                        flag_up = false;
                        hexline--;
                        imgx = (parseInt(id.split(' - ')[0]) - xcount) - Math.floor((pen_size - hex_type - xcount) / 2);
                        xcount--;
                    }
                    draw_num = 1;
                    imgy++;
                } else {
                    draw_num++;
                    imgx++;
                }
            }
        }
        set_backups();
    }
    function allhex_f(size_num) {
        var result = 1;
        var n = 6;
        for (var i = 1; i < size_num; i++) {
            result += n;
            n += 6;
        }
        return result;
    }
    function imgsrc_judge(id) {
        var getimgs = document.getElementById(id).src;
        tempElm.src = check_src(user_select);
        if (getimgs === tempElm.src) {
            return false;
        } else {
            return true;
        }
    }
    function getuser_select() {
        user_select = terrainid.value.split('${n}')[0];
        var terrarrn = terrainid.value.split('${n}')[1];
        var select_val = valid.value;
        var valmax = 100;
        if (terrain_data[terrarrn].length > 3) {
            valmax = terrain_data[terrarrn].length - 2;
        }
        if (select_val > valmax) {
            select_val = 1;
        }
        user_select = user_select.replace('#N#', '@' + select_val);
    }
    function set_backups() {
        var img_back_clone = $.extend(true, [], img_back);
        if (img_back_clone.length !== 0) {
            if (flag_drag) {
                drag_back.push(img_back_clone);
            } else {
                edit_back.push(img_back_clone);
            }
            edit_next.length = 0;
        }
        if (edit_back.length > back_max) {
            edit_back.shift();
        }
    }

    function hex_f() {
        if (!flag_select) {
            alert('選択を確定してください。');
            return;
        }
        if (flag_hex) {
            hexcfg.textContent = 'マスをsquareにする';
            hex_wid = imgsize / 2;
            hex_n_fl = 1;
            for (var i = 0; i < line; i++) {
                document.getElementById('hex-' + i).style.display = '';
            }
            if (!flag_header) { document.getElementById('header-' + line * 2).style.display = ''; }
            document.getElementById('hex-pen-id').className = 'main-pen-class';
            document.getElementById('n-pen-id').className = 'sub-pen-class';
        } else {
            hexcfg.textContent = 'マスをhexにする';
            hex_wid = 0;
            hex_n_fl = 0;
            for (var i = 0; i < line; i++) {
                document.getElementById('hex-' + i).style.display = 'none';
            }
            if (!flag_header) { document.getElementById('header-' + line * 2).style.display = 'none'; }
            document.getElementById('hex-pen-id').className = 'sub-pen-class';
            document.getElementById('n-pen-id').className = 'main-pen-class';
        }
        if (document.getElementById('1 - 1').style.borderTop === grid_style) {
            divcsswid.style.setProperty('--width-pos', imgsize * line + line * 2 + hex_wid + 2 + 'px');
        } else {
            divcsswid.style.setProperty('--width-pos', imgsize * line + hex_wid + 'px');
        }
        flag_hex = !flag_hex;
    }

    function grid_f() {
        if (!flag_select) {
            alert('選択を確定してください。');
            return;
        }
        if (flag_grid) {
            divcsswid.style.setProperty('--width-pos', imgsize * line + line * 2 + hex_wid + 2 + 'px');
            var map_tile = document.getElementsByName('map-tile');
            for (var temp of map_tile) {
                creategrid(temp, grid_style);
            }
            for (var i = 0; i < line; i++) {
                creategrid(document.getElementById('hex-' + i), grid_style);
            }
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (i % 2 === 0) {
                    document.getElementById('header-' + i).style.borderRight = grid_style;
                    document.getElementById('header-' + i).style.borderLeft = grid_style;
                }
            }
            gridcfg.textContent = 'グリッドをoffにする';
        } else {
            divcsswid.style.setProperty('--width-pos', imgsize * line + hex_wid + 'px');
            var map_tile = document.getElementsByName('map-tile');
            for (var temp of map_tile) {
                temp.style.border = 'none';
            }
            for (var i = 0; i < line; i++) {
                document.getElementById('hex-' + i).style.border = 'none';
            }
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (i % 2 === 0) {
                    document.getElementById('header-' + i).style.border = 'none';
                }
            }
            gridcfg.textContent = 'グリッドをonにする';
        }
        flag_grid = !flag_grid;
    }
    function creategrid(elm, style) {
        elm.style.borderRight = style;
        elm.style.borderLeft = style;
        elm.style.borderTop = style;
    }

    var flag_grid_back = false;
    function sel_mass_fun() {
        if (!sel_f_alert('select')) { return; }
        if (flag_select) {
            select_id.length = 0;
            if (!flag_grid) {
                flag_grid_back = true;
            } else {
                flag_grid_back = false;
            }
            divcsswid.style.setProperty('--width-pos', imgsize * line + line * 2 + hex_wid + 2 + 'px');
            var map_tile = document.getElementsByName('map-tile');
            for (var temp of map_tile) {
                creategrid(temp, select_style[0]);
            }
            if (hex_n_fl) {
                for (var i = 0; i < line; i++) {
                    creategrid(document.getElementById('hex-' + i), grid_style);
                }
            }
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (i % 2 === 0) {
                    document.getElementById('header-' + i).style.borderRight = grid_style;
                    document.getElementById('header-' + i).style.borderLeft = grid_style;
                }
            }
            document.getElementById('flip-select-btn').style.display = '';
            document.getElementById('all-select-btn').style.display = '';
            document.getElementById('all-cancel-btn').style.display = '';
            select_btn.textContent = '選択を確定';
            clk_mode = 'select';
        } else {
            if (select_id.length) {
                select_id.push(hex_n_fl);
            }
            if (!flag_grid_back) {
                divcsswid.style.setProperty('--width-pos', imgsize * line + hex_wid + 'px');
                var map_tile = document.getElementsByName('map-tile');
                for (var temp of map_tile) {
                    temp.style.border = 'none';
                }
                if (hex_n_fl) {
                    for (var i = 0; i < line; i++) {
                        document.getElementById('hex-' + i).style.border = 'none';
                    }
                }
                for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                    if (i % 2 === 0) {
                        document.getElementById('header-' + i).style.border = 'none';
                    }
                }
            } else {
                var map_tile = document.getElementsByName('map-tile');
                for (var temp of map_tile) {
                    creategrid(temp, grid_style);
                }
                if (hex_n_fl) {
                    for (var i = 0; i < line; i++) {
                        creategrid(document.getElementById('hex-' + i), grid_style);
                    }
                }
                for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                    if (i % 2 === 0) {
                        document.getElementById('header-' + i).style.borderRight = grid_style;
                        document.getElementById('header-' + i).style.borderLeft = grid_style;
                    }
                }
            }
            document.getElementById('flip-select-btn').style.display = 'none';
            document.getElementById('all-select-btn').style.display = 'none';
            document.getElementById('all-cancel-btn').style.display = 'none';
            select_btn.textContent = 'マスを選択';
            clk_mode = 'edit';
        }
        flag_select = !flag_select;
    }
    function get_select_f(id) {
        try {
            if (/map-tile/g.test(document.getElementById(id).name)) {
                if (select_id.length === 0) {
                    select_id.push(id + '/=/' + document.getElementById(id).src);
                    creategrid(document.getElementById(id), select_style[2]);
                } else if (select_id.indexOf(id + '/=/' + document.getElementById(id).src) === - 1) {
                    select_id.push(id + '/=/' + document.getElementById(id).src);
                    creategrid(document.getElementById(id), select_style[1]);
                } else {
                    select_id.splice(select_id.indexOf(id + '/=/' + document.getElementById(id).src), 1);
                    creategrid(document.getElementById(id), select_style[0]);
                    creategrid(document.getElementById(select_id[0].split('/=/')[0]), select_style[2]);
                }
            }
        }
        catch (e) {
        }
    }

    $('#' + syringe_btn.id).on(eventType, () => {
        if (!sel_f_alert('syringe')) { return; }
        if (flag_syringe) {
            clk_mode = 'syringe';
            syringe_btn.textContent = '取得したい地形を選択or[キャンセル]';
            flag_syringe = false;
        } else {
            syringe_b_def();
        }
    });
    function syringe_get_fun(id) {
        try {
            if (/map-tile/g.test(document.getElementById(id).name)) {
                var getimgs = document.getElementById(id).src;
                if (getimgs.search(imgp) >= 0) {
                    getimgs = getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0];
                } else {
                    getimgs = '##add##' + getimgs;
                }
                if ((/@\d+/).test(getimgs)) {
                    valid.value = getimgs.match(/@\d+/g)[0].substr(1);
                }
                getimgs = getimgs.replace(/@\d+/g, '#N#');
                terrainid.value = getimgs + '${n}' + terrain_data.findIndex(function (elm) { return elm.indexOf(getimgs) >= 0; });
                drawpreview();
                syringe_b_def();
            }
        }
        catch (e) {
        }
    }
    function syringe_b_def() {
        clk_mode = 'edit';
        syringe_btn.textContent = 'スポイトを使う';
        flag_syringe = true;
    }

    $('#' + replacebtn.id).on(eventType, () => {
        if (!sel_f_alert('replace')) { return; }
        if (flag_replace) {
            clk_mode = 'replace';
            replacebtn.textContent = '置換したい地形を選択or[キャンセル]';
            flag_replace = false;
        } else {
            replace_b_def();
        }
    });
    function replace_b_def() {
        clk_mode = 'edit';
        replacebtn.textContent = '置換する';
        flag_replace = true;
    }

    function select_copy_fun() {
        if (!sel_f_alert('copy')) { return; }
        if (select_id.length === 0) {
            alert('選択されていません。');
            return;
        }
        if (flag_copy) {
            clk_mode = 'copy';
            copy_btn.textContent = 'コピー先の基準点を選択or[終了]';
            flag_copy = false;
        } else {
            clk_mode = 'edit';
            copy_btn.textContent = '選択された地形をコピー';
            flag_copy = true;
        }
    }

    function draw_object_f(id) {
        var x_diff = parseInt(id.split(' - ')[0]) - parseInt(select_id[0].split('/=/')[0].split(' - ')[0]);
        var y_diff = parseInt(id.split(' - ')[1]) - parseInt(select_id[0].split('/=/')[0].split(' - ')[1]);
        if (select_id[select_id.length - 1] === 0) {
            for (var arr of select_id) {
                if (arr === 0 || arr === 1) {
                    break;
                }
                imgx = parseInt(arr.split('/=/')[0].split(' - ')[0]) + x_diff;
                imgy = parseInt(arr.split('/=/')[0].split(' - ')[1]) + y_diff;
                var copysrc = arr.split('/=/')[1];
                try {
                    if (document.getElementById(imgx + ' - ' + imgy).src !== copysrc) {
                        img_back.push([imgx + ' - ' + imgy, document.getElementById(imgx + ' - ' + imgy).src, copysrc]);
                        document.getElementById(imgx + ' - ' + imgy).src = copysrc;
                    }
                } catch (e) {
                }
            }
        } else {
            var hexpattern = 0;
            imgy = parseInt(select_id[0].split('/=/')[0].split(' - ')[1]);
            if (imgy % 2 === 1 && (imgy + y_diff) % 2 === 0) {
                hexpattern = 1;
            } else if (imgy % 2 === 0 && (imgy + y_diff) % 2 === 1) {
                hexpattern = 2;
            }
            for (var arr of select_id) {
                if (arr === 0 || arr === 1) {
                    break;
                }
                imgx = parseInt(arr.split('/=/')[0].split(' - ')[0]) + x_diff;
                imgy = parseInt(arr.split('/=/')[0].split(' - ')[1]) + y_diff;
                //hex補正
                if (hexpattern === 1 && imgy % 2 === 1) {
                    imgx++;
                } else if (hexpattern === 2 && imgy % 2 === 0) {
                    imgx--;
                }
                var copysrc = arr.split('/=/')[1];
                try {
                    if (document.getElementById(imgx + ' - ' + imgy).src !== copysrc) {
                        img_back.push([imgx + ' - ' + imgy, document.getElementById(imgx + ' - ' + imgy).src, copysrc]);
                        document.getElementById(imgx + ' - ' + imgy).src = copysrc;
                    }
                }
                catch (e) {
                }
            }
        }
        set_backups();
    }

    function select_move_fun() {
        if (!sel_f_alert('move')) { return; }
        if (select_id.length === 0) {
            alert('選択されていません。');
            return;
        }
        if (flag_move) {
            clk_mode = 'move';
            move_btn.textContent = '移動先の基準点を選択or[終了]';
            flag_move = false;
        } else {
            clk_mode = 'edit';
            move_btn.textContent = '選択された地形を移動';
            flag_move = true;
        }
    }

    function select_fill_fun() {
        if (!sel_f_alert('')) { return; }
        if (select_id.length === 0) {
            alert('選択されていません。');
            return;
        }
        img_back.length = 0;
        try_fill_fun();
        set_backups();
    }

    function try_fill_fun() {
        getuser_select();
        for (var arr of select_id) {
            if (arr === 0 || arr === 1) {
                break;
            }
            var imgid = arr.split('/=/')[0];
            var getimgs = document.getElementById(imgid).src;
            tempElm.src = check_src(user_select);
            if (getimgs !== tempElm.src) {
                img_back.push([imgid, document.getElementById(imgid).src, check_src(user_select)]);
                document.getElementById(imgid).src = check_src(user_select);
            }
        }
    }

    function sel_f_alert(no_check) {
        var temp = true;
        var alert_flags = [['syringe', flag_syringe], ['select', flag_select], ['copy', flag_copy],
        /*              */['move', flag_move], ['replace', flag_replace]];
        for (var arr of alert_flags) {
            if (arr[0] !== no_check && !arr[1]) {
                alert('[ ' + arr[0] + ' ]を終了してください。');
                temp = false;
                break;
            }
        }
        return temp;
    }
    $('#back-id').on(eventType, () => {
        if (edit_back.length === 0) { return; }
        for (var id_array of edit_back[edit_back.length - 1]) {
            document.getElementById(id_array[0]).src = id_array[1];
        }
        edit_next.push(edit_back[edit_back.length - 1]);
        edit_back.pop();
    });
    $('#next-id').on(eventType, () => {
        if (edit_next.length === 0) { return; }
        for (var id_array of edit_next[edit_next.length - 1]) {
            document.getElementById(id_array[0]).src = id_array[2];
        }
        edit_back.push(edit_next[edit_next.length - 1]);
        edit_next.pop();
    });
    $('#save-btn-id').on(eventType, () => {
        var save_data = "";
        var password = "";
        var map_tile = document.getElementsByName('map-tile');
        for (var temp of map_tile) {
            var getimgs = temp.src;
            var getimgname = getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0];
            var chxtemp = imgstr + '.+' + imgstr;
            var reg = new RegExp(chxtemp);
            if (getimgname.search(reg) > -1) {
                save_data += getimgname + ',';
            } else {
                save_data += temp.src + ',';
            }
        }
        save_data = save_data.split(',');
        save_data.pop();
        var sv_arr = [];
        var i = 0;
        for (var savearr of save_data) {
            sv_arr[i] = terrain_data[0][2];
            for (var imgdaAr of terrain_data) {
                if (savearr.search(/@\d+/) > - 1) {
                    if (String(decodeURIComponent(savearr.replace(/@\d+/g, '#N#'))) === String(decodeURIComponent(imgdaAr[0].replace('##add##', '')))) {
                        var imgval = parseInt(savearr.split('.')[0].substr(savearr.search(/@\d+/) + 1).replace(imgstr, ''));
                        sv_arr[i] = imgdaAr[1 + imgval];
                        break;
                    }
                } else {
                    if (savearr === imgdaAr[0].replace('##add##', '')) {
                        sv_arr[i] = imgdaAr[2];
                        break;
                    }
                }
            }
            i++;
        }
        for (var ar of sv_arr) {
            password += ar;
        }
        for (var prsdaAr of pattern_press) {
            var savereg = new RegExp(prsdaAr[0], 'g');
            password = password.replace(savereg, prsdaAr[1]);
        }
        if (hex_n_fl) {
            password += '<'; //hex
        } else {
            password += '>'; //normal
        }
        save_area.value = password;
    });

    function load_fun() {
        if (save_area.value.length === 0) { return; }
        var password = save_area.value;
        var save_data = [];
        password = password.replace(/\s/g, '');
        save_area.value = password;
        for (var prsdaAr of pattern_press) {
            var savereg = new RegExp(prsdaAr[1], 'g');
            password = password.replace(savereg, prsdaAr[0]);
        }
        if (password.indexOf('<') === -1 && password.indexOf('>') === -1) {
            alert('データが破損しています。 Error : マスタイプを識別する文字が含まれていません。');
            return;
        }
        if (password.length !== line * line + 1) {
            alert('データが破損しています。 Error : データの長さが間違っています。 ( ' + password.length + ' / ' + (line * line + 1) + ' )');
            return;
        }
        password = password.replace(/(.)(?=.)/g, '$1,').split(',');
        if (password[password.length - 1] === '<' && !hex_n_fl) {
            flag_hex = true;
            hex_f();
        } else if (password[password.length - 1] === '>' && hex_n_fl) {
            flag_hex = false;
            hex_f();
        }
        password.pop();
        var i = 0;
        for (var passarr of password) {
            save_data[i] = terrain_data[0][0];
            for (var imgdaAr of terrain_data) {
                for (var iar = 2; iar <= imgdaAr.length - 1; iar++) {
                    if (passarr === imgdaAr[iar]) {
                        if (imgdaAr[0].search('#N#') !== -1) {
                            save_data[i] = imgdaAr[0].replace('#N#', '@' + (iar - 1));
                        } else {
                            save_data[i] = imgdaAr[0];
                        }
                        break;
                    }
                }
            }
            i++;
        }
        var i = 0;
        img_back.length = 0;
        var map_tile = document.getElementsByName('map-tile');
        for (var temp of map_tile) {
            user_select = save_data[i];
            if (imgsrc_judge(temp.id)) {
                img_back.push([temp.id, temp.src, check_src(save_data[i])]);
                temp.src = check_src(save_data[i]);
            }
            i++;
        }
        set_backups();
    }
})();