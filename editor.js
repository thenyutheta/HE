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
    const select_btn = document.getElementById('select-mass-btn');
    const sn_btn = document.getElementById('SN-btn-id');

    var flag_drag = false;
    var flag_smart = false;
    var flag_grid = true;
    var flag_hex = true;
    var flag_sn = true;
    var flag_select = true;
    var flag_syringe = true;
    var flag_scr = true
    var flag_copy = true;
    var flag_move = true;
    var judge = true;

    var check_hex = 0;
    var hex_wid = 0;

    var imgx;
    var imgy;
    var elm;

    var clk_mode;
    var user_select;
    var img_back = [];
    var drag_back = [];

    var edit_back = [];
    var edit_next = [];
    var pass_back = '';
    var select_id = [];

    var isTouchDevice = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    var eventType = (isTouchDevice) ? 'touchend' : 'click';

    if( window.navigator.userAgent.toLowerCase().indexOf('chrome') != -1 ){
        var bodyStyle, p2rfixStyle;
    
        document.getElementsByTagName('html')[0].style.height='100%';
    
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

    preview.width = imgsize;
    preview.height = imgsize;
    /*
    preview.onclick = () => {
        if (confirm('開発中の機能を有効にしますか？動作が不安定になる可能性があります。。。')) {
            document.getElementById('beta-id').style = '';
        }
    }
    */
    $('#' + gridcfg.id).on(eventType, grid_f);
    $('#' + hexcfg.id).on(eventType, hex_f);
    $('#' + terrainid.id).on(eventType, drawpreview);
    $('#' + valid.id).on(eventType, drawpreview);
    $('#' + syringe_btn.id).on(eventType, syringe_fun);
    $('#' + copy_btn.id).on(eventType, select_copy_fun);
    $('#' + move_btn.id).on(eventType, select_move_fun);
    $('#' + select_btn.id).on(eventType, sel_mass_fun);
    $('#' + sn_btn.id).on(eventType, sn_fun);
    $('#back-id').on(eventType, edit_back_fun);
    $('#next-id').on(eventType, edit_next_fun);
    $('#save-btn-id').on(eventType, save_fun);
    $('#load-btn-id').on(eventType, load_fun);

    $('#copy-save-id').on(eventType, () => {
        if (save_area.value.length === 0) {
            return;
        }
        copyTextToClipboard(save_area.value);
    });
    $('#clear-text-id').on(eventType, () => {
        save_area.value = '';
    });

    $('#maptoimage-id').on(eventType, () => {
        html2canvas(mapdiv).then(canvas => {
            window.open('about:blank').document.write("リロードをすると消えます。ドラッグや右クリックで保存出来ます。<br>" + "<img src='" + canvas.toDataURL() + "'/>");
        });
    });

    $('#save-cookie-id').on(eventType, () => {
        if (save_area.value.length === 0) {
            return;
        }
        Cookies.set('password', save_area.value, { path: '/', expires: 365 });
    });
    $('#load-cookie-id').on(eventType, () => {
        if (Cookies.get('password')) {
            save_area.value = Cookies.get('password');
        }
    });

    var i = 0;
    for (var imgdaAr of terrain_data) {
        var creopti = document.createElement('option');
        creopti.value = imgdaAr[0] + '/' + i;
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

    var crediv = document.createElement('div');
    crediv.id = 'headerdiv';
    for (var i = 0; i < line * 2; i++) {
        var creimg = document.createElement('img');
        creimg.src = imgp + 'sys/space.png';
        creimg.alt = 'E.';
        creimg.id = 'header-' + i;
        creimg.width = imgsize / 2;
        creimg.height = imgsize;
        crediv.appendChild(creimg);
    }
    mapdiv.appendChild(crediv);

    imgx = 0;
    imgy = 1;
    var child_div = document.createElement('div');
    child_div.id = 'line-' + imgy;
    child_div.className = 'child-div-class';
    mapdiv.appendChild(child_div);
    for (var imgedit = 0; imgedit < line * line; imgedit++) {
        imgx++;
        if (imgedit && imgedit % line === 0) {
            imgy++;
            imgx = 1;
            var child_div = document.createElement('div');
            child_div.id = 'line-' + imgy;
            child_div.className = 'child-div-class';
            mapdiv.appendChild(child_div);
        }
        var child_img = document.createElement('img');
        child_img.src = imgp + terrain_data[1][0] + '.png';
        child_img.alt = 'E.';
        child_img.id = imgx + ' - ' + imgy;
        child_img.name = 'map-tile'
        child_img.title = '( ' + (imgx - 1) + ',' + (imgy - 1) + ' ) ' + img_mess[0];
        child_img.width = imgsize;
        child_img.height = imgsize;

        child_img.onclick = img_clk_sta;
        child_div.appendChild(child_img);
    }
    clk_mode = 'edit';

    if (default_mode[0]) { grid_f(); }
    if (default_mode[1]) { hex_f(); }
    if (default_mode[2]) { sn_fun(); }

    const u_a = navigator.userAgent.toUpperCase();
    if (!/Macintosh/i.test(u_a) && !/Windows/i.test(u_a) && (!/X11.+Linux/i.test(u_a))) {
        flag_smart = true;
        document.getElementById('spmess').style.display = '';
        document.getElementById('spmess').style.top = (imgsize + 2) * (line + 1) + 10 + 'px';
    }

    function img_clk_sta() {
        switch (clk_mode) {
            case 'edit':
                edit_f(this.id);
                break;
            case 'syringe':
                syringe_get_fun(this.id);
                break;
            case 'select':
                get_select_f(this.id);
                break;
            case 'copy':
                img_back.length = 0;
                draw_object_f(this.id);
                break;
            case 'move':
                try_move_fun(this.id);
                break;
        }
    }

    $(window).on('beforeunload', function () {
        return '';
    });

    document.onselectstart = () => { return false; };
    document.ondragstart = () => { flag_drag = true; return false; };
    document.ontouchstart = () => { flag_drag = true; return false; };
    document.onmousemove = (e) => {
        if (e.which === 1 && e.clientX * e.clientY > 0) {
            elm = document.elementFromPoint(e.clientX, e.clientY);
            move_f();
        }
    }
 
    $(document).on('touchmove', (e) => {
        if (e.changedTouches[0].pageX * e.changedTouches[0].pageY > 0) {
            elm = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
            move_f();
        }
    })
    document.ontouchend = move_end;
    document.onmouseup = move_end;
    function move_f() {
        if (flag_drag) {
            try {
                if (/map-tile/g.test(elm.name)) {
                    if (flag_smart && flag_scr) {
                        $('body').css({ 'position': 'fixed'});
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
                for (var arr of dbc_arr[0]) {
                    appendarr.push(arr);
                }
            }
            edit_back.push($.extend(true, [], appendarr));
            edit_next.length = 0;
            if (edit_back.length > back_max) {
                edit_back.shift();
            }
        }
        drag_back.length = 0;
        if (flag_smart) {
            $('body').css({ 'position': 'absolute'});
        }
        flag_scr = true;
    }

    function sn_fun() {
        if (flag_sn) {
            sn_btn.textContent = 'Space Numberを無効にする';
            for (var i = 1; i <= sn_max; i++) {
                document.getElementById('hex-' + i).src = imgp + 'sys/space' + (i - 1) + '.png';
            }
            var n = 0;
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (n >= sn_max) {
                    break;
                }
                if (i % 2 === 1) {
                    document.getElementById('header-' + i).src = imgp + 'sys/space' + n + '.png';
                    n++;
                }
            }
        } else {
            sn_btn.textContent = 'Space Numberを有効にする';
            for (var i = 1; i <= sn_max; i++) {
                document.getElementById('hex-' + i).src = imgp + 'sys/space.png';
            }
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (n >= sn_max) {
                    break;
                }
                if (i % 2 === 1) {
                    document.getElementById('header-' + i).src = imgp + 'sys/space.png';
                }
            }
        }
        flag_sn = !flag_sn;
    }

    function drawpreview() {
        getuser_select();
        preview.src = imgp + user_select + '.png';
    }

    function edit_f(id) {
        getuser_select();
        img_back.length = 0;
        imgx = id.split(' - ')[0];
        imgy = id.split(' - ')[1];
        var img_corner;
        var draw_num = 1;
        var pen_size;
        if (check_hex === 1) {
            //hex
            pen_size = parseInt(document.getElementById('hex_pen_size_select').value);
        } else {
            //normal
            pen_size = parseInt(document.getElementById('pen_size_select').value);
            img_corner = (pen_size - 1) / 2;
        }
        if (pen_size === 1) {
            imgsrc_judge(imgx + ' - ' + imgy);
            if (judge) {
                img_back.push([id, document.getElementById(id).src, imgp + user_select + '.png']);
                document.getElementById(id).src = imgp + user_select + '.png';
            }
        } else if (check_hex === 0) {
            imgx -= img_corner;
            imgy -= img_corner;
            for (var i = 1; i <= pen_size * pen_size; i++) {
                if ((imgx > 0 && imgy > 0) && (imgx <= line && imgy <= line)) {
                    imgsrc_judge(imgx + ' - ' + imgy);
                    if (judge) {
                        img_back.push([(imgx + ' - ' + imgy), document.getElementById(imgx + ' - ' + imgy).src, imgp + user_select + '.png']);
                        document.getElementById(imgx + ' - ' + imgy).src = imgp + user_select + '.png';
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
            if (id.split(' - ')[1] % 2 !== 0) {
                hex_type = 1;
            } else {
                hex_type = 0;
            }
            imgx = imgx - Math.floor((pen_size - hex_type) / 2);
            imgy = imgy - (pen_size - 1);
            for (var i = 1; i <= allhex_f(pen_size); i++) {
                if ((imgx > 0 && imgy > 0) && (imgx <= line && imgy <= line)) {
                    imgsrc_judge(imgx + ' - ' + imgy);
                    if (judge) {
                        img_back.push([(imgx + ' - ' + imgy), document.getElementById(imgx + ' - ' + imgy).src, imgp + user_select + '.png']);
                        document.getElementById(imgx + ' - ' + imgy).src = imgp + user_select + '.png';
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
                        hexline -= 1;
                        imgx = (parseInt(id.split(' - ')[0]) - xcount) - Math.floor((pen_size - hex_type - xcount) / 2);
                        xcount -= 1;
                    }
                    draw_num = 1;
                    imgy++;
                } else {
                    draw_num++;
                    imgx++;
                }
            }
        }
        var img_back_clone = $.extend(true, [], img_back);
        if (img_back_clone.length !== 0) {
            pass_back = '';
            if (flag_drag) {
                drag_back.push([img_back_clone]);
            } else {
                edit_back.push(img_back_clone);
            }
            edit_next.length = 0;
        }
        if (edit_back.length > back_max) {
            edit_back.shift();
        }
    }
    function imgsrc_judge(id) {
        var getimgs = document.getElementById(id).src;
        getimgs = (getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0]);
        if (getimgs === user_select) {
            judge = false;
            return;
        } else {
            judge = true;
            return;
        }
    }
    function getuser_select() {
        user_select = terrainid.value.split('/')[0];
        var terrarrn = terrainid.value.split('/')[1];
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
    function allhex_f(size_num) {
        var result = 1;
        var n = 6;
        for (var i = 1; i < size_num; i++) {
            result += n;
            n += 6;
        }
        return result;
    }

    function hex_f() {
        if (!flag_select || !flag_syringe) {
            alert('選択を確定してください。');
            return;
        }
        if (flag_hex) {
            hexcfg.textContent = 'マスをsquareにする';
            hex_wid = imgsize / 2;
            check_hex = 1;
            for (var i = 1; i <= line; i++) {
                var hex_img = document.createElement('img');
                hex_img.src = imgp + 'sys/space.png';
                hex_img.alt = 'E.';
                hex_img.width = hex_wid;
                hex_img.height = imgsize;
                hex_img.id = 'hex-' + i;
                if (i % 2 !== 0) {
                    document.getElementById('line-' + i).insertBefore(hex_img, document.getElementById('1 - ' + i));
                } else {
                    document.getElementById('line-' + i).appendChild(hex_img);
                }
            }
            var creimg = document.createElement('img');
            creimg.src = imgp + 'sys/space.png';
            creimg.alt = 'E.';
            creimg.id = 'header-' + line * 2;
            creimg.width = imgsize / 2;
            creimg.height = imgsize;
            document.getElementById('headerdiv').insertBefore(creimg, document.getElementById('header-' + line * 2 - 1));

            document.getElementById('hex-pen-id').className = 'main-pen-class';
            document.getElementById('n-pen-id').className = 'sub-pen-class';
            grid_f();
            grid_f();
        } else {
            hexcfg.textContent = 'マスをhexにする';
            hex_wid = 0;
            check_hex = 0;
            grid_f();
            grid_f();
            for (var i = 1; i <= line; i++) {
                document.getElementById('hex-' + i).outerHTML = '';
            }
            document.getElementById('header-' + line * 2).outerHTML = '';
            document.getElementById('hex-pen-id').className = 'sub-pen-class';
            document.getElementById('n-pen-id').className = 'main-pen-class';
        }
        flag_hex = !flag_hex;
    }

    function grid_f() {
        if (!flag_select || !flag_syringe) {
            alert('選択を確定してください。');
            return;
        }
        if (flag_grid) {
            divcsswid.style.setProperty('--width-pos', imgsize * line + line * 2 + hex_wid + 2 + 'px');
            var map_tile = document.getElementsByName('map-tile');
            for (var temp of map_tile) {
                creategrid(temp, grid_style);
            }
            if (check_hex === 1) {
                for (var i = 1; i <= line; i++) {
                    creategrid(document.getElementById('hex-' + i), grid_style);
                }
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
            if (check_hex === 1) {
                for (var i = 1; i <= line; i++) {
                    document.getElementById('hex-' + i).style.border = 'none';
                }
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
        if (!flag_syringe || !flag_copy || !flag_move) {
            alert('選択を確定してください。');
            return;
        }
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
            if (check_hex === 1) {
                for (var i = 1; i <= line; i++) {
                    creategrid(document.getElementById('hex-' + i), grid_style);
                }
            }
            for (var i = 0; i < document.getElementById('headerdiv').childElementCount; i++) {
                if (i % 2 === 0) {
                    document.getElementById('header-' + i).style.borderRight = grid_style;
                    document.getElementById('header-' + i).style.borderLeft = grid_style;
                }
            }
            select_btn.textContent = '選択を確定';
            clk_mode = 'select';
        } else {
            select_id.push(check_hex);
            imgx = 0;
            imgy = 1;
            if (!flag_grid_back) {
                divcsswid.style.setProperty('--width-pos', imgsize * line + hex_wid + 'px');
                var map_tile = document.getElementsByName('map-tile');
                for (var temp of map_tile) {
                    temp.style.border = 'none';
                }
                if (check_hex === 1) {
                    for (var i = 1; i <= line; i++) {
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
                if (check_hex === 1) {
                    for (var i = 1; i <= line; i++) {
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
            select_btn.textContent = 'マスを選択';
            clk_mode = 'edit'
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
    function syringe_fun() {
        if (!flag_select || !flag_copy || !flag_move) {
            alert('選択を確定してください。');
            return;
        }
        if (flag_syringe) {
            clk_mode = 'syringe';
            syringe_btn.textContent = '取得したい地形を選択or[キャンセル]';
            flag_syringe = false;
        } else {
            syringe_b_def();
        }
    }
    function syringe_get_fun(id) {
        try {
            if (/map-tile/g.test(document.getElementById(id).name)) {
                var getimgs = document.getElementById(id).src;
                getimgs = getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0];
                if ((/@\d+/).test(getimgs)) {
                    valid.value = getimgs.match(/@\d+/g)[0].substr(1);
                }
                getimgs = getimgs.replace(/@\d+/g, '#N#');
                terrainid.value = getimgs + '/' + terrain_data.findIndex(function (element, index, array) { return element.indexOf(getimgs) >= 0; });
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
    function select_copy_fun() {
        if (!flag_select || !flag_syringe || !flag_move) {
            alert('選択を確定してください。');
            return;
        }
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
            if (imgy % 2 === 0 && (imgy + y_diff) % 2 === 1) {
                hexpattern = 1;
            } else if (imgy % 2 === 1 && (imgy + y_diff) % 2 === 0) {
                hexpattern = 2;
            }
            for (var arr of select_id) {
                if (arr === 0 || arr === 1) {
                    break;
                }
                imgx = parseInt(arr.split('/=/')[0].split(' - ')[0]) + x_diff;
                imgy = parseInt(arr.split('/=/')[0].split(' - ')[1]) + y_diff;
                //hex補正
                if (hexpattern === 1 && imgy % 2 === 0) {
                    imgx++;
                } else if (hexpattern === 2 && imgy % 2 === 1) {
                    imgx -= 1;
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
        var img_back_clone = $.extend(true, [], img_back);
        if (img_back_clone.length !== 0) {
            pass_back = '';
            edit_back.push(img_back_clone);
            edit_next.length = 0;
        }
        if (edit_back.length > back_max) {
            edit_back.shift();
        }
    }

    function select_move_fun() {
        if (!flag_select || !flag_syringe || !flag_copy) {
            alert('選択を確定してください。');
            return;
        }
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
    function try_move_fun(id) {
        img_back.length = 0;
        getuser_select();
        for (var arr of select_id) {
            if (arr === 0 || arr === 1) {
                break;
            }
            var imgid = arr.split('/=/')[0];
            var getimgs = arr.split('/=/')[1];
            getimgs = (getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0]);
            if (getimgs !== user_select) {
                img_back.push([imgid, document.getElementById(imgid).src, imgp + user_select + '.png']);
                document.getElementById(imgid).src = imgp + user_select + '.png';
            }
        }
        draw_object_f(id);
        select_move_fun();
    }

    function edit_back_fun() {
        if (edit_back.length === 0) {
            return;
        }
        for (var id_array of edit_back[edit_back.length - 1]) {
            document.getElementById(id_array[0]).src = id_array[1];
        }
        edit_next.push(edit_back[edit_back.length - 1]);
        edit_back.pop();
    }
    function edit_next_fun() {
        if (edit_next.length === 0) {
            return;
        }
        for (var id_array of edit_next[edit_next.length - 1]) {
            document.getElementById(id_array[0]).src = id_array[2];
        }
        edit_back.push(edit_next[edit_next.length - 1]);
        edit_next.pop();
    }

    function save_fun() {
        var save_data = "";
        var password = "";
        var map_tile = document.getElementsByName('map-tile');
        for (var temp of map_tile) {
            var getimgs = temp.src;
            save_data += (getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0] + ',');
        }
        save_data = save_data.split(',');
        save_data.pop();
        var sv_arr = [];
        var i = 0;
        for (var savearr of save_data) {
            sv_arr[i] = terrain_data[0][2];
            for (var imgdaAr of terrain_data) {
                if (savearr.search(/@\d+/) > - 1) {
                    if (savearr.replace(/@\d+/g, '#N#') === imgdaAr[0]) {
                        var imgval = savearr.substr(savearr.search(/@\d+/) + 1, savearr.length - 1);
                        imgval = parseInt(imgval.replace(imgstr, ''));
                        sv_arr[i] = imgdaAr[1 + imgval];
                        break;
                    }
                } else {
                    if (savearr === imgdaAr[0]) {
                        sv_arr[i] = imgdaAr[2]
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
        if (check_hex === 1) {
            password += '<' //hex
        } else {
            password += '>' //normal
        }
        save_area.value = password;
    }

    function load_fun() {
        if (save_area.value.length === 0 || pass_back === save_area.value) {
            return;
        }
        pass_back = save_area.value;
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
            alert('データが破損しています。 Error : データの長さが間違っています。 (' + password.length + ')');
            return;
        }
        password = password.replace(/(.)(?=.)/g, '$1,').split(',');
        if (password[password.length - 1] === '<' && check_hex === 0) {
            flag_hex = true;
            hex_f();
        } else if (password[password.length - 1] === '>' && check_hex === 1) {
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
        imgx = 0;
        imgy = 1;
        img_back.length = 0;
        for (var i = 0; i < line * line; i++) {
            imgx++;
            if (i && i % line === 0) {
                imgy++;
                imgx = 1;
            }
            img_back.push([(imgx + ' - ' + imgy), document.getElementById(imgx + ' - ' + imgy).src, imgp + save_data[i] + '.png']);
            document.getElementById(imgx + ' - ' + imgy).src = imgp + save_data[i] + '.png';
        }
        var img_back_clone = $.extend(true, [], img_back);
        edit_back.push(img_back_clone);
        edit_next.length = 0;
        if (edit_back.length > back_max) {
            edit_back.shift();
        }
    }

    /**
     * クリップボードコピー関数
     * 入力値をクリップボードへコピーする
     * [引数]   textVal: 入力値
     * [返却値] true: 成功　false: 失敗
     */
    function copyTextToClipboard(textVal) {
        var copyFrom = document.createElement('textarea');
        copyFrom.textContent = textVal;

        var bodyElm = document.getElementsByTagName('body')[0];
        bodyElm.appendChild(copyFrom);

        copyFrom.select();
        var retVal = document.execCommand('copy');
        bodyElm.removeChild(copyFrom);
        return retVal;
    }
})();