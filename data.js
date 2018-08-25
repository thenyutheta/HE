//public
var terrain_data;
var pattern_press;
(function () {
    'use strict';
    //[画像名,地形名,省略文字 {#N# => ,省略文字,省略文字,... ],
    //~ベ + <>
    terrain_data = [
        ["=0=", "空白", "/"],
        ["=sea=", "海", "0"],
        ["=shoal=", "浅瀬", "1"],
        ["=glacier=", "氷河", "X"],
        ["=rotsea#N#=", "腐海（1 ~ 2）", "の", "は"],
        ["=flat=", "平地", "2"],
        ["=plans=", "予定地", "れ"],
        ["=beach=", "砂浜", "3"],
        ["=wasteland#N#=", "荒地(1 ~ 2)", "4", "5"],
        ["=mountain=", "山", "6"],
        ["=forest=", "森", "7"],
        ["=village=", "村", "8"],
        ["=town#N#=", "町 (1 ~ 2)", "9", "a",],
        ["=newtown#N#=", "ニュータウン（1 ~ 2）", "b", "c"],
        ["=porttown=", "港町", "d"],
        ["=city#N#=", "都市（1 ~ 2）", "e", "f"],
        ["=DPcity=", "防災都市", "g"],
        ["=megacity=", "大都市", "h"],
        ["=cityex=", "現代都市", "i"],
        ["=goldcity#N#=", "輝ける都市（1 ~ 2）", "j", "k"],
        ["=megafloat#N#=", "海上都市メガフロート（1 ~ 3）", "x", "y", "z"],
        ["=capitalcity=", "首都", "l"],
        ["=oilcity=", "油田都市", "と"],
        ["=marinecity=", "海上都市", "な"],
        ["=seacity=", "海底都市", "に"],
        ["=seanewcity=", "海底新都市", "ぬ"],
        ["=seacapitalcity=", "海底首都", "ね"],
        ["=chocolate=", "チョコレー都市", "デ"],
        ["=home#N#=", "自宅 (1 ~ 9)", "A", "B", "C", "D", "E", "F", "G", "H", "I"],
        ["=islandgove=", "島役所", "?"],
        ["=embassy=", "大使館", "ェ"],
        ["=university#N#=", "大学（1 ~ 7）", "え", "お", "か", "き", "く", "け", "こ"],
        ["=checkingS=", "関所", "!"],
        ["=fires=", "消防署", "サ"],
        ["=resort#N#=", "リゾート地（1 ~ 2）", "n", "Z"],
        ["=stadium#N#=", "スタジアム（1 ~ 2）", "さ", "し"],
        ["=hotspring=", "温泉街", "ほ"],
        ["=oil#N#=", "油田（1 ~ 2）", "ひ", "ふ"],
        ["=zoo=", "動物園", "へ"],
        ["=station=", "駅", "シ"],
        ["=rail#N#=", "線路（1 ~ 13）", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ"],
        ["=train#N#=", "電車（1 ~ 13）", "ハ", "ヒ", "フ", "ヘ", "ホ", "レ", "ロ", "ワ", "ヰ", "ヱ", "ヲ", "ン", "ァ"],
        ["=amusementpark=", "遊園地", "m"],
        ["=skate=", "天然スケート場", "Y"],
        ["=inoraland=", "いのらランド", "ジ"],
        ["=factory=", "工場", "o"],
        ["=mine#N#=", "採掘場 (1 ~ 4)", "p", "q", "r", "s"],
        ["=farm#N#=", "農場 (1 ~ 3)", "t", "u", "v"],
        ["=foodlab#N#=", "食物研究所（1 ~ 2）", "ろ", "わ"],
        ["=aquaculture=", "養殖場", "w"],
        ["=ranch#N#=", "牧場（1 ~ 3）", "あ", "い", "う"],
        ["=seaamusement=", "海あみゅ", "J"],
        ["=hightech#N#=", "ハイテク企業(1 ~ 2)", "K", "L"],
        ["=boat_l#N#=", "船（左）(1 ~ 12)", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "ヂ"],
        ["=boat#N#=", "船（右）(1 ~ 12)", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "ヅ"],
        ["=rocket=", "ロケット基地", "コ"],
        ["=missile=", "ミサイル基地", "M"],
        ["=seamissile#N#=", "海底ミサイル基地(1 ~ 3)", "N", "O", "P"],
        ["=defense#N#=", "防衛施設(1 ~ 2)", "Q", "R"],
        ["=monster#N#=", "怪獣（左）（1 ~ 25）", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゕ", "ゖ", "っ", "ゃ", "ゅ", "ょ", "ゎ", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ズ", "ゼ"],
        ["=monster_r#N#=", "怪獣（右）（1 ~ 25）", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", "ー", "～", "！", "？", "ア", "イ", "ウ", "エ", "オ", "ゾ", "ダ"],
        ["=figure#N#=", "怪獣の置物（1 ~ 7）", "カ", "キ", "ク", "ケ", "ド", "バ", "ビ"],
        ["=snowman#N#=", "雪だるま/雪ウサギ", "ォ", "ゴ"],
        ["=christmas=", "クリスマスツリー", "ィ"],
        ["=remains=", "古代遺跡", "ヵ"],
        ["=templeoftime=", "時の神殿", "ゥ"],
        ["=shrine#N#=", "神殿/神社（1 ~ 2）", "ッ", "ャ"],
        ["=pyramid=", "ピラミッド", "べ"],
        ["=monument=", "記念碑", "ヶ"],
        ["=magicpic=", "魔法陣", "ザ"],
        ["=sacred=", "聖樹", "ュ"],
        ["=moai=", "モアイ", "ョ"],
        ["=bag=", "バッグ", "ブ"],
        ["=piggybank=", "豚の貯金箱", "グ"],
        ["=dustbox=", "ゴミ箱", "ゲ"],
        ["=doll#N#=", "熊の人形（1 ~ 3）", "ヮ", "ガ", "ギ"],
        ["=estone#N#=", "地石、闇石(1 ~ 12)", "S", "T", "U", "V", "W", "す", "せ", "そ", "た", "ち", "つ", "て"],
        ["=megg#N#=", "モンスターの卵（1 ~ 4）", "ゐ", "ゑ", "を", "ん"]
    ];

    //[省略文字パターン,圧縮文字]
    //~λ
    pattern_press = [
        ["013", "η"],
        ["310", "θ"],

        //海*20,10,5,3
        ["00000000000000000000", "α"],
        ["0000000000", "β"],
        ["00000", "γ"],
        ["000", "ι"],
        //浅瀬*5
        ["11111", "δ"],
        //平地*5
        ["22222", "ε"],
        //砂浜*5
        ["33333", "ζ"],
        //空白*20
        ["////////////////////", "κ"],
        //森*3
        ["777", "λ"]
    ];
})();