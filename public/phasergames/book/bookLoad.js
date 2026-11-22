class BookLoad extends Phaser.Scene 
{
    constructor ()
    {
        super({ key: 'BookLoad' });
    }

    init () {
    }

    preload ()
    {
        this.load.json('langData', `./lang/${book}/${lang}.json`);
        this.load.image('startBG', './images/pages.jpg');
        
    }

    create ()
    {
        this.add.image(444, 234, 'startBG')
        this.scene.start("Book");
    }
}