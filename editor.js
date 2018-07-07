(function () {
    'use strict';
    const mapdiv = document.getElementById('map-area-id');
    const gridcfg = document.getElementById('grid-id');
    const hexcfg = document.getElementById('hex-id');
    const terrainid = document.getElementById('terrain_select');
    const valid = document.getElementById('terrain_val_select');
    const save_area = document.getElementById('save-area-id');
    const preview = document.getElementById('preview-id');

    var flag_grid = true;
    var flag_hex = true;
    var flag_drag = false;
    var judge = true;

    var check_hex = 0;
    var hex_wid = 0;

    var imgx;
    var imgy;
    var elm;

    var user_select;
    var img_back = [];
    var drag_back = [];

    var edit_back = [];
    var edit_next = [];
    var pass_back = '';

    var isTouchDevice = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    var eventType = (isTouchDevice) ? 'touchend' : 'click';

    const divcsswid = document.querySelector('body');
    divcsswid.style.setProperty('--width-pos', imgsize * line + 'px');

    mapdiv.style.width = imgsize * line;

    preview.width = imgsize;
    preview.height = imgsize;

    $('#' + gridcfg.id).on(eventType, grid_f);
    $('#' + hexcfg.id).on(eventType, hex_f);
    $('#' + terrainid.id).on(eventType, drawpreview);
    $('#' + valid.id).on(eventType, drawpreview);
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
            window.open('about:blank').document.write('<img src=' + canvas.toDataURL() + '/>');
        });
    });
    $('#del_image-id').on(eventType, () => {
        document.getElementById('maptoimg-result').innerHTML = '';
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
        i += 1;
    }

    for (var i = 1; i <= 99; i++) {
        var creopti = document.createElement('option');
        creopti.value = i;
        creopti.textContent = i;
        valid.appendChild(creopti);
    }

    imgx = 0;
    imgy = 1;
    var child_div = document.createElement('div');
    child_div.id = 'line-' + imgy;
    child_div.className = 'child-div-class';
    mapdiv.appendChild(child_div);
    for (var imgedit = 0; imgedit < line * line; imgedit++) {
        imgx += 1;
        if (imgedit && imgedit % line === 0) {
            imgy += 1;
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
        child_img.title = '( ' + (imgx - 1) + ',' + (imgy - 1) + ' ) ' + img_mess;
        child_img.width = imgsize;
        child_img.height = imgsize;

        child_img.onclick = edit_f;
        child_div.appendChild(child_img);
    }
    if (default_mode[0]) { grid_f(); }
    if (default_mode[1]) { hex_f(); }
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
    document.onmouseup = move_end;
    document.ontouchend = move_end;
    function move_f() {
        if (flag_drag) {
            try {
                if (new RegExp(img_mess, 'g').test(elm.title)) {
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
    }

    function drawpreview() {
        getuser_select();
        preview.src = imgp + user_select + '.png';
    }
    function edit_f() {
        getuser_select();
        img_back.length = 0;
        imgx = this.id.split(' - ')[0];
        imgy = this.id.split(' - ')[1];
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
                img_back.push([this.id, document.getElementById(this.id).src, imgp + user_select + '.png']);
                document.getElementById(this.id).src = imgp + user_select + '.png';
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
                    imgy += 1;
                } else {
                    draw_num += 1;
                    imgx += 1;
                }
            }
        } else {
            var hexline = pen_size;
            var xcount = 1;
            var flag_down = 0;
            var hex_type;
            if (this.id.split(' - ')[1] % 2 !== 0) {
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
                    if (hexline < pen_size * 2 - 1 && flag_down === 0) {
                        hexline += 1;
                        imgx = (parseInt(this.id.split(' - ')[0]) - xcount) - Math.floor((pen_size - hex_type - xcount) / 2);
                        xcount += 1;
                        if (xcount === pen_size) {
                            xcount = pen_size - 2;
                        }
                    } else {
                        flag_down = 1;
                        hexline -= 1;
                        imgx = (parseInt(this.id.split(' - ')[0]) - xcount) - Math.floor((pen_size - hex_type - xcount) / 2);
                        xcount -= 1;
                    }
                    draw_num = 1;
                    imgy += 1;
                } else {
                    draw_num += 1;
                    imgx += 1
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
        var n = 6
        for (var i = 1; i < size_num; i++) {
            result += n;
            n += 6
        }
        return result;
    }

    function hex_f() {
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
            document.getElementById('hex-pen-id').className = 'sub-pen-class';
            document.getElementById('n-pen-id').className = 'main-pen-class';
        }
        flag_hex = !flag_hex;
    }

    function grid_f() {
        imgx = 0;
        imgy = 1;
        for (var imgedit = 0; imgedit < line * line; imgedit++) {
            imgx += 1;
            if (imgedit && imgedit % line === 0) {
                imgy += 1;
                imgx = 1;
            }
            var imgid = document.getElementById(imgx + ' - ' + imgy);
            if (flag_grid) {
                divcsswid.style.setProperty('--width-pos', imgsize * line + line * 2 + hex_wid + 2 + 'px');
                imgid.style.border = grid_style;
                gridcfg.textContent = 'グリッドをoffにする';
                if (check_hex == 1) {
                    document.getElementById('hex-' + imgy).style.border = grid_style;
                }
            } else {
                divcsswid.style.setProperty('--width-pos', imgsize * line + hex_wid + 'px');
                imgid.style.border = 'none';
                gridcfg.textContent = 'グリッドをonにする';
                if (check_hex == 1) {
                    document.getElementById('hex-' + imgy).style.border = 'none';
                }
            }
        }
        flag_grid = !flag_grid;
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
        imgx = 0;
        imgy = 1;
        var save_data = "";
        var password = "";
        for (var imgedit = 0; imgedit < line * line; imgedit++) {
            imgx += 1;
            if (imgedit && imgedit % line === 0) {
                imgy += 1;
                imgx = 1;
            }
            var getimgs = document.getElementById(imgx + ' - ' + imgy).src;
            save_data += (getimgs.substr(getimgs.search(imgp) + imgp.length).split('.')[0] + ',');
        }
        save_data = save_data.split(',');
        save_data.pop();
        var sv_arr = [];
        var i = 0;
        for (var savearr of save_data) {
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
            i += 1;
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
        if (password.length !== line * line + 1) {
            alert("データが破損しています。。。 : " + password.length);
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
            i += 1;
        }
        imgx = 0;
        imgy = 1;
        img_back.length = 0;
        for (var i = 0; i < line * line; i++) {
            imgx += 1;
            if (i && i % line === 0) {
                imgy += 1;
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