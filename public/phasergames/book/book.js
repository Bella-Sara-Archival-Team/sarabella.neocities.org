class Book extends Phaser.Scene 
{
    TEXT_BLACK_TITLE_SETTINGS = 
    {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#000000",
        wordWrap: {
            width: 350
        },
        align: "center"
    }
    TEXT_BLACK_SUBTITLE_SETTINGS = 
    {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#000000",
    }

    TEXT_BLACK_SETTINGS = 
    {
        fontFamily: "Arial",
        fontSize: "12.5px",
        color: "#000000",
        wordWrap: {
            width: 350
        },
        lineSpacing: 1.5
    }

    constructor ()
    {
        super({ key: 'Book' });
    }

    preload ()
    {
        // this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
        this.langData = this.cache.json.get('langData');
        
        this.load.atlas('arrow', `./images/${this.langData.arrow}.png`, `./images/${this.langData.arrow}.json`);
        this.load.image('pageSelectBG', `./images/${this.langData.bg}.jpg`);
        
        this.load.image('pageRef', './images/ref3.jpg');
        
    }

    create (data)
    {
        const game = this
        this.currentPage = 0
        data.pageData = this.langData.pages
        data.pages = Math.ceil((this.langData.pages.length - 2) / 2) // number of pairs of pages, indexed from zero
        this.pageSelectBG = this.add.image(444, 234, 'pageSelectBG')
        const UI = {
            "left": {},
            "right": {}
        }

        // this.pageRef = this.add.image(444, 234, 'pageRef').setAlpha(.5)

        /**
        //  * Loads or turns the page
        //  * @param {*} page The page to open to
        //  */
        function loadPage(page = 0) {
            // Arrows
            if (page > 0) {
                UI.left.arrow.setVisible(true)
            } else  {
                UI.left.arrow.setVisible(false)
            }
            if (page < data.pages) {
                UI.right.arrow.setVisible(true)
            } else  {
                UI.right.arrow.setVisible(false)
            }
            
            // Left Page - Title
            if (data.pageData[2*page].title) {
                UI.left.title.text = data.pageData[2*page].title
                UI.left.title.setVisible(true)
            }
            else {
                UI.left.title.setVisible(false)
            }
            // Left Page - Subtitle
            if (data.pageData[2*page].subtitle) {
                UI.left.subtitle.text = data.pageData[2*page].subtitle
                UI.left.subtitle.setPosition(UI.left.title.x, UI.left.title.y+UI.left.title.height+35).setVisible(true)
            }
            else {
                UI.left.subtitle.setVisible(false)
            }
            // Left Page - Text
            if (data.pageData[2*page].text) {
                UI.left.text.text = data.pageData[2*page].text
                UI.left.text.setVisible(true)
            }
            else {
                UI.left.text.setVisible(false)
            }

            // Right Page - Text
            if (data.pageData[2*page+1] && data.pageData[2*page+1].text) {
                UI.right.text.text = data.pageData[2*page+1].text
                UI.right.text.setVisible(true)
            }
            else {
                UI.right.text.setVisible(false)
            }

            // END
            if (data.pageData[2*page].end || data.pageData[2*page+1].end) {
                UI.end.text = data.pageData[2*page].end ? data.pageData[2*page].end : data.pageData[2*page+1].end
                UI.end.setVisible(true)
                UI.end.setPosition(data.pageData[2*page].end ? 270 : 630, 211)
            }
            else {
                UI.end.setVisible(false)
            }
        }
        
        // // ---------- Book Open, Entry Select Page ---------- //
        UI.right.arrow = this.add.sprite(613, 398, 'arrow', 'idle').setInteractive({ pixelPerfect: false, useHandCursor: true })//.setVisible(false)
            UI.right.arrow.on('pointerover', function (pointer) { UI.right.arrow.setFrame('hover') });
            UI.right.arrow.on('pointerout', function (pointer) { UI.right.arrow.setFrame('idle') });
            UI.right.arrow.on('pointerdown', function (pointer) { 
                game.currentPage += 1
                loadPage(game.currentPage)
            });
        UI.left.arrow = this.add.sprite(265, 398, 'arrow', 'idle').setInteractive({ pixelPerfect: false, useHandCursor: true }).setScale(-1, 1).setVisible(false)
            UI.left.arrow.on('pointerover', function (pointer) { UI.left.arrow.setFrame('hover') });
            UI.left.arrow.on('pointerout', function (pointer) { UI.left.arrow.setFrame('idle') });
            UI.left.arrow.on('pointerdown', function (pointer) { 
                game.currentPage -= 1
                loadPage(game.currentPage)
            });
        UI.left.text = this.add.text(95, 115, 'Text goes here...', this.TEXT_BLACK_SETTINGS)//.setOrigin(0)
        UI.left.title = this.add.text(270, 105, 'Text goes here...', this.TEXT_BLACK_TITLE_SETTINGS).setOrigin(0.5,0)
        UI.left.subtitle = this.add.text(270, 115, 'Text goes here...', this.TEXT_BLACK_SUBTITLE_SETTINGS).setOrigin(0.5,0)
        UI.right.text = this.add.text(465, 115, 'Text goes here...', this.TEXT_BLACK_SETTINGS)//.setOrigin(0)

        UI.end = this.add.text(270, 105, 'Text goes here...', this.TEXT_BLACK_TITLE_SETTINGS).setOrigin(0.5,0)
        

        // // ---------- Show Opened Book ---------- //
        loadPage(0)
    }
}