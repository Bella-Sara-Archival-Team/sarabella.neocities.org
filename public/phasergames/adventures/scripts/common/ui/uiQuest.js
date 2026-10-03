class uiQuestSlot
{
    constructor(phaserScene, questID, questData, adventure, heightOffset, mask) {
        this.phaserScene = phaserScene
        this.questID = questID
        this.questData = questData
        this.adventure = adventure
        this.mask = this.phaserScene.sharedData["quest"].ui.elements.scrollMask
        this.maskRect = this.phaserScene.sharedData["quest"].ui.elements.maskRect
        this.manager = this.phaserScene.sharedData["quest"].ui.manager

        this.startPos = [130, 140 + heightOffset]
        // this.scrollPos = 0
        this.create()
    }

    create() {
        this.titleTxt = this.phaserScene.add.text(this.startPos[0], this.startPos[1], this.adventure.description.text, this.manager.MEDIUM_BOLD_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0)
                        // .setMask(this.mask)
        this.descTxt = this.phaserScene.add.text(this.startPos[0], this.startPos[1] + 20, this.questData.description.text, this.manager.THIN_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0)
                        // .setMask(this.mask)
        this.titleTxt.enableFilters().filters.external.addMask(this.mask);
        this.descTxt.enableFilters().filters.external.addMask(this.mask);
        this.height = this.titleTxt.height + this.descTxt.height + 10

        const buttonRect = new Phaser.Geom.Rectangle(this.startPos[0], this.startPos[1] - 5, 250, this.height)
        this.resetButton(buttonRect)
    }

    scroll(scrollOffset) {
            this.titleTxt.y = this.startPos[1] - scrollOffset
            this.descTxt.y = this.startPos[1] - scrollOffset + 20

            const buttonRect = new Phaser.Geom.Rectangle(this.startPos[0], this.startPos[1] - 5 - scrollOffset, 250, this.height)
            this.resetButton(buttonRect)
    }

    resetButton(buttonRect) {
            if (this.slotBtn) {this.slotBtn.destroy()}
            
            this.slotBtn = this.phaserScene.add.graphics().setInteractive(Phaser.Geom.Rectangle.Intersection(buttonRect, this.maskRect), Phaser.Geom.Rectangle.Contains);
            this.slotBtn.on("pointerdown", () => 
            {
                this.manager.selectCurrentQuestForDetails(this.questID);
            })
    }

    destroy() {
        this.titleTxt.destroy()
        this.descTxt.destroy()
        this.slotBtn.destroy()
    }
}
class uiQuest extends uiManagerBase
{
    QUEST_PANEL_IMG = "quest_bgpanel"
    QUEST_MASK_IMG = "quest_mask_bgpanel"
    QUEST_SCROLL_IMG = "quest_scroll_img"
    SCROLL = "Scroll_Elements";
    SCROLL_MASK_HEIGHT = 260

    THIN_TEXT_BLACK_SETTINGS = 
    {
        font: "12px Arial",
        color: "black",
        wordWrap: { width: 250 }
    }

    BOLD_TEXT_BLACK_SETTINGS = 
    {
        font: "700 16px Arial",
        color: "black",
        wordWrap: { width: 250 }
    }

    MEDIUM_BOLD_TEXT_BLACK_SETTINGS = 
    {
        font: "700 14px Arial",
        color: "black",
        wordWrap: { width: 250 }
    }

    SMALL_BOLD_TEXT_BLACK_SETTINGS = 
    {
        font: "700 14px Arial",
        color: "black",
        wordWrap: { width: 250 }
    }


    constructor(phaserScene)
    {
        super(phaserScene, "quest");

        this.load()
        this.phaserScene.sharedData[this.key].ui.manager = this;
        
        this.shownQuests = {};
    }

    load()
    {
        super.load()
        // Background panel
        this.phaserScene.load.image(this.QUEST_PANEL_IMG, "./assets/extracted/UI/Quest/Journal_Panel.png");
        // Mask image
        this.phaserScene.load.image(this.QUEST_MASK_IMG, "./assets/extracted/UI/Quest/mask.png");
        // Scroll BG
        this.phaserScene.load.image(this.QUEST_SCROLL_IMG, "./assets/extracted/UI/Quest/scrollBG.png");

        // Close btn
        this.phaserScene.load.atlas("closeBtn", `${ROOT_ASSETS_PATH}UI/Common/closeBtn.png`, `${ROOT_ASSETS_PATH}UI/Common/closeBtn.json`);
        this.phaserScene.load.atlas(this.SCROLL, `${ROOT_ASSETS_PATH}UI/Common/scroll.png`, `${ROOT_ASSETS_PATH}UI/Common/scroll.json`);
    }

    create()
    {
        this.phaserScene.sharedData.hud.ui.journalButton.on('pointerup', function (pointer){
            this.phaserScene.sharedData[this.key].ui.manager.show();
            this.phaserScene.sharedData.hud.ui.journalButton.setFrame("up")
        }, this);

        this.phaserScene.sharedData.hud.ui.journalButton.on('pointerdown', function (pointer) {
            this.phaserScene.sharedData.hud.ui.journalButton.setFrame("down")
        }, this);

        this.phaserScene.sharedData.hud.ui.journalButton.on('pointerover', function (pointer) {
            this.phaserScene.sharedData.hud.ui.journalButton.setFrame("over")
        }, this);

        this.phaserScene.sharedData.hud.ui.journalButton.on('pointerout', function (pointer) {
            this.phaserScene.sharedData.hud.ui.journalButton.setFrame("up")
        }, this);
    }

    initialize()
    {
        var panel = this.phaserScene.add.image(35, -20, this.QUEST_PANEL_IMG)
                            .setOrigin(0)
                            .setScrollFactor(0);

        // Right page
        var currentQuestTitle = this.phaserScene.add.text(430, 140, 'Quest Title', this.BOLD_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);

        // TODO: Link to loca
        var lookforTxt = this.phaserScene.add.text(520, 200, this.phaserScene.sharedData.ui.localization.items[0].journalGiver[0].text, this.SMALL_BOLD_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);

        var lookforDescTxt = this.phaserScene.add.text(540, 220, 'Thing to look for', this.THIN_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);

        // TODO: Link to loca
        var locationTxt = this.phaserScene.add.text(520, 250, this.phaserScene.sharedData.ui.localization.items[0].journalLocation[0].text, this.SMALL_BOLD_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);

        var locationDescTxt = this.phaserScene.add.text(540, 270, 'Place to go to', this.THIN_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);
            
        // TODO: Link to loca
        var goalTxt = this.phaserScene.add.text(435, 310, this.phaserScene.sharedData.ui.localization.items[0].journalGoal[0].text, this.SMALL_BOLD_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);

        var goalDescTxt = this.phaserScene.add.text(455, 330, 'Goal to do', this.THIN_TEXT_BLACK_SETTINGS)
                        .setOrigin(0)
                        .setScrollFactor(0);

        var questMask = this.phaserScene.add.image(432, 196, this.QUEST_MASK_IMG)
                            .setOrigin(0)
                            .setScrollFactor(0);
        var questIcon = this.phaserScene.add.image(430, 190, "closeBtn", "up")
                            .setOrigin(0)
                            .setScrollFactor(0);
        questIcon.enableFilters().filters.external.addMask(questMask);

        var closeBtn = this.phaserScene.add.sprite(687, 112, "closeBtn", "up")
                        .setOrigin(0)
                        .setScale(0.8)
                        .setScrollFactor(0)
                        .setInteractive({ useHandCursor: true });

        
        // Left page
        // this.phaserScene.add.graphics().fillStyle(0x000000).fillRect(115, 165, 260, this.SCROLL_MASK_HEIGHT).setAlpha(.5).setScrollFactor(0);
        const scrollMask = this.phaserScene.add.rectangle(115, 165, 280, this.SCROLL_MASK_HEIGHT, 0x000000).setVisible(false)
                        .setScrollFactor(0)
                        .setOrigin(0)
        const maskRect = new Phaser.Geom.Rectangle(115, 165, 280, this.SCROLL_MASK_HEIGHT)

        const scrollBG = this.phaserScene.add.image(383, 165, this.QUEST_SCROLL_IMG)
                            .setOrigin(0)
                            .setScrollFactor(0)
                            .setScale(1, 1.5);
                             //this.phaserScene.add.graphics().fillStyle(0xffffff).fillRect(380, 165, 20, 260).setAlpha(.5).setScrollFactor(0);
        const scrollZone = this.phaserScene.add.zone(380, 165, 20, 260)
                        .setScrollFactor(0)
                        .setOrigin(0)
                        .setInteractive()
        const scrollBar = this.phaserScene.add.sprite(scrollZone.x+4, scrollZone.y-1, this.SCROLL, "scroll")
                        .setScrollFactor(0)
                        .setOrigin(0);
        const scrollUp = this.phaserScene.add.sprite(scrollZone.x, scrollZone.y-21, this.SCROLL, "arrowScroll_1")
                        .setScrollFactor(0)
                        .setOrigin(0);
        const scrollDown = this.phaserScene.add.sprite(scrollZone.x, scrollZone.y + scrollZone.height + 20, this.SCROLL, "arrowScroll_1")
                        .setScrollFactor(0)
                        .setOrigin(1, 0)
                        .setAngle(180);

        this.phaserScene.sharedData[this.key].ui.elements =
        {
            open: false,
            panelImg: panel,
            closeBtn: closeBtn,
            // Right page
            questTitle: currentQuestTitle,
            lookforTxt: lookforTxt,
            lookforDescTxt: lookforDescTxt,
            locationTxt: locationTxt,
            locationDescTxt: locationDescTxt,
            goalTxt: goalTxt,
            goalDescTxt: goalDescTxt,
            questMask: questMask,
            questIcon: questIcon,
            // Left page
            scrollMask: scrollMask,
            maskRect: maskRect,
            scrollBG: scrollBG,
            scrollZone: scrollZone,
            scrollBar: scrollBar,
            scrollUp: scrollUp,
            scrollDown: scrollDown
        }

        super.initialize();
    }

    show()
    {
            let test = super.show()
            if (!test) return

            this.phaserScene.sharedData.hud.ui.manager.hudJournalDown.play();

            this.phaserScene.sharedData[this.key].ui.elements.panelImg.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.closeBtn.setAlpha(1).setFrame("up");

            this.initializeQuestList();
            this.updateScrollBar()

            this.turnOnEvents()
    }

    hide()
    {
        super.hide();

        this.phaserScene.sharedData[this.key].ui.open = false;
        this.phaserScene.sharedData[this.key].ui.elements.panelImg.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.questTitle.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.lookforTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.lookforDescTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.locationTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.goalTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.goalDescTxt.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.questIcon.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.questMask.setAlpha(0);


        this.phaserScene.sharedData[this.key].ui.elements.scrollBar.setAlpha(0);
        this.phaserScene.sharedData[this.key].ui.elements.scrollBG.setAlpha(0)
        this.phaserScene.sharedData[this.key].ui.elements.scrollZone.disableInteractive()
        this.phaserScene.sharedData[this.key].ui.elements.scrollUp.setAlpha(0).disableInteractive();
        this.phaserScene.sharedData[this.key].ui.elements.scrollDown.setAlpha(0).disableInteractive();

        for (let key in this.shownQuests) {
            this.shownQuests[key].destroy();
        }

        this.shownQuests = {};
    }

    initializeQuestList()
    {
        let shownQuestsCount = 0
        this.shownQuests = {};
        let heightOffset = 40;

        for (let i = 0; i < this.phaserScene.sharedData[this.key].logic.activeQuests.length; i++)
        {
            let questID = this.phaserScene.sharedData[this.key].logic.activeQuests[i];
            let questData = this.phaserScene.sharedData[this.key].manager.getQuestPerID(questID);
            let adventure = this.phaserScene.sharedData[this.key].manager.getAdventurePerID(questID);
            // let mask = this.phaserScene.sharedData[this.key].ui.elements.scrollMask

            if (questData.visible !== undefined && questData.visible === "False") continue;

            this.shownQuests[questID] = new uiQuestSlot(this.phaserScene, questID, questData, adventure, heightOffset)
            heightOffset += this.shownQuests[questID].height
            shownQuestsCount++;

            if (shownQuestsCount === 1)
            {
                this.selectCurrentQuestForDetails(questID);
            }
        }
        this.totalLeftPageHeight =  heightOffset
    }
    updateQuestList(scrollOffset = 0) {
        // console.log(scrollOffset)
        for (let [key] of Object.entries(this.shownQuests)) {
            const quest = this.shownQuests[key];
            quest.scroll(scrollOffset)
        }
    }
    updateScrollBar() {
        const UI = this
        const slotsHeight = this.totalLeftPageHeight - 10
        if (slotsHeight > this.SCROLL_MASK_HEIGHT) {
            this.phaserScene.sharedData[this.key].ui.elements.scrollBG.setAlpha(.5)

            const scrollBar = UI.phaserScene.sharedData[this.key].ui.elements.scrollBar
            const topPos = UI.phaserScene.sharedData[this.key].ui.elements.scrollZone.y + (scrollBar.height/2)

            scrollBar.y = topPos - (scrollBar.height/2)
            this.phaserScene.sharedData[this.key].ui.elements.scrollBar.setAlpha(1);
            this.phaserScene.sharedData[this.key].ui.elements.scrollZone.setInteractive({ useHandCursor: true })
            this.phaserScene.sharedData[this.key].ui.elements.scrollUp.setAlpha(1).setInteractive({ useHandCursor: true });
            this.phaserScene.sharedData[this.key].ui.elements.scrollDown.setAlpha(1).setInteractive({ useHandCursor: true });
        } else {
            // hide scrollbar
            this.phaserScene.sharedData[this.key].ui.elements.scrollBG.setAlpha(0)
            this.phaserScene.sharedData[this.key].ui.elements.scrollBar.setAlpha(0);
            this.phaserScene.sharedData[this.key].ui.elements.scrollZone.disableInteractive()
            this.phaserScene.sharedData[this.key].ui.elements.scrollUp.setAlpha(0).disableInteractive()
            this.phaserScene.sharedData[this.key].ui.elements.scrollDown.setAlpha(0).disableInteractive()
        }
    }

    selectCurrentQuestForDetails(questID)
    {
        let adventure = this.phaserScene.sharedData[this.key].manager.getAdventurePerID(questID);
        let quest = this.phaserScene.sharedData[this.key].manager.getQuestPerID(questID);

        this.phaserScene.sharedData[this.key].ui.elements.questTitle.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.lookforTxt.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.lookforDescTxt.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.locationTxt.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.goalTxt.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.goalDescTxt.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.questIcon.setAlpha(1);
        this.phaserScene.sharedData[this.key].ui.elements.questMask.setAlpha(1);

        this.phaserScene.sharedData[this.key].ui.elements.questTitle.setText(adventure.description.text);


        if (quest.line[0].trigger === undefined)
        {
            this.phaserScene.sharedData[this.key].ui.elements.lookforDescTxt.setText("");
            this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setText("");
            this.phaserScene.sharedData[this.key].ui.elements.questIcon.setAlpha(0);
        }
        else
        {
            if (quest.line[0].trigger.object[0].identifier !== undefined)
            {
                let identifier = quest.line[0].trigger.object[0].identifier;
                this.phaserScene.sharedData[this.key].ui.elements.lookforDescTxt.setText(this.phaserScene.sharedData.template.manager.getTemplateValue(`${identifier}Template`, "name"));
                this.phaserScene.sharedData[this.key].ui.elements.questIcon.setAlpha(1);

                let thumbnailFolderName = this.phaserScene.sharedData.template.manager.getTemplateValue(`${identifier}Template`, ["Thumbnail", "fileName", "text"])
                thumbnailFolderName = thumbnailFolderName.split("/")
                thumbnailFolderName = thumbnailFolderName[thumbnailFolderName.length - 1].replace(".swf", "")
                let thumbnail = this.phaserScene.sharedData.template.manager.getTemplateValue(`${identifier}Template`, ["Thumbnail", "className", "text"]);

                this.phaserScene.sharedData[this.key].ui.elements.questIcon.setTexture(thumbnailFolderName);
                this.phaserScene.sharedData[this.key].ui.elements.questIcon.setFrame(thumbnail);
                if (thumbnailFolderName === "specialthumbnail" || thumbnail === "BSA") {
                    this.phaserScene.sharedData[this.key].ui.elements.questIcon.setPosition(430, 185);
                } else {
                    this.phaserScene.sharedData[this.key].ui.elements.questIcon.setPosition(420, 185);
                }
            }
            else
            {
                this.phaserScene.sharedData[this.key].ui.elements.lookforDescTxt.setText("");
                this.phaserScene.sharedData[this.key].ui.elements.questIcon.setAlpha(0);
            }

            if (quest.line[0].trigger.object[0].zone !== undefined)
            {
                this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setText(quest.line[0].trigger.object[0].zone);
            }
            else if (quest.line[0].trigger.object[0].identifier !== undefined)
            {
                let identifier = quest.line[0].trigger.object[0].identifier;
                const locationData = this.phaserScene.sharedData.template.manager.getEntityZones(`${identifier}Template`)
                if (locationData[0]) {
                    this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setText(this.phaserScene.sharedData.zone.manager.getZoneName(locationData[0]));
                }
                else
                {
                    this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setText("");
                }
            }
            else
            {
                this.phaserScene.sharedData[this.key].ui.elements.locationDescTxt.setText("");
            }
        }
        

        this.phaserScene.sharedData[this.key].ui.elements.goalDescTxt.setText(quest.description.text);
    }

    turnOnEvents()
    {
        const scrollZone = this.phaserScene.sharedData[this.key].ui.elements.scrollZone
        const scrollUp = this.phaserScene.sharedData[this.key].ui.elements.scrollUp
        const scrollDown = this.phaserScene.sharedData[this.key].ui.elements.scrollDown
        const arrows = [scrollUp, scrollDown]
        const scrollAmountOnClick = 55
        this.scrollAmount = 0

        const slotsHeight = this.totalLeftPageHeight - 10 // total height the slots take up

        arrows.forEach(arrow => {
            arrow.on('pointerout', (pointer) => { arrow.setFrame("arrowScroll_1") });
            arrow.on('pointerup', (pointer) => { arrow.setFrame("arrowScroll_1") });
            arrow.on('pointerover', (pointer) => { arrow.setFrame("arrowScroll_2") });
        });

        // Scroll button movement
        const scrollBy = function (moveText, context) {
            const scrollBar = context.phaserScene.sharedData[context.key].ui.elements.scrollBar
            const topPos = context.phaserScene.sharedData[context.key].ui.elements.scrollZone.y + (scrollBar.height/2)
            const maskHeight = context.SCROLL_MASK_HEIGHT
            const scrollHeight = context.phaserScene.sharedData[context.key].ui.elements.scrollZone.height - scrollBar.height
            
            if (moveText < 0) {
                moveText = 0
            } else if (moveText > slotsHeight-maskHeight) {
                moveText = slotsHeight-maskHeight
            }

            scrollBar.y = topPos - (scrollBar.height/2) + (moveText * scrollHeight /(slotsHeight-maskHeight))
            context.updateQuestList(moveText)
        }
        scrollUp.on('pointerdown', (pointer) => { scrollBy(- scrollAmountOnClick, this) });
        scrollDown.on('pointerdown', (pointer) => { scrollBy(scrollAmountOnClick, this) });


        // Leaving this off for now since it seems pretty jittery and might not be working right
        // this.phaserScene.input.on( 
        //     "wheel", 
        //     function (pointer, currentlyOver, dx, dy, dz, event) {
        //         console.log(dy)
        //         scrollBy(dy, this)
        //     }, this
        // );
        
        const scrollZoneEvent = function (pointer, context) {
                if (pointer.isDown)
                {
                    const slotNumber = Object.entries(context.shownQuests).length - 1
                    console.log(slotNumber)
                    const scrollBar = context.phaserScene.sharedData[context.key].ui.elements.scrollBar

                    const topPos = scrollZone.y + (scrollBar.height/2)
                    const scrollHeight = scrollZone.height - scrollBar.height
                    const maskHeight = context.SCROLL_MASK_HEIGHT//scrollMask.height

                    scrollBar.y = pointer.y - (scrollBar.height/2)
                    let moveText = (pointer.y - topPos) / scrollHeight * (slotsHeight - maskHeight)

                    let percentage = (pointer.y - topPos) / scrollHeight * 100
                    if (percentage < 7) {
                        moveText = 0
                        scrollBar.y = topPos - (scrollBar.height/2)
                    } else if (percentage > 93) {
                        moveText = slotsHeight - maskHeight
                        scrollBar.y = topPos + scrollHeight - (scrollBar.height/2)
                    }

                    context.updateQuestList(moveText)
                }
            }
        scrollZone.on('pointermove', function (pointer) { scrollZoneEvent(pointer, this) }, this);
        scrollZone.on('pointerdown', function (pointer) { scrollZoneEvent(pointer, this) }, this);

        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.on('pointerup', (pointer) => { this.hide(); });
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.on('pointerdown', (pointer) =>  { this.phaserScene.sharedData[this.key].ui.elements.closeBtn.setFrame("down") });
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.on('pointerover', (pointer) =>  { this.phaserScene.sharedData[this.key].ui.elements.closeBtn.setFrame("over") });
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.on('pointerout', (pointer) =>  { this.phaserScene.sharedData[this.key].ui.elements.closeBtn.setFrame("up") });
    }
    turnOffEvents()
    {
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.off('pointerup');
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.off('pointerdown');
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.off('pointerover');
        this.phaserScene.sharedData[this.key].ui.elements.closeBtn.off('pointerout');
    }
}