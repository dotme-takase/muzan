var GameMain = arc.Class.create(arc.Game, {
  //Gameパラメーターをセットする処理等の初期化処理
  initialize:function(params){
    console.log(params.hp);
  },
  //ランループから毎フレーム実行される
  update:function(){

  }
});

window.addEventListener('DOMContentLoaded', function(e){
  //ゲームのサイズとcanvasのidを渡す
  var system = new arc.System(320, 416, 'canvas');

  //第二引数で渡したオブジェクトがゲームクラスのinitializeの引数として渡される
  system.setGameClass(GameMain, {hp:100, mp:100});

  //画像が読み込まれる度に実行される。イベントオブジェクトのtotalプロパティに読み込む画像数、loadedプロパティに読み込みが終了した画像数が格納されている。
  system.addEventListener(arc.Event.PROGRESS, function(e){
      console.log(e.loaded + ", " + e.total);
  });

  //画像が読み込み終わったら実行され、ゲームクラスが自動的にインスタンス化され、ゲームが開始される
  system.addEventListener(arc.Event.COMPLETE, function(){
      console.log('loaded');
  });

  //画像パスを配列で指定して読み込み開始
  system.load(['img/gear.png', 'img/person.png']);
}, false);