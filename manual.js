(function () {
    'use strict';
    for (let Arr of terrain_data) {
        let creli = document.createElement('li');
        creli.innerHTML ='<img src=' + imgp + Arr[0].replace('#N#', '@1') +'.png' + ' alt=E. width=' + imgsize + 'height=' + imgsize + '>' + Arr[1];
        document.getElementById('terrain-list-id').appendChild(creli);
    }
})();