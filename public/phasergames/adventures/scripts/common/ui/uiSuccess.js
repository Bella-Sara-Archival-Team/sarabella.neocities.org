class uiSuccess extends uiManagerBase
{
    SUCCESS_PANEL_IMG = "Success_Panel";
    SUCCESS_CONTINUE_BTN = "Dialogue_Continue_Btn";
    OPEN_SOUND = "success_open"

    SUCCESS_TITLE_PURPLE_SETTINGS = 
    {
        font: "bold 14px Arial",
        color: "#792AA8",
    }

    SUCCESS_GREAT_JOB_PURPLE_SETTINGS = 
    {
        font: "26px Arial",
        color: "#792AA8",
    }

    SUCCESS_TEXT_PURPLE_SETTINGS = 
    {
        font: "14px Arial",
        color: "#792AA8",
        wordWrap: { width: 310 }
    }

    SUCCESS_REWARD_PURPLE_SETTINGS = 
    {
        font: "bold 18px Arial",
        color: "#792AA8",
    }

    SUCCESS_CONTINUE_PURPLE_SETTINGS = 
    {
        font: "18px Arial",
        color: "#792AA8",
    }

    constructor(phaserScene)
    {
        super(phaserScene, "success");

        this.rewards = {}
        this.load()
    }

    load()
    {
        super.load()
        // Background panel
        this.phaserScene.load.image(this.SUCCESS_PANEL_IMG, `${ROOT_ASSETS_PATH}UI/Success/Panel.png`);

        // Continue button
        this.phaserScene.load.image(this.SUCCESS_CONTINUE_BTN, `${ROOT_ASSETS_PATH}UI/Dialogue/DialogueBtn.png`);

        this.phaserScene.load.audio(this.OPEN_SOUND, `${ROOT_ASSETS_PATH}Audio/46.mp3`);

        // TODO : get the sparkles
    }

    initialize()
    {
        this.openSound = this.phaserScene.sound.add(this.OPEN_SOUND, {volume: VOLUME});

        var panel = this.phaserScene.add.image(405, 265, this.SUCCESS_PANEL_IMG)
                        .setScrollFactor(0);

        // Title text
        var titleText = this.phaserScene.add.text(230, 130, this.phaserScene.sharedData.ui.localization.items[0].adventureCompleteHeader[0].text, this.SUCCESS_TITLE_PURPLE_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Great Job text
        var greatJobText = this.phaserScene.add.text(215, 180, this.phaserScene.sharedData.ui.localization.items[0].adventureCompleteTitle[0].text, this.SUCCESS_GREAT_JOB_PURPLE_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Normal text
        var normalText = this.phaserScene.add.text(235, 220, this.phaserScene.sharedData.ui.localization.items[0].adventureCompleteBody[0].text, this.SUCCESS_TEXT_PURPLE_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Reward text
        var rewardText = this.phaserScene.add.text(215, 315, this.phaserScene.sharedData.ui.localization.items[0].adventureCompleteReward[0].text, this.SUCCESS_REWARD_PURPLE_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Continue button
        var continueBtn = this.phaserScene.add.image(255, 400, this.SUCCESS_CONTINUE_BTN)
                            .setOrigin(0)
                            .setScrollFactor(0)
                            .setInteractive({ useHandCursor: true })
                            .setScale(.75);

        var continueTxt = this.phaserScene.add.text(continueBtn.x+35, continueBtn.y, this.phaserScene.sharedData.ui.localization.items[0].dialogueContinue[0].text, this.SUCCESS_CONTINUE_PURPLE_SETTINGS)
                            .setOrigin(0)
                            .setScrollFactor(0)
                            .setInteractive({ useHandCursor: true })

        
        this.phaserScene.sharedData[this.key].ui.sparkle = this.phaserScene.add.spine(165, 128, `sparkle-json`, `sparkle-atlas`)
                    .setAlpha(0)
                    .setScrollFactor(0);


        this.phaserScene.sharedData[this.key].ui.elements = 
        {
            panelImg: panel,
            titleText: titleText,
            greatJobText: greatJobText,
            normalText : normalText,
            rewardText : rewardText,
            continueBtn : continueBtn,
            continueTxt : continueTxt,
        };

        super.initialize();
    }

    // TODO: Handle if dialogue has no character to display
    show(questID)
    {
            if (debug.skipDialogue) {
                this.#debugContinue(questID)
            }

            let test = super.show()
            if (!test) return

            this.turnOnEvents(questID)


            let questData = this.phaserScene.sharedData.quest.manager.getQuestPerID(questID);
            
            this.rewards = []
            for (let index = 0; index < questData.line[questData.currentLine].actions.object.length; index++) {
                const action = questData.line[questData.currentLine].actions.object[index];
                if (action.type === "AddMultipleInventoryAction") {
                    this.rewards.push(new InventorySlot(this.phaserScene, action.itemId[0], parseInt(action.count[0]), index, "success"))

                } else if (action.type === "AddHorseshoesAction") {
                    this.rewards.push(new InventorySlot(this.phaserScene, "horseshoe", parseInt(action.count[0]), index, "success"))
                }
            }
            for (let index = 0; index < this.rewards.length; index++) {
                this.rewards[index].resetSlot(0, index, this.rewards.length/2)
                
            }

            this.phaserScene.sharedData[this.key].ui.elements.normalText.setText(
                this.phaserScene.sharedData.ui.localization.items[0].adventureCompleteBody[0].text
                    .replace("%adventureName%", `"${questData.description.text}"`)
                );

            // Play sound
            this.openSound.play()


            this.phaserScene.sharedData[this.key].ui.sparkle.animationState.setAnimation(0, `animation`, false)
            this.phaserScene.sharedData[this.key].ui.sparkle.setAlpha(1)

            let UI = this
            this.phaserScene.sharedData[this.key].ui.sparkle.animationState.addListener({
                    complete: function endAnimation(entry) { 
                        UI.phaserScene.sharedData[UI.key].ui.sparkle.setAlpha(0)
                    }       
                })

            // Set UI items visible
            this.phaserScene.sharedData[this.key].ui.elements.panelImg.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.titleText.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.greatJobText.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.normalText.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.rewardText.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.continueBtn.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setAlpha(1);
    }

    hide()
    {
        super.hide();


        for (let [key, value] of Object.entries(this.rewards)) {
            this.rewards[key].destroy()
        }

        this.phaserScene.sharedData[this.key].ui.elements.panelImg.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.titleText.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.greatJobText.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.normalText.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.rewardText.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.sparkle.setAlpha(0)
    }


    // ------- UI EVENTS -------
    turnOnEvents(questID)
    {
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.on('pointerover', function (pointer) {this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#2a63a8ff") }, this);
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.on('pointerout', function (pointer) {this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#792AA8") }, this);
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.on('pointerup', this.#continueOption, {questID: questID, UI: this});
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.on('pointerover', function (pointer) {this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#2a63a8ff") }, this);
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.on('pointerout', function (pointer) {this.phaserScene.sharedData[this.key].ui.elements.continueTxt.setColor("#792AA8") }, this);
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.on('pointerup', this.#continueOption, {questID: questID, UI: this});
        this.phaserScene.sharedData.keyboard.space.on("up", this.#continueOption, {questID: questID, UI: this});
        this.phaserScene.sharedData.keyboard.enter.on("up", this.#continueOption, {questID: questID, UI: this});
    }

    turnOffEvents()
    {
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.off('pointerover');
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.off('pointerout');
        this.phaserScene.sharedData[this.key].ui.elements.continueBtn.off("pointerup", this.#continueOption)
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.off('pointerover');
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.off('pointerout');
        this.phaserScene.sharedData[this.key].ui.elements.continueTxt.off("pointerup", this.#continueOption)
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
    #debugContinue(questID) {
        this.phaserScene.sharedData[this.key].lastChoice = "continue"
        let questData = this.phaserScene.sharedData.quest.manager.getQuestPerID(questID);
        this.phaserScene.sharedData.quest.manager.doQuestAction(questID, questData.currentLine, questData.currentAction)
    }
    // ------- END UI EVENTS -------
}