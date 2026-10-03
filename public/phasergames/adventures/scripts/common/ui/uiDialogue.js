class uiDialogue extends uiManagerBase
{
    DIALOGUE_PANEL_IMG = "Dialogue_Panel";
    DIALOGUE_AVATAR_MASK = "Dialogue_Avatar_Mask";
    DIALOGUE_CONTINUE_BTN = "Dialogue_Continue_Btn";
    DIALOGUE_HUMANS_THUMBNAILS = "humansthumbnail";
    DIALOGUE_HORSES_THUMBNAILS = "horsesthumbnail";
    DIALOGUE_MAGICFRIENDS_THUMBNAILS = "magicalfriendsthumbnail";
    DIALOGUE_SPECIAL_THUMBNAILS = "specialthumbnail";
    CHOICE_HEIGHT = 50

    CHARA_NAME_TEXT_SETTINGS = 
    {
        font: "bold 25px Arial",
        color: "white",
        stroke: "#D1A844",
        strokeThickness: 5
    }

    DIALOGUE_TEXT_BLACK_SETTINGS = 
    {
        font: "18px Arial",
        color: "#792AA8",
        wordWrap: { width: 650 }
    }

    DIALOGUE_TEXT_BLACK_SETTINGS_BBCODE = 
    {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#792AA8",
        wrap: {
            mode: 'word',
            width: 600
        }
    }

    DIALOGUE_TEXT_PURPLE_SETTINGS = 
    {
        font: "18px Arial",
        color: "black",
        wordWrap: { width: 650 }
    }

    constructor(phaserScene)
    {
        super(phaserScene, "dialogue");

        this.phaserScene.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);

        this.load()
        this.phaserScene.sharedData[this.key].ui.manager = this;
    }

    load()
    {
        super.load()
        // Background panel
        this.phaserScene.load.image(this.DIALOGUE_PANEL_IMG, `${ROOT_ASSETS_PATH}UI/Dialogue/Panel.png`);

        // Avatar mask
        this.phaserScene.load.image(this.DIALOGUE_AVATAR_MASK, `${ROOT_ASSETS_PATH}UI/Dialogue/PortraitMask.png`);

        // Avatars
        this.phaserScene.load.atlas(this.DIALOGUE_HUMANS_THUMBNAILS, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_HUMANS_THUMBNAILS}.png`, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_HUMANS_THUMBNAILS}.json`);
        this.phaserScene.load.atlas(this.DIALOGUE_HORSES_THUMBNAILS, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_HORSES_THUMBNAILS}.png`, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_HORSES_THUMBNAILS}.json`);
        this.phaserScene.load.atlas(this.DIALOGUE_MAGICFRIENDS_THUMBNAILS, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_MAGICFRIENDS_THUMBNAILS}.png`, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_MAGICFRIENDS_THUMBNAILS}.json`);
        this.phaserScene.load.atlas(this.DIALOGUE_SPECIAL_THUMBNAILS, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_SPECIAL_THUMBNAILS}.png`, `${ROOT_ASSETS_PATH}Characters/${this.DIALOGUE_SPECIAL_THUMBNAILS}.json`);

        // Continue button
        this.phaserScene.load.image(this.DIALOGUE_CONTINUE_BTN, `${ROOT_ASSETS_PATH}UI/Dialogue/DialogueBtn.png`);

        // TODO : get the scroll bar
    }

    initialize()
    {
        var panel = this.phaserScene.add.image(10, 270, this.DIALOGUE_PANEL_IMG)
                        .setOrigin(0)
                        .setScrollFactor(0);
     
        // Character name
        var charaName = this.phaserScene.add.text(83, 281, 'Character Name', this.CHARA_NAME_TEXT_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Character avatar mask
        const x = 10
        const y = 270
        var charaPortraitMask = this.phaserScene.add.image(x, y, this.DIALOGUE_AVATAR_MASK)
                                .setOrigin(0)
                                .setScrollFactor(0);

        // Character Avatar
        var charaPortrait = this.phaserScene.add.image(x-2, y, this.DIALOGUE_HUMANS_THUMBNAILS, "C001")
                                .setOrigin(0)
                                .setScrollFactor(0)
                                .enableFilters();
        charaPortrait.enableFilters().filters.external.addMask(charaPortraitMask);

        // Normal text
        var normalText = this.phaserScene.add.rexBBCodeText(105, 325, 'Dialogue Text goes here...', this.DIALOGUE_TEXT_BLACK_SETTINGS_BBCODE)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Normal images text
        var normalImgText = this.phaserScene.add.rexBBCodeText(155, 325, 'Dialogue Text goes here...', this.DIALOGUE_TEXT_BLACK_SETTINGS_BBCODE)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Side Image
        var sideImg = this.phaserScene.add.image(105, 330, "dialogue_sideimgtxt")
                            .setOrigin(0)
                            .setScrollFactor(0)
                            .setInteractive();

        // Continue button
        var continueBtn = this.phaserScene.add.image(105, 480, this.DIALOGUE_CONTINUE_BTN)
                            .setOrigin(0)
                            .setScrollFactor(0)
                            .setInteractive({ useHandCursor: true })
                            .setScale(.75);

        var continueTxt = this.phaserScene.add.text(continueBtn.x+35, continueBtn.y, this.phaserScene.sharedData.ui.localization.items[0].dialogueContinue[0].text, this.DIALOGUE_TEXT_BLACK_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0)
                            .setInteractive({ useHandCursor: true })
                            .setDepth(100);

        // Choice text
        // TODO

        // Image icons

        this.phaserScene.sharedData[this.key].ui.elements = 
        {
            panelImg: panel,
            charaName: charaName,
            charaPortraitMask: charaPortraitMask,
            charaPortrait: charaPortrait,
            normalText : normalText,
            continueBtn : continueBtn,
            continueTxt : continueTxt,
            normalImgText : normalImgText,
            sideImg : sideImg
        };

        super.initialize();
    }

    // TODO: Handle if dialogue has no character to display
    show(questID, characterid, text, choices, image)
    {
            if (debug.skipDialogue) {
                this.#debugContinue(questID)
            }

            let test = super.show()
            if (!test) return

            if (Array.isArray(text) && text.length === 1) {
                text = text[0]
            } else if (Array.isArray(text)) {
                let rand = randomIntFromInterval(0, text.length - 1)
                text = text[rand]
            }

            // Character portrait
            if (characterid === undefined) { 
                characterid = "Player"; 
            }

            let thumbnailFolderName = this.phaserScene.sharedData.template.manager.getTemplateValue(`${characterid}Template`, ["Thumbnail", "fileName", "text"])
            thumbnailFolderName = thumbnailFolderName.split("/")
            thumbnailFolderName = thumbnailFolderName[thumbnailFolderName.length - 1].replace(".swf", "")

            const character = {
                name: this.phaserScene.sharedData.template.manager.getTemplateValue(`${characterid}Template`, "name"), 
                id: characterid,
                thumbnail: this.phaserScene.sharedData.template.manager.getTemplateValue(`${characterid}Template`, ["Thumbnail", "className", "text"]),
                thumbnailFolderName: thumbnailFolderName
            }

            this.phaserScene.sharedData[this.key].ui.elements.charaName.text = character.name;
            this.phaserScene.sharedData[this.key].ui.elements.charaPortrait.setTexture(character.thumbnailFolderName);
            this.phaserScene.sharedData[this.key].ui.elements.charaPortrait.setFrame(character.thumbnail);

            let textElement = this.phaserScene.sharedData[this.key].ui.elements.normalText
            if (image !== undefined)
            {
                textElement = this.phaserScene.sharedData[this.key].ui.elements.normalImgText
                
                this.lastImage = image
                this.phaserScene.load.once('complete', () => {
                        this.phaserScene.sharedData[this.key].ui.elements.sideImg.setTexture(`Dialogue${this.lastImage}`);
                        this.phaserScene.sharedData[this.key].ui.elements.sideImg.setAlpha(this.phaserScene.sharedData[this.key].ui.elements.charaPortrait.alpha);
                    }, this);
                this.phaserScene.load.image(`Dialogue${image}`, `${ROOT_ASSETS_PATH}UI/Dialogue/Images/${image}.png`);
                this.phaserScene.load.start();
            }
            textElement.setText(this.formatQuestText(text));

            let choiceHeight = 0
            if (choices) {
                choiceHeight = (Object.entries(choices).length-1) * this.CHOICE_HEIGHT
            }
            // Set UI item position
            textElement.setY(this.phaserScene.sharedData[this.key].ui.elements.continueBtn.y - choiceHeight - textElement.height - 20)
            this.phaserScene.sharedData[this.key].ui.elements.sideImg.setY(textElement.y+5) // +5
            this.phaserScene.sharedData[this.key].ui.elements.charaName.setY(textElement.y-44)
            this.phaserScene.sharedData[this.key].ui.elements.charaPortrait.setPosition(7, textElement.y-47)
            this.phaserScene.sharedData[this.key].ui.elements.charaPortraitMask.setY(textElement.y-55)
            this.phaserScene.sharedData[this.key].ui.elements.panelImg.setY(textElement.y-55)

            this.turnOnEvents(questID, choices)

            // Set UI items visible
            this.phaserScene.sharedData[this.key].ui.elements.panelImg.setAlpha(1);
            textElement.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.charaName.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.charaPortrait.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.charaPortraitMask.setAlpha(1);
            if (!choices) {
                this.phaserScene.sharedData[this.key].ui.elements.continueBtn.setAlpha(1);
                this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setAlpha(1);
            }
    }

    hide()
    {
        super.hide();

        this.phaserScene.sharedData[this.key].ui.elements.panelImg.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.charaName.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.charaPortrait.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.charaPortraitMask.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.normalText.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.normalImgText.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.sideImg.setAlpha(0);
        if (this.phaserScene.sharedData[this.key].ui.elements.choiceElements) {
            for (let index = 0; index < this.phaserScene.sharedData[this.key].ui.elements.choiceElements.length; index++) {
                const element = this.phaserScene.sharedData[this.key].ui.elements.choiceElements[index];
                element.destroy()
            }
        }
    }


    // ------- UI EVENTS -------
    turnOnEvents(questID, choices)
    {
        if (choices) {
            this.phaserScene.sharedData[this.key].ui.elements.choiceElements = []
            const choiceHeight = (Object.entries(choices).length-1) * this.CHOICE_HEIGHT
            const buttonRef = this.phaserScene.sharedData[this.key].ui.elements.continueBtn
            const buttonTextRef = this.phaserScene.sharedData[this.key].ui.elements.continueTxt
            let index = 0
            for (let [key] of Object.entries(choices)) {
                // Continue button
                var choiceBtn = this.phaserScene.add.image(buttonRef.x, buttonRef.y - choiceHeight + (index*this.CHOICE_HEIGHT), this.DIALOGUE_CONTINUE_BTN)
                                    .setOrigin(0)
                                    .setScrollFactor(0)
                                    .setInteractive({ useHandCursor: true })
                                    .setScale(.75);

                var choiceTxt = this.phaserScene.add.text(choiceBtn.x+(buttonTextRef.x - buttonRef.x), choiceBtn.y+(buttonTextRef.y - buttonRef.y), choices[key].text, this.DIALOGUE_TEXT_BLACK_SETTINGS)
                                    .setOrigin(0)
                                    .setScrollFactor(0)
                                    .setInteractive({ useHandCursor: true })
                                    .setDepth(100);

                this.phaserScene.sharedData[this.key].ui.elements.choiceElements.push(choiceBtn)
                this.phaserScene.sharedData[this.key].ui.elements.choiceElements.push(choiceTxt)

                choiceBtn.on('pointerover', function (pointer) { this.phaserScene.sharedData[this.key].ui.elements.choiceElements[txtIndex].setColor("#2a63a8ff") }, this);
                choiceBtn.on('pointerout', function (pointer) {this.phaserScene.sharedData[this.key].ui.elements.choiceElements[txtIndex].setColor("#792AA8") }, this);
                choiceBtn.on('pointerup', this.#choiceOption, {questID: questID, UI: this, key: key, entityID: choices[key].entityID});
                choiceTxt.on('pointerup', this.#choiceOption, {questID: questID, UI: this, key: key, entityID: choices[key].entityID});
                let txtIndex = (index * 2) + 1;
                choiceTxt.on('pointerover', function (pointer) { this.phaserScene.sharedData[this.key].ui.elements.choiceElements[txtIndex].setColor("#2a63a8ff") }, this);
                choiceTxt.on('pointerout', function (pointer) {this.phaserScene.sharedData[this.key].ui.elements.choiceElements[txtIndex].setColor("#792AA8") }, this);
                index++
            }

        } else {
            this.phaserScene.sharedData[this.key].ui.elements.continueTxt.on('pointerover', function (pointer) { this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#2a63a8ff")}, this)
            this.phaserScene.sharedData[this.key].ui.elements.continueTxt.on('pointerout', function (pointer) { this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#792AA8")}, this)
            this.phaserScene.sharedData[this.key].ui.elements.continueTxt.on('pointerup', this.#continueOption, {questID: questID, UI: this});
            this.phaserScene.sharedData[this.key].ui.elements.continueBtn.on('pointerover', function (pointer) { this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#2a63a8ff")}, this);
            this.phaserScene.sharedData[this.key].ui.elements.continueBtn.on('pointerout', function (pointer) { this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#792AA8")}, this);
            this.phaserScene.sharedData[this.key].ui.elements.continueBtn.on('pointerup', this.#continueOption, {questID: questID, UI: this});
            this.phaserScene.sharedData.keyboard.space.on("up", this.#continueOption, {questID: questID, UI: this});
            this.phaserScene.sharedData.keyboard.enter.on("up", this.#continueOption, {questID: questID, UI: this});
        }
    }

    turnOffEvents()
    {
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.off('pointerover');
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.off('pointerout');
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.off("pointerup", this.#continueOption)
        this.phaserScene.sharedData.keyboard.space.off("up", this.#continueOption);
        this.phaserScene.sharedData.keyboard.enter.off("up", this.#continueOption);
    }
    
    #continueOption() { 
        this.UI.hide();
        this.UI.phaserScene.sharedData[this.UI.key].lastChoice = "continue"

        if (this.questID) {
            let questData = this.UI.phaserScene.sharedData.quest.manager.getQuestPerID(this.questID);
            this.UI.phaserScene.sharedData.quest.manager.doQuestAction(this.questID, questData.currentLine, questData.currentAction)
        }
    }
    
    #choiceOption() { 
        this.UI.hide();
        this.UI.phaserScene.sharedData[this.UI.key].lastChoice = this.key

        if (this.entityID) {
            const triggerData = {
                type: "TalkQuestTrigger",
                entityID: this.entityID,
                questID: this.key
            }
            this.UI.phaserScene.sharedData.quest.manager.tryTriggerQuest(this.UI.phaserScene, triggerData)
        } else {
            let questData = this.UI.phaserScene.sharedData.quest.manager.getQuestPerID(this.questID);
            this.UI.phaserScene.sharedData.quest.manager.tryTriggerQuest(this.UI.phaserScene, {type: "DialogueChoiceTrigger", line: this.key})
        }

    }
    #debugContinue(questID) {
        this.phaserScene.sharedData[this.key].lastChoice = "continue"
        let questData = this.phaserScene.sharedData.quest.manager.getQuestPerID(questID);
        this.phaserScene.sharedData.quest.manager.doQuestAction(questID, questData.currentLine, questData.currentAction)
    }
    // ------- END UI EVENTS -------

    formatQuestText(text)
    {
        if (text.indexOf("<br/>") > 0) text = text.replaceAll("<br/>", "");
        if (text.indexOf("<b>") > 0) text = text.replaceAll("<b>", "[b]");
        if (text.indexOf("</b>") > 0) text = text.replaceAll("</b>", "[/b]");
        if (text.indexOf("<i>") > 0) text = text.replaceAll("<i>", "[i]");
        if (text.indexOf("</i>") > 0) text = text.replaceAll("</i>", "[/i]");

        // TODO: make more general, this is for testing
        if (text.indexOf("<font size='12' color='grey'>") > 0) text = text.replaceAll("<font size='12' color='grey'>", "[size=12][color=grey]");
        if (text.indexOf("</font>") > 0) text = text.replaceAll("</font>", "[/color][/size]");

        return text;
    }
}